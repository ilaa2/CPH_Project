import React, { useState, useMemo } from 'react';
import { Head } from '@inertiajs/react';
import { SiteHeader, FooterNote } from '@/Layouts/CustomerLayout';
import { format } from 'date-fns';
import { id } from 'date-fns/locale';
import { FiStar, FiMessageSquare, FiCheckCircle } from 'react-icons/fi';

// Komponen Bintang Rating
const StarRating = ({ rating, className = '' }) => (
    <div className={`flex items-center ${className}`}>
        {Array.from({ length: 5 }).map((_, i) => (
            <FiStar key={i} className={`w-5 h-5 ${i < rating ? 'text-yellow-400' : 'text-gray-300'}`} style={{ fill: i < rating ? 'currentColor' : 'none' }} />
        ))}
    </div>
);

// Komponen Kartu Ulasan Individual
const UlasanCard = ({ ulasan }) => {
    const formattedDate = format(new Date(ulasan.tanggal), 'dd MMMM yyyy', { locale: id });

    return (
        <div className="bg-gray-50 rounded-lg shadow-sm border border-gray-200 overflow-hidden flex flex-col h-full">
            {/* Card Header */}
            <div className="bg-white p-4 border-b border-gray-200">
                <div className="flex items-center">
                    <img
                        src={ulasan.foto_profil || `https://ui-avatars.com/api/?name=${encodeURIComponent(ulasan.nama)}&color=7F9CF5&background=EBF4FF`}
                        alt={ulasan.nama}
                        className="w-10 h-10 rounded-full object-cover"
                    />
                    <div className="ml-3">
                        <h4 className="font-semibold text-sm text-gray-900">{ulasan.nama}</h4>
                        <p className="text-xs text-gray-500">{formattedDate}</p>
                    </div>
                </div>
            </div>

            {/* Card Body */}
            <div className="p-4 flex-grow">
                <StarRating rating={ulasan.rating} />
                
                <div className="flex items-center text-xs text-green-600 mt-3">
                    <FiCheckCircle className="mr-1.5" />
                    <span className="font-semibold">Pembelian Terverifikasi</span>
                </div>

                <p className="text-gray-800 text-sm leading-relaxed mt-3">{ulasan.komentar}</p>
            </div>

            {/* Card Footer with Photos */}
            {ulasan.foto_ulasan && ulasan.foto_ulasan.length > 0 && (
                <div className="px-4 pb-4 pt-1">
                    <div className="grid grid-cols-4 gap-2">
                        {ulasan.foto_ulasan.map((foto, index) => (
                            <a key={index} href={foto} target="_blank" rel="noopener noreferrer" className="block">
                                <img
                                    src={foto}
                                    alt={`Foto Ulasan ${index + 1}`}
                                    className="rounded-md w-full h-16 object-cover border border-gray-200 hover:opacity-80 transition-opacity"
                                />
                            </a>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
};

// Komponen Ringkasan Rating
const RatingSummary = ({ stats }) => {
    return (
        <div className="bg-white rounded-lg p-6 mb-8 border border-gray-200">
            <div className="flex flex-col md:flex-row items-start md:space-x-10">
                {/* Left Side */}
                <div className="w-full md:w-1/3 text-center mb-6 md:mb-0">
                    <p className="text-5xl font-bold text-gray-800">{stats.average.toFixed(1)}</p>
                    <p className="text-sm text-gray-500 mb-2">dari 5</p>
                    <StarRating rating={stats.average} className="justify-center" />
                    <p className="text-sm text-gray-600 mt-3">{stats.total} Ulasan</p>
                </div>
                
                {/* Right Side */}
                <div className="w-full md:w-2/3">
                    {Object.entries(stats.counts).sort((a, b) => b[0] - a[0]).map(([star, count]) => {
                        const percentage = stats.total > 0 ? (count / stats.total) * 100 : 0;
                        return (
                            <div key={star} className="flex items-center space-x-3 my-1.5">
                                <span className="text-sm text-gray-700 font-medium">{star}</span>
                                <FiStar className="w-4 h-4 text-yellow-400 fill-current" />
                                <div className="w-full bg-gray-200 rounded-full h-2">
                                    <div className="bg-yellow-400 h-2 rounded-full" style={{ width: `${percentage}%` }}></div>
                                </div>
                                <span className="text-sm text-gray-600 w-12 text-right">{count}</span>
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
};

// Komponen Halaman Utama
export default function UlasanIndex({ auth, ulasanList, ulasanStats }) {
    const [filter, setFilter] = useState(0); // 0 for all, 1-5 for specific ratings
    const [sort, setSort] = useState('terbaru'); // 'terbaru', 'terlama'

    const filteredAndSortedUlasan = useMemo(() => {
        return ulasanList
            .filter(ulasan => filter === 0 || ulasan.rating === filter)
            .sort((a, b) => {
                if (sort === 'terbaru') {
                    return new Date(b.tanggal) - new Date(a.tanggal);
                }
                return new Date(a.tanggal) - new Date(b.tanggal);
            });
    }, [ulasanList, filter, sort]);

    return (
        <>
            <Head title="Ulasan Pelanggan" />
            <SiteHeader auth={auth} />

            <main className="bg-gray-50 font-sans">
                <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                    <h1 className="text-3xl font-bold text-gray-900 tracking-tight mb-4">Ulasan Pelanggan</h1>
                    
                    {ulasanList.length > 0 ? (
                        <>
                            <RatingSummary stats={ulasanStats} />
                            
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 pt-2">
                                    {filteredAndSortedUlasan.map((item) => (
                                        <UlasanCard key={item.id} ulasan={item} />
                                    ))}
                                </div>
                        </>
                    ) : (
                        <div className="text-center py-20 px-6 bg-white rounded-lg border border-gray-200">
                            <FiMessageSquare className="mx-auto text-6xl text-gray-300"/>
                            <h3 className="mt-4 text-xl font-medium text-gray-800">Belum Ada Ulasan</h3>
                            <p className="mt-2 text-base text-gray-500">Jadilah yang pertama memberikan ulasan untuk pengalaman Anda!</p>
                        </div>
                    )}
                </div>
            </main>

            <FooterNote />
        </>
    );
}
