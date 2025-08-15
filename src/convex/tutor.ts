"use node";
import { ConvexError, v } from "convex/values";
import { api, internal } from "./_generated/api";
import { action } from "./_generated/server";
import { GoogleGenAI, Type } from "@google/genai";
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

    // Add the user's message to the conversation
    await ctx.runMutation(internal.tutorStore.addMessage, {
      conversationId,
      userId: user._id,
      role: "user",
      text: message,
    });

    // Fetch all messages to check if it's the first one and to build history
    const messages = await ctx.runQuery(
      internal.tutorStore.getMessagesInternal,
      {
        conversationId,
      },
    );

    // If this is the first message, update the conversation title
    if (messages.length === 1 && messages[0].role === "user") {
      await ctx.runMutation(internal.tutorStore.updateConversationTitle, {
        conversationId,
        title: message.substring(0, 100),
      });
    }

    const conversationHistory = messages
      .slice(0, -1)
      .map((msg: any) =>
        `${msg.role === "model" ? "Assistant" : "User"}: ${msg.text || ""}`,
      )
      .join("\n");

    // Step 1: First, shorter LLM call to identify search queries using JSON mode
    const searchQueryPrompt = `A student asked the following question about AP Physics C: "${message}".
Based on their question and the conversation history, generate up to 3 relevant search queries to find helpful online resources. You can suggest resource types like "video", "article", or "simulation".`;

    let searches: { query: string; type?: string }[] = [];
    try {
      const searchGenResult = await genAI.models.generateContent({
        model: "gemini-2.5-flash",
        contents: [{ role: "user", parts: [{ text: searchQueryPrompt }] }],
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              searches: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    query: {
                      type: Type.STRING,
                      description: "The search query.",
                    },
                    type: {
                      type: Type.STRING,
                      description:
                        "Optional: 'video', 'article', or 'simulation'.",
                    },
                  },
                  required: ["query"],
                },
              },
            },
          },
        },
      });

      const searchGenText = searchGenResult.text;
      if (searchGenText) {
        const parsedResponse = JSON.parse(searchGenText);
        if (parsedResponse.searches && Array.isArray(parsedResponse.searches)) {
          searches = parsedResponse.searches;
        }
      }
    } catch (e) {
      console.error(
        "Error generating or parsing search queries with JSON mode:",
        e,
      );
      // We can continue without search results if this fails
    }

    // Step 2: Search for resources
    let resourcesContext = "";
    if (searches.length > 0) {
      const searchPromises = searches.map((s) =>
        ctx.runQuery(api.resources.searchResources, {
          query: s.query,
          type: s.type as any,
        }),
      );

      const searchResults = (await Promise.all(searchPromises)).flat();

      if (searchResults.length > 0) {
        const uniqueResults = Array.from(
          new Map(searchResults.map((item) => [item._id, item])).values(),
        );

        resourcesContext =
          "Here are some relevant resources you can suggest to the student if they are appropriate. When you mention them, provide a markdown link to the URL:\n" +
          uniqueResults
            .map(
              (r) =>
                `* Name: ${r.name}, URL: ${r.url}, Topic: ${r.topic}`,
            )
            .join("\n");
      }
    }

    // Step 3: Generate the final, streamed response with resource context
    const modelMessageId = await ctx.runMutation(
      internal.tutorStore.addMessage,
      {
        conversationId,
        userId: user._id,
        role: "model",
        text: "",
      },
    );

    const fullPrompt = `You are an AP Physics C tutor. Help students understand concepts and solve problems.
${resourcesContext}

Previous conversation:
${conversationHistory}

Current question: ${message}

Please provide a helpful and detailed response. If you use any of the resources provided above, seamlessly integrate them into your explanation as markdown links. For example: 'You can visualize this using the [Resource Name](resource_url) simulation.'`;

    try {
      const stream = await genAI.models.generateContentStream({
        model: "gemini-2.5-flash",
        contents: [{ role: "user", parts: [{ text: fullPrompt }] }],
      });

      for await (const chunk of stream) {
        const chunkText = chunk.text;
        if (chunkText) {
          await ctx.runMutation(internal.tutorStore.appendMessageChunk, {
            messageId: modelMessageId,
            chunk: chunkText,
          });
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