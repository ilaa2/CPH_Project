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
                        onSuccess: function(result){
                            Swal.fire('Berhasil', 'Pembayaran sukses!', 'success')
                                .then(() => router.visit(redirect_url));
                        },
                        onPending: function(result){
                            Swal.fire('Info', 'Pembayaran Anda tertunda.', 'info')
                                .then(() => router.visit(redirect_url));
                        },
                        onError: function(result){
                            Swal.fire('Error', 'Pembayaran gagal.', 'error');
                        },
                        onClose: function(){
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
                            <div className="rounded-full bg-green-600 text-white w-8 h-8 flex items-center justify-center">✓</div>
                            <span className="font-semibold ml-2">Alamat</span>
                        </div>
                        <div className="flex-auto border-t-2 border-green-600 mx-4"></div>
                        <div className="flex items-center text-green-600">
                            <div className="rounded-full bg-green-600 text-white w-8 h-8 flex items-center justify-center">✓</div>
                            <span className="font-semibold ml-2">Pengiriman</span>
                        </div>
                        <div className="flex-auto border-t-2 border-green-600 mx-4"></div>
                        <div className="flex items-center text-green-600">
                            <div className="rounded-full border-2 border-green-600 bg-white text-green-600 w-8 h-8 flex items-center justify-center font-bold">3</div>
                            <span className="font-semibold ml-2">Pembayaran</span>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                        <div className="lg:col-span-2 space-y-6">
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
                                    <div>
                                        <h3 className="font-bold mb-2">Alamat Pengiriman</h3>
                                        <p className="font-semibold">{alamat.nama}</p>
                                        <p className="text-gray-600">{alamat.telepon}</p>
                                        <p className="text-gray-600 mt-1 text-sm">{formatAddress(alamat.full_address_string)}</p>
                                        <Link href={route('checkout.index')} className="text-green-600 hover:underline text-sm mt-2 inline-block">Ubah</Link>
                                    </div>
                                    <div>
                                        <h3 className="font-bold mb-2">Metode Pengiriman</h3>
                                        <p className="font-semibold">{pengiriman.name}</p>
                                        <p className="text-gray-600 text-sm">{pengiriman.description}</p>
                                        <Link href={route('checkout.shipping')} className="text-green-600 hover:underline text-sm mt-2 inline-block">Ubah</Link>
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
