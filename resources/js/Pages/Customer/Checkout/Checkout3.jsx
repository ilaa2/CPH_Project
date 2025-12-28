import { Head, Link, useForm, router, usePage } from '@inertiajs/react'; // Tambahkan usePage
import { SiteHeader, FooterNote } from '@/Layouts/CustomerLayout';
import React, { useEffect } from 'react';
import Swal from 'sweetalert2';

// Controller akan mengirimkan semua props ini dari session
export default function Checkout3({ cartItems, subtotal, alamat, pengiriman, auth }) { // Terima prop 'auth'
    // Muat script Midtrans Snap saat komponen ini ditampilkan
    useEffect(() => {
        const script = document.createElement('script');
        script.src = "https://app.sandbox.midtrans.com/snap/snap.js"; // Ganti ke production jika sudah live
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
        const filteredParts = parts.filter(part => part && part.trim() !== 'undefined' && part.trim() !== 'null');
        return filteredParts.join(', ');
    };

    const ongkosKirim = pengiriman?.price || 0;
    const totalPembayaran = subtotal + ongkosKirim;

    return (
        <>
            <Head title="Checkout - Ringkasan & Pembayaran" />

            {/* --- BAGIAN YANG DIPERBAIKI --- */}
            {/* Kirimkan data 'auth' ke SiteHeader */}
            <SiteHeader auth={auth} />

            <main className="bg-gray-50 min-h-screen py-10">
                <div className="max-w-6xl mx-auto px-4">
                    <div className="flex items-center justify-center mb-8">
                        <div className="flex items-center text-green-600">
                            <div className="rounded-full border-2 border-green-600 bg-white text-green-600 w-8 h-8 flex items-center justify-center font-bold">✓</div>
                            <span className="hidden sm:inline font-semibold ml-2">Metode</span>
                        </div>
                        <div className="flex-auto border-t-2 border-green-600 mx-2 sm:mx-4"></div>
                        <div className="flex items-center text-green-600">
                            <div className="rounded-full border-2 border-green-600 bg-white text-green-600 w-8 h-8 flex items-center justify-center font-bold">✓</div>
                            <span className="hidden sm:inline font-semibold ml-2">Alamat</span>
                        </div>
                        <div className="flex-auto border-t-2 border-green-600 mx-2 sm:mx-4"></div>
                        <div className="flex items-center text-green-600">
                            <div className="rounded-full border-2 border-green-600 bg-white text-green-600 w-8 h-8 flex items-center justify-center font-bold">✓</div>
                            <span className="hidden sm:inline font-semibold ml-2">Pengiriman</span>
                        </div>
                        <div className="flex-auto border-t-2 border-green-600 mx-2 sm:mx-4"></div>
                        <div className="flex items-center text-green-600">
                            <div className="rounded-full border-2 border-green-600 bg-white text-green-600 w-8 h-8 flex items-center justify-center font-bold">4</div>
                            <span className="font-semibold ml-2">Bayar</span>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                        <div className="lg:col-span-2 space-y-6">
                            {/* PREPARATION TIME NOTICE FOR PICKUP */}
                            {pengiriman && pengiriman.name === 'Ambil Sendiri' && (
                                <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 rounded-md">
                                    <div className="flex">
                                        <div className="flex-shrink-0">
                                            <svg className="h-5 w-5 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
                                                <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                                            </svg>
                                        </div>
                                        <div className="ml-3">
                                            <p className="text-sm text-yellow-700">
                                                <span className="font-bold">Estimasi Waktu Penyiapan:</span> Pesanan Anda akan disiapkan dan siap diambil dalam waktu kurang lebih <span className="font-bold">15–30 menit</span> setelah konfirmasi pembayaran.
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            )}

                            <div className="bg-white p-6 rounded-lg shadow-md">
                                <h2 className="text-xl font-bold mb-4">Ringkasan Pesanan</h2>
                                <div className="divide-y divide-gray-200">
                                    {cartItems.map((item) => (
                                        <div key={item.id} className="flex items-center py-4">
                                            <img src={`/storage/${item.product.gambar}`} alt={item.product.nama} className="w-16 h-16 rounded-md object-cover mr-4" />
                                            <div className="flex-grow">
                                                <p className="font-semibold">{item.product.nama}</p>
                                                <p className="text-sm text-gray-500">{item.quantity} x {formatCurrency(item.product.harga)}</p>
                                            </div>
                                            <p className="font-semibold">{formatCurrency(item.product.harga * item.quantity)}</p>
                                        </div>
                                    ))}
                                </div>
                            </div>
                            <div className="bg-white p-6 rounded-lg shadow-md">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    {pengiriman && pengiriman.name !== 'Ambil Sendiri' && (
                                        <div>
                                            <h3 className="font-bold mb-2">Alamat Pengiriman</h3>
                                            <p className="font-semibold">{alamat.nama}</p>
                                            <p className="text-gray-600">{alamat.telepon}</p>
                                            <p className="text-gray-600 mt-1 text-sm">{formatAddress(alamat.full_address_string)}</p>
                                            <Link href={route('checkout.address')} className="text-green-600 hover:underline text-sm mt-2 inline-block">Ubah</Link>
                                        </div>
                                    )}

                                    <div>
                                        <h3 className="font-bold mb-2">Metode Pengiriman</h3>
                                        <p className="font-semibold">{pengiriman.name}</p>
                                        <p className="text-gray-600 text-sm">{pengiriman.description}</p>
                                        {pengiriman.name !== 'Ambil Sendiri' ? (
                                            <Link href={route('checkout.shipping')} className="text-green-600 hover:underline text-sm mt-2 inline-block">Ubah</Link>
                                        ) : (
                                            <Link href={route('checkout.index')} className="text-green-600 hover:underline text-sm mt-2 inline-block">Ubah Metode</Link>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="lg:col-span-1">
                            <div className="bg-white p-6 rounded-lg shadow-md sticky top-10">
                                <h2 className="text-xl font-bold mb-4">Rincian Pembayaran</h2>
                                <div className="space-y-2">
                                    <div className="flex justify-between">
                                        <span className="text-gray-600">Subtotal</span>
                                        <span className="font-medium">{formatCurrency(subtotal)}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-gray-600">Ongkos Kirim</span>
                                        <span className="font-medium">{formatCurrency(ongkosKirim)}</span>
                                    </div>
                                </div>
                                <div className="border-t-2 border-dashed my-4"></div>
                                <div className="flex justify-between font-bold text-lg">
                                    <span>Total Pembayaran</span>
                                    <span>{formatCurrency(totalPembayaran)}</span>
                                </div>
                                <button
                                    onClick={handleBayar}
                                    className="mt-6 w-full bg-green-600 text-white font-bold py-3 px-4 rounded-lg hover:bg-green-700 transition-colors"
                                >
                                    Bayar Sekarang
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </main>
            <FooterNote />
        </>
    );
}
