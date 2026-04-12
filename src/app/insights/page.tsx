"use client";

import { useState } from "react";
import { useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { CATEGORY_CONFIG, CHART_COLORS } from "@/lib/constants";
import { formatCurrency, getMonthRange, getPreviousMonthRange } from "@/lib/utils";
import Header from "@/components/layout/Header";
import {
  TrendingUp,
  TrendingDown,
  ArrowUpRight,
  ArrowDownRight,
  Minus,
  PiggyBank,
  Calendar,
} from "lucide-react";
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  LineChart,
  Line,
  CartesianGrid,
} from "recharts";

const PERIOD_OPTIONS = [
  { label: "This Month", months: 1 },
  { label: "3 Months", months: 3 },
  { label: "6 Months", months: 6 },
  { label: "1 Year", months: 12 },
];

export default function InsightsPage() {
  const [period, setPeriod] = useState(0);
  const { startDate, endDate } = getMonthRange();
  const { startDate: prevStart, endDate: prevEnd } = getPreviousMonthRange();

  const summary = useQuery(api.insights.getMonthSummary, { startDate, endDate });
  const breakdown = useQuery(api.insights.getCategoryBreakdown, {
    startDate,
    endDate,
  });
  const comparison = useQuery(api.insights.getMonthComparison, {
    currentStart: startDate,
    currentEnd: endDate,
    previousStart: prevStart,
    previousEnd: prevEnd,
  });
  const trends = useQuery(api.insights.getTrends, {
    months: PERIOD_OPTIONS[period].months,
  });

  return (
    <div className="animate-fade-in">
      <Header title="Insights" subtitle="Understand your spending" />

      {/* Period Selector */}
      <div className="flex gap-2 mb-6 overflow-x-auto pb-1">
        {PERIOD_OPTIONS.map((opt, i) => (
          <button
            key={opt.label}
            onClick={() => setPeriod(i)}
            className={`px-4 py-2 rounded-xl text-xs font-medium whitespace-nowrap transition-all ${
              period === i
                ? "bg-accent-primary text-white"
                : "bg-bg-secondary text-text-secondary hover:text-text-primary border border-border"
            }`}
          >
            {opt.label}
          </button>
        ))}
      </div>

      {/* Summary Stats */}
      {summary && (
        <div className="grid grid-cols-2 gap-3 mb-6">
          <StatCard
            label="Total Income"
            value={formatCurrency(summary.totalIncome)}
            icon={<TrendingUp size={16} />}
            color="text-accent-success"
            bgColor="bg-accent-success/10"
          />
          <StatCard
            label="Total Expenses"
            value={formatCurrency(summary.totalExpenses)}
            icon={<TrendingDown size={16} />}
            color="text-accent-danger"
            bgColor="bg-accent-danger/10"
          />
          <StatCard
            label="Net Cash Flow"
            value={formatCurrency(summary.netCashFlow)}
            icon={summary.netCashFlow >= 0 ? <ArrowUpRight size={16} /> : <ArrowDownRight size={16} />}
            color={summary.netCashFlow >= 0 ? "text-accent-success" : "text-accent-danger"}
            bgColor={summary.netCashFlow >= 0 ? "bg-accent-success/10" : "bg-accent-danger/10"}
          />
          <StatCard
            label="Savings Rate"
            value={`${summary.savingsRate}%`}
            icon={<PiggyBank size={16} />}
            color={summary.savingsRate > 0 ? "text-accent-primary" : "text-accent-danger"}
            bgColor="bg-accent-primary/10"
          />
          <StatCard
            label="Avg Daily Spend"
            value={formatCurrency(summary.avgDailySpending)}
            icon={<Calendar size={16} />}
            color="text-accent-warning"
            bgColor="bg-accent-warning/10"
          />
          <StatCard
            label="Transactions"
            value={`${summary.expenseCount + summary.incomeCount}`}
            icon={<Minus size={16} />}
            color="text-accent-secondary"
            bgColor="bg-accent-secondary/10"
          />
        </div>
      )}

      {/* Category Breakdown - Pie Chart */}
      {breakdown && breakdown.length > 0 && (
        <div className="mb-6 p-5 bg-bg-secondary rounded-2xl border border-border">
          <h3 className="text-sm font-semibold mb-4">Spending by Category</h3>
          <div className="flex flex-col md:flex-row items-center gap-6">
            <div className="w-48 h-48">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={breakdown}
                    cx="50%"
                    cy="50%"
                    innerRadius={55}
                    outerRadius={80}
                    paddingAngle={3}
                    dataKey="amount"
                    nameKey="category"
                    strokeWidth={0}
                  >
                    {breakdown.map((_, i) => (
                      <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />
                    ))}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="flex-1 space-y-2">
              {breakdown.map((item, i) => {
                const cat = CATEGORY_CONFIG[item.category];
                return (
                  <div key={item.category} className="flex items-center gap-3">
                    <div
                      className="w-3 h-3 rounded-full shrink-0"
                      style={{ backgroundColor: CHART_COLORS[i % CHART_COLORS.length] }}
                    />
                    <span className="text-sm shrink-0">{cat?.icon ?? "📌"}</span>
                    <span className="text-xs text-text-secondary flex-1 truncate">
                      {item.category}
                    </span>
                    <span className="text-xs font-medium">
                      {formatCurrency(item.amount)}
                    </span>
                    <span className="text-[10px] text-text-muted w-8 text-right">
                      {item.percentage}%
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* Trend Chart */}
      {trends && trends.length > 1 && (
        <div className="mb-6 p-5 bg-bg-secondary rounded-2xl border border-border">
          <h3 className="text-sm font-semibold mb-4">Income vs Expenses Trend</h3>
          <div className="h-56">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={trends} barGap={4}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(230, 15%, 20%)" />
                <XAxis
                  dataKey="month"
                  tick={{ fontSize: 11, fill: "hsl(230, 15%, 60%)" }}
                  tickLine={false}
                  axisLine={false}
                />
                <YAxis
                  tick={{ fontSize: 11, fill: "hsl(230, 15%, 60%)" }}
                  tickLine={false}
                  axisLine={false}
                  tickFormatter={(v) => `₹${(v / 1000).toFixed(0)}k`}
                />
                <Tooltip
                  contentStyle={{
                    background: "hsl(230, 20%, 12%)",
                    border: "1px solid hsl(230, 15%, 20%)",
                    borderRadius: "12px",
                    fontSize: "12px",
                    color: "hsl(0, 0%, 95%)",
                  }}
                  formatter={(value) => [formatCurrency(Number(value))]}
                />
                <Bar dataKey="income" name="Income" fill="#34d399" radius={[6, 6, 0, 0]} />
                <Bar dataKey="expenses" name="Expenses" fill="#a855f7" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {/* Spending Trend Line */}
      {trends && trends.length > 1 && (
        <div className="mb-6 p-5 bg-bg-secondary rounded-2xl border border-border">
          <h3 className="text-sm font-semibold mb-4">Spending Trend</h3>
          <div className="h-48">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={trends}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(230, 15%, 20%)" />
                <XAxis
                  dataKey="month"
                  tick={{ fontSize: 11, fill: "hsl(230, 15%, 60%)" }}
                  tickLine={false}
                  axisLine={false}
                />
                <YAxis
                  tick={{ fontSize: 11, fill: "hsl(230, 15%, 60%)" }}
                  tickLine={false}
                  axisLine={false}
                  tickFormatter={(v) => `₹${(v / 1000).toFixed(0)}k`}
                />
                <Tooltip
                  contentStyle={{
                    background: "hsl(230, 20%, 12%)",
                    border: "1px solid hsl(230, 15%, 20%)",
                    borderRadius: "12px",
                    fontSize: "12px",
                    color: "hsl(0, 0%, 95%)",
                  }}
                  formatter={(value) => [formatCurrency(Number(value))]}
                />
                <Line
                  type="monotone"
                  dataKey="expenses"
                  stroke="#a855f7"
                  strokeWidth={2.5}
                  dot={{ fill: "#a855f7", r: 4, strokeWidth: 0 }}
                  activeDot={{ r: 6, strokeWidth: 0 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {/* Month Comparison */}
      {comparison && (
        <div className="mb-6 p-5 bg-bg-secondary rounded-2xl border border-border">
          <h3 className="text-sm font-semibold mb-1">What Changed This Month?</h3>
          <p className="text-xs text-text-muted mb-4">vs. last month</p>

          <div className="flex items-center gap-4 mb-4 p-3 rounded-xl bg-bg-tertiary">
            <div className="flex-1">
              <p className="text-xs text-text-muted">Last Month</p>
              <p className="text-lg font-bold">{formatCurrency(comparison.previousTotal)}</p>
            </div>
            <div className={`flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-semibold ${
              comparison.delta > 0
                ? "bg-accent-danger/10 text-accent-danger"
                : "bg-accent-success/10 text-accent-success"
            }`}>
              {comparison.delta > 0 ? <ArrowUpRight size={14} /> : <ArrowDownRight size={14} />}
              {Math.abs(comparison.percentageChange)}%
            </div>
            <div className="flex-1 text-right">
              <p className="text-xs text-text-muted">This Month</p>
              <p className="text-lg font-bold">{formatCurrency(comparison.currentTotal)}</p>
            </div>
          </div>

          {/* Category Deltas */}
          <div className="space-y-2">
            {comparison.categoryDeltas.slice(0, 5).map((delta) => {
              const cat = CATEGORY_CONFIG[delta.category] ?? CATEGORY_CONFIG["Other"];
              return (
                <div key={delta.category} className="flex items-center gap-3">
                  <span className="text-sm">{cat.icon}</span>
                  <span className="text-xs text-text-secondary flex-1 truncate">
                    {delta.category}
                  </span>
                  <span
                    className={`text-xs font-medium ${
                      delta.delta > 0 ? "text-accent-danger" : "text-accent-success"
                    }`}
                  >
                    {delta.delta > 0 ? "+" : ""}
                    {formatCurrency(delta.delta)}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      <div className="pb-24" />
    </div>
  );
}

function StatCard({
  label,
  value,
  icon,
  color,
  bgColor,
}: {
  label: string;
  value: string;
  icon: React.ReactNode;
  color: string;
  bgColor: string;
}) {
  return (
    <div className="p-4 bg-bg-secondary rounded-xl border border-border hover-lift">
      <div className="flex items-center gap-2 mb-2">
        <div
          className={`w-7 h-7 rounded-lg flex items-center justify-center ${bgColor} ${color}`}
        >
          {icon}
        </div>
      </div>
      <p className={`text-lg font-bold ${color} animate-count-up`}>{value}</p>
      <p className="text-[11px] text-text-muted mt-0.5">{label}</p>
    </div>
  );
}
