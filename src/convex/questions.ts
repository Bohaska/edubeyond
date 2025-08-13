import { v } from "convex/values";
import { action, mutation, query } from "./_generated/server";
import { getCurrentUser } from "./users";
import { GoogleGenAI } from "@google/genai";

const genAI = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY! });

// Generate a question using AI (this will be an action since it calls external APIs)
export const generateQuestion = action({
  args: {
    topic: v.string(),
    questionType: v.string(),
    difficulty: v.string(),
  },
  handler: async (ctx, args) => {
    const { topic, questionType, difficulty } = args;

    let prompt: string;

    if (questionType === "MCQ") {
      prompt = `Generate a ${difficulty} multiple-choice question for AP Physics C about ${topic}.

Requirements:
- Use proper mathematical notation with LaTeX formatting (e.g., $F = ma$, $\\vec{E} = \\frac{kQ}{r^2}$)
- Include units where appropriate (e.g., m/s², N/C, J)
- Use subscripts and superscripts for variables (e.g., $v_0$, $x^2$)
- Format equations clearly with LaTeX
- Provide 4 distinct answer choices
- Include a detailed explanation with step-by-step solution using LaTeX for mathematical expressions

Example LaTeX formatting:
- Force: $F = ma$
- Electric field: $\\vec{E} = \\frac{kQ}{r^2}$
- Kinetic energy: $KE = \\frac{1}{2}mv^2$
- Velocity: $v_f = v_0 + at$

Return your response in the following JSON format:
{
  "questionText": "The question text with LaTeX formatting",
  "choices": ["Choice A", "Choice B", "Choice C", "Choice D"],
  "correctChoice": "Choice A",
  "explanation": "Detailed explanation with LaTeX formatting"
}`;
    } else {
      // FRQ
      prompt = `Generate a ${difficulty} free-response question for AP Physics C about ${topic}.

Requirements:
- Use proper mathematical notation with LaTeX formatting (e.g., $F = ma$, $\\vec{E} = \\frac{kQ}{r^2}$)
- Include units in the final answer (e.g., m/s², N/C, J)
- Use subscripts and superscripts for variables (e.g., $v_0$, $x^2$)
- Format equations clearly with LaTeX
- Provide a detailed step-by-step solution with LaTeX for all mathematical expressions
- Include diagrams descriptions when relevant

Example LaTeX formatting:
- Force: $F = ma$
- Electric field: $\\vec{E} = \\frac{kQ}{r^2}$
- Kinetic energy: $KE = \\frac{1}{2}mv^2$
- Velocity: $v_f = v_0 + at$
- Integrals: $\\int_0^t a \\, dt$
- Derivatives: $\\frac{dv}{dt} = a$

Return your response in the following JSON format:
{
  "questionText": "The question text with LaTeX formatting",
  "answer": "The final numerical answer with units",
  "explanation": "Detailed step-by-step solution with LaTeX formatting"
}`;
    }

    try {
      const result = await genAI.models.generateContent({
        model: "gemini-2.5-flash",
        contents: prompt,
      });

      const jsonText = result.text;
      console.log("Gemini JSON response:", jsonText);

      // Extract JSON from the response
      const jsonMatch = jsonText?.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        throw new Error("No valid JSON found in the AI response.");
      }

      const parsedResponse = JSON.parse(jsonMatch[0]);

      return {
        questionText: parsedResponse.questionText,
        answer: parsedResponse.answer || parsedResponse.correctChoice,
        explanation: parsedResponse.explanation,
        choices: parsedResponse.choices,
        correctChoice: parsedResponse.correctChoice,
      };
    } catch (error) {
      console.error("Error generating content with Gemini:", error);
      if (error instanceof Error) {
        throw new Error(`AI Content Generation Failed: ${error.message}`);
      }
      throw new Error(
        "Failed to generate question using AI due to an unknown error.",
      );
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
    diagram: v.optional(v.string()),
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
    diagram: v.optional(v.string()),
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