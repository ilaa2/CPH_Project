import React, { useState, useEffect } from 'react';
import { Head, Link, router, usePage } from '@inertiajs/react';
import CustomerLayout from '@/Layouts/CustomerLayout';
import Swal from 'sweetalert2';
import {
    FiArrowLeft, FiCalendar, FiClock, FiUsers, FiTag,
    FiCheckCircle, FiStar, FiCreditCard, FiAlertCircle,
    FiMapPin, FiDollarSign, FiFileText, FiRefreshCw, FiAlertTriangle
} from 'react-icons/fi';

// Review Card Component
const UlasanCard = ({ ulasan }) => (
    <div className="mt-6 p-5 bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl border border-green-200">
        <div className="flex justify-between items-start gap-4">
            <div className="flex-1">
                <h3 className="text-base font-semibold text-green-800 mb-2 flex items-center gap-2">
                    <FiStar className="text-yellow-500" />
                    Ulasan Anda
                </h3>
                <div className="flex gap-1 mb-2">
                    {[...Array(5)].map((_, i) => (
                        <FiStar key={i} className={`w-4 h-4 ${i < ulasan.rating ? 'text-yellow-400 fill-current' : 'text-gray-300'}`} />
                    ))}
                </div>
                <p className="text-gray-700 text-sm italic">"{ulasan.komentar}"</p>
            </div>
            {ulasan.fotos && ulasan.fotos.length > 0 && (
                <img
                    src={`/storage/${ulasan.fotos[0].foto_path}`}
                    alt="Foto Ulasan"
                    className="h-20 w-20 object-cover rounded-lg flex-shrink-0 border border-green-100"
                />
            )}
        </div>
        {/* Balasan Admin */}
        {ulasan.balasan && (
            <div className="mt-4 pl-4 border-l-4 border-green-500 bg-white/70 p-3 rounded-r-lg">
                <p className="text-xs font-bold text-green-800 mb-1">
                    Balasan Penjual {ulasan.tanggal_balasan && `(${new Date(ulasan.tanggal_balasan).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })})`}
                </p>
                <p className="text-sm text-gray-700">"{ulasan.balasan}"</p>
            </div>
        )}
    </div>
);

export default function KunjunganShow({ auth, kunjungan }) {
    const { flash } = usePage().props;
    const [isProcessing, setIsProcessing] = useState(false);

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

    // Status Configuration
    const getStatusConfig = () => {
        const status = kunjungan.status;
        const paymentStatus = kunjungan.payment_status;

        if (status === 'Selesai') {
            return {
                headerBg: 'bg-gradient-to-r from-green-600 to-teal-600',
                icon: FiCheckCircle,
                iconColor: 'text-white',
                title: 'Kunjungan Selesai',
                subtitle: 'Kunjungan telah selesai. Terima kasih atas kedatangan Anda!',
                badgeColor: 'bg-white/20 text-white border border-white/30',
                badgeText: 'SELESAI',
                showPayButton: false,
            };
        }

        if (status === 'Menunggu Pembayaran' || paymentStatus === 'pending' || paymentStatus === 'unpaid') {
            return {
                headerBg: 'bg-gradient-to-r from-yellow-500 to-amber-600',
                icon: FiClock,
                iconColor: 'text-white',
                title: 'Menunggu Pembayaran',
                subtitle: 'Silakan selesaikan pembayaran untuk konfirmasi kunjungan.',
                badgeColor: 'bg-yellow-100 text-yellow-700',
                badgeText: 'BELUM LUNAS',
                showPayButton: true,
            };
        }

        return {
            headerBg: 'bg-gradient-to-r from-green-600 to-teal-600',
            icon: FiCalendar,
            iconColor: 'text-white',
            title: 'Kunjungan Dijadwalkan',
            subtitle: 'Sampai jumpa di lokasi pada waktu yang ditentukan.',
            badgeColor: 'bg-white/20 text-white border border-white/30',
            badgeText: 'DIJADWALKAN',
            showPayButton: false,
        };
    };

    const config = getStatusConfig();
    const StatusIcon = config.icon;

    const handlePayNow = () => {
        router.visit(route('customer.kunjungan.payment', kunjungan.id));
    };

    return (
        <CustomerLayout auth={auth}>
            <Head title="Detail Kunjungan" />

            <main className="bg-gray-50 min-h-screen py-6 sm:py-8">
                <div className="max-w-4xl mx-auto px-4">

                    {/* Back Button */}
                    <Link
                        href={route('customer.pesanan.index')} // Using same history route if merged, or specialized one
                        className="inline-flex items-center gap-2 px-3 py-1.5 bg-white rounded-full shadow-sm border border-gray-200 text-xs font-medium text-gray-700 hover:bg-gray-50 hover:shadow transition-all mb-4 group"
                    >
                        <FiArrowLeft className="text-green-600 group-hover:-translate-x-1 transition-transform" />
                        <span>Kembali ke Riwayat</span>
                    </Link>

                    <div className="bg-white rounded-2xl shadow-xl overflow-hidden">

                        {/* Dynamic Header */}
                        <div className={`${config.headerBg} p-5 sm:p-6 text-center text-white`}>
                            <StatusIcon className={`${config.iconColor} text-4xl mx-auto mb-3`} />
                            <h1 className="text-xl sm:text-2xl font-bold tracking-tight">{config.title}</h1>
                            <p className="text-white/90 mt-1 text-sm">{config.subtitle}</p>

                            <div className="mt-3">
                                <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-bold ${config.badgeColor}`}>
                                    {config.badgeText}
                                </span>
                            </div>
                        </div>

                        {/* Action Buttons for Pending */}
                        {config.showPayButton && (
                            <div className="bg-gray-50 border-b p-4">
                                <div className="flex justify-center">
                                    <button
                                        onClick={handlePayNow}
                                        className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-2 bg-green-600 text-white font-bold rounded-lg hover:bg-green-700 transition-all shadow hover:shadow-md"
                                    >
                                        <FiCreditCard className="w-4 h-4" />
                                        Bayar Sekarang
                                    </button>
                                </div>
                            </div>
                        )}

                        {/* Content */}
                        <div className="p-5 sm:p-6">
                            {flash?.success && (
                                <div className="bg-green-100 border-l-4 border-green-500 text-green-800 p-3 rounded text-sm mb-4">
                                    <p>{flash.success}</p>
                                </div>
                            )}

                            {/* Info Grid (Pelanggan & Kunjungan) */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                                {/* Using similar structure to Order Detail */}
                                <div className="bg-gray-50 rounded-lg p-3">
                                    <h3 className="font-semibold text-gray-800 text-sm flex items-center mb-2">
                                        <FiUsers className="mr-2 text-green-500 w-4 h-4" />
                                        Info Pelanggan & Booking
                                    </h3>
                                    <div className="flex flex-col gap-3">
                                        <div>
                                            <p className="text-gray-600 text-sm font-medium">{kunjungan.user?.name || '-'}</p>
                                            <p className="text-xs text-gray-500">{kunjungan.user?.email || '-'}</p>
                                        </div>

                                        <div className="pt-2 border-t border-gray-100 flex flex-col gap-1.5">
                                            <div className="flex flex-col gap-0.5">
                                                <span className="text-[10px] text-gray-500">No. Pembayaran</span>
                                                <span className="font-mono text-green-600 text-sm font-bold">
                                                    {kunjungan.midtrans_order_id || '-'}
                                                </span>
                                            </div>

                                            <div className="flex flex-col gap-0.5">
                                                <span className="text-[10px] text-gray-500">Tanggal Booking</span>
                                                <span className="text-xs text-gray-700">{formatDate(kunjungan.created_at)}</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Visit Detail Card */}
                                <div className="bg-gray-50 rounded-lg p-3 flex flex-col justify-between">
                                    <div>
                                        <h3 className="font-semibold text-gray-800 text-sm flex items-center mb-2">
                                            <FiTag className="mr-2 text-green-500 w-4 h-4" />
                                            Detail Kunjungan
                                        </h3>
                                        <div className="space-y-2">
                                            <div className="flex justify-between">
                                                <span className="text-xs text-gray-500">Tipe</span>
                                                <span className="text-sm font-medium text-gray-800">{kunjungan.tipe?.nama_tipe}</span>
                                            </div>
                                            <div className="flex justify-between">
                                                <span className="text-xs text-gray-500">Tanggal</span>
                                                <span className="text-sm font-medium text-gray-800">{formatDate(kunjungan.tanggal)}</span>
                                            </div>
                                            <div className="flex justify-between">
                                                <span className="text-xs text-gray-500">Jam</span>
                                                <span className="text-sm font-medium text-gray-800">{formatTime(kunjungan.jam)}</span>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Invoice Link */}
                                    {kunjungan.payment_status === 'paid' && (
                                        <div className="mt-3 pt-2 border-t border-dashed border-gray-200 text-right">
                                            <a
                                                href={route('customer.kunjungan.invoice', kunjungan.id)}
                                                className="inline-flex items-center text-xs font-medium text-indigo-600 hover:text-indigo-800 transition-colors"
                                                target="_blank"
                                                rel="noopener noreferrer"
                                            >
                                                <FiFileText className="mr-1.5 w-3 h-3" />
                                                Lihat Invoice
                                            </a>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Rincian Peserta */}
                            <h3 className="font-semibold text-lg text-gray-800 flex items-center mb-4">
                                <FiUsers className="mr-2 text-green-500" />
                                Rincian Peserta
                            </h3>
                            <ul className="divide-y divide-gray-100 border rounded-xl overflow-hidden mb-6">
                                {/* Dewasa */}
                                <li className="flex items-center justify-between p-4 bg-white hover:bg-gray-50">
                                    <div>
                                        <p className="font-semibold text-gray-800">Dewasa</p>
                                        <p className="text-xs text-gray-500">Umur &gt; 12 tahun</p>
                                    </div>
                                    <p className="font-semibold text-gray-900">{kunjungan.jumlah_dewasa} Orang</p>
                                </li>
                                {/* Anak */}
                                <li className="flex items-center justify-between p-4 bg-white hover:bg-gray-50">
                                    <div>
                                        <p className="font-semibold text-gray-800">Anak-anak</p>
                                        <p className="text-xs text-gray-500">Umur 5-12 tahun</p>
                                        {/* Special Note for Outing Class */}
                                        {kunjungan.tipe?.nama_tipe === 'Outing Class' && (
                                            <div className="mt-1 inline-flex items-center px-2 py-0.5 rounded text-[10px] font-medium bg-green-100 text-green-700">
                                                <FiCheckCircle className="mr-1 w-3 h-3" />
                                                Termasuk Paket Edukasi & Buket Sayur
                                            </div>
                                        )}
                                    </div>
                                    <p className="font-semibold text-gray-900">{kunjungan.jumlah_anak} Orang</p>
                                </li>
                                {/* Balita */}
                                {(kunjungan.jumlah_balita > 0) && (
                                    <li className="flex items-center justify-between p-4 bg-white hover:bg-gray-50">
                                        <div>
                                            <p className="font-semibold text-gray-800">Balita</p>
                                            <p className="text-xs text-gray-500">Umur &lt; 5 tahun (Gratis)</p>
                                        </div>
                                        <p className="font-semibold text-gray-900">{kunjungan.jumlah_balita} Orang</p>
                                    </li>
                                )}
                            </ul>

                            {/* Payment Summary */}
                            <div className="bg-gray-50 rounded-xl p-4">
                                <h4 className="font-semibold text-gray-800 mb-3">Ringkasan Pembayaran</h4>
                                <div className="space-y-2 text-sm">
                                    {kunjungan.tipe?.nama_tipe === 'Outing Class' ? (
                                        <>
                                            {kunjungan.jumlah_anak < 30 ? (
                                                <div className="flex justify-between">
                                                    <span className="text-gray-600">Paket Outing Class ({kunjungan.jumlah_anak} Anak)</span>
                                                    <span className="text-gray-800">{formatCurrency(300000)}</span>
                                                </div>
                                            ) : (
                                                <div className="flex justify-between">
                                                    <span className="text-gray-600">Anak-anak ({kunjungan.jumlah_anak} × {formatCurrency(10000)})</span>
                                                    <span className="text-gray-800">{formatCurrency(kunjungan.jumlah_anak * 10000)}</span>
                                                </div>
                                            )}
                                            {kunjungan.jumlah_dewasa > 0 && (
                                                <div className="flex justify-between">
                                                    <span className="text-gray-600">Guru/Pendamping ({kunjungan.jumlah_dewasa} Orang)</span>
                                                    <span className="text-green-600 font-medium">Gratis</span>
                                                </div>
                                            )}
                                        </>
                                    ) : kunjungan.tipe?.nama_tipe === 'Umum' ? (
                                        <>
                                            <>
                                                {(() => {
                                                    // Check if this uses legacy pricing (10k flat)
                                                    // New pricing: 15k adult, 10k child
                                                    // Old pricing: 10k adult, 10k child
                                                    const expectedNewTotal = (kunjungan.jumlah_dewasa * 15000) + (kunjungan.jumlah_anak * 10000);
                                                    const isLegacyPricing = parseInt(kunjungan.total_biaya) !== expectedNewTotal;
                                                    const adultPrice = isLegacyPricing ? 10000 : 15000;

                                                    return (
                                                        <>
                                                            {kunjungan.jumlah_dewasa > 0 && (
                                                                <div className="flex justify-between">
                                                                    <span className="text-gray-600">Dewasa ({kunjungan.jumlah_dewasa} × {formatCurrency(adultPrice)})</span>
                                                                    <span className="text-gray-800">{formatCurrency(kunjungan.jumlah_dewasa * adultPrice)}</span>
                                                                </div>
                                                            )}
                                                            {kunjungan.jumlah_anak > 0 && (
                                                                <div className="flex justify-between">
                                                                    <span className="text-gray-600">Anak-anak ({kunjungan.jumlah_anak} × {formatCurrency(10000)})</span>
                                                                    <span className="text-gray-800">{formatCurrency(kunjungan.jumlah_anak * 10000)}</span>
                                                                </div>
                                                            )}
                                                            {kunjungan.jumlah_balita > 0 && (
                                                                <div className="flex justify-between">
                                                                    <span className="text-gray-600">Balita ({kunjungan.jumlah_balita} Orang)</span>
                                                                    <span className="text-green-600 font-medium">Gratis</span>
                                                                </div>
                                                            )}
                                                        </>
                                                    );
                                                })()}
                                            </>
                                        </>
                                    ) : (
                                        <>
                                            {kunjungan.jumlah_dewasa > 0 && (
                                                <div className="flex justify-between">
                                                    <span className="text-gray-600">Dewasa ({kunjungan.jumlah_dewasa} × {formatCurrency(kunjungan.tipe?.biaya || 0)})</span>
                                                    <span className="text-gray-800">{formatCurrency(kunjungan.jumlah_dewasa * (kunjungan.tipe?.biaya || 0))}</span>
                                                </div>
                                            )}
                                            {kunjungan.jumlah_anak > 0 && (
                                                <div className="flex justify-between">
                                                    <span className="text-gray-600">Anak-anak ({kunjungan.jumlah_anak} × {formatCurrency(kunjungan.tipe?.biaya || 0)})</span>
                                                    <span className="text-gray-800">{formatCurrency(kunjungan.jumlah_anak * (kunjungan.tipe?.biaya || 0))}</span>
                                                </div>
                                            )}
                                            {kunjungan.jumlah_balita > 0 && (
                                                <div className="flex justify-between">
                                                    <span className="text-gray-600">Balita ({kunjungan.jumlah_balita} × {formatCurrency(kunjungan.tipe?.biaya || 0)})</span>
                                                    <span className="text-gray-800">{formatCurrency(kunjungan.jumlah_balita * (kunjungan.tipe?.biaya || 0))}</span>
                                                </div>
                                            )}
                                        </>
                                    )}
                                    <div className="flex justify-between items-center pt-2 border-t border-gray-200 mt-2">
                                        <span className="font-bold text-gray-900">Total Biaya</span>
                                        <span className="font-bold text-green-600 text-lg">
                                            {formatCurrency(kunjungan.total_biaya)}
                                        </span>
                                    </div>
                                </div>
                            </div>

                            {/* Completion Button for Scheduled Visits */}
                            {kunjungan.status === 'Dijadwalkan' && kunjungan.payment_status === 'paid' && (
                                <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-xl">
                                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                                        <div className="flex items-center gap-2 text-blue-800">
                                            <FiCheckCircle className="w-5 h-5 flex-shrink-0" />
                                            <div className="text-sm">
                                                <p className="font-semibold">Kunjungan Selesai?</p>
                                                <p className="text-xs text-blue-600 mt-0.5">Konfirmasi jika Anda sudah selesai melakukan kunjungan.</p>
                                            </div>
                                        </div>
                                        <button
                                            onClick={() => {
                                                Swal.fire({
                                                    title: 'Selesaikan Kunjungan?',
                                                    text: "Pastikan Anda sudah selesai melakukan kunjungan. Status akan diubah menjadi Selesai.",
                                                    icon: 'question',
                                                    showCancelButton: true,
                                                    confirmButtonColor: '#059669',
                                                    cancelButtonColor: '#d33',
                                                    confirmButtonText: 'Ya, Selesai',
                                                    cancelButtonText: 'Batal'
                                                }).then((result) => {
                                                    if (result.isConfirmed) {
                                                        router.post(route('customer.kunjungan.complete', kunjungan.id));
                                                    }
                                                });
                                            }}
                                            className="inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-green-600 text-white font-semibold rounded-lg shadow-md hover:bg-green-700 hover:shadow-lg transition-all"
                                        >
                                            <FiCheckCircle />
                                            Selesaikan Kunjungan
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

                        {/* Footer Actions */}
                        <div className="bg-gray-50 border-t p-4 sm:p-6">
                            <div className="flex flex-col sm:flex-row gap-3 justify-center">
                                <Link
                                    href={route('kunjungan.index')}
                                    className="text-center px-6 py-3 border border-gray-300 text-gray-700 font-semibold rounded-xl hover:bg-gray-100 transition"
                                >
                                    Booking Lagi
                                </Link>
                                <Link
                                    href={route('customer.pesanan.index') + '#kunjungan'}
                                    className="text-center px-6 py-3 border border-gray-300 text-gray-700 font-semibold rounded-xl hover:bg-gray-100 transition"
                                >
                                    Lihat Semua Kunjungan
                                </Link>
                            </div>
                        </div>
                    </div>
                </div>
            </main>
        </CustomerLayout>
    );
}
