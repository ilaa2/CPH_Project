import { Head, Link, router } from '@inertiajs/react';
import { SiteHeader, FooterNote } from '@/Layouts/CustomerLayout';
import CheckoutStepper from '@/Components/CheckoutStepper';
import React, { useEffect } from 'react';
import { FiMapPin, FiTruck, FiClock, FiShoppingBag, FiArrowLeft, FiCreditCard } from 'react-icons/fi';
import Swal from 'sweetalert2';

export default function Checkout3({ cartItems, subtotal, alamat, pengiriman, auth }) {
    // Load Midtrans Snap script
    useEffect(() => {
        const script = document.createElement('script');
        script.src = "https://app.sandbox.midtrans.com/snap/snap.js";
        script.setAttribute('data-client-key', import.meta.env.VITE_MIDTRANS_CLIENT_KEY);
        document.body.appendChild(script);

        return () => {
            document.body.removeChild(script);
        };
    }, []);

    const handleBayar = () => {
        router.post(route('checkout.process'), {}, {
            onSuccess: (page) => {
                const { snap_token, redirect_url } = page.props.flash;

                if (snap_token) {
                    window.snap.pay(snap_token, {
                        onSuccess: function (result) {
                            Swal.fire('Berhasil', 'Pembayaran sukses!', 'success')
                                .then(() => router.visit(redirect_url));
                        },
                        onPending: function (result) {
                            Swal.fire('Info', 'Pembayaran Anda tertunda.', 'info')
                                .then(() => router.visit(redirect_url));
                        },
                        onError: function (result) {
                            Swal.fire('Error', 'Pembayaran gagal.', 'error');
                        },
                        onClose: function () {
                            Swal.fire('Info', 'Anda menutup popup pembayaran.', 'warning');
                        }
                    });
                } else if (redirect_url) {
                    // If Midtrans disabled, just redirect
                    router.visit(redirect_url);
                }
            },
            onError: (errors) => {
                Swal.fire('Terjadi Kesalahan', 'Gagal memproses pesanan. Silakan coba lagi.', 'error');
                console.error(errors);
            }
        });
    };

    const formatCurrency = (number) => {
        return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(number);
    };

    const formatAddress = (addressString) => {
        if (!addressString) return '';
        const parts = addressString.split(', ');
        return parts.filter(part => part && part.trim() !== 'undefined' && part.trim() !== 'null').join(', ');
    };

    const ongkosKirim = pengiriman?.price || 0;
    const totalPembayaran = subtotal + ongkosKirim;
    const isPickup = pengiriman?.name === 'Ambil di Toko' || pengiriman?.service === 'PICKUP';

    return (
        <>
            <Head title="Checkout - Ringkasan & Pembayaran" />
            <SiteHeader auth={auth} />

            <main className="bg-gradient-to-b from-gray-50 to-white min-h-screen py-8">
                <div className="max-w-5xl mx-auto px-4">
                    {/* Stepper */}
                    <CheckoutStepper currentStep={4} />

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        {/* Left Column - Order Details */}
                        <div className="lg:col-span-2 space-y-4">
                            {/* Preparation Notice for Pickup */}
                            {isPickup && (() => {
                                // Operating hours: 07:30 - 18:00
                                const now = new Date();
                                const hour = now.getHours();
                                const minute = now.getMinutes();
                                const currentTimeInMinutes = hour * 60 + minute;
                                const openTime = 7 * 60 + 30; // 07:30
                                const closeTime = 18 * 60; // 18:00

                                const isWithinOperatingHours = currentTimeInMinutes >= openTime && currentTimeInMinutes < closeTime;

                                let pickupMessage;
                                if (isWithinOperatingHours) {
                                    pickupMessage = (
                                        <>Pesanan akan siap diambil dalam waktu <strong>15–30 menit</strong> setelah konfirmasi pembayaran.</>
                                    );
                                } else {
                                    pickupMessage = (
                                        <>Pesanan akan siap diambil <strong>besok mulai pukul 07:30 WIB</strong> (toko tutup pukul 18:00).</>
                                    );
                                }

                                return (
                                    <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 flex items-start gap-3">
                                        <FiClock className="text-amber-600 text-xl flex-shrink-0 mt-0.5" />
                                        <div>
                                            <p className="font-semibold text-amber-800">Estimasi Waktu Penyiapan</p>
                                            <p className="text-sm text-amber-700">{pickupMessage}</p>
                                        </div>
                                    </div>
                                );
                            })()}

                            {/* Order Items */}
                            <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
                                <div className="px-5 py-4 border-b bg-gradient-to-r from-gray-50 to-white flex items-center gap-2">
                                    <FiShoppingBag className="text-gray-600" />
                                    <h2 className="font-bold text-gray-800">Ringkasan Pesanan</h2>
                                    <span className="text-sm text-gray-500">({cartItems.length} item)</span>
                                </div>
                                <div className="divide-y divide-gray-100">
                                    {cartItems.map((item) => (
                                        <div key={item.id} className="flex items-center p-4 gap-4">
                                            <img
                                                src={`/storage/${item.product.gambar}`}
                                                alt={item.product.nama}
                                                className="w-16 h-16 rounded-lg object-cover border"
                                            />
                                            <div className="flex-grow min-w-0">
                                                <p className="font-semibold text-gray-800 truncate">{item.product.nama}</p>
                                                <p className="text-sm text-gray-500">{item.quantity} x {formatCurrency(item.product.harga)}</p>
                                            </div>
                                            <p className="font-semibold text-gray-800">{formatCurrency(item.product.harga * item.quantity)}</p>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Shipping & Address Info */}
                            <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
                                <div className="grid grid-cols-1 md:grid-cols-2 divide-y md:divide-y-0 md:divide-x divide-gray-100">
                                    {/* Address */}
                                    {!isPickup && (
                                        <div className="p-5">
                                            <div className="flex items-center gap-2 mb-3">
                                                <FiMapPin className="text-green-600" />
                                                <h3 className="font-bold text-gray-800">Alamat Pengiriman</h3>
                                            </div>
                                            <p className="font-semibold text-gray-800">{alamat?.nama}</p>
                                            <p className="text-sm text-gray-600">{alamat?.telepon}</p>
                                            <p className="text-sm text-gray-500 mt-1">{formatAddress(alamat?.full_address_string)}</p>
                                            <Link href={route('checkout.address')} className="text-green-600 text-sm hover:underline mt-2 inline-block">
                                                Ubah Alamat
                                            </Link>
                                        </div>
                                    )}

                                    {/* Shipping Method */}
                                    <div className={`p-5 ${isPickup ? 'md:col-span-2' : ''}`}>
                                        <div className="flex items-center gap-2 mb-3">
                                            <FiTruck className="text-green-600" />
                                            <h3 className="font-bold text-gray-800">Metode Pengiriman</h3>
                                        </div>
                                        <p className="font-semibold text-gray-800">{pengiriman?.name}</p>
                                        <p className="text-sm text-gray-600">{pengiriman?.description}</p>
                                        {isPickup ? (
                                            <p className="text-sm text-gray-500 mt-1">📍 {formatAddress(alamat?.full_address_string)}</p>
                                        ) : null}
                                        <Link href={isPickup ? route('checkout.index') : route('checkout.shipping')} className="text-green-600 text-sm hover:underline mt-2 inline-block">
                                            {isPickup ? 'Ubah Metode' : 'Ubah Pengiriman'}
                                        </Link>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Right Column - Payment Summary (Sticky) */}
                        <div className="lg:col-span-1">
                            <div className="bg-white rounded-xl shadow-lg border sticky top-24 overflow-hidden">
                                <div className="px-5 py-4 border-b bg-gradient-to-r from-green-600 to-green-500">
                                    <h2 className="font-bold text-white flex items-center gap-2">
                                        <FiCreditCard /> Rincian Pembayaran
                                    </h2>
                                </div>

                                <div className="p-5 space-y-4">
                                    <div className="flex justify-between text-sm">
                                        <span className="text-gray-600">Subtotal Produk</span>
                                        <span className="font-medium text-gray-800">{formatCurrency(subtotal)}</span>
                                    </div>
                                    <div className="flex justify-between text-sm">
                                        <span className="text-gray-600">Ongkos Kirim</span>
                                        <span className={`font-medium ${ongkosKirim === 0 ? 'text-green-600' : 'text-gray-800'}`}>
                                            {ongkosKirim === 0 ? 'GRATIS' : formatCurrency(ongkosKirim)}
                                        </span>
                                    </div>

                                    <div className="border-t-2 border-dashed border-gray-200 pt-4">
                                        <div className="flex justify-between items-center">
                                            <span className="font-bold text-gray-800">Total Pembayaran</span>
                                            <span className="text-2xl font-extrabold text-green-600">{formatCurrency(totalPembayaran)}</span>
                                        </div>
                                    </div>

                                    {/* Pay Button */}
                                    <button
                                        onClick={handleBayar}
                                        className="w-full py-4 bg-green-600 hover:bg-green-700 text-white font-bold rounded-xl shadow-lg hover:shadow-xl transition-all flex items-center justify-center gap-2"
                                    >
                                        <FiCreditCard /> Bayar Sekarang
                                    </button>

                                    {/* Back Link */}
                                    <Link
                                        href={isPickup ? route('checkout.index') : route('checkout.shipping')}
                                        className="w-full py-3 border-2 border-gray-200 text-gray-600 font-semibold rounded-xl flex items-center justify-center gap-2 hover:bg-gray-50 transition"
                                    >
                                        <FiArrowLeft /> Kembali
                                    </Link>

                                    {/* Security Note */}
                                    <p className="text-xs text-gray-400 text-center pt-2">
                                        🔒 Pembayaran aman via Midtrans
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </main>
            <FooterNote />
        </>
    );
}
