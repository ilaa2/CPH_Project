import { Link } from '@inertiajs/react';

export default function Pagination({ links }) {
    if (!links || links.length <= 3) return null;

    return (
        <div className="flex flex-wrap justify-center mt-6 gap-1">
            {links.map((link, index) => (
                <Link
                    key={index}
                    href={link.url || '#'}
                    dangerouslySetInnerHTML={{ __html: link.label }}
                    className={`px-4 py-2 rounded-lg text-sm transition-all duration-200 ${link.active
                            ? 'bg-green-600 text-white shadow-md'
                            : 'bg-white text-gray-700 hover:bg-green-50 hover:text-green-700 border border-gray-200'
                        } ${!link.url ? 'text-gray-400 cursor-not-allowed opacity-50' : ''}`}
                    onClick={(e) => {
                        if (!link.url) e.preventDefault();
                    }}
                />
            ))}
        </div>
    );
}
