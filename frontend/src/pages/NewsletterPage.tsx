import { useState } from 'react';
import PageHeader from '@/components/PageHeader';
import { subscribeToNewsletter } from '@/lib/wordpress';
import { CheckCircle, AlertCircle, Mail } from 'lucide-react';

export default function NewsletterPage() {
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [message, setMessage] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus('loading');
    setMessage('');

    try {
      await subscribeToNewsletter(email, name);
      setStatus('success');
      setMessage('Thank you for subscribing! Check your email to confirm your subscription.');
      setEmail('');
      setName('');
    } catch (error) {
      setStatus('error');
      if (error instanceof Error) {
        setMessage(error.message || 'Something went wrong. Please try again.');
      } else {
        setMessage('Something went wrong. Please try again.');
      }
    }
  };

  return (
    <>
      <PageHeader 
        title="Newsletter"
        description="Stay connected with the latest training resources, articles, and updates on Media to Disciple Making Movements."
        backgroundClass="bg-gradient-to-r from-primary-800 to-primary-600"
      />

      <section className="py-16 bg-white">
        <div className="container-custom">
          <div className="max-w-2xl mx-auto">
            <div className="bg-background-50 rounded-lg p-8 md:p-12 shadow-lg">
              <div className="text-center mb-8">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-primary-500 rounded-full mb-4">
                  <Mail className="w-8 h-8 text-white" />
                </div>
                <h2 className="text-3xl font-bold text-gray-900 mb-4">
                  Subscribe to Our Newsletter
                </h2>
                <p className="text-lg text-gray-700 leading-relaxed">
                  Get the latest training resources, articles, and insights delivered directly to your inbox. 
                  Join our community of disciple makers committed to using media strategically for Kingdom impact.
                </p>
              </div>

              {status === 'success' ? (
                <div className="bg-green-50 border-2 border-green-200 rounded-lg p-6 mb-6">
                  <div className="flex items-start gap-4">
                    <CheckCircle className="w-6 h-6 text-green-600 flex-shrink-0 mt-0.5" />
                    <div>
                      <h3 className="text-lg font-semibold text-green-900 mb-2">Success!</h3>
                      <p className="text-green-800">{message}</p>
                    </div>
                  </div>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div>
                    <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                      Name (Optional)
                    </label>
                    <input
                      type="text"
                      id="name"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors"
                      placeholder="Your name"
                    />
                  </div>

                  <div>
                    <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                      Email Address <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="email"
                      id="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors"
                      placeholder="your.email@example.com"
                    />
                  </div>

                  {status === 'error' && message && (
                    <div className="bg-red-50 border-2 border-red-200 rounded-lg p-4">
                      <div className="flex items-start gap-3">
                        <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                        <p className="text-red-800 text-sm">{message}</p>
                      </div>
                    </div>
                  )}

                  <button
                    type="submit"
                    disabled={status === 'loading'}
                    className="w-full px-8 py-4 bg-primary-500 hover:bg-primary-600 disabled:bg-primary-400 text-white font-semibold rounded-lg transition-colors duration-200 text-lg disabled:cursor-not-allowed"
                  >
                    {status === 'loading' ? (
                      <span className="flex items-center justify-center gap-2">
                        <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        Subscribing...
                      </span>
                    ) : (
                      'Subscribe to Newsletter'
                    )}
                  </button>
                </form>
              )}

              <div className="mt-8 pt-8 border-t border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">What to Expect</h3>
                <ul className="space-y-3 text-gray-700">
                  <li className="flex items-start gap-3">
                    <CheckCircle className="w-5 h-5 text-primary-500 flex-shrink-0 mt-0.5" />
                    <span>Weekly updates on new training resources and courses</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <CheckCircle className="w-5 h-5 text-primary-500 flex-shrink-0 mt-0.5" />
                    <span>Latest articles and insights on Media to Disciple Making Movements</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <CheckCircle className="w-5 h-5 text-primary-500 flex-shrink-0 mt-0.5" />
                    <span>Practical tools and strategies for disciple makers</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <CheckCircle className="w-5 h-5 text-primary-500 flex-shrink-0 mt-0.5" />
                    <span>Stories from the field and testimonies of impact</span>
                  </li>
                </ul>
              </div>

              <div className="mt-6 text-sm text-gray-600 text-center">
                <p>
                  We respect your privacy. Unsubscribe at any time. 
                  <a href="/about" className="text-primary-500 hover:text-primary-600 ml-1">
                    Learn more about our privacy policy
                  </a>
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}

