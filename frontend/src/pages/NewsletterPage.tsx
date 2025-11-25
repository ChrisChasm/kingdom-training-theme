import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import PageHeader from '@/components/PageHeader';
import SEO from '@/components/SEO';
import { renderShortcode } from '@/lib/wordpress';
import { CheckCircle, Mail, AlertCircle } from 'lucide-react';

export default function NewsletterPage() {
  const [shortcodeHtml, setShortcodeHtml] = useState<string>('');
  const [shortcodeLoading, setShortcodeLoading] = useState(true);
  const [formStatus, setFormStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [formMessage, setFormMessage] = useState('');
  const formContainerRef = useRef<HTMLDivElement>(null);

  // Fetch and render the shortcode on component mount
  useEffect(() => {
    async function fetchShortcode() {
      try {
        const html = await renderShortcode('[go_display_opt_in source="kt_news" name="Kingdom.Training"]');
        setShortcodeHtml(html);
      } catch (error) {
        console.error('Error fetching shortcode:', error);
        // Silently fail - don't show error to user if shortcode fails
      } finally {
        setShortcodeLoading(false);
      }
    }
    fetchShortcode();
  }, []);

  // Intercept form submission after shortcode is rendered
  useEffect(() => {
    if (!shortcodeHtml || shortcodeLoading) return;

    const formElement = formContainerRef.current?.querySelector('form');
    const submitButtonElement = formContainerRef.current?.querySelector('#go-submit-form-button');

    if (!formElement || !submitButtonElement) return;

    // Store reference that TypeScript knows is non-null
    const form = formElement;

    // Initialize global token storage
    (window as any).cf_token = null;

    // Cloudflare Turnstile site key (fallback if not provided by server)
    const TURNSTILE_SITE_KEY = '0x4AAAAAAA1dT7LSth0AgFDm';

    // Ensure Turnstile script is loaded
    // Note: Scripts in dangerouslySetInnerHTML don't execute, so we must load it ourselves
    const ensureTurnstileScript = (): Promise<void> => {
      return new Promise((resolve) => {
        // Check if Turnstile API is already available
        if (typeof (window as any).turnstile !== 'undefined') {
          console.log('Turnstile API already loaded');
          resolve();
          return;
        }

        // Remove any non-functional script tags from shortcode (they don't execute via dangerouslySetInnerHTML)
        const deadScripts = document.querySelectorAll('script[src*="challenges.cloudflare.com/turnstile"]');
        deadScripts.forEach(script => {
          // Check if this script actually loaded (API would be available)
          // If API is not available, this script tag is "dead" and should be removed
          if (typeof (window as any).turnstile === 'undefined') {
            script.remove();
          }
        });

        // Load the script fresh with explicit render mode
        const script = document.createElement('script');
        script.src = 'https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit';
        script.async = true;
        script.onload = () => {
          console.log('Turnstile script loaded successfully');
          resolve();
        };
        script.onerror = (e) => {
          console.error('Failed to load Turnstile script:', e);
          resolve(); // Resolve anyway to avoid hanging
        };
        document.head.appendChild(script);
      });
    };

    // Initialize Turnstile widget
    const initializeTurnstileWidget = async () => {
      console.log('Initializing Turnstile widget...');
      
      // Ensure script is loaded FIRST
      await ensureTurnstileScript();
      
      // Verify Turnstile API is available
      if (typeof (window as any).turnstile === 'undefined') {
        console.error('Turnstile API not available after script load');
        return;
      }
      
      let turnstileWidget = form.querySelector('.cf-turnstile') as HTMLElement;
      
      // Create widget container if it doesn't exist
      if (!turnstileWidget) {
        console.log('Creating Turnstile widget container');
        turnstileWidget = document.createElement('div');
        turnstileWidget.className = 'cf-turnstile';
        turnstileWidget.id = 'turnstile-widget';
        // Insert before submit button
        const submitBtn = form.querySelector('#go-submit-form-button');
        if (submitBtn && submitBtn.parentNode) {
          submitBtn.parentNode.insertBefore(turnstileWidget, submitBtn);
        } else {
          form.appendChild(turnstileWidget);
        }
      }

      // Always set/update site key to ensure it's correct
      turnstileWidget.setAttribute('data-sitekey', TURNSTILE_SITE_KEY);
      turnstileWidget.setAttribute('data-theme', 'light');

      // Check if widget is already rendered
      const existingIframe = turnstileWidget.querySelector('iframe');
      if (existingIframe) {
        console.log('Turnstile widget already rendered');
        return;
      }

      // Clear any previous content in the widget container
      turnstileWidget.innerHTML = '';

      // Render the widget explicitly
      try {
        console.log('Rendering Turnstile widget with site key:', TURNSTILE_SITE_KEY);
        const widgetId = (window as any).turnstile.render(turnstileWidget, {
          sitekey: TURNSTILE_SITE_KEY,
          theme: 'light',
          callback: (token: string) => {
            console.log('Turnstile token received');
            (window as any).cf_token = token;
            // Also call save_cf if it exists
            if (typeof (window as any).save_cf === 'function') {
              (window as any).save_cf(token);
            }
          },
          'error-callback': () => {
            console.error('Turnstile widget error');
          },
          'expired-callback': () => {
            console.log('Turnstile token expired');
            (window as any).cf_token = null;
          },
        });
        console.log('Turnstile widget rendered, ID:', widgetId);
      } catch (error) {
        console.error('Error rendering Turnstile widget:', error);
      }
    };

    // Wait for Turnstile script to load and widget to render
    const checkTurnstileReady = () => {
      const turnstileWidget = form.querySelector('.cf-turnstile');
      const siteKey = turnstileWidget?.getAttribute('data-sitekey');
      
      // If no site key is configured, skip widget checks
      if (!siteKey) {
        console.warn('Cloudflare Turnstile site key not configured');
        return;
      }
      
      // Check if Turnstile API is loaded
      if (typeof (window as any).turnstile === 'undefined') {
        console.log('Waiting for Cloudflare Turnstile script to load...');
        return false;
      }
      
      // Check if widget has rendered (has an iframe)
      const widgetIframe = turnstileWidget?.querySelector('iframe');
      if (!widgetIframe) {
        console.log('Waiting for Cloudflare Turnstile widget to render...');
        return false;
      }
      
      return true;
    };

    // Set up save_cf callback globally BEFORE initializing widget
    (window as any).save_cf = function(token: string) {
      console.log('save_cf called with token');
      (window as any).cf_token = token;
    };

    // Initialize Turnstile widget after a short delay to ensure DOM is ready
    const initTimeoutId = setTimeout(async () => {
      await initializeTurnstileWidget();
      
      // Check if widget is ready after a delay
      setTimeout(() => {
        if (!checkTurnstileReady()) {
          console.warn('Turnstile widget may not have rendered properly. Retrying...');
          // Try to re-render
          initializeTurnstileWidget();
        }
      }, 2000);
    }, 200);

    // Extract nonce from the rendered HTML script tag
    const extractNonce = (): string | null => {
      const scripts = formContainerRef.current?.querySelectorAll('script');
      if (!scripts) return null;
      
      for (const script of Array.from(scripts)) {
        const scriptContent = script.textContent || '';
        const nonceMatch = scriptContent.match(/X-WP-Nonce['"]:\s*['"]([^'"]+)['"]/);
        if (nonceMatch) {
          return nonceMatch[1];
        }
      }
      return null;
    };

    // Get Cloudflare token from global variable (set by Turnstile widget)
    const getCloudflareToken = (): string | null => {
      // Access the global cf_token variable set by the Turnstile widget callback
      return (window as any).cf_token || null;
    };

    const handleSubmit = async (e: Event) => {
      e.preventDefault();
      e.stopPropagation();

      setFormStatus('loading');
      setFormMessage('');

      try {
        // Get form data
        const email2 = (form.querySelector('input[name="email2"]') as HTMLInputElement)?.value || '';
        const email = (form.querySelector('input[name="email"]') as HTMLInputElement)?.value || '';
        const firstName = (form.querySelector('input[name="first_name"]') as HTMLInputElement)?.value || '';
        const lastName = (form.querySelector('input[name="last_name"]') as HTMLInputElement)?.value || '';
        const confirmSubscribe = (form.querySelector('#confirm-subscribe') as HTMLInputElement)?.checked;

        // Validate honeypot (email field should be empty)
        if (email) {
          return; // Honeypot caught - ignore submission
        }

        // Validate checkbox
        if (!confirmSubscribe) {
          setFormStatus('error');
          setFormMessage('You must confirm that you want to subscribe.');
          return;
        }

        // Get required tokens
        const nonce = extractNonce();
        const cfToken = getCloudflareToken();

        if (!nonce) {
          console.error('WordPress nonce not found');
          setFormStatus('error');
          setFormMessage('Security token not found. Please refresh the page.');
          return;
        }

        // Check if Turnstile widget exists and is visible
        const turnstileWidget = form.querySelector('.cf-turnstile');
        const siteKey = turnstileWidget?.getAttribute('data-sitekey');
        
        // Only require token if widget is configured
        if (siteKey && !cfToken) {
          // Check if widget is actually visible
          const widgetVisible = turnstileWidget && 
            (turnstileWidget as HTMLElement).offsetHeight > 0 && 
            (turnstileWidget as HTMLElement).offsetWidth > 0;
          
          if (!widgetVisible) {
            setFormStatus('error');
            setFormMessage('Security verification widget is loading. Please wait a moment and try again.');
          } else {
            setFormStatus('error');
            setFormMessage('Please complete the security verification above.');
          }
          
          // Scroll to widget if it exists
          if (turnstileWidget) {
            turnstileWidget.scrollIntoView({ behavior: 'smooth', block: 'center' });
          }
          return;
        }
        
        // If widget is not configured, log a warning but don't block submission
        if (!siteKey) {
          console.warn('Cloudflare Turnstile site key not configured. Form submission may fail on the server.');
        }

        // Get the form action URL (should be the double-optin endpoint)
        const formAction = form.getAttribute('action') || '/wp-json/go-webform/double-optin';
        const apiUrl = formAction.startsWith('http') 
          ? formAction 
          : `${window.location.origin}${formAction}`;

        // Submit via fetch with proper headers and JSON body
        const response = await fetch(apiUrl, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'X-WP-Nonce': nonce,
          },
          body: JSON.stringify({
            email: email2,
            first_name: firstName,
            last_name: lastName,
            source: 'kt_news',
            cf_turnstile: cfToken,
          }),
        });

        const data = await response.json();

        if (response.ok && data !== false) {
          setFormStatus('success');
          setFormMessage('Thank you for subscribing! Please check your email to confirm your subscription.');
          // Reset form
          form.reset();
        } else {
          setFormStatus('error');
          setFormMessage(data?.message || 'Something went wrong. Please try again.');
        }
      } catch (error) {
        console.error('Error submitting form:', error);
        setFormStatus('error');
        setFormMessage('Failed to submit. Please try again.');
      }
    };

    form.addEventListener('submit', handleSubmit);

    return () => {
      clearTimeout(initTimeoutId);
      form.removeEventListener('submit', handleSubmit);
    };
  }, [shortcodeHtml, shortcodeLoading]);

  return (
    <>
      <SEO
        title="Newsletter"
        description="Subscribe to Kingdom.Training newsletter and stay connected with the latest training resources, articles, and updates on Media to Disciple Making Movements. Get practical insights delivered to your inbox."
        keywords="kingdom training newsletter, M2DMM updates, disciple making newsletter, subscribe, training resources, ministry updates"
        url="/newsletter"
        noindex={true}
      />
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

              {/* Render shortcode from Gospel Ambition Web Forms plugin */}
              {shortcodeLoading ? (
                <div className="mb-8">
                  <div className="flex items-center justify-center py-8">
                    <div className="w-5 h-5 border-2 border-primary-500 border-t-transparent rounded-full animate-spin"></div>
                  </div>
                </div>
              ) : shortcodeHtml ? (
                <>
                  <div 
                    ref={formContainerRef}
                    className="mb-8"
                    dangerouslySetInnerHTML={{ __html: shortcodeHtml }}
                  />
                  
                  {/* Form submission status messages */}
                  {formStatus === 'loading' && (
                    <div className="mb-6 bg-blue-50 border-2 border-blue-200 rounded-lg p-4">
                      <div className="flex items-center gap-3">
                        <div className="w-5 h-5 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                        <p className="text-blue-800">Submitting your subscription...</p>
                      </div>
                    </div>
                  )}
                  
                  {formStatus === 'success' && formMessage && (
                    <div className="mb-6 bg-green-50 border-2 border-green-200 rounded-lg p-4">
                      <div className="flex items-start gap-3">
                        <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                        <p className="text-green-800">{formMessage}</p>
                      </div>
                    </div>
                  )}
                  
                  {formStatus === 'error' && formMessage && (
                    <div className="mb-6 bg-red-50 border-2 border-red-200 rounded-lg p-4">
                      <div className="flex items-start gap-3">
                        <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                        <p className="text-red-800">{formMessage}</p>
                      </div>
                    </div>
                  )}
                </>
              ) : null}

              <div className="mt-8 pt-8 border-t border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">What to Expect</h3>
                <ul className="space-y-3 text-gray-700">
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
                  <Link to="/privacy" className="text-primary-500 hover:text-primary-600 ml-1">
                    Learn more about our privacy policy
                  </Link>
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}

