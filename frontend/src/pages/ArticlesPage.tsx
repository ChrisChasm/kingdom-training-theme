import { useEffect, useState } from 'react';
import PageHeader from '@/components/PageHeader';
import ContentCard from '@/components/ContentCard';
import { getArticles, WordPressPost } from '@/lib/wordpress';

export default function ArticlesPage() {
  const [articles, setArticles] = useState<WordPressPost[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchArticles() {
      try {
        const data = await getArticles({ 
          per_page: 100, 
          orderby: 'date', 
          order: 'desc' 
        });
        setArticles(data);
      } catch (error) {
        console.error('Error fetching articles:', error);
        setArticles([]);
      } finally {
        setLoading(false);
      }
    }
    fetchArticles();
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
        title="Articles"
        description="Practical guidance, best practices, and real-world insights from the Media to Disciple Making Movements community. Learn from practitioners implementing M2DMM strategies around the world."
        backgroundClass="bg-gradient-to-r from-primary-900 to-primary-700"
      />

      <section className="py-16">
        <div className="container-custom">
          {articles.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {articles.map((article) => (
                <ContentCard key={article.id} post={article} type="articles" />
              ))}
            </div>
          ) : (
            <div className="text-center py-16">
              <div className="text-6xl mb-4">📝</div>
              <h3 className="text-2xl font-bold text-gray-900 mb-2">
                No Articles Yet
              </h3>
              <p className="text-gray-600">
                Articles will be published here soon. Check back later!
              </p>
            </div>
          )}
        </div>
      </section>
    </>
  );
}

