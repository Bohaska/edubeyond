import { internalMutation, mutation, query } from "./_generated/server";
import { v } from "convex/values";

export const saveQuestion = mutation({
  args: {
    topic: v.string(),
    questionType: v.string(),
    difficulty: v.string(),
    questionText: v.string(),
    explanation: v.string(),
    choices: v.optional(v.array(v.string())),
    correctChoice: v.optional(v.string()),
    diagram: v.optional(v.string()),
    createdBy: v.id("users"),
  },
  handler: async (ctx, args) => {
    const questionId = await ctx.db.insert("questions", args);
    return questionId;
  },
});

export const updateDiagram = internalMutation({
  args: {
    questionId: v.id("questions"),
    diagram: v.string(),
  },
  handler: async (ctx, { questionId, diagram }) => {
    await ctx.db.patch(questionId, { diagram });
  },
});

export const deleteDiagram = mutation({
  args: {
    questionId: v.id("questions"),
  },
  handler: async (ctx, { questionId }) => {
    await ctx.db.patch(questionId, { diagram: undefined });
  },
});

export const getUserQuestions = query({
  args: { userId: v.id("users") },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("questions")
      .withIndex("by_user", (q) => q.eq("createdBy", args.userId))
      .order("desc")
      .collect();
  },
});

export const getQuestionsByTopic = query({
  args: { topic: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("questions")
      .withIndex("by_topic", (q) => q.eq("topic", args.topic))
      .order("desc")
      .collect();
  },
});

export const getById = query({
  args: { id: v.id("questions") },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.id);
  },
});