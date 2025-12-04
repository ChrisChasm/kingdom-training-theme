/**
 * Language Selector Component
 * Displays available languages and allows switching between them
 * Uses centralized LanguageContext for cached language data
 */

import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Language } from '@/lib/wordpress';
import { useLanguageContext } from '@/contexts/LanguageContext';
import { parseLanguageFromPath, switchLanguageInUrl } from '@/lib/utils';
import { Globe } from 'lucide-react';
import { useTranslation } from '@/hooks/useTranslation';

export default function LanguageSelector() {
  const navigate = useNavigate();
  const location = useLocation();
  const { t, tWithReplace } = useTranslation();
  const { languages, defaultLang, loading } = useLanguageContext();
  const [currentLang, setCurrentLang] = useState<string | null>(null);
  const [isOpen, setIsOpen] = useState(false);

  // Update current language when pathname or defaultLang changes
  useEffect(() => {
    const { lang } = parseLanguageFromPath(location.pathname);
    setCurrentLang(lang || defaultLang);
  }, [location.pathname, defaultLang]);

  const handleLanguageSwitch = (newLang: Language) => {
    const newLangSlug = newLang.slug;
    const newPath = switchLanguageInUrl(newLangSlug, defaultLang);
    
    // Navigate to new URL with updated language
    navigate(newPath);
    setIsOpen(false);
  };

  // Always show the selector, even if loading or no languages
  // This helps with debugging and ensures it's visible
  if (loading) {
    // Show loading state - always visible
    return (
      <div className="relative z-50">
        <button
          disabled
          className="flex items-center gap-2 px-3 py-2 text-gray-400 cursor-not-allowed border border-transparent rounded-lg"
          aria-label={t('ui_loading_languages')}
          type="button"
        >
          <Globe className="w-5 h-5 animate-pulse flex-shrink-0" />
          <span className="text-sm font-medium whitespace-nowrap">...</span>
        </button>
      </div>
    );
  }

  if (languages.length === 0) {
    // Show disabled state with error indicator - always visible
    console.warn('LanguageSelector: No languages found. Make sure Polylang is configured with at least one language.');
    return (
      <div className="relative z-50">
        <button
          disabled
          className="flex items-center gap-2 px-3 py-2 text-gray-400 cursor-not-allowed border border-gray-200 rounded-lg bg-gray-50"
          aria-label={t('ui_no_languages_available')}
          title={t('ui_no_languages_title')}
          type="button"
        >
          <Globe className="w-5 h-5 flex-shrink-0" />
          <span className="text-sm font-medium whitespace-nowrap">--</span>
        </button>
      </div>
    );
  }

  // Show even if only one language (but indicate it's the only one) - always visible
  if (languages.length <= 1) {
    console.log('LanguageSelector: Only one language configured');
    const singleLang = languages[0];
    return (
      <div className="relative z-50">
        <button
          disabled
          className="flex items-center gap-2 px-3 py-2 text-gray-500 cursor-default border border-gray-200 rounded-lg bg-gray-50"
          aria-label={tWithReplace('ui_current_language', { name: singleLang.name })}
          title={tWithReplace('ui_single_language_title', { name: singleLang.name })}
          type="button"
        >
          <Globe className="w-5 h-5 flex-shrink-0" />
          <span className="text-sm font-medium uppercase whitespace-nowrap">
            {singleLang.slug}
          </span>
        </button>
      </div>
    );
  }

  const currentLanguage = languages.find(lang => 
    lang.slug === currentLang || (currentLang === null && lang.is_default)
  ) || languages[0];

  return (
    <div className="relative z-50">
      {/* Desktop Dropdown */}
      <div className="hidden md:block">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="flex items-center gap-2 px-3 py-2 text-gray-700 hover:text-primary-500 transition-colors rounded-lg hover:bg-gray-50 border border-transparent hover:border-gray-200"
          aria-label={t('ui_select_language_aria')}
          aria-expanded={isOpen}
          type="button"
        >
          <Globe className="w-5 h-5 flex-shrink-0" />
          <span className="text-sm font-medium uppercase whitespace-nowrap">
            {currentLanguage.slug}
          </span>
          <svg
            className={`w-4 h-4 transition-transform flex-shrink-0 ${isOpen ? 'rotate-180' : ''}`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </button>

        {isOpen && (
          <>
            {/* Backdrop */}
            <div
              className="fixed inset-0 z-40"
              onClick={() => setIsOpen(false)}
            />
            
            {/* Dropdown Menu */}
            <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-xl border border-gray-200 z-[60] overflow-hidden">
              {languages.map((lang) => {
                const isActive = lang.slug === currentLang || (currentLang === null && lang.is_default);
                
                return (
                  <button
                    key={lang.term_id}
                    onClick={() => handleLanguageSwitch(lang)}
                    className={`w-full text-left px-4 py-2 text-sm transition-colors flex items-center gap-2 ${
                      isActive
                        ? 'bg-primary-50 text-primary-600 font-medium'
                        : 'text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    {lang.flag_url && (
                      <img
                        src={lang.flag_url}
                        alt={lang.name}
                        loading="lazy"
                        decoding="async"
                        width="20"
                        height="16"
                        className="w-5 h-4 object-cover rounded"
                      />
                    )}
                    <span>{lang.name}</span>
                    {isActive && (
                      <span className="ml-auto text-primary-600">✓</span>
                    )}
                  </button>
                );
              })}
            </div>
          </>
        )}
      </div>

      {/* Mobile Dropdown */}
      <div className="md:hidden">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="flex items-center gap-2 px-3 py-2 text-gray-700 hover:text-primary-500 transition-colors"
          aria-label={t('ui_select_language_aria')}
          aria-expanded={isOpen}
          type="button"
        >
          <Globe className="w-5 h-5 flex-shrink-0" />
          <span className="text-sm font-medium uppercase whitespace-nowrap">
            {currentLanguage.slug}
          </span>
        </button>

        {isOpen && (
          <>
            {/* Backdrop */}
            <div
              className="fixed inset-0 bg-black bg-opacity-50 z-40"
              onClick={() => setIsOpen(false)}
            />
            
            {/* Mobile Menu */}
            <div className="fixed top-0 right-0 h-full w-80 max-w-[85vw] bg-white shadow-xl z-[60] overflow-y-auto">
              <div className="flex items-center justify-between p-4 border-b border-gray-200">
                <span className="text-lg font-semibold text-gray-800">{t('ui_select_language')}</span>
                <button
                  onClick={() => setIsOpen(false)}
                  className="text-gray-700 hover:text-primary-500 transition-colors"
                  aria-label={t('ui_close')}
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              
              <div className="p-4 space-y-2">
                {languages.map((lang) => {
                  const isActive = lang.slug === currentLang || (currentLang === null && lang.is_default);
                  
                  return (
                    <button
                      key={lang.term_id}
                      onClick={() => handleLanguageSwitch(lang)}
                      className={`w-full text-left px-4 py-3 rounded-lg transition-colors flex items-center gap-3 ${
                        isActive
                          ? 'bg-primary-50 text-primary-600 font-medium'
                          : 'text-gray-700 hover:bg-gray-50'
                      }`}
                    >
                      {lang.flag_url && (
                        <img
                          src={lang.flag_url}
                          alt={lang.name}
                          loading="lazy"
                          decoding="async"
                          width="24"
                          height="20"
                          className="w-6 h-5 object-cover rounded"
                        />
                      )}
                      <span className="flex-1">{lang.name}</span>
                      {isActive && (
                        <span className="text-primary-600">✓</span>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

