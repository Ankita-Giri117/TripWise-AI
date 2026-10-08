import React, { useState } from 'react';
import { convertCurrency, formatCurrencyAmount, SUPPORTED_CURRENCIES, CURRENCY_INFO } from '../utils/currency';
import { ArrowRightLeft, Coins, Info } from 'lucide-react';

const CurrencyConverter = () => {
  const [amount, setAmount] = useState('100');
  const [fromCurrency, setFromCurrency] = useState('USD');
  const [toCurrency, setToCurrency] = useState('INR');

  const handleAmountChange = (e) => {
    const val = e.target.value;
    if (val === '' || (!isNaN(val) && parseFloat(val) >= 0)) {
      setAmount(val);
    }
  };

  const handleSwap = () => {
    setFromCurrency(toCurrency);
    setToCurrency(fromCurrency);
  };

  const convertedValue = convertCurrency(amount, fromCurrency, toCurrency);

  return (
    <div className="bg-white dark:bg-stone-900 rounded-3xl p-6 border border-stone-200 dark:border-stone-800 shadow-md">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-base font-bold text-stone-900 dark:text-white flex items-center gap-2">
          <Coins className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
          <span>Currency Converter</span>
        </h3>
        <span className="px-2.5 py-1 rounded-full bg-stone-100 dark:bg-stone-800 text-[10px] font-bold text-stone-500 dark:text-stone-400 flex items-center gap-1">
          <Info className="w-3 h-3 text-amber-500" />
          Approximate Rates
        </span>
      </div>

      <div className="space-y-4">
        {/* Amount Input */}
        <div>
          <label className="block text-xs font-bold text-stone-600 dark:text-stone-400 mb-1">
            Amount
          </label>
          <input
            type="number"
            min="0"
            step="any"
            value={amount}
            onChange={handleAmountChange}
            placeholder="Enter amount"
            className="w-full px-4 py-2.5 rounded-xl bg-stone-50 dark:bg-stone-800/60 border border-stone-200 dark:border-stone-700 text-stone-900 dark:text-white font-semibold text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
          />
        </div>

        {/* Currency Selectors & Swap Button */}
        <div className="grid grid-cols-1 sm:grid-cols-[1fr_auto_1fr] items-center gap-2">
          {/* From Currency */}
          <div>
            <label className="block text-xs font-bold text-stone-600 dark:text-stone-400 mb-1">
              From
            </label>
            <select
              value={fromCurrency}
              onChange={(e) => setFromCurrency(e.target.value)}
              className="w-full px-3 py-2.5 rounded-xl bg-stone-50 dark:bg-stone-800/60 border border-stone-200 dark:border-stone-700 text-stone-900 dark:text-white font-semibold text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500 cursor-pointer"
            >
              {SUPPORTED_CURRENCIES.map((code) => (
                <option key={code} value={code}>
                  {code} - {CURRENCY_INFO[code].name}
                </option>
              ))}
            </select>
          </div>

          {/* Swap Button */}
          <div className="flex justify-center sm:pt-5">
            <button
              onClick={handleSwap}
              type="button"
              title="Swap Currencies"
              className="p-2.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 hover:bg-emerald-100 transition-all cursor-pointer"
            >
              <ArrowRightLeft className="w-4 h-4" />
            </button>
          </div>

          {/* To Currency */}
          <div>
            <label className="block text-xs font-bold text-stone-600 dark:text-stone-400 mb-1">
              To
            </label>
            <select
              value={toCurrency}
              onChange={(e) => setToCurrency(e.target.value)}
              className="w-full px-3 py-2.5 rounded-xl bg-stone-50 dark:bg-stone-800/60 border border-stone-200 dark:border-stone-700 text-stone-900 dark:text-white font-semibold text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500 cursor-pointer"
            >
              {SUPPORTED_CURRENCIES.map((code) => (
                <option key={code} value={code}>
                  {code} - {CURRENCY_INFO[code].name}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Converted Result Display */}
        <div className="p-4 rounded-2xl bg-gradient-to-r from-emerald-50 to-teal-50 dark:from-emerald-950/40 dark:to-teal-950/40 border border-emerald-100 dark:border-emerald-900/50 text-center">
          <span className="text-xs text-stone-500 dark:text-stone-400 block mb-0.5 font-medium">
            Converted Result
          </span>
          <div className="text-xl font-extrabold text-emerald-900 dark:text-emerald-200">
            {formatCurrencyAmount(convertedValue, toCurrency)}
          </div>
          <p className="text-[11px] text-stone-500 dark:text-stone-400 mt-1">
            {formatCurrencyAmount(amount || 0, fromCurrency)} = {formatCurrencyAmount(convertedValue, toCurrency)}
          </p>
        </div>
      </div>
    </div>
  );
};

export default CurrencyConverter;
