import React, { useEffect, useState } from 'react';
import { Head, Link, router, usePage } from '@inertiajs/react';
import CustomerLayout from '@/Layouts/CustomerLayout';
import {
    FiCheckCircle, FiClock, FiXCircle, FiUser, FiTruck, FiArchive,
    FiRefreshCw, FiCreditCard, FiArrowLeft, FiAlertTriangle
} from 'react-icons/fi';

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
        const status = pesanan.payment_status || 'unpaid';

        switch (status) {
            case 'paid':
                return {
                    headerBg: 'bg-gradient-to-r from-green-500 to-emerald-600',
                    icon: FiCheckCircle,
                    iconColor: 'text-white',
                    title: 'Pesanan Diterima',
                    subtitle: 'Terima kasih! Pesanan Anda sedang kami proses.',
                    badgeColor: 'bg-green-100 text-green-700',
                    badgeText: 'LUNAS',
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
                    subtitle: 'Pembayaran sedang menunggu konfirmasi. Silakan selesaikan pembayaran sesuai instruksi.',
                    badgeColor: 'bg-yellow-100 text-yellow-700',
                    badgeText: 'PENDING',
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
                    title: status === 'expired' ? 'Pembayaran Kedaluwarsa' : 'Pembayaran Gagal',
                    subtitle: 'Token pembayaran sudah tidak valid. Klik tombol di bawah untuk mendapatkan token baru.',
                    badgeColor: 'bg-red-100 text-red-700',
                    badgeText: status === 'expired' ? 'KEDALUWARSA' : 'GAGAL',
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
                    subtitle: 'Silakan cek status pembayaran Anda.',
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
        router.reload({
            onFinish: () => {
                setIsProcessing(false);
            }
        });
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

            <main className="bg-gray-50 min-h-screen py-8 sm:py-12">
                <div className="max-w-4xl mx-auto px-4">

                    {/* Back Button - Modern Style */}
                    <Link
                        href={route('customer.pesanan.index')}
                        className="inline-flex items-center gap-2 px-4 py-2 bg-white rounded-full shadow-sm border border-gray-200 text-sm font-medium text-gray-700 hover:bg-gray-50 hover:shadow transition-all mb-6 group"
                    >
                        <FiArrowLeft className="text-green-600 group-hover:-translate-x-1 transition-transform" />
                        <span>Kembali ke Riwayat Pesanan</span>
                    </Link>

                    <div className="bg-white rounded-2xl shadow-xl overflow-hidden">

                        {/* Dynamic Header based on payment status */}
                        <div className={`${config.headerBg} p-6 sm:p-8 text-center text-white`}>
                            <StatusIcon className={`${config.iconColor} text-5xl mx-auto mb-4`} />
                            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">{config.title}</h1>
                            <p className="text-white/80 mt-2">{config.subtitle}</p>

                            {/* Payment Status Badge */}
                            <div className="mt-4">
                                <span className={`inline-flex items-center px-4 py-1.5 rounded-full text-sm font-semibold ${config.badgeColor}`}>
                                    {config.badgeText}
                                </span>
                            </div>
                        </div>

                        {/* PENDING Status Section */}
                        {config.isPending && (
                            <div className="bg-yellow-50 border-b p-4 sm:p-6">
                                {/* Info Box */}
                                <div className="flex items-start gap-3 p-4 bg-white border border-yellow-200 rounded-xl mb-5">
                                    <FiClock className="w-6 h-6 text-yellow-600 flex-shrink-0 mt-0.5" />
                                    <div className="text-sm text-yellow-800">
                                        <p className="font-semibold text-base">Pembayaran Sedang Menunggu</p>
                                        <p className="mt-2 text-yellow-700">
                                            Transaksi Anda sudah dibuat. Pilih salah satu opsi di bawah untuk melanjutkan.
                                        </p>
                                    </div>
                                </div>

                                {/* 2 Tombol Utama */}
                                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                                    {/* Lanjutkan Pembayaran - Token yang sama */}
                                    <div className="flex flex-col items-center">
                                        <button
                                            type="button"
                                            onClick={handlePayNow}
                                            disabled={isProcessing}
                                            className="flex items-center justify-center gap-2 px-6 py-3 bg-green-600 text-white font-semibold rounded-xl hover:bg-green-700 transition shadow-lg disabled:opacity-50"
                                        >
                                            <FiCreditCard className="w-5 h-5" />
                                            Lanjutkan Pembayaran
                                        </button>
                                        <p className="text-xs text-gray-500 mt-2 text-center">Pakai transaksi yang sama</p>
                                    </div>

                                    {/* Ganti Metode - Token baru */}
                                    <div className="flex flex-col items-center">
                                        <button
                                            type="button"
                                            onClick={() => {
                                                alert('GANTI METODE CLICKED!');
                                                handleRetryPayment();
                                            }}
                                            disabled={isProcessing}
                                            style={{ pointerEvents: 'auto', zIndex: 9999 }}
                                            className="flex items-center justify-center gap-2 px-6 py-3 border-2 border-gray-400 text-gray-700 font-semibold rounded-xl hover:bg-gray-100 transition disabled:opacity-50"
                                        >
                                            <FiRefreshCw className={`w-5 h-5 ${isProcessing ? 'animate-spin' : ''}`} />
                                            {isProcessing ? 'Memproses...' : 'Ganti Metode'}
                                        </button>
                                        <p className="text-xs text-gray-500 mt-2 text-center">Buat pembayaran baru</p>
                                    </div>
                                </div>

                                {/* Link kecil refresh */}
                                <div className="text-center mt-5">
                                    <button
                                        onClick={handleCheckStatus}
                                        disabled={isProcessing}
                                        className="text-sm text-gray-500 hover:text-gray-700 underline disabled:opacity-50"
                                    >
                                        {isProcessing ? 'Memuat...' : 'Refresh Status'}
                                    </button>
                                </div>
                            </div>
                        )}

                        {/* Action Buttons - Only for UNPAID and EXPIRED/FAILED */}
                        {config.showPayButton && (
                            <div className="bg-gray-50 border-b p-4 sm:p-6">
                                <div className="flex flex-col sm:flex-row gap-3 justify-center items-center">
                                    <button
                                        onClick={handleMainAction}
                                        disabled={isProcessing}
                                        className="w-full sm:w-auto flex items-center justify-center gap-2 px-8 py-3 bg-green-600 text-white font-bold rounded-xl hover:bg-green-700 transition-all shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        {config.needsRetry ? (
                                            <>
                                                <FiRefreshCw className={`w-5 h-5 ${isProcessing ? 'animate-spin' : ''}`} />
                                                {isProcessing ? 'Membuat Token Baru...' : 'Bayar Ulang'}
                                            </>
                                        ) : (
                                            <>
                                                <FiCreditCard className="w-5 h-5" />
                                                {isProcessing ? 'Memproses...' : 'Bayar Sekarang'}
                                            </>
                                        )}
                                    </button>
                                </div>

                                {/* Unpaid Notice */}
                                {pesanan.payment_status === 'unpaid' && (
                                    <div className="mt-4 flex items-start gap-3 p-4 bg-yellow-50 border border-yellow-200 rounded-xl">
                                        <FiAlertTriangle className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
                                        <div className="text-sm text-yellow-800">
                                            <p className="font-semibold">Pesanan akan diproses setelah pembayaran berhasil.</p>
                                            <p className="mt-1 text-yellow-700">Klik tombol di atas untuk memilih metode pembayaran.</p>
                                        </div>
                                    </div>
                                )}

                                {/* Expired/Failed Notice */}
                                {config.needsRetry && (
                                    <div className="mt-4 flex items-start gap-3 p-4 bg-red-50 border border-red-200 rounded-xl">
                                        <FiAlertTriangle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                                        <div className="text-sm text-red-800">
                                            <p className="font-semibold">Token pembayaran sebelumnya sudah tidak valid.</p>
                                            <p className="mt-1 text-red-700">Klik "Bayar Ulang" untuk mendapatkan token baru dan melanjutkan pembayaran.</p>
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}

                        {/* Order Content */}
                        <div className="p-6 sm:p-8">
                            {flash?.success && typeof flash.success === 'string' && (
                                <div className="bg-green-100 border-l-4 border-green-500 text-green-800 p-4 rounded-md mb-6" role="alert">
                                    <p>{flash.success}</p>
                                </div>
                            )}

                            {/* Order Info */}
                            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6 pb-4 border-b">
                                <div>
                                    <p className="text-sm text-gray-500">Nomor Pesanan</p>
                                    <p className="font-mono font-semibold text-green-600 text-lg">{pesanan.nomor_pesanan || '-'}</p>
                                </div>
                                <div className="text-left sm:text-right">
                                    <p className="text-sm text-gray-500">Tanggal Pesanan</p>
                                    <p className="font-medium text-gray-700">{formatDate(pesanan.created_at)}</p>
                                </div>
                            </div>

                            {/* Customer & Shipping Info */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                                <div className="bg-gray-50 rounded-xl p-4">
                                    <h3 className="font-semibold text-gray-800 flex items-center mb-3">
                                        <FiUser className="mr-2 text-green-500" />
                                        Info Pelanggan
                                    </h3>
                                    <p className="text-gray-600">{pesanan.user?.name || '-'}</p>
                                    <p className="text-sm text-gray-500">{pesanan.user?.email || '-'}</p>
                                </div>
                                <div className="bg-gray-50 rounded-xl p-4">
                                    <h3 className="font-semibold text-gray-800 flex items-center mb-3">
                                        <FiTruck className="mr-2 text-green-500" />
                                        Info Pengiriman
                                    </h3>
                                    <p className="text-gray-600">{pesanan.alamat_pengiriman || 'Alamat tidak tersedia'}</p>
                                    <p className="text-sm font-medium text-gray-700 mt-1">{pesanan.metode_pengiriman || '-'}</p>
                                </div>
                            </div>

                            {/* Shipping/Processing Notice - for ALL methods */}
                            {pesanan.payment_status === 'paid' && (() => {
                                // Operating hours: 07:30 - 18:00
                                const now = new Date();
                                const hour = now.getHours();
                                const minute = now.getMinutes();
                                const currentTimeInMinutes = hour * 60 + minute;
                                const openTime = 7 * 60 + 30; // 07:30
                                const closeTime = 18 * 60; // 18:00

                                const isWithinOperatingHours = currentTimeInMinutes >= openTime && currentTimeInMinutes < closeTime;
                                const isPickup = pesanan.metode_pengiriman === 'Ambil Sendiri' || pesanan.metode_pengiriman === 'Ambil di Toko';

                                let noticeTitle, noticeMessage, bgColor, borderColor, textColor, iconColor;

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
                            <ul className="divide-y divide-gray-100 border rounded-xl overflow-hidden mb-6">
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
                        </div>

                        {/* Footer Actions */}
                        <div className="bg-gray-50 border-t p-4 sm:p-6">
                            <div className="flex flex-col sm:flex-row gap-3 justify-center">
                                <Link
                                    href={route('belanja.index')}
                                    className="text-center px-6 py-3 bg-green-600 text-white font-semibold rounded-xl hover:bg-green-700 transition shadow"
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
        </CustomerLayout>
    );
}
