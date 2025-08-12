import { action } from "./_generated/server";
import { api } from "./_generated/api";

export const all = action({
  handler: async (ctx) => {
    await ctx.runMutation(api.resources.seedAPlusPhysics, {});
    await ctx.runMutation(api.resources.seedMoreResources, {});
    await ctx.runMutation(api.resources.seedPhetSimulations, {});
    return "All resources seeded successfully!";
  },
});
