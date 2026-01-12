import { Head, router } from '@inertiajs/react';
import CustomerLayout from '@/Layouts/CustomerLayout';
import { FiUser, FiPhone, FiCalendar, FiUsers, FiClipboard, FiArrowLeft, FiCheckCircle, FiEdit3, FiCreditCard, FiShield } from 'react-icons/fi';
import React, { useState } from 'react';

export default function KunjunganKonfirmasi({ auth, dataKunjungan }) {
    const [processing, setProcessing] = useState(false);

    const handleSubmit = () => {
        setProcessing(true);
        // Redirect ke Midtrans untuk pembayaran
        router.post(route('customer.kunjungan.store'), dataKunjungan, {
            onFinish: () => setProcessing(false),
        });
    };

    const formatCurrency = (number) => {
        return new Intl.NumberFormat('id-ID', {
            style: 'currency',
            currency: 'IDR',
            minimumFractionDigits: 0
        }).format(number);
    };

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString('id-ID', {
            weekday: 'long',
            day: 'numeric',
            month: 'long',
            year: 'numeric'
        });
    };

    return (
        <CustomerLayout auth={auth}>
            <Head title="Konfirmasi Kunjungan" />

            {/* Elegant Header with Gradient & Pattern */}
            <div className="relative overflow-hidden bg-gradient-to-br from-green-700 via-green-600 to-emerald-500">
                {/* Decorative Pattern Overlay */}
                <div className="absolute inset-0 opacity-10">
                    <svg className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
                        <defs>
                            <pattern id="leaf-pattern" x="0" y="0" width="60" height="60" patternUnits="userSpaceOnUse">
                                <circle cx="30" cy="30" r="20" fill="white" fillOpacity="0.3" />
                                <circle cx="0" cy="0" r="15" fill="white" fillOpacity="0.2" />
                                <circle cx="60" cy="60" r="15" fill="white" fillOpacity="0.2" />
                            </pattern>
                        </defs>
                        <rect width="100%" height="100%" fill="url(#leaf-pattern)" />
                    </svg>
                </div>

                {/* Subtle Glow Effect */}
                <div className="absolute top-0 right-0 w-96 h-96 bg-white/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
                <div className="absolute bottom-0 left-0 w-64 h-64 bg-emerald-400/20 rounded-full blur-2xl translate-y-1/2 -translate-x-1/2"></div>

                <div className="relative max-w-6xl mx-auto px-4 sm:px-6 py-8">
                    <div className="flex items-center gap-4">
                        <button
                            onClick={() => window.history.back()}
                            className="p-2.5 rounded-full bg-white/20 hover:bg-white/30 backdrop-blur-sm transition-all border border-white/20"
                            title="Kembali"
                        >
                            <FiArrowLeft className="w-5 h-5 text-white" />
                        </button>
                        <div>
                            <h1 className="text-2xl sm:text-3xl font-bold text-white drop-shadow-sm">Konfirmasi & Pembayaran</h1>
                            <p className="text-green-100 text-sm mt-1">Langkah terakhir sebelum booking dikonfirmasi</p>
                        </div>
                    </div>

                    {/* Progress Steps */}
                    <div className="flex items-center gap-3 mt-6 text-sm">
                        <div className="flex items-center gap-2 text-white/80">
                            <div className="w-7 h-7 rounded-full bg-white/30 backdrop-blur-sm flex items-center justify-center font-bold text-xs border border-white/30">✓</div>
                            <span className="hidden sm:inline">Isi Data</span>
                        </div>
                        <div className="w-8 h-0.5 bg-white/40"></div>
                        <div className="flex items-center gap-2 text-white font-semibold">
                            <div className="w-7 h-7 rounded-full bg-white text-green-600 flex items-center justify-center font-bold text-xs shadow-lg">2</div>
                            <span>Konfirmasi</span>
                        </div>
                        <div className="w-8 h-0.5 bg-white/30"></div>
                        <div className="flex items-center gap-2 text-white/50">
                            <div className="w-7 h-7 rounded-full bg-white/20 flex items-center justify-center font-bold text-xs border border-white/20">3</div>
                            <span className="hidden sm:inline">Bayar</span>
                        </div>
                        <div className="w-8 h-0.5 bg-white/20"></div>
                        <div className="flex items-center gap-2 text-white/40">
                            <div className="w-7 h-7 rounded-full bg-white/10 flex items-center justify-center font-bold text-xs border border-white/10">4</div>
                            <span className="hidden sm:inline">Selesai</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Main Content - 2 Column Layout */}
            <main className="py-8 bg-gradient-to-b from-gray-50 to-white min-h-[60vh]">
                <div className="max-w-6xl mx-auto px-4 sm:px-6">
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

                        {/* Left Column - Detail Kunjungan */}
                        <div className="lg:col-span-2">
                            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                                <div className="px-6 py-4 border-b bg-gradient-to-r from-gray-50 to-white">
                                    <h2 className="font-bold text-gray-800 flex items-center gap-2">
                                        <FiClipboard className="text-green-600" />
                                        Detail Kunjungan
                                    </h2>
                                </div>

                                <div className="divide-y">
                                    {/* Nama & No HP */}
                                    <div className="grid grid-cols-1 sm:grid-cols-2 divide-y sm:divide-y-0 sm:divide-x">
                                        <div className="px-6 py-4">
                                            <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">Nama Lengkap</p>
                                            <p className="font-semibold text-gray-800">{dataKunjungan.nama_lengkap}</p>
                                        </div>
                                        <div className="px-6 py-4">
                                            <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">No. HP</p>
                                            <p className="font-semibold text-gray-800">{dataKunjungan.no_hp}</p>
                                        </div>
                                    </div>

                                    {/* Tanggal & Jam */}
                                    <div className="grid grid-cols-1 sm:grid-cols-2 divide-y sm:divide-y-0 sm:divide-x">
                                        <div className="px-6 py-4">
                                            <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">Tanggal Kunjungan</p>
                                            <p className="font-semibold text-gray-800">{formatDate(dataKunjungan.tanggal_kunjungan)}</p>
                                        </div>
                                        <div className="px-6 py-4">
                                            <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">Jam Kunjungan</p>
                                            <p className="font-semibold text-gray-800">{dataKunjungan.jam_label || dataKunjungan.jam_kunjungan}</p>
                                        </div>
                                    </div>

                                    {/* Tipe Kunjungan */}
                                    <div className="px-6 py-4">
                                        <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">Tipe Kunjungan</p>
                                        <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-semibold bg-green-100 text-green-700">
                                            {dataKunjungan.nama_tipe}
                                        </span>
                                    </div>

                                    {/* Jumlah Pengunjung */}
                                    <div className="px-6 py-4">
                                        <p className="text-xs text-gray-500 uppercase tracking-wide mb-3">Jumlah Pengunjung</p>
                                        <div className="flex flex-wrap gap-3">
                                            {dataKunjungan.nama_tipe !== 'Outing Class' ? (
                                                <>
                                                    <div className="flex items-center gap-2 bg-gray-50 px-4 py-2 rounded-xl border">
                                                        <FiUsers className="text-green-600" />
                                                        <span className="text-sm"><strong>{dataKunjungan.jumlah_dewasa}</strong> Dewasa</span>
                                                    </div>
                                                    <div className="flex items-center gap-2 bg-gray-50 px-4 py-2 rounded-xl border">
                                                        <FiUsers className="text-green-600" />
                                                        <span className="text-sm"><strong>{dataKunjungan.jumlah_anak}</strong> Anak (&gt;2 thn)</span>
                                                    </div>
                                                    <div className="flex items-center gap-2 bg-gray-50 px-4 py-2 rounded-xl border">
                                                        <FiUsers className="text-green-600" />
                                                        <span className="text-sm"><strong>{dataKunjungan.jumlah_balita}</strong> Balita</span>
                                                    </div>
                                                </>
                                            ) : (
                                                <div className="flex items-center gap-2 bg-gray-50 px-4 py-2 rounded-xl border">
                                                    <FiUsers className="text-green-600" />
                                                    <span className="text-sm"><strong>{dataKunjungan.jumlah_anak}</strong> Anak</span>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Ubah Data Button - Mobile Only */}
                            <button
                                onClick={() => window.history.back()}
                                className="lg:hidden w-full mt-4 inline-flex items-center justify-center gap-2 px-6 py-3 font-semibold rounded-xl border-2 border-gray-300 text-gray-600 bg-white hover:bg-gray-50 transition"
                            >
                                <FiEdit3 /> Ubah Data
                            </button>
                        </div>

                        {/* Right Column - Ringkasan Biaya (Sticky) */}
                        <div className="lg:col-span-1">
                            <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden lg:sticky lg:top-24">
                                <div className="px-6 py-4 border-b bg-gradient-to-r from-green-50 to-emerald-50">
                                    <h2 className="font-bold text-gray-800">Ringkasan Pembayaran</h2>
                                </div>

                                <div className="p-6 space-y-4">
                                    {/* Breakdown */}
                                    <div className="space-y-3 text-sm">
                                        <div className="flex justify-between">
                                            <span className="text-gray-600">Tipe Kunjungan</span>
                                            <span className="font-medium text-gray-800">{dataKunjungan.nama_tipe}</span>
                                        </div>
                                        {dataKunjungan.nama_tipe !== 'Outing Class' ? (
                                            <div className="flex justify-between">
                                                <span className="text-gray-600">Peserta berbayar</span>
                                                <span className="font-medium text-gray-800">{dataKunjungan.jumlah_dewasa + dataKunjungan.jumlah_anak} orang</span>
                                            </div>
                                        ) : (
                                            <div className="flex justify-between">
                                                <span className="text-gray-600">Jumlah anak</span>
                                                <span className="font-medium text-gray-800">{dataKunjungan.jumlah_anak} anak</span>
                                            </div>
                                        )}
                                    </div>

                                    {/* Divider */}
                                    <div className="border-t-2 border-dashed border-gray-200"></div>

                                    {/* Total */}
                                    <div className="bg-gradient-to-r from-green-50 to-emerald-50 -mx-6 px-6 py-4">
                                        <div className="flex justify-between items-center">
                                            <span className="font-bold text-gray-800">Total Bayar</span>
                                            <span className="text-2xl font-extrabold text-green-600">{formatCurrency(dataKunjungan.total_biaya)}</span>
                                        </div>
                                    </div>

                                    {/* Payment Info */}
                                    <div className="bg-blue-50 border border-blue-100 p-4 rounded-xl space-y-2">
                                        <div className="flex items-start gap-2">
                                            <FiCreditCard className="text-blue-600 mt-0.5 flex-shrink-0" />
                                            <div>
                                                <p className="text-sm font-semibold text-blue-800">Pembayaran Online</p>
                                                <p className="text-xs text-blue-600">Pembayaran dilakukan secara online melalui Midtrans.</p>
                                            </div>
                                        </div>
                                        <div className="flex items-start gap-2">
                                            <FiShield className="text-blue-600 mt-0.5 flex-shrink-0" />
                                            <p className="text-xs text-blue-600">Booking akan dikonfirmasi setelah pembayaran berhasil.</p>
                                        </div>
                                    </div>

                                    {/* Action Buttons */}
                                    <div className="space-y-3 pt-2">
                                        <button
                                            onClick={handleSubmit}
                                            disabled={processing}
                                            className="w-full inline-flex items-center justify-center gap-2 px-6 py-4 font-bold rounded-xl shadow-lg text-white bg-gradient-to-r from-green-600 to-emerald-500 hover:from-green-700 hover:to-emerald-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all hover:shadow-xl hover:scale-[1.02] active:scale-[0.98]"
                                        >
                                            <FiCreditCard className="text-lg" />
                                            {processing ? 'Memproses...' : 'Lanjut ke Pembayaran'}
                                        </button>

                                        <button
                                            onClick={() => window.history.back()}
                                            className="hidden lg:flex w-full items-center justify-center gap-2 px-6 py-3 font-semibold rounded-xl border-2 border-gray-200 text-gray-600 bg-white hover:bg-gray-50 hover:border-gray-300 transition"
                                        >
                                            <FiEdit3 /> Ubah Data
                                        </button>
                                    </div>

                                    {/* Trust Badges */}
                                    <div className="flex items-center justify-center gap-4 pt-2 opacity-60">
                                        <img src="https://upload.wikimedia.org/wikipedia/commons/a/a4/Midtrans_Logo.svg" alt="Midtrans" className="h-5" onError={(e) => e.target.style.display = 'none'} />
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </main>
        </CustomerLayout>
    );
}
