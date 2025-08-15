"use node";

import { GoogleGenAI, Type } from "@google/genai";
import { action } from "./_generated/server";
import { v } from "convex/values";

const genAI = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY! });

export const generateQuestion = action({
  args: {
    topic: v.string(),
    questionType: v.string(),
    difficulty: v.string(),
  },
  handler: async (ctx, args) => {
    const prompt = `Generate an AP Physics C ${args.questionType} question about ${args.topic} at a ${args.difficulty} difficulty level.
- For MCQ, provide 4-5 multiple choice options with one correct answer.
- For FRQ, provide a comprehensive free response question.
- Include a detailed step-by-step explanation.
- Use proper physics notation and LaTeX formatting for equations (use $ for inline math, $$ for block math).
- Make it realistic to actual AP Physics C exam standards.
- Include relevant physics constants if needed.`;

    const responseSchema = {
      type: Type.OBJECT,
      properties: {
        questionText: { type: Type.STRING },
        choices: {
          type: Type.ARRAY,
          items: { type: Type.STRING },
          nullable: true,
        },
        correctChoice: {
          type: Type.STRING,
          nullable: true,
        },
        explanation: { type: Type.STRING },
        diagram: {
          type: Type.STRING,
          nullable: true,
        },
      },
      required: ["questionText", "explanation"],
    };

    try {
      const response = await genAI.models.generateContent({
        model: "gemini-1.5-flash",
        contents: prompt,
        config: {
          responseMimeType: "application/json",
          responseSchema,
        },
      });

      const questionData = JSON.parse(response.text || "{}");

      // Validate the response structure
      if (!questionData.questionText || !questionData.explanation) {
        throw new Error("Invalid question format received from AI");
      }

      return questionData;
    } catch (error) {
      console.error("Error generating question:", error);
      if (error instanceof Error) {
        throw new Error(`Failed to generate question: ${error.message}`);
      }
      throw new Error("Failed to generate question due to an unknown error.");
    }
  },
});