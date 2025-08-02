import { v } from "convex/values";
import { action, mutation, query } from "./_generated/server";
import { getCurrentUser } from "./users";
import { GoogleGenerativeAI, SchemaType } from "@google/generative-ai";

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

    let prompt: string;
    let schema;

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
- Velocity: $v_f = v_0 + at$`;

      schema = {
        type: SchemaType.OBJECT,
        properties: {
          questionText: { type: SchemaType.STRING, description: "The question text with LaTeX formatting for mathematical expressions." },
          choices: {
            type: SchemaType.ARRAY,
            description: "An array of 4 possible answer choices with LaTeX formatting.",
            items: { type: SchemaType.STRING },
          },
          correctChoice: {
            type: SchemaType.STRING,
            description: "The correct answer choice from the 'choices' array.",
          },
          explanation: {
            type: SchemaType.STRING,
            description: "A detailed explanation with step-by-step solution using LaTeX for mathematical expressions.",
          },
        },
        required: ["questionText", "choices", "correctChoice", "explanation"],
      };
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
- Derivatives: $\\frac{dv}{dt} = a$`;

      schema = {
        type: SchemaType.OBJECT,
        properties: {
          questionText: { type: SchemaType.STRING, description: "The question text with LaTeX formatting for mathematical expressions." },
          answer: {
            type: SchemaType.STRING,
            description: "The final numerical answer with units and LaTeX formatting.",
          },
          explanation: {
            type: SchemaType.STRING,
            description: "A detailed step-by-step solution using LaTeX for all mathematical expressions.",
          },
        },
        required: ["questionText", "answer", "explanation"],
      };
    }

    try {
      const result = await model.generateContent({
        contents: [{ role: "user", parts: [{ text: prompt }] }],
        generationConfig: {
          responseMimeType: "application/json",
          responseSchema: schema as any,
        },
      });

      const response = await result.response;
      const jsonText = response.text();
      console.log("Gemini JSON response:", jsonText);

      const parsedResponse = JSON.parse(jsonText);

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