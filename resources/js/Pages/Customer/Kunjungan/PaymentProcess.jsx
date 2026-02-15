import { Head, router } from '@inertiajs/react';
import { useEffect, useState } from 'react';
import axios from 'axios';
import CustomerLayout from '@/Layouts/CustomerLayout';
import { FiCreditCard, FiCheck, FiAlertCircle, FiRefreshCw, FiCalendar } from 'react-icons/fi';

export default function PaymentProcess({ auth, kunjungan, snapToken, clientKey, snapUrl }) {
    const [paymentStatus, setPaymentStatus] = useState('waiting');
    const [isSnapLoaded, setIsSnapLoaded] = useState(false);

    useEffect(() => {
        if (snapToken && clientKey) {
            const script = document.createElement('script');
            script.src = snapUrl;
            script.setAttribute('data-client-key', clientKey);
            script.onload = () => setIsSnapLoaded(true);
            document.body.appendChild(script);
            return () => document.body.removeChild(script);
        }
    }, [snapToken, clientKey, snapUrl]);

    useEffect(() => {
        if (isSnapLoaded && snapToken && window.snap) {
            triggerPayment();
        }
    }, [isSnapLoaded, snapToken]);

    const triggerPayment = () => {
        if (!window.snap) return;

        window.snap.pay(snapToken, {
            onSuccess: function (result) {
                console.log('Payment Success:', result);
                setPaymentStatus('success');
                // Update status di backend langsung setelah pembayaran sukses
                axios.post(route('customer.kunjungan.confirm-payment', kunjungan.id))
                    .then(() => {
                        setTimeout(() => {
                            router.visit(route('customer.kunjungan.show', kunjungan.id));
                        }, 1500);
                    })
                    .catch((err) => {
                        console.error('Failed to confirm payment:', err);
                        // Tetap redirect meskipun gagal update (webhook akan handle)
                        setTimeout(() => {
                            router.visit(route('customer.kunjungan.show', kunjungan.id));
                        }, 1500);
                    });
            },
            onPending: function (result) {
                console.log('Payment Pending:', result);
                setPaymentStatus('pending');
            },
            onError: function (result) {
                console.log('Payment Error:', result);
                setPaymentStatus('error');
            },
            onClose: function () {
                if (paymentStatus === 'waiting') {
                    setPaymentStatus('cancelled');
                }
            }
        });
    };

    const handleRetryPayment = () => {
        setPaymentStatus('waiting');
        triggerPayment();
    };

    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('id-ID', {
            style: 'currency',
            currency: 'IDR',
            minimumFractionDigits: 0,
        }).format(amount);
    };

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString('id-ID', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    };

    return (
        <CustomerLayout auth={auth}>
            <Head title="Pembayaran Kunjungan" />

            <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-100 py-12">
                <div className="max-w-2xl mx-auto px-4">
                    <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
                        {/* Header */}
                        <div className="bg-gradient-to-r from-emerald-500 to-teal-600 px-6 py-8 text-center text-white">
                            <FiCalendar className="w-16 h-16 mx-auto mb-4" />
                            <h1 className="text-2xl font-bold">Pembayaran Kunjungan</h1>
                            <p className="text-emerald-100 mt-2">ID: {kunjungan?.midtrans_order_id}</p>
                        </div>

                        {/* Content */}
                        <div className="p-6">
                            {/* Visit Summary */}
                            <div className="bg-gray-50 rounded-xl p-4 mb-6">
                                <h3 className="font-semibold text-gray-800 mb-3">Detail Kunjungan</h3>
                                <div className="space-y-2 text-sm">
                                    <div className="flex justify-between">
                                        <span className="text-gray-600">Tipe Kunjungan</span>
                                        <span className="font-medium">{kunjungan?.tipe?.nama_tipe}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-gray-600">Tanggal</span>
                                        <span className="font-medium">{formatDate(kunjungan?.tanggal)}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-gray-600">Jam</span>
                                        <span className="font-medium">{kunjungan?.jam}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-gray-600">Pengunjung</span>
                                        <span className="font-medium">
                                            {kunjungan?.tipe?.nama_tipe === 'Outing Class'
                                                ? `${kunjungan?.jumlah_anak || 0} Anak`
                                                : `${kunjungan?.jumlah_dewasa || 0} Dewasa, ${kunjungan?.jumlah_anak || 0} Anak`
                                            }
                                        </span>
                                    </div>
                                    {kunjungan?.tipe?.nama_tipe === 'Outing Class' && (
                                        <p className="text-xs text-gray-500 text-right">* Guru/pendamping gratis masuk</p>
                                    )}
                                    <div className="flex justify-between pt-2 border-t text-lg font-bold text-green-600">
                                        <span>Total Biaya</span>
                                        <span>{formatCurrency(kunjungan?.total_biaya)}</span>
                                    </div>
                                </div>
                            </div>

                            {/* Payment Status */}
                            {paymentStatus === 'waiting' && (
                                <div className="text-center py-8">
                                    <div className="animate-spin w-12 h-12 border-4 border-green-500 border-t-transparent rounded-full mx-auto mb-4"></div>
                                    <p className="text-gray-600">Menunggu pembayaran...</p>
                                    {isSnapLoaded && (
                                        <button
                                            onClick={triggerPayment}
                                            className="mt-4 px-6 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition"
                                        >
                                            Buka Pembayaran
                                        </button>
                                    )}
                                </div>
                            )}

                            {paymentStatus === 'success' && (
                                <div className="text-center py-8">
                                    <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                        <FiCheck className="w-8 h-8 text-green-600" />
                                    </div>
                                    <h3 className="text-xl font-bold text-green-600 mb-2">Pembayaran Berhasil!</h3>
                                    <p className="text-gray-600">Kunjungan Anda telah dijadwalkan.</p>
                                    <p className="text-sm text-gray-400 mt-2">Mengalihkan ke halaman detail...</p>
                                </div>
                            )}

                            {paymentStatus === 'pending' && (
                                <div className="text-center py-8">
                                    <div className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                        <FiAlertCircle className="w-8 h-8 text-yellow-600" />
                                    </div>
                                    <h3 className="text-xl font-bold text-yellow-600 mb-2">Menunggu Pembayaran</h3>
                                    <p className="text-gray-600">Silakan selesaikan pembayaran Anda.</p>
                                    <button
                                        onClick={() => router.visit(route('customer.kunjungan.show', kunjungan.id))}
                                        className="mt-4 px-6 py-2 bg-yellow-500 text-white rounded-lg hover:bg-yellow-600 transition"
                                    >
                                        Lihat Status Kunjungan
                                    </button>
                                </div>
                            )}

                            {(paymentStatus === 'error' || paymentStatus === 'cancelled') && (
                                <div className="text-center py-8">
                                    <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                        <FiAlertCircle className="w-8 h-8 text-red-600" />
                                    </div>
                                    <h3 className="text-xl font-bold text-red-600 mb-2">
                                        {paymentStatus === 'cancelled' ? 'Pembayaran Dibatalkan' : 'Pembayaran Gagal'}
                                    </h3>
                                    <p className="text-gray-600 mb-4">Silakan coba lagi.</p>
                                    <div className="flex gap-3 justify-center">
                                        <button
                                            onClick={handleRetryPayment}
                                            className="flex items-center gap-2 px-6 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition"
                                        >
                                            <FiRefreshCw className="w-4 h-4" />
                                            Coba Lagi
                                        </button>
                                        <button
                                            onClick={() => router.visit(route('kunjungan.index'))}
                                            className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition"
                                        >
                                            Kembali
                                        </button>
                                    </div>
                                </div>
                            )}

                            {!snapToken && (
                                <div className="text-center py-8">
                                    <div className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                        <FiAlertCircle className="w-8 h-8 text-yellow-600" />
                                    </div>
                                    <h3 className="text-xl font-bold text-yellow-600 mb-2">Payment Gateway Tidak Tersedia</h3>
                                    <p className="text-gray-600 mb-4">Kunjungan Anda tetap tercatat. Silakan hubungi admin.</p>
                                    <button
                                        onClick={() => router.visit(route('customer.kunjungan.show', kunjungan.id))}
                                        className="px-6 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition"
                                    >
                                        Lihat Kunjungan
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </CustomerLayout>
    );
}
