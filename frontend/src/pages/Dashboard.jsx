import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { getTripsApi, deleteTripApi } from '../api/trips';
import { 
  Mail, 
  ShieldCheck, 
  Calendar, 
  Key, 
  LogOut, 
  Sparkles, 
  CheckCircle2, 
  Compass, 
  Plus, 
  MapPin, 
  Users, 
  DollarSign, 
  Trash2, 
  Edit3, 
  AlertCircle, 
  RefreshCw, 
  Plane 
} from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';

const Dashboard = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const [trips, setTrips] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState('');
  const [deletingId, setDeletingId] = useState(null);
  const [deleteSuccessMsg, setDeleteSuccessMsg] = useState('');

  const fetchTrips = async () => {
    setIsLoading(true);
    setErrorMessage('');
    try {
      const data = await getTripsApi();
      setTrips(data);
    } catch (err) {
      console.error('Failed to load trips:', err);
      setErrorMessage('Failed to load your trips. Please refresh or try again.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchTrips();
  }, []);

  const handleDeleteTrip = async (tripId, tripName) => {
    if (!window.confirm(`Are you sure you want to delete "${tripName}"?`)) {
      return;
    }

    setDeletingId(tripId);
    try {
      await deleteTripApi(tripId);
      setTrips((prev) => prev.filter((t) => t.id !== tripId));
      setDeleteSuccessMsg(`Trip "${tripName}" deleted successfully.`);
      setTimeout(() => setDeleteSuccessMsg(''), 4000);
    } catch (err) {
      console.error('Failed to delete trip:', err);
      alert('Failed to delete trip. Please try again.');
    } finally {
      setDeletingId(null);
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

  return (
    <div className="min-h-screen flex flex-col bg-stone-50 dark:bg-stone-950 text-stone-900 dark:text-stone-100 font-sans transition-colors">
      <Navbar />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-10">
        
        {/* Welcome Header */}
        <div className="bg-gradient-to-r from-stone-900 via-emerald-950 to-stone-900 rounded-3xl p-8 text-white shadow-xl shadow-stone-950/20 mb-8 relative overflow-hidden">
          <div className="absolute right-0 top-0 translate-x-12 -translate-y-12 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

          <div className="relative z-10 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md text-xs font-medium text-emerald-200 mb-3 border border-white/10">
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                <span>Authenticated Session Active</span>
              </div>
              <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight">
                Welcome back, {user?.name || 'Traveler'}!
              </h1>
              <p className="mt-2 text-emerald-100/80 text-sm max-w-xl">
                Manage your personalized trip itineraries. Create, view, edit, or remove your upcoming travel plans.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <Link
                to="/create-trip"
                className="px-5 py-3 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-sm transition-all flex items-center gap-2 shadow-lg shadow-emerald-950/30 cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>Create New Trip</span>
              </Link>
              <button
                onClick={logout}
                className="px-4 py-3 rounded-xl bg-stone-800/80 border border-stone-700 text-stone-200 hover:bg-stone-800 font-semibold text-sm transition-all flex items-center gap-2 cursor-pointer"
              >
                <LogOut className="w-4 h-4" />
                <span>Sign Out</span>
              </button>
            </div>
          </div>
        </div>

        {/* Success / Error Banners */}
        {deleteSuccessMsg && (
          <div className="mb-6 p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-700 dark:text-emerald-400 text-sm flex items-center gap-3">
            <CheckCircle2 className="w-5 h-5 flex-shrink-0" />
            <span>{deleteSuccessMsg}</span>
          </div>
        )}

        {errorMessage && (
          <div className="mb-6 p-4 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-700 dark:text-rose-400 text-sm flex items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <AlertCircle className="w-5 h-5 flex-shrink-0" />
              <span>{errorMessage}</span>
            </div>
            <button
              onClick={fetchTrips}
              className="px-3 py-1 rounded-lg bg-rose-500/20 font-bold text-xs hover:bg-rose-500/30"
            >
              Retry
            </button>
          </div>
        )}

        {/* Trips Section Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-bold text-stone-900 dark:text-white flex items-center gap-2">
              <Plane className="w-6 h-6 text-emerald-700 dark:text-emerald-400" />
              <span>Your Planned Trips</span>
            </h2>
            <p className="text-xs text-stone-500 dark:text-stone-400 mt-1">
              Showing {trips.length} {trips.length === 1 ? 'trip' : 'trips'} associated with account {user?.email}
            </p>
          </div>

          <Link
            to="/create-trip"
            className="hidden sm:inline-flex items-center gap-2 text-xs font-bold text-emerald-700 dark:text-emerald-400 hover:text-emerald-800 dark:hover:text-emerald-300"
          >
            <Plus className="w-4 h-4" />
            <span>Add Trip</span>
          </Link>
        </div>

        {/* Loading State */}
        {isLoading ? (
          <div className="bg-white dark:bg-stone-900 rounded-3xl p-12 text-center border border-stone-200 dark:border-stone-800 shadow-sm mb-10">
            <RefreshCw className="w-8 h-8 text-emerald-600 animate-spin mx-auto mb-3" />
            <p className="text-sm font-semibold text-stone-700 dark:text-stone-300">Fetching your trips from server...</p>
          </div>
        ) : trips.length === 0 ? (
          /* Empty State */
          <div className="bg-white dark:bg-stone-900 rounded-3xl p-12 text-center border border-stone-200 dark:border-stone-800 shadow-sm mb-10">
            <div className="h-16 w-16 rounded-3xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mx-auto mb-4 border border-emerald-200 dark:border-emerald-800">
              <Compass className="w-8 h-8 animate-pulse" />
            </div>
            <h3 className="text-xl font-bold text-stone-900 dark:text-white">No trips planned yet</h3>
            <p className="text-sm text-stone-500 dark:text-stone-400 mt-2 max-w-md mx-auto">
              Start by creating your first trip! Specify your destination, travel dates, travelers, and budget.
            </p>
            <div className="mt-6">
              <Link
                to="/create-trip"
                className="inline-flex items-center gap-2 px-6 py-3 rounded-xl font-bold text-white bg-emerald-700 hover:bg-emerald-800 shadow-lg shadow-emerald-900/20 transition-all text-sm"
              >
                <Plus className="w-4 h-4" />
                <span>Create Your First Trip</span>
              </Link>
            </div>
          </div>
        ) : (
          /* Trip Cards Grid */
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-10">
            {trips.map((trip) => (
              <div
                key={trip.id}
                className="bg-white dark:bg-stone-900 rounded-3xl border border-stone-200 dark:border-stone-800 shadow-sm hover:shadow-md transition-all flex flex-col justify-between overflow-hidden group"
              >
                {/* Card Top Banner */}
                <div className="p-6 pb-4">
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <span className="px-3 py-1 rounded-full text-[11px] font-bold uppercase tracking-wider bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800/60">
                      {trip.travelStyle || 'Leisure'}
                    </span>
                    
                    {/* Action buttons */}
                    <div className="flex items-center gap-1 opacity-90 group-hover:opacity-100 transition-opacity">
                      <button
                        onClick={() => navigate(`/create-trip?edit=${trip.id}`)}
                        className="p-2 rounded-lg text-stone-400 hover:text-emerald-600 dark:hover:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-950/50 transition-all"
                        title="Edit Trip"
                      >
                        <Edit3 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDeleteTrip(trip.id, trip.tripName)}
                        disabled={deletingId === trip.id}
                        className="p-2 rounded-lg text-stone-400 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/50 transition-all disabled:opacity-50"
                        title="Delete Trip"
                      >
                        {deletingId === trip.id ? (
                          <RefreshCw className="w-4 h-4 animate-spin text-rose-500" />
                        ) : (
                          <Trash2 className="w-4 h-4" />
                        )}
                      </button>
                    </div>
                  </div>

                  <Link
                    to={`/trips/${trip.id}`}
                    className="block group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors"
                  >
                    <h3 className="text-xl font-extrabold text-stone-900 dark:text-white">
                      {trip.tripName}
                    </h3>
                  </Link>

                  <div className="flex items-center gap-2 text-sm font-semibold text-stone-600 dark:text-stone-300 mt-2">
                    <MapPin className="w-4 h-4 text-teal-600 dark:text-teal-400 flex-shrink-0" />
                    <span>{trip.destination}</span>
                  </div>
                </div>

                {/* Card Details Body */}
                <div className="p-6 pt-0 space-y-3 text-xs font-medium text-stone-600 dark:text-stone-400">
                  <div className="flex items-center justify-between p-3 rounded-2xl bg-stone-50 dark:bg-stone-950 border border-stone-100 dark:border-stone-800">
                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                      <span>Dates:</span>
                    </div>
                    <span className="font-bold text-stone-900 dark:text-white">
                      {formatDate(trip.startDate)} – {formatDate(trip.endDate)}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div className="p-3 rounded-2xl bg-stone-50 dark:bg-stone-950 border border-stone-100 dark:border-stone-800">
                      <div className="flex items-center gap-1.5 text-stone-400 mb-1">
                        <Users className="w-3.5 h-3.5 text-emerald-500" />
                        <span className="text-[10px] uppercase font-bold tracking-wider">Travelers</span>
                      </div>
                      <span className="font-extrabold text-stone-900 dark:text-white text-sm">
                        {trip.travelers} {trip.travelers === 1 ? 'Person' : 'People'}
                      </span>
                    </div>

                    <div className="p-3 rounded-2xl bg-stone-50 dark:bg-stone-950 border border-stone-100 dark:border-stone-800">
                      <div className="flex items-center gap-1.5 text-stone-400 mb-1">
                        <DollarSign className="w-3.5 h-3.5 text-amber-500" />
                        <span className="text-[10px] uppercase font-bold tracking-wider">Budget</span>
                      </div>
                      <span className="font-extrabold text-stone-900 dark:text-white text-sm">
                        {formatCurrency(trip.budget)}
                      </span>
                    </div>
                  </div>

                  {/* AI Itinerary CTA */}
                  <Link
                    to={`/trips/${trip.id}`}
                    className="w-full mt-2 py-2.5 px-4 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 hover:bg-emerald-100 dark:hover:bg-emerald-900/60 border border-emerald-200 dark:border-emerald-800/80 text-emerald-700 dark:text-emerald-300 font-bold text-xs flex items-center justify-center gap-2 transition-all"
                  >
                    <Sparkles className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                    <span>View Details & AI Itinerary</span>
                  </Link>
                </div>

                {/* Card Footer Tag */}
                <div className="px-6 py-3 bg-stone-50 dark:bg-stone-950 border-t border-stone-100 dark:border-stone-800 flex items-center justify-between text-[11px] text-stone-400">
                  <span>Trip ID: #{trip.id}</span>
                  <span>Created {formatDate(trip.createdAt)}</span>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Profile & Account Details Summary */}
        <div className="bg-white dark:bg-stone-900 p-6 sm:p-8 rounded-3xl border border-stone-200 dark:border-stone-800 shadow-sm">
          <div className="flex items-center gap-4 mb-4">
            <div className="h-12 w-12 rounded-2xl bg-gradient-to-tr from-emerald-700 to-teal-800 flex items-center justify-center text-white text-xl font-black">
              {user?.name?.charAt(0).toUpperCase() || 'U'}
            </div>
            <div>
              <h2 className="text-lg font-bold text-stone-900 dark:text-white">{user?.name}</h2>
              <p className="text-xs text-stone-500 dark:text-stone-400">{user?.email}</p>
            </div>
          </div>
        </div>

      </main>

      <Footer />
    </div>
  );
};

export default Dashboard;
