import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import {
  Compass,
  CheckCircle2,
  XCircle,
  RefreshCw,
  User,
  LogOut,
  LayoutDashboard,
  Sun,
  Moon,
  Menu,
  X
} from 'lucide-react';

const Navbar = ({ backendStatus, isChecking, onRecheckStatus }) => {
  const { user, isAuthenticated, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
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

  const getStatusBadge = () => {
    if (!onRecheckStatus) return null;
    if (isChecking) {
      return (
        <div className="flex items-center gap-1.5 px-3 py-1 text-xs font-semibold rounded-full bg-amber-500/10 text-amber-700 dark:text-amber-400 border border-amber-500/20">
          <RefreshCw className="w-3.5 h-3.5 animate-spin" />
          <span>Connecting...</span>
        </div>
      );
    }
    if (backendStatus?.status === 'UP') {
      return (
        <div className="flex items-center gap-1.5 px-3 py-1 text-xs font-semibold rounded-full bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-500/20">
          <CheckCircle2 className="w-3.5 h-3.5" />
          <span>Backend Online</span>
        </div>
      );
    }
    return (
      <div className="flex items-center gap-1.5 px-3 py-1 text-xs font-semibold rounded-full bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20">
        <XCircle className="w-3.5 h-3.5" />
        <span>Backend Offline</span>
      </div>
    );
  };

  return (
    <header className="sticky top-0 z-50 backdrop-blur-md bg-stone-50/90 dark:bg-stone-950/90 border-b border-stone-200/80 dark:border-stone-800/80 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        
        {/* Brand Logo */}
        <Link to="/" className="flex items-center gap-3 group">
          <div className="h-10 w-10 rounded-xl bg-gradient-to-tr from-emerald-700 to-teal-800 flex items-center justify-center shadow-md shadow-emerald-900/20 text-white font-bold group-hover:scale-105 transition-transform">
            <Compass className="w-6 h-6 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="text-xl font-extrabold tracking-tight text-stone-900 dark:text-white">
                TripWise
              </span>
              <span className="px-1.5 py-0.5 text-[10px] font-bold rounded-md bg-emerald-800 text-white tracking-widest uppercase">
                AI
              </span>
            </div>
            <p className="text-[11px] text-stone-500 dark:text-stone-400 font-medium">Smart Travel Planner</p>
          </div>
        </Link>

        {/* Desktop Navigation Links */}
        <nav className="hidden lg:flex items-center gap-7 text-sm font-semibold text-stone-600 dark:text-stone-300">
          <a
            href="/#features"
            onClick={(e) => handleNavClick(e, 'features')}
            className="hover:text-emerald-700 dark:hover:text-emerald-400 transition-colors"
          >
            Features
          </a>
          <a
            href="/#how-it-works"
            onClick={(e) => handleNavClick(e, 'how-it-works')}
            className="hover:text-emerald-700 dark:hover:text-emerald-400 transition-colors"
          >
            How It Works
          </a>
          <a
            href="/#why-tripwise"
            onClick={(e) => handleNavClick(e, 'why-tripwise')}
            className="hover:text-emerald-700 dark:hover:text-emerald-400 transition-colors"
          >
            Why TripWise
          </a>
          {isAuthenticated && (
            <Link to="/dashboard" className="hover:text-emerald-700 dark:hover:text-emerald-400 transition-colors flex items-center gap-1.5 text-emerald-800 dark:text-emerald-400 font-bold">
              <LayoutDashboard className="w-4 h-4" />
              <span>Dashboard</span>
            </Link>
          )}
        </nav>

        {/* Right Actions */}
        <div className="flex items-center gap-3">
          {onRecheckStatus && (
            <button 
              onClick={onRecheckStatus} 
              title="Click to recheck API connection status"
              className="cursor-pointer hover:opacity-85 transition-opacity hidden sm:block"
            >
              {getStatusBadge()}
            </button>
          )}

          {/* Theme Toggle Button */}
          <button
            onClick={toggleTheme}
            title={theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
            className="p-2 rounded-xl text-stone-500 hover:text-amber-600 dark:text-stone-400 dark:hover:text-amber-400 bg-stone-200/60 hover:bg-stone-200 dark:bg-stone-900 dark:hover:bg-stone-800 transition-colors cursor-pointer"
          >
            {theme === 'dark' ? (
              <Sun className="w-4.5 h-4.5 text-amber-400" />
            ) : (
              <Moon className="w-4.5 h-4.5 text-stone-700" />
            )}
          </button>

          {isAuthenticated ? (
            <div className="hidden sm:flex items-center gap-2">
              <Link
                to="/dashboard"
                className="inline-flex items-center gap-2 px-3 py-1.5 text-xs font-bold rounded-xl text-emerald-800 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800/60 hover:bg-emerald-100 transition-all"
              >
                <User className="w-3.5 h-3.5" />
                <span>{user?.name || 'Account'}</span>
              </Link>
              <button
                onClick={logout}
                title="Log Out"
                className="p-2 text-stone-500 hover:text-rose-600 dark:text-stone-400 dark:hover:text-rose-400 transition-colors cursor-pointer"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <div className="hidden sm:flex items-center gap-2">
              <Link
                to="/login"
                className="px-3.5 py-2 text-sm font-semibold text-stone-700 dark:text-stone-200 hover:text-emerald-700 dark:hover:text-emerald-400 transition-colors"
              >
                Sign In
              </Link>
              <Link
                to="/register"
                className="inline-flex items-center justify-center px-4 py-2 text-sm font-semibold rounded-xl text-white bg-emerald-700 hover:bg-emerald-800 shadow-md shadow-emerald-900/20 transition-all"
              >
                Get Started
              </Link>
            </div>
          )}

          {/* Mobile Menu Hamburger Button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="lg:hidden p-2 rounded-xl text-stone-600 dark:text-stone-300 hover:bg-stone-200/60 dark:hover:bg-stone-800 transition-colors cursor-pointer"
            aria-label="Toggle Navigation Menu"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer Navigation */}
      {mobileMenuOpen && (
        <div className="lg:hidden px-4 pt-2 pb-6 border-t border-stone-200 dark:border-stone-800 bg-stone-50 dark:bg-stone-950 space-y-3">
          <a
            href="/#features"
            onClick={(e) => {
              handleNavClick(e, 'features');
              setMobileMenuOpen(false);
            }}
            className="block py-2 text-sm font-semibold text-stone-700 dark:text-stone-300 hover:text-emerald-700"
          >
            Features
          </a>
          <a
            href="/#how-it-works"
            onClick={(e) => {
              handleNavClick(e, 'how-it-works');
              setMobileMenuOpen(false);
            }}
            className="block py-2 text-sm font-semibold text-stone-700 dark:text-stone-300 hover:text-emerald-700"
          >
            How It Works
          </a>
          <a
            href="/#why-tripwise"
            onClick={(e) => {
              handleNavClick(e, 'why-tripwise');
              setMobileMenuOpen(false);
            }}
            className="block py-2 text-sm font-semibold text-stone-700 dark:text-stone-300 hover:text-emerald-700"
          >
            Why TripWise
          </a>
          {isAuthenticated ? (
            <div className="pt-2 border-t border-stone-200 dark:border-stone-800 space-y-2">
              <Link
                to="/dashboard"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center gap-2 py-2 text-sm font-bold text-emerald-700 dark:text-emerald-400"
              >
                <LayoutDashboard className="w-4 h-4" />
                <span>Dashboard ({user?.name || 'Account'})</span>
              </Link>
              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  logout();
                }}
                className="flex items-center gap-2 py-2 text-sm font-semibold text-rose-600 dark:text-rose-400 w-full text-left"
              >
                <LogOut className="w-4 h-4" />
                <span>Log Out</span>
              </button>
            </div>
          ) : (
            <div className="pt-2 border-t border-stone-200 dark:border-stone-800 flex flex-col gap-2">
              <Link
                to="/login"
                onClick={() => setMobileMenuOpen(false)}
                className="w-full py-2.5 rounded-xl border border-stone-200 dark:border-stone-800 text-center text-sm font-bold text-stone-700 dark:text-stone-200"
              >
                Sign In
              </Link>
              <Link
                to="/register"
                onClick={() => setMobileMenuOpen(false)}
                className="w-full py-2.5 rounded-xl bg-emerald-700 text-white text-center text-sm font-bold shadow-md shadow-emerald-900/20"
              >
                Get Started
              </Link>
            </div>
          )}
        </div>
      )}
    </header>
  );
};

export default Navbar;
