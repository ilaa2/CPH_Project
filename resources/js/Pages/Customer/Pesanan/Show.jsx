import React from 'react';
import { Head, Link, usePage } from '@inertiajs/react';
import { SiteHeader, FooterNote } from '@/Layouts/CustomerLayout';
import { FiCheckCircle, FiUser, FiTruck, FiArchive } from 'react-icons/fi';

// Terima 'auth' dari props global Inertia
export default function Show({ pesanan, auth }) {
    const { flash } = usePage().props;

    const formatCurrency = (number) => {
        return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(number);
    };

    const formatDate = (dateString) => {
        const options = { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' };
        return new Date(dateString).toLocaleDateString('id-ID', options);
    };

    const subtotal = pesanan.items.reduce((acc, item) => acc + parseFloat(item.subtotal), 0);

    return (
        <>
            <Head title={`Detail Pesanan #${pesanan.nomor_pesanan}`} />

            {/* --- BAGIAN YANG DIPERBAIKI --- */}
            <SiteHeader auth={auth} />

            <main className="bg-gray-50/50 font-sans py-12 sm:py-16">
                <div className="max-w-4xl mx-auto px-4">

                    <div className="bg-white rounded-2xl shadow-lg border border-gray-100">
                        <div className="bg-green-50 p-6 sm:p-8 text-center rounded-t-2xl">
                            <FiCheckCircle className="text-green-500 text-5xl mx-auto mb-4 animate-pulse" />
                            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 tracking-tight">Pesanan Diterima</h1>
                            <p className="text-gray-600 mt-2">Terima kasih! Pesanan Anda sedang kami proses.</p>
                        </div>

                        <div className="p-6 sm:p-8">
                            {flash.success && (
                                <div className="bg-green-100 border-l-4 border-green-500 text-green-800 p-4 rounded-md mb-8" role="alert">
                                    <p>{flash.success}</p>
                                </div>
                            )}

                            <div className="flex justify-between items-center mb-6 pb-4 border-b">
                                <div>
                                    <p className="text-sm text-gray-500">Nomor Pesanan</p>
                                    <p className="font-semibold text-green-600 text-lg">{pesanan.nomor_pesanan || '-'}</p>
                                </div>
                                <div>
                                    <p className="text-sm text-gray-500 text-right">Tanggal</p>
                                    <p className="font-medium text-gray-700">{formatDate(pesanan.created_at)}</p>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
                                <div className="space-y-1">
                                    <h3 className="font-semibold text-gray-800 flex items-center"><FiUser className="mr-2 text-green-500"/>Info Pelanggan</h3>
                                    <p className="text-sm text-gray-600">{pesanan.pelanggan.nama}</p>
                                </div>
                                <div className="space-y-1">
                                    <h3 className="font-semibold text-gray-800 flex items-center"><FiTruck className="mr-2 text-green-500"/>Info Pengiriman</h3>
                                    <address className="text-sm text-gray-600 not-italic">
                                        {pesanan.alamat_pengiriman || 'Alamat tidak tersedia'}
                                        <br/>
                                        <span className="font-medium">{pesanan.metode_pengiriman || 'Metode tidak ada'}</span>
                                    </address>
                                </div>
                            </div>

                            <h3 className="font-semibold text-lg text-gray-800 flex items-center mb-4"><FiArchive className="mr-2 text-green-500"/>Rincian Produk</h3>
                            <ul className="divide-y divide-gray-200 border rounded-lg overflow-hidden">
                                {pesanan.items.map((item) => (
                                    <li key={item.id} className="flex items-center p-4 bg-white hover:bg-gray-50 transition-colors">
                                        <img src={`/storage/${item.produk.gambar}`} alt={item.produk.nama} className="w-16 h-16 rounded-lg object-cover mr-4 border" />
                                        <div className="flex-grow">
                                            <p className="font-semibold text-gray-800">{item.produk.nama}</p>
                                            <p className="text-sm text-gray-500">{item.jumlah} x {formatCurrency(item.produk.harga)}</p>
                                        </div>
                                        <p className="font-semibold text-gray-900">{formatCurrency(item.subtotal)}</p>
                                    </li>
                                ))}
                            </ul>

                            <div className="mt-6 flex justify-end">
                                <div className="w-full max-w-xs space-y-2">
                                    <div className="flex justify-between text-sm">
                                        <span className="text-gray-600">Subtotal Produk</span>
                                        <span className="font-medium text-gray-900">{formatCurrency(subtotal)}</span>
                                    </div>
                                    <div className="flex justify-between text-sm">
                                        <span className="text-gray-600">Ongkos Kirim</span>
                                        <span className="font-medium text-gray-900">{formatCurrency(pesanan.biaya_pengiriman)}</span>
                                    </div>
                                    <div className="flex justify-between font-bold text-lg mt-2 pt-2 border-t">
                                        <span>Total</span>
                                        <span className="text-green-600">{formatCurrency(pesanan.total)}</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* --- Tombol Aksi (Baru, Sesuai Keinginan Anda) --- */}
                    <div className="mt-8 pt-6 border-t text-center">
                        <Link href={route('belanja.index')} className="bg-green-600 text-white font-bold py-3 px-8 rounded-lg hover:bg-green-700 transition-colors shadow-sm">
                            Lanjut Belanja
                        </Link>
                    </div>
                </div>
            </main>
            <FooterNote />
        </>
    );
}
