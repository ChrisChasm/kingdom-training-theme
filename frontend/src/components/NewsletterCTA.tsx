import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Mail, ArrowRight, CheckCircle, AlertCircle } from 'lucide-react';
import { subscribeToNewsletter } from '@/lib/wordpress';

interface NewsletterCTAProps {
  variant?: 'inline' | 'banner' | 'card';
  title?: string;
  description?: string;
  showEmailInput?: boolean;
  className?: string;
}

export default function NewsletterCTA({
  variant = 'inline',
  title,
  description,
  showEmailInput = false,
  className = ''
}: NewsletterCTAProps) {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [message, setMessage] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;

    setStatus('loading');
    setMessage('');

    try {
      await subscribeToNewsletter(email);
      setStatus('success');
      setMessage('Thank you for subscribing!');
      setEmail('');
      setTimeout(() => setStatus('idle'), 3000);
    } catch (error) {
      setStatus('error');
      if (error instanceof Error) {
        setMessage(error.message || 'Something went wrong. Please try again.');
      } else {
        setMessage('Something went wrong. Please try again.');
      }
    }
  };

  const defaultTitle = title || 'Stay Connected';
  const defaultDescription = description || 'Get the latest training resources and insights delivered to your inbox.';

  if (variant === 'banner') {
    return (
      <section className={`bg-gradient-to-r from-primary-800 to-primary-600 text-white py-12 ${className}`}>
        <div className="container-custom">
          <div className="max-w-4xl mx-auto text-center">
            <Mail className="w-12 h-12 mx-auto mb-4 text-accent-500" />
            <h2 className="text-3xl font-bold mb-4">{defaultTitle}</h2>
            <p className="text-xl text-primary-100 mb-8 max-w-2xl mx-auto">{defaultDescription}</p>
            
            {showEmailInput ? (
              <form onSubmit={handleSubmit} className="max-w-md mx-auto">
                <div className="flex flex-col sm:flex-row gap-3">
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    placeholder="Enter your email"
                    className="flex-1 px-4 py-3 rounded-lg text-gray-900 focus:ring-2 focus:ring-accent-500 focus:outline-none"
                    disabled={status === 'loading' || status === 'success'}
                  />
                  <button
                    type="submit"
                    disabled={status === 'loading' || status === 'success'}
                    className="px-8 py-3 bg-accent-600 hover:bg-accent-500 text-secondary-900 font-semibold rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {status === 'loading' ? 'Subscribing...' : status === 'success' ? 'Subscribed!' : 'Subscribe'}
                  </button>
                </div>
                {status === 'success' && message && (
                  <p className="mt-4 text-green-200 flex items-center justify-center gap-2">
                    <CheckCircle className="w-5 h-5" />
                    {message}
                  </p>
                )}
                {status === 'error' && message && (
                  <p className="mt-4 text-red-200 flex items-center justify-center gap-2">
                    <AlertCircle className="w-5 h-5" />
                    {message}
                  </p>
                )}
              </form>
            ) : (
              <Link
                to="/newsletter"
                className="inline-flex items-center justify-center px-8 py-4 bg-accent-600 hover:bg-accent-500 text-secondary-900 font-semibold rounded-lg transition-colors duration-200 text-lg"
              >
                Subscribe to Newsletter
                <ArrowRight className="w-5 h-5 ml-2" />
              </Link>
            )}
          </div>
        </div>
      </section>
    );
  }

  if (variant === 'card') {
    return (
      <div className={`bg-background-50 border-2 border-primary-200 rounded-lg p-6 md:p-8 ${className}`}>
        <div className="flex items-start gap-4">
          <div className="flex-shrink-0 w-12 h-12 bg-primary-500 rounded-full flex items-center justify-center">
            <Mail className="w-6 h-6 text-white" />
          </div>
          <div className="flex-1">
            <h3 className="text-xl font-bold text-gray-900 mb-2">{defaultTitle}</h3>
            <p className="text-gray-700 mb-4">{defaultDescription}</p>
            
            {showEmailInput ? (
              <form onSubmit={handleSubmit}>
                <div className="flex flex-col sm:flex-row gap-3">
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    placeholder="Enter your email"
                    className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                    disabled={status === 'loading' || status === 'success'}
                  />
                  <button
                    type="submit"
                    disabled={status === 'loading' || status === 'success'}
                    className="px-6 py-2 bg-primary-500 hover:bg-primary-600 text-white font-semibold rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {status === 'loading' ? 'Subscribing...' : status === 'success' ? 'Subscribed!' : 'Subscribe'}
                  </button>
                </div>
                {status === 'success' && message && (
                  <p className="mt-2 text-sm text-green-600 flex items-center gap-2">
                    <CheckCircle className="w-4 h-4" />
                    {message}
                  </p>
                )}
                {status === 'error' && message && (
                  <p className="mt-2 text-sm text-red-600 flex items-center gap-2">
                    <AlertCircle className="w-4 h-4" />
                    {message}
                  </p>
                )}
              </form>
            ) : (
              <Link
                to="/newsletter"
                className="inline-flex items-center text-primary-500 hover:text-primary-600 font-semibold"
              >
                Subscribe now
                <ArrowRight className="w-4 h-4 ml-1" />
              </Link>
            )}
          </div>
        </div>
      </div>
    );
  }

  // Default inline variant
  return (
    <div className={`flex flex-col sm:flex-row items-center justify-between gap-4 p-6 bg-primary-50 rounded-lg ${className}`}>
      <div className="flex-1">
        <h3 className="text-lg font-semibold text-gray-900 mb-1">{defaultTitle}</h3>
        <p className="text-sm text-gray-700">{defaultDescription}</p>
      </div>
      {showEmailInput ? (
        <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            placeholder="Enter your email"
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 sm:w-64"
            disabled={status === 'loading' || status === 'success'}
          />
          <button
            type="submit"
            disabled={status === 'loading' || status === 'success'}
            className="px-6 py-2 bg-primary-500 hover:bg-primary-600 text-white font-semibold rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap"
          >
            {status === 'loading' ? 'Subscribing...' : status === 'success' ? 'Subscribed!' : 'Subscribe'}
          </button>
        </form>
      ) : (
        <Link
          to="/newsletter"
          className="inline-flex items-center px-6 py-2 bg-primary-500 hover:bg-primary-600 text-white font-semibold rounded-lg transition-colors whitespace-nowrap"
        >
          Subscribe
          <ArrowRight className="w-4 h-4 ml-2" />
        </Link>
      )}
    </div>
  );
}

