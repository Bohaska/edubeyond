import { v } from "convex/values";
import { internalQuery, mutation, query, internalMutation } from "./_generated/server";
import { getCurrentUser } from "./users";

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
