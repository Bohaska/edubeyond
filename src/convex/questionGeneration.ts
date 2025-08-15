"use node";

import { GoogleGenAI } from "@google/genai";
import { action } from "./_generated/server";
import { v } from "convex/values";
import { internal } from "./_generated/api";

const genAI = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY! });

export const generateQuestion = action({
  args: {
    topic: v.string(),
    questionType: v.string(),
    difficulty: v.string(),
  },
  handler: async (ctx, args) => {
    const prompt = `Generate an AP Physics C ${args.questionType} question about ${args.topic} at ${args.difficulty} difficulty level.

Requirements:
- For MCQ: Provide 4-5 multiple choice options with one correct answer
- For FRQ: Provide a comprehensive free response question
- Include detailed step-by-step explanation
- Use proper physics notation and LaTeX formatting for equations (use $ for inline math, $$ for block math)
- Make it realistic to actual AP Physics C exam standards
- Include relevant physics constants if needed

Return the response in this exact JSON format:
{
  "questionText": "The question text with LaTeX math formatting",
  "choices": ["A) option 1", "B) option 2", "C) option 3", "D) option 4"] (only for MCQ),
  "correctChoice": "The correct answer" (for MCQ, include the letter and full text; for FRQ, omit this field),
  "explanation": "Detailed step-by-step solution with LaTeX formatting",
  "diagram": null (always null for now)
}`;

    try {
      const result = await genAI.models.generateContent({
        model: "gemini-1.5-flash",
        contents: [{ parts: [{ text: prompt }] }]
      });
      const text = result.candidates?.[0]?.content?.parts?.[0]?.text || "";
      
      // Extract JSON from the response
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        throw new Error("No valid JSON found in response");
      }
      
      const questionData = JSON.parse(jsonMatch[0]);
      
      // Validate the response structure
      if (!questionData.questionText || !questionData.explanation) {
        throw new Error("Invalid question format received");
      }
      
      return questionData;
    } catch (error) {
      console.error("Error generating question:", error);
      throw new Error("Failed to generate question. Please try again.");
    }
  },
});
