"use node";
import { action } from "./_generated/server";
import { v } from "convex/values";
import { internal } from "./_generated/api";

export const generateDiagram = action({
  args: {
    questionId: v.id("questions"),
    questionText: v.string(),
  },
  handler: async (ctx, { questionId, questionText }) => {
    const text = await ctx.runAction(internal.diagrams.generate, {
      questionText,
      questionId,
    });

    if (!text) {
      throw new Error("Diagram generation returned empty result.");
    }

    // Try to extract from 
  }
});