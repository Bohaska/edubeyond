import { v } from "convex/values";
import { action, internalMutation, mutation } from "./_generated/server";
import { GoogleGenAI } from "@google/genai";
import { internal } from "./_generated/api";
import { getCurrentUser } from "./users";

const genAI = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY! });

export const generateDiagram = action({
  args: {
    questionId: v.id("questions"),
    questionText: v.string(),
  },
  handler: async (ctx, args) => {
    const prompt = `
      Based on the following AP Physics C question, generate a clean, simple, and clear SVG diagram that illustrates the problem.

      **Instructions for the AI Model:**
      1.  **Think Step-by-Step First:** Before generating the SVG, analyze the question to identify all necessary components for the diagram.
      2.  **List Objects and Coordinates:** Create a logical plan. List the objects (e.g., blocks, planes, vectors), their coordinates (x, y), rotations, and required labels. Think logically about coordinate placement to ensure precise alignment.
      3.  **SVG Styling Rules:**
          -   Use font-family="Helvetica" and font-size="16" for all text labels.
          -   Keep all strokes uniform with a stroke-width of 1.5.
          -   Position all labels at least 10 pixels away from SVG edges or other objects for clarity.
      4.  **Output Format:** The final output must be ONLY the SVG code, starting with <svg> and ending with </svg>. Do not include your step-by-step thinking process, just the final SVG. The style should be similar to diagrams found in College Board AP Physics materials.

      **Question:** "${args.questionText}"

      **Internal Thinking Process (for you to plan, not for final output):**
      - Object 1: [description, coordinates, rotation, label]
      - Object 2: [description, coordinates, rotation, label]
      - ...

      **Final Output (SVG code only):**
    `;

    try {
      const result = await genAI.models.generateContent({
        model: "gemini-2.5-flash",
        contents: prompt,
      });
      const svgText = result.text;

      // Clean the response to ensure it's valid SVG
      const svgMatch = svgText?.match(/<svg[\s\S]*?<\/svg>/);
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