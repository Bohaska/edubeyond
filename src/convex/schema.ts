import { authTables } from "@convex-dev/auth/server";
import { defineSchema, defineTable } from "convex/server";
import { Infer, v } from "convex/values";

export const ROLES = {
  ADMIN: "admin",
  USER: "user",
  MEMBER: "member",
} as const;

export const roleValidator = v.union(
  v.literal(ROLES.ADMIN),
  v.literal(ROLES.USER),
  v.literal(ROLES.MEMBER)
);
export type Role = Infer<typeof roleValidator>;

const schema = defineSchema(
  {
    ...authTables,
    users: defineTable({
      name: v.optional(v.string()),
      image: v.optional(v.string()),
      email: v.optional(v.string()),
      emailVerificationTime: v.optional(v.number()),
      isAnonymous: v.optional(v.boolean()),
      role: v.optional(roleValidator),

      // New fields for dashboard
      streak: v.optional(v.number()),
      mastery: v.optional(
        v.object({
          mechanics: v.number(),
          e_and_m: v.number(),
        }),
      ),
      lastProblemId: v.optional(v.id("questions")),
    }).index("email", ["email"]),

    resources: defineTable({
      name: v.string(),
      url: v.string(),
      type: v.string(),
      source: v.string(),
      topic: v.string(),
    }).index("by_source", ["source"]),

    questions: defineTable({
      topic: v.string(),
      questionType: v.string(),
      difficulty: v.string(),
      questionText: v.string(),
      explanation: v.string(),
      choices: v.optional(v.array(v.string())),
      correctChoice: v.optional(v.string()),
      diagram: v.optional(v.string()),
      createdBy: v.id("users"),
    })
      .index("by_topic", ["topic"])
      .index("by_user", ["createdBy"]),

    datasets: defineTable({
      name: v.string(),
      url: v.string(),
      description: v.string(),
      questionTypes: v.array(v.string()),
      topics: v.array(v.string()),
      strengths: v.string(),
      limitations: v.string(),
      addedBy: v.id("users"),
    }),

    conversations: defineTable({
      userId: v.id("users"),
      title: v.string(),
    }).index("by_user", ["userId"]),

    messages: defineTable({
      conversationId: v.id("conversations"),
      userId: v.id("users"),
      role: v.union(v.literal("user"), v.literal("model"), v.literal("function")),
      text: v.optional(v.string()),
    }).index("by_conversation", ["conversationId"]),
  },
  {
    schemaValidation: false,
  }
);

export default schema;