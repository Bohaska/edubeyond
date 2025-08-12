import { authTables } from "@convex-dev/auth/server";
import { defineSchema, defineTable } from "convex/server";
import { Infer, v } from "convex/values";

// default user roles. can add / remove based on the project as needed
export const ROLES = {
  ADMIN: "admin",
  USER: "user",
  MEMBER: "member",
} as const;

export const roleValidator = v.union(
  v.literal(ROLES.ADMIN),
  v.literal(ROLES.USER),
  v.literal(ROLES.MEMBER),
);
export type Role = Infer<typeof roleValidator>;

const schema = defineSchema({
  // default auth tables using convex auth.
  ...authTables, // do not remove or modify

  // the users table is the default users table that is brought in by the authTables
  users: defineTable({
    name: v.optional(v.string()), // name of the user. do not remove
    image: v.optional(v.string()), // image of the user. do not remove
    email: v.optional(v.string()), // email of the user. do not remove
    emailVerificationTime: v.optional(v.number()), // email verification time. do not remove
    isAnonymous: v.optional(v.boolean()), // is the user anonymous. do not remove

    role: v.optional(roleValidator), // role of the user. do not remove
  })
    .index("email", ["email"]),

  // Questions table for storing generated AP Physics C questions
  questions: defineTable({
    topic: v.string(), // e.g., "Newton's Laws", "Gauss's Law"
    questionType: v.string(), // "MCQ" or "FRQ"
    difficulty: v.string(), // "easy", "medium", "hard"
    questionText: v.string(), // The actual question content
    answer: v.string(), // The correct answer or solution
    explanation: v.string(), // Step-by-step explanation
    choices: v.optional(v.array(v.string())), // For MCQ options
    correctChoice: v.optional(v.string()), // For MCQ correct answer
    diagram: v.optional(v.string()), // SVG diagram for the question
    createdBy: v.id("users"), // User who generated the question
  })
    .index("by_topic", ["topic"])
    .index("by_user", ["createdBy"])
    .index("by_type", ["questionType"])
    .index("by_difficulty", ["difficulty"]),

  // Dataset catalog for tracking explored resources
  datasets: defineTable({
    name: v.string(), // e.g., "OpenStax College Physics"
    url: v.string(), // Resource URL
    description: v.string(), // Description of the dataset
    questionTypes: v.array(v.string()), // Types of questions available
    topics: v.array(v.string()), // Topics covered
    strengths: v.string(), // Strengths of the resource
    limitations: v.string(), // Limitations noted
    addedBy: v.id("users"), // User who cataloged this resource
  }).index("by_user", ["addedBy"]),

  resources: defineTable({
    parentId: v.optional(v.id("resources")),
    name: v.string(),
    type: v.union(v.literal("category"), v.literal("guidesheet"), v.literal("video"), v.literal("link"), v.literal("simulation")),
    url: v.optional(v.string()),
    imageUrl: v.optional(v.string()),
    order: v.number(),
  })
  .index("by_parent_and_order", ["parentId", "order"])
  .searchIndex("by_name", {
    searchField: "name",
  }),

  conversations: defineTable({
    userId: v.id("users"),
    title: v.string(),
  }).index("by_user", ["userId"]),

  messages: defineTable({
    conversationId: v.id("conversations"),
    userId: v.id("users"),
    text: v.string(),
    isViewer: v.boolean(),
  }).index("by_conversation", ["conversationId"]),

},
{
  schemaValidation: false
});

export default schema;