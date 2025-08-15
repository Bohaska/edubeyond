import { v } from "convex/values";
import { query, mutation, action } from "./_generated/server";
import { getCurrentUser } from "./users";
import { GoogleGenAI, Type } from "@google/genai";

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
    createdBy: v.id("users"),
  },
  handler: async (ctx, args) => {
    const questionId = await ctx.db.insert("questions", args);
    return questionId;
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

    const prompt = `
      You are an expert AP Physics C tutor. Your task is to generate a high-quality, original practice question.

      Please generate a question based on the following parameters:
      - Topic: ${args.topic}
      - Question Type: ${args.questionType}
      - Difficulty: ${args.difficulty}

      **Content Guidelines:**
      - The question should be challenging and at the AP Physics C level.
      - The explanation should be clear, concise, and provide a step-by-step solution.
      - For MCQ questions, the incorrect choices (distractors) should be plausible and target common student misconceptions.
      - Ensure the question and explanation are formatted with LaTeX for mathematical expressions where appropriate (e.g., using $...$ for inline and $$...$$ for block equations).
    `;

    const isMCQ = args.questionType === "MCQ";

    const baseSchema = {
      type: Type.OBJECT,
      properties: {
        questionText: {
          type: Type.STRING,
          description:
            "The text of the question, including any necessary context or diagrams described in text. Use LaTeX for equations.",
        },
        explanation: {
          type: Type.STRING,
          description:
            "A detailed, step-by-step explanation for the correct answer. Use LaTeX for equations.",
        },
      },
    };

    const mcqSchema = {
      ...baseSchema,
      properties: {
        ...baseSchema.properties,
        choices: {
          type: Type.ARRAY,
          description:
            "An array of 4 strings representing the multiple-choice options.",
          items: {
            type: Type.STRING,
          },
        },
        correctChoice: {
          type: Type.STRING,
          description:
            "The string from the 'choices' array that is the correct answer.",
        },
      },
      required: ["questionText", "explanation", "choices", "correctChoice"],
    };

    const frqSchema = {
      ...baseSchema,
      required: ["questionText", "explanation"],
    };

    const result = await genAI.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: isMCQ ? mcqSchema : frqSchema,
      },
    });

    const text = result.text;

    if (!text) {
      throw new Error("No response text received from AI");
    }

    try {
      // The response should be a JSON string that can be parsed.
      const parsed = JSON.parse(text);
      return parsed;
    } catch (e) {
      console.error("Failed to parse AI response as JSON:", text);
      console.error("Original error:", e);
      throw new Error(
        "AI response was not valid JSON, despite schema enforcement.",
      );
    }
  },
});