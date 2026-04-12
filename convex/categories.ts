import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

export const list = query({
  args: {
    type: v.optional(v.union(v.literal("expense"), v.literal("income"))),
  },
  handler: async (ctx, args) => {
    if (args.type) {
      return await ctx.db
        .query("categories")
        .withIndex("by_type", (q) => q.eq("type", args.type!))
        .collect();
    }
    return await ctx.db.query("categories").collect();
  },
});

export const add = mutation({
  args: {
    name: v.string(),
    icon: v.string(),
    color: v.string(),
    type: v.union(v.literal("expense"), v.literal("income")),
    isDefault: v.boolean(),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("categories", args);
  },
});

export const remove = mutation({
  args: { id: v.id("categories") },
  handler: async (ctx, args) => {
    await ctx.db.delete(args.id);
  },
});
