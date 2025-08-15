import { action, internalMutation, mutation, query } from "./_generated/server";
import { v } from "convex/values";
import { GoogleGenAI, Type } from "@google/genai";
import { getCurrentUser } from "./users";
import { Id } from "./_generated/dataModel";
import { internal } from "./_generated/api";

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
    const user = await getCurrentUser(ctx);
    if (!user) {
      throw new Error("User not authenticated");
    }
    const { ...questionData } = args;
    const questionId = await ctx.db.insert("questions", {
      ...questionData,
      createdBy: user._id,
    });

    await ctx.scheduler.runAfter(0, internal.diagrams.generate, {
      questionText: args.questionText,
      questionId: questionId,
    });

    return questionId;
  },
});

export const addDiagramToQuestion = internalMutation({
  args: {
    questionId: v.id("questions"),
    diagram: v.string(),
  },
  handler: async (ctx, { questionId, diagram }) => {
    await ctx.db.patch(questionId, { diagram });
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
      You are an expert AP Physics C tutor. Your task is to generate a high-quality, original practice question in JSON format.

      Please generate a question based on the following parameters:
      - Topic: ${args.topic}
      - Question Type: ${args.questionType}
      - Difficulty: ${args.difficulty}

      **Content Guidelines:**
      - The question should be challenging and at the AP Physics C level.
      - The explanation should be clear, concise, and provide a step-by-step solution.
      - For MCQ questions, the incorrect choices (distractors) should be plausible and target common student misconceptions.
      - Ensure the question and explanation are formatted with LaTeX for mathematical expressions where appropriate (e.g., using $...$ for inline and $$...$$ for block equations).
      
      **Output Format:**
      Return ONLY the JSON object matching the provided schema. Do not include any other text, explanations, or markdown formatting.
    `;

    const isMCQ = args.questionType === "MCQ";

    const properties: any = {
      questionText: {
        type: Type.STRING,
        description:
          "The full text of the question, including any LaTeX formatting.",
      },
      explanation: {
        type: Type.STRING,
        description:
          "A detailed step-by-step explanation for the solution, including LaTeX.",
      },
    };
    const required = ["questionText", "explanation"];

    if (isMCQ) {
      properties.choices = {
        type: Type.ARRAY,
        description: "An array of strings for the multiple-choice options.",
        items: { type: Type.STRING },
      };
      properties.correctChoice = {
        type: Type.STRING,
        description: "The correct answer from the choices array.",
      };
      required.push("choices", "correctChoice");
    }

    const responseSchema = {
      type: Type.OBJECT,
      properties,
      required,
    };

    const result = await genAI.models.generateContent({
      model: "gemini-2.5-flash",
      contents: [{ role: "user", parts: [{ text: prompt }] }],
      config: {
        responseMimeType: "application/json",
        responseSchema: responseSchema,
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