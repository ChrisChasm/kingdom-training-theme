import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import PageHeader from '@/components/PageHeader';
import ContentCard from '@/components/ContentCard';
import { ChevronRight } from 'lucide-react';
import { getStrategyCourses, WordPressPost } from '@/lib/wordpress';

interface CourseStep {
  number: number;
  title: string;
  slug: string;
}

const courseSteps: CourseStep[] = [
  { number: 1, title: 'DMM Training Options', slug: 'dmm-training-options' },
  { number: 2, title: 'Create a Vision Statement for Your M2DMM', slug: 'create-a-vision-statement-for-your-m2dmm' },
  { number: 3, title: 'M2DMM Roles', slug: 'm2dmm-roles' },
  { number: 4, title: 'Create a Prayer Strategy', slug: 'create-a-prayer-strategy' },
  { number: 5, title: 'Create a Persona', slug: 'create-a-persona' },
  { number: 6, title: 'Identify Your Media Platform', slug: 'identify-your-media-platform' },
  { number: 7, title: 'Pick Your Name and Brand', slug: 'pick-your-name-and-brand' },
  { number: 8, title: 'Create Content', slug: 'create-content' },
  { number: 9, title: 'Create Ads', slug: 'create-ads' },
  { number: 10, title: 'Evaluate Your M2DMM Strategy', slug: 'evaluate-your-m2dmm-strategy' },
];

// Get slugs of main course steps for filtering
const mainStepSlugs = courseSteps.map(step => step.slug);

export default function StrategyCoursesPage() {
  const [additionalResources, setAdditionalResources] = useState<WordPressPost[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchAdditionalResources() {
      try {
        const allCourses = await getStrategyCourses({ 
          per_page: 100, 
          orderby: 'date', 
          order: 'desc' 
        });
        
        // Filter out the main 10 steps to get additional resources
        const additional = allCourses.filter(
          course => !mainStepSlugs.includes(course.slug)
        );
        
        setAdditionalResources(additional);
      } catch (error) {
        console.error('Error fetching additional resources:', error);
        setAdditionalResources([]);
      } finally {
        setLoading(false);
      }
    }
    fetchAdditionalResources();
  }, []);
  return (
    <>
      <PageHeader 
        title="Strategy Course"
        description="Comprehensive training to craft your Media to Disciple Making Movements strategy. Follow the 10-step program below to develop your complete M2DMM strategy."
        backgroundClass="bg-gradient-to-r from-secondary-900 to-secondary-700"
      />

      {/* Course Overview */}
      <section className="py-16 bg-white">
        <div className="container-custom">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
                The MVP: Strategy Development Course
              </h2>
              <p className="text-lg text-gray-700 leading-relaxed">
                Our flagship course guides you through 10 core elements needed to craft a Media to Disciple 
                Making Movements strategy for any context. Complete your plan step by step.
              </p>
            </div>

            {/* Course Steps */}
            <div className="space-y-4">
              {courseSteps.map((step, index) => (
                <div key={step.number} className="relative">
                  {/* Connecting Line */}
                  {index < courseSteps.length - 1 && (
                    <div className="absolute left-6 top-16 bottom-0 w-0.5 bg-gray-200 -mb-4"></div>
                  )}
                  
                  {/* Step Card */}
                  <Link
                    to={`/strategy-courses/${step.slug}`}
                    className="group relative flex items-start gap-6 p-6 bg-white border-2 border-gray-200 rounded-lg hover:border-primary-500 hover:shadow-lg transition-all duration-200"
                  >
                    {/* Step Number Circle */}
                    <div className="flex-shrink-0 w-12 h-12 rounded-full bg-primary-500 text-white flex items-center justify-center font-bold text-lg group-hover:bg-primary-600 transition-colors">
                      {step.number}
                    </div>
                    
                    {/* Step Content */}
                    <div className="flex-1 min-w-0">
                      <h3 className="text-xl font-semibold text-gray-900 group-hover:text-primary-600 transition-colors mb-1">
                        {step.title}
                      </h3>
                      <div className="flex items-center text-sm text-primary-500 font-medium mt-2">
                        <span>Start this step</span>
                        <ChevronRight className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" />
                      </div>
                    </div>
                    
                    {/* Arrow Icon */}
                    <div className="flex-shrink-0 text-gray-400 group-hover:text-primary-500 transition-colors">
                      <ChevronRight className="w-6 h-6" />
                    </div>
                  </Link>
                </div>
              ))}
            </div>

            {/* Progress Indicator */}
            <div className="mt-12 p-6 bg-background-50 rounded-lg border border-gray-200">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900">Your Progress</h3>
                <span className="text-sm text-gray-600">0 of 10 steps completed</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-3">
                <div 
                  className="bg-primary-500 h-3 rounded-full transition-all duration-300"
                  style={{ width: '0%' }}
                ></div>
              </div>
              <p className="text-sm text-gray-600 mt-3">
                Start with Step 1 to begin your M2DMM strategy development journey.
              </p>
            </div>

            {/* Call to Action */}
            <div className="mt-12 text-center">
              <Link
                to="/strategy-courses/dmm-training-options"
                className="inline-flex items-center justify-center px-8 py-4 bg-primary-500 hover:bg-primary-600 text-white font-semibold rounded-lg transition-colors duration-200 text-lg"
              >
                Start Step 1: DMM Training Options
                <ChevronRight className="w-5 h-5 ml-2" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Additional Resources Section */}
      {!loading && additionalResources.length > 0 && (
        <section className="py-16 bg-background-50">
          <div className="container-custom">
            <div className="max-w-7xl mx-auto">
              <div className="text-center mb-12">
                <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
                  Additional Course Resources
                </h2>
                <p className="text-lg text-gray-700 leading-relaxed max-w-3xl mx-auto">
                  Discover supplementary materials and resources to deepen your understanding and enhance your M2DMM strategy development.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {additionalResources.map((resource) => (
                  <ContentCard key={resource.id} post={resource} type="strategy-courses" />
                ))}
              </div>
            </div>
          </div>
        </section>
      )}
    </>
  );
}

