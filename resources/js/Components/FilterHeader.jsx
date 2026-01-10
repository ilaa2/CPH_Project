import React from 'react';

export default function FilterHeader({
    tabs = [],
    activeTab,
    onTabChange,
    searchValue,
    onSearchChange,
    searchPlaceholder = "Cari..."
}) {
    return (
        <div className="bg-white p-4 rounded-xl shadow-md mb-6">
            <div className="flex flex-col md:flex-row justify-between items-center gap-4">
                {/* Filter Pills/Tabs */}
                <div className="flex flex-wrap gap-2">
                    {tabs.map((tab) => (
                        <button
                            key={tab}
                            onClick={() => onTabChange(tab)}
                            className={`px-4 py-2 rounded-full text-sm font-semibold transition-all duration-200 ${activeTab === tab
                                    ? 'bg-green-600 text-white shadow-md'
                                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                                }`}
                        >
                            {tab}
                        </button>
                    ))}
                </div>

                {/* Search Input */}
                <div className="relative w-full md:w-72">
                    <input
                        type="text"
                        value={searchValue}
                        onChange={onSearchChange}
                        placeholder={searchPlaceholder}
                        className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-full focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all text-sm shadow-sm"
                    />
                    <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 text-lg">
                        🔍
                    </span>
                </div>
            </div>
        </div>
    );
}
