/**
 * Header Component
 * Main navigation header with logo and menu
 */

import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { LogIn, Mail, Search, Menu, X } from 'lucide-react';
import SearchModal from './SearchModal';
import LanguageSelector from './LanguageSelector';
import { parseLanguageFromPath, buildLanguageUrl } from '@/lib/utils';
import { useDefaultLanguage } from '@/contexts/LanguageContext';
import { useTranslation } from '@/hooks/useTranslation';

export default function Header() {
  const location = useLocation();
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const defaultLang = useDefaultLanguage();
  const { t } = useTranslation();

  // Get current language from URL path
  const { lang: currentLang } = parseLanguageFromPath(location.pathname);

  // Helper function to build language-aware links
  const buildLink = (path: string) => buildLanguageUrl(path, currentLang, defaultLang);

  // Close mobile menu when route changes
  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [location.pathname]);

  // Prevent body scroll when mobile menu is open
  useEffect(() => {
    if (isMobileMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isMobileMenuOpen]);

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

  const getMobileLinkClass = (path: string) => {
    const baseClass = "block py-3 px-4 text-gray-700 hover:text-primary-500 hover:bg-gray-50 font-medium transition-colors border-b border-gray-100";
    const activeClass = "text-primary-600 bg-primary-50";
    return isActive(path) ? `${baseClass} ${activeClass}` : baseClass;
  };

  return (
    <header className="bg-white shadow-sm fixed top-0 left-0 right-0 z-50">
      <nav className="container-custom py-4">
        <div className="flex items-center justify-between">
          {/* Logo - Always in upper left */}
          <Link to={buildLink('/')} className="flex items-center space-x-3 z-50">
            <img
              src="https://ai.kingdom.training/wp-content/themes/kingdom-training-theme/dist/kt-logo-header.webp"
              alt="Kingdom.Training"
              loading="eager"
              decoding="async"
              fetchPriority="high"
              width="200"
              height="40"
              className="h-10 w-auto"
              style={{ aspectRatio: '200 / 40' }}
            />
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-6">
            <Link
              to={buildLink('/')}
              className={getLinkClass('/')}
            >
              {t('nav_home')}
            </Link>
            <Link
              to={buildLink('/strategy-courses')}
              className={getLinkClass('/strategy-courses')}
            >
              {t('nav_strategy_course')}
            </Link>
            <Link
              to={buildLink('/articles')}
              className={getLinkClass('/articles')}
            >
              {t('nav_articles')}
            </Link>
            <Link
              to={buildLink('/tools')}
              className={getLinkClass('/tools')}
            >
              {t('nav_tools')}
            </Link>
            <Link
              to={buildLink('/newsletter')}
              className="inline-flex items-center gap-2 px-4 py-2 bg-primary-500 hover:bg-primary-600 text-white font-semibold rounded-lg transition-colors duration-200 shadow-sm hover:shadow-md"
            >
              <Mail className="w-4 h-4" />
              <span>{t('nav_newsletter')}</span>
            </Link>
            <button
              onClick={() => setIsSearchOpen(true)}
              className="text-gray-700 hover:text-primary-500 transition-colors"
              aria-label={t('nav_search')}
            >
              <Search className="w-5 h-5" />
            </button>
            <div className="flex items-center">
              <LanguageSelector />
            </div>
            <Link
              to={buildLink('/login')}
              className="text-gray-700 hover:text-primary-500 transition-colors"
              aria-label={t('nav_login')}
            >
              <LogIn className="w-5 h-5" />
            </Link>
          </div>

          {/* Mobile Actions - Search, Language, and Menu */}
          <div className="md:hidden flex items-center gap-4 z-50">
            <button
              onClick={() => setIsSearchOpen(true)}
              className="text-gray-700 hover:text-primary-500 transition-colors"
              aria-label={t('nav_search')}
            >
              <Search className="w-6 h-6" />
            </button>
            <LanguageSelector />
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="text-gray-700 hover:text-primary-500 transition-colors"
              aria-label={t('ui_toggle_menu')}
              aria-expanded={isMobileMenuOpen}
            >
              {isMobileMenuOpen ? (
                <X className="w-6 h-6" />
              ) : (
                <Menu className="w-6 h-6" />
              )}
            </button>
          </div>
        </div>
      </nav>

      {/* Mobile Menu Overlay */}
      <div
        className={`fixed inset-0 bg-black bg-opacity-50 z-40 md:hidden transition-opacity duration-300 ${
          isMobileMenuOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
        }`}
        onClick={() => setIsMobileMenuOpen(false)}
      />

      {/* Mobile Menu Sidebar */}
      <div
        className={`fixed top-0 right-0 h-full w-80 max-w-[85vw] bg-white shadow-xl z-50 md:hidden transform transition-transform duration-300 ease-in-out ${
          isMobileMenuOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        <div className="flex flex-col h-full">
          {/* Mobile Menu Header */}
          <div className="flex items-center justify-between p-4 border-b border-gray-200">
            <span className="text-lg font-semibold text-gray-800">{t('nav_menu')}</span>
            <button
              onClick={() => setIsMobileMenuOpen(false)}
              className="text-gray-700 hover:text-primary-500 transition-colors"
              aria-label={t('ui_close')}
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          {/* Mobile Navigation Links */}
          <nav className="flex-1 overflow-y-auto">
            <Link
              to={buildLink('/')}
              className={getMobileLinkClass('/')}
              onClick={() => setIsMobileMenuOpen(false)}
            >
              {t('nav_home')}
            </Link>
            <Link
              to={buildLink('/strategy-courses')}
              className={getMobileLinkClass('/strategy-courses')}
              onClick={() => setIsMobileMenuOpen(false)}
            >
              {t('nav_strategy_course')}
            </Link>
            <Link
              to={buildLink('/articles')}
              className={getMobileLinkClass('/articles')}
              onClick={() => setIsMobileMenuOpen(false)}
            >
              {t('nav_articles')}
            </Link>
            <Link
              to={buildLink('/tools')}
              className={getMobileLinkClass('/tools')}
              onClick={() => setIsMobileMenuOpen(false)}
            >
              {t('nav_tools')}
            </Link>
            <Link
              to={buildLink('/newsletter')}
              className="block py-3 px-4 text-gray-700 hover:text-primary-500 hover:bg-gray-50 font-medium transition-colors border-b border-gray-100"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              <div className="flex items-center gap-2">
                <Mail className="w-4 h-4" />
                <span>{t('nav_newsletter')}</span>
              </div>
            </Link>
          </nav>

          {/* Mobile Menu Footer Actions */}
          <div className="p-4 border-t border-gray-200 space-y-3">
            <div className="px-4 py-2">
              <LanguageSelector />
            </div>
            <button
              onClick={() => {
                setIsSearchOpen(true);
                setIsMobileMenuOpen(false);
              }}
              className="w-full flex items-center justify-center gap-2 py-2 px-4 text-gray-700 hover:text-primary-500 hover:bg-gray-50 font-medium transition-colors rounded-lg"
            >
              <Search className="w-5 h-5" />
              <span>{t('nav_search')}</span>
            </button>
            <Link
              to={buildLink('/login')}
              className="w-full flex items-center justify-center gap-2 py-2 px-4 text-gray-700 hover:text-primary-500 hover:bg-gray-50 font-medium transition-colors rounded-lg"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              <LogIn className="w-5 h-5" />
              <span>{t('nav_login')}</span>
            </Link>
          </div>
        </div>
      </div>

      <SearchModal isOpen={isSearchOpen} onClose={() => setIsSearchOpen(false)} />
    </header>
  );
}

