import { v } from "convex/values";
import { action, mutation, query } from "./_generated/server";
import { getCurrentUser } from "./users";
import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

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
    const { topic, questionType, difficulty } = args;
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

    let prompt = "";
    if (questionType === "MCQ") {
      prompt = `Generate a ${difficulty} multiple-choice question for AP Physics C about ${topic}. 
      
      IMPORTANT: Return ONLY a valid JSON object with exactly these keys:
      - "questionText": the question as a string
      - "choices": an array of exactly 4 strings (A, B, C, D options)
      - "correctChoice": a single letter string ("A", "B", "C", or "D")
      - "explanation": detailed explanation as a string
      
      Example format:
      {"questionText":"What is the acceleration due to gravity?","choices":["9.8 m/s²","10 m/s²","8.9 m/s²","11 m/s²"],"correctChoice":"A","explanation":"The standard acceleration due to gravity on Earth is 9.8 m/s²."}
      
      Return ONLY the JSON object, no other text.`;
    } else {
      prompt = `Generate a ${difficulty} free-response question for AP Physics C about ${topic}. 
      
      IMPORTANT: Return ONLY a valid JSON object with exactly these keys:
      - "questionText": the question as a string
      - "answer": the final numerical/text answer as a string
      - "explanation": detailed step-by-step solution as a string
      
      Example format:
      {"questionText":"Calculate the force needed to accelerate a 5kg object at 2 m/s².","answer":"10 N","explanation":"Using F = ma, F = 5 kg × 2 m/s² = 10 N"}
      
      Return ONLY the JSON object, no other text.`;
    }

    try {
      const result = await model.generateContent(prompt);
      const response = await result.response;
      let text = response.text().trim();

      // Log the raw response for debugging
      console.log("Raw Gemini response:", text);

      // Try to extract JSON more carefully
      let jsonText = text;
      
      // Remove markdown code blocks if present
      if (jsonText.includes("```")) {
        jsonText = jsonText.replace(/```[\s\S]*?```/g, "");
      }

      // Remove any leading/trailing whitespace
      jsonText = jsonText.trim();

      // Try to parse the JSON
      try {
        const data = JSON.parse(jsonText);
        return data;
      } catch (error) {
        console.error("Failed to parse JSON:", error);
        throw new Error("Invalid JSON response");
      }
    } catch (error) {
      console.error("Failed to generate question:", error);
      throw new Error("Failed to generate question");
    }
  }
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