import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { getToolBySlug, getTools, WordPressPost } from '@/lib/wordpress';
import ContentCard from '@/components/ContentCard';
import SEO from '@/components/SEO';
import StructuredData from '@/components/StructuredData';
import AdminEditLink from '@/components/AdminEditLink';
import FeaturedImage from '@/components/FeaturedImage';
import { stripHtml } from '@/lib/utils';

export default function ToolDetailPage() {
  const { slug } = useParams<{ slug: string }>();
  const [tool, setTool] = useState<WordPressPost | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [additionalTools, setAdditionalTools] = useState<WordPressPost[]>([]);

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
          
          // Fetch additional tools (excluding current one)
          const tools = await getTools({
            per_page: 10,
            orderby: 'date',
            order: 'desc'
          });
          // Filter out current tool
          const filtered = tools.filter(t => t.id !== data.id).slice(0, 9);
          setAdditionalTools(filtered);
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
        />
      )}

      <div className="container-custom py-12 bg-white">
        <div className="max-w-4xl mx-auto relative">
          <AdminEditLink postId={tool.id} />
          <div className="mb-8">
            <div className="flex items-center text-sm text-gray-600 mb-4">
              <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-secondary-100 text-secondary-800">
                Tool
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
                  Additional Tool Resources
                </h2>
                <p className="text-lg text-gray-700 leading-relaxed max-w-3xl mx-auto">
                  Discover supplementary tools and resources to enhance your M2DMM strategy development and practice.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {additionalTools.map((tool) => (
                  <ContentCard key={tool.id} post={tool} type="tools" />
                ))}
              </div>
            </div>
          </div>
        </section>
      )}
    </article>
  );
}

