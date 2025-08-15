"use node";
import { action } from "./_generated/server";
import { v } from "convex/values";
import { internal } from "./_generated/api";

export const generateDiagram = action({
  args: {
    questionId: v.id("questions"),
    questionText: v.string(),
  },
  handler: async (ctx, { questionId, questionText }): Promise<{ rawResponse: string; svgCode: string }> => {
    const result: { rawResponse: string; svgCode: string } = await ctx.runAction(internal.diagrams.generate, {
      questionText,
      questionId,
    });

    if (!result || !result.svgCode) {
      throw new Error("Diagram generation returned empty result.");
    }

    // Log the raw AI response to console (this will be visible in browser console when called from frontend)
    console.log("AI Diagram Response:", result.rawResponse);

    return result;
  }
});