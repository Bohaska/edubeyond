import { v } from "convex/values";
import { query, mutation, action } from "./_generated/server";
import { getCurrentUser } from "./users";

export const getById = query({
  args: { id: v.id("questions") },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.id);
  },
});

export const getUserQuestions = query({
  args: {},
  handler: async (ctx) => {
    const user = await getCurrentUser(ctx);
    if (!user) {
      return [];
    }
    return await ctx.db
      .query("questions")
      .withIndex("by_user", (q) => q.eq("createdBy", user._id))
      .collect();
  },
});

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
  },
  handler: async (ctx, args) => {
    const user = await getCurrentUser(ctx);
    if (!user) {
      throw new Error("User must be authenticated");
    }
    
    return await ctx.db.insert("questions", {
      ...args,
      createdBy: user._id,
    });
  },
});

export const generateQuestion = action({
  args: {
    topic: v.string(),
    questionType: v.string(),
    difficulty: v.string(),
  },
  handler: async (ctx, args) => {
    // Placeholder for AI question generation
    // This would integrate with an AI service like OpenAI
    const mockQuestion = {
      topic: args.topic,
      questionType: args.questionType,
      difficulty: args.difficulty,
      questionText: `Sample ${args.questionType} question about ${args.topic} at ${args.difficulty} difficulty level.`,
      explanation: "This is a sample explanation for the generated question.",
      choices: args.questionType === "MCQ" ? ["Option A", "Option B", "Option C", "Option D"] : undefined,
      correctChoice: args.questionType === "MCQ" ? "Option A" : undefined,
    };
    
    return mockQuestion;
  },
});