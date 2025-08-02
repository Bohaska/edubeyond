import { v } from "convex/values";
import { action, mutation, query } from "./_generated/server";
import { getCurrentUser } from "./users";

// Generate a question using AI (this will be an action since it calls external APIs)
export const generateQuestion = action({
  args: {
    topic: v.string(),
    questionType: v.string(),
    difficulty: v.string(),
  },
  returns: v.object({
    questionText: v.string(),
    answer: v.string(),
    explanation: v.string(),
    choices: v.optional(v.array(v.string())),
    correctChoice: v.optional(v.string()),
  }),
  handler: async (ctx, args) => {
    // This is a placeholder for AI generation
    // In a real implementation, you would call OpenAI API here
    const { topic, questionType, difficulty } = args;
    
    // Simulate AI generation with structured prompts
    let prompt = "";
    if (questionType === "MCQ") {
      prompt = `Generate a ${difficulty} multiple-choice question for AP Physics C about ${topic}. 
      Include 4 answer choices (A, B, C, D) and identify the correct one. 
      Provide a brief explanation of why the correct answer is right.
      Format: Question text, then choices, then correct answer, then explanation.`;
    } else {
      prompt = `Generate a ${difficulty} free-response question for AP Physics C about ${topic}. 
      Provide a multi-step solution with detailed reasoning and mathematical derivations.
      Format: Question text, then step-by-step solution with explanations.`;
    }

    // Placeholder response - in real implementation, call OpenAI API
    const mockResponse = {
      questionText: `A ${difficulty} ${questionType} question about ${topic}: A particle moves in a circular path with radius 2.0 m. If the centripetal acceleration is 8.0 m/s², what is the speed of the particle?`,
      answer: questionType === "MCQ" ? "C" : "4.0 m/s",
      explanation: questionType === "MCQ" 
        ? "Using the formula a_c = v²/r, we can solve for v: v = √(a_c × r) = √(8.0 × 2.0) = √16 = 4.0 m/s"
        : "Step 1: Identify the given values: r = 2.0 m, a_c = 8.0 m/s²\nStep 2: Apply the centripetal acceleration formula: a_c = v²/r\nStep 3: Solve for velocity: v = √(a_c × r) = √(8.0 × 2.0) = 4.0 m/s",
      choices: questionType === "MCQ" ? ["A) 2.0 m/s", "B) 3.0 m/s", "C) 4.0 m/s", "D) 6.0 m/s"] : undefined,
      correctChoice: questionType === "MCQ" ? "C" : undefined,
    };

    return mockResponse;
  },
});

// Save a generated question to the database
export const saveQuestion = mutation({
  args: {
    topic: v.string(),
    questionType: v.string(),
    difficulty: v.string(),
    questionText: v.string(),
    answer: v.string(),
    explanation: v.string(),
    choices: v.optional(v.array(v.string())),
    correctChoice: v.optional(v.string()),
  },
  returns: v.id("questions"),
  handler: async (ctx, args) => {
    const user = await getCurrentUser(ctx);
    if (!user) {
      throw new Error("User must be authenticated to save questions");
    }

    const questionId = await ctx.db.insert("questions", {
      ...args,
      createdBy: user._id,
    });

    return questionId;
  },
});

// Get questions by topic
export const getQuestionsByTopic = query({
  args: { topic: v.string() },
  returns: v.array(v.object({
    _id: v.id("questions"),
    _creationTime: v.number(),
    topic: v.string(),
    questionType: v.string(),
    difficulty: v.string(),
    questionText: v.string(),
    answer: v.string(),
    explanation: v.string(),
    choices: v.optional(v.array(v.string())),
    correctChoice: v.optional(v.string()),
    createdBy: v.id("users"),
  })),
  handler: async (ctx, args) => {
    const questions = await ctx.db
      .query("questions")
      .withIndex("by_topic", (q) => q.eq("topic", args.topic))
      .order("desc")
      .collect();
    
    return questions;
  },
});

// Get all questions for a user
export const getUserQuestions = query({
  args: {},
  returns: v.array(v.object({
    _id: v.id("questions"),
    _creationTime: v.number(),
    topic: v.string(),
    questionType: v.string(),
    difficulty: v.string(),
    questionText: v.string(),
    answer: v.string(),
    explanation: v.string(),
    choices: v.optional(v.array(v.string())),
    correctChoice: v.optional(v.string()),
    createdBy: v.id("users"),
  })),
  handler: async (ctx) => {
    const user = await getCurrentUser(ctx);
    if (!user) {
      return [];
    }

    const questions = await ctx.db
      .query("questions")
      .withIndex("by_user", (q) => q.eq("createdBy", user._id))
      .order("desc")
      .collect();
    
    return questions;
  },
});
