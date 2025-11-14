import { useEffect, useState } from 'react';
import Hero from '@/components/Hero';
import ContentCard from '@/components/ContentCard';
import { getArticles, getStrategyCourses, getTools, WordPressPost } from '@/lib/wordpress';
import { Link } from 'react-router-dom';

export default function HomePage() {
  const [articles, setArticles] = useState<WordPressPost[]>([]);
  const [courses, setCourses] = useState<WordPressPost[]>([]);
  const [tools, setTools] = useState<WordPressPost[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      try {
        const [articlesData, coursesData, toolsData] = await Promise.all([
          getArticles({ per_page: 3, orderby: 'date', order: 'desc' }).catch(() => []),
          getStrategyCourses({ per_page: 3, orderby: 'date', order: 'desc' }).catch(() => []),
          getTools({ per_page: 3, orderby: 'date', order: 'desc' }).catch(() => []),
        ]);
        setArticles(articlesData);
        setCourses(coursesData);
        setTools(toolsData);
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
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <Hero 
        subtitle="Training Disciple Makers"
        title="Media to Disciple Making Movements"
        description="Like the men of Issachar who understood the times, we equip disciple makers to use media strategically—identifying spiritual seekers online and connecting them with face-to-face disciplers who help them discover, obey, and share all that Jesus taught."
        ctaText="Start The MVP Course"
        ctaLink="/strategy-courses"
      />

      {/* Value Proposition Section */}
      <section className="py-16 bg-white">
        <div className="container-custom">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-800 mb-6 text-center">
              How Media to Disciple Making Movements Works
            </h2>
            <p className="text-lg text-gray-700 leading-relaxed mb-8 text-center">
              M2DMM functions like a funnel: introducing masses of people through targeted media content, 
              filtering out disinterested individuals through digital conversations, and ultimately connecting 
              genuine seekers with face-to-face disciplers who walk with them toward becoming multiplying disciples.
            </p>
            <div className="grid md:grid-cols-3 gap-6 mt-12">
              <div className="text-center p-6 bg-gray-50 rounded-lg">
                <div className="text-4xl font-bold text-primary-600 mb-2">1</div>
                <h3 className="font-semibold text-gray-800 mb-2">Media Content</h3>
                <p className="text-sm text-gray-600">
                  Targeted content reaches entire people groups through platforms like Facebook and Google Ads
                </p>
              </div>
              <div className="text-center p-6 bg-gray-50 rounded-lg">
                <div className="text-4xl font-bold text-primary-600 mb-2">2</div>
                <h3 className="font-semibold text-gray-800 mb-2">Digital Filtering</h3>
                <p className="text-sm text-gray-600">
                  Trained responders dialogue with seekers online, identifying persons of peace ready for face-to-face engagement
                </p>
              </div>
              <div className="text-center p-6 bg-gray-50 rounded-lg">
                <div className="text-4xl font-bold text-primary-600 mb-2">3</div>
                <h3 className="font-semibold text-gray-800 mb-2">Face-to-Face</h3>
                <p className="text-sm text-gray-600">
                  Multipliers meet seekers in person, guiding them through discovery, obedience, and sharing in reproducing communities
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* The MVP Course Feature - Primary Conversion */}
      <section className="py-20 bg-gradient-to-br from-primary-900 to-primary-700 text-white">
        <div className="container-custom">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-3xl md:text-5xl font-bold mb-4">
              The MVP: Strategy Development Course
            </h2>
            <p className="text-xl text-blue-100 mb-8 max-w-2xl mx-auto">
              Our flagship course guides you through 10 core elements needed to craft a Media to Disciple 
              Making Movements strategy for any context. Complete your plan in 6-7 hours.
            </p>
            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-8 mb-8 text-left">
              <h3 className="text-xl font-semibold mb-4 text-secondary-400">The 10-Step Curriculum:</h3>
              <div className="grid md:grid-cols-2 gap-4 text-sm">
                <div>1. Disciple Making Movements Training</div>
                <div>2. Vision</div>
                <div>3. Extraordinary Prayer</div>
                <div>4. Personas</div>
                <div>5. Critical Path</div>
                <div>6. Offline Strategy</div>
                <div>7. Media Platform Selection</div>
                <div>8. Name and Branding</div>
                <div>9. Content Creation</div>
                <div>10. Targeted Ads</div>
              </div>
            </div>
            <Link 
              to="/strategy-courses"
              className="inline-flex items-center justify-center px-8 py-4 bg-secondary-500 hover:bg-secondary-600 text-gray-900 font-semibold rounded-lg transition-colors duration-200 text-lg"
            >
              Enroll in The MVP Course
            </Link>
          </div>
        </div>
      </section>

      {/* Featured Strategy Courses */}
      <section className="py-16 bg-white">
        <div className="container-custom">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-3xl font-bold text-gray-800">Strategy Courses</h2>
            <Link 
              to="/strategy-courses" 
              className="text-primary-600 hover:text-primary-700 font-medium"
            >
              View all →
            </Link>
          </div>
          {courses.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {courses.map((course) => (
                <ContentCard key={course.id} post={course} type="strategy-courses" />
              ))}
            </div>
          ) : (
            <div className="text-center py-12 bg-gray-50 rounded-lg">
              <p className="text-gray-600 mb-4">Strategy courses will appear here once content is added to WordPress.</p>
              <Link 
                to="/strategy-courses"
                className="text-primary-600 hover:text-primary-700 font-medium"
              >
                Browse all courses →
              </Link>
            </div>
          )}
        </div>
      </section>

      {/* Featured Articles */}
      <section className="py-16 bg-gray-50">
        <div className="container-custom">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-3xl font-bold text-gray-800">Latest Articles</h2>
            <Link 
              to="/articles" 
              className="text-primary-600 hover:text-primary-700 font-medium"
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
                className="text-primary-600 hover:text-primary-700 font-medium"
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
              className="text-primary-600 hover:text-primary-700 font-medium"
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
            <div className="text-center py-12 bg-gray-50 rounded-lg">
              <p className="text-gray-600 mb-4">Tools will appear here once content is added to WordPress.</p>
              <Link 
                to="/tools"
                className="text-primary-600 hover:text-primary-700 font-medium"
              >
                Browse all tools →
              </Link>
            </div>
          )}
        </div>
      </section>

      {/* Mission/Foundation Section */}
      <section className="py-20 bg-gray-800 text-white">
        <div className="container-custom">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-3xl md:text-4xl font-bold mb-6">
              The Heavenly Economy
            </h2>
            <p className="text-lg text-gray-300 leading-relaxed mb-6">
              We operate within what we call the &ldquo;Heavenly Economy&rdquo;—a principle that challenges 
              the broken world&apos;s teaching that &ldquo;the more you get, the more you should keep.&rdquo; 
              Instead, we reflect God&apos;s generous nature by offering free training, hands-on coaching, 
              and open-source tools like Disciple.Tools.
            </p>
            <p className="text-lg text-gray-300 leading-relaxed mb-8">
              Our heart beats with passion for the unreached and least-reached peoples of the world. 
              Every course, article, and tool serves the ultimate vision of seeing Disciple Making Movements 
              catalyzed among people groups where the name of Jesus has never been proclaimed.
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <Link 
                to="/strategy-courses"
                className="inline-flex items-center justify-center px-8 py-4 bg-primary-600 hover:bg-primary-700 text-white font-semibold rounded-lg transition-colors duration-200"
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

