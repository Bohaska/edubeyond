"use node";
import { ConvexError, v } from "convex/values";
import { api, internal } from "./_generated/api";
import { Doc, Id } from "./_generated/dataModel";
import {
  action,
  internalAction,
  internalMutation,
  internalQuery,
  mutation,
  query,
} from "./_generated/server";
import { GoogleGenerativeAI, SchemaType } from "@google/generative-ai";
import { getCurrentUser } from "./users";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

export const getConversations = query({
    args: {},
    handler: async (ctx) => {
        const user = await getCurrentUser(ctx);
        if (!user) {
            return [];
        }
        return await ctx.db
            .query("conversations")
            .withIndex("by_user", (q) => q.eq("userId", user._id))
            .collect();
    },
});

export const getMessages = query({
    args: { conversationId: v.id("conversations") },
    handler: async (ctx, args) => {
        const user = await getCurrentUser(ctx);
        if (!user) return [];

        const messages = await ctx.db
            .query("messages")
            .withIndex("by_conversation", (q) => q.eq("conversationId", args.conversationId))
            .collect();

        return messages.map(msg => ({
            ...msg,
            isViewer: msg.role === "user"
        }));
    },
});

export const getMessagesInternal = internalQuery({
    args: { conversationId: v.id("conversations") },
    handler: async (ctx, args) => {
        return await ctx.db
            .query("messages")
            .withIndex("by_conversation", (q) => q.eq("conversationId", args.conversationId))
            .collect();
    },
});

export const createConversation = mutation({
    args: {
        title: v.string(),
    },
    handler: async (ctx, args) => {
        const user = await getCurrentUser(ctx);
        if (!user) {
            throw new Error("User not authenticated");
        }
        return await ctx.db.insert("conversations", {
            userId: user._id,
            title: args.title,
        });
    },
});

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

        await ctx.runMutation(internal.tutor.addMessage, {
            conversationId,
            userId: user._id,
            role: "user",
            text: message,
        });

        const model = genAI.getGenerativeModel({
            model: "gemini-2.5-flash",
            tools: [{ functionDeclarations: [searchResourcesTool] }],
        });

        const messages = await ctx.runQuery(internal.tutor.getMessagesInternal, {
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

                await ctx.runMutation(internal.tutor.addMessage, {
                    conversationId,
                    userId: user._id,
                    role: "model",
                    text: responseWithTool.text(),
                });
            }
        } else {
            await ctx.runMutation(internal.tutor.addMessage, {
                conversationId,
                userId: user._id,
                role: "model",
                text: response.text(),
            });
        }
    },
});

export const appendBotMessageChunk = internalMutation({
    args: {
        messageId: v.id("messages"),
        text: v.string(),
    },
    handler: async (ctx, args) => {
        const message = await ctx.db.get(args.messageId);
        if (!message) {
            throw new Error("Message not found");
        }
        await ctx.db.patch(args.messageId, { text: message.text + args.text });
    },
});

export const addMessage = internalMutation({
    args: {
        conversationId: v.id("conversations"),
        userId: v.id("users"),
        role: v.union(v.literal("user"), v.literal("model"), v.literal("function")),
        text: v.optional(v.string()),
        functionCall: v.optional(v.object({
            name: v.string(),
            args: v.string(),
        })),
        functionResponse: v.optional(v.object({
            name: v.string(),
            response: v.string(),
        })),
    },
    handler: async (ctx, args) => {
        return await ctx.db.insert("messages", {
            conversationId: args.conversationId,
            userId: args.userId,
            role: args.role,
            text: args.text,
            functionCall: args.functionCall,
            functionResponse: args.functionResponse,
        });
    },
});

export const createConversationInternal = internalMutation({
    args: {
        title: v.string(),
        userId: v.id("users"),
    },
    handler: async (ctx, args) => {
        return await ctx.db.insert("conversations", {
            userId: args.userId,
            title: args.title,
        });
    },
});

const searchResourcesTool = {
    name: 'search_resources',
    description: 'Search for relevant AP Physics C resources including videos, simulations, guidesheets, and links.',
    parameters: {
        type: SchemaType.OBJECT,
        properties: {
            query: {
                type: SchemaType.STRING,
                description: 'Search query for finding resources (e.g., "capacitors", "kinematics", "electric field")',
            } as any,
            resourceType: {
                type: SchemaType.STRING,
                description: 'Optional: Filter by resource type',
            } as any,
        },
        required: ['query'],
    },
} as any;