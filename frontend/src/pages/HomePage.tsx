import { useEffect, useState } from 'react';
import Hero from '@/components/Hero';
import ContentCard from '@/components/ContentCard';
import NewsletterCTA from '@/components/NewsletterCTA';
import NeuralBackground from '@/components/NeuralBackground';
import SEO from '@/components/SEO';
import StructuredData from '@/components/StructuredData';
import KeyInfoSection from '@/components/KeyInfoSection';
import ArticleTitlesBackground from '@/components/ArticleTitlesBackground';
import { getArticles, getTools, getOrderedCourseSteps, WordPressPost } from '@/lib/wordpress';
import { Link } from 'react-router-dom';

export default function HomePage() {
  const [articles, setArticles] = useState<WordPressPost[]>([]);
  const [backgroundArticles, setBackgroundArticles] = useState<WordPressPost[]>([]);
  const [tools, setTools] = useState<WordPressPost[]>([]);
  const [courseSteps, setCourseSteps] = useState<WordPressPost[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      try {
        const [articlesData, backgroundArticlesData, toolsData, orderedSteps] = await Promise.all([
          getArticles({ per_page: 3, orderby: 'date', order: 'desc' }).catch(() => []),
          getArticles({ per_page: 15, orderby: 'date', order: 'desc' }).catch(() => []),
          getTools({ per_page: 3, orderby: 'date', order: 'desc' }).catch(() => []),
          getOrderedCourseSteps().catch(() => []),
        ]);
        setArticles(articlesData);
        setBackgroundArticles(backgroundArticlesData);
        setTools(toolsData);
        setCourseSteps(orderedSteps);
      } catch (error) {
        console.error('Error fetching homepage data:', error);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

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
        description="Accelerate your disciple making with strategic use of media, advertising, and AI tools. Kingdom.Training is a resource for disciple makers to use media to accelerate Disciple Making Movements."
        ctaText="Start the MVP Course"
        ctaLink="/strategy-courses"
      />

      {/* Newsletter CTA Section */}
      <section className="relative py-12 bg-white overflow-hidden">
        <ArticleTitlesBackground articles={backgroundArticles} />
        <div className="relative z-10">
          <NewsletterCTA
            variant="banner"
            title="Get the newest insights, techniques, and strategies."
            description="Field driven tools and articles for disciple makers."
            showEmailInput={true}
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
              The MVP: Strategy Course
            </h2>
            <p className="text-xl text-secondary-100 mb-8 max-w-2xl mx-auto">
              Our flagship course guides you through 10 core elements needed to craft a Media to Disciple
              Making Movements strategy for any context. Complete your plan in 6-7 hours.
            </p>
            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-8 mb-8 text-left">
              <h3 className="text-xl font-semibold mb-4 text-accent-500">
                The {courseSteps.length > 0 ? courseSteps.length : '10'}-Step Curriculum:
              </h3>
              {courseSteps.length > 0 ? (
                <div className="grid md:grid-cols-2 gap-4 text-sm">
                  {/* Left Column: First half of steps */}
                  <div className="flex flex-col gap-4">
                    {courseSteps.slice(0, Math.ceil(courseSteps.length / 2)).map((step, index) => (
                      <Link
                        key={step.id}
                        to={`/strategy-courses/${step.slug}`}
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
                          to={`/strategy-courses/${step.slug}`}
                          className="hover:text-accent-400 transition-colors"
                        >
                          {stepNumber}. {step.title.rendered}
                        </Link>
                      );
                    })}
                  </div>
                </div>
              ) : (
                <p className="text-secondary-200">Loading course steps...</p>
              )}
            </div>
            <Link
              to="/strategy-courses"
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
            <h2 className="text-3xl font-bold text-gray-800">Latest Articles</h2>
            <Link
              to="/articles"
              className="text-primary-500 hover:text-primary-600 font-medium"
            >
              View all →
            </Link>
          </div>
          {articles.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {articles.map((article) => (
                <ContentCard key={article.id} post={article} type="articles" />
              ))}
            </div>
          ) : (
            <div className="text-center py-12 bg-white rounded-lg">
              <p className="text-gray-600 mb-4">Articles will appear here once content is added to WordPress.</p>
              <Link
                to="/articles"
                className="text-primary-500 hover:text-primary-600 font-medium"
              >
                Browse all articles →
              </Link>
            </div>
          )}
        </div>
      </section>

      {/* Featured Tools */}
      <section className="py-16 bg-white">
        <div className="container-custom">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-3xl font-bold text-gray-800">Featured Tools</h2>
            <Link
              to="/tools"
              className="text-primary-500 hover:text-primary-600 font-medium"
            >
              View all →
            </Link>
          </div>
          {tools.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {tools.map((tool) => (
                <ContentCard key={tool.id} post={tool} type="tools" />
              ))}
            </div>
          ) : (
            <div className="text-center py-12 bg-background-50 rounded-lg">
              <p className="text-gray-600 mb-4">Tools will appear here once content is added to WordPress.</p>
              <Link
                to="/tools"
                className="text-primary-500 hover:text-primary-600 font-medium"
              >
                Browse all tools →
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
              We operate within what we call the &ldquo;Heavenly Economy&rdquo;—a principle that challenges
              the broken world&apos;s teaching that &ldquo;the more you get, the more you should keep.&rdquo;
              Instead, we reflect God&apos;s generous nature by offering free training, hands-on coaching,
              and open-source tools like Disciple.Tools.
            </p>
            <p className="text-lg text-primary-100 leading-relaxed mb-8">
              Our heart beats with passion for the unreached and least-reached peoples of the world.
              Every course, article, and tool serves the ultimate vision of seeing Disciple Making Movements
              catalyzed among people groups where the name of Jesus has never been proclaimed.
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <Link
                to="/strategy-courses"
                className="inline-flex items-center justify-center px-8 py-4 bg-accent-600 hover:bg-accent-500 text-secondary-900 font-semibold rounded-lg transition-colors duration-200"
              >
                Start Your Strategy Course
              </Link>
              <Link
                to="/articles"
                className="inline-flex items-center justify-center px-8 py-4 border-2 border-white/30 hover:border-white text-white font-semibold rounded-lg transition-colors duration-200"
              >
                Read Articles
              </Link>
              <Link
                to="/tools"
                className="inline-flex items-center justify-center px-8 py-4 border-2 border-white/30 hover:border-white text-white font-semibold rounded-lg transition-colors duration-200"
              >
                Explore Tools
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

