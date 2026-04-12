import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  expenses: defineTable({
    amount: v.number(),
    category: v.string(),
    date: v.number(), // timestamp in ms
    note: v.optional(v.string()),
    tags: v.optional(v.array(v.string())),
  })
    .index("by_date", ["date"])
    .index("by_category", ["category"])
    .index("by_category_and_date", ["category", "date"]),

  income: defineTable({
    amount: v.number(),
    source: v.string(),
    date: v.number(),
    note: v.optional(v.string()),
    category: v.optional(v.string()),
  })
    .index("by_date", ["date"])
    .index("by_category", ["category"]),

  budgets: defineTable({
    category: v.string(),
    amount: v.number(),
    period: v.union(
      v.literal("weekly"),
      v.literal("monthly"),
      v.literal("custom")
    ),
    startDate: v.number(),
    endDate: v.number(),
  })
    .index("by_category", ["category"])
    .index("by_period", ["period"]),

  categories: defineTable({
    name: v.string(),
    icon: v.string(),
    color: v.string(),
    type: v.union(v.literal("expense"), v.literal("income")),
    isDefault: v.boolean(),
  }).index("by_type", ["type"]),

  quickAdds: defineTable({
    label: v.string(),
    amount: v.number(),
    category: v.string(),
    icon: v.string(),
  }),
});
