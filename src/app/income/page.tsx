"use client";

import { useMemo, useState } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../../convex/_generated/api";
import type { Id } from "../../../convex/_generated/dataModel";
import { CATEGORY_CONFIG } from "@/lib/constants";
import { formatCurrency, formatRelative, getMonthRange, groupByDate } from "@/lib/utils";
import { Plus, Trash2, Edit3, TrendingUp } from "lucide-react";
import Modal from "@/components/ui/Modal";
import IncomeForm from "@/components/income/IncomeForm";
import Header from "@/components/layout/Header";

export default function IncomePage() {
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [editingId, setEditingId] = useState<Id<"income"> | null>(null);

  const income = useQuery(api.income.list, {});
  const removeIncome = useMutation(api.income.remove);

  const editingEntry = useMemo(() => {
    if (!editingId || !income) return null;
    return income.find((i) => i._id === editingId) ?? null;
  }, [editingId, income]);

  const grouped = useMemo(() => {
    if (!income) return [];
    return groupByDate(income);
  }, [income]);

  const totalThisMonth = useMemo(() => {
    if (!income) return 0;
    const { startDate, endDate } = getMonthRange();
    return income
      .filter((i) => i.date >= startDate && i.date <= endDate)
      .reduce((s, i) => s + i.amount, 0);
  }, [income]);

  return (
    <div className="animate-fade-in">
      <Header
        title="Income"
        subtitle={`${formatCurrency(totalThisMonth)} this month`}
        action={
          <button
            onClick={() => setIsAddOpen(true)}
            className="w-10 h-10 rounded-xl bg-accent-success text-white flex items-center justify-center hover:brightness-110 transition-all active:scale-95"
          >
            <Plus size={20} />
          </button>
        }
      />

      {/* Income List */}
      <div className="space-y-6 pb-24">
        {!income ? (
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-16 bg-bg-secondary rounded-xl animate-pulse" />
            ))}
          </div>
        ) : income.length === 0 ? (
          <div className="text-center py-16">
            <div className="text-4xl mb-3">💰</div>
            <p className="text-text-secondary text-sm">
              No income recorded yet. Add your first entry!
            </p>
          </div>
        ) : (
          grouped.map((group) => (
            <div key={group.date}>
              <h3 className="text-xs font-semibold text-text-muted uppercase tracking-wider mb-2 px-1">
                {group.date}
              </h3>
              <div className="space-y-2">
                {group.items.map((entry) => {
                  const cat = CATEGORY_CONFIG[entry.category ?? "Other"] ?? CATEGORY_CONFIG["Other"];
                  return (
                    <div
                      key={entry._id}
                      className="flex items-center gap-3 p-3 bg-bg-secondary rounded-xl border border-border hover:border-border-light transition-all hover-lift group"
                    >
                      <div
                        className="w-10 h-10 rounded-xl flex items-center justify-center text-lg shrink-0"
                        style={{ backgroundColor: cat.color + "15" }}
                      >
                        {cat.icon}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">
                          {entry.source}
                        </p>
                        <p className="text-xs text-text-muted">
                          {entry.category ?? "Other"} • {formatRelative(entry.date)}
                        </p>
                      </div>
                      <div className="text-right shrink-0">
                        <p className="text-sm font-semibold text-accent-success flex items-center gap-1">
                          <TrendingUp size={12} />
                          +{formatCurrency(entry.amount)}
                        </p>
                        {entry.note && (
                          <p className="text-[10px] text-text-muted mt-0.5 truncate max-w-[120px]">
                            {entry.note}
                          </p>
                        )}
                      </div>
                      {/* Actions */}
                      <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button
                          onClick={() => setEditingId(entry._id)}
                          className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-bg-tertiary text-text-muted hover:text-text-primary transition-colors"
                        >
                          <Edit3 size={14} />
                        </button>
                        <button
                          onClick={() => removeIncome({ id: entry._id })}
                          className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-accent-danger/10 text-text-muted hover:text-accent-danger transition-colors"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ))
        )}
      </div>

      {/* Add Modal */}
      <Modal isOpen={isAddOpen} onClose={() => setIsAddOpen(false)} title="Add Income">
        <IncomeForm onClose={() => setIsAddOpen(false)} />
      </Modal>

      {/* Edit Modal */}
      <Modal
        isOpen={!!editingId}
        onClose={() => setEditingId(null)}
        title="Edit Income"
      >
        {editingEntry && (
          <IncomeForm
            onClose={() => setEditingId(null)}
            initialData={{
              id: editingEntry._id,
              amount: editingEntry.amount,
              source: editingEntry.source,
              date: editingEntry.date,
              note: editingEntry.note ?? "",
              category: editingEntry.category ?? "",
            }}
          />
        )}
      </Modal>
    </div>
  );
}
