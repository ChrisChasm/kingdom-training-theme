/**
 * React Hook for Translations
 * Provides access to translated UI strings
 * Optimized with localStorage caching for instant initial load
 */

import { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { fetchTranslations, Translations, getDefaultTranslations } from '@/lib/translations';
import { parseLanguageFromPath } from '@/lib/utils';
import { useLocation } from 'react-router-dom';

export function useTranslation() {
  const location = useLocation();
  // Initialize with default translations for instant render
  const [translations, setTranslations] = useState<Translations | null>(() => getDefaultTranslations());
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const lastLangRef = useRef<string | null | undefined>(undefined);

  // Get current language from URL
  const { lang: currentLang } = parseLanguageFromPath(location.pathname);

  useEffect(() => {
    // Skip if language hasn't changed
    if (lastLangRef.current === currentLang) {
      return;
    }
    lastLangRef.current = currentLang;

    let isMounted = true;

    async function loadTranslations() {
      try {
        // Don't set loading to true if we already have translations
        // This prevents flash of loading state on subsequent navigations
        if (!translations) {
          setLoading(true);
        }
        setError(null);
        
        const trans = await fetchTranslations(currentLang || null);
        
        if (isMounted) {
          setTranslations(trans);
          setLoading(false);
        }
      } catch (err) {
        if (isMounted) {
          setError(err instanceof Error ? err : new Error('Failed to load translations'));
          setLoading(false);
          // Keep existing translations on error, or use defaults
          if (!translations) {
            setTranslations(getDefaultTranslations());
          }
        }
      }
    }

    loadTranslations();

    return () => {
      isMounted = false;
    };
  }, [currentLang]);

  // Get default translations for fallback
  const defaultTranslations = useMemo(() => getDefaultTranslations(), []);

  // Translation function with fallback to default English translations
  const t = useCallback((key: keyof Translations, fallback?: string): string => {
    // First check if we have a translation from the API
    if (translations && translations[key] && translations[key].trim() !== '') {
      return translations[key];
    }
    
    // Fall back to default English translation
    if (defaultTranslations[key]) {
      return defaultTranslations[key];
    }
    
    // Last resort: use provided fallback or return the key
    return fallback || key;
  }, [translations, defaultTranslations]);

  // Helper function to replace placeholders (e.g., {count})
  const tWithReplace = useCallback((key: keyof Translations, replacements: Record<string, string | number>): string => {
    let text = t(key);
    Object.entries(replacements).forEach(([placeholder, value]) => {
      text = text.replace(`{${placeholder}}`, String(value));
    });
    return text;
  }, [t]);

  return {
    t,
    tWithReplace,
    translations,
    loading,
    error,
    currentLang: currentLang || null,
  };
}

