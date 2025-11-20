/**
 * Header Component
 * Main navigation header with logo and menu
 */

import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { LogIn, Mail, Search } from 'lucide-react';
import SearchModal from './SearchModal';

export default function Header() {
  const location = useLocation();
  const [isSearchOpen, setIsSearchOpen] = useState(false);

  const isActive = (path: string) => {
    if (path === '/') {
      return location.pathname === '/';
    }
    return location.pathname.startsWith(path);
  };

  const getLinkClass = (path: string) => {
    const baseClass = "text-gray-700 hover:text-primary-500 font-medium transition-colors relative py-1";
    const activeClass = "text-primary-600 after:content-[''] after:absolute after:left-0 after:bottom-0 after:w-full after:h-0.5 after:bg-primary-500 after:rounded-full";
    return isActive(path) ? `${baseClass} ${activeClass}` : baseClass;
  };

  return (
    <header className="bg-white shadow-sm sticky top-0 z-50">
      <nav className="container-custom py-4">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-3">
            <img
              src="https://ai.kingdom.training/wp-content/themes/kingdom-training-theme/dist/kt-logo-header.webp"
              alt="Kingdom.Training"
              className="h-10 w-auto"
            />
          </Link>

          {/* Navigation */}
          <div className="flex items-center space-x-6">
            <Link
              to="/"
              className={getLinkClass('/')}
            >
              Home
            </Link>
            <Link
              to="/strategy-courses"
              className={getLinkClass('/strategy-courses')}
            >
              Strategy Course
            </Link>
            <Link
              to="/articles"
              className={getLinkClass('/articles')}
            >
              Articles
            </Link>
            <Link
              to="/tools"
              className={getLinkClass('/tools')}
            >
              Tools
            </Link>
            <Link
              to="/newsletter"
              className="inline-flex items-center gap-2 px-4 py-2 bg-primary-500 hover:bg-primary-600 text-white font-semibold rounded-lg transition-colors duration-200 shadow-sm hover:shadow-md"
            >
              <Mail className="w-4 h-4" />
              <span>Newsletter</span>
            </Link>
            <button
              onClick={() => setIsSearchOpen(true)}
              className="text-gray-700 hover:text-primary-500 transition-colors"
              aria-label="Search"
            >
              <Search className="w-5 h-5" />
            </button>
            <Link
              to="/login"
              className="text-gray-700 hover:text-primary-500 transition-colors"
              aria-label="Login"
            >
              <LogIn className="w-5 h-5" />
            </Link>
          </div>
        </div>
      </nav>
      <SearchModal isOpen={isSearchOpen} onClose={() => setIsSearchOpen(false)} />
    </header>
  );
}

