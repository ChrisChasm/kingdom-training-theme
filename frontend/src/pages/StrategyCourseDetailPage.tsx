import { useEffect, useMemo } from 'react';
import { useParams, Link, useLocation } from 'react-router-dom';
import { useDefaultLanguage } from '@/contexts/LanguageContext';
import { markStepCompleted, stripHtml, parseLanguageFromPath, buildLanguageUrl, processImageWidths } from '@/lib/utils';
import { useCourse, useCourses, useOrderedCourseSteps, getAdditionalResources } from '@/hooks/useCourses';
import ProgressIndicator from '@/components/ProgressIndicator';
import ContentCard from '@/components/ContentCard';
import SEO from '@/components/SEO';
import StructuredData from '@/components/StructuredData';
import AdminEditLink from '@/components/AdminEditLink';
import FeaturedImage from '@/components/FeaturedImage';
import { ChevronRight, ChevronLeft } from 'lucide-react';
import { useTranslation } from '@/hooks/useTranslation';

export default function StrategyCourseDetailPage() {
  const { slug, lang } = useParams<{ slug: string; lang?: string }>();
  const location = useLocation();
  const { t, tWithReplace } = useTranslation();
  const defaultLang = useDefaultLanguage();

  // Get current language from URL params or path
  const currentLang = lang || parseLanguageFromPath(location.pathname).lang || undefined;
  const targetLang = currentLang || defaultLang || null;

  // Scroll to top when navigating to a new course page
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [slug]);

  // Fetch course using React Query
  const { data: course, isLoading: courseLoading, isError } = useCourse(slug, currentLang);

  // Fetch ordered course steps
  const { data: courseSteps = [], isLoading: stepsLoading } = useOrderedCourseSteps(
    currentLang, 
    defaultLang
  );

  // Fetch all courses for additional resources
  const { data: allCourses = [], isLoading: coursesLoading } = useCourses({
    per_page: 100,
    orderby: 'date',
    order: 'desc',
    lang: currentLang
  });

  // Calculate additional resources (memoized)
  const additionalResources = useMemo(
    () => getAdditionalResources(allCourses, courseSteps, slug, targetLang, 9),
    [allCourses, courseSteps, slug, targetLang]
  );

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

  // Mark step as completed when course loads
  useEffect(() => {
    if (course && course.steps !== null && course.steps !== undefined && course.steps >= 1 && course.steps <= 20) {
      markStepCompleted(course.slug);
    }
  }, [course]);

  // Process content to respect image width attributes
  // NOTE: This must be before early returns to maintain consistent hook order
  const processedContent = useMemo(() => {
    if (!course?.content?.rendered) return '';
    return processImageWidths(course.content.rendered);
  }, [course?.content?.rendered]);

  const loading = courseLoading || stepsLoading || coursesLoading;

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

  if (isError || !course) {
    return (
      <div className="container-custom py-16 text-center">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">{t('error_course_not_found')}</h1>
        <p className="text-gray-600 mb-8">{t('error_course_not_found_desc')}</p>
        <Link to={buildLanguageUrl('/strategy-courses', currentLang || null, defaultLang)} className="text-primary-500 hover:text-primary-600 font-medium">
          {t('nav_back_to_strategy_courses')}
        </Link>
      </div>
    );
  }

  const courseTitle = course.steps && course.steps >= 1 && course.steps <= 20
    ? `${course.steps}. ${course.title.rendered}`
    : course.title.rendered;
  const courseDescription = course.excerpt?.rendered 
    ? stripHtml(course.excerpt.rendered) 
    : stripHtml(course.content.rendered).substring(0, 160);
  const courseKeywords = `M2DMM strategy course, ${courseTitle}, MVP course step ${course.steps || ''}, media to movements, disciple making strategy, ${courseTitle.toLowerCase()}`;
  
  const siteUrl = typeof window !== 'undefined' 
    ? window.location.origin 
    : 'https://ai.kingdom.training';
  const courseUrl = `${siteUrl}/strategy-courses/${course.slug}`;
  const logoUrl = `${siteUrl}/wp-content/themes/kingdom-training-theme/dist/kt-logo-header.webp`;

  return (
    <article>
      <SEO
        title={courseTitle}
        description={courseDescription}
        keywords={courseKeywords}
        image={course.featured_image_url}
        url={`/strategy-courses/${course.slug}`}
        type="article"
        author={course.author_info?.name}
        publishedTime={course.date}
        modifiedTime={course.modified}
      />
      <StructuredData
        course={{
          name: courseTitle,
          description: courseDescription,
          provider: {
            name: 'Kingdom.Training',
            url: siteUrl,
          },
          courseCode: course.steps ? `MVP-STEP-${course.steps}` : undefined,
          educationalLevel: 'Professional Development',
          teaches: [
            'Media to Disciple Making Movements',
            'Digital Evangelism',
            'Online Ministry Strategy',
            'Disciple Making Movements',
          ],
          image: course.featured_image_url || logoUrl,
        }}
        breadcrumbs={{
          items: [
            { name: t('breadcrumb_home'), url: siteUrl },
            { name: t('nav_strategy_courses'), url: `${siteUrl}/strategy-courses` },
            { name: courseTitle, url: courseUrl },
          ],
        }}
      />
      {course.featured_image_url && (
        <FeaturedImage
          src={course.featured_image_url}
          alt={course.title.rendered}
          imageSizes={course.featured_image_sizes}
        />
      )}

      <div className="container-custom py-12 bg-white">
        <div className="max-w-4xl mx-auto relative">
          <AdminEditLink postId={course.id} />
          <div className="mb-8">
            <div className="mb-4">
              <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-primary-100 text-primary-800">
                {t('course_strategy_course')}
              </span>
            </div>

            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
              {course.steps && course.steps >= 1 && course.steps <= 20
                ? `${course.steps}. ${course.title.rendered}`
                : course.title.rendered}
            </h1>
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
            dangerouslySetInnerHTML={{ __html: processedContent }}
          />

          {/* Navigation Buttons - Only show if this course is part of the ordered steps */}
          {currentStep && (
            <div className="mt-12 pt-8 border-t border-gray-200">
              <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
                {/* Previous Button */}
                {previousStep ? (
                  <Link
                    to={buildLanguageUrl(`/strategy-courses/${previousStep.slug}`, currentLang || null, defaultLang)}
                    className="inline-flex items-center px-6 py-3 bg-white border-2 border-gray-300 text-gray-700 font-semibold rounded-lg hover:border-primary-500 hover:text-primary-600 transition-all duration-200"
                  >
                    <ChevronLeft className="w-5 h-5 mr-2" />
                    <div className="text-left">
                      <div className="text-xs text-gray-500 uppercase tracking-wide">{t('nav_previous')}</div>
                      <div className="text-sm font-semibold">{tWithReplace('nav_step', { number: previousStep.steps || courseSteps.indexOf(previousStep) + 1 })}</div>
                    </div>
                  </Link>
                ) : (
                  <div></div>
                )}

                {/* Next Button */}
                {nextStep ? (
                  <Link
                    to={buildLanguageUrl(`/strategy-courses/${nextStep.slug}`, currentLang || null, defaultLang)}
                    className="inline-flex items-center px-6 py-3 bg-primary-500 hover:bg-primary-600 text-white font-semibold rounded-lg transition-colors duration-200"
                  >
                    <div className="text-right mr-2">
                      <div className="text-xs text-white/80 uppercase tracking-wide">{t('nav_next')}</div>
                      <div className="text-sm font-semibold">{tWithReplace('nav_step', { number: nextStep.steps || courseSteps.indexOf(nextStep) + 1 })}</div>
                    </div>
                    <ChevronRight className="w-5 h-5" />
                  </Link>
                ) : (
                  <Link
                    to={buildLanguageUrl('/strategy-courses', currentLang || null, defaultLang)}
                    className="inline-flex items-center px-6 py-3 bg-primary-500 hover:bg-primary-600 text-white font-semibold rounded-lg transition-colors duration-200"
                  >
                    <span>{t('nav_back_to_course_overview')}</span>
                    <ChevronRight className="w-5 h-5 ml-2" />
                  </Link>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Additional Course Resources Section */}
      {additionalResources.length > 0 && (
        <section className="py-16 bg-background-50 border-t border-gray-200">
          <div className="container-custom">
            <div className="max-w-7xl mx-auto">
              <div className="text-center mb-12">
                <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
                  {t('content_additional_resources')}
                </h2>
                <p className="text-lg text-gray-700 leading-relaxed max-w-3xl mx-auto">
                  {t('content_supplementary_materials')}
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {additionalResources.map((resource) => (
                  <ContentCard key={resource.id} post={resource} type="strategy-courses" lang={currentLang || null} defaultLang={defaultLang} />
                ))}
              </div>
            </div>
          </div>
        </section>
      )}
    </article>
  );
}

