/**
 * PageHeader Component
 * Simple page header for internal pages
 */

interface PageHeaderProps {
  title: string;
  description?: string;
  backgroundClass?: string;
  backgroundComponent?: React.ReactNode;
}

export default function PageHeader({
  title,
  description,
  backgroundClass = "bg-gradient-to-r from-secondary-900 to-secondary-700",
  backgroundComponent
}: PageHeaderProps) {
  return (
    <section className={`${backgroundClass} text-white relative overflow-hidden`}>
      {backgroundComponent}
      <div className="container-custom py-16 md:py-24 relative z-10">
        <div className="max-w-3xl">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">
            {title}
          </h1>
          {description && (
            <p className="text-xl text-secondary-100 leading-relaxed">
              {description}
            </p>
          )}
        </div>
      </div>
    </section>
  );
}

