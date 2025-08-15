"use node";

import { action } from "./_generated/server";
import { internal } from "./_generated/api";
import { v } from "convex/values";

export const generateHint = action({
  args: {
    questionId: v.id("questions"),
    hintIndex: v.number(),
    context: v.string(),
  },
  handler: async (ctx, args): Promise<string> => {
    const question = await ctx.runQuery(internal.questions.getQuestionForHint, {
      questionId: args.questionId,
    });
    if (!question) {
      throw new Error("Question not found");
    }

    const context = JSON.parse(args.context);

    const prompt: string = `You are a physics tutor helping a student with an AP Physics C problem. Generate a helpful hint for step ${
      args.hintIndex + 1
    } of solving this problem.

Problem: ${question.questionText}
${question.choices ? `Choices: ${question.choices.join(", ")}` : ""}
${
  context.scratchpad
    ? `Student's work so far: ${context.scratchpad}`
    : ""
}
${
  context.previousHints?.length
    ? `Previous hints given: ${context.previousHints.join(" ")}`
    : ""
}

Guidelines:
- Give a specific, actionable hint for the next step
- Don't give away the complete solution
- Focus on the physics concepts and problem-solving approach
- Be encouraging and educational
- Keep it concise but helpful

Generate hint ${args.hintIndex + 1}:`;

    try {
      const apiKey = process.env.GEMINI_API_KEY;
      if (!apiKey) {
        throw new Error("GEMINI_API_KEY environment variable not set!");
      }

      const { GoogleGenerativeAI } = await import("@google/generative-ai");
      const genAI = new GoogleGenerativeAI(apiKey);
      const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

      const result = await model.generateContent(prompt);
      return result.response.text();
    } catch (error) {
      console.error("Error generating hint:", error);
      if (error instanceof Error) {
        throw new Error(`Failed to generate hint: ${error.message}`);
      }
      throw new Error("Failed to generate hint due to an unknown error.");
    }
  },
});

export const chatWithAI = action({
  args: {
    message: v.string(),
    context: v.string(),
  },
  handler: async (ctx, args): Promise<string> => {
    const context = JSON.parse(args.context);

    const prompt: string = `You are an AI physics tutor helping a student with an AP Physics C problem. The student has asked you a question about their current problem.

Current Problem: ${context.question}
${context.choices ? `Answer Choices: ${context.choices.join(", ")}` : ""}
${
  context.scratchpad
    ? `Student's current work: ${context.scratchpad}`
    : "No work shown yet"
}

Student's Question: ${args.message}

Guidelines:
- Be helpful and educational
- Guide the student to understand concepts rather than just giving answers
- Ask clarifying questions if needed
- Encourage good problem-solving practices
- Reference their scratchpad work when relevant
- Keep responses conversational but informative

Respond to the student:`;

    try {
      const apiKey = process.env.GEMINI_API_KEY;
      if (!apiKey) {
        throw new Error("GEMINI_API_KEY environment variable not set!");
      }

      const { GoogleGenerativeAI } = await import("@google/generative-ai");
      const genAI = new GoogleGenerativeAI(apiKey);
      const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

      const result = await model.generateContent(prompt);
      return result.response.text();
    } catch (error) {
      console.error("Error in AI chat:", error);
      if (error instanceof Error) {
        throw new Error(`Failed to get AI response: ${error.message}`);
      }
      throw new Error("Failed to get AI response due to an unknown error.");
    }
  },
});