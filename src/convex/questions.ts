import { v } from "convex/values";
import { query, mutation, action } from "./_generated/server";
import { getCurrentUser } from "./users";
import { GoogleGenAI } from "@google/genai";

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
    const genAI = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY! });
    const model = genAI.models.generateContent;

    const prompt = `
      You are an expert AP Physics C tutor. Your task is to generate a high-quality, original practice question.

      Please generate a question based on the following parameters:
      - Topic: ${args.topic}
      - Question Type: ${args.questionType}
      - Difficulty: ${args.difficulty}

      **Output Format Instructions:**
      - Return the output as a single, minified JSON object.
      - Do NOT include any markdown formatting (e.g., \`\`\`json).
      - The JSON object must have the following keys: "questionText" (string), "explanation" (string).
      - If the questionType is "MCQ", the JSON object must also include: "choices" (an array of 4 strings) and "correctChoice" (a string that exactly matches one of the items in "choices").
      - For "FRQ" questions, do not include "choices" or "correctChoice".
      - Ensure all strings in the JSON are properly escaped.

      **Content Guidelines:**
      - The question should be challenging and at the AP Physics C level.
      - The explanation should be clear, concise, and provide a step-by-step solution.
      - For MCQ questions, the incorrect choices (distractors) should be plausible and target common student misconceptions.
    `;

    const result = await model({
      model: "gemini-1.5-flash",
      contents: [{ role: "user", parts: [{ text: prompt }] }]
    });
    
    const text = result.candidates?.[0]?.content?.parts?.[0]?.text;
    
    if (!text) {
      throw new Error("No response text received from AI model");
    }
    
    try {
      // Attempt to parse the text to ensure it's valid JSON
      const parsed = JSON.parse(text);
      return parsed;
    } catch (e) {
      console.error("Failed to parse AI response as JSON:", text);
      throw new Error("AI response was not valid JSON.");
    }
  },
});