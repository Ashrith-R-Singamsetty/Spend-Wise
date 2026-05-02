"use client";

import { useState } from "react";
import { useMutation } from "convex/react";
import { api } from "../../../convex/_generated/api";
import type { Id } from "../../../convex/_generated/dataModel";

interface BankBalanceFormProps {
  onClose: () => void;
  initialData?: {
    id: Id<"bankBalance">;
    amount: number;
    date: number;
    note?: string;
  };
}

export default function BankBalanceForm({ onClose, initialData }: BankBalanceFormProps) {
  const [amount, setAmount] = useState(initialData?.amount?.toString() ?? "");
  const [date, setDate] = useState(
    initialData
      ? new Date(initialData.date).toISOString().split("T")[0]
      : new Date().toISOString().split("T")[0]
  );
  const [note, setNote] = useState(initialData?.note ?? "");
  const [loading, setLoading] = useState(false);

  const addBalance = useMutation(api.bankBalance.add);
  const updateBalance = useMutation(api.bankBalance.update);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!amount) return;

    setLoading(true);
    try {
      if (initialData) {
        await updateBalance({
          id: initialData.id,
          amount: parseFloat(amount),
          date: new Date(date).getTime(),
          note: note || undefined,
        });
      } else {
        await addBalance({
          amount: parseFloat(amount),
          date: new Date(date).getTime(),
          note: note || undefined,
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
          Bank Balance (₹)
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
        <p className="text-[10px] text-text-muted mt-2">
          Enter your actual bank balance. Income and expenses after this date will dynamically update it.
        </p>
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
          placeholder="e.g., Monthly opening balance"
          className="w-full px-4 py-2.5 bg-bg-tertiary border border-border rounded-xl text-sm focus:outline-none focus:border-accent-primary/50 transition-colors placeholder:text-text-muted"
        />
      </div>

      {/* Submit */}
      <button
        type="submit"
        disabled={!amount || loading}
        className="w-full py-3 rounded-xl bg-accent-primary text-white font-semibold text-sm hover:brightness-110 transition-all disabled:opacity-40 disabled:cursor-not-allowed active:scale-[0.98]"
      >
        {loading ? "Saving..." : initialData ? "Update Balance" : "Add Balance Entry"}
      </button>
    </form>
  );
}
