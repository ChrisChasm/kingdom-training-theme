import { useMemo } from 'react';
import { useParams, Link, useLocation } from 'react-router-dom';
import { useDefaultLanguage } from '@/contexts/LanguageContext';
import { useTranslation } from '@/hooks/useTranslation';
import { useArticle, useArticles, filterArticlesByLanguage } from '@/hooks/useArticles';
import ContentCard from '@/components/ContentCard';
import SEO from '@/components/SEO';
import StructuredData from '@/components/StructuredData';
import AdminEditLink from '@/components/AdminEditLink';
import FeaturedImage from '@/components/FeaturedImage';
import { stripHtml, parseLanguageFromPath, processImageWidths } from '@/lib/utils';

export default function ArticleDetailPage() {
  const { slug, lang } = useParams<{ slug: string; lang?: string }>();
  const location = useLocation();
  const { t } = useTranslation();
  const defaultLang = useDefaultLanguage();

  // Get current language from URL params or path
  const currentLang = lang || parseLanguageFromPath(location.pathname).lang || undefined;
  const targetLang = currentLang || defaultLang || null;

  // Fetch article using React Query
  const { data: article, isLoading: articleLoading, isError } = useArticle(slug, currentLang);

  // Fetch related articles
  const { data: articlesData = [], isLoading: relatedLoading } = useArticles({
    per_page: 10,
    orderby: 'date',
    order: 'desc',
    lang: targetLang || undefined
  });

  // Filter related articles (memoized)
  const relatedArticles = useMemo(() => {
    if (!article) return [];
    return filterArticlesByLanguage(articlesData, targetLang)
      .filter(a => a.id !== article.id)
      .slice(0, 9);
  }, [articlesData, article, targetLang]);

  const loading = articleLoading || relatedLoading;

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

  if (isError || !article) {
    return (
      <div className="container-custom py-16 text-center">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">{t('error_article_not_found')}</h1>
        <p className="text-gray-600 mb-8">{t('error_article_not_found_desc')}</p>
        <Link to={currentLang ? `/${currentLang}/articles` : '/articles'} className="text-primary-500 hover:text-primary-600 font-medium">
          ← {t('ui_back_to')} {t('nav_articles')}
        </Link>
      </div>
    );
  }

  const articleTitle = article.title.rendered;
  const articleDescription = article.excerpt?.rendered 
    ? stripHtml(article.excerpt.rendered) 
    : stripHtml(article.content.rendered).substring(0, 160);
  const articleKeywords = `M2DMM, ${articleTitle}, disciple making movements, media strategy, ${articleTitle.toLowerCase()}`;
  
  // Process content to add dimensions to images and prevent layout shift
  const processedContent = useMemo(() => processImageWidths(article.content.rendered), [article.content.rendered]);
  
  const siteUrl = typeof window !== 'undefined' 
    ? window.location.origin 
    : 'https://ai.kingdom.training';
  const articleUrl = `${siteUrl}/articles/${article.slug}`;
  const logoUrl = `${siteUrl}/wp-content/themes/kingdom-training-theme/dist/kt-logo-header.webp`;

  return (
    <article>
      <SEO
        title={articleTitle}
        description={articleDescription}
        keywords={articleKeywords}
        image={article.featured_image_url}
        url={`/articles/${article.slug}`}
        type="article"
        author={article.author_info?.name}
        publishedTime={article.date}
        modifiedTime={article.modified}
      />
      <StructuredData
        article={{
          headline: articleTitle,
          description: articleDescription,
          image: article.featured_image_url || logoUrl,
          datePublished: article.date,
          dateModified: article.modified,
          author: {
            name: article.author_info?.name || 'Kingdom.Training',
          },
          publisher: {
            name: 'Kingdom.Training',
            logo: logoUrl,
          },
          mainEntityOfPage: articleUrl,
        }}
        breadcrumbs={{
          items: [
            { name: 'Home', url: siteUrl },
            { name: 'Articles', url: `${siteUrl}/articles` },
            { name: articleTitle, url: articleUrl },
          ],
        }}
      />
      {article.featured_image_url && (
        <FeaturedImage
          src={article.featured_image_url}
          alt={article.title.rendered}
          imageSizes={article.featured_image_sizes}
        />
      )}

      <div className="container-custom py-12 bg-white">
        <div className="max-w-4xl mx-auto relative">
          <AdminEditLink postId={article.id} />
          <div className="mb-8">
            <div className="flex items-center text-sm text-gray-600 mb-4">
              <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-accent-100 text-accent-800">
                {t('course_article')}
              </span>
            </div>

            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
              {article.title.rendered}
            </h1>
          </div>

          <div 
            className="prose prose-lg max-w-none prose-headings:text-gray-900 prose-headings:font-bold prose-h1:text-4xl prose-h2:text-3xl prose-h3:text-2xl prose-p:text-gray-900 prose-p:my-6 prose-strong:text-gray-900 prose-strong:font-bold prose-a:text-primary-500 prose-a:no-underline hover:prose-a:underline prose-ul:my-6 prose-ol:my-6 prose-li:text-gray-900 prose-li:my-2"
            dangerouslySetInnerHTML={{ __html: processedContent }}
          />
        </div>
      </div>

      {/* Additional Resources Section */}
      {relatedArticles.length > 0 && (
        <section className="py-16 bg-background-50 border-t border-gray-200">
          <div className="container-custom">
            <div className="max-w-7xl mx-auto">
              <div className="text-center mb-12">
                <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
                  {t('content_additional_article_resources')}
                </h2>
                <p className="text-lg text-gray-700 leading-relaxed max-w-3xl mx-auto">
                  {t('msg_discover_more')}
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {relatedArticles.map((relatedArticle) => (
                  <ContentCard key={relatedArticle.id} post={relatedArticle} type="articles" lang={currentLang || null} defaultLang={defaultLang} />
                ))}
              </div>
            </div>
          </div>
        </section>
      )}
    </article>
  );
}

