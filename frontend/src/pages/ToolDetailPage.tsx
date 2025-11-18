import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { getToolBySlug, WordPressPost } from '@/lib/wordpress';
import { formatDate } from '@/lib/utils';

export default function ToolDetailPage() {
  const { slug } = useParams<{ slug: string }>();
  const [tool, setTool] = useState<WordPressPost | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    async function fetchTool() {
      if (!slug) {
        setError(true);
        setLoading(false);
        return;
      }

      try {
        const data = await getToolBySlug(slug);
        if (data) {
          setTool(data);
        } else {
          setError(true);
        }
      } catch (err) {
        console.error('Error fetching tool:', err);
        setError(true);
      } finally {
        setLoading(false);
      }
    }
    fetchTool();
  }, [slug]);

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

  if (error || !tool) {
    return (
      <div className="container-custom py-16 text-center">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">Tool Not Found</h1>
        <p className="text-gray-600 mb-8">The tool you're looking for doesn't exist.</p>
        <Link to="/tools" className="text-primary-500 hover:text-primary-600 font-medium">
          ← Back to Tools
        </Link>
      </div>
    );
  }

  return (
    <article>
      {tool.featured_image_url && (
        <div className="w-full h-96 bg-gray-200">
          <img
            src={tool.featured_image_url}
            alt={tool.title.rendered}
            className="w-full h-full object-cover"
          />
        </div>
      )}

      <div className="container-custom py-12">
        <div className="max-w-4xl mx-auto">
          <div className="mb-8">
            <div className="flex items-center text-sm text-gray-600 mb-4">
              <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-secondary-100 text-secondary-800 mr-4">
                Tool
              </span>
              <time dateTime={tool.date}>
                {formatDate(tool.date)}
              </time>
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
    </article>
  );
}

