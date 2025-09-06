// resources/js/Pages/Customer/Cart.jsx

import React from 'react';
import { Head, Link, router } from '@inertiajs/react';
import { FiTrash2, FiArrowLeft } from 'react-icons/fi';
import { SiteHeader, FooterNote } from '@/Layouts/CustomerLayout'; // Impor layout Anda
import { usePage } from '@inertiajs/react';

// Sekarang ini adalah komponen Halaman, bukan lagi Drawer
export default function Cart({ auth }) {
    // Ambil data keranjang dari shared props
    const { cart } = usePage().props;
    const { items, count } = cart;

    // Fungsi untuk menghapus item
    const handleRemoveItem = (itemId) => {
        router.delete(route('cart.destroy', itemId), { preserveScroll: true });
    };

    // Fungsi untuk mengubah kuantitas
    const handleUpdateQuantity = (itemId, newQuantity) => {
        if (newQuantity < 1) {
            handleRemoveItem(itemId);
            return;
        }
        router.put(route('cart.update', itemId), { quantity: newQuantity }, { preserveScroll: true });
    };

    const subtotal = items.reduce((total, item) => total + item.product.harga * item.quantity, 0);
    const formattedSubtotal = new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(subtotal);

    return (
        // Bungkus dengan div utama
        <div className="min-h-screen bg-gray-50">
            <Head title="Keranjang Belanja" />
            <SiteHeader auth={auth} />

            <main className="py-10">
                <div className="max-w-4xl mx-auto sm:px-6 lg:px-8 px-4">
                    <div className="flex items-center mb-6">
                        <Link href={route('belanja.index')} className="text-green-600 hover:text-green-800 flex items-center">
                            <FiArrowLeft className="mr-2" />
                            Kembali Belanja
                        </Link>
                    </div>

                    <h1 className="text-3xl font-bold text-gray-800 mb-6">Keranjang Anda</h1>

                    <div className="bg-white rounded-lg shadow-md">
                        {/* Daftar Item */}
                        {items && items.length > 0 ? (
                            <div className="divide-y divide-gray-200">
                                {items.map((item) => (
                                    <div key={item.id} className="flex items-center gap-4 p-4">
                                        <img src={`/storage/${item.product.gambar}`} alt={item.product.nama} className="w-20 h-20 rounded-md object-cover border" />
                                        <div className="flex-grow">
                                            <p className="font-semibold text-gray-800">{item.product.nama}</p>
                                            <p className="text-sm text-gray-500">{new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR' }).format(item.product.harga)}</p>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <button onClick={() => handleUpdateQuantity(item.id, item.quantity - 1)} className="w-8 h-8 border rounded-md text-gray-600 hover:bg-gray-50">-</button>
                                            <span className="w-10 text-center font-semibold">{item.quantity}</span>
                                            <button onClick={() => handleUpdateQuantity(item.id, item.quantity + 1)} className="w-8 h-8 border rounded-md text-gray-600 hover:bg-gray-50">+</button>
                                        </div>
                                        <div className="text-right w-24">
                                            <p className="font-bold">{new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR' }).format(item.product.harga * item.quantity)}</p>
                                        </div>
                                        <button onClick={() => handleRemoveItem(item.id)} className="text-red-500 hover:text-red-700 p-2">
                                            <FiTrash2 />
                                        </button>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="text-center text-gray-500 p-10">
                                <p>Keranjang belanja Anda masih kosong.</p>
                            </div>
                        )}

                        {/* Ringkasan Belanja */}
                        {items && items.length > 0 && (
                            <div className="p-4 border-t bg-gray-50 rounded-b-lg">
                                <div className="flex justify-end items-center gap-6">
                                    <div className="text-right">
                                        <p className="text-gray-600">Total ({count} item)</p>
                                        <p className="font-bold text-xl">{formattedSubtotal}</p>
                                    </div>
                                    <Link href="#" className="bg-green-600 text-white font-bold py-3 px-6 rounded-lg hover:bg-green-700 transition-colors">
                                        Checkout
                                    </Link>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </main>

            <FooterNote user={auth.user} />
        </div>
    );
}
