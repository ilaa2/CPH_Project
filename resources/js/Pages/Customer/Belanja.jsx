// resources/js/Pages/Customer/Belanja.jsx

import { Head, Link, router } from '@inertiajs/react';
import { GiFruitTree, GiHerbsBundle } from "react-icons/gi";
import { VscChecklist } from "react-icons/vsc";
import { FaCartPlus } from 'react-icons/fa';
import React from 'react';
import { SiteHeader, FooterNote } from '@/Layouts/CustomerLayout';

// 1. Impor SweetAlert2
import Swal from 'sweetalert2';
// Opsional: Impor CSS-nya jika belum di-load secara global
import 'sweetalert2/dist/sweetalert2.min.css';


export default function Belanja({ auth, products, filters }) {

    // 2. Ubah fungsi handleAddToCart
    const handleAddToCart = (product) => {
        router.post('/customer/cart', {
            product_id: product.id,
            quantity: 1,
        }, {
            onSuccess: () => {
                // Ganti alert() standar dengan Swal.fire()
                Swal.fire({
                    icon: 'success',
                    title: 'Berhasil!',
                    text: `"${product.nama}" telah ditambahkan ke keranjang.`,
                    // Opsi tambahan agar alert hilang otomatis setelah 1.5 detik
                    showConfirmButton: false,
                    timer: 1500
                });
            },
            preserveScroll: true,
        });
    };

    const FilterButton = ({ categoryId, label, icon }) => (
        <Link
            href={`/customer/belanja?kategori=${categoryId}`}
            preserveState
            preserveScroll
            className={`flex items-center justify-center gap-2 px-6 py-3 text-sm font-bold rounded-full transition-all duration-300 border-2 ${
                filters.kategori == categoryId
                    ? 'bg-green-700 text-white border-green-700'
                    : 'bg-white text-slate-700 border-gray-200 hover:bg-green-50 hover:border-green-300'
            }`}
        >
            {icon}
            {label}
        </Link>
    );

    return (
        <div className="min-h-screen w-full bg-gray-50 text-gray-800">
            <Head title="Belanja" />

            <SiteHeader auth={auth} />

            <main className="py-12">
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8 px-4">
                    <section className="text-center mb-10">
                        <h1 className="text-4xl sm:text-5xl font-extrabold text-green-800 mb-2">Produk Segar Kami</h1>
                        <p className="text-lg text-green-700 max-w-2xl mx-auto">Jelajahi pilihan buah dan sayuran terbaik kami yang bebas pestisida.</p>
                    </section>

                    <div className="flex justify-center items-center gap-4 mb-12">
                        <FilterButton categoryId="" label="Semua" icon={<VscChecklist size={20} />} />
                        <FilterButton categoryId="1" label="Sayuran" icon={<GiHerbsBundle size={20} />} />
                        <FilterButton categoryId="2" label="Buah" icon={<GiFruitTree size={20} />} />
                    </div>

                    <section className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
                        {products.length > 0 ? (
                            products.map((product) => (
                                <ProductCard key={product.id} product={product} handleAddToCart={handleAddToCart} />
                            ))
                        ) : (
                            <div className="col-span-full text-center text-gray-500 py-16">
                                Tidak ada produk yang ditemukan untuk kategori ini.
                            </div>
                        )}
                    </section>
                </div>
            </main>

            <FooterNote user={auth.user} />
        </div>
    );
}

// -- KOMPONEN KARTU PRODUK --
function ProductCard({ product, handleAddToCart }) {
    const imageUrl = `/storage/${product.gambar}`;

    const onAddToCartClick = (e) => {
        e.stopPropagation(); // Mencegah event klik menyebar ke Link parent
        e.preventDefault(); // Mencegah aksi default dari Link jika ada
        handleAddToCart(product);
    };

    return (
        <Link
            href={`/customer/belanja/${product.id}`}
            className="group bg-white rounded-2xl shadow-md overflow-hidden transition-all duration-300 hover:shadow-xl hover:-translate-y-2 flex flex-col"
        >
            <div className="relative w-full aspect-square overflow-hidden">
                <img
                    src={imageUrl}
                    alt={product.nama}
                    className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                />
                {product.stok === 0 && (
                    <span className="absolute top-3 left-3 bg-slate-700 text-white text-xs font-bold px-3 py-1 rounded-full">Habis</span>
                )}
                <span className="absolute bottom-3 right-3 bg-green-600 text-white text-xs font-semibold px-3 py-1 rounded-full shadow">
                    {product.kategori ? product.kategori.nama_kategori : "Tanpa Kategori"}
                </span>
            </div>

            <div className="p-5 border-t flex flex-col flex-grow">
                <h3 className="text-lg font-bold text-slate-800 line-clamp-1">{product.nama}</h3>
                <p className="text-xl font-extrabold text-green-700 mt-2 mb-2">
                    {new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(product.harga)}
                </p>
                {product.stok > 0 && (
                    <p className="text-xs text-gray-500 mb-3">Stok: {product.stok} tersedia</p>
                )}
                <div className="mt-auto">
                    <button
                        onClick={onAddToCartClick}
                        disabled={product.stok === 0}
                        className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-green-600 text-white text-sm font-semibold rounded-full hover:bg-green-700 disabled:bg-slate-400 disabled:cursor-not-allowed transition-colors"
                    >
                        <FaCartPlus />
                        Keranjang
                    </button>
                </div>
            </div>
        </Link>
    );
}
