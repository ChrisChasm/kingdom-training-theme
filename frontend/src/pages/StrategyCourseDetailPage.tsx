import { useEffect, useState, useMemo } from 'react';
import { useParams, Link } from 'react-router-dom';
import { getStrategyCourseBySlug, getOrderedCourseSteps, WordPressPost } from '@/lib/wordpress';
import { markStepCompleted } from '@/lib/utils';
import ProgressIndicator from '@/components/ProgressIndicator';
import { ChevronRight, ChevronLeft } from 'lucide-react';

export default function StrategyCourseDetailPage() {
  const { slug } = useParams<{ slug: string }>();
  const [course, setCourse] = useState<WordPressPost | null>(null);
  const [courseSteps, setCourseSteps] = useState<WordPressPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  // Scroll to top when navigating to a new course page
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [slug]);

  // Fetch ordered course steps from database
  useEffect(() => {
    async function fetchCourseSteps() {
      try {
        const steps = await getOrderedCourseSteps();
        setCourseSteps(steps);
      } catch (err) {
        console.error('Error fetching course steps:', err);
        setCourseSteps([]);
      }
    }
    fetchCourseSteps();
  }, []);

  // Find current step and navigation steps
  const { currentStep, nextStep, previousStep } = useMemo(() => {
    if (!slug || courseSteps.length === 0) {
      return { currentStep: null, nextStep: null, previousStep: null };
    }

    const currentIndex = courseSteps.findIndex(step => step.slug === slug);
    
    if (currentIndex === -1) {
      return { currentStep: null, nextStep: null, previousStep: null };
    }

    return {
      currentStep: courseSteps[currentIndex],
      nextStep: currentIndex < courseSteps.length - 1 ? courseSteps[currentIndex + 1] : null,
      previousStep: currentIndex > 0 ? courseSteps[currentIndex - 1] : null,
    };
  }, [slug, courseSteps]);

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
          
          // Mark this step as completed when the page is visited
          // Check if this course has a steps meta field (is part of the ordered course)
          if (data.steps !== null && data.steps !== undefined && data.steps >= 1 && data.steps <= 20) {
            markStepCompleted(slug);
          }
        } else {
          setError(true);
        }
      } catch (err) {
        console.error('Error fetching course:', err);
        setError(true);
      } finally {
        setLoading(false);
        // Scroll to top after course loads
        window.scrollTo({ top: 0, behavior: 'smooth' });
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
              {course.steps && course.steps >= 1 && course.steps <= 20
                ? `${course.steps}. ${course.title.rendered}`
                : course.title.rendered}
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

          {/* Progress Indicator - Only show if this course is part of the ordered steps */}
          {courseSteps.length > 0 && courseSteps.some(step => step.slug === slug) && (
            <ProgressIndicator 
              stepSlugs={courseSteps.map(step => step.slug)}
              totalSteps={courseSteps.length}
              className="mb-8"
            />
          )}

          <div 
            className="prose prose-lg max-w-none prose-headings:text-gray-900 prose-headings:font-bold prose-h1:text-4xl prose-h2:text-3xl prose-h3:text-2xl prose-p:my-6 prose-strong:text-gray-900 prose-strong:font-bold prose-a:text-primary-500 prose-a:no-underline hover:prose-a:underline prose-ul:my-6 prose-ol:my-6 prose-li:my-2"
            dangerouslySetInnerHTML={{ __html: course.content.rendered }}
          />

          {/* Navigation Buttons - Only show if this course is part of the ordered steps */}
          {currentStep && (
            <div className="mt-12 pt-8 border-t border-gray-200">
              <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
                {/* Previous Button */}
                {previousStep ? (
                  <Link
                    to={`/strategy-courses/${previousStep.slug}`}
                    className="inline-flex items-center px-6 py-3 bg-white border-2 border-gray-300 text-gray-700 font-semibold rounded-lg hover:border-primary-500 hover:text-primary-600 transition-all duration-200"
                  >
                    <ChevronLeft className="w-5 h-5 mr-2" />
                    <div className="text-left">
                      <div className="text-xs text-gray-500 uppercase tracking-wide">Previous</div>
                      <div className="text-sm font-semibold">Step {previousStep.steps || courseSteps.indexOf(previousStep) + 1}</div>
                    </div>
                  </Link>
                ) : (
                  <div></div>
                )}

                {/* Next Button */}
                {nextStep ? (
                  <Link
                    to={`/strategy-courses/${nextStep.slug}`}
                    className="inline-flex items-center px-6 py-3 bg-primary-500 hover:bg-primary-600 text-white font-semibold rounded-lg transition-colors duration-200"
                  >
                    <div className="text-right mr-2">
                      <div className="text-xs text-white/80 uppercase tracking-wide">Next</div>
                      <div className="text-sm font-semibold">Step {nextStep.steps || courseSteps.indexOf(nextStep) + 1}</div>
                    </div>
                    <ChevronRight className="w-5 h-5" />
                  </Link>
                ) : (
                  <Link
                    to="/strategy-courses"
                    className="inline-flex items-center px-6 py-3 bg-primary-500 hover:bg-primary-600 text-white font-semibold rounded-lg transition-colors duration-200"
                  >
                    <span>Back to Course Overview</span>
                    <ChevronRight className="w-5 h-5 ml-2" />
                  </Link>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </article>
  );
}

