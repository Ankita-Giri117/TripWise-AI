import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import TripBudgetSummary from '../components/TripBudgetSummary';
import CurrencyConverter from '../components/CurrencyConverter';
import WeatherCard from '../components/WeatherCard';
import DestinationMap from '../components/DestinationMap';
import TravelChecklist from '../components/TravelChecklist';
import AITravelAssistant from '../components/AITravelAssistant';
import ExpenseTracker from '../components/ExpenseTracker';
import TripAnalytics from '../components/TripAnalytics';
import { getTripByIdApi, generateItineraryApi, getSavedItineraryApi, getExpensesApi } from '../api/trips';
import {
  Sparkles,
  MapPin,
  Calendar,
  Users,
  DollarSign,
  Sun,
  Sunset,
  Lightbulb,
  ArrowLeft,
  RefreshCw,
  AlertCircle,
  CheckCircle2,
  Edit3,
  Compass,
  Clock,
  LayoutDashboard,
  Bot,
  Wallet,
  Receipt,
  CheckSquare,
  TrendingUp,
  ChevronRight
} from 'lucide-react';

const NAV_ITEMS = [
  { id: 'overview', label: 'Overview', icon: LayoutDashboard },
  { id: 'itinerary', label: 'AI Itinerary', icon: Sparkles },
  { id: 'assistant', label: 'AI Assistant', icon: Bot },
  { id: 'budget', label: 'Budget', icon: Wallet },
  { id: 'expenses', label: 'Expenses', icon: Receipt },
  { id: 'weather', label: 'Weather', icon: Sun },
  { id: 'map', label: 'Map', icon: MapPin },
  { id: 'checklist', label: 'Checklist', icon: CheckSquare },
  { id: 'currency', label: 'Currency', icon: RefreshCw },
  { id: 'analytics', label: 'Analytics', icon: TrendingUp },
];

const TripDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [trip, setTrip] = useState(null);
  const [isLoadingTrip, setIsLoadingTrip] = useState(true);
  const [tripError, setTripError] = useState('');

  const [itinerary, setItinerary] = useState(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [itineraryError, setItineraryError] = useState('');

  // Lifted expenses state — shared between ExpenseTracker and TripAnalytics
  const [expenses, setExpenses] = useState([]);

  // Navigation tab state - defaults to 'overview'
  const [activeTab, setActiveTab] = useState('overview');

  const fetchTripDetails = async () => {
    setIsLoadingTrip(true);
    setTripError('');
    try {
      const data = await getTripByIdApi(id);
      setTrip(data);
      try {
        const savedItinerary = await getSavedItineraryApi(id);
        setItinerary(savedItinerary);
      } catch {
        // No saved itinerary found (e.g. 404)
        setItinerary(null);
      }
    } catch (err) {
      console.error('Failed to fetch trip details:', err);
      setTripError(
        err.response?.status === 404
          ? 'Trip not found or you do not have permission to view it.'
          : 'Failed to load trip details. Please try again.'
      );
    } finally {
      setIsLoadingTrip(false);
    }
  };

  // Fetch expenses at the TripDetails level so TripAnalytics can share the same data
  const fetchExpenses = async () => {
    if (!id) return;
    try {
      const data = await getExpensesApi(id);
      setExpenses(data || []);
    } catch {
      setExpenses([]);
    }
  };

  useEffect(() => {
    if (id) {
      fetchTripDetails();
      fetchExpenses();
    }
  }, [id]);

  const handleGenerateItinerary = async () => {
    setIsGenerating(true);
    setItineraryError('');
    try {
      const data = await generateItineraryApi(id);
      setItinerary(data);
    } catch (err) {
      console.error('Failed to generate AI itinerary:', err);
      const msg = err.response?.data?.message || 'Failed to generate itinerary. Please try again.';
      setItineraryError(msg);
    } finally {
      setIsGenerating(false);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    try {
      return new Date(dateString).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric'
      });
    } catch {
      return dateString;
    }
  };

  const formatCurrency = (amount) => {
    if (amount === undefined || amount === null) return '$0';
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      maximumFractionDigits: 0
    }).format(amount);
  };

  const calculateDayTotal = (day) => {
    const morningCost = day?.morning?.estimatedCost || 0;
    const afternoonCost = day?.afternoon?.estimatedCost || 0;
    const eveningCost = day?.evening?.estimatedCost || 0;
    return morningCost + afternoonCost + eveningCost;
  };

  const getDurationDays = () => {
    if (!trip?.startDate || !trip?.endDate) return null;
    try {
      const start = new Date(trip.startDate);
      const end = new Date(trip.endDate);
      const diffTime = Math.abs(end - start);
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
      return diffDays;
    } catch {
      return null;
    }
  };

  const totalSpent = expenses.reduce((sum, item) => sum + (Number(item.amount) || 0), 0);
  const remainingBudget = (trip?.budget || 0) - totalSpent;
  const durationDays = getDurationDays();

  return (
    <div className="min-h-screen flex flex-col bg-stone-50 dark:bg-stone-950 text-stone-900 dark:text-stone-100 font-sans transition-colors">
      <Navbar />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {/* Navigation Header */}
        <div className="mb-6 flex items-center justify-between">
          <Link
            to="/dashboard"
            className="inline-flex items-center gap-2 text-sm font-semibold text-emerald-700 dark:text-emerald-400 hover:text-emerald-900 dark:hover:text-emerald-300 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Dashboard</span>
          </Link>

          {trip && (
            <button
              onClick={() => navigate(`/create-trip?edit=${trip.id}`)}
              className="px-4 py-2 rounded-xl bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 text-stone-700 dark:text-stone-200 font-semibold text-xs hover:bg-stone-100 dark:hover:bg-stone-800 transition-all flex items-center gap-2 shadow-sm cursor-pointer"
            >
              <Edit3 className="w-4 h-4 text-emerald-600" />
              <span>Edit Trip</span>
            </button>
          )}
        </div>

        {/* Loading State for Trip Details */}
        {isLoadingTrip ? (
          <div className="bg-white dark:bg-stone-900 rounded-3xl p-12 text-center border border-stone-200 dark:border-stone-800 shadow-sm">
            <RefreshCw className="w-8 h-8 text-emerald-700 animate-spin mx-auto mb-3" />
            <p className="text-sm font-semibold text-stone-700 dark:text-stone-300">Loading trip information...</p>
          </div>
        ) : tripError ? (
          <div className="bg-white dark:bg-stone-900 rounded-3xl p-8 text-center border border-rose-200 dark:border-rose-900/50 shadow-sm">
            <AlertCircle className="w-10 h-10 text-rose-500 mx-auto mb-3" />
            <h2 className="text-lg font-bold text-stone-900 dark:text-white">{tripError}</h2>
            <div className="mt-4">
              <Link
                to="/dashboard"
                className="px-5 py-2.5 rounded-xl bg-emerald-700 text-white font-bold text-xs hover:bg-emerald-800 transition-all inline-block"
              >
                Return to Dashboard
              </Link>
            </div>
          </div>
        ) : (
          <>
            {/* Trip Header Banner */}
            <div className="bg-gradient-to-r from-stone-900 via-emerald-950 to-stone-900 rounded-3xl p-6 sm:p-8 text-white shadow-xl shadow-stone-950/20 mb-6 relative overflow-hidden">
              <div className="absolute right-0 top-0 translate-x-12 -translate-y-12 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

              <div className="relative z-10">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                  <div>
                    <span className="inline-block px-3.5 py-1 rounded-full bg-white/10 backdrop-blur-md text-xs font-bold uppercase tracking-wider text-emerald-200 border border-white/10 mb-3">
                      {trip.travelStyle || 'Leisure Trip'}
                    </span>
                    <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight">
                      {trip.tripName}
                    </h1>
                    <div className="flex items-center gap-2 text-stone-300 text-base font-medium mt-2">
                      <MapPin className="w-5 h-5 text-emerald-400" />
                      <span>{trip.destination}</span>
                    </div>
                  </div>

                  {/* Quick Action Button */}
                  <div className="flex flex-col items-stretch sm:items-end gap-3">
                    <button
                      onClick={() => {
                        if (!itinerary) {
                          handleGenerateItinerary();
                        }
                        setActiveTab('itinerary');
                      }}
                      disabled={isGenerating}
                      className="px-6 py-3.5 rounded-2xl bg-emerald-700 hover:bg-emerald-800 text-white font-extrabold text-xs sm:text-sm shadow-xl shadow-stone-950/30 transition-all flex items-center justify-center gap-2.5 disabled:opacity-60 cursor-pointer disabled:cursor-not-allowed group"
                    >
                      <Sparkles className={`w-4 h-4 text-amber-300 ${isGenerating ? 'animate-spin' : 'group-hover:rotate-12 transition-transform'}`} />
                      <span>{isGenerating ? 'Generating AI Itinerary...' : itinerary ? 'View AI Itinerary' : 'Generate AI Itinerary'}</span>
                    </button>
                    {itinerary && (
                      <span className="text-[11px] text-emerald-300 flex items-center gap-1 justify-center sm:justify-end">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>Itinerary Ready</span>
                      </span>
                    )}
                  </div>
                </div>

                {/* Trip Attributes Bar */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-6 pt-6 border-t border-white/10 text-xs font-medium">
                  <div className="p-3 rounded-2xl bg-white/10 backdrop-blur-md border border-white/10">
                    <span className="text-stone-300 block text-[10px] uppercase font-bold tracking-wider mb-0.5 flex items-center gap-1">
                      <Calendar className="w-3 h-3 text-emerald-300" />
                      Dates
                    </span>
                    <span className="text-white font-extrabold text-xs sm:text-sm block truncate">
                      {formatDate(trip.startDate)} – {formatDate(trip.endDate)}
                    </span>
                  </div>

                  <div className="p-3 rounded-2xl bg-white/10 backdrop-blur-md border border-white/10">
                    <span className="text-stone-300 block text-[10px] uppercase font-bold tracking-wider mb-0.5 flex items-center gap-1">
                      <Users className="w-3 h-3 text-teal-300" />
                      Travelers
                    </span>
                    <span className="text-white font-extrabold text-xs sm:text-sm block">
                      {trip.travelers} {trip.travelers === 1 ? 'Person' : 'People'}
                    </span>
                  </div>

                  <div className="p-3 rounded-2xl bg-white/10 backdrop-blur-md border border-white/10">
                    <span className="text-stone-300 block text-[10px] uppercase font-bold tracking-wider mb-0.5 flex items-center gap-1">
                      <DollarSign className="w-3 h-3 text-amber-300" />
                      Budget
                    </span>
                    <span className="text-white font-extrabold text-xs sm:text-sm block">
                      {formatCurrency(trip.budget)}
                    </span>
                  </div>

                  <div className="p-3 rounded-2xl bg-white/10 backdrop-blur-md border border-white/10">
                    <span className="text-stone-300 block text-[10px] uppercase font-bold tracking-wider mb-0.5 flex items-center gap-1">
                      <Compass className="w-3 h-3 text-stone-300" />
                      Style
                    </span>
                    <span className="text-white font-extrabold text-xs sm:text-sm block truncate">
                      {trip.travelStyle || 'Leisure'}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Mobile Horizontal Tab Navigation */}
            <div className="lg:hidden flex items-center gap-2 overflow-x-auto pb-2 mb-6 scrollbar-none">
              {NAV_ITEMS.map((item) => {
                const IconComponent = item.icon;
                const isActive = activeTab === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => setActiveTab(item.id)}
                    className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold shrink-0 transition-all cursor-pointer ${
                      isActive
                        ? 'bg-emerald-700 text-white shadow-md shadow-emerald-900/20'
                        : 'bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 text-stone-700 dark:text-stone-300 hover:bg-stone-100 dark:hover:bg-stone-800'
                    }`}
                  >
                    <IconComponent className="w-3.5 h-3.5" />
                    <span>{item.label}</span>
                  </button>
                );
              })}
            </div>

            {/* Desktop Sidebar + Main Content Layout */}
            <div className="flex flex-col lg:flex-row gap-8 items-start">

              {/* Desktop Left Sidebar */}
              <aside className="hidden lg:block w-64 shrink-0 bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-3xl p-4 shadow-sm sticky top-24">
                <div className="px-3 pb-3 mb-2 border-b border-stone-100 dark:border-stone-800 flex items-center justify-between">
                  <span className="text-[11px] font-extrabold uppercase tracking-wider text-stone-400 dark:text-stone-500">
                    Trip Navigation
                  </span>
                  <Link
                    to="/dashboard"
                    title="Return to Dashboard"
                    className="p-1 rounded-lg text-stone-400 hover:text-emerald-700 dark:hover:text-emerald-400 transition-colors"
                  >
                    <ArrowLeft className="w-3.5 h-3.5" />
                  </Link>
                </div>

                <nav className="space-y-1">
                  {NAV_ITEMS.map((item) => {
                    const IconComponent = item.icon;
                    const isActive = activeTab === item.id;
                    return (
                      <button
                        key={item.id}
                        onClick={() => setActiveTab(item.id)}
                        className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-2xl text-xs font-bold transition-all cursor-pointer ${
                          isActive
                            ? 'bg-emerald-700 text-white shadow-md shadow-emerald-900/20'
                            : 'text-stone-600 dark:text-stone-400 hover:bg-stone-100 dark:hover:bg-stone-800 hover:text-stone-900 dark:hover:text-white'
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <IconComponent className={`w-4 h-4 ${isActive ? 'text-white' : 'text-stone-500 dark:text-stone-400'}`} />
                          <span>{item.label}</span>
                        </div>
                        {isActive && <ChevronRight className="w-3.5 h-3.5 opacity-80" />}
                      </button>
                    );
                  })}
                </nav>
              </aside>

              {/* Main Content Area */}
              <div className="flex-1 min-w-0 w-full">

                {/* TAB 1: OVERVIEW */}
                {activeTab === 'overview' && (
                  <div className="space-y-6">
                    {/* Summary KPI Cards Grid */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                      
                      <div className="bg-white dark:bg-stone-900 rounded-3xl p-5 border border-stone-200 dark:border-stone-800 shadow-sm flex items-center gap-4">
                        <div className="h-12 w-12 rounded-2xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center border border-emerald-500/20">
                          <Wallet className="w-6 h-6" />
                        </div>
                        <div>
                          <span className="text-[10px] font-bold uppercase tracking-wider text-stone-400 dark:text-stone-500 block">Total Budget</span>
                          <span className="text-xl font-extrabold text-stone-900 dark:text-white">{formatCurrency(trip.budget)}</span>
                        </div>
                      </div>

                      <div className="bg-white dark:bg-stone-900 rounded-3xl p-5 border border-stone-200 dark:border-stone-800 shadow-sm flex items-center gap-4">
                        <div className="h-12 w-12 rounded-2xl bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center border border-amber-500/20">
                          <Receipt className="w-6 h-6" />
                        </div>
                        <div>
                          <span className="text-[10px] font-bold uppercase tracking-wider text-stone-400 dark:text-stone-500 block">Total Spent</span>
                          <span className="text-xl font-extrabold text-stone-900 dark:text-white">{formatCurrency(totalSpent)}</span>
                        </div>
                      </div>

                      <div className="bg-white dark:bg-stone-900 rounded-3xl p-5 border border-stone-200 dark:border-stone-800 shadow-sm flex items-center gap-4">
                        <div className={`h-12 w-12 rounded-2xl flex items-center justify-center border ${remainingBudget >= 0 ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20' : 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20'}`}>
                          <DollarSign className="w-6 h-6" />
                        </div>
                        <div>
                          <span className="text-[10px] font-bold uppercase tracking-wider text-stone-400 dark:text-stone-500 block">{remainingBudget >= 0 ? 'Remaining' : 'Over Budget'}</span>
                          <span className={`text-xl font-extrabold ${remainingBudget >= 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'}`}>
                            {formatCurrency(Math.abs(remainingBudget))}
                          </span>
                        </div>
                      </div>

                      <div className="bg-white dark:bg-stone-900 rounded-3xl p-5 border border-stone-200 dark:border-stone-800 shadow-sm flex items-center gap-4">
                        <div className="h-12 w-12 rounded-2xl bg-teal-500/10 text-teal-600 dark:text-teal-400 flex items-center justify-center border border-teal-500/20">
                          <Clock className="w-6 h-6" />
                        </div>
                        <div>
                          <span className="text-[10px] font-bold uppercase tracking-wider text-stone-400 dark:text-stone-500 block">Trip Duration</span>
                          <span className="text-xl font-extrabold text-stone-900 dark:text-white">
                            {durationDays ? `${durationDays} Days` : 'N/A'}
                          </span>
                        </div>
                      </div>

                    </div>

                    {/* Quick Access Feature Cards */}
                    <div className="bg-white dark:bg-stone-900 rounded-3xl p-6 border border-stone-200 dark:border-stone-800 shadow-sm">
                      <h2 className="text-lg font-bold text-stone-900 dark:text-white mb-4">
                        Quick Feature Hub
                      </h2>
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">

                        <button
                          onClick={() => setActiveTab('itinerary')}
                          className="p-5 rounded-2xl bg-emerald-500/5 dark:bg-emerald-500/10 border border-emerald-500/20 hover:border-emerald-500/50 text-left transition-all group cursor-pointer"
                        >
                          <div className="flex items-center justify-between mb-3">
                            <Sparkles className="w-6 h-6 text-emerald-600 dark:text-emerald-400 group-hover:scale-110 transition-transform" />
                            <ChevronRight className="w-4 h-4 text-stone-400 group-hover:translate-x-1 transition-transform" />
                          </div>
                          <h3 className="text-sm font-bold text-stone-900 dark:text-white">AI Itinerary</h3>
                          <p className="text-xs text-stone-500 dark:text-stone-400 mt-1">
                            {itinerary ? `${itinerary.days?.length || 0} Day AI plan ready` : 'Generate customized plan'}
                          </p>
                        </button>

                        <button
                          onClick={() => setActiveTab('assistant')}
                          className="p-5 rounded-2xl bg-teal-500/5 dark:bg-teal-500/10 border border-teal-500/20 hover:border-teal-500/50 text-left transition-all group cursor-pointer"
                        >
                          <div className="flex items-center justify-between mb-3">
                            <Bot className="w-6 h-6 text-teal-600 dark:text-teal-400 group-hover:scale-110 transition-transform" />
                            <ChevronRight className="w-4 h-4 text-stone-400 group-hover:translate-x-1 transition-transform" />
                          </div>
                          <h3 className="text-sm font-bold text-stone-900 dark:text-white">AI Travel Assistant</h3>
                          <p className="text-xs text-stone-500 dark:text-stone-400 mt-1">Ask questions about {trip.destination}</p>
                        </button>

                        <button
                          onClick={() => setActiveTab('expenses')}
                          className="p-5 rounded-2xl bg-amber-500/5 dark:bg-amber-500/10 border border-amber-500/20 hover:border-amber-500/50 text-left transition-all group cursor-pointer"
                        >
                          <div className="flex items-center justify-between mb-3">
                            <Receipt className="w-6 h-6 text-amber-600 dark:text-amber-400 group-hover:scale-110 transition-transform" />
                            <ChevronRight className="w-4 h-4 text-stone-400 group-hover:translate-x-1 transition-transform" />
                          </div>
                          <h3 className="text-sm font-bold text-stone-900 dark:text-white">Expense Tracker</h3>
                          <p className="text-xs text-stone-500 dark:text-stone-400 mt-1">{expenses.length} logged expenses</p>
                        </button>

                        <button
                          onClick={() => setActiveTab('analytics')}
                          className="p-5 rounded-2xl bg-emerald-500/5 dark:bg-emerald-500/10 border border-emerald-500/20 hover:border-emerald-500/50 text-left transition-all group cursor-pointer"
                        >
                          <div className="flex items-center justify-between mb-3">
                            <TrendingUp className="w-6 h-6 text-emerald-600 dark:text-emerald-400 group-hover:scale-110 transition-transform" />
                            <ChevronRight className="w-4 h-4 text-stone-400 group-hover:translate-x-1 transition-transform" />
                          </div>
                          <h3 className="text-sm font-bold text-stone-900 dark:text-white">Trip Analytics</h3>
                          <p className="text-xs text-stone-500 dark:text-stone-400 mt-1">Visual spending breakdown</p>
                        </button>

                        <button
                          onClick={() => setActiveTab('weather')}
                          className="p-5 rounded-2xl bg-amber-500/5 dark:bg-amber-500/10 border border-amber-500/20 hover:border-amber-500/50 text-left transition-all group cursor-pointer"
                        >
                          <div className="flex items-center justify-between mb-3">
                            <Sun className="w-6 h-6 text-amber-500 group-hover:scale-110 transition-transform" />
                            <ChevronRight className="w-4 h-4 text-stone-400 group-hover:translate-x-1 transition-transform" />
                          </div>
                          <h3 className="text-sm font-bold text-stone-900 dark:text-white">Live Weather</h3>
                          <p className="text-xs text-stone-500 dark:text-stone-400 mt-1">Forecast for {trip.destination}</p>
                        </button>

                        <button
                          onClick={() => setActiveTab('map')}
                          className="p-5 rounded-2xl bg-rose-500/5 dark:bg-rose-500/10 border border-rose-500/20 hover:border-rose-500/50 text-left transition-all group cursor-pointer"
                        >
                          <div className="flex items-center justify-between mb-3">
                            <MapPin className="w-6 h-6 text-rose-500 group-hover:scale-110 transition-transform" />
                            <ChevronRight className="w-4 h-4 text-stone-400 group-hover:translate-x-1 transition-transform" />
                          </div>
                          <h3 className="text-sm font-bold text-stone-900 dark:text-white">Interactive Map</h3>
                          <p className="text-xs text-stone-500 dark:text-stone-400 mt-1">Location details</p>
                        </button>

                      </div>
                    </div>
                  </div>
                )}

                {/* TAB 2: ITINERARY */}
                {activeTab === 'itinerary' && (
                  <div className="space-y-6">
                    {itineraryError && (
                      <div className="p-5 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-700 dark:text-rose-300 text-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                        <div className="flex items-center gap-3">
                          <AlertCircle className="w-6 h-6 flex-shrink-0 text-rose-500" />
                          <div>
                            <h4 className="font-bold">Itinerary Generation Failed</h4>
                            <p className="text-xs text-rose-600 dark:text-rose-400 mt-0.5">{itineraryError}</p>
                          </div>
                        </div>
                        <button
                          onClick={handleGenerateItinerary}
                          disabled={isGenerating}
                          className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs transition-all flex items-center gap-2 cursor-pointer self-stretch sm:self-auto justify-center"
                        >
                          <RefreshCw className={`w-3.5 h-3.5 ${isGenerating ? 'animate-spin' : ''}`} />
                          <span>Try Again</span>
                        </button>
                      </div>
                    )}

                    {isGenerating && (
                      <div className="bg-white dark:bg-stone-900 rounded-3xl p-12 text-center border border-emerald-200 dark:border-emerald-900/60 shadow-xl">
                        <div className="h-16 w-16 rounded-3xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mx-auto mb-4 border border-emerald-200 dark:border-emerald-800">
                          <Sparkles className="w-8 h-8 animate-spin text-emerald-500" />
                        </div>
                        <h3 className="text-xl font-bold text-stone-900 dark:text-white">AI Travel Agent at Work</h3>
                        <p className="text-sm text-stone-500 dark:text-stone-400 mt-2 max-w-md mx-auto">
                          Analyzing trip details for {trip.destination}, optimizing activities, budgeting, and crafting your day-by-day plan...
                        </p>
                      </div>
                    )}

                    {itinerary && !isGenerating && (
                      <div className="space-y-6">
                        <div className="flex items-center justify-between">
                          <div>
                            <h2 className="text-2xl font-extrabold text-stone-900 dark:text-white flex items-center gap-2">
                              <Sparkles className="w-6 h-6 text-emerald-600 dark:text-emerald-400" />
                              <span>Personalized Day-by-Day Itinerary</span>
                            </h2>
                            <p className="text-xs text-stone-500 dark:text-stone-400 mt-1">
                              {itinerary.days?.length || 0} Day Travel Plan for {itinerary.destination || trip.destination}
                            </p>
                          </div>

                          <button
                            onClick={handleGenerateItinerary}
                            className="px-4 py-2 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 text-xs font-bold hover:bg-emerald-100 dark:hover:bg-emerald-900/60 transition-all flex items-center gap-2 cursor-pointer"
                          >
                            <RefreshCw className="w-3.5 h-3.5" />
                            <span>Regenerate</span>
                          </button>
                        </div>

                        <div className="space-y-6">
                          {itinerary.days?.map((day, idx) => (
                            <div
                              key={day.day || idx}
                              className="bg-white dark:bg-stone-900 rounded-3xl border border-stone-200 dark:border-stone-800 shadow-sm overflow-hidden"
                            >
                              <div className="bg-stone-100 dark:bg-stone-800/60 px-6 py-4 border-b border-stone-200 dark:border-stone-700 flex flex-wrap items-center justify-between gap-4">
                                <div className="flex items-center gap-3">
                                  <span className="h-9 w-9 rounded-2xl bg-emerald-700 text-white font-black text-sm flex items-center justify-center shadow-md">
                                    {day.day}
                                  </span>
                                  <div>
                                    <h3 className="text-lg font-bold text-stone-900 dark:text-white">
                                      Day {day.day}
                                    </h3>
                                    {day.date && (
                                      <p className="text-xs text-stone-500 dark:text-stone-400 flex items-center gap-1">
                                        <Calendar className="w-3 h-3 text-emerald-600" />
                                        <span>{formatDate(day.date)}</span>
                                      </p>
                                    )}
                                  </div>
                                </div>

                                <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-700 dark:text-amber-300 text-xs font-bold">
                                  <DollarSign className="w-3.5 h-3.5" />
                                  <span>Est. Day Total: {formatCurrency(calculateDayTotal(day))}</span>
                                </div>
                              </div>

                              <div className="p-6 grid grid-cols-1 md:grid-cols-3 gap-6">
                                <div className="p-5 rounded-2xl bg-amber-500/5 dark:bg-amber-500/10 border border-amber-500/20 flex flex-col justify-between">
                                  <div>
                                    <div className="flex items-center justify-between mb-3">
                                      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-amber-500/20 text-amber-700 dark:text-amber-300">
                                        <Sun className="w-3.5 h-3.5" />
                                        <span>Morning</span>
                                      </span>
                                      <span className="text-xs font-bold text-stone-600 dark:text-stone-400">
                                        {formatCurrency(day.morning?.estimatedCost)}
                                      </span>
                                    </div>
                                    <h4 className="text-base font-bold text-stone-900 dark:text-white">
                                      {day.morning?.activity || 'Morning Exploration'}
                                    </h4>
                                    <p className="text-xs text-stone-600 dark:text-stone-300 mt-2 leading-relaxed">
                                      {day.morning?.description || 'No description provided.'}
                                    </p>
                                  </div>
                                </div>

                                <div className="p-5 rounded-2xl bg-teal-500/5 dark:bg-teal-500/10 border border-teal-500/20 flex flex-col justify-between">
                                  <div>
                                    <div className="flex items-center justify-between mb-3">
                                      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-teal-500/20 text-teal-700 dark:text-teal-300">
                                        <Clock className="w-3.5 h-3.5" />
                                        <span>Afternoon</span>
                                      </span>
                                      <span className="text-xs font-bold text-stone-600 dark:text-stone-400">
                                        {formatCurrency(day.afternoon?.estimatedCost)}
                                      </span>
                                    </div>
                                    <h4 className="text-base font-bold text-stone-900 dark:text-white">
                                      {day.afternoon?.activity || 'Afternoon Tour'}
                                    </h4>
                                    <p className="text-xs text-stone-600 dark:text-stone-300 mt-2 leading-relaxed">
                                      {day.afternoon?.description || 'No description provided.'}
                                    </p>
                                  </div>
                                </div>

                                <div className="p-5 rounded-2xl bg-rose-500/5 dark:bg-rose-500/10 border border-rose-500/20 flex flex-col justify-between">
                                  <div>
                                    <div className="flex items-center justify-between mb-3">
                                      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-rose-500/20 text-rose-700 dark:text-rose-300">
                                        <Sunset className="w-3.5 h-3.5" />
                                        <span>Evening</span>
                                      </span>
                                      <span className="text-xs font-bold text-stone-600 dark:text-stone-400">
                                        {formatCurrency(day.evening?.estimatedCost)}
                                      </span>
                                    </div>
                                    <h4 className="text-base font-bold text-stone-900 dark:text-white">
                                      {day.evening?.activity || 'Evening Dining & Entertainment'}
                                    </h4>
                                    <p className="text-xs text-stone-600 dark:text-stone-300 mt-2 leading-relaxed">
                                      {day.evening?.description || 'No description provided.'}
                                    </p>
                                  </div>
                                </div>
                              </div>

                              {day.tip && (
                                <div className="px-6 pb-6">
                                  <div className="p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-100 dark:border-emerald-900/50 flex items-start gap-3 text-xs">
                                    <Lightbulb className="w-5 h-5 text-amber-500 flex-shrink-0 mt-0.5" />
                                    <div>
                                      <span className="font-bold text-emerald-900 dark:text-emerald-300 block mb-0.5">
                                        Practical Tip for Day {day.day}:
                                      </span>
                                      <p className="text-stone-700 dark:text-stone-300">
                                        {day.tip}
                                      </p>
                                    </div>
                                  </div>
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {!itinerary && !isGenerating && (
                      <div className="bg-white dark:bg-stone-900 rounded-3xl p-12 text-center border border-stone-200 dark:border-stone-800 shadow-sm">
                        <div className="h-16 w-16 rounded-3xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mx-auto mb-4 border border-emerald-200 dark:border-emerald-800">
                          <Sparkles className="w-8 h-8 text-emerald-500" />
                        </div>
                        <h3 className="text-xl font-bold text-stone-900 dark:text-white">No AI Itinerary Generated Yet</h3>
                        <p className="text-sm text-stone-500 dark:text-stone-400 mt-2 max-w-md mx-auto">
                          Generate a customized, day-by-day travel plan tailored to your budget and travel style.
                        </p>
                        <div className="mt-6">
                          <button
                            onClick={handleGenerateItinerary}
                            className="px-6 py-3 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-sm transition-all inline-flex items-center gap-2 shadow-lg shadow-emerald-900/25 cursor-pointer"
                          >
                            <Sparkles className="w-4 h-4 text-amber-300" />
                            <span>Generate Itinerary Now</span>
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* TAB 3: ASSISTANT */}
                {activeTab === 'assistant' && (
                  <AITravelAssistant tripId={trip.id} destination={trip.destination} />
                )}

                {/* TAB 4: BUDGET */}
                {activeTab === 'budget' && (
                  <TripBudgetSummary trip={trip} itinerary={itinerary} />
                )}

                {/* TAB 5: EXPENSES */}
                {activeTab === 'expenses' && (
                  <ExpenseTracker
                    tripId={trip.id}
                    expenses={expenses}
                    setExpenses={setExpenses}
                  />
                )}

                {/* TAB 6: WEATHER */}
                {activeTab === 'weather' && (
                  <WeatherCard destination={trip.destination} />
                )}

                {/* TAB 7: MAP */}
                {activeTab === 'map' && (
                  <DestinationMap destination={trip.destination} />
                )}

                {/* TAB 8: CHECKLIST */}
                {activeTab === 'checklist' && (
                  <TravelChecklist tripId={trip.id} />
                )}

                {/* TAB 9: CURRENCY */}
                {activeTab === 'currency' && (
                  <CurrencyConverter />
                )}

                {/* TAB 10: ANALYTICS */}
                {activeTab === 'analytics' && (
                  <TripAnalytics
                    trip={trip}
                    expenses={expenses}
                    itinerary={itinerary}
                  />
                )}

              </div>
            </div>
          </>
        )}

      </main>

      <Footer />
    </div>
  );
};

export default TripDetails;
