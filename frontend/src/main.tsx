import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { HelmetProvider } from 'react-helmet-async';
import { QueryClientProvider } from '@tanstack/react-query';
import { queryClient } from './lib/query-client';
import { LanguageProvider } from './contexts/LanguageContext';
import App from './App';
import './styles/globals.css';

const rootElement = document.getElementById('root')!;

const AppWithProviders = (
  <React.StrictMode>
    <QueryClientProvider client={queryClient}>
      <HelmetProvider>
        <LanguageProvider>
          <BrowserRouter>
            <App />
          </BrowserRouter>
        </LanguageProvider>
      </HelmetProvider>
    </QueryClientProvider>
  </React.StrictMode>
);

// Note: We use createRoot instead of hydrateRoot to avoid hydration mismatches.
// The pre-rendered HTML from react-snap is still beneficial for:
// 1. SEO - search engine crawlers see the full HTML content
// 2. Faster First Contentful Paint - users see the page structure immediately
// 3. Social sharing - meta tags are present in the HTML
//
// React will replace the pre-rendered content with fresh client-rendered content,
// which provides a smoother experience for interactive features.
ReactDOM.createRoot(rootElement).render(AppWithProviders);

