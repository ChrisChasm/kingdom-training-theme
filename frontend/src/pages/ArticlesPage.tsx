import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import PageHeader from '@/components/PageHeader';
import ContentCard from '@/components/ContentCard';
import Sidebar from '@/components/Sidebar';
import IdeasBackground from '@/components/IdeasBackground';
import SEO from '@/components/SEO';
import { getArticles, getArticleCategories, getTags, WordPressPost, Category, Tag } from '@/lib/wordpress';

export default function ArticlesPage() {
  const [searchParams] = useSearchParams();
  const [articles, setArticles] = useState<WordPressPost[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [tags, setTags] = useState<Tag[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      setLoading(true);
      try {
        const categoryId = searchParams.get('category');
        const tagId = searchParams.get('tag');

        const [articlesData, categoriesData, tagsData] = await Promise.all([
          getArticles({
            per_page: 100,
            orderby: 'date',
            order: 'desc',
            article_categories: categoryId || undefined,
            tags: tagId || undefined
          }),
          getArticleCategories(),
          getTags({ hide_empty: true, post_type: 'articles' })
        ]);

        setArticles(articlesData);
        setCategories(categoriesData);
        setTags(tagsData);
      } catch (error) {
        console.error('Error fetching data:', error);
        setArticles([]);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, [searchParams]);

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

  return (
    <>
      <SEO
        title="Articles"
        description="Practical guidance, best practices, and real-world insights from the Media to Disciple Making Movements community. Learn from practitioners implementing M2DMM strategies around the world."
        keywords="M2DMM articles, disciple making movements, media strategy, digital evangelism, church planting articles, online ministry, practical discipleship, field insights, kingdom training articles"
        url="/articles"
      />
      <PageHeader
        title="Articles"
        description="Practical guidance, best practices, and real-world insights from the Media to Disciple Making Movements community. Learn from practitioners implementing M2DMM strategies around the world."
        backgroundClass="bg-gradient-to-r from-secondary-900 to-secondary-700"
        backgroundComponent={<IdeasBackground />}
      />

      <section className="py-16">
        <div className="container-custom">
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-12">
            {/* Sidebar */}
            <div className="lg:col-span-1">
              <Sidebar
                categories={categories}
                tags={tags}
                basePath="/articles"
              />
            </div>

            {/* Main Content */}
            <div className="lg:col-span-3">
              {articles.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  {articles.map((article) => (
                    <ContentCard key={article.id} post={article} type="articles" />
                  ))}
                </div>
              ) : (
                <div className="text-center py-16 bg-gray-50 rounded-lg">
                  <div className="text-6xl mb-4">📝</div>
                  <h3 className="text-2xl font-bold text-gray-900 mb-2">
                    No Articles Found
                  </h3>
                  <p className="text-gray-600">
                    Try adjusting your filters or check back later.
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

