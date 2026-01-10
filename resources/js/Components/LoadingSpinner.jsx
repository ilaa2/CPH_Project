import React from 'react';

export default function LoadingSpinner({ text = 'Memuat data...' }) {
    return (
        <div className="flex flex-col items-center justify-center p-8 space-y-4">
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-green-600"></div>
            <p className="text-gray-500 text-sm animate-pulse">{text}</p>
        </div>
    );
}
