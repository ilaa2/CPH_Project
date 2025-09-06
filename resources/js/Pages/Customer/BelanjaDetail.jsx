// resources/js/Pages/Customer/BelanjaDetail.jsx

import { Head, Link, router } from '@inertiajs/react';
import { FiShoppingCart, FiChevronRight } from 'react-icons/fi';
import React, { useState } from 'react';
import { SiteHeader, FooterNote } from '@/Layouts/CustomerLayout';

import Swal from 'sweetalert2';
import 'sweetalert2/dist/sweetalert2.min.css';

export default function BelanjaDetail({ auth, product }) {
    const [quantity, setQuantity] = useState(1);

    const increment = () => setQuantity(prev => (prev < product.stok ? prev + 1 : prev));
    const decrement = () => setQuantity(prev => (prev > 1 ? prev - 1 : 1));

    const handleAddToCart = () => {
        const data = {
            product_id: product.id,
            quantity: quantity,
        };

        router.post(route('cart.store'), data, {
            onSuccess: () => {
                Swal.fire({
                    icon: 'success',
                    title: 'Berhasil!',
                    // ==========================================================
                    // INI BAGIAN YANG DIUBAH (quantity dihapus dari teks)
                    // ==========================================================
                    text: `"${product.nama}" telah ditambahkan ke keranjang.`,
                    // ==========================================================
                    showConfirmButton: false,
                    timer: 1500
                });
            },
            preserveScroll: true,
        });
    };

    const handleBuyNow = () => {
        Swal.fire({
            icon: 'info',
            title: 'Segera Hadir',
            text: 'Fitur "Beli Langsung" sedang dalam pengembangan.',
            confirmButtonText: 'Mengerti'
        });
    };

    const formattedPrice = new Intl.NumberFormat('id-ID', {
        style: 'currency',
        currency: 'IDR',
        minimumFractionDigits: 0
    }).format(product.harga);

    return (
        <div className="min-h-screen bg-gray-50">
            <Head title={product.nama} />
            <SiteHeader auth={auth} />

            <main className="py-6 sm:py-10">
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8 px-4">

                    <div className="flex items-center text-sm text-gray-500 mb-4">
                        <Link href={route('belanja.index')} className="hover:underline">Belanja</Link>
                        <FiChevronRight size={16} className="mx-1" />
                        <span className="font-semibold text-gray-700">Detail Produk</span>
                    </div>

                    <div className="bg-white rounded-lg shadow-sm p-4 sm:p-6">
                        <div className="grid grid-cols-1 md:grid-cols-5 gap-6 lg:gap-10 md:items-center">

                            <div className="md:col-span-2">
                                <div className="aspect-square w-full max-w-sm mx-auto overflow-hidden rounded-lg border">
                                    <img src={`/storage/${product.gambar}`} alt={product.nama} className="w-full h-full object-cover" />
                                </div>
                            </div>

                            <div className="md:col-span-3 flex flex-col">
                                <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-800">{product.nama}</h1>
                                <p className="text-3xl sm:text-4xl font-extrabold text-green-600 my-4">{formattedPrice}</p>

                                <div className="border-t pt-4 mt-4">
                                    <h3 className="text-md font-bold text-gray-800 mb-3">Detail</h3>
                                    <div className="space-y-2 text-sm">
                                        <div className="flex items-center">
                                            <span className="w-24 font-semibold text-gray-500">Kategori</span>
                                            <Link href={route('belanja.index', { kategori: product.kategori?.id })} className="font-semibold text-green-700 hover:underline">
                                                {product.kategori?.nama_kategori || 'Tidak ada'}
                                            </Link>
                                        </div>
                                        <div className="flex items-center">
                                            <span className="w-24 font-semibold text-gray-500">Stok</span>
                                            <span className="font-semibold text-gray-800">{product.stok} Tersedia</span>
                                        </div>
                                    </div>
                                </div>

                                <div className="border-t pt-4 mt-4">
                                    <h3 className="text-md font-bold text-gray-800 mb-2">Deskripsi</h3>
                                    <div className="prose prose-sm max-w-none text-gray-600">
                                        <p>{product.deskripsi}</p>
                                    </div>
                                </div>

                                <div className="mt-auto pt-6">
                                    <div className="flex items-center gap-4 mb-4">
                                        <p className="font-semibold text-sm text-gray-600">Jumlah</p>
                                        <div className="flex items-center border rounded-lg">
                                            <button onClick={decrement} className="px-3 py-1 sm:px-4 sm:py-2 text-xl font-bold text-gray-600 hover:bg-gray-100 rounded-l-lg transition">-</button>
                                            <input type="text" value={quantity} readOnly className="w-10 sm:w-12 h-9 sm:h-10 text-center border-y-0 border-x font-semibold" />
                                            <button onClick={increment} className="px-3 py-1 sm:px-4 sm:py-2 text-xl font-bold text-gray-600 hover:bg-gray-100 rounded-r-lg transition">+</button>
                                        </div>
                                    </div>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                        <button
                                            onClick={handleBuyNow}
                                            disabled={product.stok === 0}
                                            className="w-full flex items-center justify-center px-4 py-3 bg-green-100 text-green-700 border-2 border-green-600 font-bold rounded-lg transition-all hover:bg-green-200 hover:scale-105 disabled:bg-gray-200 disabled:text-gray-400 disabled:border-gray-300"
                                        >
                                            Beli Langsung
                                        </button>
                                        <button
                                            onClick={handleAddToCart}
                                            disabled={product.stok === 0}
                                            className="w-full flex items-center justify-center px-4 py-3 bg-green-600 text-white font-bold rounded-lg transition-all hover:bg-green-700 hover:scale-105 disabled:bg-gray-400"
                                        >
                                            <FiShoppingCart className="mr-2" />
                                            Tambah Keranjang
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </main>
            <FooterNote user={auth.user} />
        </div>
    );
}
