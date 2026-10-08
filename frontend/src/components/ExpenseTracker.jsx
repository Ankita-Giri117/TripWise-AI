import React, { useState, useEffect } from 'react';
import {
  getExpensesApi,
  createExpenseApi,
  updateExpenseApi,
  deleteExpenseApi
} from '../api/trips';
import {
  Receipt,
  Plus,
  Trash2,
  Edit2,
  PieChart,
  AlertCircle,
  RefreshCw,
  CheckCircle2,
  XCircle
} from 'lucide-react';

const CATEGORIES = [
  'Food',
  'Transport',
  'Hotel',
  'Activities',
  'Shopping',
  'Other'
];

const CATEGORY_COLORS = {
  Food: 'bg-amber-500/10 text-amber-700 dark:text-amber-300 border-amber-500/20',
  Transport: 'bg-sky-500/10 text-sky-700 dark:text-sky-300 border-sky-500/20',
  Hotel: 'bg-rose-500/10 text-rose-700 dark:text-rose-300 border-rose-500/20',
  Activities: 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border-emerald-500/20',
  Shopping: 'bg-pink-500/10 text-pink-700 dark:text-pink-300 border-pink-500/20',
  Other: 'bg-stone-500/10 text-stone-700 dark:text-stone-300 border-stone-500/20'
};

const ExpenseTracker = ({ tripId, expenses: expensesProp, setExpenses: setExpensesProp }) => {
  // If parent provides lifted state, use it; otherwise manage internally
  const [internalExpenses, setInternalExpenses] = useState([]);
  const expenses    = expensesProp    ?? internalExpenses;
  const setExpenses = setExpensesProp ?? setInternalExpenses;

  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('Food');
  const [amount, setAmount] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);

  const [editingExpenseId, setEditingExpenseId] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    // If parent already manages expenses, skip the initial fetch (parent handles it)
    if (expensesProp !== undefined) {
      setIsLoading(false);
      return;
    }
    let isMounted = true;
    const loadExpenses = async () => {
      if (!tripId) return;
      setIsLoading(true);
      setError('');
      try {
        const data = await getExpensesApi(tripId);
        if (isMounted) {
          setInternalExpenses(data || []);
        }
      } catch (err) {
        if (isMounted) {
          console.error('Failed to load expenses:', err);
          setError(err.response?.data?.message || 'Failed to load expenses.');
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    loadExpenses();
    return () => {
      isMounted = false;
    };
  }, [tripId, expensesProp]);

  const resetForm = () => {
    setDescription('');
    setCategory('Food');
    setAmount('');
    setDate(new Date().toISOString().split('T')[0]);
    setEditingExpenseId(null);
  };

  const handleEditClick = (expense) => {
    setEditingExpenseId(expense.id);
    setDescription(expense.description || expense.title || '');
    setCategory(expense.category || 'Food');
    setAmount(expense.amount ? String(expense.amount) : '');
    setDate(expense.date ? expense.date.split('T')[0] : new Date().toISOString().split('T')[0]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!description.trim() || !amount || parseFloat(amount) <= 0 || !date) {
      setError('Please provide a valid description, date, and positive amount.');
      return;
    }

    setIsSubmitting(true);
    setError('');

    const payload = {
      description: description.trim(),
      category,
      amount: parseFloat(amount),
      date
    };

    try {
      if (editingExpenseId) {
        const updated = await updateExpenseApi(tripId, editingExpenseId, payload);
        setExpenses((prev) => prev.map((item) => (item.id === editingExpenseId ? updated : item)));
      } else {
        const created = await createExpenseApi(tripId, payload);
        setExpenses((prev) => [created, ...prev]);
      }
      resetForm();
    } catch (err) {
      console.error('Failed to save expense:', err);
      setError(err.response?.data?.message || 'Failed to save expense. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (expenseId) => {
    if (!window.confirm('Are you sure you want to delete this expense?')) return;
    try {
      await deleteExpenseApi(tripId, expenseId);
      setExpenses((prev) => prev.filter((item) => item.id !== expenseId));
      if (editingExpenseId === expenseId) {
        resetForm();
      }
    } catch (err) {
      console.error('Failed to delete expense:', err);
      setError(err.response?.data?.message || 'Failed to delete expense.');
    }
  };

  const totalSpent = expenses.reduce((acc, curr) => acc + (curr.amount || 0), 0);

  const categoryTotals = CATEGORIES.reduce((acc, cat) => {
    acc[cat] = expenses
      .filter((item) => item.category === cat)
      .reduce((sum, item) => sum + (item.amount || 0), 0);
    return acc;
  }, {});

  const formatCurrency = (val) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      maximumFractionDigits: 2
    }).format(val || 0);
  };

  return (
    <div className="bg-white dark:bg-stone-900 rounded-3xl p-6 sm:p-8 border border-stone-200 dark:border-stone-800 shadow-md">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-stone-100 dark:border-stone-800">
        <div className="flex items-center gap-3">
          <div className="h-12 w-12 rounded-2xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center border border-emerald-500/20">
            <Receipt className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-xl font-bold text-stone-900 dark:text-white flex items-center gap-2">
              <span>Expense Tracker</span>
            </h3>
            <p className="text-xs text-stone-500 dark:text-stone-400">
              Track your actual trip spending per category
            </p>
          </div>
        </div>

        {/* Total Summary Badge */}
        <div className="flex items-center gap-4 bg-stone-50 dark:bg-stone-800/80 p-3 rounded-2xl border border-stone-200 dark:border-stone-700/80">
          <div>
            <span className="text-[10px] uppercase font-bold tracking-wider text-stone-400 dark:text-stone-500 block">
              Total Spent
            </span>
            <span className="text-lg font-black text-emerald-600 dark:text-emerald-400">
              {formatCurrency(totalSpent)}
            </span>
          </div>
          <div className="h-8 w-px bg-stone-200 dark:bg-stone-700" />
          <div>
            <span className="text-[10px] uppercase font-bold tracking-wider text-stone-400 dark:text-stone-500 block">
              Expenses
            </span>
            <span className="text-lg font-bold text-stone-700 dark:text-stone-200">
              {expenses.length}
            </span>
          </div>
        </div>
      </div>

      {/* Error Alert */}
      {error && (
        <div className="mt-4 p-3.5 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-700 dark:text-rose-300 text-xs flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-rose-500 flex-shrink-0" />
            <span>{error}</span>
          </div>
          <button
            onClick={() => setError('')}
            className="text-[11px] font-bold text-rose-600 dark:text-rose-400 hover:underline cursor-pointer"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Add / Edit Form */}
      <form onSubmit={handleSubmit} className="mt-6 bg-stone-50 dark:bg-stone-800/60 p-4 sm:p-5 rounded-2xl border border-stone-200/80 dark:border-stone-800">
        <div className="flex items-center justify-between mb-3">
          <span className="text-xs font-bold text-stone-700 dark:text-stone-300 flex items-center gap-1.5">
            {editingExpenseId ? <Edit2 className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" /> : <Plus className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />}
            <span>{editingExpenseId ? 'Edit Expense' : 'Add New Expense'}</span>
          </span>
          {editingExpenseId && (
            <button
              type="button"
              onClick={resetForm}
              className="text-[11px] font-bold text-stone-500 hover:text-stone-700 dark:hover:text-stone-300 flex items-center gap-1 cursor-pointer"
            >
              <XCircle className="w-3.5 h-3.5" />
              <span>Cancel Edit</span>
            </button>
          )}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {/* Description */}
          <div>
            <label className="block text-[11px] font-bold uppercase tracking-wider text-stone-500 dark:text-stone-400 mb-1">
              Description
            </label>
            <input
              type="text"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="e.g. Dinner at Bistro"
              required
              className="w-full px-3 py-2 rounded-xl bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-700 text-stone-900 dark:text-white text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
            />
          </div>

          {/* Amount */}
          <div>
            <label className="block text-[11px] font-bold uppercase tracking-wider text-stone-500 dark:text-stone-400 mb-1">
              Amount ($)
            </label>
            <input
              type="number"
              step="0.01"
              min="0.01"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="0.00"
              required
              className="w-full px-3 py-2 rounded-xl bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-700 text-stone-900 dark:text-white text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
            />
          </div>

          {/* Category */}
          <div>
            <label className="block text-[11px] font-bold uppercase tracking-wider text-stone-500 dark:text-stone-400 mb-1">
              Category
            </label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full px-3 py-2 rounded-xl bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-700 text-stone-900 dark:text-white text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
            >
              {CATEGORIES.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </div>

          {/* Date */}
          <div>
            <label className="block text-[11px] font-bold uppercase tracking-wider text-stone-500 dark:text-stone-400 mb-1">
              Date
            </label>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              required
              className="w-full px-3 py-2 rounded-xl bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-700 text-stone-900 dark:text-white text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
            />
          </div>
        </div>

        <div className="mt-4 flex justify-end">
          <button
            type="submit"
            disabled={isSubmitting}
            className="px-5 py-2.5 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs shadow-md shadow-emerald-900/20 transition-all flex items-center gap-2 cursor-pointer disabled:opacity-60"
          >
            {isSubmitting ? (
              <RefreshCw className="w-3.5 h-3.5 animate-spin" />
            ) : editingExpenseId ? (
              <>
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Update Expense</span>
              </>
            ) : (
              <>
                <Plus className="w-3.5 h-3.5" />
                <span>Add Expense</span>
              </>
            )}
          </button>
        </div>
      </form>

      {/* Category Breakdown Cards */}
      <div className="mt-6">
        <span className="text-[11px] font-bold text-stone-600 dark:text-stone-400 mb-2 flex items-center gap-1.5 uppercase tracking-wider">
          <PieChart className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
          <span>Category Breakdown</span>
        </span>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2.5 mt-2">
          {CATEGORIES.map((cat) => {
            const spent = categoryTotals[cat] || 0;
            const pct = totalSpent > 0 ? ((spent / totalSpent) * 100).toFixed(0) : 0;
            return (
              <div
                key={cat}
                className="p-3 rounded-2xl bg-stone-50 dark:bg-stone-800/60 border border-stone-200/80 dark:border-stone-800 flex flex-col justify-between"
              >
                <span className="text-[10px] font-bold text-stone-500 dark:text-stone-400 truncate">
                  {cat}
                </span>
                <div className="mt-1">
                  <span className="text-xs font-black text-stone-900 dark:text-white block">
                    {formatCurrency(spent)}
                  </span>
                  <span className="text-[10px] text-stone-400 dark:text-stone-500 block">
                    {pct}% of total
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Expenses Table/List */}
      <div className="mt-6">
        <span className="text-[11px] font-bold text-stone-600 dark:text-stone-400 mb-3 block uppercase tracking-wider">
          Expense History ({expenses.length})
        </span>

        {isLoading ? (
          <div className="py-8 text-center text-stone-500 dark:text-stone-400 text-xs flex items-center justify-center gap-2">
            <RefreshCw className="w-4 h-4 animate-spin text-emerald-600 dark:text-emerald-400" />
            <span>Loading expense items...</span>
          </div>
        ) : expenses.length === 0 ? (
          <div className="py-8 text-center rounded-2xl bg-stone-50 dark:bg-stone-800/40 border border-dashed border-stone-200 dark:border-stone-800 text-stone-500 dark:text-stone-400 text-xs">
            No expenses recorded yet. Add your first expense above!
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-stone-700 dark:text-stone-300">
              <thead className="bg-stone-50 dark:bg-stone-800/80 text-[10px] uppercase font-bold tracking-wider text-stone-400 border-b border-stone-200 dark:border-stone-800">
                <tr>
                  <th className="px-4 py-3 rounded-l-xl">Date</th>
                  <th className="px-4 py-3">Description</th>
                  <th className="px-4 py-3">Category</th>
                  <th className="px-4 py-3">Amount</th>
                  <th className="px-4 py-3 text-right rounded-r-xl">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100 dark:divide-stone-800">
                {expenses.map((expense) => {
                  const catStyle =
                    CATEGORY_COLORS[expense.category] || CATEGORY_COLORS['Other'];
                  return (
                    <tr
                      key={expense.id}
                      className="hover:bg-stone-50/80 dark:hover:bg-stone-800/40 transition-colors"
                    >
                      <td className="px-4 py-3 font-medium whitespace-nowrap text-stone-500 dark:text-stone-400">
                        {expense.date || 'N/A'}
                      </td>
                      <td className="px-4 py-3 font-bold text-stone-900 dark:text-white">
                        {expense.description || expense.title}
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        <span
                          className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${catStyle}`}
                        >
                          {expense.category}
                        </span>
                      </td>
                      <td className="px-4 py-3 font-black text-stone-900 dark:text-white whitespace-nowrap">
                        {formatCurrency(expense.amount)}
                      </td>
                      <td className="px-4 py-3 text-right whitespace-nowrap">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => handleEditClick(expense)}
                            className="p-1.5 rounded-lg text-stone-400 hover:text-emerald-600 dark:hover:text-emerald-400 hover:bg-stone-100 dark:hover:bg-stone-800 transition-colors cursor-pointer"
                            title="Edit Expense"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleDelete(expense.id)}
                            className="p-1.5 rounded-lg text-stone-400 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-stone-100 dark:hover:bg-stone-800 transition-colors cursor-pointer"
                            title="Delete Expense"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default ExpenseTracker;
