/**
 * Header Component
 * Main navigation header with logo and menu
 */

import { Link } from 'react-router-dom';
import { LogIn } from 'lucide-react';

export default function Header() {
  return (
    <header className="bg-white shadow-sm sticky top-0 z-50">
      <nav className="container-custom py-4">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-3">
            <img 
              src="/kt-logo-header.webp" 
              alt="Kingdom.Training" 
              className="h-10 w-auto"
            />
          </Link>

          {/* Navigation */}
          <div className="flex items-center space-x-6">
            <Link
              to="/"
              className="text-gray-700 hover:text-primary-600 font-medium transition-colors"
            >
              Home
            </Link>
            <Link
              to="/strategy-courses"
              className="text-gray-700 hover:text-primary-600 font-medium transition-colors"
            >
              Strategy Course
            </Link>
            <Link
              to="/articles"
              className="text-gray-700 hover:text-primary-600 font-medium transition-colors"
            >
              Articles
            </Link>
            <Link
              to="/tools"
              className="text-gray-700 hover:text-primary-600 font-medium transition-colors"
            >
              Tools
            </Link>
            <Link
              to="/login"
              className="text-gray-700 hover:text-primary-600 transition-colors"
              aria-label="Login"
            >
              <LogIn className="w-5 h-5" />
            </Link>
          </div>
        </div>
      </nav>
    </header>
  );
}

