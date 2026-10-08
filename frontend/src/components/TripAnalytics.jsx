import React, { useMemo } from 'react';
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Legend
} from 'recharts';
import {
  BarChart2,
  Wallet,
  Receipt,
  TrendingDown,
  TrendingUp,
  CalendarDays,
  Sparkles,
  AlertTriangle,
  CheckCircle2
} from 'lucide-react';

/* ─── Constants ───────────────────────────────────────────────────── */
const CATEGORIES = ['Food', 'Transport', 'Hotel', 'Activities', 'Shopping', 'Other'];

const CHART_COLORS = {
  Food:       '#f59e0b',
  Transport:  '#38bdf8',
  Hotel:      '#a78bfa',
  Activities: '#34d399',
  Shopping:   '#f472b6',
  Other:      '#94a3b8'
};

/* ─── Helpers ─────────────────────────────────────────────────────── */
const fmt = (val) =>
  new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0
  }).format(Number(val) || 0);

const calcDays = (startDate, endDate) => {
  if (!startDate || !endDate) return null;
  try {
    const diff = new Date(endDate) - new Date(startDate);
    const days = Math.round(diff / (1000 * 60 * 60 * 24));
    return days >= 0 ? days + 1 : null;
  } catch {
    return null;
  }
};

/* ─── Custom Tooltip ──────────────────────────────────────────────── */
const CustomPieTooltip = ({ active, payload }) => {
  if (!active || !payload?.length) return null;
  const { name, value } = payload[0];
  return (
    <div className="bg-white dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded-xl px-3 py-2 shadow-lg text-xs">
      <p className="font-bold text-stone-900 dark:text-white">{name}</p>
      <p className="text-emerald-600 dark:text-emerald-400 font-extrabold">{fmt(value)}</p>
    </div>
  );
};

const CustomBarTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-white dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded-xl px-3 py-2 shadow-lg text-xs">
      <p className="font-bold text-stone-900 dark:text-white mb-1">{label}</p>
      {payload.map((p) => (
        <p key={p.name} className="font-semibold" style={{ color: p.fill }}>
          {p.name}: {fmt(p.value)}
        </p>
      ))}
    </div>
  );
};

/* ─── Summary Card ────────────────────────────────────────────────── */
const SummaryCard = ({ icon: Icon, label, value, accent, sub }) => (
  <div className="bg-white dark:bg-stone-900 rounded-2xl border border-stone-200 dark:border-stone-800 p-4 flex items-center gap-4 shadow-sm">
    <div className={`h-11 w-11 rounded-2xl flex items-center justify-center flex-shrink-0 ${accent}`}>
      <Icon className="w-5 h-5" />
    </div>
    <div className="min-w-0">
      <p className="text-[10px] font-bold uppercase tracking-wider text-stone-500 dark:text-stone-400">
        {label}
      </p>
      <p className="text-base font-extrabold text-stone-900 dark:text-white truncate">{value}</p>
      {sub && (
        <p className="text-[10px] text-stone-400 dark:text-stone-500 mt-0.5">{sub}</p>
      )}
    </div>
  </div>
);

/* ─── Main Component ──────────────────────────────────────────────── */
const TripAnalytics = ({ trip, expenses = [], itinerary }) => {
  const analytics = useMemo(() => {
    const budget     = Number(trip?.budget) || 0;
    const totalSpent = expenses.reduce((s, e) => s + (Number(e.amount) || 0), 0);
    const remaining  = budget - totalSpent;
    const overBudget = totalSpent > budget && budget > 0;
    const pct        = budget > 0 ? Math.min((totalSpent / budget) * 100, 100) : 0;

    const byCategory = CATEGORIES.map((cat) => {
      const total = expenses
        .filter((e) => e.category === cat)
        .reduce((s, e) => s + (Number(e.amount) || 0), 0);
      return { name: cat, value: total };
    }).filter((d) => d.value > 0);

    const barData = [
      { name: 'Budget', 'Total Budget': budget, 'Total Spent': totalSpent }
    ];

    const tripDays = calcDays(trip?.startDate, trip?.endDate);

    let activityCount = 0;
    let itineraryCost = 0;
    if (itinerary?.days) {
      activityCount = itinerary.days.length * 3;
      itineraryCost = itinerary.days.reduce((s, d) => {
        return s +
          (Number(d?.morning?.estimatedCost)   || 0) +
          (Number(d?.afternoon?.estimatedCost) || 0) +
          (Number(d?.evening?.estimatedCost)   || 0);
      }, 0);
    }

    return {
      budget, totalSpent, remaining, overBudget, pct,
      byCategory, barData, tripDays, activityCount, itineraryCost
    };
  }, [trip, expenses, itinerary]);

  const {
    budget, totalSpent, remaining, overBudget, pct,
    byCategory, barData, tripDays, activityCount, itineraryCost
  } = analytics;

  const hasExpenses = expenses.length > 0;

  return (
    <div className="bg-white dark:bg-stone-900 rounded-3xl border border-stone-200 dark:border-stone-800 shadow-md overflow-hidden">

      {/* Header */}
      <div className="px-6 sm:px-8 pt-6 pb-5 border-b border-stone-100 dark:border-stone-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="h-11 w-11 rounded-2xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center border border-emerald-500/20">
            <BarChart2 className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-xl font-bold text-stone-900 dark:text-white">Trip Analytics</h3>
            <p className="text-xs text-stone-500 dark:text-stone-400">Spending insights &amp; budget overview</p>
          </div>
        </div>

        {budget > 0 && hasExpenses && (
          <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold border ${
            overBudget
              ? 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20'
              : 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20'
          }`}>
            {overBudget
              ? <><AlertTriangle className="w-3.5 h-3.5" /><span>Over Budget</span></>
              : <><CheckCircle2 className="w-3.5 h-3.5" /><span>Within Budget</span></>
            }
          </span>
        )}
      </div>

      <div className="px-6 sm:px-8 py-6 space-y-8">

        {/* Summary Cards */}
        <div>
          <p className="text-[10px] font-bold uppercase tracking-wider text-stone-400 dark:text-stone-500 mb-3">
            Summary
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            <SummaryCard
              icon={Wallet}
              label="Total Budget"
              value={budget > 0 ? fmt(budget) : 'Not set'}
              accent="bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20"
            />
            <SummaryCard
              icon={Receipt}
              label="Total Spent"
              value={fmt(totalSpent)}
              sub={`${expenses.length} expense${expenses.length !== 1 ? 's' : ''}`}
              accent="bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20"
            />
            <SummaryCard
              icon={overBudget ? TrendingDown : TrendingUp}
              label={overBudget ? 'Over Budget By' : 'Remaining'}
              value={budget > 0 ? fmt(Math.abs(remaining)) : '—'}
              accent={overBudget
                ? 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20'
                : 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20'
              }
            />
            <SummaryCard
              icon={CalendarDays}
              label="Trip Duration"
              value={tripDays ? `${tripDays} Day${tripDays !== 1 ? 's' : ''}` : '—'}
              accent="bg-teal-500/10 text-teal-600 dark:text-teal-400 border border-teal-500/20"
            />
          </div>
        </div>

        {/* Budget Progress */}
        {budget > 0 && (
          <div>
            <p className="text-[10px] font-bold uppercase tracking-wider text-stone-400 dark:text-stone-500 mb-3">
              Budget vs. Actual
            </p>
            <div className="bg-stone-50 dark:bg-stone-800/60 rounded-2xl border border-stone-200/80 dark:border-stone-800 p-4 sm:p-5">
              <div className="flex items-center justify-between text-xs mb-2">
                <span className="font-semibold text-stone-600 dark:text-stone-300">
                  Spent{' '}
                  <span className="font-extrabold text-stone-900 dark:text-white">{fmt(totalSpent)}</span>
                  {' '}of{' '}
                  <span className="font-extrabold text-stone-900 dark:text-white">{fmt(budget)}</span>
                </span>
                <span className={`font-bold ${overBudget ? 'text-rose-600 dark:text-rose-400' : 'text-stone-500 dark:text-stone-400'}`}>
                  {pct.toFixed(0)}%
                </span>
              </div>

              <div className="h-3 w-full bg-stone-200 dark:bg-stone-700 rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all duration-500 ${
                    overBudget ? 'bg-rose-500' : pct > 80 ? 'bg-amber-500' : 'bg-emerald-600'
                  }`}
                  style={{ width: `${Math.min(pct, 100)}%` }}
                />
              </div>

              <div className="flex flex-wrap items-center gap-4 mt-3 text-[11px] font-semibold text-stone-500 dark:text-stone-400">
                <span className="flex items-center gap-1.5">
                  <span className="inline-block w-2.5 h-2.5 rounded-full bg-emerald-600" />
                  Budget: {fmt(budget)}
                </span>
                <span className="flex items-center gap-1.5">
                  <span className={`inline-block w-2.5 h-2.5 rounded-full ${overBudget ? 'bg-rose-500' : 'bg-amber-500'}`} />
                  Spent: {fmt(totalSpent)}
                </span>
                {!overBudget && budget > 0 && (
                  <span className="flex items-center gap-1.5">
                    <span className="inline-block w-2.5 h-2.5 rounded-full bg-emerald-500" />
                    Remaining: {fmt(remaining)}
                  </span>
                )}
                {overBudget && (
                  <span className="flex items-center gap-1.5 text-rose-600 dark:text-rose-400">
                    <AlertTriangle className="w-3 h-3" />
                    {fmt(Math.abs(remaining))} over budget
                  </span>
                )}
              </div>

              {hasExpenses && (
                <div className="mt-5 h-36">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={barData}
                      margin={{ top: 4, right: 4, left: 4, bottom: 4 }}
                      barCategoryGap="30%"
                    >
                      <CartesianGrid
                        strokeDasharray="3 3"
                        stroke="currentColor"
                        className="text-stone-200 dark:text-stone-700"
                        opacity={0.4}
                      />
                      <XAxis dataKey="name" tick={false} axisLine={false} tickLine={false} />
                      <YAxis
                        tickFormatter={(v) => `$${v >= 1000 ? `${(v / 1000).toFixed(0)}k` : v}`}
                        tick={{ fontSize: 10, fill: 'currentColor' }}
                        className="text-stone-400"
                        axisLine={false}
                        tickLine={false}
                        width={42}
                      />
                      <Tooltip content={<CustomBarTooltip />} cursor={{ fill: 'transparent' }} />
                      <Legend
                        wrapperStyle={{ fontSize: '11px', paddingTop: '4px' }}
                      />
                      <Bar dataKey="Total Budget" fill="#059669" radius={[6, 6, 0, 0]} maxBarSize={60} />
                      <Bar
                        dataKey="Total Spent"
                        fill={overBudget ? '#ef4444' : '#f59e0b'}
                        radius={[6, 6, 0, 0]}
                        maxBarSize={60}
                      />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Spending Breakdown */}
        <div>
          <p className="text-[10px] font-bold uppercase tracking-wider text-stone-400 dark:text-stone-500 mb-3">
            Spending by Category
          </p>

          {!hasExpenses ? (
            <div className="py-10 text-center rounded-2xl bg-stone-50 dark:bg-stone-800/40 border border-dashed border-stone-200 dark:border-stone-800">
              <BarChart2 className="w-8 h-8 text-stone-300 dark:text-stone-600 mx-auto mb-2" />
              <p className="text-xs text-stone-500 dark:text-stone-400">
                Add expenses to see the spending breakdown chart.
              </p>
            </div>
          ) : (
            <div className="bg-stone-50 dark:bg-stone-800/60 rounded-2xl border border-stone-200/80 dark:border-stone-800 p-4 sm:p-5">
              <div className="flex flex-col md:flex-row gap-6 items-center">

                {/* Donut chart */}
                <div className="w-full md:w-52 h-52 flex-shrink-0">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={byCategory}
                        cx="50%"
                        cy="50%"
                        innerRadius="55%"
                        outerRadius="78%"
                        paddingAngle={3}
                        dataKey="value"
                      >
                        {byCategory.map((entry) => (
                          <Cell
                            key={entry.name}
                            fill={CHART_COLORS[entry.name] || '#94a3b8'}
                            strokeWidth={0}
                          />
                        ))}
                      </Pie>
                      <Tooltip content={<CustomPieTooltip />} />
                    </PieChart>
                  </ResponsiveContainer>
                </div>

                {/* Category legend grid */}
                <div className="flex-1 w-full grid grid-cols-2 sm:grid-cols-3 md:grid-cols-2 lg:grid-cols-3 gap-2.5">
                  {CATEGORIES.map((cat) => {
                    const spent = expenses
                      .filter((e) => e.category === cat)
                      .reduce((s, e) => s + (Number(e.amount) || 0), 0);
                    const pctCat =
                      totalSpent > 0 ? ((spent / totalSpent) * 100).toFixed(0) : 0;
                    return (
                      <div
                        key={cat}
                        className="p-3 rounded-xl bg-white dark:bg-stone-900 border border-stone-200/80 dark:border-stone-800 flex flex-col gap-1"
                      >
                        <div className="flex items-center gap-1.5">
                          <span
                            className="inline-block w-2 h-2 rounded-full flex-shrink-0"
                            style={{ background: CHART_COLORS[cat] }}
                          />
                          <span className="text-[10px] font-bold text-stone-600 dark:text-stone-400 uppercase tracking-wide truncate">
                            {cat}
                          </span>
                        </div>
                        <span className="text-xs font-extrabold text-stone-900 dark:text-white">
                          {fmt(spent)}
                        </span>
                        <span className="text-[10px] text-stone-400 dark:text-stone-500">
                          {pctCat}% of total
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Itinerary Insight (optional) */}
        {itinerary?.days && (
          <div>
            <p className="text-[10px] font-bold uppercase tracking-wider text-stone-400 dark:text-stone-500 mb-3">
              Itinerary Insight
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="bg-emerald-50 dark:bg-emerald-950/40 rounded-2xl border border-emerald-100 dark:border-emerald-900/50 p-4 flex items-center gap-3">
                <Sparkles className="w-5 h-5 text-emerald-600 dark:text-emerald-400 flex-shrink-0" />
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-wider text-emerald-700/80 dark:text-emerald-400/80">
                    Planned Activities
                  </p>
                  <p className="text-base font-extrabold text-emerald-900 dark:text-emerald-200">
                    {activityCount} activities
                    <span className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 ml-1">
                      across {itinerary.days.length} day{itinerary.days.length !== 1 ? 's' : ''}
                    </span>
                  </p>
                </div>
              </div>
              <div className="bg-amber-50 dark:bg-amber-950/30 rounded-2xl border border-amber-100 dark:border-amber-900/40 p-4 flex items-center gap-3">
                <Wallet className="w-5 h-5 text-amber-600 dark:text-amber-400 flex-shrink-0" />
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-wider text-amber-600/70 dark:text-amber-400/70">
                    Estimated Itinerary Cost
                  </p>
                  <p className="text-base font-extrabold text-amber-900 dark:text-amber-200">
                    {fmt(itineraryCost)}
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};

export default TripAnalytics;
