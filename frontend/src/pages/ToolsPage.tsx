import { useMemo } from 'react';
import { useSearchParams, useParams, useLocation } from 'react-router-dom';
import PageHeader from '@/components/PageHeader';
import ContentCard from '@/components/ContentCard';
import Sidebar from '@/components/Sidebar';
import LLMBackground from '@/components/LLMBackground';
import SEO from '@/components/SEO';
import { useDefaultLanguage } from '@/contexts/LanguageContext';
import { parseLanguageFromPath } from '@/lib/utils';
import { useTranslation } from '@/hooks/useTranslation';
import { useTools, useToolCategories, filterToolsByLanguage } from '@/hooks/useTools';
import { useTags } from '@/hooks/useTags';

export default function ToolsPage() {
  const { lang } = useParams<{ lang?: string }>();
  const location = useLocation();
  const { t } = useTranslation();
  const [searchParams] = useSearchParams();
  const defaultLang = useDefaultLanguage();

  // Get current language from URL params or path
  const currentLang = lang || parseLanguageFromPath(location.pathname).lang || undefined;
  const targetLang = currentLang || defaultLang || null;

  // Get filter params
  const categoryId = searchParams.get('category');
  const tagId = searchParams.get('tag');

  // Fetch data using React Query hooks
  const { data: toolsData = [], isLoading: toolsLoading } = useTools({
    per_page: 100,
    orderby: 'date',
    order: 'desc',
    tool_categories: categoryId || undefined,
    tags: tagId || undefined,
    lang: targetLang || undefined
  });

  const { data: categories = [], isLoading: categoriesLoading } = useToolCategories();
  const { data: tags = [], isLoading: tagsLoading } = useTags({ hide_empty: true, post_type: 'tools' });

  // Filter tools by language (memoized)
  const tools = useMemo(
    () => filterToolsByLanguage(toolsData, targetLang),
    [toolsData, targetLang]
  );

  const loading = toolsLoading || categoriesLoading || tagsLoading;

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

  return (
    <>
      <SEO
        title={t('page_tools')}
        description={t('seo_tools_description')}
        keywords="M2DMM tools, Disciple.Tools, disciple making tools, church planting tools, digital ministry tools, CRM for discipleship, open source tools, kingdom training tools, ministry resources"
        url="/tools"
      />
      <PageHeader
        title={t('page_tools')}
        description={t('seo_tools_description')}
        backgroundClass="bg-gradient-to-r from-secondary-900 to-secondary-700"
        backgroundComponent={<LLMBackground bottomOffset={-25} />}
      />

      <section className="py-16">
        <div className="container-custom">
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-12">
            {/* Sidebar */}
            <div className="lg:col-span-1">
              <Sidebar
                categories={categories}
                tags={tags}
                basePath={currentLang ? `/${currentLang}/tools` : '/tools'}
              />
            </div>

            {/* Main Content */}
            <div className="lg:col-span-3">
              {tools.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  {tools.map((tool) => (
                    <ContentCard key={tool.id} post={tool} type="tools" lang={currentLang || null} defaultLang={defaultLang} />
                  ))}
                </div>
              ) : (
                <div className="text-center py-16 bg-gray-50 rounded-lg">
                  <div className="text-6xl mb-4">🛠️</div>
                  <h3 className="text-2xl font-bold text-gray-900 mb-2">
                    {t('content_no_tools_found')}
                  </h3>
                  <p className="text-gray-600">
                    {t('content_no_tools_try')}
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>
    </>
  );
}

