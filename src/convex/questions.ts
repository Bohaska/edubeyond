import { internalMutation, mutation, query } from "./_generated/server";
import { v } from "convex/values";
import { getCurrentUser } from "./users";

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

export const updateDiagram = mutation({
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

export const generateHint = mutation({
  args: {
    questionId: v.id("questions"),
    hintIndex: v.number(),
    context: v.string(),
  },
  handler: async (ctx, args) => {
    const user = await getCurrentUser(ctx);
    if (!user) {
      throw new Error("User not authenticated");
    }

    const question = await ctx.db.get(args.questionId);
    if (!question) {
      throw new Error("Question not found");
    }

    const context = JSON.parse(args.context);
    
    const prompt = `You are a physics tutor helping a student with an AP Physics C problem. Generate a helpful hint for step ${args.hintIndex + 1} of solving this problem.

Problem: ${question.questionText}
${question.choices ? `Choices: ${question.choices.join(", ")}` : ""}
${context.scratchpad ? `Student's work so far: ${context.scratchpad}` : ""}
${context.previousHints?.length ? `Previous hints given: ${context.previousHints.join(" ")}` : ""}

Guidelines:
- Give a specific, actionable hint for the next step
- Don't give away the complete solution
- Focus on the physics concepts and problem-solving approach
- Be encouraging and educational
- Keep it concise but helpful

Generate hint ${args.hintIndex + 1}:`;

    try {
      const apiKey = process.env.GEMINI_API_KEY;
      if (!apiKey) {
        throw new Error("GEMINI_API_KEY not configured");
      }

      const { GoogleGenAI } = await import("@google/genai");
      const ai = new GoogleGenAI({ apiKey });

      const response = await ai.models.generateContent({
        model: "gemini-2.0-flash-exp",
        contents: prompt,
      });

      return response.text;
    } catch (error) {
      console.error("Error generating hint:", error);
      throw new Error("Failed to generate hint");
    }
  },
});

export const chatWithAI = mutation({
  args: {
    message: v.string(),
    context: v.string(),
  },
  handler: async (ctx, args) => {
    const user = await getCurrentUser(ctx);
    if (!user) {
      throw new Error("User not authenticated");
    }

    const context = JSON.parse(args.context);
    
    const prompt = `You are an AI physics tutor helping a student with an AP Physics C problem. The student has asked you a question about their current problem.

Current Problem: ${context.question}
${context.choices ? `Answer Choices: ${context.choices.join(", ")}` : ""}
${context.scratchpad ? `Student's current work: ${context.scratchpad}` : "No work shown yet"}

Student's Question: ${args.message}

Guidelines:
- Be helpful and educational
- Guide the student to understand concepts rather than just giving answers
- Ask clarifying questions if needed
- Encourage good problem-solving practices
- Reference their scratchpad work when relevant
- Keep responses conversational but informative

Respond to the student:`;

    try {
      const apiKey = process.env.GEMINI_API_KEY;
      if (!apiKey) {
        throw new Error("GEMINI_API_KEY not configured");
      }

      const { GoogleGenAI } = await import("@google/genai");
      const ai = new GoogleGenAI({ apiKey });

      const response = await ai.models.generateContent({
        model: "gemini-2.0-flash-exp",
        contents: prompt,
      });

      return response.text;
    } catch (error) {
      console.error("Error in AI chat:", error);
      throw new Error("Failed to get AI response");
    }
  },
});

export const list = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db.query("questions").order("desc").collect();
  },
});