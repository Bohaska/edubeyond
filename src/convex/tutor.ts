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
        conversationId: v.id("conversations"),
    },
    handler: async (ctx, args) => {
        const user = await ctx.runQuery(api.users.currentUser);
        if (!user) {
            throw new Error("User not authenticated");
        }

        await ctx.runMutation(internal.tutor.addMessage, {
            conversationId: args.conversationId,
            userId: user._id,
            text: args.message,
            isViewer: true,
        });

        const botMessageId = await ctx.runMutation(internal.tutor.addMessage, {
            conversationId: args.conversationId,
            userId: user._id,
            text: "",
            isViewer: false,
        });

        const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });
        const chat = model.startChat({
            history: [
                {
                    role: "user",
                    parts: [{
                        text: `You are an expert AI tutor for AP Physics C, specializing in both Mechanics and Electricity & Magnetism. Your goal is to help high school students master the challenging concepts of AP Physics C.

**Your Tutoring Style:**
- **Socratic Method:** Instead of giving direct answers, guide students to the solution by asking probing questions. Help them break down complex problems into smaller, manageable steps.
- **Conceptual Clarity:** Emphasize a deep understanding of fundamental principles over rote memorization of formulas.
- **Problem-Solving Focus:** When a student presents a problem, walk them through the setup, identifying knowns and unknowns, choosing the right equations, and executing the solution.
- **Encouraging & Patient:** Maintain a positive and supportive tone. If a student is wrong, gently correct them and explain the underlying concept.
- **Use LaTeX:** For all mathematical equations, variables, and expressions, use LaTeX to ensure they are rendered correctly. For example, use \`$F = ma$\` for Force equals mass times acceleration.`
                    }]
                },
                {
                    role: "model",
                    parts: [{ text: "Understood. I am ready to begin tutoring." }]
                }
            ],
            generationConfig: {
                maxOutputTokens: 2000,
            },
        });

        const stream = await chat.sendMessageStream(args.message);

        for await (const chunk of stream.stream) {
            const chunkText = chunk.text();
            if (chunkText) {
                await ctx.runMutation(internal.tutor.appendBotMessageChunk, {
                    messageId: botMessageId,
                    text: chunkText,
                });
            }
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
        text: v.string(),
        isViewer: v.boolean(),
    },
    handler: async (ctx, args) => {
        return await ctx.db.insert("messages", {
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