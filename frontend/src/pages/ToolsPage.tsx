import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import PageHeader from '@/components/PageHeader';
import ContentCard from '@/components/ContentCard';
import Sidebar from '@/components/Sidebar';
import { getTools, getToolCategories, getTags, WordPressPost, Category, Tag } from '@/lib/wordpress';

export default function ToolsPage() {
  const [searchParams] = useSearchParams();
  const [tools, setTools] = useState<WordPressPost[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [tags, setTags] = useState<Tag[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      setLoading(true);
      try {
        const categoryId = searchParams.get('category');
        const tagId = searchParams.get('tag');

        const [toolsData, categoriesData, tagsData] = await Promise.all([
          getTools({
            per_page: 100,
            orderby: 'date',
            order: 'desc',
            tool_categories: categoryId || undefined,
            tags: tagId || undefined
          }),
          getToolCategories(),
          getTags({ hide_empty: true, post_type: 'tools' })
        ]);

        setTools(toolsData);
        setCategories(categoriesData);
        setTags(tagsData);
      } catch (error) {
        console.error('Error fetching data:', error);
        setTools([]);
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
      <PageHeader
        title="Tools"
        description="Essential tools and resources for Media to Disciple Making Movements work. Discover Disciple.Tools—our free, open-source disciple relationship management system—and other practical resources designed specifically for M2DMM practitioners."
        backgroundClass="bg-gradient-to-r from-secondary-900 to-secondary-700"
      />

      <section className="py-16">
        <div className="container-custom">
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-12">
            {/* Sidebar */}
            <div className="lg:col-span-1">
              <Sidebar
                categories={categories}
                tags={tags}
                basePath="/tools"
              />
            </div>

            {/* Main Content */}
            <div className="lg:col-span-3">
              {tools.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  {tools.map((tool) => (
                    <ContentCard key={tool.id} post={tool} type="tools" />
                  ))}
                </div>
              ) : (
                <div className="text-center py-16 bg-gray-50 rounded-lg">
                  <div className="text-6xl mb-4">🛠️</div>
                  <h3 className="text-2xl font-bold text-gray-900 mb-2">
                    No Tools Found
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

