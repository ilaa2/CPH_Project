import React, { useState, useMemo } from 'react';
import { Head } from '@inertiajs/react';
import { SiteHeader, FooterNote } from '@/Layouts/CustomerLayout';
import { format } from 'date-fns';
import { id } from 'date-fns/locale';
import { FiStar, FiMessageSquare, FiCamera, FiCheckCircle } from 'react-icons/fi';

// Komponen Bintang Rating
const StarRating = ({ rating, className = '' }) => (
    <div className={`flex items-center ${className}`}>
        {Array.from({ length: 5 }).map((_, i) => (
            <FiStar key={i} className={`w-5 h-5 ${i < rating ? 'text-yellow-400' : 'text-gray-300'}`} style={{ fill: i < rating ? 'currentColor' : 'none' }} />
        ))}
    </div>
);

// Komponen Kartu Ulasan Individual (Desain Baru)
const UlasanCard = ({ ulasan }) => {
    const formattedDate = format(new Date(ulasan.tanggal), 'dd MMMM yyyy', { locale: id });

    return (
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex space-x-5">
            {/* Kolom Kiri: Avatar */}
            <div className="flex-shrink-0">
                <img
                    src={ulasan.foto_profil || `https://ui-avatars.com/api/?name=${encodeURIComponent(ulasan.nama)}&color=7F9CF5&background=EBF4FF`}
                    alt={ulasan.nama}
                    className="w-12 h-12 rounded-full object-cover"
                />
            </div>

            {/* Kolom Kanan: Konten Ulasan */}
            <div className="flex-grow">
                <h4 className="font-semibold text-sm text-gray-900">{ulasan.nama}</h4>
                <StarRating rating={ulasan.rating} className="mt-1" />
                <p className="text-xs text-gray-500 mt-2">{formattedDate}</p>
                
                <div className="flex items-center text-xs text-green-600 mt-3">
                    <FiCheckCircle className="mr-1.5" />
                    <span className="font-semibold">Pembelian Terverifikasi</span>
                </div>

                <p className="text-gray-800 text-sm leading-relaxed mt-4">{ulasan.komentar}</p>
                
                {/* Galeri Foto */}
                {ulasan.foto_ulasan && ulasan.foto_ulasan.length > 0 && (
                    <div className="mt-4">
                        <div className="flex flex-wrap gap-3">
                            {ulasan.foto_ulasan.map((foto, index) => (
                                <a key={index} href={foto} target="_blank" rel="noopener noreferrer" className="block">
                                    <img
                                        src={foto}
                                        alt={`Foto Ulasan ${index + 1}`}
                                        className="rounded-lg w-24 h-24 object-cover border border-gray-200 hover:opacity-80 transition-opacity"
                                    />
                                </a>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

// Komponen Ringkasan Rating
const RatingSummary = ({ stats }) => (
    <div className="bg-white rounded-xl p-6 mb-6 border border-gray-100 shadow-sm">
        <div className="flex flex-col md:flex-row items-start md:space-x-10">
            <div className="w-full md:w-1/3 text-center mb-6 md:mb-0">
                <p className="text-5xl font-bold text-gray-800">{stats.average.toFixed(1)}</p>
                <p className="text-sm text-gray-500 mb-2">dari 5</p>
                <StarRating rating={stats.average} className="justify-center" />
                <p className="text-sm text-gray-600 mt-3">{stats.total} Ulasan</p>
            </div>
            <div className="w-full md:w-2/3">
                {Object.entries(stats.counts).sort((a, b) => b[0] - a[0]).map(([star, count]) => {
                    const percentage = stats.total > 0 ? (count / stats.total) * 100 : 0;
                    return (
                        <div key={star} className="flex items-center space-x-3 my-1.5">
                            <span className="text-sm text-gray-700 font-medium">{star}</span>
                            <FiStar className="w-4 h-4 text-yellow-400 fill-current" />
                            <div className="w-full bg-gray-200 rounded-full h-2"><div className="bg-yellow-400 h-2 rounded-full" style={{ width: `${percentage}%` }}></div></div>
                            <span className="text-sm text-gray-600 w-12 text-right">{count}</span>
                        </div>
                    );
                })}
            </div>
        </div>
    </div>
);

// Komponen Tombol Filter
const FilterButton = ({ onClick, isActive, children }) => (
    <button
        onClick={onClick}
        className={`px-4 py-2 text-sm font-medium rounded-full transition-colors duration-200 ${
            isActive ? 'bg-green-600 text-white shadow-sm' : 'bg-white text-gray-700 hover:bg-gray-100 border'
        }`}
    >
        {children}
    </button>
);

// Komponen Halaman Utama
export default function UlasanIndex({ auth, ulasanList, ulasanStats }) {
    const [ratingFilter, setRatingFilter] = useState(0); // 0 for all, 1-5 for specific ratings
    const [photoFilter, setPhotoFilter] = useState(false); // true for with photos only

    const filteredUlasan = useMemo(() => {
        return ulasanList
            .filter(ulasan => {
                const ratingMatch = ratingFilter === 0 || ulasan.rating === ratingFilter;
                const photoMatch = !photoFilter || (ulasan.foto_ulasan && ulasan.foto_ulasan.length > 0);
                return ratingMatch && photoMatch;
            });
    }, [ulasanList, ratingFilter, photoFilter]);

    const handleRatingFilter = (rating) => {
        setRatingFilter(rating);
        setPhotoFilter(false); // Reset photo filter when a rating is clicked
    };

    const handlePhotoFilter = () => {
        setPhotoFilter(true);
        setRatingFilter(0); // Reset rating filter when photo is clicked
    };

    return (
        <>
            <Head title="Ulasan Pelanggan" />
            <SiteHeader auth={auth} />

            <main className="bg-gray-50 font-sans">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                    <h1 className="text-3xl font-bold text-gray-900 tracking-tight mb-4">Ulasan Pelanggan</h1>
                    
                    {ulasanList.length > 0 ? (
                        <>
                            <RatingSummary stats={ulasanStats} />
                            
                            {/* Filter Tabs */}
                            <div className="bg-white rounded-xl p-3 mb-6 border border-gray-100 shadow-sm">
                                <div className="flex flex-wrap items-center gap-3">
                                    <FilterButton onClick={() => handleRatingFilter(0)} isActive={ratingFilter === 0 && !photoFilter}>Semua</FilterButton>
                                    <FilterButton onClick={() => handleRatingFilter(5)} isActive={ratingFilter === 5}>5 Bintang</FilterButton>
                                    <FilterButton onClick={() => handleRatingFilter(4)} isActive={ratingFilter === 4}>4 Bintang</FilterButton>
                                    <FilterButton onClick={() => handleRatingFilter(3)} isActive={ratingFilter === 3}>3 Bintang</FilterButton>
                                    <FilterButton onClick={handlePhotoFilter} isActive={photoFilter}>
                                        <span className="flex items-center"><FiCamera className="mr-2 -ml-1"/>Dengan Foto</span>
                                    </FilterButton>
                                </div>
                            </div>

                            {/* Daftar Ulasan */}
                            <div className="space-y-4">
                                {filteredUlasan.length > 0 ? (
                                    filteredUlasan.map((item) => <UlasanCard key={item.id} ulasan={item} />)
                                ) : (
                                    <div className="text-center py-16 px-6 bg-white rounded-xl border border-gray-100 shadow-sm">
                                        <FiMessageSquare className="mx-auto text-5xl text-gray-300"/>
                                        <h3 className="mt-4 text-lg font-medium text-gray-800">Tidak Ada Ulasan</h3>
                                        <p className="mt-1 text-sm text-gray-500">Tidak ada ulasan yang cocok dengan filter yang Anda pilih.</p>
                                    </div>
                                )}
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
