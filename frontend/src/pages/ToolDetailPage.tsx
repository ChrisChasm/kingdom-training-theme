import { useMemo } from 'react';
import { useParams, Link, useLocation } from 'react-router-dom';
import { useDefaultLanguage } from '@/contexts/LanguageContext';
import { useTranslation } from '@/hooks/useTranslation';
import { useTool, useTools, filterToolsByLanguage } from '@/hooks/useTools';
import ContentCard from '@/components/ContentCard';
import SEO from '@/components/SEO';
import StructuredData from '@/components/StructuredData';
import AdminEditLink from '@/components/AdminEditLink';
import FeaturedImage from '@/components/FeaturedImage';
import { stripHtml, parseLanguageFromPath } from '@/lib/utils';

export default function ToolDetailPage() {
  const { slug, lang } = useParams<{ slug: string; lang?: string }>();
  const location = useLocation();
  const { t } = useTranslation();
  const defaultLang = useDefaultLanguage();

  // Get current language from URL params or path
  const currentLang = lang || parseLanguageFromPath(location.pathname).lang || undefined;
  const targetLang = currentLang || defaultLang || null;

  // Fetch tool using React Query
  const { data: tool, isLoading: toolLoading, isError } = useTool(slug, currentLang);

  // Fetch additional tools
  const { data: toolsData = [], isLoading: additionalLoading } = useTools({
    per_page: 10,
    orderby: 'date',
    order: 'desc',
    lang: targetLang || undefined
  });

  // Filter additional tools (memoized)
  const additionalTools = useMemo(() => {
    if (!tool) return [];
    return filterToolsByLanguage(toolsData, targetLang)
      .filter(t => t.id !== tool.id)
      .slice(0, 9);
  }, [toolsData, tool, targetLang]);

  const loading = toolLoading || additionalLoading;

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

  if (isError || !tool) {
    return (
      <div className="container-custom py-16 text-center">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">{t('error_tool_not_found')}</h1>
        <p className="text-gray-600 mb-8">{t('error_tool_not_found_desc')}</p>
        <Link to={currentLang ? `/${currentLang}/tools` : '/tools'} className="text-primary-500 hover:text-primary-600 font-medium">
          ← {t('ui_back_to')} {t('nav_tools')}
        </Link>
      </div>
    );
  }

  const toolTitle = tool.title.rendered;
  const toolDescription = tool.excerpt?.rendered 
    ? stripHtml(tool.excerpt.rendered) 
    : stripHtml(tool.content.rendered).substring(0, 160);
  const toolKeywords = `M2DMM tools, ${toolTitle}, disciple making tools, ministry resources, ${toolTitle.toLowerCase()}`;
  
  const siteUrl = typeof window !== 'undefined' 
    ? window.location.origin 
    : 'https://ai.kingdom.training';
  const toolUrl = `${siteUrl}/tools/${tool.slug}`;
  const logoUrl = `${siteUrl}/wp-content/themes/kingdom-training-theme/dist/kt-logo-header.webp`;

  return (
    <article>
      <SEO
        title={toolTitle}
        description={toolDescription}
        keywords={toolKeywords}
        image={tool.featured_image_url}
        url={`/tools/${tool.slug}`}
        type="article"
        author={tool.author_info?.name}
        publishedTime={tool.date}
        modifiedTime={tool.modified}
      />
      <StructuredData
        article={{
          headline: toolTitle,
          description: toolDescription,
          image: tool.featured_image_url || logoUrl,
          datePublished: tool.date,
          dateModified: tool.modified,
          author: {
            name: tool.author_info?.name || 'Kingdom.Training',
          },
          publisher: {
            name: 'Kingdom.Training',
            logo: logoUrl,
          },
          mainEntityOfPage: toolUrl,
        }}
        breadcrumbs={{
          items: [
            { name: 'Home', url: siteUrl },
            { name: 'Tools', url: `${siteUrl}/tools` },
            { name: toolTitle, url: toolUrl },
          ],
        }}
      />
      {tool.featured_image_url && (
        <FeaturedImage
          src={tool.featured_image_url}
          alt={tool.title.rendered}
          imageSizes={tool.featured_image_sizes}
        />
      )}

      <div className="container-custom py-12 bg-white">
        <div className="max-w-4xl mx-auto relative">
          <AdminEditLink postId={tool.id} />
          <div className="mb-8">
            <div className="flex items-center text-sm text-gray-600 mb-4">
              <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-secondary-100 text-secondary-800">
                {t('course_tool')}
              </span>
            </div>

            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
              {tool.title.rendered}
            </h1>
          </div>

          <div 
            className="prose prose-lg max-w-none prose-headings:text-gray-900 prose-headings:font-bold prose-h1:text-4xl prose-h2:text-3xl prose-h3:text-2xl prose-p:my-6 prose-strong:text-gray-900 prose-strong:font-bold prose-a:text-primary-500 prose-a:no-underline hover:prose-a:underline prose-ul:my-6 prose-ol:my-6 prose-li:my-2"
            dangerouslySetInnerHTML={{ __html: tool.content.rendered }}
          />
        </div>
      </div>

      {/* Additional Resources Section */}
      {additionalTools.length > 0 && (
        <section className="py-16 bg-background-50 border-t border-gray-200">
          <div className="container-custom">
            <div className="max-w-7xl mx-auto">
              <div className="text-center mb-12">
                <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
                  {t('content_additional_tool_resources')}
                </h2>
                <p className="text-lg text-gray-700 leading-relaxed max-w-3xl mx-auto">
                  {t('msg_discover_supplementary')}
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {additionalTools.map((tool) => (
                  <ContentCard key={tool.id} post={tool} type="tools" lang={currentLang || null} defaultLang={defaultLang} />
                ))}
              </div>
            </div>
          </div>
        </section>
      )}
    </article>
  );
}

