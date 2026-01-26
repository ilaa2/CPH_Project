import { Head, Link, router } from '@inertiajs/react';
import CustomerLayout from '@/Layouts/CustomerLayout';
import { FiCheck, FiClock, FiXCircle, FiRefreshCw, FiArrowRight } from 'react-icons/fi';
import { useState } from 'react';

export default function PaymentResult({ auth, type, orderId, transactionStatus, paymentStatus, data, redirectUrl }) {

    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('id-ID', {
            style: 'currency',
            currency: 'IDR',
            minimumFractionDigits: 0,
        }).format(amount);
    };

    const getStatusConfig = () => {
        switch (paymentStatus) {
            case 'paid':
                return {
                    icon: FiCheck,
                    iconBg: 'bg-green-100',
                    iconColor: 'text-green-600',
                    title: 'Pembayaran Berhasil!',
                    subtitle: type === 'pesanan'
                        ? 'Pesanan Anda sedang diproses.'
                        : 'Kunjungan Anda telah dijadwalkan.',
                    buttonText: 'Lihat Detail',
                    buttonColor: 'bg-green-500 hover:bg-green-600',
                };
            case 'pending':
                return {
                    icon: FiClock,
                    iconBg: 'bg-yellow-100',
                    iconColor: 'text-yellow-600',
                    title: 'Menunggu Pembayaran',
                    subtitle: 'Silakan selesaikan pembayaran Anda sesuai instruksi yang diberikan.',
                    buttonText: 'Cek Status',
                    buttonColor: 'bg-yellow-500 hover:bg-yellow-600',
                };
            case 'failed':
            case 'expired':
                return {
                    icon: FiXCircle,
                    iconBg: 'bg-red-100',
                    iconColor: 'text-red-600',
                    title: paymentStatus === 'expired' ? 'Pembayaran Kedaluwarsa' : 'Pembayaran Gagal',
                    subtitle: 'Silakan coba lagi atau gunakan metode pembayaran lain.',
                    buttonText: 'Bayar Ulang',
                    buttonColor: 'bg-red-500 hover:bg-red-600',
                    showRetry: true,
                };
            default:
                return {
                    icon: FiClock,
                    iconBg: 'bg-gray-100',
                    iconColor: 'text-gray-600',
                    title: 'Status Pembayaran',
                    subtitle: 'Silakan cek status pembayaran Anda.',
                    buttonText: 'Lihat Detail',
                    buttonColor: 'bg-gray-500 hover:bg-gray-600',
                };
        }
    };

    const config = getStatusConfig();
    const StatusIcon = config.icon;

    const [isRetrying, setIsRetrying] = useState(false);

    const handleRetryPayment = () => {
        // Validate data.id exists
        if (!data?.id) {
            alert('Data pesanan tidak lengkap. Mengarahkan ke halaman detail...');
            if (redirectUrl) {
                window.location.href = redirectUrl;
            }
            return;
        }

        setIsRetrying(true);

        const retryRoute = type === 'pesanan'
            ? route('customer.pesanan.retry-payment', data.id)
            : route('customer.kunjungan.retry-payment', data.id);

        // Use fetch to call API and get new token, then redirect to detail page
        // where the new token will be loaded from DB
        router.post(retryRoute, {}, {
            preserveState: false,
            preserveScroll: false,
            onSuccess: () => {
                // After retry success, redirect to detail page where token is fresh from DB
                // The detail page (Show.jsx) will auto-trigger payment popup
                setIsRetrying(false);
                window.location.href = redirectUrl + '?autoPayment=1';
            },
            onError: (errors) => {
                setIsRetrying(false);
                console.error('Retry payment error:', errors);
                alert('Gagal membuat token baru. Silakan coba lagi.');
            }
        });
    };

    return (
        <CustomerLayout auth={auth}>
            <Head title={config.title} />

            <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-100 py-12 flex items-center justify-center">
                <div className="max-w-lg w-full mx-4">
                    <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
                        {/* Status Icon */}
                        <div className="pt-10 pb-6 text-center">
                            <div className={`w-20 h-20 ${config.iconBg} rounded-full flex items-center justify-center mx-auto mb-6`}>
                                <StatusIcon className={`w-10 h-10 ${config.iconColor}`} />
                            </div>
                            <h1 className="text-2xl font-bold text-gray-800">{config.title}</h1>
                            <p className="text-gray-500 mt-2 px-6">{config.subtitle}</p>
                        </div>

                        {/* Order Info */}
                        <div className="px-6 pb-6">
                            <div className="bg-gray-50 rounded-xl p-4 mb-6">
                                <div className="space-y-3 text-sm">
                                    <div className="flex justify-between">
                                        <span className="text-gray-500">Order ID</span>
                                        <span className="font-mono text-gray-800">{orderId}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-gray-500">Tipe</span>
                                        <span className="font-medium capitalize">{type}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-gray-500">Total</span>
                                        <span className="font-bold text-green-600">
                                            {formatCurrency(type === 'pesanan' ? data?.total : data?.total_biaya)}
                                        </span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-gray-500">Status Pembayaran</span>
                                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${paymentStatus === 'paid' ? 'bg-green-100 text-green-700' :
                                            paymentStatus === 'pending' ? 'bg-yellow-100 text-yellow-700' :
                                                'bg-red-100 text-red-700'
                                            }`}>
                                            {paymentStatus === 'paid' ? 'Lunas' :
                                                paymentStatus === 'pending' ? 'Pending' :
                                                    paymentStatus === 'expired' ? 'Kedaluwarsa' : 'Gagal'}
                                        </span>
                                    </div>
                                </div>
                            </div>

                            {/* Action Buttons */}
                            <div className="space-y-3">
                                {config.showRetry && (
                                    <button
                                        onClick={handleRetryPayment}
                                        className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-green-500 text-white rounded-lg hover:bg-green-600 transition font-medium"
                                    >
                                        <FiRefreshCw className="w-5 h-5" />
                                        Bayar Ulang
                                    </button>
                                )}

                                <Link
                                    href={redirectUrl}
                                    className={`w-full flex items-center justify-center gap-2 px-6 py-3 ${config.showRetry ? 'border border-gray-300 text-gray-700 hover:bg-gray-50' : config.buttonColor + ' text-white'} rounded-lg transition font-medium`}
                                >
                                    {config.buttonText}
                                    <FiArrowRight className="w-5 h-5" />
                                </Link>

                                <Link
                                    href="/"
                                    className="w-full block text-center text-gray-500 hover:text-gray-700 py-2 text-sm"
                                >
                                    Kembali ke Beranda
                                </Link>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </CustomerLayout>
    );
}
