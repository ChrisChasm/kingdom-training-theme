import { useEffect, useState } from 'react';
import PageHeader from '@/components/PageHeader';
import ContentCard from '@/components/ContentCard';
import { getStrategyCourses, WordPressPost } from '@/lib/wordpress';

export default function StrategyCoursesPage() {
  const [courses, setCourses] = useState<WordPressPost[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchCourses() {
      try {
        const data = await getStrategyCourses({ 
          per_page: 100, 
          orderby: 'date', 
          order: 'desc' 
        });
        setCourses(data);
      } catch (error) {
        console.error('Error fetching courses:', error);
        setCourses([]);
      } finally {
        setLoading(false);
      }
    }
    fetchCourses();
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
      <PageHeader 
        title="Strategy Courses"
        description="Comprehensive training to craft your Media to Disciple Making Movements strategy. Start with The MVP course—our flagship 10-step program that guides you through developing an M2DMM strategy for any context."
        backgroundClass="bg-gradient-to-r from-primary-900 to-primary-700"
      />

      <section className="py-16">
        <div className="container-custom">
          {courses.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {courses.map((course) => (
                <ContentCard key={course.id} post={course} type="strategy-courses" />
              ))}
            </div>
          ) : (
            <div className="text-center py-16">
              <div className="text-6xl mb-4">📚</div>
              <h3 className="text-2xl font-bold text-gray-900 mb-2">
                No Courses Yet
              </h3>
              <p className="text-gray-600">
                Strategy courses will be published here soon. Check back later!
              </p>
            </div>
          )}
        </div>
      </section>
    </>
  );
}

