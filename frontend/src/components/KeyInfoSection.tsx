/**
 * Key Info Section Component
 * Answer Engine Optimization component that provides structured,
 * easily parseable information for LLMs
 */

interface KeyInfoSectionProps {
  title?: string;
  items: Array<{
    term: string;
    definition: string;
  }>;
  className?: string;
}

export default function KeyInfoSection({
  title = 'Key Information',
  items,
  className = '',
}: KeyInfoSectionProps) {
  if (items.length === 0) {
    return null;
  }

  return (
    <section className={`py-12 bg-gray-50 border-t border-gray-200 ${className}`}>
      <div className="container-custom">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">{title}</h2>
          <dl className="space-y-4">
            {items.map((item, index) => (
              <div key={index} className="bg-white p-4 rounded-lg shadow-sm">
                <dt className="text-lg font-semibold text-gray-900 mb-2">
                  {item.term}
                </dt>
                <dd className="text-gray-700 leading-relaxed">
                  {item.definition}
                </dd>
              </div>
            ))}
          </dl>
        </div>
      </div>
    </section>
  );
}

