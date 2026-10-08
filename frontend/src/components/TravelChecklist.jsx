import React, { useState, useEffect } from 'react';
import {
  getChecklistApi,
  createChecklistItemApi,
  updateChecklistItemApi,
  deleteChecklistItemApi
} from '../api/checklist';
import {
  CheckSquare,
  Plus,
  Trash2,
  CheckCircle2,
  Circle,
  RefreshCw,
  AlertCircle,
  Sparkles,
  ListTodo
} from 'lucide-react';

const SUGGESTED_ITEMS = [
  'Passport / ID',
  'Tickets',
  'Hotel booking',
  'Travel insurance',
  'Medicines',
  'Phone charger',
  'Power bank',
  'Important documents'
];

const TravelChecklist = ({ tripId }) => {
  const [items, setItems] = useState([]);
  const [newItemText, setNewItemText] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  const fetchChecklist = async () => {
    if (!tripId) return;
    setIsLoading(true);
    setError('');
    try {
      const data = await getChecklistApi(tripId);
      setItems(data || []);
    } catch (err) {
      console.error('Failed to load checklist:', err);
      setError('Unable to load travel checklist.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchChecklist();
  }, [tripId]);

  const handleAddItem = async (textToAdd) => {
    const text = (textToAdd || newItemText).trim();
    if (!text) return;

    // Prevent duplicate exact items
    if (items.some((i) => i.item.toLowerCase() === text.toLowerCase())) {
      setError(`"${text}" is already in your checklist.`);
      return;
    }

    setIsSubmitting(true);
    setError('');

    try {
      const newItem = await createChecklistItemApi(tripId, { item: text, completed: false });
      setItems((prev) => [...prev, newItem]);
      setNewItemText('');
    } catch (err) {
      console.error('Failed to add item:', err);
      setError('Failed to add checklist item.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleToggleCompleted = async (item) => {
    const newCompleted = !item.completed;
    // Optimistic UI update
    setItems((prev) =>
      prev.map((i) => (i.id === item.id ? { ...i, completed: newCompleted } : i))
    );

    try {
      await updateChecklistItemApi(tripId, item.id, {
        item: item.item,
        completed: newCompleted
      });
    } catch (err) {
      console.error('Failed to update item:', err);
      // Revert optimistic update on error
      setItems((prev) =>
        prev.map((i) => (i.id === item.id ? { ...i, completed: item.completed } : i))
      );
      setError('Failed to update item status.');
    }
  };

  const handleDeleteItem = async (itemId) => {
    // Optimistic remove
    setItems((prev) => prev.filter((i) => i.id !== itemId));

    try {
      await deleteChecklistItemApi(tripId, itemId);
    } catch (err) {
      console.error('Failed to delete item:', err);
      // Re-fetch list on error
      fetchChecklist();
      setError('Failed to delete item.');
    }
  };

  const completedCount = items.filter((i) => i.completed).length;
  const totalCount = items.length;
  const progressPercent = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

  // Filter suggested items that aren't added yet
  const availableSuggestions = SUGGESTED_ITEMS.filter(
    (sugg) => !items.some((i) => i.item.toLowerCase() === sugg.toLowerCase())
  );

  return (
    <div className="bg-white dark:bg-stone-900 rounded-3xl p-6 border border-stone-200 dark:border-stone-800 shadow-md">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-base font-bold text-stone-900 dark:text-white flex items-center gap-2">
          <ListTodo className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
          <span>Travel Checklist</span>
        </h3>
        {totalCount > 0 && (
          <span className="px-3 py-1 rounded-full bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800 text-xs font-bold">
            {completedCount} of {totalCount} completed ({progressPercent}%)
          </span>
        )}
      </div>

      {/* Progress Bar */}
      {totalCount > 0 && (
        <div className="w-full h-2 rounded-full bg-stone-100 dark:bg-stone-800 overflow-hidden mb-5">
          <div
            className={`h-full rounded-full transition-all duration-500 ${
              progressPercent === 100 ? 'bg-emerald-500' : 'bg-emerald-600'
            }`}
            style={{ width: `${progressPercent}%` }}
          />
        </div>
      )}

      {/* Error Banner */}
      {error && (
        <div className="mb-4 p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-600 dark:text-rose-400 text-xs flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span>{error}</span>
          </div>
          <button onClick={() => setError('')} className="text-xs font-bold hover:underline cursor-pointer">
            Dismiss
          </button>
        </div>
      )}

      {/* Add Item Form */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          handleAddItem();
        }}
        className="flex items-center gap-2 mb-5"
      >
        <input
          type="text"
          value={newItemText}
          onChange={(e) => {
            setNewItemText(e.target.value);
            if (error) setError('');
          }}
          placeholder="Add a new packing item (e.g. Passport, Charger)..."
          className="flex-1 px-4 py-2.5 rounded-xl bg-stone-50 dark:bg-stone-800/60 border border-stone-200 dark:border-stone-700 text-stone-900 dark:text-white font-semibold text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
          disabled={isSubmitting}
        />
        <button
          type="submit"
          disabled={isSubmitting || !newItemText.trim()}
          className="px-4 py-2.5 rounded-xl bg-emerald-700 hover:bg-emerald-800 disabled:opacity-50 text-white font-bold text-xs shadow-md shadow-emerald-900/20 transition-all flex items-center gap-1.5 cursor-pointer disabled:cursor-not-allowed"
        >
          {isSubmitting ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
          <span>Add</span>
        </button>
      </form>

      {/* Suggested Items Chips */}
      {availableSuggestions.length > 0 && (
        <div className="mb-5">
          <span className="text-[11px] font-bold text-stone-500 dark:text-stone-400 uppercase tracking-wider block mb-2 flex items-center gap-1">
            <Sparkles className="w-3 h-3 text-amber-500" />
            Quick Add Suggestions
          </span>
          <div className="flex flex-wrap gap-1.5">
            {availableSuggestions.map((sugg) => (
              <button
                key={sugg}
                onClick={() => handleAddItem(sugg)}
                disabled={isSubmitting}
                className="px-2.5 py-1 rounded-lg bg-stone-100 dark:bg-stone-800 hover:bg-emerald-50 dark:hover:bg-emerald-950 text-stone-700 dark:text-stone-300 hover:text-emerald-600 dark:hover:text-emerald-300 text-xs font-semibold border border-stone-200 dark:border-stone-700 transition-all flex items-center gap-1 cursor-pointer"
              >
                <Plus className="w-3 h-3" />
                <span>{sugg}</span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Items List */}
      {isLoading ? (
        <div className="py-8 text-center">
          <RefreshCw className="w-6 h-6 text-emerald-600 dark:text-emerald-400 animate-spin mx-auto mb-2" />
          <p className="text-xs font-semibold text-stone-500">Loading checklist...</p>
        </div>
      ) : items.length === 0 ? (
        <div className="py-8 text-center border-2 border-dashed border-stone-200 dark:border-stone-800 rounded-2xl">
          <CheckSquare className="w-8 h-8 text-stone-300 dark:text-stone-700 mx-auto mb-2" />
          <p className="text-xs font-bold text-stone-600 dark:text-stone-400">Your checklist is empty.</p>
          <p className="text-[11px] text-stone-400 mt-1">Add items above or click a suggestion to start packing!</p>
        </div>
      ) : (
        <div className="space-y-2 max-h-80 overflow-y-auto pr-1">
          {items.map((item) => (
            <div
              key={item.id}
              className={`p-3 rounded-2xl border transition-all flex items-center justify-between gap-3 ${
                item.completed
                  ? 'bg-stone-50 dark:bg-stone-950/40 border-stone-200 dark:border-stone-800 text-stone-400 dark:text-stone-500'
                  : 'bg-white dark:bg-stone-800/80 border-stone-200 dark:border-stone-700 text-stone-900 dark:text-white'
              }`}
            >
              <div
                onClick={() => handleToggleCompleted(item)}
                className="flex items-center gap-3 flex-1 cursor-pointer select-none"
              >
                {item.completed ? (
                  <CheckCircle2 className="w-5 h-5 text-emerald-500 flex-shrink-0" />
                ) : (
                  <Circle className="w-5 h-5 text-stone-400 flex-shrink-0 hover:text-emerald-600 transition-colors" />
                )}
                <span className={`text-xs sm:text-sm font-semibold ${item.completed ? 'line-through' : ''}`}>
                  {item.item}
                </span>
              </div>

              <button
                onClick={() => handleDeleteItem(item.id)}
                title="Delete item"
                className="p-1.5 text-stone-400 hover:text-rose-500 transition-colors cursor-pointer rounded-lg hover:bg-rose-500/10"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default TravelChecklist;
