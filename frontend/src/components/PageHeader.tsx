/**
 * PageHeader Component
 * Simple page header for internal pages
 */

interface PageHeaderProps {
  title: string;
  description?: string;
  backgroundClass?: string;
}

export default function PageHeader({ 
  title, 
  description,
  backgroundClass = "bg-gradient-to-r from-primary-900 to-primary-700"
}: PageHeaderProps) {
  return (
    <section className={`${backgroundClass} text-white`}>
      <div className="container-custom py-16 md:py-24">
        <div className="max-w-3xl">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">
            {title}
          </h1>
          {description && (
            <p className="text-xl text-blue-100 leading-relaxed">
              {description}
            </p>
          )}
        </div>
      </div>
    </section>
  );
}

