import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import API from '../api/axios';
import { useAuth } from '../context/AuthContext';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import {
  Sparkles,
  Bot,
  Wallet,
  Receipt,
  Sun,
  MapPin,
  RefreshCw,
  CheckSquare,
  ArrowRight,
  Compass,
  CheckCircle2,
  Server,
  Globe
} from 'lucide-react';

const Landing = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { isAuthenticated } = useAuth();

  const [backendStatus, setBackendStatus] = useState(null);
  const [isChecking, setIsChecking] = useState(true);
  const [errorDetails, setErrorDetails] = useState(null);

  const checkHealth = async () => {
    setIsChecking(true);
    setErrorDetails(null);
    try {
      const response = await API.get('/health');
      setBackendStatus(response.data);
    } catch (err) {
      console.error('Failed to fetch backend health status:', err);
      setBackendStatus(null);
      setErrorDetails(
        err.response
          ? `Server returned HTTP ${err.response.status}`
          : err.message || 'Unable to connect to Spring Boot backend'
      );
    } finally {
      setIsChecking(false);
    }
  };

  useEffect(() => {
    checkHealth();
  }, []);

  // Handle hash scrolling when arriving from other pages
  useEffect(() => {
    if (location.hash) {
      const sectionId = location.hash.replace('#', '');
      setTimeout(() => {
        const element = document.getElementById(sectionId);
        if (element) {
          const yOffset = -80;
          const y = element.getBoundingClientRect().top + window.pageYOffset + yOffset;
          window.scrollTo({ top: y, behavior: 'smooth' });
        }
      }, 100);
    }
  }, [location]);

  const handlePlanMyTripClick = () => {
    if (isAuthenticated) {
      navigate('/dashboard');
    } else {
      navigate('/register');
    }
  };

  const FEATURES = [
    {
      icon: Sparkles,
      color: 'text-emerald-700 dark:text-emerald-400 bg-emerald-500/10 border-emerald-500/20',
      title: 'AI Itinerary Generator',
      description: 'Generate tailored day-by-day travel plans instantly powered by OpenRouter AI.'
    },
    {
      icon: Bot,
      color: 'text-teal-700 dark:text-teal-400 bg-teal-500/10 border-teal-500/20',
      title: 'AI Travel Assistant',
      description: 'Ask context-aware questions about your specific trip, packing, food, and budget.'
    },
    {
      icon: Wallet,
      color: 'text-amber-700 dark:text-amber-400 bg-amber-500/10 border-amber-500/20',
      title: 'Smart Budget Management',
      description: 'Track your overall trip budget against estimated activity costs in real time.'
    },
    {
      icon: Receipt,
      color: 'text-stone-700 dark:text-stone-300 bg-stone-500/10 border-stone-500/20',
      title: 'Expense Tracking',
      description: 'Record actual trip expenses per category such as food, transport, and hotel.'
    },
    {
      icon: Sun,
      color: 'text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 border-emerald-500/20',
      title: 'Weather Forecast',
      description: 'View live destination weather information to pack and plan activities smartly.'
    },
    {
      icon: MapPin,
      color: 'text-amber-600 dark:text-amber-400 bg-amber-500/10 border-amber-500/20',
      title: 'Interactive Destination Map',
      description: 'Visualize your trip locations with an interactive leaflet destination map.'
    },
    {
      icon: RefreshCw,
      color: 'text-teal-600 dark:text-teal-400 bg-teal-500/10 border-teal-500/20',
      title: 'Currency Converter',
      description: 'Convert international currencies instantly using live exchange rates.'
    },
    {
      icon: CheckSquare,
      color: 'text-emerald-700 dark:text-emerald-400 bg-emerald-500/10 border-emerald-500/20',
      title: 'Travel Checklist',
      description: 'Keep your packing list and travel tasks organized with persistent check items.'
    }
  ];

  const STEPS = [
    {
      number: '01',
      title: 'Create Your Trip',
      description: 'Enter your target destination, dates, number of travelers, and total trip budget.'
    },
    {
      number: '02',
      title: 'Customize Preferences',
      description: 'Select your travel style such as leisure, budget, solo, or luxury exploration.'
    },
    {
      number: '03',
      title: 'Generate AI Plan',
      description: 'Let AI craft your personalized day-by-day itinerary with estimated costs and tips.'
    },
    {
      number: '04',
      title: 'Travel With Confidence',
      description: 'Track expenses, check live weather, consult your AI assistant, and enjoy your journey.'
    }
  ];

  const VALUES = [
    {
      title: 'Personalized Planning',
      desc: 'Every itinerary is customized to your travel dates, group size, and budget limits.'
    },
    {
      title: 'AI Travel Companion',
      desc: '24/7 intelligent assistance to answer questions about local attractions, food, and packing.'
    },
    {
      title: 'Budget Awareness',
      desc: 'Prevent overspending by tracking planned costs against real-time expense logging.'
    },
    {
      title: 'All-in-One Hub',
      desc: 'Maps, weather, currency converter, checklists, and itineraries unified in one platform.'
    }
  ];

  return (
    <div className="min-h-screen flex flex-col bg-stone-50 dark:bg-stone-950 text-stone-900 dark:text-stone-100 font-sans transition-colors">
      <Navbar
        backendStatus={backendStatus}
        isChecking={isChecking}
        onRecheckStatus={checkHealth}
      />

      <main className="flex-1">
        {/* HERO SECTION */}
        <section className="relative overflow-hidden pt-12 pb-20 lg:pt-20 lg:pb-28">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-96 bg-gradient-to-tr from-emerald-500/15 via-teal-500/15 to-amber-500/15 blur-3xl rounded-full pointer-events-none -z-10" />

          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center max-w-4xl mx-auto">
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800/60 text-emerald-800 dark:text-emerald-300 text-xs font-semibold tracking-wide uppercase mb-6 shadow-sm">
                <Sparkles className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                <span>Full-Stack AI Travel Planner</span>
              </div>

              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-stone-900 dark:text-white leading-tight">
                Plan Smarter. <span className="bg-gradient-to-r from-emerald-700 via-teal-700 to-amber-800 dark:from-emerald-400 dark:via-teal-300 dark:to-amber-400 bg-clip-text text-transparent">Travel Better.</span>
              </h1>

              <p className="mt-6 text-base sm:text-lg lg:text-xl text-stone-600 dark:text-stone-300 max-w-2xl mx-auto font-normal leading-relaxed">
                TripWise AI helps you craft personalized day-by-day travel itineraries while effortlessly managing your budget, weather forecasts, maps, expenses, and packing checklists.
              </p>

              <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4">
                <button
                  onClick={handlePlanMyTripClick}
                  className="w-full sm:w-auto px-7 py-3.5 rounded-2xl font-bold text-white bg-emerald-700 hover:bg-emerald-800 shadow-lg shadow-emerald-900/20 transition-all flex items-center justify-center gap-2 cursor-pointer"
                >
                  <span>Plan My Trip</span>
                  <ArrowRight className="w-4 h-4" />
                </button>

                <a
                  href="/#features"
                  onClick={(e) => {
                    e.preventDefault();
                    const elem = document.getElementById('features');
                    if (elem) {
                      const yOffset = -80;
                      const y = elem.getBoundingClientRect().top + window.pageYOffset + yOffset;
                      window.scrollTo({ top: y, behavior: 'smooth' });
                    }
                  }}
                  className="w-full sm:w-auto px-7 py-3.5 rounded-2xl font-semibold text-stone-700 dark:text-stone-200 bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 hover:bg-stone-100 dark:hover:bg-stone-800 transition-all flex items-center justify-center gap-2 shadow-sm"
                >
                  <Compass className="w-4 h-4 text-emerald-700 dark:text-emerald-400" />
                  <span>Explore Features</span>
                </a>
              </div>
            </div>

            {/* Visual Hero Mockup / Card Showcase */}
            <div className="mt-14 max-w-5xl mx-auto relative">
              <div className="bg-white dark:bg-stone-900 rounded-3xl p-6 sm:p-8 border border-stone-200/80 dark:border-stone-800 shadow-xl relative overflow-hidden">
                <div className="flex flex-wrap items-center justify-between gap-4 pb-6 border-b border-stone-100 dark:border-stone-800">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-2xl bg-emerald-700 text-white flex items-center justify-center font-bold">
                      <Globe className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="text-base font-bold text-stone-900 dark:text-white">Paris 5-Day Getaway</h4>
                      <p className="text-xs text-stone-500 dark:text-stone-400">Oct 15 – Oct 20 • 2 Travelers • Budget: $2,500</p>
                    </div>
                  </div>

                  <span className="px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 text-xs font-bold border border-emerald-500/20">
                    AI Itinerary Generated
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
                  <div className="p-4 rounded-2xl bg-amber-500/5 dark:bg-amber-500/10 border border-amber-500/20">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-amber-700 dark:text-amber-400 block mb-1">
                      Day 1 • Morning
                    </span>
                    <h5 className="text-sm font-bold text-stone-900 dark:text-white">Eiffel Tower Exploration</h5>
                    <p className="text-xs text-stone-500 dark:text-stone-400 mt-1">Guided summit tour & photos.</p>
                  </div>

                  <div className="p-4 rounded-2xl bg-teal-500/5 dark:bg-teal-500/10 border border-teal-500/20">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-teal-700 dark:text-teal-400 block mb-1">
                      Day 1 • Afternoon
                    </span>
                    <h5 className="text-sm font-bold text-stone-900 dark:text-white">Louvre Museum Tour</h5>
                    <p className="text-xs text-stone-500 dark:text-stone-400 mt-1">Explore Mona Lisa & classic art.</p>
                  </div>

                  <div className="p-4 rounded-2xl bg-emerald-500/5 dark:bg-emerald-500/10 border border-emerald-500/20">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-700 dark:text-emerald-400 block mb-1">
                      Day 1 • Evening
                    </span>
                    <h5 className="text-sm font-bold text-stone-900 dark:text-white">Seine River Cruise</h5>
                    <p className="text-xs text-stone-500 dark:text-stone-400 mt-1">Sunset dining along the river.</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* FEATURE SECTION */}
        <section id="features" className="py-16 bg-stone-100/60 dark:bg-stone-900/50 border-y border-stone-200/60 dark:border-stone-800/60">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center max-w-2xl mx-auto mb-12">
              <h2 className="text-3xl font-extrabold text-stone-900 dark:text-white">
                Everything You Need for Calm & Perfect Travel
              </h2>
              <p className="text-stone-500 dark:text-stone-400 text-sm mt-2">
                Unified travel tools powered by intelligent AI algorithms and real-time utilities.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {FEATURES.map((item, idx) => {
                const IconComponent = item.icon;
                return (
                  <div
                    key={idx}
                    className="p-6 rounded-3xl bg-white dark:bg-stone-900 border border-stone-200/80 dark:border-stone-800 shadow-sm hover:shadow-md transition-all flex flex-col justify-between"
                  >
                    <div>
                      <div className={`h-12 w-12 rounded-2xl flex items-center justify-center border ${item.color} mb-4`}>
                        <IconComponent className="w-6 h-6" />
                      </div>
                      <h3 className="text-base font-bold text-stone-900 dark:text-white">
                        {item.title}
                      </h3>
                      <p className="text-xs text-stone-500 dark:text-stone-400 mt-2 leading-relaxed">
                        {item.description}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* HOW IT WORKS */}
        <section id="how-it-works" className="py-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center max-w-2xl mx-auto mb-12">
              <h2 className="text-3xl font-extrabold text-stone-900 dark:text-white">
                How TripWise AI Works
              </h2>
              <p className="text-stone-500 dark:text-stone-400 text-sm mt-2">
                Four simple steps to your dream vacation itinerary.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 relative">
              {STEPS.map((step, idx) => (
                <div
                  key={idx}
                  className="p-6 rounded-3xl bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 shadow-sm relative flex flex-col"
                >
                  <span className="text-3xl font-black text-emerald-800/30 dark:text-emerald-400/20 mb-3 block">
                    {step.number}
                  </span>
                  <h3 className="text-base font-bold text-stone-900 dark:text-white mb-2">
                    {step.title}
                  </h3>
                  <p className="text-xs text-stone-500 dark:text-stone-400 leading-relaxed">
                    {step.description}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* WHY TRIPWISE */}
        <section id="why-tripwise" className="py-16 bg-stone-100/60 dark:bg-stone-900/50 border-y border-stone-200/60 dark:border-stone-800/60">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center max-w-2xl mx-auto mb-12">
              <h2 className="text-3xl font-extrabold text-stone-900 dark:text-white">
                Why Choose TripWise AI?
              </h2>
              <p className="text-stone-500 dark:text-stone-400 text-sm mt-2">
                Designed to deliver effortless, intelligent, and cost-controlled travel experiences.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {VALUES.map((val, idx) => (
                <div
                  key={idx}
                  className="p-6 rounded-3xl bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 shadow-sm flex flex-col justify-between"
                >
                  <div>
                    <CheckCircle2 className="w-6 h-6 text-emerald-700 dark:text-emerald-400 mb-3" />
                    <h3 className="text-base font-bold text-stone-900 dark:text-white">
                      {val.title}
                    </h3>
                    <p className="text-xs text-stone-500 dark:text-stone-400 mt-2 leading-relaxed">
                      {val.desc}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* SYSTEM STATUS CARD */}
        <section id="system-status" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="bg-white dark:bg-stone-900 rounded-3xl p-6 sm:p-8 border border-stone-200/80 dark:border-stone-800 shadow-md">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6 pb-6 border-b border-stone-100 dark:border-stone-800">
              <div>
                <div className="flex items-center gap-2">
                  <Server className="w-6 h-6 text-emerald-700 dark:text-emerald-400" />
                  <h2 className="text-2xl font-bold text-stone-900 dark:text-white">Full-Stack System Health</h2>
                </div>
                <p className="text-sm text-stone-500 dark:text-stone-400 mt-1">
                  Active connection monitoring between React frontend and Spring Boot backend.
                </p>
              </div>

              <button
                onClick={checkHealth}
                disabled={isChecking}
                className="px-4 py-2 rounded-xl text-xs font-bold text-emerald-800 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200 dark:border-emerald-800 hover:bg-emerald-100 dark:hover:bg-emerald-900/50 transition-all flex items-center gap-2 self-stretch sm:self-auto justify-center cursor-pointer"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isChecking ? 'animate-spin' : ''}`} />
                <span>{isChecking ? 'Checking...' : 'Refresh Health'}</span>
              </button>
            </div>

            {isChecking ? (
              <div className="p-8 rounded-2xl bg-amber-500/5 border border-amber-500/20 text-center">
                <RefreshCw className="w-8 h-8 text-amber-600 animate-spin mx-auto mb-3" />
                <p className="font-semibold text-amber-800 dark:text-amber-300">Connecting to Spring Boot Backend...</p>
              </div>
            ) : backendStatus?.status === 'UP' ? (
              <div className="p-6 rounded-2xl bg-emerald-500/10 border border-emerald-500/20">
                <div className="flex items-start gap-4">
                  <div className="p-2.5 bg-emerald-500/20 text-emerald-700 dark:text-emerald-400 rounded-xl">
                    <CheckCircle2 className="w-7 h-7" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <h3 className="text-lg font-bold text-emerald-950 dark:text-emerald-300">System Connected & Operational</h3>
                      <span className="px-2 py-0.5 text-xs font-bold rounded bg-emerald-700 text-white">HTTP 200 OK</span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-4 text-xs font-medium">
                      <div className="p-3 bg-white/60 dark:bg-stone-950/60 rounded-xl border border-emerald-500/10">
                        <span className="text-stone-500 block text-[10px] uppercase font-bold tracking-wider">Service</span>
                        <span className="text-stone-900 dark:text-white font-bold">{backendStatus.service}</span>
                      </div>
                      <div className="p-3 bg-white/60 dark:bg-stone-950/60 rounded-xl border border-emerald-500/10">
                        <span className="text-stone-500 block text-[10px] uppercase font-bold tracking-wider">Status</span>
                        <span className="text-emerald-700 dark:text-emerald-400 font-bold">{backendStatus.status}</span>
                      </div>
                      <div className="p-3 bg-white/60 dark:bg-stone-950/60 rounded-xl border border-emerald-500/10">
                        <span className="text-stone-500 block text-[10px] uppercase font-bold tracking-wider">Database</span>
                        <span className="text-teal-700 dark:text-teal-400 font-bold">{backendStatus.databaseStatus}</span>
                      </div>
                      <div className="p-3 bg-white/60 dark:bg-stone-950/60 rounded-xl border border-emerald-500/10">
                        <span className="text-stone-500 block text-[10px] uppercase font-bold tracking-wider">Version</span>
                        <span className="text-stone-900 dark:text-white font-bold">v{backendStatus.version}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="p-6 rounded-2xl bg-stone-100 dark:bg-stone-850 border border-stone-200 dark:border-stone-800">
                <div className="flex items-start gap-4">
                  <div className="p-2.5 bg-amber-500/20 text-amber-700 dark:text-amber-400 rounded-xl">
                    <Server className="w-7 h-7" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-lg font-bold text-stone-900 dark:text-white">Spring Boot Backend Offline</h3>
                    <p className="text-xs text-stone-500 dark:text-stone-400 mt-1">
                      {errorDetails || 'Start the backend server at http://localhost:8080'}
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </section>

        {/* CTA SECTION */}
        <section className="py-16 bg-gradient-to-r from-stone-900 via-emerald-950 to-stone-900 text-white">
          <div className="max-w-4xl mx-auto px-4 text-center">
            <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight">
              Ready to plan your next adventure?
            </h2>
            <p className="mt-4 text-base sm:text-lg text-emerald-200 max-w-xl mx-auto">
              Join TripWise AI today and experience intelligent, personalized travel itineraries in seconds.
            </p>
            <div className="mt-8">
              <Link
                to="/register"
                className="px-8 py-4 rounded-2xl bg-emerald-700 hover:bg-emerald-800 text-white font-extrabold text-sm shadow-xl shadow-emerald-900/30 transition-all inline-flex items-center gap-2"
              >
                <span>Get Started Now</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
};

export default Landing;
