"use node";
import { ConvexError, v } from "convex/values";
import { api, internal } from "./_generated/api";
import { action } from "./_generated/server";
import { GoogleGenAI } from "@google/genai";
import { Doc } from "./_generated/dataModel";

const genAI = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY! });

export const sendMessage = action({
  args: {
    conversationId: v.id("conversations"),
    message: v.string(),
  },
  handler: async (ctx, args) => {
    const { conversationId, message } = args;
    const user = await ctx.runQuery(api.users.currentUser);

    if (!user) {
      throw new ConvexError("User not authenticated");
    }

    await ctx.runMutation(internal.tutorStore.addMessage, {
      conversationId,
      userId: user._id,
      role: "user",
      text: message,
    });

    const modelMessageId = await ctx.runMutation(
      internal.tutorStore.addMessage,
      {
        conversationId,
        userId: user._id,
        role: "model",
        text: "",
      },
    );

    const messages = await ctx.runQuery(
      internal.tutorStore.getMessagesInternal,
      {
        conversationId,
      },
    );

    const conversationHistory = messages
      .slice(0, -1)
      .map((msg: any) =>
        `${msg.role === "model" ? "Assistant" : "User"}: ${msg.text || ""}`,
      )
      .join("\n");

    const fullPrompt = `You are an AP Physics C tutor. Help students understand concepts and solve problems. At the end of every response, suggest relevant resources (like videos, simulations, or articles) that can help the student better understand the topic. You can search for these resources by mentioning "SEARCH_RESOURCES:" followed by the query and optionally the resource type (video, simulation, guidesheet, link).

Previous conversation:
${conversationHistory}

Current question: ${message}

Please provide a helpful response, and remember to suggest resources at the end.`;

    try {
      const stream = await genAI.models.generateContentStream({
        model: "gemini-2.5-flash",
        contents: [{ role: "user", parts: [{ text: fullPrompt }] }],
      });

      const searches: { query: string; type?: string }[] = [];
      const searchRegex = /SEARCH_RESOURCES:\s*([^,\n]+)(?:,\s*([^\n]+))?/g;

      for await (const chunk of stream) {
        const chunkText = chunk.text;
        if (!chunkText) continue;

        const matches = chunkText.matchAll(searchRegex);
        for (const match of matches) {
          const query = match[1].trim();
          const resourceType = match[2]?.trim();
          searches.push({ query, type: resourceType });
        }
        const modifiedChunkText = chunkText.replace(searchRegex, "");

        if (modifiedChunkText) {
          await ctx.runMutation(internal.tutorStore.appendMessageChunk, {
            messageId: modelMessageId,
            chunk: modifiedChunkText,
          });
        }
      }

      if (searches.length > 0) {
        const searchPromises = searches.map((s) =>
          ctx.runQuery(api.resources.searchResources, {
            query: s.query,
            type: s.type as any,
          }),
        );

        const searchResults = (await Promise.all(searchPromises)).flat();

        if (searchResults.length > 0) {
          let resourcesMarkdown = "\n\n**Here are some resources to help:**\n";
          const uniqueResults = Array.from(
            new Map(searchResults.map((item) => [item._id, item])).values(),
          );

          uniqueResults.forEach((resource: Doc<"resources">) => {
            if (resource.url) {
              resourcesMarkdown += `* [${resource.name}](${resource.url})\n`;
            }
          });

          if (uniqueResults.length > 0) {
            await ctx.runMutation(internal.tutorStore.appendMessageChunk, {
              messageId: modelMessageId,
              chunk: resourcesMarkdown,
            });
          }
        }
      }
    } catch (error) {
      console.error("Error in tutor response:", error);
      await ctx.runMutation(internal.tutorStore.appendMessageChunk, {
        messageId: modelMessageId,
        chunk:
          "I apologize, but I'm having trouble processing your request right now. Please try again.",
      });
    }
  },
});