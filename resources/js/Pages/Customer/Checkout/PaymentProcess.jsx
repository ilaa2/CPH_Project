import { Head, router } from '@inertiajs/react';
import { useEffect, useState } from 'react';
import CustomerLayout from '@/Layouts/CustomerLayout';
import { FiCreditCard, FiCheck, FiAlertCircle, FiRefreshCw } from 'react-icons/fi';

export default function PaymentProcess({ auth, pesanan, snapToken, clientKey, snapUrl }) {
    const [paymentStatus, setPaymentStatus] = useState('waiting'); // waiting, success, pending, error
    const [isSnapLoaded, setIsSnapLoaded] = useState(false);

    useEffect(() => {
        // Load Midtrans Snap.js
        if (snapToken && clientKey) {
            const script = document.createElement('script');
            script.src = snapUrl;
            script.setAttribute('data-client-key', clientKey);
            script.onload = () => {
                setIsSnapLoaded(true);
            };
            document.body.appendChild(script);

            return () => {
                document.body.removeChild(script);
            };
        }
    }, [snapToken, clientKey, snapUrl]);

    useEffect(() => {
        // Auto-trigger payment popup when Snap is loaded
        if (isSnapLoaded && snapToken && window.snap) {
            triggerPayment();
        }
    }, [isSnapLoaded, snapToken]);

    const triggerPayment = () => {
        if (!window.snap) {
            console.error('Midtrans Snap not loaded');
            return;
        }

        window.snap.pay(snapToken, {
            onSuccess: function (result) {
                console.log('Payment Success:', result);
                setPaymentStatus('success');
                // Redirect to order detail after short delay
                setTimeout(() => {
                    router.visit(route('customer.pesanan.show', pesanan.id));
                }, 2000);
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
                console.log('Payment popup closed');
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

    return (
        <CustomerLayout auth={auth}>
            <Head title="Proses Pembayaran" />

            <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-100 py-12">
                <div className="max-w-2xl mx-auto px-4">
                    <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
                        {/* Header */}
                        <div className="bg-gradient-to-r from-green-500 to-emerald-600 px-6 py-8 text-center text-white">
                            <FiCreditCard className="w-16 h-16 mx-auto mb-4" />
                            <h1 className="text-2xl font-bold">Proses Pembayaran</h1>
                            <p className="text-green-100 mt-2">Order: {pesanan?.nomor_pesanan}</p>
                        </div>

                        {/* Content */}
                        <div className="p-6">
                            {/* Order Summary */}
                            <div className="bg-gray-50 rounded-xl p-4 mb-6">
                                <h3 className="font-semibold text-gray-800 mb-3">Ringkasan Pesanan</h3>
                                <div className="space-y-2 text-sm">
                                    {pesanan?.items?.map((item, idx) => (
                                        <div key={idx} className="flex justify-between">
                                            <span className="text-gray-600">
                                                {item.produk?.nama || 'Produk'} x{item.jumlah}
                                            </span>
                                            <span className="font-medium">{formatCurrency(item.subtotal)}</span>
                                        </div>
                                    ))}
                                    {pesanan?.biaya_pengiriman > 0 && (
                                        <div className="flex justify-between pt-2 border-t">
                                            <span className="text-gray-600">Ongkos Kirim</span>
                                            <span className="font-medium">{formatCurrency(pesanan.biaya_pengiriman)}</span>
                                        </div>
                                    )}
                                    <div className="flex justify-between pt-2 border-t text-lg font-bold text-green-600">
                                        <span>Total</span>
                                        <span>{formatCurrency(pesanan?.total)}</span>
                                    </div>
                                </div>
                            </div>

                            {/* Payment Status */}
                            {paymentStatus === 'waiting' && (
                                <div className="text-center py-8">
                                    <div className="animate-spin w-12 h-12 border-4 border-green-500 border-t-transparent rounded-full mx-auto mb-4"></div>
                                    <p className="text-gray-600">Menunggu pembayaran...</p>
                                    <p className="text-sm text-gray-400 mt-2">Popup pembayaran akan muncul otomatis</p>
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
                                    <p className="text-gray-600">Terima kasih, pesanan Anda sedang diproses.</p>
                                    <p className="text-sm text-gray-400 mt-2">Mengalihkan ke halaman pesanan...</p>
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
                                        onClick={() => router.visit(route('customer.pesanan.show', pesanan.id))}
                                        className="mt-4 px-6 py-2 bg-yellow-500 text-white rounded-lg hover:bg-yellow-600 transition"
                                    >
                                        Lihat Status Pesanan
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
                                    <p className="text-gray-600 mb-4">Silakan coba lagi atau gunakan metode pembayaran lain.</p>
                                    <div className="flex gap-3 justify-center">
                                        <button
                                            onClick={handleRetryPayment}
                                            className="flex items-center gap-2 px-6 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition"
                                        >
                                            <FiRefreshCw className="w-4 h-4" />
                                            Coba Lagi
                                        </button>
                                        <button
                                            onClick={() => router.visit(route('customer.pesanan.show', pesanan.id))}
                                            className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition"
                                        >
                                            Lihat Pesanan
                                        </button>
                                    </div>
                                </div>
                            )}

                            {/* No Snap Token Fallback */}
                            {!snapToken && (
                                <div className="text-center py-8">
                                    <div className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                        <FiAlertCircle className="w-8 h-8 text-yellow-600" />
                                    </div>
                                    <h3 className="text-xl font-bold text-yellow-600 mb-2">Payment Gateway Tidak Tersedia</h3>
                                    <p className="text-gray-600 mb-4">Pesanan Anda tetap tercatat. Silakan hubungi admin untuk konfirmasi pembayaran.</p>
                                    <button
                                        onClick={() => router.visit(route('customer.pesanan.show', pesanan.id))}
                                        className="px-6 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition"
                                    >
                                        Lihat Pesanan
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
