import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

export const list = query({
  args: {
    startDate: v.optional(v.number()),
    endDate: v.optional(v.number()),
    category: v.optional(v.string()),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    let entries;

    if (args.startDate && args.endDate) {
      entries = await ctx.db
        .query("income")
        .withIndex("by_date", (q) =>
          q.gte("date", args.startDate!).lte("date", args.endDate!)
        )
        .collect();
    } else if (args.category) {
      entries = await ctx.db
        .query("income")
        .withIndex("by_category", (q) => q.eq("category", args.category!))
        .collect();
    } else {
      entries = await ctx.db.query("income").withIndex("by_date").collect();
    }

    entries.sort((a, b) => b.date - a.date);

    if (args.limit) {
      entries = entries.slice(0, args.limit);
    }
    return entries;
  },
});

export const getByDateRange = query({
  args: {
    startDate: v.number(),
    endDate: v.number(),
  },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("income")
      .withIndex("by_date", (q) =>
        q.gte("date", args.startDate).lte("date", args.endDate)
      )
      .collect();
  },
});

export const add = mutation({
  args: {
    amount: v.number(),
    source: v.string(),
    date: v.number(),
    note: v.optional(v.string()),
    category: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("income", args);
  },
});

export const update = mutation({
  args: {
    id: v.id("income"),
    amount: v.optional(v.number()),
    source: v.optional(v.string()),
    date: v.optional(v.number()),
    note: v.optional(v.string()),
    category: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const { id, ...updates } = args;
    const cleanUpdates: Record<string, unknown> = {};
    for (const [k, val] of Object.entries(updates)) {
      if (val !== undefined) cleanUpdates[k] = val;
    }
    await ctx.db.patch(id, cleanUpdates);
  },
});

export const remove = mutation({
  args: { id: v.id("income") },
  handler: async (ctx, args) => {
    await ctx.db.delete(args.id);
  },
});
