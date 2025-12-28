import { Fragment, useState, useEffect } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { XMarkIcon, TrashIcon, PlusIcon, MinusIcon } from '@heroicons/react/24/outline';
import { Link, router } from '@inertiajs/react';

// Komponen untuk mengatur jumlah (quantity)
function QuantityInput({ item }) {
    const updateQuantity = (newQuantity) => {
        if (newQuantity < 1) return;
        router.put(route('cart.update', item.id),
            { quantity: newQuantity },
            { preserveScroll: true }
        );
    };

    return (
        <div className="flex items-center border border-gray-200 rounded">
            <button onClick={() => updateQuantity(item.quantity - 1)} className="px-2 py-1 text-gray-600 hover:bg-gray-100">-</button>
            <span className="px-3 text-sm">{item.quantity}</span>
            <button onClick={() => updateQuantity(item.quantity + 1)} className="px-2 py-1 text-gray-600 hover:bg-gray-100">+</button>
        </div>
    );
}

export default function CartPanel({ open, setOpen, cartItems = [] }) {
    const [selectedItems, setSelectedItems] = useState([]);
    const [subtotal, setSubtotal] = useState(0);

    // Hitung ulang subtotal saat item terpilih atau cartItems berubah
    useEffect(() => {
        const newSubtotal = cartItems
            .filter(item => selectedItems.includes(item.id))
            .reduce((total, item) => total + item.product.harga * item.quantity, 0);
        setSubtotal(newSubtotal);
    }, [selectedItems, cartItems]);

    const handleSelectItem = (itemId) => {
        setSelectedItems(prev =>
            prev.includes(itemId) ? prev.filter(id => id !== itemId) : [...prev, itemId]
        );
    };

    const handleSelectAll = (e) => {
        if (e.target.checked) {
            setSelectedItems(cartItems.map(item => item.id));
        } else {
            setSelectedItems([]);
        }
    };

    const handleRemoveItem = (itemId) => {
        router.delete(route('cart.destroy', itemId), { preserveScroll: true });
    };

    const handleCheckout = () => {
        if (selectedItems.length === 0) {
            alert('Pilih produk terlebih dahulu untuk melanjutkan.');
            return;
        }
        // Redirect directly to checkout index with selected items as query params
        router.get(route('checkout.index'), { items: selectedItems });
    };

    const isAllSelected = cartItems.length > 0 && selectedItems.length === cartItems.length;

    return (
        <Transition.Root show={open} as={Fragment}>
            <Dialog as="div" className="relative z-50" onClose={setOpen}>
                {/* ... (kode latar belakang dialog tetap sama) ... */}
                <Transition.Child as={Fragment} enter="ease-in-out duration-500" enterFrom="opacity-0" enterTo="opacity-100" leave="ease-in-out duration-500" leaveFrom="opacity-100" leaveTo="opacity-0">
                    <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" />
                </Transition.Child>

                <div className="fixed inset-0 overflow-hidden">
                    <div className="absolute inset-0 overflow-hidden">
                        <div className="pointer-events-none fixed inset-y-0 right-0 flex max-w-full pl-10">
                            <Transition.Child as={Fragment} enter="transform transition ease-in-out duration-500 sm:duration-700" enterFrom="translate-x-full" enterTo="translate-x-0" leave="transform transition ease-in-out duration-500 sm:duration-700" leaveFrom="translate-x-0" leaveTo="translate-x-full">
                                <Dialog.Panel className="pointer-events-auto w-screen max-w-md">
                                    <div className="flex h-full flex-col overflow-y-scroll bg-white shadow-xl">
                                        <div className="flex-1 overflow-y-auto px-4 py-6 sm:px-6">
                                            <div className="flex items-start justify-between">
                                                <Dialog.Title className="text-lg font-medium text-gray-900">Keranjang Belanja</Dialog.Title>
                                                <div className="ml-3 flex h-7 items-center">
                                                    <button type="button" className="relative -m-2 p-2 text-gray-400 hover:text-gray-500" onClick={() => setOpen(false)}>
                                                        <span className="sr-only">Close panel</span>
                                                        <XMarkIcon className="h-6 w-6" aria-hidden="true" />
                                                    </button>
                                                </div>
                                            </div>

                                            <div className="mt-8">
                                                <div className="flow-root">
                                                    {cartItems.length > 0 ? (
                                                        <>
                                                            <div className="flex items-center justify-between mb-4 border-b pb-2">
                                                                <label className="flex items-center text-sm text-gray-600">
                                                                    <input type="checkbox" checked={isAllSelected} onChange={handleSelectAll} className="h-4 w-4 rounded border-gray-300 text-green-600 focus:ring-green-500" />
                                                                    <span className="ml-2">Pilih Semua</span>
                                                                </label>
                                                            </div>
                                                            <ul role="list" className="-my-6 divide-y divide-gray-200">
                                                                {cartItems.map((item) => (
                                                                    <li key={item.id} className="flex items-center py-6">
                                                                        <input type="checkbox" checked={selectedItems.includes(item.id)} onChange={() => handleSelectItem(item.id)} className="h-4 w-4 rounded border-gray-300 text-green-600 focus:ring-green-500 mr-4" />
                                                                        <div className="h-20 w-20 flex-shrink-0 overflow-hidden rounded-md border border-gray-200">
                                                                            <img src={`/storage/${item.product.gambar}`} alt={item.product.nama} className="h-full w-full object-cover object-center" />
                                                                        </div>
                                                                        <div className="ml-4 flex flex-1 flex-col">
                                                                            <div>
                                                                                <div className="flex justify-between text-base font-medium text-gray-900">
                                                                                    <h3><Link href={`/customer/belanja/${item.product.id}`}>{item.product.nama}</Link></h3>
                                                                                    <p className="ml-4">{new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR' }).format(item.product.harga * item.quantity)}</p>
                                                                                </div>
                                                                            </div>
                                                                            <div className="flex flex-1 items-end justify-between text-sm mt-2">
                                                                                <QuantityInput item={item} />
                                                                                <div className="flex">
                                                                                    <button onClick={() => handleRemoveItem(item.id)} type="button" className="font-medium text-red-600 hover:text-red-500 flex items-center gap-1">
                                                                                        <TrashIcon className="h-4 w-4" /> Hapus
                                                                                    </button>
                                                                                </div>
                                                                            </div>
                                                                        </div>
                                                                    </li>
                                                                ))}
                                                            </ul>
                                                        </>
                                                    ) : (
                                                        <p className="text-center text-gray-500">Keranjang Anda masih kosong.</p>
                                                    )}
                                                </div>
                                            </div>
                                        </div>

                                        <div className="border-t border-gray-200 px-4 py-6 sm:px-6">
                                            <div className="flex justify-between text-base font-medium text-gray-900">
                                                <p>Subtotal</p>
                                                <p>{new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR' }).format(subtotal)}</p>
                                            </div>
                                            <p className="mt-0.5 text-sm text-gray-500">Hanya untuk produk yang dipilih.</p>
                                            <div className="mt-6">
                                                <button onClick={handleCheckout} className="w-full flex items-center justify-center rounded-md border border-transparent bg-green-600 px-6 py-3 text-base font-medium text-white shadow-sm hover:bg-green-700 disabled:opacity-50" disabled={selectedItems.length === 0}>
                                                    Lanjut ke Checkout
                                                </button>
                                            </div>

                                        </div>
                                    </div>
                                </Dialog.Panel>
                            </Transition.Child>
                        </div>
                    </div>
                </div>
            </Dialog>
        </Transition.Root>
    );
}
