import React from 'react';
import { Wallet, DollarSign, AlertTriangle, CheckCircle, TrendingUp } from 'lucide-react';

const TripBudgetSummary = ({ trip, itinerary }) => {
  const totalBudget = trip?.budget || 0;

  // Calculate total itinerary cost by summing all day activities
  const totalItineraryCost = itinerary?.days
    ? itinerary.days.reduce((acc, day) => {
        const morningCost = day?.morning?.estimatedCost || 0;
        const afternoonCost = day?.afternoon?.estimatedCost || 0;
        const eveningCost = day?.evening?.estimatedCost || 0;
        return acc + morningCost + afternoonCost + eveningCost;
      }, 0)
    : 0;

  const remainingBudget = totalBudget - totalItineraryCost;
  const isOverBudget = totalItineraryCost > totalBudget;
  const overBudgetAmount = totalItineraryCost - totalBudget;
  const percentageUsed = totalBudget > 0 ? Math.min(Math.round((totalItineraryCost / totalBudget) * 100), 100) : 0;

  const formatCurrency = (amount) => {
    const numericAmount = parseFloat(amount);
    if (isNaN(numericAmount)) return '$0';
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      maximumFractionDigits: 0
    }).format(numericAmount);
  };

  return (
    <div className="bg-white dark:bg-stone-900 rounded-3xl p-6 border border-stone-200 dark:border-stone-800 shadow-md">
      <div className="flex items-center justify-between mb-5">
        <h3 className="text-base font-bold text-stone-900 dark:text-white flex items-center gap-2">
          <Wallet className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
          <span>Trip Budget Summary</span>
        </h3>
        {itinerary && (
          <span
            className={`px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1.5 ${
              isOverBudget
                ? 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20'
                : 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20'
            }`}
          >
            {isOverBudget ? (
              <>
                <AlertTriangle className="w-3.5 h-3.5" />
                <span>Over Budget</span>
              </>
            ) : (
              <>
                <CheckCircle className="w-3.5 h-3.5" />
                <span>Within Budget</span>
              </>
            )}
          </span>
        )}
      </div>

      {/* 3 Budget Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-5">
        {/* Total Budget */}
        <div className="p-4 rounded-2xl bg-emerald-50/50 dark:bg-emerald-950/40 border border-emerald-100 dark:border-emerald-900/50">
          <span className="text-xs font-bold uppercase tracking-wider text-emerald-700 dark:text-emerald-400 block mb-1">
            Total Budget
          </span>
          <div className="text-xl font-extrabold text-stone-900 dark:text-white">
            {formatCurrency(totalBudget)}
          </div>
        </div>

        {/* Estimated Itinerary Cost */}
        <div className="p-4 rounded-2xl bg-teal-50/50 dark:bg-teal-950/40 border border-teal-100 dark:border-teal-900/50">
          <span className="text-xs font-bold uppercase tracking-wider text-teal-700 dark:text-teal-400 block mb-1">
            Estimated Cost
          </span>
          <div className="text-xl font-extrabold text-stone-900 dark:text-white">
            {itinerary ? formatCurrency(totalItineraryCost) : 'No Itinerary Yet'}
          </div>
        </div>

        {/* Remaining Budget */}
        <div
          className={`p-4 rounded-2xl border ${
            isOverBudget
              ? 'bg-rose-50/50 dark:bg-rose-950/40 border-rose-100 dark:border-rose-900/50'
              : 'bg-emerald-50/50 dark:bg-emerald-950/40 border-emerald-100 dark:border-emerald-900/50'
          }`}
        >
          <span
            className={`text-xs font-bold uppercase tracking-wider block mb-1 ${
              isOverBudget ? 'text-rose-600 dark:text-rose-400' : 'text-emerald-600 dark:text-emerald-400'
            }`}
          >
            {isOverBudget ? 'Deficit' : 'Remaining'}
          </span>
          <div
            className={`text-xl font-extrabold ${
              isOverBudget ? 'text-rose-600 dark:text-rose-400' : 'text-emerald-600 dark:text-emerald-400'
            }`}
          >
            {isOverBudget ? `-${formatCurrency(overBudgetAmount)}` : formatCurrency(remainingBudget)}
          </div>
        </div>
      </div>

      {/* Progress Bar & Status */}
      {itinerary && (
        <div className="space-y-2">
          <div className="flex justify-between text-xs font-bold text-stone-600 dark:text-stone-400">
            <span>Budget Utilization</span>
            <span>{percentageUsed}% Used</span>
          </div>
          <div className="w-full h-3 rounded-full bg-stone-100 dark:bg-stone-800 overflow-hidden">
            <div
              className={`h-full rounded-full transition-all duration-500 ${
                isOverBudget ? 'bg-rose-500' : percentageUsed > 80 ? 'bg-amber-500' : 'bg-emerald-500'
              }`}
              style={{ width: `${percentageUsed}%` }}
            />
          </div>
        </div>
      )}

      {/* Alert Banner if Over Budget */}
      {isOverBudget && (
        <div className="mt-4 p-3.5 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-700 dark:text-rose-300 text-xs font-semibold flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 flex-shrink-0 text-rose-500" />
          <span>
            Estimated itinerary cost exceeds your set trip budget by <strong>{formatCurrency(overBudgetAmount)}</strong>.
          </span>
        </div>
      )}
    </div>
  );
};

export default TripBudgetSummary;
