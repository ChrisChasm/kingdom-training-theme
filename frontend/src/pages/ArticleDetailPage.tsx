import { useEffect, useState } from 'react';
import { useParams, Link, useLocation } from 'react-router-dom';
import { getArticleBySlug, getArticles, WordPressPost, getDefaultLanguage } from '@/lib/wordpress';
import { useTranslation } from '@/hooks/useTranslation';
import ContentCard from '@/components/ContentCard';
import SEO from '@/components/SEO';
import StructuredData from '@/components/StructuredData';
import AdminEditLink from '@/components/AdminEditLink';
import FeaturedImage from '@/components/FeaturedImage';
import { stripHtml, parseLanguageFromPath } from '@/lib/utils';

export default function ArticleDetailPage() {
  const { slug, lang } = useParams<{ slug: string; lang?: string }>();
  const location = useLocation();
  const { t } = useTranslation();
  const [article, setArticle] = useState<WordPressPost | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [relatedArticles, setRelatedArticles] = useState<WordPressPost[]>([]);
  const [defaultLang, setDefaultLang] = useState<string | null>(null);

  // Get current language from URL params or path
  const currentLang = lang || parseLanguageFromPath(location.pathname).lang || undefined;

  // Fetch default language
  useEffect(() => {
    getDefaultLanguage().then(setDefaultLang);
  }, []);

  useEffect(() => {
    async function fetchArticle() {
      if (!slug) {
        setError(true);
        setLoading(false);
        return;
      }

      try {
        // Determine target language: use provided lang, or defaultLang, or null for default
        const targetLang = currentLang || defaultLang || null;

        const data = await getArticleBySlug(slug, currentLang);
        if (data) {
          setArticle(data);
          
          // Fetch additional articles (excluding current one) in same language
          const articles = await getArticles({
            per_page: 10,
            orderby: 'date',
            order: 'desc',
            lang: targetLang || undefined
          });
          
          // Filter by language and exclude current article
          const filtered = articles
            .filter(article => {
              // Filter by language
              if (targetLang === null) {
                // Default language: include posts with null/undefined language
                return article.language === null || article.language === undefined;
              } else {
                // Specific language: only include posts matching that language
                return article.language === targetLang;
              }
            })
            .filter(a => a.id !== data.id)
            .slice(0, 9);
          setRelatedArticles(filtered);
        } else {
          setError(true);
        }
      } catch (err) {
        console.error('Error fetching article:', err);
        setError(true);
      } finally {
        setLoading(false);
      }
    }
    fetchArticle();
  }, [slug, currentLang, defaultLang]);

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

  if (error || !article) {
    return (
      <div className="container-custom py-16 text-center">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">Article Not Found</h1>
        <p className="text-gray-600 mb-8">The article you're looking for doesn't exist.</p>
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
        />
      )}

      <div className="container-custom py-12 bg-white">
        <div className="max-w-4xl mx-auto relative">
          <AdminEditLink postId={article.id} />
          <div className="mb-8">
            <div className="flex items-center text-sm text-gray-600 mb-4">
              <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-accent-100 text-accent-800">
                Article
              </span>
            </div>

            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
              {article.title.rendered}
            </h1>
          </div>

          <div 
            className="prose prose-lg max-w-none prose-headings:text-gray-900 prose-headings:font-bold prose-h1:text-4xl prose-h2:text-3xl prose-h3:text-2xl prose-p:text-gray-900 prose-p:my-6 prose-strong:text-gray-900 prose-strong:font-bold prose-a:text-primary-500 prose-a:no-underline hover:prose-a:underline prose-ul:my-6 prose-ol:my-6 prose-li:text-gray-900 prose-li:my-2"
            dangerouslySetInnerHTML={{ __html: article.content.rendered }}
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
                  Additional Article Resources
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

