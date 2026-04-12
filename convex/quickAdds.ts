import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

export const list = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db.query("quickAdds").collect();
  },
});

export const add = mutation({
  args: {
    label: v.string(),
    amount: v.number(),
    category: v.string(),
    icon: v.string(),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("quickAdds", args);
  },
});

export const remove = mutation({
  args: { id: v.id("quickAdds") },
  handler: async (ctx, args) => {
    await ctx.db.delete(args.id);
  },
});

// Use a quick-add to create an expense
export const useQuickAdd = mutation({
  args: { id: v.id("quickAdds") },
  handler: async (ctx, args) => {
    const quickAdd = await ctx.db.get(args.id);
    if (!quickAdd) throw new Error("Quick add not found");

    return await ctx.db.insert("expenses", {
      amount: quickAdd.amount,
      category: quickAdd.category,
      date: Date.now(),
      note: quickAdd.label,
      tags: ["quick-add"],
    });
  },
});
