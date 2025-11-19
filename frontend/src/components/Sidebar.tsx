import { Category, Tag } from '@/lib/wordpress';
import { Link } from 'react-router-dom';

interface SidebarProps {
    categories: Category[];
    tags: Tag[];
    basePath: string; // e.g., '/articles' or '/tools'
}

export default function Sidebar({ categories, tags, basePath }: SidebarProps) {
    return (
        <aside className="space-y-8">
            {/* Categories */}
            {categories.length > 0 && (
                <div>
                    <h3 className="text-lg font-bold text-gray-900 mb-4 border-b pb-2">
                        Categories
                    </h3>
                    <ul className="space-y-2">
                        {categories.map((category) => (
                            <li key={category.id}>
                                <Link
                                    to={`${basePath}?category=${category.id}`}
                                    className="text-gray-600 hover:text-primary-600 transition-colors flex justify-between items-center"
                                >
                                    <span>{category.name}</span>
                                    <span className="text-xs bg-gray-100 text-gray-500 px-2 py-0.5 rounded-full">
                                        {category.count}
                                    </span>
                                </Link>
                            </li>
                        ))}
                    </ul>
                </div>
            )}

            {/* Tags */}
            {tags.length > 0 && (
                <div>
                    <h3 className="text-lg font-bold text-gray-900 mb-4 border-b pb-2">
                        Tags
                    </h3>
                    <div className="flex flex-wrap gap-2">
                        {tags.map((tag) => (
                            <Link
                                key={tag.id}
                                to={`${basePath}?tag=${tag.id}`}
                                className="text-sm bg-gray-100 text-gray-600 hover:bg-primary-50 hover:text-primary-600 px-3 py-1 rounded-full transition-colors"
                            >
                                {tag.name}
                            </Link>
                        ))}
                    </div>
                </div>
            )}
        </aside>
    );
}
