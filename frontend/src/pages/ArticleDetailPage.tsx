import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { getArticleBySlug, WordPressPost } from '@/lib/wordpress';
import { formatDate } from '@/lib/utils';

export default function ArticleDetailPage() {
  const { slug } = useParams<{ slug: string }>();
  const [article, setArticle] = useState<WordPressPost | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    async function fetchArticle() {
      if (!slug) {
        setError(true);
        setLoading(false);
        return;
      }

      try {
        const data = await getArticleBySlug(slug);
        if (data) {
          setArticle(data);
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
  }, [slug]);

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

  if (error || !article) {
    return (
      <div className="container-custom py-16 text-center">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">Article Not Found</h1>
        <p className="text-gray-600 mb-8">The article you're looking for doesn't exist.</p>
        <Link to="/articles" className="text-primary-600 hover:text-primary-700 font-medium">
          ← Back to Articles
        </Link>
      </div>
    );
  }

  return (
    <article>
      {article.featured_image_url && (
        <div className="w-full h-96 bg-gray-200">
          <img
            src={article.featured_image_url}
            alt={article.title.rendered}
            className="w-full h-full object-cover"
          />
        </div>
      )}

      <div className="container-custom py-12">
        <div className="max-w-4xl mx-auto">
          <div className="mb-8">
            <div className="flex items-center text-sm text-gray-600 mb-4">
              <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-accent-100 text-accent-800 mr-4">
                Article
              </span>
              <time dateTime={article.date}>
                {formatDate(article.date)}
              </time>
            </div>

            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
              {article.title.rendered}
            </h1>

            {article.author_info && (
              <div className="flex items-center space-x-3">
                {article.author_info.avatar && (
                  <img
                    src={article.author_info.avatar}
                    alt={article.author_info.name}
                    className="w-10 h-10 rounded-full"
                  />
                )}
                <div>
                  <p className="text-sm font-medium text-gray-900">
                    {article.author_info.name}
                  </p>
                </div>
              </div>
            )}
          </div>

          <div 
            className="prose prose-lg max-w-none prose-headings:text-gray-900 prose-a:text-primary-600 prose-a:no-underline hover:prose-a:underline"
            dangerouslySetInnerHTML={{ __html: article.content.rendered }}
          />
        </div>
      </div>
    </article>
  );
}

