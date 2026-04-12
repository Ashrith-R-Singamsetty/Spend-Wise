import { query } from "./_generated/server";
import { v } from "convex/values";

export const getMonthSummary = query({
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

    const incomeEntries = await ctx.db
      .query("income")
      .withIndex("by_date", (q) =>
        q.gte("date", args.startDate).lte("date", args.endDate)
      )
      .collect();

    const totalExpenses = expenses.reduce((sum, e) => sum + e.amount, 0);
    const totalIncome = incomeEntries.reduce((sum, i) => sum + i.amount, 0);
    const netCashFlow = totalIncome - totalExpenses;
    const savingsRate = totalIncome > 0 ? Math.round((netCashFlow / totalIncome) * 100) : 0;

    const dayMs = 1000 * 60 * 60 * 24;
    const days = Math.max(1, Math.ceil((args.endDate - args.startDate) / dayMs));
    const avgDailySpending = Math.round(totalExpenses / days);

    return {
      totalExpenses,
      totalIncome,
      netCashFlow,
      savingsRate,
      avgDailySpending,
      expenseCount: expenses.length,
      incomeCount: incomeEntries.length,
    };
  },
});

export const getCategoryBreakdown = query({
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
    const total = expenses.reduce((sum, e) => sum + e.amount, 0);

    for (const exp of expenses) {
      totals[exp.category] = (totals[exp.category] ?? 0) + exp.amount;
    }

    return Object.entries(totals)
      .map(([category, amount]) => ({
        category,
        amount,
        percentage: total > 0 ? Math.round((amount / total) * 100) : 0,
      }))
      .sort((a, b) => b.amount - a.amount);
  },
});

export const getMonthComparison = query({
  args: {
    currentStart: v.number(),
    currentEnd: v.number(),
    previousStart: v.number(),
    previousEnd: v.number(),
  },
  handler: async (ctx, args) => {
    const currentExpenses = await ctx.db
      .query("expenses")
      .withIndex("by_date", (q) =>
        q.gte("date", args.currentStart).lte("date", args.currentEnd)
      )
      .collect();

    const previousExpenses = await ctx.db
      .query("expenses")
      .withIndex("by_date", (q) =>
        q.gte("date", args.previousStart).lte("date", args.previousEnd)
      )
      .collect();

    const currentTotal = currentExpenses.reduce((s, e) => s + e.amount, 0);
    const previousTotal = previousExpenses.reduce((s, e) => s + e.amount, 0);

    // Category deltas
    const currentByCategory: Record<string, number> = {};
    const previousByCategory: Record<string, number> = {};

    for (const e of currentExpenses) {
      currentByCategory[e.category] = (currentByCategory[e.category] ?? 0) + e.amount;
    }
    for (const e of previousExpenses) {
      previousByCategory[e.category] = (previousByCategory[e.category] ?? 0) + e.amount;
    }

    const allCategories = new Set([
      ...Object.keys(currentByCategory),
      ...Object.keys(previousByCategory),
    ]);

    const categoryDeltas = Array.from(allCategories).map((category) => ({
      category,
      current: currentByCategory[category] ?? 0,
      previous: previousByCategory[category] ?? 0,
      delta: (currentByCategory[category] ?? 0) - (previousByCategory[category] ?? 0),
    }));

    return {
      currentTotal,
      previousTotal,
      delta: currentTotal - previousTotal,
      percentageChange:
        previousTotal > 0
          ? Math.round(((currentTotal - previousTotal) / previousTotal) * 100)
          : 0,
      categoryDeltas: categoryDeltas.sort(
        (a, b) => Math.abs(b.delta) - Math.abs(a.delta)
      ),
    };
  },
});

export const getTrends = query({
  args: {
    months: v.number(), // how many months back
  },
  handler: async (ctx, args) => {
    const now = new Date();
    const results = [];

    for (let i = args.months - 1; i >= 0; i--) {
      const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const startDate = date.getTime();
      const endDate = new Date(date.getFullYear(), date.getMonth() + 1, 0, 23, 59, 59, 999).getTime();

      const expenses = await ctx.db
        .query("expenses")
        .withIndex("by_date", (q) =>
          q.gte("date", startDate).lte("date", endDate)
        )
        .collect();

      const incomeEntries = await ctx.db
        .query("income")
        .withIndex("by_date", (q) =>
          q.gte("date", startDate).lte("date", endDate)
        )
        .collect();

      const monthNames = [
        "Jan", "Feb", "Mar", "Apr", "May", "Jun",
        "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
      ];

      results.push({
        month: monthNames[date.getMonth()],
        year: date.getFullYear(),
        expenses: expenses.reduce((s, e) => s + e.amount, 0),
        income: incomeEntries.reduce((s, i) => s + i.amount, 0),
      });
    }

    return results;
  },
});
