import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

export const list = query({
  args: {
    category: v.optional(v.string()),
    startDate: v.optional(v.number()),
    endDate: v.optional(v.number()),
    search: v.optional(v.string()),
    sortBy: v.optional(
      v.union(v.literal("newest"), v.literal("oldest"), v.literal("highest"))
    ),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    let expenses;

    if (args.category && args.startDate && args.endDate) {
      expenses = await ctx.db
        .query("expenses")
        .withIndex("by_category_and_date", (q) =>
          q
            .eq("category", args.category!)
            .gte("date", args.startDate!)
            .lte("date", args.endDate!)
        )
        .collect();
    } else if (args.category) {
      expenses = await ctx.db
        .query("expenses")
        .withIndex("by_category", (q) => q.eq("category", args.category!))
        .collect();
    } else if (args.startDate && args.endDate) {
      expenses = await ctx.db
        .query("expenses")
        .withIndex("by_date", (q) =>
          q.gte("date", args.startDate!).lte("date", args.endDate!)
        )
        .collect();
    } else {
      expenses = await ctx.db.query("expenses").withIndex("by_date").collect();
    }

    // Client-side search filter
    if (args.search) {
      const s = args.search.toLowerCase();
      expenses = expenses.filter(
        (e) =>
          e.note?.toLowerCase().includes(s) ||
          e.category.toLowerCase().includes(s) ||
          e.tags?.some((t) => t.toLowerCase().includes(s)) ||
          e.amount.toString().includes(s)
      );
    }

    // Sort
    const sortBy = args.sortBy ?? "newest";
    if (sortBy === "newest") {
      expenses.sort((a, b) => b.date - a.date);
    } else if (sortBy === "oldest") {
      expenses.sort((a, b) => a.date - b.date);
    } else if (sortBy === "highest") {
      expenses.sort((a, b) => b.amount - a.amount);
    }

    if (args.limit) {
      expenses = expenses.slice(0, args.limit);
    }

    return expenses;
  },
});

export const get = query({
  args: { id: v.id("expenses") },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.id);
  },
});

export const getByDateRange = query({
  args: {
    startDate: v.number(),
    endDate: v.number(),
  },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("expenses")
      .withIndex("by_date", (q) =>
        q.gte("date", args.startDate).lte("date", args.endDate)
      )
      .collect();
  },
});

export const getTotalByCategory = query({
  args: {
    startDate: v.number(),
    endDate: v.number(),
  },
  handler: async (ctx, args) => {
    const expenses = await ctx.db
      .query("expenses")
      .withIndex("by_date", (q) =>
        q.gte("date", args.startDate).lte("date", args.endDate)
      )
      .collect();

    const totals: Record<string, number> = {};
    for (const exp of expenses) {
      totals[exp.category] = (totals[exp.category] ?? 0) + exp.amount;
    }
    return totals;
  },
});

export const add = mutation({
  args: {
    amount: v.number(),
    category: v.string(),
    date: v.number(),
    note: v.optional(v.string()),
    tags: v.optional(v.array(v.string())),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("expenses", args);
  },
});

export const update = mutation({
  args: {
    id: v.id("expenses"),
    amount: v.optional(v.number()),
    category: v.optional(v.string()),
    date: v.optional(v.number()),
    note: v.optional(v.string()),
    tags: v.optional(v.array(v.string())),
  },
  handler: async (ctx, args) => {
    const { id, ...updates } = args;
    // Remove undefined fields
    const cleanUpdates: Record<string, unknown> = {};
    for (const [k, val] of Object.entries(updates)) {
      if (val !== undefined) cleanUpdates[k] = val;
    }
    await ctx.db.patch(id, cleanUpdates);
  },
});

export const remove = mutation({
  args: { id: v.id("expenses") },
  handler: async (ctx, args) => {
    await ctx.db.delete(args.id);
  },
});
