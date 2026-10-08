import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { createTripApi, getTripByIdApi, updateTripApi } from '../api/trips';
import { 
  Plane, 
  MapPin, 
  Calendar, 
  Users, 
  DollarSign, 
  Compass, 
  ArrowLeft, 
  AlertCircle, 
  CheckCircle2, 
  RefreshCw 
} from 'lucide-react';

const CreateTrip = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const editId = searchParams.get('edit');

  const [formData, setFormData] = useState({
    tripName: '',
    city: '',
    country: '',
    startDate: '',
    endDate: '',
    travelers: 1,
    budget: '',
    travelStyle: 'Relaxation & Leisure'
  });

  const [isLoading, setIsLoading] = useState(false);
  const [isFetchingEdit, setIsFetchingEdit] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  const travelStyleOptions = [
    'Relaxation & Leisure',
    'Adventure & Outdoors',
    'Cultural & Historical',
    'Foodie & Culinary',
    'Luxury & Wellness',
    'Budget & Backpacking',
    'Family & Kid-Friendly'
  ];

  useEffect(() => {
    if (editId) {
      const fetchTripDetails = async () => {
        setIsFetchingEdit(true);
        try {
          const trip = await getTripByIdApi(editId);
          let cityVal = '';
          let countryVal = '';
          if (trip.destination) {
            if (trip.destination.includes(',')) {
              const parts = trip.destination.split(',');
              cityVal = parts[0].trim();
              countryVal = parts.slice(1).join(',').trim();
            } else {
              cityVal = trip.destination.trim();
            }
          }
          setFormData({
            tripName: trip.tripName || '',
            city: cityVal,
            country: countryVal,
            startDate: trip.startDate || '',
            endDate: trip.endDate || '',
            travelers: trip.travelers || 1,
            budget: trip.budget || '',
            travelStyle: trip.travelStyle || 'Relaxation & Leisure'
          });
        } catch (err) {
          console.error('Failed to load trip for editing:', err);
          setErrorMessage('Could not load trip details for editing.');
        } finally {
          setIsFetchingEdit(false);
        }
      };
      fetchTripDetails();
    }
  }, [editId]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value
    }));
    setErrorMessage('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage('');
    setSuccessMessage('');

    // Frontend validation
    if (!formData.tripName.trim()) {
      setErrorMessage('Trip name is required.');
      return;
    }
    if (!formData.city.trim()) {
      setErrorMessage('Destination city is required.');
      return;
    }
    if (!formData.country.trim()) {
      setErrorMessage('Country is required.');
      return;
    }
    if (!formData.startDate) {
      setErrorMessage('Start date is required.');
      return;
    }
    if (!formData.endDate) {
      setErrorMessage('End date is required.');
      return;
    }
    if (new Date(formData.endDate) < new Date(formData.startDate)) {
      setErrorMessage('End date must not be before start date.');
      return;
    }
    if (Number(formData.travelers) < 1) {
      setErrorMessage('Travelers must be at least 1.');
      return;
    }
    if (Number(formData.budget) < 0) {
      setErrorMessage('Budget must not be negative.');
      return;
    }

    setIsLoading(true);

    try {
      const combinedDestination = `${formData.city.trim()}, ${formData.country.trim()}`;
      const payload = {
        tripName: formData.tripName.trim(),
        destination: combinedDestination,
        startDate: formData.startDate,
        endDate: formData.endDate,
        travelers: Number(formData.travelers),
        budget: Number(formData.budget),
        travelStyle: formData.travelStyle
      };

      if (editId) {
        await updateTripApi(editId, payload);
        setSuccessMessage('Trip updated successfully! Redirecting to dashboard...');
      } else {
        await createTripApi(payload);
        setSuccessMessage('Trip created successfully! Redirecting to dashboard...');
      }

      setTimeout(() => {
        navigate('/dashboard');
      }, 1500);
    } catch (err) {
      console.error('Trip operation failed:', err);
      if (err.response && err.response.data) {
        if (err.response.data.errors) {
          const firstError = Object.values(err.response.data.errors)[0];
          setErrorMessage(firstError);
        } else if (err.response.data.message) {
          setErrorMessage(err.response.data.message);
        } else {
          setErrorMessage('Failed to save trip. Please check your inputs.');
        }
      } else {
        setErrorMessage('Server error. Please ensure backend is reachable.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-stone-50 dark:bg-stone-950 text-stone-900 dark:text-stone-100 font-sans">
      <Navbar />

      <main className="flex-1 max-w-4xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-10">
        
        {/* Header Navigation */}
        <div className="flex items-center justify-between mb-8">
          <Link
            to="/dashboard"
            className="inline-flex items-center gap-2 text-sm font-semibold text-stone-600 dark:text-stone-400 hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Dashboard</span>
          </Link>
          <span className="text-xs font-bold px-3 py-1 rounded-full bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800">
            {editId ? 'Edit Trip Mode' : 'New Trip Planner'}
          </span>
        </div>

        {/* Card Form */}
        <div className="bg-white dark:bg-stone-900 rounded-3xl p-6 sm:p-10 border border-stone-200 dark:border-stone-800 shadow-xl shadow-stone-200/50 dark:shadow-none">
          
          <div className="flex items-center gap-3 mb-6 pb-6 border-b border-stone-100 dark:border-stone-800">
            <div className="p-3 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 rounded-2xl">
              <Plane className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-2xl font-extrabold text-stone-900 dark:text-white">
                {editId ? 'Update Trip Details' : 'Plan a New Trip'}
              </h1>
              <p className="text-sm text-stone-500 dark:text-stone-400 mt-1">
                Fill in your trip details below. You can view and manage all planned trips on your dashboard.
              </p>
            </div>
          </div>

          {/* Feedback Banners */}
          {errorMessage && (
            <div className="mb-6 p-4 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-600 dark:text-rose-400 text-sm flex items-center gap-3">
              <AlertCircle className="w-5 h-5 flex-shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          {successMessage && (
            <div className="mb-6 p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 text-sm flex items-center gap-3">
              <CheckCircle2 className="w-5 h-5 flex-shrink-0" />
              <span>{successMessage}</span>
            </div>
          )}

          {isFetchingEdit ? (
            <div className="p-12 text-center">
              <RefreshCw className="w-8 h-8 text-emerald-600 animate-spin mx-auto mb-3" />
              <p className="text-sm font-medium text-stone-500">Loading trip details...</p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-6">
              
              {/* Trip Name */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-stone-700 dark:text-stone-300 mb-2">
                  Trip Name <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <Plane className="w-5 h-5 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    name="tripName"
                    value={formData.tripName}
                    onChange={handleChange}
                    placeholder="e.g. Summer Vacation in Goa"
                    className="w-full pl-11 pr-4 py-3 rounded-xl bg-stone-50 dark:bg-stone-950 border border-stone-200 dark:border-stone-800 text-sm text-stone-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
                    required
                  />
                </div>
              </div>

              {/* Destination City & Country */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-stone-700 dark:text-stone-300 mb-2">
                    Destination City <span className="text-rose-500">*</span>
                  </label>
                  <div className="relative">
                    <MapPin className="w-5 h-5 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      name="city"
                      value={formData.city}
                      onChange={handleChange}
                      placeholder="e.g. Goa"
                      className="w-full pl-11 pr-4 py-3 rounded-xl bg-stone-50 dark:bg-stone-950 border border-stone-200 dark:border-stone-800 text-sm text-stone-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-stone-700 dark:text-stone-300 mb-2">
                    Country <span className="text-rose-500">*</span>
                  </label>
                  <div className="relative">
                    <Compass className="w-5 h-5 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      name="country"
                      value={formData.country}
                      onChange={handleChange}
                      placeholder="e.g. India"
                      className="w-full pl-11 pr-4 py-3 rounded-xl bg-stone-50 dark:bg-stone-950 border border-stone-200 dark:border-stone-800 text-sm text-stone-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
                      required
                    />
                  </div>
                </div>
              </div>

              {/* Start Date & End Date */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-stone-700 dark:text-stone-300 mb-2">
                    Start Date <span className="text-rose-500">*</span>
                  </label>
                  <div className="relative">
                    <Calendar className="w-5 h-5 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="date"
                      name="startDate"
                      value={formData.startDate}
                      onChange={handleChange}
                      className="w-full pl-11 pr-4 py-3 rounded-xl bg-stone-50 dark:bg-stone-950 border border-stone-200 dark:border-stone-800 text-sm text-stone-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-stone-700 dark:text-stone-300 mb-2">
                    End Date <span className="text-rose-500">*</span>
                  </label>
                  <div className="relative">
                    <Calendar className="w-5 h-5 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="date"
                      name="endDate"
                      value={formData.endDate}
                      onChange={handleChange}
                      className="w-full pl-11 pr-4 py-3 rounded-xl bg-stone-50 dark:bg-stone-950 border border-stone-200 dark:border-stone-800 text-sm text-stone-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
                      required
                    />
                  </div>
                </div>
              </div>

              {/* Travelers & Budget */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-stone-700 dark:text-stone-300 mb-2">
                    Number of Travelers <span className="text-rose-500">*</span>
                  </label>
                  <div className="relative">
                    <Users className="w-5 h-5 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="number"
                      name="travelers"
                      min="1"
                      value={formData.travelers}
                      onChange={handleChange}
                      className="w-full pl-11 pr-4 py-3 rounded-xl bg-stone-50 dark:bg-stone-950 border border-stone-200 dark:border-stone-800 text-sm text-stone-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-stone-700 dark:text-stone-300 mb-2">
                    Estimated Budget ($ USD) <span className="text-rose-500">*</span>
                  </label>
                  <div className="relative">
                    <DollarSign className="w-5 h-5 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="number"
                      name="budget"
                      min="0"
                      step="50"
                      placeholder="e.g. 1500"
                      value={formData.budget}
                      onChange={handleChange}
                      className="w-full pl-11 pr-4 py-3 rounded-xl bg-stone-50 dark:bg-stone-950 border border-stone-200 dark:border-stone-800 text-sm text-stone-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
                      required
                    />
                  </div>
                </div>
              </div>

              {/* Travel Style */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-stone-700 dark:text-stone-300 mb-2">
                  Travel Style / Preferences
                </label>
                <div className="relative">
                  <Compass className="w-5 h-5 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <select
                    name="travelStyle"
                    value={formData.travelStyle}
                    onChange={handleChange}
                    className="w-full pl-11 pr-4 py-3 rounded-xl bg-stone-50 dark:bg-stone-950 border border-stone-200 dark:border-stone-800 text-sm text-stone-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/50 appearance-none"
                  >
                    {travelStyleOptions.map((style) => (
                      <option key={style} value={style}>
                        {style}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-end gap-4 pt-4 border-t border-stone-100 dark:border-stone-800">
                <Link
                  to="/dashboard"
                  className="px-6 py-3 rounded-xl font-semibold text-stone-600 dark:text-stone-300 hover:bg-stone-100 dark:hover:bg-stone-800 transition-all text-sm"
                >
                  Cancel
                </Link>

                <button
                  type="submit"
                  disabled={isLoading}
                  className="px-8 py-3 rounded-xl font-bold text-white bg-emerald-700 hover:bg-emerald-800 shadow-lg shadow-emerald-900/20 transition-all text-sm flex items-center gap-2 cursor-pointer disabled:opacity-50"
                >
                  {isLoading && <RefreshCw className="w-4 h-4 animate-spin" />}
                  <span>{isLoading ? 'Saving Trip...' : editId ? 'Update Trip' : 'Create Trip'}</span>
                </button>
              </div>

            </form>
          )}

        </div>
      </main>

      <Footer />
    </div>
  );
};

export default CreateTrip;
