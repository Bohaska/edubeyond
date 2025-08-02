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
    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

    let prompt = "";
    if (questionType === "MCQ") {
      prompt = `Generate a ${difficulty} multiple-choice question for AP Physics C about ${topic}. 
      The output must be a valid JSON object with the following keys: 
      "questionText" (string), 
      "choices" (an array of 4 strings representing the options A, B, C, D), 
      "correctChoice" (a string, e.g., "C"), and 
      "explanation" (a string explaining the answer).
      Do not include any text outside of the JSON object.`;
    } else {
      prompt = `Generate a ${difficulty} free-response question for AP Physics C about ${topic}. 
      The output must be a valid JSON object with the following keys: 
      "questionText" (string), 
      "answer" (a string with the final answer), and 
      "explanation" (a string with a detailed, multi-step solution).
      Do not include any text outside of the JSON object.`;
    }

    try {
      const result = await model.generateContent(prompt);
      const response = await result.response;
      let text = response.text();

      // Clean the response to ensure it's a valid JSON string
      text = text.replace(/[\u0000-\u001F]+/g, "").trim();

      const jsonString = text.includes("{") ? text.substring(text.indexOf("{")) : text;
      const data = JSON.parse(jsonString);

      // For MCQ, ensure choices and correctChoice are aligned
      if (questionType === "MCQ") {
        // Verify choices array length
        if (!Array.isArray(data.choices) || data.choices.length !== 4) {
          throw new Error("Invalid choices format");
        }
        if (!["A", "B", "C", "D"].includes(data.correctChoice)) {
          throw new Error("Invalid correctChoice value");
        }
        // Map choices labels if necessary
        // assuming choices come with options labeled A-D
      }

      return {
        questionText: data.questionText,
        answer: data.answer,
        explanation: data.explanation,
        choices: data.choices,
        correctChoice: data.correctChoice,
      };
    } catch (error) {
      console.error("Error generating content with Gemini:", error);
      if (error instanceof Error) {
        throw new Error(`AI Content Generation Failed: ${error.message}`);
      }
      throw new Error("Failed to generate question using AI due to an unknown error.");
    }
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