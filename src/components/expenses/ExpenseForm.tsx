"use client";

import { useState } from "react";
import { useMutation } from "convex/react";
import { api } from "../../../convex/_generated/api";
import type { Id } from "../../../convex/_generated/dataModel";
import { EXPENSE_CATEGORIES, CATEGORY_CONFIG } from "@/lib/constants";

interface ExpenseFormProps {
  onClose: () => void;
  initialData?: {
    id: Id<"expenses">;
    amount: number;
    category: string;
    date: number;
    note: string;
    tags: string[];
  };
}

export default function ExpenseForm({ onClose, initialData }: ExpenseFormProps) {
  const [amount, setAmount] = useState(initialData?.amount?.toString() ?? "");
  const [category, setCategory] = useState(initialData?.category ?? "");
  const [date, setDate] = useState(
    initialData
      ? new Date(initialData.date).toISOString().split("T")[0]
      : new Date().toISOString().split("T")[0]
  );
  const [note, setNote] = useState(initialData?.note ?? "");
  const [tagsInput, setTagsInput] = useState(initialData?.tags?.join(", ") ?? "");
  const [loading, setLoading] = useState(false);

  const addExpense = useMutation(api.expenses.add);
  const updateExpense = useMutation(api.expenses.update);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!amount || !category) return;

    setLoading(true);
    const tags = tagsInput
      .split(",")
      .map((t) => t.trim())
      .filter(Boolean);

    try {
      if (initialData) {
        await updateExpense({
          id: initialData.id,
          amount: parseFloat(amount),
          category,
          date: new Date(date).getTime(),
          note: note || undefined,
          tags: tags.length > 0 ? tags : undefined,
        });
      } else {
        await addExpense({
          amount: parseFloat(amount),
          category,
          date: new Date(date).getTime(),
          note: note || undefined,
          tags: tags.length > 0 ? tags : undefined,
        });
      }
      onClose();
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {/* Amount */}
      <div>
        <label className="block text-xs font-medium text-text-secondary mb-2">
          Amount (₹)
        </label>
        <input
          type="number"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          placeholder="0"
          className="w-full text-3xl font-bold bg-transparent border-b-2 border-border focus:border-accent-primary pb-2 outline-none transition-colors placeholder:text-text-muted/30"
          autoFocus
          required
        />
      </div>

      {/* Category Grid */}
      <div>
        <label className="block text-xs font-medium text-text-secondary mb-2">
          Category
        </label>
        <div className="grid grid-cols-3 gap-2">
          {EXPENSE_CATEGORIES.map((cat) => {
            const config = CATEGORY_CONFIG[cat] ?? CATEGORY_CONFIG["Other"];
            const isSelected = category === cat;
            return (
              <button
                type="button"
                key={cat}
                onClick={() => setCategory(cat)}
                className={`flex flex-col items-center gap-1 p-3 rounded-xl border transition-all ${
                  isSelected
                    ? "border-accent-primary bg-accent-primary/10"
                    : "border-border bg-bg-tertiary hover:border-border-light"
                }`}
              >
                <span className="text-xl">{config.icon}</span>
                <span className="text-[11px] font-medium text-center leading-tight">
                  {cat}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Date */}
      <div>
        <label className="block text-xs font-medium text-text-secondary mb-2">
          Date
        </label>
        <input
          type="date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
          className="w-full px-4 py-2.5 bg-bg-tertiary border border-border rounded-xl text-sm focus:outline-none focus:border-accent-primary/50 transition-colors"
        />
      </div>

      {/* Note */}
      <div>
        <label className="block text-xs font-medium text-text-secondary mb-2">
          Note
        </label>
        <input
          type="text"
          value={note}
          onChange={(e) => setNote(e.target.value)}
          placeholder="What was this for?"
          className="w-full px-4 py-2.5 bg-bg-tertiary border border-border rounded-xl text-sm focus:outline-none focus:border-accent-primary/50 transition-colors placeholder:text-text-muted"
        />
      </div>

      {/* Tags */}
      <div>
        <label className="block text-xs font-medium text-text-secondary mb-2">
          Tags (comma separated)
        </label>
        <input
          type="text"
          value={tagsInput}
          onChange={(e) => setTagsInput(e.target.value)}
          placeholder="food, personal, work"
          className="w-full px-4 py-2.5 bg-bg-tertiary border border-border rounded-xl text-sm focus:outline-none focus:border-accent-primary/50 transition-colors placeholder:text-text-muted"
        />
      </div>

      {/* Submit */}
      <button
        type="submit"
        disabled={!amount || !category || loading}
        className="w-full py-3 rounded-xl bg-accent-primary text-white font-semibold text-sm hover:brightness-110 transition-all disabled:opacity-40 disabled:cursor-not-allowed active:scale-[0.98]"
      >
        {loading
          ? "Saving..."
          : initialData
            ? "Update Expense"
            : "Add Expense"}
      </button>
    </form>
  );
}
