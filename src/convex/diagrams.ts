"use node";
import { internalAction } from "./_generated/server";
import { v } from "convex/values";
import { GoogleGenAI } from "@google/genai";
import { internal } from "./_generated/api";

export const generate = internalAction({
  args: {
    questionText: v.string(),
    questionId: v.id("questions"),
  },
  handler: async (ctx, { questionText, questionId }) => {
    const genAI = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY! });

    const prompt = `
      You are a physics expert and an SVG artist. Your task is to create a simple, clean, and effective SVG diagram to illustrate the following AP Physics C problem.

      **Problem:**
      ${questionText}

      **Instructions:**
      1.  **Analyze the problem:** Identify the key objects, forces, and interactions described.
      2.  **Design a clear diagram:** Create a 2D, line-art style diagram. Use basic shapes (circles, rectangles, lines, arrows).
      3.  **Keep it simple:** Do not use gradients, shadows, or complex effects. Use a limited color palette (e.g., black for objects, blue for velocity vectors, red for force vectors, green for acceleration vectors).
      4.  **Labeling:** Label important components clearly (e.g., 'm1', 'v', 'F_g', 'θ'). Use standard physics notation.
      5.  **SVG Code:** Output *only* the SVG code, starting with \`<svg ...>\` and ending with \`</svg>\`. Do not include any other text, explanations, or markdown formatting. The SVG should be self-contained and have a transparent background. Ensure the viewBox is set appropriately to frame the content.

      **Example Output:**
      \`\`\`xml
      <svg width="300" height="200" viewBox="0 0 300 200" xmlns="http://www.w3.org/2000/svg">
        <rect x="0" y="180" width="300" height="20" fill="#d3d3d3" />
        <rect x="100" y="130" width="50" height="50" fill="black" />
        <line x1="125" y1="130" x2="125" y2="80" stroke="black" />
        <circle cx="125" cy="80" r="20" fill="black" />
        <text x="150" y="175" font-family="Arial" font-size="16">m1</text>
        <text x="150" y="75" font-family="Arial" font-size="16">m2</text>
      </svg>
      \`\`\`

      Generate the SVG for the provided problem.
    `;

    const result = await genAI.models.generateContent({
      model: "gemini-2.5-flash",
      contents: [{ role: 'user', parts: [{ text: prompt }] }],
    });

    const text = result.text;
    const svgCode = (text || '').trim().replace(/\n/g, '');

    return svgCode;
  },
});