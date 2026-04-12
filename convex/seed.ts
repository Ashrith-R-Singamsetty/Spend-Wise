import { mutation } from "./_generated/server";

export const seed = mutation({
  args: {},
  handler: async (ctx) => {
    // Check if already seeded
    const existing = await ctx.db.query("categories").first();
    if (existing) return "Already seeded";

    // --- Categories ---
    const expenseCategories = [
      { name: "Food & Dining", icon: "🍕", color: "#f97316" },
      { name: "Transport", icon: "🚗", color: "#3b82f6" },
      { name: "Entertainment", icon: "🎬", color: "#a855f7" },
      { name: "Bills & Utilities", icon: "💡", color: "#eab308" },
      { name: "Shopping", icon: "🛍️", color: "#ec4899" },
      { name: "Health", icon: "💊", color: "#22c55e" },
      { name: "Education", icon: "📚", color: "#06b6d4" },
      { name: "Travel", icon: "✈️", color: "#14b8a6" },
      { name: "Groceries", icon: "🛒", color: "#84cc16" },
      { name: "Other", icon: "📌", color: "#6b7280" },
    ];

    for (const cat of expenseCategories) {
      await ctx.db.insert("categories", {
        ...cat,
        type: "expense",
        isDefault: true,
      });
    }

    const incomeCategories = [
      { name: "Salary", icon: "💰", color: "#22c55e" },
      { name: "Freelance", icon: "💻", color: "#3b82f6" },
      { name: "Investment", icon: "📈", color: "#a855f7" },
      { name: "Gift", icon: "🎁", color: "#ec4899" },
      { name: "Other", icon: "📌", color: "#6b7280" },
    ];

    for (const cat of incomeCategories) {
      await ctx.db.insert("categories", {
        ...cat,
        type: "income",
        isDefault: true,
      });
    }

    // --- Quick Adds ---
    const quickAdds = [
      { label: "Coffee", amount: 150, category: "Food & Dining", icon: "☕" },
      { label: "Uber", amount: 300, category: "Transport", icon: "🚕" },
      { label: "Lunch", amount: 250, category: "Food & Dining", icon: "🍱" },
      { label: "Groceries", amount: 1200, category: "Groceries", icon: "🛒" },
      { label: "Netflix", amount: 649, category: "Entertainment", icon: "📺" },
      { label: "Gym", amount: 1500, category: "Health", icon: "🏋️" },
    ];

    for (const qa of quickAdds) {
      await ctx.db.insert("quickAdds", qa);
    }

    return "Seed complete!";
  },
});
