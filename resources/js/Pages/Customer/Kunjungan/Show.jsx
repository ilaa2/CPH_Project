import React from 'react';
import { Head, Link, router } from '@inertiajs/react';
import CustomerLayout from '@/Layouts/CustomerLayout';
import { FiArrowLeft, FiCalendar, FiClock, FiUsers, FiTag, FiCheckCircle, FiStar, FiCreditCard, FiAlertCircle, FiMapPin, FiDollarSign } from 'react-icons/fi';

// Status Badge Component
const StatusBadge = ({ status }) => {
    const statusConfig = {
        'Selesai': { bg: 'bg-green-100', text: 'text-green-700', icon: <FiCheckCircle />, label: 'Selesai' },
        'Dijadwalkan': { bg: 'bg-blue-100', text: 'text-blue-700', icon: <FiClock />, label: 'Dijadwalkan' },
        'Menunggu Pembayaran': { bg: 'bg-yellow-100', text: 'text-yellow-700', icon: <FiAlertCircle />, label: 'Menunggu Pembayaran' },
    };
    const config = statusConfig[status] || { bg: 'bg-gray-100', text: 'text-gray-700', icon: <FiClock />, label: status };

    return (
        <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium ${config.bg} ${config.text}`}>
            {config.icon}
            {config.label}
        </span>
    );
};

// Review Card Component
const UlasanCard = ({ ulasan }) => (
    <div className="mt-6 p-5 bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl border border-green-200">
        <h3 className="text-base font-semibold text-green-800 mb-3 flex items-center gap-2">
            <FiStar className="text-yellow-500" />
            Ulasan Anda
        </h3>
        <div className="flex gap-1 mb-2">
            {[...Array(5)].map((_, i) => (
                <FiStar key={i} className={`w-4 h-4 ${i < ulasan.rating ? 'text-yellow-400 fill-current' : 'text-gray-300'}`} />
            ))}
        </div>
        <p className="text-gray-700 text-sm italic">"{ulasan.komentar}"</p>
        {ulasan.foto_ulasan && (
            <img src={`/storage/${ulasan.foto_ulasan}`} alt="Foto Ulasan" className="mt-3 h-24 w-24 object-cover rounded-lg" />
        )}
    </div>
);

export default function KunjunganShow({ auth, kunjungan }) {
    const formatCurrency = (number) => new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(number);
    const formatDate = (dateString) => new Date(dateString).toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
    const formatTime = (timeString) => {
        if (!timeString) return '-';
        const time = timeString.substring(0, 5);
        const timeMap = {
            '09:00': '09.00 - 11.00 WIB',
            '11:00': '11.00 - 13.00 WIB',
            '13:00': '13.00 - 15.00 WIB',
            '15:00': '15.00 - 17.00 WIB',
        };
        return timeMap[time] || time;
    };

    const isPendingPayment = kunjungan.status === 'Menunggu Pembayaran' || kunjungan.payment_status === 'pending' || kunjungan.payment_status === 'unpaid';

    const handlePayNow = () => {
        router.visit(route('customer.kunjungan.payment', kunjungan.id));
    };

    return (
        <CustomerLayout auth={auth}>
            <Head title="Detail Kunjungan" />

            <main className="min-h-screen bg-gradient-to-b from-green-50/50 to-white py-8 sm:py-12">
                <div className="max-w-2xl mx-auto px-4 sm:px-6">

                    {/* Back Button - Modern Style */}
                    <Link
                        href={route('customer.pesanan.index')}
                        className="inline-flex items-center gap-2 px-4 py-2 bg-white rounded-full shadow-sm border border-gray-200 text-sm font-medium text-gray-700 hover:bg-gray-50 hover:shadow transition-all mb-6 group"
                    >
                        <FiArrowLeft className="text-green-600 group-hover:-translate-x-1 transition-transform" />
                        <span>Kembali ke Riwayat</span>
                    </Link>

                    {/* Main Card */}
                    <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">

                        {/* Header with Status & Price */}
                        <div className={`px-6 py-5 ${isPendingPayment ? 'bg-gradient-to-r from-yellow-500 to-amber-500' : 'bg-gradient-to-r from-green-600 to-emerald-600'}`}>
                            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                                <div>
                                    <StatusBadge status={kunjungan.status} />
                                    <h1 className="text-white text-lg font-bold mt-2">
                                        Kunjungan {kunjungan.tipe?.nama_tipe}
                                    </h1>
                                </div>
                                <div className="text-white text-right">
                                    <p className="text-white/80 text-xs uppercase tracking-wide">Total Biaya</p>
                                    <p className="text-2xl font-bold">{formatCurrency(kunjungan.total_biaya)}</p>
                                </div>
                            </div>
                        </div>

                        {/* Content */}
                        <div className="p-6">
                            {/* Info Grid */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                {/* Tanggal */}
                                <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-xl">
                                    <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center">
                                        <FiCalendar className="text-green-600" />
                                    </div>
                                    <div>
                                        <p className="text-xs text-gray-500">Tanggal</p>
                                        <p className="font-medium text-gray-800">{formatDate(kunjungan.tanggal)}</p>
                                    </div>
                                </div>

                                {/* Jam */}
                                <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-xl">
                                    <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
                                        <FiClock className="text-blue-600" />
                                    </div>
                                    <div>
                                        <p className="text-xs text-gray-500">Waktu</p>
                                        <p className="font-medium text-gray-800">{formatTime(kunjungan.jam)}</p>
                                    </div>
                                </div>

                                {/* Tipe Kunjungan */}
                                <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-xl">
                                    <div className="w-10 h-10 rounded-full bg-purple-100 flex items-center justify-center">
                                        <FiTag className="text-purple-600" />
                                    </div>
                                    <div>
                                        <p className="text-xs text-gray-500">Tipe</p>
                                        <p className="font-medium text-gray-800">{kunjungan.tipe?.nama_tipe}</p>
                                    </div>
                                </div>

                                {/* Jumlah Pengunjung */}
                                <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-xl">
                                    <div className="w-10 h-10 rounded-full bg-orange-100 flex items-center justify-center">
                                        <FiUsers className="text-orange-600" />
                                    </div>
                                    <div>
                                        <p className="text-xs text-gray-500">Pengunjung</p>
                                        {kunjungan.tipe?.nama_tipe === 'Outing Class' ? (
                                            <>
                                                <p className="font-medium text-gray-800">{kunjungan.jumlah_anak || 0} Anak</p>
                                                <p className="text-xs text-green-600">+ Guru gratis</p>
                                            </>
                                        ) : (
                                            <p className="font-medium text-gray-800">
                                                {(kunjungan.jumlah_dewasa || 0) + (kunjungan.jumlah_anak || 0) + (kunjungan.jumlah_balita || 0)} Orang
                                            </p>
                                        )}
                                    </div>
                                </div>
                            </div>

                            {/* Payment Button for Pending */}
                            {isPendingPayment && (
                                <div className="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded-xl">
                                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                                        <div className="flex items-center gap-2 text-yellow-700">
                                            <FiAlertCircle />
                                            <span className="text-sm font-medium">Pembayaran belum selesai</span>
                                        </div>
                                        <button
                                            onClick={handlePayNow}
                                            className="inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-gradient-to-r from-green-500 to-emerald-600 text-white font-semibold rounded-lg shadow-md hover:shadow-lg transition-all"
                                        >
                                            <FiCreditCard />
                                            Bayar Sekarang
                                        </button>
                                    </div>
                                </div>
                            )}

                            {/* Review Section */}
                            {kunjungan.ulasan ? (
                                <UlasanCard ulasan={kunjungan.ulasan} />
                            ) : (
                                kunjungan.status === 'Selesai' && (
                                    <div className="mt-6 text-center p-5 bg-gray-50 rounded-xl border border-dashed border-gray-300">
                                        <FiStar className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                                        <p className="text-gray-600 text-sm mb-3">Bagaimana pengalaman kunjungan Anda?</p>
                                        <Link
                                            href={route('customer.kunjungan.ulasan.create', kunjungan.id)}
                                            className="inline-flex items-center gap-2 px-5 py-2.5 bg-green-600 text-white font-semibold rounded-lg hover:bg-green-700 transition-colors"
                                        >
                                            <FiStar />
                                            Beri Ulasan
                                        </Link>
                                    </div>
                                )
                            )}
                        </div>
                    </div>
                </div>
            </main>
        </CustomerLayout>
    );
}
