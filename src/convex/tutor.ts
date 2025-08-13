"use node";
import { ConvexError, v } from "convex/values";
import { api, internal } from "./_generated/api";
import {
  action,
} from "./_generated/server";
import { GoogleGenAI } from "@google/genai";

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

        const messages = await ctx.runQuery(internal.tutorStore.getMessagesInternal, {
            conversationId,
        });

        // Build conversation history
        const conversationHistory = messages.slice(0, -1).map((msg: any) => 
            `${msg.role === "model" ? "Assistant" : "User"}: ${msg.text || ""}`
        ).join("\n");

        const fullPrompt = `You are an AP Physics C tutor. Help students understand concepts and solve problems. At the end of every response, suggest relevant resources (like videos, simulations, or articles) that can help the student better understand the topic. You can search for these resources by mentioning "SEARCH_RESOURCES:" followed by the query and optionally the resource type (video, simulation, guidesheet, link).

Previous conversation:
${conversationHistory}

Current question: ${message}

Please provide a helpful response, and remember to suggest resources at the end.`;

        try {
            const result = await genAI.models.generateContent({
                model: "gemini-1.5-flash",
                contents: fullPrompt,
            });

            let responseText = result.text || "";

            // Check if the response contains a search request
            const searchMatch = responseText.match(/SEARCH_RESOURCES:\s*([^,\n]+)(?:,\s*([^\n]+))?/);
            if (searchMatch) {
                const query = searchMatch[1].trim();
                const resourceType = searchMatch[2]?.trim() as "link" | "category" | "guidesheet" | "video" | "simulation" | undefined;
                
                const searchResults = await ctx.runQuery(api.resources.searchResources, {
                    query,
                    type: resourceType,
                });

                // Generate a follow-up response with the search results
                const followUpPrompt = `Based on the search results for "${query}", provide a helpful response to the student. Here are the resources found:

${JSON.stringify(searchResults, null, 2)}

Original question: ${message}

Provide a response that incorporates these resources, and remember to suggest other relevant resources at the end.`;

                const followUpResult = await genAI.models.generateContent({
                    model: "gemini-1.5-flash",
                    contents: followUpPrompt,
                });

                responseText = followUpResult.text || responseText;
            }

            await ctx.runMutation(internal.tutorStore.addMessage, {
                conversationId,
                userId: user._id,
                role: "model",
                text: responseText,
            });
        } catch (error) {
            console.error("Error in tutor response:", error);
            await ctx.runMutation(internal.tutorStore.addMessage, {
                conversationId,
                userId: user._id,
                role: "model",
                text: "I apologize, but I'm having trouble processing your request right now. Please try again.",
            });
        }
    },
});