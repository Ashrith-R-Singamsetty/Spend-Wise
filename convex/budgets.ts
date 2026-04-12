import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

export const list = query({
  args: {
    period: v.optional(
      v.union(
        v.literal("weekly"),
        v.literal("monthly"),
        v.literal("custom")
      )
    ),
  },
  handler: async (ctx, args) => {
    if (args.period) {
      return await ctx.db
        .query("budgets")
        .withIndex("by_period", (q) => q.eq("period", args.period!))
        .collect();
    }
    return await ctx.db.query("budgets").collect();
  },
});

export const getWithSpending = query({
  args: {
    startDate: v.number(),
    endDate: v.number(),
  },
  handler: async (ctx, args) => {
    const budgets = await ctx.db.query("budgets").collect();
    const expenses = await ctx.db
      .query("expenses")
      .withIndex("by_date", (q) =>
        q.gte("date", args.startDate).lte("date", args.endDate)
      )
      .collect();

    // Calculate spending per category
    const spendingByCategory: Record<string, number> = {};
    for (const exp of expenses) {
      spendingByCategory[exp.category] =
        (spendingByCategory[exp.category] ?? 0) + exp.amount;
    }

    return budgets.map((budget) => ({
      ...budget,
      spent: spendingByCategory[budget.category] ?? 0,
      remaining: budget.amount - (spendingByCategory[budget.category] ?? 0),
      percentage: Math.min(
        100,
        Math.round(
          ((spendingByCategory[budget.category] ?? 0) / budget.amount) * 100
        )
      ),
    }));
  },
});

export const add = mutation({
  args: {
    category: v.string(),
    amount: v.number(),
    period: v.union(
      v.literal("weekly"),
      v.literal("monthly"),
      v.literal("custom")
    ),
    startDate: v.number(),
    endDate: v.number(),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("budgets", args);
  },
});

export const update = mutation({
  args: {
    id: v.id("budgets"),
    category: v.optional(v.string()),
    amount: v.optional(v.number()),
    period: v.optional(
      v.union(
        v.literal("weekly"),
        v.literal("monthly"),
        v.literal("custom")
      )
    ),
    startDate: v.optional(v.number()),
    endDate: v.optional(v.number()),
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
  args: { id: v.id("budgets") },
  handler: async (ctx, args) => {
    await ctx.db.delete(args.id);
  },
});
