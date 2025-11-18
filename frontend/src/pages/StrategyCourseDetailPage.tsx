import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { getStrategyCourseBySlug, WordPressPost } from '@/lib/wordpress';

export default function StrategyCourseDetailPage() {
  const { slug } = useParams<{ slug: string }>();
  const [course, setCourse] = useState<WordPressPost | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    async function fetchCourse() {
      if (!slug) {
        setError(true);
        setLoading(false);
        return;
      }

      try {
        const data = await getStrategyCourseBySlug(slug);
        if (data) {
          setCourse(data);
        } else {
          setError(true);
        }
      } catch (err) {
        console.error('Error fetching course:', err);
        setError(true);
      } finally {
        setLoading(false);
      }
    }
    fetchCourse();
  }, [slug]);

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

  if (error || !course) {
    return (
      <div className="container-custom py-16 text-center">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">Course Not Found</h1>
        <p className="text-gray-600 mb-8">The course you're looking for doesn't exist.</p>
        <Link to="/strategy-courses" className="text-primary-500 hover:text-primary-600 font-medium">
          ← Back to Strategy Courses
        </Link>
      </div>
    );
  }

  return (
    <article>
      {course.featured_image_url && (
        <div className="w-full h-96 bg-gray-200">
          <img
            src={course.featured_image_url}
            alt={course.title.rendered}
            className="w-full h-full object-cover"
          />
        </div>
      )}

      <div className="container-custom py-12">
        <div className="max-w-4xl mx-auto">
          <div className="mb-8">
            <div className="mb-4">
              <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-primary-100 text-primary-800">
                Strategy Course
              </span>
            </div>

            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
              {course.title.rendered}
            </h1>

            {course.author_info && (
              <div className="flex items-center space-x-3">
                {course.author_info.avatar && (
                  <img
                    src={course.author_info.avatar}
                    alt={course.author_info.name}
                    className="w-10 h-10 rounded-full"
                  />
                )}
                <div>
                  <p className="text-sm font-medium text-gray-900">
                    {course.author_info.name}
                  </p>
                </div>
              </div>
            )}
          </div>

          <div 
            className="prose prose-lg max-w-none prose-headings:text-gray-900 prose-headings:font-bold prose-h1:text-4xl prose-h2:text-3xl prose-h3:text-2xl prose-p:my-6 prose-strong:text-gray-900 prose-strong:font-bold prose-a:text-primary-500 prose-a:no-underline hover:prose-a:underline prose-ul:my-6 prose-ol:my-6 prose-li:my-2"
            dangerouslySetInnerHTML={{ __html: course.content.rendered }}
          />
        </div>
      </div>
    </article>
  );
}

