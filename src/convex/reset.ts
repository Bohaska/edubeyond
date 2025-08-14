import { action, internalMutation } from "./_generated/server";
import { api, internal } from "./_generated/api";
import { ConvexError } from "convex/values";

/**
 * Action to reset all resources.
 * 1. Deletes all existing resources.
 * 2. Re-seeds the resources from the original seed function.
 * This is a protected action.
 */
export const resources = action({
  handler: async (ctx) => {
    // In a real app, you'd want to protect this with role-based access control.
    // For now, we'll just check for authentication.
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new ConvexError(
        "Not authenticated. Please log in to reset resources.",
      );
    }

    console.log("--> Deleting all existing resources...");
    await ctx.runMutation(internal.reset.deleteAll);

    console.log("--> Re-seeding resources...");
    await ctx.runAction(api.seed.all);

    const message = "✅ Resources have been successfully reset.";
    console.log(message);
    return message;
  },
});

/**
 * Internal mutation to delete all documents from the 'resources' table.
 * Should only be called from an action.
 */
export const deleteAll = internalMutation({
  handler: async (ctx) => {
    const resources = await ctx.db.query("resources").collect();
    const numDeleted = resources.length;

    if (numDeleted === 0) {
      console.log("No resources found to delete.");
      return;
    }

    const promises = resources.map((resource) => ctx.db.delete(resource._id));
    await Promise.all(promises);
    console.log(`Deleted ${numDeleted} resources.`);
  },
});