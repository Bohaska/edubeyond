"use a node";
import { v } from "convex/values";
import { action, internalMutation, internalQuery, mutation, query } from "./_generated/server";
import { GoogleGenerativeAI, HarmCategory, HarmBlockThreshold } from "@google/generative-ai";
import { api, internal } from "./_generated/api";
import { getCurrentUser } from "./users";
import { Id } from "./_generated/dataModel";

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
    args: {
        conversationId: v.id("conversations"),
    },
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
        message: v.string(),
        conversationId: v.optional(v.id("conversations")),
    },
    handler: async (ctx, args): Promise<Id<"conversations">> => {
        const user = await ctx.runQuery(api.users.currentUser);
        if (!user) {
            throw new Error("User not authenticated");
        }

        let conversationId = args.conversationId;
        if (!conversationId) {
            conversationId = await ctx.runMutation(internal.tutor.createConversationInternal, {
                title: args.message.substring(0, 50),
                userId: user._id,
            });
        }

        await ctx.runMutation(internal.tutor.addMessage, {
            conversationId: conversationId!,
            userId: user._id,
            text: args.message,
            isViewer: true,
        });

        const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });
        const chat = model.startChat({
            history: [],
            generationConfig: {
                maxOutputTokens: 2000,
            },
        });

        const result = await chat.sendMessage(args.message);
        const response = await result.response;
        const text = response.text();

        await ctx.runMutation(internal.tutor.addMessage, {
            conversationId,
            userId: user._id,
            text,
            isViewer: false,
        });

        return conversationId;
    },
});

export const addMessage = internalMutation({
    args: {
        conversationId: v.id("conversations"),
        userId: v.id("users"),
        text: v.string(),
        isViewer: v.boolean(),
    },
    handler: async (ctx, args) => {
        await ctx.db.insert("messages", {
            conversationId: args.conversationId,
            userId: args.userId,
            text: args.text,
            isViewer: args.isViewer,
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