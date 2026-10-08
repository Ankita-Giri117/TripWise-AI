import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Compass } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const Footer = () => {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const handleNavClick = (e, sectionId) => {
    e.preventDefault();
    if (window.location.pathname === '/') {
      const element = document.getElementById(sectionId);
      if (element) {
        const yOffset = -80;
        const y = element.getBoundingClientRect().top + window.pageYOffset + yOffset;
        window.scrollTo({ top: y, behavior: 'smooth' });
      }
    } else {
      navigate(`/#${sectionId}`);
    }
  };

  return (
    <footer className="bg-stone-900 text-stone-400 border-t border-stone-800 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          <div className="md:col-span-2">
            <div className="flex items-center gap-2.5 mb-3">
              <div className="h-8 w-8 rounded-lg bg-emerald-700 flex items-center justify-center text-white">
                <Compass className="w-5 h-5" />
              </div>
              <span className="text-xl font-extrabold text-white tracking-tight">TripWise AI</span>
            </div>
            <p className="text-sm text-stone-400 max-w-sm leading-relaxed">
              Your intelligent travel companion. Create personalized itineraries, manage budgets, log expenses, and plan calm, unforgettable journeys.
            </p>
          </div>

          <div>
            <h4 className="text-xs font-bold text-stone-200 uppercase tracking-wider mb-3">Tech Stack</h4>
            <ul className="space-y-2 text-xs font-medium text-stone-400">
              <li>Backend: Spring Boot 3.4 (Java 21)</li>
              <li>Database: PostgreSQL</li>
              <li>Frontend: React 19 + Vite</li>
              <li>Styling: Tailwind CSS</li>
            </ul>
          </div>

          <div>
            <h4 className="text-xs font-bold text-stone-200 uppercase tracking-wider mb-3">Navigation</h4>
            <ul className="space-y-2 text-xs font-semibold">
              <li>
                <a
                  href="/#features"
                  onClick={(e) => handleNavClick(e, 'features')}
                  className="hover:text-emerald-400 transition-colors"
                >
                  Features
                </a>
              </li>
              <li>
                <a
                  href="/#how-it-works"
                  onClick={(e) => handleNavClick(e, 'how-it-works')}
                  className="hover:text-emerald-400 transition-colors"
                >
                  How It Works
                </a>
              </li>
              <li>
                <a
                  href="/#why-tripwise"
                  onClick={(e) => handleNavClick(e, 'why-tripwise')}
                  className="hover:text-emerald-400 transition-colors"
                >
                  Why TripWise
                </a>
              </li>
              <li>
                <a
                  href="/#system-status"
                  onClick={(e) => handleNavClick(e, 'system-status')}
                  className="hover:text-emerald-400 transition-colors"
                >
                  System Health
                </a>
              </li>
              {isAuthenticated ? (
                <li>
                  <Link to="/dashboard" className="text-emerald-400 hover:text-emerald-300 transition-colors">
                    Dashboard
                  </Link>
                </li>
              ) : (
                <>
                  <li>
                    <Link to="/login" className="hover:text-emerald-400 transition-colors">
                      Sign In
                    </Link>
                  </li>
                  <li>
                    <Link to="/register" className="hover:text-emerald-400 transition-colors">
                      Get Started
                    </Link>
                  </li>
                </>
              )}
            </ul>
          </div>
        </div>

        <div className="pt-8 border-t border-stone-800 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs font-medium text-stone-500">
          <p>© {new Date().getFullYear()} TripWise AI. Built for smart travel planning.</p>
          <div className="flex items-center gap-1 text-stone-400">
            <span>Powered by Spring Boot & React</span>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
