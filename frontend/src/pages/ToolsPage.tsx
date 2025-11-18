import { useEffect, useState } from 'react';
import PageHeader from '@/components/PageHeader';
import ContentCard from '@/components/ContentCard';
import { getTools, WordPressPost } from '@/lib/wordpress';

export default function ToolsPage() {
  const [tools, setTools] = useState<WordPressPost[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchTools() {
      try {
        const data = await getTools({ 
          per_page: 100, 
          orderby: 'date', 
          order: 'desc' 
        });
        setTools(data);
      } catch (error) {
        console.error('Error fetching tools:', error);
        setTools([]);
      } finally {
        setLoading(false);
      }
    }
    fetchTools();
  }, []);

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
          {tools.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {tools.map((tool) => (
                <ContentCard key={tool.id} post={tool} type="tools" />
              ))}
            </div>
          ) : (
            <div className="text-center py-16">
              <div className="text-6xl mb-4">🛠️</div>
              <h3 className="text-2xl font-bold text-gray-900 mb-2">
                No Tools Yet
              </h3>
              <p className="text-gray-600">
                Tools will be published here soon. Check back later!
              </p>
            </div>
          )}
        </div>
      </section>
    </>
  );
}

