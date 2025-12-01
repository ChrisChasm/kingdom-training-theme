import { useEffect, useState } from 'react';
import { useParams, useLocation } from 'react-router-dom';
import Hero from '@/components/Hero';
import ContentCard from '@/components/ContentCard';
import NewsletterCTA from '@/components/NewsletterCTA';
import NeuralBackground from '@/components/NeuralBackground';
import SEO from '@/components/SEO';
import StructuredData from '@/components/StructuredData';
import KeyInfoSection from '@/components/KeyInfoSection';
import ArticleTitlesBackground from '@/components/ArticleTitlesBackground';
import { getArticles, getTools, getOrderedCourseSteps, WordPressPost, getDefaultLanguage } from '@/lib/wordpress';
import { useTranslation } from '@/hooks/useTranslation';
import { Link } from 'react-router-dom';
import { parseLanguageFromPath, buildLanguageUrl } from '@/lib/utils';

export default function HomePage() {
  const { lang } = useParams<{ lang?: string }>();
  const location = useLocation();
  const { t, tWithReplace } = useTranslation();
  const [articles, setArticles] = useState<WordPressPost[]>([]);
  const [backgroundArticles, setBackgroundArticles] = useState<WordPressPost[]>([]);
  const [tools, setTools] = useState<WordPressPost[]>([]);
  const [courseSteps, setCourseSteps] = useState<WordPressPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [defaultLang, setDefaultLang] = useState<string | null>(null);

  // Get current language from URL params or path
  const currentLang = lang || parseLanguageFromPath(location.pathname).lang || undefined;

  // Fetch default language
  useEffect(() => {
    getDefaultLanguage().then(setDefaultLang);
  }, []);

  useEffect(() => {
    async function fetchData() {
      try {
        // Determine target language: use provided lang, or defaultLang, or null for default
        const targetLang = currentLang || defaultLang || null;

        const [articlesData, backgroundArticlesData, toolsData, orderedSteps] = await Promise.all([
          getArticles({ per_page: 3, orderby: 'date', order: 'desc', lang: targetLang || undefined }).catch(() => []),
          getArticles({ per_page: 15, orderby: 'date', order: 'desc', lang: targetLang || undefined }).catch(() => []),
          getTools({ per_page: 3, orderby: 'date', order: 'desc', lang: targetLang || undefined }).catch(() => []),
          getOrderedCourseSteps(currentLang, defaultLang).catch(() => []),
        ]);

        // Filter articles and tools by language
        const filterByLanguage = <T extends { language?: string | null }>(items: T[]): T[] => {
          return items.filter(item => {
            if (targetLang === null) {
              // Default language: include posts with null/undefined language
              return item.language === null || item.language === undefined;
            } else {
              // Specific language: only include posts matching that language
              return item.language === targetLang;
            }
          });
        };

        setArticles(filterByLanguage(articlesData));
        setBackgroundArticles(filterByLanguage(backgroundArticlesData));
        setTools(filterByLanguage(toolsData));
        setCourseSteps(orderedSteps);
      } catch (error) {
        console.error('Error fetching homepage data:', error);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, [currentLang, defaultLang]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
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
        title="Home"
        description="Training disciple makers to use media to accelerate Disciple Making Movements. Learn practical strategies that bridge online engagement with face-to-face discipleship. Start your M2DMM strategy course today."
        keywords="disciple making movements, media to movements, M2DMM, digital discipleship, online evangelism, church planting, unreached peoples, kingdom training, strategy course, MVP course"
      />
      <StructuredData
        website={{
          name: 'Kingdom.Training',
          url: siteUrl,
          description: 'Training disciple makers to use media to accelerate Disciple Making Movements. Equipping practitioners with practical strategies that bridge online engagement with face-to-face discipleship.',
        }}
      />
      <Hero
        subtitle="Media, Advertising, and AI"
        title="Innovate → Accelerate → Make Disciples"
        description={t('hero_description')}
        ctaText="Start the MVP Course"
        ctaLink={buildLanguageUrl('/strategy-courses', currentLang || null, defaultLang)}
      />

      {/* Newsletter CTA Section */}
      <section className="relative py-12 bg-white overflow-hidden">
        <ArticleTitlesBackground articles={backgroundArticles} />
        <div className="relative z-10">
          <NewsletterCTA
            variant="banner"
            title="Get the newest insights, techniques, and strategies."
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
              Enroll in The MVP Course
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
                What is Digital Disciple Making?
              </h2>
              <div className="relative w-full" style={{ paddingBottom: '56.25%' }}>
                <iframe
                  src="https://player.vimeo.com/video/436776178?title=0&byline=0&portrait=0"
                  className="absolute top-0 left-0 w-full h-full rounded-lg shadow-2xl"
                  frameBorder="0"
                  allow="autoplay; fullscreen; picture-in-picture"
                  allowFullScreen
                  title="Kingdom Training Video"
                />
              </div>
            </div>

            <h2 className="text-3xl md:text-4xl font-bold mb-6">
              The Heavenly Economy
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
        title="Key Information About Media to Disciple Making Movements"
        items={[
          {
            term: 'What is Media to Disciple Making Movements (M2DMM)?',
            definition: 'Media to Disciple Making Movements (M2DMM) is a strategic approach that uses targeted media content to identify spiritual seekers online and connect them with face-to-face disciple-makers. The process involves three stages: (1) Media Content - targeted content reaches entire people groups through platforms like Facebook and Google Ads, (2) Digital Filtering - trained responders dialogue with seekers online, identifying persons of peace ready for face-to-face engagement, (3) Face-to-Face Discipleship - multipliers meet seekers in person, guiding them through discovery, obedience, and sharing in reproducing communities.',
          },
          {
            term: 'What is digital disciple making?',
            definition: 'Digital disciple making is the strategic use of all digital means—including social media, online advertising, AI tools, content creation, and digital communication platforms—to find seekers and bring them into relationship with Christ and his church in person. The ambition is to leverage every available digital tool and technique to identify spiritual seekers, engage them meaningfully online, and ultimately connect them with face-to-face discipleship communities where they can grow in their relationship with Jesus and participate in multiplying movements.',
          },
          {
            term: 'What is the MVP Strategy Course?',
            definition: 'The MVP (Minimum Viable Product) Strategy Course is a 10-step program that guides you through the core elements needed to craft a Media to Disciple Making Movements strategy for any context. The course helps you develop your complete M2DMM strategy and can be completed in 6-7 hours. It covers topics including media content creation, digital filtering strategies, face-to-face discipleship methods, and movement multiplication principles.',
          },
          {
            term: 'What is AI for discipleship?',
            definition: 'AI for discipleship empowers small teams to have a big impact by leveraging artificial intelligence tools and techniques. Kingdom.Training is bringing new techniques to accelerate small teams to use AI effectively in disciple making. These innovative approaches help teams scale their efforts, automate routine tasks, personalize engagement, and multiply their reach—enabling small groups to accomplish what previously required much larger teams.',
          },
          {
            term: 'What is the Heavenly Economy?',
            definition: 'The Heavenly Economy is a principle that challenges the broken world\'s teaching that "the more you get, the more you should keep." Instead, reflecting God\'s generous nature by offering free training, hands-on coaching, and open-source tools. This approach enables more people to access resources for disciple making, especially in unreached and least-reached areas.',
          },
          {
            term: 'Who is Kingdom.Training for?',
            definition: 'Kingdom.Training is for disciple makers, church planters, missionaries, and ministry leaders who want to use media strategically to accelerate Disciple Making Movements. We particularly focus on equipping those working with unreached and least-reached peoples - people groups where the name of Jesus has never been proclaimed or where there is no indigenous community of believers with adequate numbers and resources to evangelize their own people.',
          },
        ]}
      />
    </>
  );
}

