import React from 'react';
import { Head, Link } from '@inertiajs/react';
import { SiteHeader, FooterNote } from '@/Layouts/CustomerLayout';
import { FiArrowLeft, FiCalendar, FiUsers, FiTag, FiFileText, FiCheckCircle, FiClock, FiStar, FiXCircle } from 'react-icons/fi';

// Komponen untuk menampilkan detail item
const DetailItem = ({ icon, label, value }) => (
    <div className="flex items-start">
        <div className="flex-shrink-0 w-8 text-center">
            {icon}
        </div>
        <div className="ml-4">
            <p className="text-sm text-gray-500">{label}</p>
            <p className="text-base font-medium text-gray-800">{value}</p>
        </div>
    </div>
);

// Komponen untuk menampilkan ulasan yang sudah ada
const UlasanCard = ({ ulasan }) => (
    <div className="mt-8 p-6 bg-green-50 rounded-lg border border-green-200">
        <h3 className="text-lg font-semibold text-green-800 mb-4 flex items-center"><FiStar className="mr-2"/>Ulasan Anda</h3>
        <div className="flex mb-2">
            {[...Array(ulasan.rating)].map((_, i) => (
                <FiStar key={i} className="w-5 h-5 text-yellow-400 fill-current" />
            ))}
        </div>
        <p className="text-gray-700 italic">"{ulasan.komentar}"</p>
        {ulasan.foto_ulasan && (
            <img src={`/storage/${ulasan.foto_ulasan}`} alt="Foto Ulasan" className="mt-4 h-32 w-32 object-cover rounded-md" />
        )}
    </div>
);

export default function KunjunganShow({ auth, kunjungan }) {
    const formatCurrency = (number) => new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(number);
    const formatDate = (dateString) => new Date(dateString).toLocaleDateString('id-ID', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });

    const statusInfo = {
        'Selesai': { text: 'Selesai', icon: <FiCheckCircle className="text-green-500" />, color: 'text-green-600' },
        'Direncanakan': { text: 'Direncanakan', icon: <FiClock className="text-blue-500" />, color: 'text-blue-600' },
        'Dibatalkan': { text: 'Dibatalkan', icon: <FiXCircle className="text-red-500" />, color: 'text-red-600' },
    };
    const currentStatus = statusInfo[kunjungan.status] || { text: kunjungan.status, icon: <FiClock />, color: 'text-gray-600' };

    return (
        <>
            <Head title={`Detail Kunjungan ${kunjungan.judul}`} />
            <SiteHeader auth={auth} />

            <main className="bg-gray-50 font-sans">
                <div className="max-w-3xl mx-auto px-4 py-12">
                    <Link href={route('customer.pesanan.index')} className="inline-flex items-center text-sm text-green-600 hover:underline mb-6">
                        <FiArrowLeft className="mr-2" />
                        Kembali ke Riwayat
                    </Link>

                    <div className="bg-white p-8 rounded-xl shadow-md border">
                        <div className="flex justify-between items-start mb-6">
                            <div>
                                <h1 className="text-2xl font-bold text-gray-900">{kunjungan.judul}</h1>
                                <p className={`mt-1 text-sm font-semibold flex items-center gap-2 ${currentStatus.color}`}>
                                    {currentStatus.icon}
                                    <span>Status: {currentStatus.text}</span>
                                </p>
                            </div>
                            <div className="text-right">
                                <p className="font-bold text-xl text-green-600">{formatCurrency(kunjungan.total_biaya)}</p>
                                <p className="text-xs text-gray-500">Total Biaya</p>
                            </div>
                        </div>

                        <div className="space-y-6">
                            <DetailItem icon={<FiCalendar className="text-gray-400"/>} label="Tanggal" value={formatDate(kunjungan.tanggal)} />
                            <DetailItem icon={<FiTag className="text-gray-400"/>} label="Tipe Kunjungan" value={kunjungan.tipe.nama_tipe} />
                            <DetailItem icon={<FiUsers className="text-gray-400"/>} label="Jumlah Pengunjung" value={`${kunjungan.jumlah_pengunjung} orang`} />
                            {kunjungan.deskripsi && <DetailItem icon={<FiFileText className="text-gray-400"/>} label="Deskripsi" value={kunjungan.deskripsi} />}
                        </div>

                        {kunjungan.ulasan ? (
                            <UlasanCard ulasan={kunjungan.ulasan} />
                        ) : (
                            kunjungan.status === 'Selesai' && (
                                <div className="mt-8 text-center">
                                    <Link href={route('customer.kunjungan.ulasan.create', kunjungan.id)} className="inline-block bg-green-600 text-white font-bold py-2.5 px-6 rounded-lg hover:bg-green-700 transition-colors">
                                        Beri Ulasan
                                    </Link>
                                </div>
                            )
                        )}
                    </div>
                </div>
            </main>

            <FooterNote />
        </>
    );
}
