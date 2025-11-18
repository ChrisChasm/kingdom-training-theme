/**
 * Hero Component
 * Homepage hero section
 */

import { Link } from 'react-router-dom';

interface HeroProps {
  title: string;
  subtitle: string;
  description?: string;
  ctaText?: string;
  ctaLink?: string;
}

export default function Hero({ 
  title, 
  subtitle, 
  description,
  ctaText = "Explore Our Resources",
  ctaLink = "/articles"
}: HeroProps) {
  return (
    <section className="bg-gradient-to-br from-secondary-900 via-secondary-800 to-secondary-700 text-white">
      <div className="container-custom py-20 md:py-32">
        <div className="max-w-4xl">
          {/* Subtitle */}
          <p className="text-accent-500 font-semibold mb-4 text-lg">
            {subtitle}
          </p>

          {/* Title */}
          <h1 className="text-4xl md:text-6xl font-bold mb-6 leading-tight">
            {title}
          </h1>

          {/* Description */}
          {description && (
            <p className="text-xl text-secondary-100 mb-8 leading-relaxed max-w-3xl">
              {description}
            </p>
          )}

          {/* CTA Buttons */}
          <div className="flex flex-wrap gap-4">
            <Link 
              to={ctaLink}
              className="inline-flex items-center justify-center px-8 py-4 border-2 border-white text-base font-semibold rounded-lg text-white bg-transparent hover:bg-white hover:text-secondary-900 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-white transition-all duration-200"
            >
              {ctaText}
            </Link>
            <Link 
              to="/articles"
              className="inline-flex items-center justify-center px-8 py-4 border-2 border-white/30 text-base font-semibold rounded-lg text-white hover:border-white hover:bg-white/10 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-white transition-all duration-200"
            >
              Explore Resources
            </Link>
          </div>
        </div>
      </div>

      {/* Wave Divider */}
      <div className="relative h-16 bg-white">
        <svg 
          className="absolute top-0 w-full h-16 -mt-16" 
          preserveAspectRatio="none" 
          viewBox="0 0 1440 54"
          fill="none"
        >
          <path 
            fill="currentColor" 
            className="text-white"
            d="M0 22L120 16.7C240 11 480 1.00001 720 0.700012C960 1.00001 1200 11 1320 16.7L1440 22V54H1320C1200 54 960 54 720 54C480 54 240 54 120 54H0V22Z"
          />
        </svg>
      </div>
    </section>
  );
}

