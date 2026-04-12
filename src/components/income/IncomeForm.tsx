"use client";

import { useState } from "react";
import { useMutation } from "convex/react";
import { api } from "../../../convex/_generated/api";
import type { Id } from "../../../convex/_generated/dataModel";
import { INCOME_CATEGORIES, CATEGORY_CONFIG } from "@/lib/constants";

interface IncomeFormProps {
  onClose: () => void;
  initialData?: {
    id: Id<"income">;
    amount: number;
    source: string;
    date: number;
    note: string;
    category: string;
  };
}

export default function IncomeForm({ onClose, initialData }: IncomeFormProps) {
  const [amount, setAmount] = useState(initialData?.amount?.toString() ?? "");
  const [source, setSource] = useState(initialData?.source ?? "");
  const [category, setCategory] = useState(initialData?.category ?? "");
  const [date, setDate] = useState(
    initialData
      ? new Date(initialData.date).toISOString().split("T")[0]
      : new Date().toISOString().split("T")[0]
  );
  const [note, setNote] = useState(initialData?.note ?? "");
  const [loading, setLoading] = useState(false);

  const addIncome = useMutation(api.income.add);
  const updateIncome = useMutation(api.income.update);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!amount || !source || !category) return;

    setLoading(true);
    try {
      if (initialData) {
        await updateIncome({
          id: initialData.id,
          amount: parseFloat(amount),
          source,
          date: new Date(date).getTime(),
          note: note || undefined,
          category: category || undefined,
        });
      } else {
        await addIncome({
          amount: parseFloat(amount),
          source,
          date: new Date(date).getTime(),
          note: note || undefined,
          category: category || undefined,
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
          className="w-full text-3xl font-bold bg-transparent border-b-2 border-border focus:border-accent-success pb-2 outline-none transition-colors placeholder:text-text-muted/30"
          autoFocus
          required
        />
      </div>

      {/* Source */}
      <div>
        <label className="block text-xs font-medium text-text-secondary mb-2">
          Source
        </label>
        <input
          type="text"
          value={source}
          onChange={(e) => setSource(e.target.value)}
          placeholder="e.g., Acme Corp, Freelance"
          className="w-full px-4 py-2.5 bg-bg-tertiary border border-border rounded-xl text-sm focus:outline-none focus:border-accent-success/50 transition-colors placeholder:text-text-muted"
          required
        />
      </div>

      {/* Category */}
      <div>
        <label className="block text-xs font-medium text-text-secondary mb-2">
          Category
        </label>
        <div className="grid grid-cols-3 gap-2">
          {INCOME_CATEGORIES.map((cat) => {
            const config = CATEGORY_CONFIG[cat] ?? CATEGORY_CONFIG["Other"];
            const isSelected = category === cat;
            return (
              <button
                type="button"
                key={cat}
                onClick={() => setCategory(cat)}
                className={`flex flex-col items-center gap-1 p-3 rounded-xl border transition-all ${
                  isSelected
                    ? "border-accent-success bg-accent-success/10"
                    : "border-border bg-bg-tertiary hover:border-border-light"
                }`}
              >
                <span className="text-xl">{config.icon}</span>
                <span className="text-[11px] font-medium">{cat}</span>
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
          className="w-full px-4 py-2.5 bg-bg-tertiary border border-border rounded-xl text-sm focus:outline-none focus:border-accent-success/50 transition-colors"
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
          placeholder="Additional details"
          className="w-full px-4 py-2.5 bg-bg-tertiary border border-border rounded-xl text-sm focus:outline-none focus:border-accent-success/50 transition-colors placeholder:text-text-muted"
        />
      </div>

      {/* Submit */}
      <button
        type="submit"
        disabled={!amount || !source || !category || loading}
        className="w-full py-3 rounded-xl bg-accent-success text-white font-semibold text-sm hover:brightness-110 transition-all disabled:opacity-40 disabled:cursor-not-allowed active:scale-[0.98]"
      >
        {loading ? "Saving..." : initialData ? "Update Income" : "Add Income"}
      </button>
    </form>
  );
}
