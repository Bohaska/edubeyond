import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { getCurrentUser } from "./users";

// Add a new dataset to the catalog
export const addDataset = mutation({
  args: {
    name: v.string(),
    url: v.string(),
    description: v.string(),
    questionTypes: v.array(v.string()),
    topics: v.array(v.string()),
    strengths: v.string(),
    limitations: v.string(),
  },
  returns: v.id("datasets"),
  handler: async (ctx, args) => {
    const user = await getCurrentUser(ctx);
    if (!user) {
      throw new Error("User must be authenticated to add datasets");
    }

    const datasetId = await ctx.db.insert("datasets", {
      ...args,
      addedBy: user._id,
    });

    return datasetId;
  },
});

// Get all datasets in the catalog
export const getAllDatasets = query({
  args: {},
  returns: v.array(v.object({
    _id: v.id("datasets"),
    _creationTime: v.number(),
    name: v.string(),
    url: v.string(),
    description: v.string(),
    questionTypes: v.array(v.string()),
    topics: v.array(v.string()),
    strengths: v.string(),
    limitations: v.string(),
    addedBy: v.id("users"),
  })),
  handler: async (ctx) => {
    const datasets = await ctx.db
      .query("datasets")
      .order("desc")
      .collect();
    
    return datasets;
  },
});

// Initialize default datasets
export const initializeDefaultDatasets = mutation({
  args: {},
  returns: v.null(),
  handler: async (ctx) => {
    const user = await getCurrentUser(ctx);
    if (!user) {
      throw new Error("User must be authenticated");
    }

    // Check if datasets already exist
    const existing = await ctx.db.query("datasets").collect();
    if (existing.length > 0) {
      return null;
    }

    // Add default datasets
    const defaultDatasets = [
      {
        name: "OpenStax College Physics",
        url: "https://openstax.org/books/college-physics/pages/1-introduction",
        description: "Comprehensive open-source physics textbook with conceptual and numerical problems covering mechanics and E&M topics.",
        questionTypes: ["Conceptual", "Numerical", "Mixed"],
        topics: ["Mechanics", "Electricity & Magnetism", "Waves", "Thermodynamics"],
        strengths: "Well-structured problems with clear explanations, aligned with college-level physics standards, freely accessible.",
        limitations: "May not match exact AP Physics C format, some problems too basic or advanced for AP level.",
      },
      {
        name: "Khan Academy Physics",
        url: "https://www.khanacademy.org/science/physics",
        description: "Interactive physics lessons with practice problems and video explanations covering AP Physics topics.",
        questionTypes: ["Multiple Choice", "Numerical", "Conceptual"],
        topics: ["Mechanics", "Electricity & Magnetism", "Oscillations", "Waves"],
        strengths: "Interactive format, immediate feedback, progressive difficulty, good for concept reinforcement.",
        limitations: "Limited free-response format, may lack depth for advanced AP Physics C topics.",
      },
      {
        name: "College Board AP Physics C",
        url: "https://apcentral.collegeboard.org/courses/ap-physics-c-mechanics",
        description: "Official AP Physics C past exam questions and scoring guidelines from College Board.",
        questionTypes: ["Multiple Choice", "Free Response"],
        topics: ["Mechanics", "Electricity & Magnetism"],
        strengths: "Authentic AP format, official scoring rubrics, represents actual exam difficulty and style.",
        limitations: "Limited quantity of freely available questions, requires careful copyright consideration.",
      },
      {
        name: "PhET Interactive Simulations",
        url: "https://phet.colorado.edu/en/simulations/category/physics",
        description: "Interactive physics simulations that can inspire question creation and provide visual context for problems.",
        questionTypes: ["Simulation-based", "Conceptual", "Experimental"],
        topics: ["Mechanics", "Electricity & Magnetism", "Quantum Physics", "Waves"],
        strengths: "Highly visual and interactive, great for conceptual understanding, can generate unique question scenarios.",
        limitations: "Not direct question source, requires adaptation to create AP-style problems.",
      },
      {
        name: "Physics LibreTexts",
        url: "https://phys.libretexts.org/",
        description: "Collaborative physics textbook platform with extensive problem sets and theoretical content.",
        questionTypes: ["Theoretical", "Numerical", "Derivation"],
        topics: ["Classical Mechanics", "Electromagnetism", "Modern Physics"],
        strengths: "Comprehensive coverage, detailed mathematical derivations, variety of difficulty levels.",
        limitations: "May be too advanced for some AP topics, inconsistent formatting across different sections.",
      },
    ];

    for (const dataset of defaultDatasets) {
      await ctx.db.insert("datasets", {
        ...dataset,
        addedBy: user._id,
      });
    }

    return null;
  },
});
