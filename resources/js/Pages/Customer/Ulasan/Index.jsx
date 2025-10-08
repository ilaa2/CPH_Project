import React, { useState } from 'react';
import { Head } from '@inertiajs/react';
import { SiteHeader, FooterNote } from '@/Layouts/CustomerLayout';
import Modal from '@/Components/Modal';
import { format } from 'date-fns';
import { id } from 'date-fns/locale';

// --- Komponen yang Diimpor dari Halaman Admin ---

// Komponen untuk menampilkan bintang rating
const StarRating = ({ rating }) => (
    <div className="flex items-center">
        {[...Array(5)].map((_, i) => (
            <svg
                key={i}
                className={`w-5 h-5 ${i < rating ? 'text-yellow-400' : 'text-gray-300'}`}
                fill="currentColor"
                viewBox="0 0 20 20"
            >
                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.286 3.967a1 1 0 00.95.69h4.178c.969 0 1.371 1.24.588 1.81l-3.39 2.46a1 1 0 00-.364 1.118l1.286 3.966c.3.922-.755 1.688-1.54 1.118l-3.39-2.46a1 1 0 00-1.175 0l-3.39 2.46c-.784.57-1.838-.196-1.54-1.118l1.287-3.966a1 1 0 00-.364-1.118L2.045 9.394c-.783-.57-.38-1.81.588-1.81h4.178a1 1 0 00.95-.69l1.287-3.967z" />
            </svg>
        ))}
    </div>
);

// Komponen Card yang sudah didesain ulang
const UlasanCard = ({ ulasan }) => {
    const formattedDate = format(new Date(ulasan.tanggal), 'd MMMM yyyy', { locale: id });
    const cardColorClass = ulasan.type === 'Produk' ? 'bg-green-500' : 'bg-purple-500';
    const cardAccentColorClass = ulasan.type === 'Produk' ? 'bg-green-100 text-green-800' : 'bg-purple-100 text-purple-800';

    return (
        <div className="bg-white rounded-xl shadow-lg overflow-hidden transform transition-all hover:shadow-2xl hover:-translate-y-1.5 flex flex-col">
            <div className={`h-2 ${cardColorClass}`}></div>
            <div className="p-4 relative flex-grow">
                <svg className="absolute top-4 right-4 w-16 h-16 text-gray-100 opacity-80" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 3a1 1 0 011 1v2.586l2.293-2.293a1 1 0 111.414 1.414L12.414 8H15a1 1 0 110 2h-2.586l2.293 2.293a1 1 0 11-1.414 1.414L11 11.414V14a1 1 0 11-2 0v-2.586l-2.293 2.293a1 1 0 11-1.414-1.414L7.586 10H5a1 1 0 110-2h2.586L5.293 5.707a1 1 0 011.414-1.414L9 6.586V4a1 1 0 011-1z" clipRule="evenodd" />
                </svg>

                <div className="relative z-10">
                    <div className="flex items-start justify-between mb-4">
                        <div className="flex items-center gap-4">
                            <img
                                src={ulasan.foto_profil || `https://ui-avatars.com/api/?name=${ulasan.nama}&color=7F9CF5&background=EBF4FF`}
                                alt={ulasan.nama}
                                className="w-12 h-12 rounded-full object-cover border-2 border-white shadow-md"
                            />
                            <div>
                                <h4 className="font-bold text-base text-gray-800">{ulasan.nama}</h4>
                                <p className="text-sm text-gray-500">{formattedDate}</p>
                            </div>
                        </div>
                        <StarRating rating={ulasan.rating} />
                    </div>

                    <div className="mb-4">
                        <span className={`inline-block px-3 py-1 text-xs font-semibold rounded-full ${cardAccentColorClass}`}>
                            Ulasan {ulasan.type}
                        </span>
                        <p className="font-semibold text-gray-700 mt-2 truncate">{ulasan.subject}</p>
                    </div>

                    <p className="text-gray-600 text-sm leading-relaxed mb-4">
                        {ulasan.komentar}
                    </p>

                    {ulasan.foto_ulasan && ulasan.foto_ulasan.length > 0 && (
                        <div className="mt-4">
                            {ulasan.foto_ulasan.length === 1 ? (
                                <a href={ulasan.foto_ulasan[0]} target="_blank" rel="noopener noreferrer">
                                    <img
                                        src={ulasan.foto_ulasan[0]}
                                        alt="Foto Ulasan"
                                        className="rounded-lg w-full h-auto max-h-64 object-cover border transition-transform hover:scale-105"
                                    />
                                </a>
                            ) : (
                                <div className="grid grid-cols-2 gap-2">
                                    {ulasan.foto_ulasan.map((foto, index) => (
                                        <a key={index} href={foto} target="_blank" rel="noopener noreferrer">
                                            <img
                                                src={foto}
                                                alt={`Foto Ulasan ${index + 1}`}
                                                className="rounded-md w-full h-32 object-cover border transition-transform hover:scale-105"
                                            />
                                        </a>
                                    ))}
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};


// --- Komponen Halaman Utama ---

export default function UlasanIndex({ auth, ulasanList }) {
    return (
        <>
            <Head title="Ulasan Pelanggan" />
            <SiteHeader auth={auth} />

            <main className="bg-gray-50 font-sans min-h-screen">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                    <h1 className="text-3xl font-bold text-gray-900 tracking-tight mb-8">Ulasan Pelanggan</h1>

                    {ulasanList.length > 0 ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {ulasanList.map((item) => (
                                <UlasanCard key={item.id} ulasan={item} />
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-16 bg-white rounded-lg shadow-sm border">
                            <h3 className="text-lg font-medium text-gray-800">Belum Ada Ulasan</h3>
                            <p className="mt-1 text-sm text-gray-500">Jadilah yang pertama memberikan ulasan!</p>
                        </div>
                    )}
                </div>
            </main>

            <FooterNote />
        </>
    );
}
