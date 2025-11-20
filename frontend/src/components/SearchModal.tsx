/**
 * SearchModal Component
 * Modal dialog for searching strategy courses and tools
 */

import { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { X, Search, Loader2 } from 'lucide-react';
import { searchStrategyCoursesAndTools, SearchResult } from '@/lib/wordpress';
import { stripHtml, truncate } from '@/lib/utils';

interface SearchModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function SearchModal({ isOpen, onClose }: SearchModalProps) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();

  // Focus input when modal opens
  useEffect(() => {
    if (isOpen && inputRef.current) {
      // Small delay to ensure modal is rendered
      setTimeout(() => {
        inputRef.current?.focus();
      }, 100);
    }
  }, [isOpen]);

  // Reset state when modal closes
  useEffect(() => {
    if (!isOpen) {
      setQuery('');
      setResults([]);
      setHasSearched(false);
    }
  }, [isOpen]);

  // Debounced search
  useEffect(() => {
    if (!isOpen) return;

    const trimmedQuery = query.trim();
    if (trimmedQuery.length < 2) {
      setResults([]);
      setHasSearched(false);
      return;
    }

    setLoading(true);
    setHasSearched(true);

    const timeoutId = setTimeout(async () => {
      try {
        const searchResults = await searchStrategyCoursesAndTools(trimmedQuery);
        setResults(searchResults);
      } catch (error) {
        console.error('Search error:', error);
        setResults([]);
      } finally {
        setLoading(false);
      }
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [query, isOpen]);

  // Handle Escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [isOpen, onClose]);

  // Prevent body scroll when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  const handleResultClick = (result: SearchResult) => {
    const path = result.resultType === 'strategy-course' 
      ? `/strategy-courses/${result.slug}`
      : `/tools/${result.slug}`;
    navigate(path);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-[100] flex items-start justify-center pt-[10vh] px-4"
      onClick={(e) => {
        // Close if clicking backdrop
        if (e.target === e.currentTarget) {
          onClose();
        }
      }}
    >
      {/* Backdrop */}
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm" aria-hidden="true" />

      {/* Modal */}
      <div className="relative w-full max-w-2xl bg-white rounded-lg shadow-2xl max-h-[80vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center gap-4 p-6 border-b border-gray-200">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              ref={inputRef}
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search strategy courses and tools..."
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none"
            />
          </div>
          <button
            onClick={onClose}
            className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
            aria-label="Close search"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Results */}
        <div className="flex-1 overflow-y-auto p-6">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-12">
              <Loader2 className="w-8 h-8 text-primary-500 animate-spin mb-4" />
              <p className="text-gray-600">Searching...</p>
            </div>
          ) : hasSearched && query.trim().length >= 2 ? (
            results.length > 0 ? (
              <div className="space-y-3">
                {results.map((result) => {
                  const excerpt = stripHtml(result.excerpt.rendered);
                  const truncatedExcerpt = truncate(excerpt, 100);
                  const typeLabel = result.resultType === 'strategy-course' ? 'Strategy Course' : 'Tool';
                  const typeColor = result.resultType === 'strategy-course' 
                    ? 'bg-primary-100 text-primary-700' 
                    : 'bg-secondary-100 text-secondary-700';

                  return (
                    <button
                      key={`${result.resultType}-${result.id}`}
                      onClick={() => handleResultClick(result)}
                      className="w-full text-left p-4 border border-gray-200 rounded-lg hover:border-primary-500 hover:shadow-md transition-all duration-200 group"
                    >
                      <div className="flex items-start gap-3">
                        <div className={`px-2 py-1 rounded text-xs font-semibold ${typeColor}`}>
                          {typeLabel}
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className="text-lg font-semibold text-gray-900 group-hover:text-primary-600 transition-colors mb-1">
                            {result.title.rendered}
                          </h3>
                          {truncatedExcerpt && (
                            <p className="text-sm text-gray-600 line-clamp-2">
                              {truncatedExcerpt}
                            </p>
                          )}
                        </div>
                        <div className="flex-shrink-0 text-gray-400 group-hover:text-primary-500 transition-colors">
                          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                          </svg>
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-12">
                <Search className="w-12 h-12 text-gray-300 mb-4" />
                <p className="text-gray-600 font-medium">No results found</p>
                <p className="text-sm text-gray-500 mt-1">Try a different search term</p>
              </div>
            )
          ) : (
            <div className="flex flex-col items-center justify-center py-12">
              <Search className="w-12 h-12 text-gray-300 mb-4" />
              <p className="text-gray-600">Start typing to search...</p>
              <p className="text-sm text-gray-500 mt-1">Search strategy courses and tools</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

