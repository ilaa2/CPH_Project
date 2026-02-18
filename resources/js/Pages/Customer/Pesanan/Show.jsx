import React, { useEffect, useState } from 'react';
import { Head, Link, router, usePage } from '@inertiajs/react';
import CustomerLayout from '@/Layouts/CustomerLayout';
import Swal from 'sweetalert2';
import {
    FiCheckCircle, FiClock, FiXCircle, FiUser, FiTruck, FiArchive,
    FiRefreshCw, FiCreditCard, FiArrowLeft, FiAlertTriangle,
    FiCopy, FiCheck, FiDownload, FiFileText, FiStar
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

export default function Show({ pesanan, auth }) {
    const { flash } = usePage().props;
    const [isSnapLoaded, setIsSnapLoaded] = useState(false);
    const [isProcessing, setIsProcessing] = useState(false);
    const [currentSnapToken, setCurrentSnapToken] = useState(pesanan.snap_token);
    const [autoPaymentTriggered, setAutoPaymentTriggered] = useState(false);

    // Load Midtrans Snap script once
    useEffect(() => {
        const snapUrl = 'https://app.sandbox.midtrans.com/snap/snap.js';
        const clientKey = pesanan.client_key;

        if (!clientKey) return;

        const existingScript = document.querySelector(`script[src="${snapUrl}"]`);
        if (!existingScript) {
            const script = document.createElement('script');
            script.src = snapUrl;
            script.setAttribute('data-client-key', clientKey);
            script.async = true;
            script.onload = () => {
                console.log('Snap.js loaded successfully');
                setIsSnapLoaded(true);
            };
            script.onerror = () => console.error('Failed to load Snap.js');
            document.head.appendChild(script);
        } else {
            setIsSnapLoaded(true);
        }
    }, [pesanan.client_key]);

    // Check URL for autoPayment parameter (from retry payment redirect)
    // SKIP if payment_status is already 'pending' (transaction in progress, don't reopen snap)
    useEffect(() => {
        if (autoPaymentTriggered) return;

        // Don't auto-trigger for pending transactions - they're already waiting for payment
        if (pesanan.payment_status === 'pending') {
            console.log('Skipping auto-payment: transaction already pending');
            return;
        }

        const urlParams = new URLSearchParams(window.location.search);
        const shouldAutoPayment = urlParams.get('autoPayment') === '1';

        if (shouldAutoPayment && isSnapLoaded && currentSnapToken && window.snap) {
            console.log('Auto-triggering payment popup with token:', currentSnapToken.substring(0, 20) + '...');
            setAutoPaymentTriggered(true);

            // Remove query param from URL to prevent re-trigger on refresh
            window.history.replaceState({}, '', window.location.pathname);

            // Trigger payment popup
            setTimeout(() => {
                openSnapPopup(currentSnapToken);
            }, 500);
        }
    }, [isSnapLoaded, currentSnapToken, autoPaymentTriggered, pesanan.payment_status]);

    // Check flash for new snap token after retry
    useEffect(() => {
        if (flash?.snap_token) {
            console.log('New snap token from flash:', flash.snap_token.substring(0, 20) + '...');
            setCurrentSnapToken(flash.snap_token);
            // Auto-trigger payment popup with new token
            setTimeout(() => {
                if (window.snap && flash.snap_token) {
                    openSnapPopup(flash.snap_token);
                }
            }, 500);
        }
    }, [flash?.snap_token]);

    const formatCurrency = (number) => {
        return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(number);
    };

    const formatDate = (dateString) => {
        const options = { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' };
        return new Date(dateString).toLocaleDateString('id-ID', options);
    };

    const subtotal = pesanan.items?.reduce((acc, item) => acc + parseFloat(item.subtotal), 0) || 0;

    // Status configuration
    const getStatusConfig = () => {
        // Prioritas status: Complete > Shipped > Paid > Pending
        const status = pesanan.status?.toLowerCase() || 'pending';
        const paymentStatus = pesanan.payment_status || 'unpaid';

        if (status === 'completed') {
            return {
                headerBg: 'bg-gradient-to-r from-green-600 to-teal-600',
                icon: FiCheckCircle,
                iconColor: 'text-white',
                title: 'Pesanan Selesai',
                subtitle: 'Pesanan telah diterima. Terima kasih telah berbelanja!',
                badgeColor: 'bg-white/20 text-white border border-white/30',
                badgeText: 'SELESAI',
                showPayButton: false,
                needsRetry: false,
            };
        }

        if (status === 'shipped') {
            return {
                headerBg: 'bg-gradient-to-r from-green-600 to-teal-600',
                icon: FiTruck,
                iconColor: 'text-white',
                title: 'Pesanan Sedang Dikirim',
                subtitle: 'Paket Anda sedang dalam perjalanan ke alamat tujuan.',
                badgeColor: 'bg-white/20 text-white border border-white/30',
                badgeText: 'DIKIRIM',
                showPayButton: false,
                needsRetry: false,
            };
        }

        if (status === 'processed') {
            return {
                headerBg: 'bg-gradient-to-r from-green-600 to-teal-600',
                icon: FiRefreshCw,
                iconColor: 'text-white',
                title: 'Pesanan Sedang Diproses',
                subtitle: 'Pesanan Anda sedang dipersiapkan oleh penjual.',
                badgeColor: 'bg-white/20 text-white border border-white/30',
                badgeText: 'DIPROSES',
                showPayButton: false,
                needsRetry: false,
            };
        }

        // Fallback ke Payment Status jika belum dikirim/selesai
        switch (paymentStatus) {
            case 'paid':
                // Paid tapi masih processed/pending
                return {
                    headerBg: 'bg-gradient-to-r from-green-600 to-teal-600',
                    icon: FiCheckCircle,
                    iconColor: 'text-white',
                    title: 'Pembayaran Diterima',
                    subtitle: 'Terima kasih! Pesanan Anda sedang kami siapkan.',
                    badgeColor: 'bg-green-100 text-green-700',
                    badgeText: status === 'processed' ? 'DIPROSES' : 'LUNAS',
                    showPayButton: false,
                    needsRetry: false,
                };
            case 'pending':
                // PENDING = transaksi sudah berjalan, JANGAN buka snap lagi
                return {
                    headerBg: 'bg-gradient-to-r from-yellow-500 to-amber-600',
                    icon: FiClock,
                    iconColor: 'text-white',
                    title: 'Menunggu Pembayaran',
                    subtitle: 'Pembayaran sedang menunggu konfirmasi. Silakan selesaikan pembayaran.',
                    badgeColor: 'bg-yellow-100 text-yellow-700',
                    badgeText: 'MENUNGGU PEMBAYARAN',
                    showPayButton: false, // TIDAK tampil tombol bayar
                    needsRetry: false,
                    isPending: true, // Flag khusus pending
                };
            case 'unpaid':
                // UNPAID = belum mulai bayar, boleh buka snap
                return {
                    headerBg: 'bg-gradient-to-r from-yellow-500 to-amber-600',
                    icon: FiClock,
                    iconColor: 'text-white',
                    title: 'Menunggu Pembayaran',
                    subtitle: 'Silakan selesaikan pembayaran untuk memproses pesanan Anda.',
                    badgeColor: 'bg-yellow-100 text-yellow-700',
                    badgeText: 'BELUM DIBAYAR',
                    showPayButton: true, // Boleh tampil tombol bayar
                    needsRetry: false,
                    isPending: false,
                };
            case 'failed':
            case 'expired':
                return {
                    headerBg: 'bg-gradient-to-r from-red-500 to-rose-600',
                    icon: FiXCircle,
                    iconColor: 'text-white',
                    title: paymentStatus === 'expired' ? 'Pembayaran Kedaluwarsa' : 'Pembayaran Gagal',
                    subtitle: 'Token pembayaran sudah tidak valid. Klik tombol di bawah untuk mendapatkan token baru.',
                    badgeColor: 'bg-red-100 text-red-700',
                    badgeText: paymentStatus === 'expired' ? 'KEDALUWARSA' : 'GAGAL',
                    showPayButton: true,
                    needsRetry: true, // Token expired, HARUS generate baru
                    isPending: false,
                };
            default:
                return {
                    headerBg: 'bg-gradient-to-r from-gray-500 to-gray-600',
                    icon: FiClock,
                    iconColor: 'text-white',
                    title: 'Status Pesanan',
                    subtitle: 'Silakan cek detail pesanan Anda.',
                    badgeColor: 'bg-gray-100 text-gray-700',
                    badgeText: (status || 'unknown').toUpperCase(),
                    showPayButton: false,
                    needsRetry: false,
                };
        }
    };

    const config = getStatusConfig();
    const StatusIcon = config.icon;

    // Open Snap popup
    const openSnapPopup = (token) => {
        if (!window.snap) {
            alert('Payment gateway belum siap. Silakan refresh halaman.');
            return;
        }

        window.snap.pay(token, {
            onSuccess: (result) => {
                console.log('Payment Success:', result);
                router.reload();
            },
            onPending: (result) => {
                console.log('Payment Pending:', result);
                router.reload();
            },
            onError: (result) => {
                console.log('Payment Error:', result);
                router.reload();
            },
            onClose: () => {
                console.log('Payment popup closed');
                // User menutup popup tanpa selesaikan pembayaran
            }
        });
    };

    // Handle "Bayar Sekarang" - untuk pending/unpaid yang token masih valid
    const handlePayNow = () => {
        if (!currentSnapToken) {
            // Tidak ada token, generate baru
            handleRetryPayment();
            return;
        }

        if (!isSnapLoaded || !window.snap) {
            alert('Payment gateway sedang dimuat. Silakan tunggu sebentar.');
            return;
        }

        openSnapPopup(currentSnapToken);
    };

    // Handle "Bayar Ulang" / "Ganti Metode" - generate token baru dan buka Snap
    const handleRetryPayment = () => {
        console.log('=== handleRetryPayment START ===');
        console.log('Pesanan ID:', pesanan.id);

        const retryUrl = route('customer.pesanan.retry-payment', pesanan.id);
        console.log('Retry URL:', retryUrl);

        setIsProcessing(true);

        // Ambil CSRF token dari cookie atau meta tag
        const csrfToken = document.querySelector('meta[name="csrf-token"]')?.getAttribute('content')
            || document.cookie.split('; ').find(row => row.startsWith('XSRF-TOKEN='))?.split('=')[1];

        console.log('CSRF Token exists:', !!csrfToken);

        // Menggunakan XMLHttpRequest untuk kontrol penuh
        const xhr = new XMLHttpRequest();
        xhr.open('POST', retryUrl, true);
        xhr.setRequestHeader('Content-Type', 'application/json');
        xhr.setRequestHeader('Accept', 'application/json');
        xhr.setRequestHeader('X-Requested-With', 'XMLHttpRequest');
        if (csrfToken) {
            xhr.setRequestHeader('X-CSRF-TOKEN', csrfToken);
        }

        xhr.onload = function () {
            console.log('=== XHR RESPONSE ===');
            console.log('Status:', xhr.status);
            console.log('Response:', xhr.responseText);

            if (xhr.status >= 200 && xhr.status < 300) {
                try {
                    const data = JSON.parse(xhr.responseText);
                    console.log('Parsed data:', data);

                    if (data.snap_token) {
                        console.log('=== NEW TOKEN RECEIVED ===');
                        console.log('Token:', data.snap_token.substring(0, 30) + '...');
                        setCurrentSnapToken(data.snap_token);
                        setIsProcessing(false);

                        if (window.snap) {
                            console.log('=== OPENING SNAP ===');
                            openSnapPopup(data.snap_token);
                        } else {
                            alert('Snap.js belum dimuat. Refresh halaman.');
                        }
                    } else {
                        console.log('=== NO TOKEN - RELOADING ===');
                        setIsProcessing(false);
                        window.location.reload();
                    }
                } catch (e) {
                    console.error('JSON parse error:', e);
                    setIsProcessing(false);
                    window.location.reload();
                }
            } else {
                console.error('=== REQUEST FAILED ===');
                console.error('Status:', xhr.status);
                setIsProcessing(false);
                alert('Gagal membuat token baru. Status: ' + xhr.status);
            }
        };

        xhr.onerror = function () {
            console.error('=== XHR ERROR ===');
            setIsProcessing(false);
            alert('Network error. Silakan coba lagi.');
        };

        xhr.send();
    };

    // Handle "Cek Status" - refresh halaman untuk ambil status terbaru dari DB
    const handleCheckStatus = () => {
        console.log('handleCheckStatus called');
        setIsProcessing(true);
        // FIX 403: Use native reload instead of router.reload() to avoid WAF blocking Inertia headers
        window.location.reload();
    };

    // Tombol utama - pilih action berdasarkan status
    const handleMainAction = () => {
        if (config.needsRetry) {
            handleRetryPayment();
        } else {
            handlePayNow();
        }
    };

    return (
        <CustomerLayout auth={auth}>
            <Head title={`Detail Pesanan #${pesanan.nomor_pesanan}`} />

            <main className="bg-gray-50 min-h-screen py-6 sm:py-8">
                <div className="max-w-4xl mx-auto px-4">

                    {/* Back Button - Modern Style */}
                    <Link
                        href={route('customer.pesanan.index')}
                        className="inline-flex items-center gap-2 px-3 py-1.5 bg-white rounded-full shadow-sm border border-gray-200 text-xs font-medium text-gray-700 hover:bg-gray-50 hover:shadow transition-all mb-4 group"
                    >
                        <FiArrowLeft className="text-green-600 group-hover:-translate-x-1 transition-transform" />
                        <span>Kembali</span>
                    </Link>

                    <div className="bg-white rounded-2xl shadow-xl overflow-hidden">

                        {/* Dynamic Header based on payment status */}
                        <div className={`${config.headerBg} p-5 sm:p-6 text-center text-white`}>
                            <StatusIcon className={`${config.iconColor} text-4xl mx-auto mb-3`} />
                            <h1 className="text-xl sm:text-2xl font-bold tracking-tight">{config.title}</h1>
                            <p className="text-white/90 mt-1 text-sm">{config.subtitle}</p>

                            {/* Payment Status Badge */}
                            <div className="mt-3">
                                <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-bold ${config.badgeColor}`}>
                                    {config.badgeText}
                                </span>
                            </div>
                        </div>

                        {/* PENDING Status Section */}
                        {config.isPending && (
                            <div className="bg-yellow-50 border-b p-4">
                                {/* Info Box */}
                                <div className="flex items-start gap-3 p-3 bg-white border border-yellow-200 rounded-lg mb-4">
                                    <FiClock className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
                                    <div className="text-xs text-yellow-800">
                                        <p className="font-semibold text-sm">Pembayaran Sedang Menunggu</p>
                                        <p className="mt-1 text-yellow-700">
                                            Transaksi Anda sudah dibuat. Pilih opsi di bawah.
                                        </p>
                                    </div>
                                </div>

                                {/* 2 Tombol Utama */}
                                <div className="flex flex-col sm:flex-row gap-3 justify-center">
                                    {/* Lanjutkan Pembayaran - Token yang sama */}
                                    <div className="flex flex-col items-center w-full sm:w-auto">
                                        <button
                                            type="button"
                                            onClick={handlePayNow}
                                            disabled={isProcessing}
                                            className="w-full sm:w-auto flex items-center justify-center gap-2 px-4 py-2 bg-green-600 text-white text-sm font-semibold rounded-lg hover:bg-green-700 transition shadow disabled:opacity-50"
                                        >
                                            <FiCreditCard className="w-4 h-4" />
                                            Lanjutkan Pembayaran
                                        </button>
                                        <p className="text-xs text-gray-500 mt-1 text-center">Pakai transaksi yang sama</p>
                                    </div>

                                    {/* Ganti Metode - Token baru */}
                                    <div className="flex flex-col items-center w-full sm:w-auto">
                                        <button
                                            type="button"
                                            onClick={() => handleRetryPayment()}
                                            disabled={isProcessing}
                                            style={{ pointerEvents: 'auto', zIndex: 9999 }}
                                            className="w-full sm:w-auto flex items-center justify-center gap-2 px-4 py-2 border border-gray-400 text-gray-700 text-sm font-semibold rounded-lg hover:bg-gray-100 transition disabled:opacity-50"
                                        >
                                            <FiRefreshCw className={`w-4 h-4 ${isProcessing ? 'animate-spin' : ''}`} />
                                            {isProcessing ? 'Memproses...' : 'Ganti Metode'}
                                        </button>
                                        <p className="text-xs text-gray-500 mt-1 text-center">Buat pembayaran baru</p>
                                    </div>
                                </div>

                                {/* Link kecil refresh */}
                                <div className="text-center mt-3">
                                    <button
                                        onClick={handleCheckStatus}
                                        disabled={isProcessing}
                                        className="text-xs text-gray-500 hover:text-gray-700 underline disabled:opacity-50"
                                    >
                                        {isProcessing ? 'Memuat...' : 'Refresh Status'}
                                    </button>
                                </div>
                            </div>
                        )}

                        {/* Action Buttons - Only for UNPAID and EXPIRED/FAILED */}
                        {config.showPayButton && (
                            <div className="bg-gray-50 border-b p-4">
                                <div className="flex flex-col sm:flex-row gap-3 justify-center items-center">
                                    <button
                                        onClick={handleMainAction}
                                        disabled={isProcessing}
                                        className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-2 bg-green-600 text-white font-bold rounded-lg hover:bg-green-700 transition-all shadow hover:shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        {config.needsRetry ? (
                                            <>
                                                <FiRefreshCw className={`w-4 h-4 ${isProcessing ? 'animate-spin' : ''}`} />
                                                {isProcessing ? 'Token Baru...' : 'Bayar Ulang'}
                                            </>
                                        ) : (
                                            <>
                                                <FiCreditCard className="w-4 h-4" />
                                                {isProcessing ? 'Memproses...' : 'Bayar Sekarang'}
                                            </>
                                        )}
                                    </button>
                                </div>

                                {/* Unpaid Notice */}
                                {pesanan.payment_status === 'unpaid' && (
                                    <div className="mt-3 flex items-start gap-2 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                                        <FiAlertTriangle className="w-4 h-4 text-yellow-600 flex-shrink-0 mt-0.5" />
                                        <div className="text-xs text-yellow-800">
                                            <p className="font-semibold">Pesanan diproses setelah bayar.</p>
                                        </div>
                                    </div>
                                )}

                                {/* Expired/Failed Notice */}
                                {config.needsRetry && (
                                    <div className="mt-3 flex items-start gap-2 p-3 bg-red-50 border border-red-200 rounded-lg">
                                        <FiAlertTriangle className="w-4 h-4 text-red-600 flex-shrink-0 mt-0.5" />
                                        <div className="text-xs text-red-800">
                                            <p className="font-semibold">Token kadaluarsa. Klik "Bayar Ulang".</p>
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}

                        {/* Order Content */}
                        <div className="p-5 sm:p-6">
                            {flash?.success && typeof flash.success === 'string' && (
                                <div className="bg-green-100 border-l-4 border-green-500 text-green-800 p-3 rounded text-sm mb-4" role="alert">
                                    <p>{flash.success}</p>
                                </div>
                            )}

                            {/* Customer & Shipping Info */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                                {/* Info Pelanggan & Pesanan Merged */}
                                <div className="bg-gray-50 rounded-lg p-3">
                                    <h3 className="font-semibold text-gray-800 text-sm flex items-center mb-2">
                                        <FiUser className="mr-2 text-green-500 w-4 h-4" />
                                        Info Pelanggan & Pesanan
                                    </h3>
                                    <div className="flex flex-col gap-3">
                                        <div>
                                            <p className="text-gray-600 text-sm font-medium">{pesanan.user?.name || '-'}</p>
                                            <p className="text-xs text-gray-500">{pesanan.user?.email || '-'}</p>
                                        </div>

                                        <div className="pt-2 border-t border-gray-100 flex flex-col gap-1.5">
                                            <div className="flex flex-col gap-0.5">
                                                <span className="text-[10px] text-gray-500">No. Pesanan</span>
                                                <span className="font-mono text-green-600 text-sm font-bold">{pesanan.nomor_pesanan || '-'}_</span>
                                            </div>

                                            <div className="flex flex-col gap-0.5">
                                                <span className="text-[10px] text-gray-500">Tanggal</span>
                                                <span className="text-xs text-gray-700">{formatDate(pesanan.created_at)}</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                <div className="bg-gray-50 rounded-lg p-3 flex flex-col justify-between">
                                    <div>
                                        <h3 className="font-semibold text-gray-800 text-sm flex items-center mb-2">
                                            <FiTruck className="mr-2 text-green-500 w-4 h-4" />
                                            Info Pengiriman
                                        </h3>
                                        <p className="text-gray-600 text-sm">{pesanan.alamat_pengiriman || 'Alamat tidak tersedia'}</p>
                                        <p className="text-xs font-medium text-gray-700 mt-1">{pesanan.metode_pengiriman || '-'}</p>
                                    </div>

                                    {(pesanan.nomor_resi || pesanan.payment_status === 'paid') && (
                                        <div className="mt-2 pt-2 border-t border-dashed border-gray-200 flex justify-between items-end">
                                            {/* Resi Section (Left) */}
                                            <div>
                                                {pesanan.nomor_resi && (() => {
                                                    const [copied, setCopied] = React.useState(false);
                                                    const handleCopy = () => {
                                                        navigator.clipboard.writeText(pesanan.nomor_resi);
                                                        setCopied(true);
                                                        setTimeout(() => setCopied(false), 2000);
                                                    };

                                                    return (
                                                        <>
                                                            <p className="text-[10px] text-gray-500 uppercase font-bold">Nomor Resi</p>
                                                            <div className="flex items-center gap-2 mt-0.5">
                                                                <span className="font-mono font-bold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded text-xs select-all tracking-wide">
                                                                    {pesanan.nomor_resi}
                                                                </span>
                                                                <button
                                                                    onClick={handleCopy}
                                                                    className="p-1 text-gray-500 hover:text-indigo-600 bg-white border border-gray-200 hover:border-indigo-300 rounded transition-colors flex items-center gap-1"
                                                                    title="Salin Resi"
                                                                >
                                                                    {copied ? (
                                                                        <FiCheck className="w-3 h-3 text-green-500" />
                                                                    ) : (
                                                                        <FiCopy className="w-3 h-3" />
                                                                    )}
                                                                </button>
                                                            </div>
                                                        </>
                                                    );
                                                })()}
                                            </div>

                                            {/* Invoice Section (Right) */}
                                            {pesanan.payment_status === 'paid' && (
                                                <a
                                                    href={route('customer.pesanan.invoice', pesanan.id)}
                                                    className="inline-flex items-center text-xs font-medium text-indigo-600 hover:text-indigo-800 transition-colors mb-0.5"
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                >
                                                    <FiFileText className="mr-1.5 w-3 h-3" />
                                                    Lihat Invoice
                                                </a>
                                            )}
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Shipping/Processing Notice - only if PAID and NOT YET shipped/completed */}
                            {pesanan.payment_status === 'paid' && !['shipped', 'completed'].includes(pesanan.status?.toLowerCase()) && (() => {
                                // Operating hours: 07:30 - 18:00
                                const now = new Date();
                                const hour = now.getHours();
                                const minute = now.getMinutes();
                                const currentTimeInMinutes = hour * 60 + minute;
                                const openTime = 7 * 60 + 30; // 07:30
                                const closeTime = 18 * 60; // 18:00

                                const isWithinOperatingHours = currentTimeInMinutes >= openTime && currentTimeInMinutes < closeTime;
                                const isPickup = pesanan.metode_pengiriman === 'Ambil Sendiri' || pesanan.metode_pengiriman === 'Ambil di Toko';

                                // NEW LOGIC: Check if order date is TODAY
                                const orderDate = new Date(pesanan.created_at);
                                const isToday = orderDate.toDateString() === now.toDateString();

                                let noticeTitle, noticeMessage, bgColor, borderColor, textColor, iconColor;

                                if (isToday) {
                                    // LOGIC FOR FRESH ORDERS (Today)
                                    if (isPickup) {
                                        // Pickup mode
                                        noticeTitle = 'Informasi Penjemputan';
                                        bgColor = 'bg-blue-50';
                                        borderColor = 'border-blue-200';
                                        textColor = 'text-blue-800';
                                        iconColor = 'text-blue-600';

                                        if (isWithinOperatingHours) {
                                            noticeMessage = (
                                                <>Pesanan Anda akan siap diambil dalam waktu <span className="font-bold">15–30 menit</span>.</>
                                            );
                                        } else {
                                            noticeMessage = (
                                                <>Pesanan Anda akan siap diambil <span className="font-bold">besok mulai pukul 07:30 WIB</span>.</>
                                            );
                                        }
                                    } else {
                                        // Kurir Lokal / Ekspedisi
                                        noticeTitle = 'Informasi Pengiriman';
                                        bgColor = 'bg-green-50';
                                        borderColor = 'border-green-200';
                                        textColor = 'text-green-800';
                                        iconColor = 'text-green-600';

                                        if (isWithinOperatingHours) {
                                            noticeMessage = (
                                                <>Pesanan Anda sedang diproses dan akan segera dikirim <span className="font-bold">hari ini</span>.</>
                                            );
                                        } else {
                                            noticeMessage = (
                                                <>Pesanan Anda akan diproses dan dikirim <span className="font-bold">besok mulai pukul 07:30 WIB</span> (toko tutup pukul 18:00).</>
                                            );
                                        }
                                    }
                                } else {
                                    // LOGIC FOR STALE ORDERS (Yesterday or older)
                                    noticeTitle = 'Status Pesanan';
                                    bgColor = 'bg-blue-50'; // Neutral Info Color
                                    borderColor = 'border-blue-200';
                                    textColor = 'text-blue-800';
                                    iconColor = 'text-blue-600';

                                    if (pesanan.status === 'processed') {
                                        noticeMessage = (
                                            <>Pesanan Anda sedang dalam <span className="font-bold">antrian pemrosesan</span> oleh admin. Mohon menunggu update status selanjutnya.</>
                                        );
                                    } else {
                                        // Fallback generic message
                                        noticeMessage = (
                                            <>Pesanan Anda telah diterima dan sedang menunggu giliran untuk diproses.</>
                                        );
                                    }
                                }

                                return (
                                    <div className={`${bgColor} border ${borderColor} p-4 rounded-xl mb-6`}>
                                        <div className="flex items-start gap-3">
                                            <FiClock className={`w-5 h-5 ${iconColor} flex-shrink-0 mt-0.5`} />
                                            <div className={`text-sm ${textColor}`}>
                                                <p className="font-semibold">{noticeTitle}</p>
                                                <p className="mt-1">{noticeMessage}</p>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })()}

                            {/* Product Details */}
                            <h3 className="font-semibold text-lg text-gray-800 flex items-center mb-4">
                                <FiArchive className="mr-2 text-green-500" />
                                Rincian Produk
                            </h3>
                            <ul className="divide-y divide-gray-100 border rounded-xl overflow-y-auto max-h-80 mb-6 custom-scrollbar">
                                {pesanan.items?.map((item) => (
                                    <li key={item.id} className="flex items-center p-4 bg-white hover:bg-gray-50 transition-colors">
                                        <img
                                            src={`/storage/${item.produk?.gambar}`}
                                            alt={item.produk?.nama}
                                            className="w-16 h-16 rounded-lg object-cover mr-4 border"
                                            onError={(e) => { e.target.src = '/images/placeholder.jpg' }}
                                        />
                                        <div className="flex-grow min-w-0">
                                            <p className="font-semibold text-gray-800 truncate">{item.produk?.nama}</p>
                                            <p className="text-sm text-gray-500">{item.jumlah} x {formatCurrency(item.produk?.harga || 0)}</p>
                                        </div>
                                        <p className="font-semibold text-gray-900 ml-4">{formatCurrency(item.subtotal)}</p>
                                    </li>
                                ))}
                            </ul>

                            {/* Payment Summary */}
                            <div className="bg-gray-50 rounded-xl p-4">
                                <h4 className="font-semibold text-gray-800 mb-3">Ringkasan Pembayaran</h4>
                                <div className="space-y-2">
                                    <div className="flex justify-between text-sm">
                                        <span className="text-gray-600">Subtotal Produk</span>
                                        <span className="text-gray-900">{formatCurrency(subtotal)}</span>
                                    </div>
                                    <div className="flex justify-between text-sm">
                                        <span className="text-gray-600">Ongkos Kirim</span>
                                        <span className="text-gray-900">{formatCurrency(pesanan.biaya_pengiriman || 0)}</span>
                                    </div>
                                    <div className="flex justify-between font-bold text-lg pt-3 border-t mt-3">
                                        <span>Total</span>
                                        <span className="text-green-600">{formatCurrency(pesanan.total)}</span>
                                    </div>
                                </div>
                            </div>

                            {/* Reviews Section */}
                            {/* Reviews Section */}
                            {pesanan.ulasan && pesanan.ulasan.length > 0 ? (
                                <div className="mt-6">
                                    <h3 className="font-semibold text-lg text-gray-800 flex items-center mb-4">
                                        <FiStar className="mr-2 text-green-500" />
                                        Ulasan Pesanan
                                    </h3>
                                    {/* Aggregated Review Card */}
                                    {(() => {
                                        // Calculate Average Rating
                                        const rawAvg = pesanan.ulasan.reduce((acc, curr) => acc + curr.rating, 0) / pesanan.ulasan.length;
                                        const avgRating = Math.round(rawAvg);
                                        // Use the first non-empty comment found (robustness for legacy data)
                                        const comment = pesanan.ulasan.find(u => u.komentar && u.komentar.trim() !== '')?.komentar || '';
                                        // Deduplicate photos (based on path)
                                        const allPhotos = pesanan.ulasan.flatMap(u => u.fotos || []);
                                        const uniquePhotos = Array.from(new Set(allPhotos.map(p => p.foto_path)))
                                            .map(path => allPhotos.find(p => p.foto_path === path));

                                        // Check for admin reply (on any of the reviews)
                                        const reply = pesanan.ulasan.find(u => u.balasan)?.balasan;
                                        const replyDate = pesanan.ulasan.find(u => u.balasan)?.tanggal_balasan;

                                        return (
                                            <div className="mt-6 p-5 bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl border border-green-200">
                                                <div className="flex flex-col sm:flex-row gap-4">
                                                    <div className="flex-1">
                                                        <h3 className="text-base font-semibold text-green-800 mb-2 flex items-center gap-2">
                                                            <FiStar className="text-yellow-500" />
                                                            Ulasan Anda <span className="text-sm font-normal text-gray-600">({rawAvg.toFixed(1)} / 5.0)</span>
                                                        </h3>
                                                        <div className="flex gap-1 mb-2">
                                                            {[...Array(5)].map((_, i) => (
                                                                <FiStar key={i} className={`w-4 h-4 ${i < avgRating ? 'text-yellow-400 fill-current' : 'text-gray-300'}`} />
                                                            ))}
                                                        </div>
                                                        {comment ? (
                                                            <p className="text-gray-700 text-sm italic">"{comment}"</p>
                                                        ) : (
                                                            <p className="text-gray-400 text-sm italic">(Tidak ada komentar tertulis)</p>
                                                        )}
                                                    </div>

                                                    {/* Photo Gallery */}
                                                    {uniquePhotos.length > 0 && (
                                                        <div className="flex gap-2 mt-3 sm:mt-0 overflow-x-auto pb-2 sm:pb-0">
                                                            {uniquePhotos.map((foto, idx) => (
                                                                <img
                                                                    key={idx}
                                                                    src={`/storage/${foto.foto_path}`}
                                                                    alt="Foto Ulasan"
                                                                    className="h-20 w-20 object-cover rounded-lg flex-shrink-0 border border-green-100"
                                                                />
                                                            ))}
                                                        </div>
                                                    )}
                                                </div>

                                                {/* Balasan Admin */}
                                                {reply && (
                                                    <div className="mt-4 pl-4 border-l-4 border-green-500 bg-white/70 p-3 rounded-r-lg">
                                                        <p className="text-xs font-bold text-green-800 mb-1">
                                                            Balasan Penjual {replyDate && `(${new Date(replyDate).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })})`}
                                                        </p>
                                                        <p className="text-sm text-gray-700">"{reply}"</p>
                                                    </div>
                                                )}
                                            </div>
                                        );
                                    })()}
                                </div>
                            ) : (
                                ['completed', 'selesai'].includes(pesanan.status?.toLowerCase()) && (
                                    <div className="mt-6 text-center p-5 bg-gray-50 rounded-xl border border-dashed border-gray-300">
                                        <FiStar className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                                        <p className="text-gray-600 text-sm mb-3">Bagaimana pengalaman belanja Anda?</p>
                                        <Link
                                            href={route('customer.ulasan.create', pesanan.id)}
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
                        {/* Footer Actions */}
                        <div className="bg-gray-50 border-t p-4 sm:p-6">
                            {/* Confirm Received Button - Only visible when Shipped */}
                            {['shipped', 'dikirim'].includes(pesanan.status?.toLowerCase()) && (
                                <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-xl w-full">
                                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                                        <div className="flex items-center gap-2 text-blue-800">
                                            <FiCheckCircle className="w-5 h-5 flex-shrink-0" />
                                            <div className="text-sm text-left">
                                                <p className="font-semibold">Pesanan Diterima?</p>
                                                <p className="text-xs text-blue-600 mt-0.5">Konfirmasi jika pesanan sudah Anda terima dengan baik.</p>
                                            </div>
                                        </div>
                                        <button
                                            onClick={() => {
                                                Swal.fire({
                                                    title: 'Pesanan Diterima?',
                                                    text: "Pastikan barang sudah Anda terima dengan baik. Status pesanan akan diubah menjadi Selesai.",
                                                    icon: 'question',
                                                    showCancelButton: true,
                                                    confirmButtonColor: '#059669',
                                                    cancelButtonColor: '#d33',
                                                    confirmButtonText: 'Ya, Sudah Diterima',
                                                    cancelButtonText: 'Batal'
                                                }).then((result) => {
                                                    if (result.isConfirmed) {
                                                        router.post(route('customer.pesanan.complete', pesanan.id));
                                                    }
                                                });
                                            }}
                                            className="inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-green-600 text-white font-semibold rounded-lg shadow-md hover:bg-green-700 hover:shadow-lg transition-all whitespace-nowrap"
                                        >
                                            <FiCheckCircle />
                                            Konfirmasi Diterima
                                        </button>
                                    </div>
                                </div>
                            )}

                            <div className="flex flex-col sm:flex-row gap-3 justify-center">
                                <Link
                                    href={route('belanja.index')}
                                    className="text-center px-6 py-3 border border-gray-300 text-gray-700 font-semibold rounded-xl hover:bg-gray-100 transition"
                                >
                                    Lanjut Belanja
                                </Link>
                                <Link
                                    href={route('customer.pesanan.index')}
                                    className="text-center px-6 py-3 border border-gray-300 text-gray-700 font-semibold rounded-xl hover:bg-gray-100 transition"
                                >
                                    Lihat Semua Pesanan
                                </Link>
                            </div>
                        </div>
                    </div>
                </div>
            </main>
        </CustomerLayout >
    );
}
