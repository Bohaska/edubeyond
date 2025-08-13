"use node";
import { ConvexError, v } from "convex/values";
import { api, internal } from "./_generated/api";
import {
  action,
} from "./_generated/server";
import { GoogleGenerativeAI, SchemaType } from "@google/genai";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

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

        const model = genAI.getGenerativeModel({
            model: "gemini-2.5-flash",
            tools: [{ functionDeclarations: [searchResourcesTool] }],
        });

        const messages = await ctx.runQuery(internal.tutorStore.getMessagesInternal, {
            conversationId,
        });

        const chat = model.startChat({
            history: messages.slice(0, -1).map((msg: any) => ({
                role: msg.role === "model" ? "model" : "user",
                parts: [{ text: msg.text || "" }],
            })),
        });

        const result = await chat.sendMessage(message);
        const response = result.response;

        const functionCalls = response.functionCalls();

        if (functionCalls && functionCalls.length > 0) {
            const call = functionCalls[0];
            if (call.name === "search_resources") {
                const args = call.args as any;
                const { query, resourceType } = args || {};
                const searchResults = await ctx.runQuery(api.resources.searchResources, {
                    query: query as string,
                    type: resourceType as "link" | "category" | "guidesheet" | "video" | "simulation" | undefined,
                });

                const toolResponse = {
                    functionResponse: {
                        name: "search_resources",
                        response: {
                            name: "search_resources",
                            content: JSON.stringify(searchResults),
                        },
                    },
                };

                const resultWithTool = await chat.sendMessage(
                    JSON.stringify(toolResponse)
                );
                const responseWithTool = resultWithTool.response;

                await ctx.runMutation(internal.tutorStore.addMessage, {
                    conversationId,
                    userId: user._id,
                    role: "model",
                    text: responseWithTool.text(),
                });
            }
        } else {
            await ctx.runMutation(internal.tutorStore.addMessage, {
                conversationId,
                userId: user._id,
                role: "model",
                text: response.text(),
            });
        }
    },
});

const searchResourcesTool = {
    name: 'search_resources',
    description: 'Search for relevant AP Physics C resources including videos, simulations, guidesheets, and links.',
    parameters: {
        type: Type.OBJECT,
        properties: {
            query: {
                type: Type.STRING,
                description: 'Search query for finding resources (e.g., "capacitors", "kinematics", "electric field")',
            } as any,
            resourceType: {
                type: Type.STRING,
                description: 'Optional: Filter by resource type',
            } as any,
        },
        required: ['query'],
    },
} as any;