import { Head, Link, useForm } from '@inertiajs/react';
import { SiteHeader, FooterNote } from '@/Layouts/CustomerLayout';
import React from 'react';
import Swal from 'sweetalert2';

export default function Checkout2({ alamat, auth, shippingOptions = [] }) {
    const { data, setData, post, processing, errors } = useForm({
        pengiriman: null,
    });

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!data.pengiriman) {
            Swal.fire({
                icon: 'error',
                title: 'Oops...',
                text: 'Anda harus memilih satu metode pengiriman!',
            });
            return;
        }

        post(route('checkout.saveShipping'), {
            onError: (errors) => {
                console.error("Error saving shipping:", errors);
                const errorMessage = Object.values(errors).join(' ');
                Swal.fire({
                    icon: 'error',
                    title: 'Gagal menyimpan pengiriman',
                    text: errorMessage || 'Terjadi kesalahan saat menyimpan metode pengiriman.',
                });
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

    return (
            <Head title="Checkout - Metode Pengiriman" />
            <SiteHeader auth={auth} />

            <main className="bg-gray-50 min-h-screen py-10">
                <div className="max-w-4xl mx-auto px-4">
                    {/* Progress Bar */}
                    <div className="flex items-center justify-center mb-8">
                        <div className="flex items-center text-green-600">
                            <div className="rounded-full bg-green-600 text-white w-8 h-8 flex items-center justify-center">✓</div>
                            <span className="font-semibold ml-2">Alamat</span>
                        </div>
                        <div className="flex-auto border-t-2 border-green-600 mx-4"></div>
                        <div className="flex items-center text-green-600">
                            <div className="rounded-full border-2 border-green-600 bg-white text-green-600 w-8 h-8 flex items-center justify-center font-bold">2</div>
                            <span className="font-semibold ml-2">Pengiriman</span>
                        </div>
                        <div className="flex-auto border-t-2 border-gray-300 mx-4"></div>
                        <div className="flex items-center text-gray-500">
                            <div className="rounded-full border-2 border-gray-300 w-8 h-8 flex items-center justify-center">3</div>
                            <span className="font-medium ml-2">Pembayaran</span>
                        </div>
                    </div>

                    <div className="bg-white p-6 rounded-lg shadow-md">
                        {/* Alamat Pengiriman */}
                        <div className="border border-gray-200 rounded-lg p-4 mb-6">
                            <h2 className="font-bold text-lg mb-2">Alamat Pengiriman</h2>
                            <p className="font-semibold">{alamat.nama}</p>
                            <p className="text-gray-600">{alamat.telepon}</p>
                            <p className="text-gray-600 mt-1">
                                {formatAddress(alamat.full_address_string)}
                            </p>
                            <Link href={route('checkout.index')} className="text-green-600 hover:underline text-sm mt-2 inline-block">
                                Ubah Alamat
                            </Link>
                        </div>

                        <h2 className="font-bold text-lg mb-4">Pilih Metode Pengiriman</h2>
                        <form onSubmit={handleSubmit}>
                            <h3 className="font-bold text-md mb-3">Opsi Kurir Tersedia:</h3>
                            {shippingOptions && shippingOptions.length > 0 ? (
                                <div className="space-y-4">
                                    {shippingOptions.map((option) => {
                                        const isSelected = data.pengiriman &&
                                            data.pengiriman.name === `${option.code.toUpperCase()} - ${option.service}`;

                                        return (
                                            <label key={`${option.code}-${option.service}`} className={`flex items-center p-4 border rounded-lg cursor-pointer transition-all ${isSelected ? 'border-green-500 ring-2 ring-green-200' : 'border-gray-300'}`}>
                                                <input
                                                    type="radio"
                                                    name="shippingOption"
                                                    className="hidden"
                                                    checked={!!isSelected}
                                                    onChange={() => {
                                                        const shippingData = {
                                                            name: `${option.code.toUpperCase()} - ${option.service}`,
                                                            price: option.cost,
                                                            description: `Estimasi ${option.etd}`,
                                                        };
                                                        setData('pengiriman', shippingData);
                                                    }}
                                                />
                                                <div className="flex-grow">
                                                    <p className="font-semibold">{option.name} - {option.service}</p>
                                                    <p className="text-sm text-gray-500">{option.description} (Estimasi: {option.etd})</p>
                                                </div>
                                                <div className="font-bold text-lg">
                                                    {formatCurrency(option.cost)}
                                                </div>
                                                <div className="w-5 h-5 ml-4 flex items-center justify-center rounded-full border-2 border-gray-400">
                                                    {isSelected && <div className="w-3 h-3 bg-green-500 rounded-full"></div>}
                                                </div>
                                            </label>
                                        );
                                    })}
                                </div>
                            ) : (
                                <div className="p-4 border border-yellow-300 bg-yellow-50 rounded-lg">
                                    <p className="text-yellow-800">Tidak ada opsi pengiriman yang tersedia untuk alamat tujuan Anda. Silakan coba ubah alamat atau hubungi kami untuk bantuan.</p>
                                </div>
                            )}

                            <div className="flex justify-between items-center mt-8">
                                <Link href={route('checkout.index')} className="text-gray-600 hover:text-black">
                                    ← Kembali ke Alamat
                                </Link>
                                <button
                                    type="submit"
                                    disabled={processing || !data.pengiriman}
                                    className="bg-green-600 text-white font-bold py-3 px-6 rounded-lg hover:bg-green-700 disabled:opacity-50 transition-colors"
                                >
                                    {processing ? 'Memproses...' : 'Lanjut ke Pembayaran'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            </main>
            <FooterNote />
        </>
    );
}