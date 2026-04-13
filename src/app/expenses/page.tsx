"use client";

import { useMemo, useState } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../../convex/_generated/api";
import type { Id } from "../../../convex/_generated/dataModel";
import { CATEGORY_CONFIG } from "@/lib/constants";
import { formatCurrency, formatRelative } from "@/lib/utils";
import { Plus, Search, Trash2, Edit3, SlidersHorizontal, ArrowUpDown } from "lucide-react";
import Modal from "@/components/ui/Modal";
import ExpenseForm from "@/components/expenses/ExpenseForm";
import Header from "@/components/layout/Header";
import { getMonthRange, groupByDate } from "@/lib/utils";

export default function ExpensesPage() {
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [editingId, setEditingId] = useState<Id<"expenses"> | null>(null);
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<string | undefined>();
  const [sortBy, setSortBy] = useState<"newest" | "oldest" | "highest">("newest");
  const [showFilters, setShowFilters] = useState(false);

  const expenses = useQuery(api.expenses.list, {
    search: search || undefined,
    category: categoryFilter,
    sortBy,
  });

  const categories = useQuery(api.categories.list, { type: "expense" });
  const quickAdds = useQuery(api.quickAdds.list);
  const removeExpense = useMutation(api.expenses.remove);
  const triggerQuickAdd = useMutation(api.quickAdds.useQuickAdd);

  const editingExpense = useMemo(() => {
    if (!editingId || !expenses) return null;
    return expenses.find((e) => e._id === editingId) ?? null;
  }, [editingId, expenses]);

  const grouped = useMemo(() => {
    if (!expenses) return [];
    return groupByDate(expenses);
  }, [expenses]);

  const totalThisMonth = useMemo(() => {
    if (!expenses) return 0;
    const { startDate, endDate } = getMonthRange();
    return expenses
      .filter((e) => e.date >= startDate && e.date <= endDate)
      .reduce((s, e) => s + e.amount, 0);
  }, [expenses]);

  return (
    <div className="animate-fade-in">
      <Header
        title="Expenses"
        subtitle={`${formatCurrency(totalThisMonth)} this month`}
        action={
          <button
            onClick={() => setIsAddOpen(true)}
            className="w-10 h-10 rounded-xl bg-accent-primary text-white flex items-center justify-center hover:brightness-110 transition-all active:scale-95"
          >
            <Plus size={20} />
          </button>
        }
      />

      {/* Quick Adds */}
      {quickAdds && quickAdds.length > 0 && (
        <div className="mb-4 -mx-1 px-1">
          <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
            {quickAdds.map((qa) => (
              <button
                key={qa._id}
                onClick={() => triggerQuickAdd({ id: qa._id })}
                className="shrink-0 flex items-center gap-2 px-3 py-2 rounded-xl bg-bg-secondary border border-border hover:border-accent-primary/40 transition-all active:scale-95"
              >
                <span className="text-base">{qa.icon}</span>
                <span className="text-sm font-medium whitespace-nowrap">{qa.label}</span>
                <span className="text-xs text-text-secondary">
                  {formatCurrency(qa.amount)}
                </span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Search & Filters */}
      <div className="mb-4 space-y-3">
        <div className="flex gap-2">
          <div className="flex-1 relative">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" />
            <input
              type="text"
              placeholder="Search expenses..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2.5 bg-bg-secondary border border-border rounded-xl text-sm focus:outline-none focus:border-accent-primary/50 transition-colors placeholder:text-text-muted"
            />
          </div>
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`w-10 h-10 flex items-center justify-center rounded-xl border transition-colors ${
              showFilters || categoryFilter
                ? "bg-accent-primary/10 border-accent-primary/40 text-accent-primary"
                : "bg-bg-secondary border-border text-text-secondary hover:text-text-primary"
            }`}
          >
            <SlidersHorizontal size={16} />
          </button>
          <button
            onClick={() =>
              setSortBy((s) =>
                s === "newest" ? "oldest" : s === "oldest" ? "highest" : "newest"
              )
            }
            className="w-10 h-10 flex items-center justify-center rounded-xl bg-bg-secondary border border-border text-text-secondary hover:text-text-primary transition-colors"
            title={`Sort: ${sortBy}`}
          >
            <ArrowUpDown size={16} />
          </button>
        </div>

        {/* Filter chips */}
        {showFilters && (
          <div className="flex flex-wrap gap-2 animate-fade-in">
            <button
              onClick={() => setCategoryFilter(undefined)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                !categoryFilter
                  ? "bg-accent-primary text-white"
                  : "bg-bg-tertiary text-text-secondary hover:text-text-primary"
              }`}
            >
              All
            </button>
            {categories?.map((cat) => (
              <button
                key={cat._id}
                onClick={() =>
                  setCategoryFilter(
                    categoryFilter === cat.name ? undefined : cat.name
                  )
                }
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors flex items-center gap-1 ${
                  categoryFilter === cat.name
                    ? "bg-accent-primary text-white"
                    : "bg-bg-tertiary text-text-secondary hover:text-text-primary"
                }`}
              >
                <span>{cat.icon}</span>
                {cat.name}
              </button>
            ))}
          </div>
        )}

        {/* Active sort indicator */}
        <div className="flex items-center gap-1 text-xs text-text-muted">
          <ArrowUpDown size={12} />
          <span>
            {sortBy === "newest"
              ? "Newest first"
              : sortBy === "oldest"
                ? "Oldest first"
                : "Highest amount"}
          </span>
          {categoryFilter && (
            <>
              <span className="mx-1">•</span>
              <span className="text-accent-primary">{categoryFilter}</span>
              <button
                onClick={() => setCategoryFilter(undefined)}
                className="ml-1 text-text-muted hover:text-text-primary"
              >
                ×
              </button>
            </>
          )}
        </div>
      </div>

      {/* Expense List */}
      <div className="space-y-6 pb-24">
        {!expenses ? (
          <div className="space-y-3">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="h-16 bg-bg-secondary rounded-xl animate-pulse" />
            ))}
          </div>
        ) : expenses.length === 0 ? (
          <div className="text-center py-16">
            <div className="text-4xl mb-3">💸</div>
            <p className="text-text-secondary text-sm">
              No expenses found. Start tracking!
            </p>
          </div>
        ) : (
          grouped.map((group) => {
            const dailyTotal = group.items.reduce((sum, item) => sum + item.amount, 0);
            return (
              <div key={group.date}>
                <div className="flex items-center justify-between mb-2 px-1">
                  <h3 className="text-xs font-semibold text-text-muted uppercase tracking-wider">
                    {group.date}
                  </h3>
                  <span className="text-xs font-semibold text-text-muted">
                    {formatCurrency(dailyTotal)}
                  </span>
                </div>
                <div className="space-y-2">
                  {group.items.map((expense) => {
                  const cat = CATEGORY_CONFIG[expense.category] ?? CATEGORY_CONFIG["Other"];
                  return (
                    <div
                      key={expense._id}
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
                          {expense.note || expense.category}
                        </p>
                        <p className="text-xs text-text-muted">
                          {expense.category} • {formatRelative(expense.date)}
                        </p>
                      </div>
                      <div className="text-right shrink-0">
                        <p className="text-sm font-semibold text-accent-danger">
                          -{formatCurrency(expense.amount)}
                        </p>
                        {expense.tags && expense.tags.length > 0 && (
                          <div className="flex gap-1 mt-0.5 justify-end">
                            {expense.tags.slice(0, 2).map((tag) => (
                              <span
                                key={tag}
                                className="text-[10px] px-1.5 py-0.5 rounded-full bg-bg-tertiary text-text-muted"
                              >
                                {tag}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                      {/* Actions */}
                      <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button
                          onClick={() => setEditingId(expense._id)}
                          className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-bg-tertiary text-text-muted hover:text-text-primary transition-colors"
                        >
                          <Edit3 size={14} />
                        </button>
                        <button
                          onClick={() => removeExpense({ id: expense._id })}
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
            );
          })
        )}
      </div>

      {/* Add Modal */}
      <Modal isOpen={isAddOpen} onClose={() => setIsAddOpen(false)} title="Add Expense">
        <ExpenseForm onClose={() => setIsAddOpen(false)} />
      </Modal>

      {/* Edit Modal */}
      <Modal
        isOpen={!!editingId}
        onClose={() => setEditingId(null)}
        title="Edit Expense"
      >
        {editingExpense && (
          <ExpenseForm
            onClose={() => setEditingId(null)}
            initialData={{
              id: editingExpense._id,
              amount: editingExpense.amount,
              category: editingExpense.category,
              date: editingExpense.date,
              note: editingExpense.note ?? "",
              tags: editingExpense.tags ?? [],
            }}
          />
        )}
      </Modal>
    </div>
  );
}
