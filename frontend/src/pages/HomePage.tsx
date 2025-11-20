import { useEffect, useState } from 'react';
import Hero from '@/components/Hero';
import ContentCard from '@/components/ContentCard';
import NewsletterCTA from '@/components/NewsletterCTA';
import NeuralBackground from '@/components/NeuralBackground';
import { getArticles, getTools, getOrderedCourseSteps, WordPressPost } from '@/lib/wordpress';
import { Link } from 'react-router-dom';

export default function HomePage() {
  const [articles, setArticles] = useState<WordPressPost[]>([]);
  const [tools, setTools] = useState<WordPressPost[]>([]);
  const [courseSteps, setCourseSteps] = useState<WordPressPost[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      try {
        const [articlesData, toolsData, orderedSteps] = await Promise.all([
          getArticles({ per_page: 3, orderby: 'date', order: 'desc' }).catch(() => []),
          getTools({ per_page: 3, orderby: 'date', order: 'desc' }).catch(() => []),
          getOrderedCourseSteps().catch(() => []),
        ]);
        setArticles(articlesData);
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

  return (
    <>
      <Hero
        subtitle="Media, Advertising, and AI"
        title="Digital Disciple Making"
        description="Identify spiritual seekers online and connect them with face-to-face disciple-makers who help them discover, obey, and share all that Jesus taught."
        ctaText="Start the MVP Course"
        ctaLink="/strategy-courses"
      />

      {/* Value Proposition Section */}
      <section className="py-16 bg-white relative overflow-hidden">
        {/* Network pattern background - repeating pattern covering entire section, fades as it goes down */}
        <div 
          className="absolute inset-0 pointer-events-none z-0 opacity-100"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='400' height='300' xmlns='http://www.w3.org/2000/svg'%3E%3Cdefs%3E%3ClinearGradient id='netGrad' x1='0%25' y1='0%25' x2='0%25' y2='100%25'%3E%3Cstop offset='0%25' stop-color='%239ca3af' stop-opacity='0.35'/%3E%3Cstop offset='50%25' stop-color='%239ca3af' stop-opacity='0.22'/%3E%3Cstop offset='100%25' stop-color='%239ca3af' stop-opacity='0.08'/%3E%3C/linearGradient%3E%3ClinearGradient id='nodeGrad' x1='0%25' y1='0%25' x2='0%25' y2='100%25'%3E%3Cstop offset='0%25' stop-color='%239ca3af' stop-opacity='0.4'/%3E%3Cstop offset='50%25' stop-color='%239ca3af' stop-opacity='0.22'/%3E%3Cstop offset='100%25' stop-color='%239ca3af' stop-opacity='0.08'/%3E%3C/linearGradient%3E%3C/defs%3E%3Cg stroke='url(%23netGrad)' stroke-width='1.0' fill='none'%3E%3Cline x1='50' y1='50' x2='150' y2='40'/%3E%3Cline x1='150' y1='40' x2='250' y2='60'/%3E%3Cline x1='250' y1='60' x2='350' y2='50'/%3E%3Cline x1='50' y1='50' x2='100' y2='120'/%3E%3Cline x1='150' y1='40' x2='200' y2='110'/%3E%3Cline x1='250' y1='60' x2='300' y2='130'/%3E%3Cline x1='50' y1='50' x2='200' y2='110'/%3E%3Cline x1='150' y1='40' x2='300' y2='130'/%3E%3Cline x1='100' y1='120' x2='200' y2='110'/%3E%3Cline x1='200' y1='110' x2='300' y2='130'/%3E%3Cline x1='100' y1='120' x2='150' y2='180'/%3E%3Cline x1='200' y1='110' x2='250' y2='200'/%3E%3Cline x1='100' y1='120' x2='250' y2='200'/%3E%3Cline x1='150' y1='180' x2='250' y2='200'/%3E%3Cline x1='150' y1='180' x2='100' y2='240'/%3E%3Cline x1='250' y1='200' x2='200' y2='260'/%3E%3Cline x1='100' y1='240' x2='200' y2='260'/%3E%3Cline x1='200' y1='260' x2='300' y2='280'/%3E%3C/g%3E%3Cg fill='url(%23nodeGrad)'%3E%3Ccircle cx='50' cy='50' r='1.5'/%3E%3Ccircle cx='150' cy='40' r='1.5'/%3E%3Ccircle cx='250' cy='60' r='1.5'/%3E%3Ccircle cx='350' cy='50' r='1.5'/%3E%3Ccircle cx='100' cy='120' r='1.5'/%3E%3Ccircle cx='200' cy='110' r='1.5'/%3E%3Ccircle cx='300' cy='130' r='1.5'/%3E%3Ccircle cx='150' cy='180' r='1.2'/%3E%3Ccircle cx='250' cy='200' r='1.2'/%3E%3Ccircle cx='100' cy='240' r='1'/%3E%3Ccircle cx='200' cy='260' r='1'/%3E%3Ccircle cx='300' cy='280' r='0.8'/%3E%3C/g%3E%3C/svg%3E")`,
            backgroundRepeat: 'repeat',
            backgroundSize: '400px 300px',
            backgroundPosition: '0 0',
          }}
          aria-hidden="true"
        />
        {/* Gradient overlay to fade pattern as it goes down */}
        <div 
          className="absolute inset-0 pointer-events-none z-0"
          style={{
            background: 'linear-gradient(to bottom, transparent 0%, rgba(255,255,255,0.3) 50%, rgba(255,255,255,0.7) 80%, white 100%)',
          }}
          aria-hidden="true"
        />
        
        <div className="container-custom relative z-10">
          <div className="max-w-4xl mx-auto">
            <div className="bg-white/80 backdrop-blur-sm rounded-lg px-6 py-8 mb-8">
              <h2 className="text-3xl md:text-4xl font-bold text-gray-800 mb-6 text-center">
                How Media to Disciple Making Movements Works
              </h2>
              <p className="text-lg text-gray-700 leading-relaxed text-center">
                M2DMM functions like a funnel: introducing masses of people through targeted media content,
                filtering out disinterested individuals through digital conversations, and ultimately connecting
                genuine seekers with face-to-face disciplers who walk with them toward becoming multiplying disciples.
              </p>
            </div>
            <div className="grid md:grid-cols-3 gap-6 mt-12">
              <div className="text-center p-6 bg-background-50 rounded-lg">
                <div className="text-4xl font-bold text-primary-500 mb-2">1</div>
                <h3 className="font-semibold text-gray-800 mb-2">Media Content</h3>
                <p className="text-sm text-gray-600">
                  Targeted content reaches entire people groups through platforms like Facebook and Google Ads
                </p>
              </div>
              <div className="text-center p-6 bg-background-50 rounded-lg">
                <div className="text-4xl font-bold text-primary-500 mb-2">2</div>
                <h3 className="font-semibold text-gray-800 mb-2">Digital Filtering</h3>
                <p className="text-sm text-gray-600">
                  Trained responders dialogue with seekers online, identifying persons of peace ready for face-to-face engagement
                </p>
              </div>
              <div className="text-center p-6 bg-background-50 rounded-lg">
                <div className="text-4xl font-bold text-primary-500 mb-2">3</div>
                <h3 className="font-semibold text-gray-800 mb-2">Face-to-Face</h3>
                <p className="text-sm text-gray-600">
                  Multipliers meet seekers in person, guiding them through discovery, obedience, and sharing in reproducing communities
                </p>
              </div>
            </div>

            <div className="mt-16">
              <h2 className="text-3xl md:text-4xl font-bold text-gray-800 text-center mb-8">
                What is media to movement?
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
          </div>
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

      {/* Newsletter CTA Section */}
      <NewsletterCTA
        variant="banner"
        title="Stay Connected"
        description="Get the latest training resources, articles, and insights delivered directly to your inbox."
        showEmailInput={true}
        className="my-0"
      />

      {/* Mission/Foundation Section */}
      <section className="py-20 bg-primary-800 text-white">
        <div className="container-custom">
          <div className="max-w-4xl mx-auto text-center">
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
    </>
  );
}

