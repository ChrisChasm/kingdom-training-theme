import { useMemo } from 'react';
import { useParams, useLocation, Link } from 'react-router-dom';
import Hero from '@/components/Hero';
import ContentCard from '@/components/ContentCard';
import NewsletterCTA from '@/components/NewsletterCTA';
import NeuralBackground from '@/components/NeuralBackground';
import SEO from '@/components/SEO';
import StructuredData from '@/components/StructuredData';
import KeyInfoSection from '@/components/KeyInfoSection';
import ArticleTitlesBackground from '@/components/ArticleTitlesBackground';
import { useDefaultLanguage } from '@/contexts/LanguageContext';
import { useTranslation } from '@/hooks/useTranslation';
import { useArticles, filterArticlesByLanguage } from '@/hooks/useArticles';
import { useTools, filterToolsByLanguage } from '@/hooks/useTools';
import { useOrderedCourseSteps } from '@/hooks/useCourses';
import { parseLanguageFromPath, buildLanguageUrl } from '@/lib/utils';

export default function HomePage() {
  const { lang } = useParams<{ lang?: string }>();
  const location = useLocation();
  const { t, tWithReplace } = useTranslation();
  const defaultLang = useDefaultLanguage();

  // Get current language from URL params or path
  const currentLang = lang || parseLanguageFromPath(location.pathname).lang || undefined;
  const targetLang = currentLang || defaultLang || null;

  // Fetch data using React Query hooks
  const { data: articlesData = [], isLoading: articlesLoading } = useArticles({ 
    per_page: 3, 
    orderby: 'date', 
    order: 'desc', 
    lang: targetLang || undefined 
  });
  
  const { data: backgroundArticlesData = [], isLoading: backgroundLoading } = useArticles({ 
    per_page: 15, 
    orderby: 'date', 
    order: 'desc', 
    lang: targetLang || undefined 
  });
  
  const { data: toolsData = [], isLoading: toolsLoading } = useTools({ 
    per_page: 3, 
    orderby: 'date', 
    order: 'desc', 
    lang: targetLang || undefined 
  });
  
  const { data: courseSteps = [], isLoading: coursesLoading } = useOrderedCourseSteps(
    currentLang, 
    defaultLang
  );

  // Filter by language (memoized)
  const articles = useMemo(
    () => filterArticlesByLanguage(articlesData, targetLang),
    [articlesData, targetLang]
  );
  
  const backgroundArticles = useMemo(
    () => filterArticlesByLanguage(backgroundArticlesData, targetLang),
    [backgroundArticlesData, targetLang]
  );
  
  const tools = useMemo(
    () => filterToolsByLanguage(toolsData, targetLang),
    [toolsData, targetLang]
  );

  const loading = articlesLoading || backgroundLoading || toolsLoading || coursesLoading;

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500"></div>
          <p className="mt-4 text-gray-600">{t('ui_loading')}</p>
        </div>
      </div>
    );
  }

  const siteUrl = typeof window !== 'undefined' 
    ? window.location.origin 
    : 'https://ai.kingdom.training';

  return (
    <>
      <SEO
        title={t('page_home')}
        description={t('seo_home_description')}
        keywords="disciple making movements, media to movements, M2DMM, digital discipleship, online evangelism, church planting, unreached peoples, kingdom training, strategy course, MVP course"
      />
      <StructuredData
        website={{
          name: 'Kingdom.Training',
          url: siteUrl,
          description: t('footer_mission_statement'),
        }}
      />
      <Hero
        subtitle={t('hero_subtitle_media_ai')}
        title={t('hero_title_innovate')}
        description={t('hero_description')}
        ctaText={t('nav_start_mvp')}
        ctaLink={buildLanguageUrl('/strategy-courses', currentLang || null, defaultLang)}
      />

      {/* Newsletter CTA Section */}
      <section className="relative py-12 bg-white overflow-hidden">
        <ArticleTitlesBackground articles={backgroundArticles} />
        <div className="relative z-10">
          <NewsletterCTA
            variant="banner"
            title={t('hero_newsletter_title')}
            description={t('home_newsletter_description')}
            showEmailInput={false}
            className="my-0"
            whiteBackground={true}
            noWrapper={true}
          />
        </div>
      </section>

      {/* The MVP Course Feature - Primary Conversion */}
      <section className="relative py-20 bg-gradient-to-br from-secondary-900 to-secondary-700 text-white overflow-hidden">
        <NeuralBackground />
        <div className="container-custom relative z-10">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-3xl md:text-5xl font-bold mb-4">
              {t('page_mvp_strategy_course')}
            </h2>
            <p className="text-xl text-secondary-100 mb-8 max-w-2xl mx-auto">
              {t('home_mvp_description')}
            </p>
            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-8 mb-8 text-left">
              <h3 className="text-xl font-semibold mb-4 text-accent-500">
                {tWithReplace('page_step_curriculum', { count: courseSteps.length > 0 ? courseSteps.length : 10 })}
              </h3>
              {courseSteps.length > 0 ? (
                <div className="grid md:grid-cols-2 gap-4 text-sm">
                  {/* Left Column: First half of steps */}
                  <div className="flex flex-col gap-4">
                    {courseSteps.slice(0, Math.ceil(courseSteps.length / 2)).map((step, index) => (
                      <Link
                        key={step.id}
                        to={buildLanguageUrl(`/strategy-courses/${step.slug}`, currentLang || null, defaultLang)}
                        className="hover:text-accent-400 transition-colors"
                      >
                        {step.steps || index + 1}. {step.title.rendered}
                      </Link>
                    ))}
                  </div>
                  {/* Right Column: Second half of steps */}
                  <div className="flex flex-col gap-4">
                    {courseSteps.slice(Math.ceil(courseSteps.length / 2)).map((step, index) => {
                      const stepNumber = step.steps || Math.ceil(courseSteps.length / 2) + index + 1;
                      return (
                        <Link
                          key={step.id}
                          to={buildLanguageUrl(`/strategy-courses/${step.slug}`, currentLang || null, defaultLang)}
                          className="hover:text-accent-400 transition-colors"
                        >
                          {stepNumber}. {step.title.rendered}
                        </Link>
                      );
                    })}
                  </div>
                </div>
              ) : (
                <p className="text-secondary-200">{t('home_loading_steps')}</p>
              )}
            </div>
            <Link
              to={buildLanguageUrl('/strategy-courses', currentLang || null, defaultLang)}
              className="inline-flex items-center justify-center px-8 py-4 bg-accent-600 hover:bg-accent-500 text-secondary-900 font-semibold rounded-lg transition-colors duration-200 text-lg"
            >
              {t('nav_enroll_mvp')}
            </Link>
          </div>
        </div>
      </section>

      {/* Featured Articles */}
      <section className="py-16 bg-background-50">
        <div className="container-custom">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-3xl font-bold text-gray-800">{t('page_latest_articles')}</h2>
            <Link
              to={buildLanguageUrl('/articles', currentLang || null, defaultLang)}
              className="text-primary-500 hover:text-primary-600 font-medium"
            >
              {t('ui_view_all')} →
            </Link>
          </div>
          {articles.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {articles.map((article) => (
                <ContentCard key={article.id} post={article} type="articles" lang={currentLang || null} defaultLang={defaultLang} />
              ))}
            </div>
          ) : (
            <div className="text-center py-12 bg-white rounded-lg">
              <p className="text-gray-600 mb-4">{t('msg_no_articles')}</p>
              <Link
                to={buildLanguageUrl('/articles', currentLang || null, defaultLang)}
                className="text-primary-500 hover:text-primary-600 font-medium"
              >
                {t('ui_browse_all')} {t('nav_articles').toLowerCase()} →
              </Link>
            </div>
          )}
        </div>
      </section>

      {/* Featured Tools */}
      <section className="py-16 bg-white">
        <div className="container-custom">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-3xl font-bold text-gray-800">{t('page_featured_tools')}</h2>
            <Link
              to={buildLanguageUrl('/tools', currentLang || null, defaultLang)}
              className="text-primary-500 hover:text-primary-600 font-medium"
            >
              {t('ui_view_all')} →
            </Link>
          </div>
          {tools.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {tools.map((tool) => (
                <ContentCard key={tool.id} post={tool} type="tools" lang={currentLang || null} defaultLang={defaultLang} />
              ))}
            </div>
          ) : (
            <div className="text-center py-12 bg-background-50 rounded-lg">
              <p className="text-gray-600 mb-4">{t('msg_no_tools')}</p>
              <Link
                to={buildLanguageUrl('/tools', currentLang || null, defaultLang)}
                className="text-primary-500 hover:text-primary-600 font-medium"
              >
                {t('ui_browse_all')} {t('nav_tools').toLowerCase()} →
              </Link>
            </div>
          )}
        </div>
      </section>


      {/* Mission/Foundation Section */}
      <section className="py-20 bg-primary-800 text-white">
        <div className="container-custom">
          <div className="max-w-4xl mx-auto text-center">
            {/* Video Section */}
            <div className="mb-12">
              <h2 className="text-3xl md:text-4xl font-bold text-white text-center mb-8">
                {t('content_digital_disciple_making')}
              </h2>
              <div className="relative w-full" style={{ paddingBottom: '56.25%' }}>
                <iframe
                  src="https://player.vimeo.com/video/436776178?title=0&byline=0&portrait=0"
                  className="absolute top-0 left-0 w-full h-full rounded-lg shadow-2xl"
                  frameBorder="0"
                  allow="autoplay; fullscreen; picture-in-picture"
                  allowFullScreen
                  title={t('video_kingdom_training_title')}
                />
              </div>
            </div>

            <h2 className="text-3xl md:text-4xl font-bold mb-6">
              {t('content_heavenly_economy')}
            </h2>
            <p className="text-lg text-primary-100 leading-relaxed mb-6">
              {t('home_heavenly_economy')}
            </p>
            <p className="text-lg text-primary-100 leading-relaxed mb-8">
              {t('home_mission_statement')}
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <Link
                to={buildLanguageUrl('/strategy-courses', currentLang || null, defaultLang)}
                className="inline-flex items-center justify-center px-8 py-4 bg-accent-600 hover:bg-accent-500 text-secondary-900 font-semibold rounded-lg transition-colors duration-200"
              >
                {t('page_start_strategy_course')}
              </Link>
              <Link
                to={buildLanguageUrl('/articles', currentLang || null, defaultLang)}
                className="inline-flex items-center justify-center px-8 py-4 border-2 border-white/30 hover:border-white text-white font-semibold rounded-lg transition-colors duration-200"
              >
                {t('ui_read_articles')}
              </Link>
              <Link
                to={buildLanguageUrl('/tools', currentLang || null, defaultLang)}
                className="inline-flex items-center justify-center px-8 py-4 border-2 border-white/30 hover:border-white text-white font-semibold rounded-lg transition-colors duration-200"
              >
                {t('ui_explore_tools')}
              </Link>
            </div>
          </div>
        </div>
      </section>

     {/* Key Information Section for Answer Engine Optimization */}
      <KeyInfoSection
        title={t('content_key_information_m2dmm')}
        items={[
          {
            term: t('content_m2dmm_term'),
            definition: t('content_m2dmm_definition'),
          },
          {
            term: t('content_digital_disciple_making_term'),
            definition: t('content_digital_disciple_making_definition'),
          },
          {
            term: t('content_mvp_course_term'),
            definition: t('content_mvp_course_definition'),
          },
          {
            term: t('content_ai_discipleship_term'),
            definition: t('content_ai_discipleship_definition'),
          },
          {
            term: t('content_heavenly_economy_term'),
            definition: t('content_heavenly_economy_definition'),
          },
          {
            term: t('content_kingdom_training_for_term'),
            definition: t('content_kingdom_training_for_definition'),
          },
        ]}
      />
    </>
  );
}

