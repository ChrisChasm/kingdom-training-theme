/**
 * Footer Component
 * Site footer with navigation and mission statement
 * Includes structured data for Answer Engine Optimization
 */

import { Link } from 'react-router-dom';
import StructuredData from './StructuredData';
import { useTranslation } from '@/hooks/useTranslation';

export default function Footer() {
  const { t } = useTranslation();
  const currentYear = new Date().getFullYear();
  
  // Get the current site URL
  const siteUrl = typeof window !== 'undefined' 
    ? window.location.origin 
    : 'https://ai.kingdom.training';
  
  const logoUrl = `${siteUrl}/wp-content/themes/kingdom-training-theme/dist/kt-logo-header.webp`;

  return (
    <>
      {/* Structured Data for Organization and Website */}
      <StructuredData
        organization={{
          name: 'Kingdom.Training',
          url: siteUrl,
          logo: logoUrl,
          description: t('footer_mission_statement'),
          sameAs: [
            'https://twitter.com/kingdomtraining',
            // Add other social media profiles as available
          ],
        }}
        website={{
          name: 'Kingdom.Training',
          url: siteUrl,
          description: t('footer_mission_statement'),
        }}
        faq={{
          questions: [
            {
              question: t('faq_m2dmm_question'),
              answer: t('faq_m2dmm_answer'),
            },
            {
              question: t('faq_mvp_course_question'),
              answer: t('faq_mvp_course_answer'),
            },
            {
              question: t('faq_disciple_tools_question'),
              answer: t('faq_disciple_tools_answer'),
            },
            {
              question: t('faq_heavenly_economy_question'),
              answer: t('faq_heavenly_economy_answer'),
            },
            {
              question: t('faq_kingdom_training_for_question'),
              answer: t('faq_kingdom_training_for_answer'),
            },
          ],
        }}
      />
      
      <footer className="bg-secondary-900 text-secondary-100">
      <div className="container-custom py-12 min-h-[400px]">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Brand & Mission */}
          <div>
            <div className="mb-4">
              <h2 className="text-white text-2xl font-bold uppercase tracking-wide">
                {t('footer_kingdom_training')}
              </h2>
            </div>
            <p className="text-sm text-gray-400 leading-relaxed">
              {t('footer_mission_statement')}
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-white font-semibold mb-4">{t('footer_quick_links')}</h3>
            <ul className="space-y-2">
              <li>
                <Link to="/strategy-courses" className="text-sm hover:text-white transition-colors">
                  {t('nav_strategy_courses')}
                </Link>
              </li>
              <li>
                <Link to="/articles" className="text-sm hover:text-white transition-colors">
                  {t('nav_articles')}
                </Link>
              </li>
              <li>
                <Link to="/tools" className="text-sm hover:text-white transition-colors">
                  {t('nav_tools')}
                </Link>
              </li>
              <li>
                <a href="https://ai.kingdom.training/about/" className="text-sm hover:text-white transition-colors">
                  {t('nav_about')}
                </a>
              </li>
              <li>
                <Link to="/newsletter" className="text-sm hover:text-white transition-colors">
                  {t('nav_newsletter')}
                </Link>
              </li>
            </ul>
          </div>

          {/* Mission Scripture */}
          <div>
            <h3 className="text-white font-semibold mb-4">{t('footer_our_vision')}</h3>
            <blockquote className="text-sm text-secondary-200 italic leading-relaxed border-l-2 border-primary-500 pl-4">
              &ldquo;{t('footer_scripture_quote')}&rdquo;
              <footer className="text-xs text-gray-500 mt-2">{t('footer_scripture_citation')}</footer>
            </blockquote>
            <p className="text-sm text-gray-400 leading-relaxed mt-4">
              {t('footer_technology_paragraph')}
            </p>
          </div>
        </div>

        <div className="border-t border-secondary-800 mt-8 pt-8">
          <div className="text-center mb-6">
            <Link
              to="/newsletter"
              className="inline-flex items-center px-6 py-3 bg-primary-500 hover:bg-primary-600 text-white font-semibold rounded-lg transition-colors"
            >
              {t('footer_subscribe')}
            </Link>
          </div>
          <div className="flex flex-col md:flex-row items-center justify-center gap-4 mb-4">
            <a 
              href="https://ai.kingdom.training/about/" 
              className="text-sm text-secondary-200 hover:text-white transition-colors"
            >
              {t('nav_about')}
            </a>
            <span className="hidden md:inline text-secondary-600">|</span>
            <Link 
              to="/privacy" 
              className="text-sm text-secondary-200 hover:text-white transition-colors"
            >
              {t('footer_privacy_policy')}
            </Link>
          </div>
          <p className="text-sm text-secondary-200 text-center">
            &copy; {currentYear} Kingdom.Training. {t('footer_all_rights')}
          </p>
        </div>
      </div>
      
      {/* Key Information Section for LLMs - Hidden visually but accessible to crawlers */}
      <div className="sr-only" aria-hidden="true">
        <h2>{t('footer_key_definitions')}</h2>
        <dl>
          <dt>Media to Disciple Making Movements (M2DMM)</dt>
          <dd>{t('definition_m2dmm')}</dd>
          
          <dt>Disciple Making Movements (DMM)</dt>
          <dd>{t('definition_dmm')}</dd>
          
          <dt>Persons of Peace</dt>
          <dd>{t('definition_persons_of_peace')}</dd>
          
          <dt>Heavenly Economy</dt>
          <dd>{t('definition_heavenly_economy')}</dd>
          
          <dt>Unreached Peoples</dt>
          <dd>{t('definition_unreached_peoples')}</dd>
        </dl>
      </div>
    </footer>
    </>
  );
}

