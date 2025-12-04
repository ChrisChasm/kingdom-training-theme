/**
 * Language Context Provider
 * Centralized language state management with localStorage caching
 * Eliminates redundant API calls by sharing language data across all components
 */

import { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import { getLanguages, Language } from '@/lib/wordpress';

// Cache keys
const CACHE_KEY_LANGUAGES = 'kt_languages';
const CACHE_KEY_DEFAULT_LANG = 'kt_default_lang';
const CACHE_KEY_TIME = 'kt_languages_time';
const CACHE_TTL = 3600000; // 1 hour in milliseconds

interface LanguageContextType {
  languages: Language[];
  defaultLang: string | null;
  loading: boolean;
  error: Error | null;
  refreshLanguages: () => Promise<void>;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

/**
 * Check if we're in browser environment
 */
function isBrowser(): boolean {
  return typeof window !== 'undefined' && typeof localStorage !== 'undefined';
}

/**
 * Check if cached data is still valid
 */
function isCacheValid(): boolean {
  if (!isBrowser()) return false;
  try {
    const cacheTime = localStorage.getItem(CACHE_KEY_TIME);
    if (!cacheTime) return false;
    
    const age = Date.now() - parseInt(cacheTime, 10);
    return age < CACHE_TTL;
  } catch {
    return false;
  }
}

/**
 * Get cached languages from localStorage
 */
function getCachedLanguages(): { languages: Language[]; defaultLang: string | null } | null {
  if (!isBrowser()) return null;
  try {
    const cached = localStorage.getItem(CACHE_KEY_LANGUAGES);
    const cachedDefault = localStorage.getItem(CACHE_KEY_DEFAULT_LANG);
    
    if (cached && isCacheValid()) {
      return {
        languages: JSON.parse(cached),
        defaultLang: cachedDefault || null,
      };
    }
  } catch (e) {
    console.warn('Failed to read language cache:', e);
  }
  return null;
}

/**
 * Save languages to localStorage cache
 */
function setCachedLanguages(languages: Language[], defaultLang: string | null): void {
  if (!isBrowser()) return;
  try {
    localStorage.setItem(CACHE_KEY_LANGUAGES, JSON.stringify(languages));
    localStorage.setItem(CACHE_KEY_DEFAULT_LANG, defaultLang || '');
    localStorage.setItem(CACHE_KEY_TIME, Date.now().toString());
  } catch (e) {
    console.warn('Failed to cache languages:', e);
  }
}

interface LanguageProviderProps {
  children: ReactNode;
}

export function LanguageProvider({ children }: LanguageProviderProps) {
  const [languages, setLanguages] = useState<Language[]>([]);
  const [defaultLang, setDefaultLang] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [initialized, setInitialized] = useState(false);

  const fetchLanguages = useCallback(async (useCache: boolean = true) => {
    // Check cache first if allowed
    if (useCache) {
      const cached = getCachedLanguages();
      if (cached) {
        setLanguages(cached.languages);
        setDefaultLang(cached.defaultLang);
        setLoading(false);
        setInitialized(true);
        
        // Still fetch in background to update cache
        fetchFromAPI(false);
        return;
      }
    }
    
    await fetchFromAPI(true);
  }, []);

  const fetchFromAPI = async (updateLoadingState: boolean) => {
    try {
      if (updateLoadingState) {
        setLoading(true);
      }
      
      const langs = await getLanguages();
      
      // Find default language
      const defaultLanguage = langs.find(lang => lang.is_default);
      const defaultLangSlug = defaultLanguage ? defaultLanguage.slug : null;
      
      setLanguages(langs);
      setDefaultLang(defaultLangSlug);
      setError(null);
      
      // Cache the results
      setCachedLanguages(langs, defaultLangSlug);
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Failed to load languages');
      setError(error);
      console.error('Error fetching languages:', error);
    } finally {
      if (updateLoadingState) {
        setLoading(false);
      }
      setInitialized(true);
    }
  };

  // Force refresh languages (bypasses cache)
  const refreshLanguages = useCallback(async () => {
    await fetchFromAPI(true);
  }, []);

  // Initial load
  useEffect(() => {
    if (!initialized) {
      fetchLanguages(true);
    }
  }, [fetchLanguages, initialized]);

  const value: LanguageContextType = {
    languages,
    defaultLang,
    loading,
    error,
    refreshLanguages,
  };

  return (
    <LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider>
  );
}

/**
 * Hook to access language context
 * Must be used within a LanguageProvider
 */
export function useLanguageContext(): LanguageContextType {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error('useLanguageContext must be used within a LanguageProvider');
  }
  return context;
}

/**
 * Convenience hook to get just the default language
 * Replaces direct getDefaultLanguage() calls in components
 */
export function useDefaultLanguage(): string | null {
  const { defaultLang } = useLanguageContext();
  return defaultLang;
}

/**
 * Convenience hook to get available languages
 * Replaces direct getLanguages() calls in components
 */
export function useLanguages(): { languages: Language[]; loading: boolean; error: Error | null } {
  const { languages, loading, error } = useLanguageContext();
  return { languages, loading, error };
}

