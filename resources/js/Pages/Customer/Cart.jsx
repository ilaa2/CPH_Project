import React, { useState, useEffect } from 'react';
import { Head, Link, router } from '@inertiajs/react';
import { FiTrash2, FiArrowLeft } from 'react-icons/fi';
import { SiteHeader, FooterNote } from '@/Layouts/CustomerLayout';
import { usePage } from '@inertiajs/react';

export default function Cart({ auth }) {
    const { cart } = usePage().props;
    const { items } = cart; // Ambil 'items' langsung, 'count' akan kita hitung ulang

    // State untuk melacak item mana saja yang dicentang
    const [selectedItems, setSelectedItems] = useState({});

    // Inisialisasi state: Semua item dicentang secara default saat halaman dimuat
    useEffect(() => {
        if (items) {
            const initialSelection = items.reduce((acc, item) => {
                acc[item.id] = true; // Set semua item menjadi terpilih (true)
                return acc;
            }, {});
            setSelectedItems(initialSelection);
        }
    }, [items]); // Dijalankan kembali jika 'items' berubah

    // Fungsi untuk menangani klik pada checkbox (centang/tidak)
    const handleSelectItem = (itemId) => {
        setSelectedItems(prevSelectedItems => ({
            ...prevSelectedItems,
            [itemId]: !prevSelectedItems[itemId], // Toggle nilai boolean (true -> false, false -> true)
        }));
    };

    // Fungsi untuk menghapus item
    const handleRemoveItem = (itemId) => {
        router.delete(route('cart.destroy', itemId), {
            preserveScroll: true,
            onSuccess: () => {
                // Hapus juga dari state 'selectedItems' jika berhasil dihapus
                setSelectedItems(prev => {
                    const newSelection = { ...prev };
                    delete newSelection[itemId];
                    return newSelection;
                });
            }
        });
    };

    // Fungsi untuk mengubah kuantitas
    const handleUpdateQuantity = (itemId, newQuantity) => {
        if (newQuantity < 1) {
            handleRemoveItem(itemId);
            return;
        }
        router.put(route('cart.update', itemId), { quantity: newQuantity }, { preserveScroll: true });
    };

    // Filter item yang dipilih sebelum dihitung
    const itemsToCalculate = items ? items.filter(item => selectedItems[item.id]) : [];
    const selectedItemsCount = itemsToCalculate.length;

    // Kalkulasi subtotal hanya untuk item yang dipilih
    const subtotal = itemsToCalculate.reduce((total, item) => total + item.product.harga * item.quantity, 0);
    const formattedSubtotal = new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(subtotal);

    // Fungsi untuk melanjutkan ke checkout
    const handleCheckout = () => {
        // Ambil hanya ID dari item yang dicentang
        const selectedIds = Object.keys(selectedItems).filter(id => selectedItems[id]);

        if (selectedIds.length === 0) {
            alert('Pilih setidaknya satu produk untuk melanjutkan ke checkout.');
            return;
        }

        // Kirim ID item yang dipilih ke backend menggunakan metode POST
        router.post(route('cart.processSelection'), { items: selectedIds });
    };

    return (
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
                        {items && items.length > 0 ? (
                            <div className="divide-y divide-gray-200">
                                {items.map((item) => (
                                    <div key={item.id} className="flex items-center gap-4 p-4">
                                        {/* === CHECKBOX DITAMBAHKAN DI SINI === */}
                                        <input
                                            type="checkbox"
                                            className="h-5 w-5 rounded border-gray-300 text-green-600 focus:ring-green-500 cursor-pointer"
                                            checked={!!selectedItems[item.id]}
                                            onChange={() => handleSelectItem(item.id)}
                                        />

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
                                        {/* Tampilkan jumlah item yang dipilih */}
                                        <p className="text-gray-600">Total ({selectedItemsCount} item)</p>
                                        <p className="font-bold text-xl">{formattedSubtotal}</p>
                                    </div>
                                    {/* Ganti <Link> dengan <button> untuk menjalankan fungsi checkout */}
                                    <button
                                        onClick={handleCheckout}
                                        disabled={selectedItemsCount === 0} // Tombol disable jika tidak ada item dipilih
                                        className={`bg-green-600 text-white font-bold py-3 px-6 rounded-lg transition-colors ${selectedItemsCount > 0 ? 'hover:bg-green-700' : 'opacity-50 cursor-not-allowed'}`}
                                    >
                                        Checkout
                                    </button>
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
