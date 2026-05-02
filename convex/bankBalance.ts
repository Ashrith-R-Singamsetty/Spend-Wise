import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

export const list = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db
      .query("bankBalance")
      .withIndex("by_date")
      .order("desc")
      .collect();
  },
});

export const getCurrentBalance = query({
  args: {},
  handler: async (ctx) => {
    // 1. Get the latest bank balance entry
    const latestBalanceEntry = await ctx.db
      .query("bankBalance")
      .withIndex("by_date")
      .order("desc")
      .first();

    if (!latestBalanceEntry) {
      return {
        currentBalance: 0,
        lastEntry: null,
        incomeSince: 0,
        expensesSince: 0,
      };
    }

    const sinceDate = latestBalanceEntry.date;

    // 2. Sum all income after that entry's date
    const incomeSince = await ctx.db
      .query("income")
      .withIndex("by_date", (q) => q.gte("date", sinceDate))
      .collect();
    
    const totalIncomeSince = incomeSince.reduce((sum, i) => sum + i.amount, 0);

    // 3. Sum all expenses after that entry's date
    const expensesSince = await ctx.db
      .query("expenses")
      .withIndex("by_date", (q) => q.gte("date", sinceDate))
      .collect();

    const totalExpensesSince = expensesSince.reduce((sum, e) => sum + e.amount, 0);

    // 4. Calculate current balance
    const currentBalance = latestBalanceEntry.amount + totalIncomeSince - totalExpensesSince;

    return {
      currentBalance,
      lastEntry: latestBalanceEntry,
      incomeSince: totalIncomeSince,
      expensesSince: totalExpensesSince,
    };
  },
});

export const add = mutation({
  args: {
    amount: v.number(),
    date: v.number(),
    note: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("bankBalance", args);
  },
});

export const update = mutation({
  args: {
    id: v.id("bankBalance"),
    amount: v.optional(v.number()),
    date: v.optional(v.number()),
    note: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const { id, ...updates } = args;
    const cleanUpdates: Record<string, string | number | undefined> = {};
    for (const [k, v] of Object.entries(updates)) {
      if (v !== undefined) cleanUpdates[k] = v;
    }
    await ctx.db.patch(id, cleanUpdates);
  },
});

export const remove = mutation({
  args: { id: v.id("bankBalance") },
  handler: async (ctx, args) => {
    await ctx.db.delete(args.id);
  },
});
