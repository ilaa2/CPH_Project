import { Head, Link, router, usePage } from '@inertiajs/react'; // DIUBAH: Tambah usePage
import { FiShoppingCart } from 'react-icons/fi';
import React, { useState } from 'react';
import CustomerLayout from '@/Layouts/CustomerLayout';

import Swal from 'sweetalert2';
import 'sweetalert2/dist/sweetalert2.min.css';

export default function BelanjaDetail({ product, reviews = [], reviewStats = { total: 0, average: 0, counts: { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 } } }) {
    const { auth } = usePage().props; // DIUBAH: Ambil auth dari usePage
    const [quantity, setQuantity] = useState(1);

    const increment = () => setQuantity(prev => (prev < product.stok ? prev + 1 : prev));
    const decrement = () => setQuantity(prev => (prev > 1 ? prev - 1 : 1));

    const handleQuantityChange = (e) => {
        const value = e.target.value;
        if (value === '') {
            setQuantity('');
            return;
        }
        const num = parseInt(value, 10);
        if (!isNaN(num)) {
            if (num > product.stok) {
                setQuantity(product.stok);
                Swal.fire({
                    icon: 'warning',
                    title: 'Stok Tidak Cukup',
                    text: `Jumlah melebihi stok yang tersedia (${product.stok}).`,
                    showConfirmButton: false,
                    timer: 1500
                });
            } else if (num < 1) {
                setQuantity(1);
            } else {
                setQuantity(num);
            }
        }
    };

    const handleBlur = () => {
        if (quantity === '' || quantity < 1) {
            setQuantity(1);
        }
    };

    const checkAuth = () => {
        if (!auth.pelanggan) {
            Swal.fire({
                title: 'Anda Belum Login',
                text: "Silakan login terlebih dahulu untuk melakukan transaksi.",
                icon: 'warning',
                showCancelButton: true,
                confirmButtonColor: '#16a34a',
                cancelButtonColor: '#d33',
                confirmButtonText: 'Login Sekarang',
                cancelButtonText: 'Batal'
            }).then((result) => {
                if (result.isConfirmed) {
                    router.visit('/login');
                }
            });
            return false;
        }
        return true;
    };

    const handleAddToCart = () => {
        if (!checkAuth()) return; // Cek login

        router.post(route('cart.store'), {
            product_id: product.id,
            quantity: quantity,
        }, {
            onSuccess: () => {
                Swal.fire({
                    toast: true,
                    position: 'top-end',
                    icon: 'success',
                    title: 'Ditambahkan ke keranjang!',
                    showConfirmButton: false,
                    timer: 2000
                });
            },
            preserveScroll: true,
        });
    };

    const handleBuyNow = () => {
        if (!checkAuth()) return; // Cek login

        router.post(route('checkout.buyNow'), {
            product_id: product.id,
            quantity: quantity,
        });
    };

    const formattedPrice = new Intl.NumberFormat('id-ID', {
        style: 'currency',
        currency: 'IDR',
        minimumFractionDigits: 0
    }).format(product.harga);

    return (
        <CustomerLayout>
            <Head title={product.nama} />
            <main className="py-6 sm:py-10">
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8 px-4">
                    <div className="bg-white rounded-lg shadow-sm overflow-hidden">
                        {/* Product Header - Back, Category & Title in one cohesive block */}
                        <div className="bg-gradient-to-r from-green-50 to-white border-b px-4 sm:px-6 py-4">
                            <div className="flex items-center gap-4">
                                <Link
                                    href={product.kategori ? `/customer/belanja?category=${product.kategori.id}` : '/customer/belanja'}
                                    className="flex items-center justify-center w-10 h-10 rounded-full bg-white border border-gray-200 text-gray-500 hover:text-green-600 hover:border-green-300 hover:bg-green-50 transition-all shadow-sm"
                                    title="Kembali"
                                >
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
                                    </svg>
                                </Link>
                                <div className="flex-1 min-w-0">
                                    {product.kategori && (
                                        <Link
                                            href={`/customer/belanja?category=${product.kategori.id}`}
                                            className="inline-flex items-center gap-1 px-2.5 py-1 bg-green-100 text-green-700 text-xs font-semibold rounded-full hover:bg-green-200 transition-colors mb-1"
                                        >
                                            {product.kategori.nama_kategori}
                                        </Link>
                                    )}
                                    <h1 className="text-xl sm:text-2xl font-bold text-gray-800 truncate">{product.nama}</h1>
                                </div>
                            </div>
                        </div>

                        {/* Product Content */}
                        <div className="p-4 sm:p-6">
                            <div className="grid grid-cols-1 md:grid-cols-5 gap-6 lg:gap-10 md:items-center">
                                <div className="md:col-span-2">
                                    <div className="aspect-square w-full max-w-sm mx-auto overflow-hidden rounded-lg border">
                                        <img src={`/storage/${product.gambar}`} alt={product.nama} className="w-full h-full object-cover" />
                                    </div>
                                </div>
                                <div className="md:col-span-3 flex flex-col">
                                    <p className="text-3xl sm:text-4xl font-extrabold text-green-600 mb-4">{formattedPrice}</p>
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
                                                <input
                                                    type="number"
                                                    value={quantity}
                                                    onChange={handleQuantityChange}
                                                    onBlur={handleBlur}
                                                    className="w-10 sm:w-12 h-9 sm:h-10 text-center border-y-0 border-x font-semibold no-spinner"
                                                />
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
                    {/* End Product Card */}

                    {/* Review Section */}
                    <div className="mt-6 bg-white rounded-lg shadow-sm p-4 sm:p-6">
                        <h2 className="text-xl sm:text-2xl font-bold text-gray-800 mb-6">Ulasan Pelanggan</h2>

                        {reviews && reviews.length > 0 ? (
                            <div>
                                <div className="flex flex-col md:flex-row gap-8 mb-8">
                                    {/* Summary Stats */}
                                    <div className="md:w-1/3 text-center md:text-left">
                                        <div className="flex items-end gap-2 justify-center md:justify-start">
                                            <span className="text-5xl font-bold text-gray-800">{reviewStats.average}</span>
                                            <span className="text-gray-500 mb-2">/ 5</span>
                                        </div>
                                        <div className="flex justify-center md:justify-start my-2 text-yellow-400 text-xl">
                                            {'★'.repeat(Math.round(reviewStats.average))}{'☆'.repeat(5 - Math.round(reviewStats.average))}
                                        </div>
                                        <p className="text-gray-500 text-sm">{reviewStats.total} Ulasan</p>
                                    </div>

                                    {/* Rating Bars */}
                                    <div className="md:w-2/3 space-y-2">
                                        {[5, 4, 3, 2, 1].map((star) => (
                                            <div key={star} className="flex items-center gap-3">
                                                <span className="text-sm font-semibold text-gray-600 w-3">{star}</span>
                                                <div className="flex-1 bg-gray-100 rounded-full h-2.5">
                                                    <div
                                                        className="bg-yellow-400 h-2.5 rounded-full"
                                                        style={{ width: `${reviewStats.total > 0 ? (reviewStats.counts[star] / reviewStats.total) * 100 : 0}%` }}
                                                    ></div>
                                                </div>
                                                <span className="text-sm text-gray-500 w-8 text-right">{reviewStats.counts[star]}</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                {/* Review List */}
                                <div className="space-y-6">
                                    {reviews.map((review) => (
                                        <div key={review.id} className="border-t pt-6">
                                            <div className="flex items-start gap-4">
                                                <div className="flex-shrink-0">
                                                    {review.pelanggan?.foto_profil ? (
                                                        <img
                                                            src={`/storage/${review.pelanggan.foto_profil}`}
                                                            alt={review.pelanggan.nama}
                                                            className="w-10 h-10 rounded-full object-cover"
                                                        />
                                                    ) : (
                                                        <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center text-gray-500">
                                                            P
                                                        </div>
                                                    )}
                                                </div>
                                                <div className="flex-1">
                                                    <div className="flex justify-between items-start">
                                                        <div>
                                                            <h4 className="font-semibold text-gray-900">{review.pelanggan?.nama || 'Pelanggan'}</h4>
                                                            <div className="flex items-center gap-2 mt-1">
                                                                <div className="flex text-yellow-400 text-sm">
                                                                    {'★'.repeat(review.rating)}{'☆'.repeat(5 - review.rating)}
                                                                </div>
                                                                <span className="text-xs text-gray-400">
                                                                    {new Date(review.tanggal).toLocaleDateString('id-ID', {
                                                                        day: 'numeric', month: 'long', year: 'numeric'
                                                                    })}
                                                                </span>
                                                            </div>
                                                        </div>
                                                    </div>
                                                    <p className="mt-2 text-gray-700 leading-relaxed text-sm">{review.komentar}</p>

                                                    {/* Foto Ulasan */}
                                                    {review.fotos && review.fotos.length > 0 && (
                                                        <div className="flex gap-2 mt-3 overflow-x-auto pb-2">
                                                            {review.fotos.map((foto, idx) => (
                                                                <img
                                                                    key={idx}
                                                                    src={`/storage/${foto.foto_path}`}
                                                                    alt={`Ulasan ${idx + 1}`}
                                                                    className="w-20 h-20 object-cover rounded-lg border border-gray-200 cursor-pointer hover:opacity-80 transition"
                                                                    onClick={() => window.open(`/storage/${foto.foto_path}`, '_blank')}
                                                                />
                                                            ))}
                                                        </div>
                                                    )}

                                                    {/* Balasan Admin */}
                                                    {review.balasan && (
                                                        <div className="mt-3 bg-gray-50 p-3 rounded-lg border border-gray-200 ml-4 max-w-2xl">
                                                            <p className="text-xs font-bold text-green-700 mb-1">
                                                                Respon Penjual • <span className="font-normal text-gray-500">
                                                                    {review.tanggal_balasan ? new Date(review.tanggal_balasan).toLocaleDateString('id-ID') : ''}
                                                                </span>
                                                            </p>
                                                            <p className="text-xs text-gray-700">{review.balasan}</p>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        ) : (
                            <div className="text-center py-10 bg-gray-50 rounded-lg">
                                <p className="text-gray-500 mb-2">Belum ada ulasan untuk produk ini.</p>
                                <p className="text-sm text-gray-400">Jadilah yang pertama memberikan ulasan setelah membeli!</p>
                            </div>
                        )}
                    </div>
                </div>
            </main>
        </CustomerLayout>
    );
}

