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
        const svgCode = await ctx.runAction(internal.diagrams.generate, {
            questionText,
            questionId,
        });

        if (svgCode && svgCode.startsWith("<svg")) {
            await ctx.runMutation(internal.questions.updateDiagram, {
                questionId,
                diagram: svgCode,
            });
        } else {
            console.error("Could not extract SVG from generation result:", svgCode);
            throw new Error("Failed to generate a valid diagram. The AI may have returned an invalid format.");
        }
    }
});
