import { useEffect, useState, useRef } from 'react';
import { Link } from 'react-router-dom';
import PageHeader from '@/components/PageHeader';
import ContentCard from '@/components/ContentCard';
import ProgressIndicator from '@/components/ProgressIndicator';
import NeuralBackground from '@/components/NeuralBackground';
import { ChevronRight } from 'lucide-react';
import { getStrategyCourses, getOrderedCourseSteps, WordPressPost } from '@/lib/wordpress';

export interface CourseStep {
  number: number;
  title: string;
  slug: string;
}

export default function StrategyCoursesPage() {
  const [courseSteps, setCourseSteps] = useState<WordPressPost[]>([]);
  const [additionalResources, setAdditionalResources] = useState<WordPressPost[]>([]);
  const [loading, setLoading] = useState(true);
  const roadmapRef = useRef<HTMLDivElement>(null);
  const sectionRef = useRef<HTMLElement>(null);

  useEffect(() => {
    async function fetchCourses() {
      try {
        // Fetch ordered course steps from database
        const orderedSteps = await getOrderedCourseSteps();
        setCourseSteps(orderedSteps);
        
        // Fetch all courses to find additional resources
        const allCourses = await getStrategyCourses({ 
          per_page: 100, 
          orderby: 'date', 
          order: 'desc' 
        });
        
        // Get slugs of courses with steps to filter them out
        const stepSlugs = orderedSteps.map(step => step.slug);
        
        // Filter out courses with steps to get additional resources
        const additional = allCourses.filter(
          course => !stepSlugs.includes(course.slug)
        );
        
        setAdditionalResources(additional);
      } catch (error) {
        console.error('Error fetching courses:', error);
        setCourseSteps([]);
        setAdditionalResources([]);
      } finally {
        setLoading(false);
      }
    }
    fetchCourses();
  }, []);

  // Parallax effect for roadmap
  useEffect(() => {
    function handleScroll() {
      if (!roadmapRef.current || !sectionRef.current) return;
      
      const section = sectionRef.current;
      const scrollY = window.scrollY || window.pageYOffset;
      
      // Get section's position relative to document
      const sectionTop = section.offsetTop;
      
      // Calculate scroll progress through the section
      // When section is at top of viewport, progress is 0
      // As we scroll down, progress increases
      const scrollProgress = scrollY - sectionTop + window.innerHeight;
      
      // Parallax: background moves slower than scroll (0.15 = 15% speed)
      // Negative because we want it to move up slower as we scroll down
      const parallaxOffset = -scrollProgress * 0.15;
      
      roadmapRef.current.style.transform = `translateX(-50%) translateY(${parallaxOffset}px) scale(1.5)`;
    }

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll(); // Initial call
    
    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  return (
    <>
      <PageHeader 
        title="Strategy Course"
        description="Comprehensive training to craft your Media to Disciple Making Movements strategy. Follow the 10-step program below to develop your complete M2DMM strategy."
        backgroundClass="bg-gradient-to-r from-secondary-900 to-secondary-700"
        backgroundComponent={<NeuralBackground />}
      />

      {/* Course Overview */}
      <section ref={sectionRef} className="py-16 bg-white relative overflow-hidden">
        {/* Roadmap background graphic with parallax */}
        <div 
          ref={roadmapRef}
          className="absolute left-1/2 top-0 bottom-0 opacity-10 pointer-events-none z-0"
          style={{
            backgroundImage: 'url(/roadmap.svg)',
            backgroundRepeat: 'no-repeat',
            backgroundPosition: 'center center',
            backgroundSize: 'auto 100%',
            width: '80%',
            transform: 'translateX(-50%) scale(1.5)',
            transformOrigin: 'center center'
          }}
        />
        <div className="container-custom relative z-10">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
                The MVP: Strategy Course
              </h2>
              <p className="text-lg text-gray-700 leading-relaxed">
                Our flagship course guides you through 10 core elements needed to craft a Media to Disciple 
                Making Movements strategy for any context. Complete your plan step by step.
              </p>
            </div>

            {/* Course Steps */}
            {loading ? (
              <div className="text-center py-12">
                <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500"></div>
                <p className="mt-4 text-gray-600">Loading course steps...</p>
              </div>
            ) : courseSteps.length > 0 ? (
              <>
                <div className="space-y-4">
                  {courseSteps.map((step, index) => (
                    <div key={step.id} className="relative">
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
                          {step.steps || index + 1}
                        </div>
                        
                        {/* Step Content */}
                        <div className="flex-1 min-w-0">
                          <h3 className="text-xl font-semibold text-gray-900 group-hover:text-primary-600 transition-colors mb-1">
                            {step.title.rendered}
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
                <ProgressIndicator 
                  stepSlugs={courseSteps.map(step => step.slug)}
                  totalSteps={courseSteps.length}
                  className="mt-12"
                />

                {/* Call to Action */}
                {courseSteps.length > 0 && (
                  <div className="mt-12 text-center">
                    <Link
                      to={`/strategy-courses/${courseSteps[0].slug}`}
                      className="inline-flex items-center justify-center px-8 py-4 bg-primary-500 hover:bg-primary-600 text-white font-semibold rounded-lg transition-colors duration-200 text-lg"
                    >
                      Start Step {courseSteps[0].steps || 1}: {courseSteps[0].title.rendered}
                      <ChevronRight className="w-5 h-5 ml-2" />
                    </Link>
                  </div>
                )}
              </>
            ) : (
              <div className="text-center py-12 bg-background-50 rounded-lg">
                <p className="text-gray-600">No course steps found. Please add strategy courses with step numbers in WordPress admin.</p>
              </div>
            )}
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

