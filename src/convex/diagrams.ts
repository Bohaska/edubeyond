import { v } from "convex/values";
import { action, internalMutation, mutation } from "./_generated/server";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { Id } from "./_generated/dataModel";
import { internal } from "./_generated/api";
import { getCurrentUser } from "./users";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

export const generateDiagram = action({
  args: {
    questionId: v.id("questions"),
    questionText: v.string(),
  },
  returns: v.string(),
  handler: async (ctx, args) => {
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

    const prompt = `
      Based on the following AP Physics C question, generate a clean, simple, and clear SVG diagram that illustrates the problem.
      The style should be similar to diagrams found in College Board AP Physics materials - use clear lines, simple shapes, and labels where necessary.
      Do not include any text outside of the SVG tags. The output should be only the SVG code.

      Question: "${args.questionText}"

      SVG Diagram:
    `;

    try {
      const result = await model.generateContent(prompt);
      const response = await result.response;
      const svgText = response.text();

      // Clean the response to ensure it's valid SVG
      const svgMatch = svgText.match(/<svg[\s\S]*?<\/svg>/);
      if (!svgMatch) {
        throw new Error("No valid SVG found in the AI response.");
      }
      const diagram = svgMatch[0];

      await ctx.runMutation(internal.diagrams.saveDiagram, {
        questionId: args.questionId,
        diagram,
      });

      return diagram;
    } catch (error) {
      console.error("Error generating diagram with Gemini:", error);
      if (error instanceof Error) {
        throw new Error(`AI Diagram Generation Failed: ${error.message}`);
      }
      throw new Error(
        "Failed to generate diagram using AI due to an unknown error.",
      );
    }
  },
});

export const saveDiagram = internalMutation({
  args: {
    questionId: v.id("questions"),
    diagram: v.string(),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    await ctx.db.patch(args.questionId, { diagram: args.diagram });
    return null;
  },
});

export const removeDiagram = mutation({
  args: {
    questionId: v.id("questions"),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    const user = await getCurrentUser(ctx);
    if (!user) {
      throw new Error("User must be authenticated to remove diagrams");
    }

    // Verify the user owns this question
    const question = await ctx.db.get(args.questionId);
    if (!question || question.createdBy !== user._id) {
      throw new Error("You can only remove diagrams from your own questions");
    }

    await ctx.db.patch(args.questionId, { diagram: undefined });
    return null;
  },
});