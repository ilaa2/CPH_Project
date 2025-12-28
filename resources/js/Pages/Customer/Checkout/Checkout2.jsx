import { Head, Link, useForm } from '@inertiajs/react';
import { SiteHeader, FooterNote } from '@/Layouts/CustomerLayout';
import React, { useState, useEffect } from 'react';
import Swal from 'sweetalert2';

export default function Checkout2({ alamat, auth, shippingOptions = [], isMandau }) {
    const [selectedDeliveryMethod, setSelectedDeliveryMethod] = useState(isMandau ? 'ambil_sendiri' : 'ekspedisi');
    const [pickupTime, setPickupTime] = useState('');
    const [showCourierDropdown, setShowCourierDropdown] = useState(false); // State for non-Duri dropdown

    const getMinPickupTime = () => {
        const now = new Date();
        now.setHours(now.getHours() + 1); // Add 1 hour for earliest pickup
        const year = now.getFullYear();
        const month = String(now.getMonth() + 1).padStart(2, '0');
        const day = String(now.getDate()).padStart(2, '0');
        const hours = String(now.getHours()).padStart(2, '0');
        const minutes = String(now.getMinutes()).padStart(2, '0');
        return `${year}-${month}-${day}T${hours}:${minutes}`;
    };

    useEffect(() => {
        if (isMandau) {
            setSelectedDeliveryMethod('ambil_sendiri');
            setPickupTime(getMinPickupTime().substring(11, 16)); // Set default pickup time to 1 hour from now
        } else {
            setSelectedDeliveryMethod('ekspedisi');
        }
    }, [isMandau]);

    const { data, setData, post, processing, errors } = useForm({
        pengiriman: null,
        pickup_time: '', // Add pickup_time to form data
    });

    const handleSubmit = (e) => {
        e.preventDefault();

        let shippingDataToSend = null;

        if (isMandau) {
            if (selectedDeliveryMethod === 'ambil_sendiri') {
                if (!pickupTime) {
                    Swal.fire({
                        icon: 'error',
                        title: 'Oops...',
                        text: 'Anda harus memilih waktu pengambilan!',
                    });
                    return;
                }
                shippingDataToSend = {
                    name: 'Ambil Sendiri',
                    price: 0,
                    description: `Pengambilan pada ${pickupTime}`,
                };
                setData('pickup_time', pickupTime);
            } else if (selectedDeliveryMethod === 'ekspedisi') {
                if (!data.pengiriman) {
                    Swal.fire({
                        icon: 'error',
                        title: 'Oops...',
                        text: 'Anda harus memilih satu metode pengiriman!',
                    });
                    return;
                }
                shippingDataToSend = data.pengiriman;
            }
        } else { // Not Kota Duri, only ekspedisi
            if (!data.pengiriman) {
                Swal.fire({
                    icon: 'error',
                    title: 'Oops...',
                    text: 'Anda harus memilih satu metode pengiriman!',
                });
                return;
            }
            shippingDataToSend = data.pengiriman;
        }

        if (!shippingDataToSend) {
            Swal.fire({
                icon: 'error',
                title: 'Oops...',
                text: 'Metode pengiriman tidak valid.',
            });
            return;
        }

        post(route('checkout.saveShipping'), {
            data: {
                pengiriman: shippingDataToSend,
                pickup_time: data.pickup_time, // Ensure pickup_time is sent if applicable
            },
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
        <>
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
                            {isMandau ? (
                                // Tampilan untuk Pengguna di Duri
                                <div className="space-y-4">
                                    <div className="flex space-x-4">
                                        <label className={`flex-1 flex items-center p-4 border rounded-lg cursor-pointer transition-all ${selectedDeliveryMethod === 'ambil_sendiri' ? 'border-green-500 ring-2 ring-green-200' : 'border-gray-300'}`}>
                                            <input type="radio" name="deliveryMethod" className="hidden" checked={selectedDeliveryMethod === 'ambil_sendiri'} onChange={() => setSelectedDeliveryMethod('ambil_sendiri')} />
                                            <div className="w-5 h-5 mr-4 flex items-center justify-center rounded-full border-2 border-gray-400">
                                                {selectedDeliveryMethod === 'ambil_sendiri' && <div className="w-3 h-3 bg-green-500 rounded-full"></div>}
                                            </div>
                                            <span className="font-semibold">Ambil Sendiri</span>
                                        </label>
                                        <label className={`flex-1 flex items-center p-4 border rounded-lg cursor-pointer transition-all ${selectedDeliveryMethod === 'ekspedisi' ? 'border-green-500 ring-2 ring-green-200' : 'border-gray-300'}`}>
                                            <input type="radio" name="deliveryMethod" className="hidden" checked={selectedDeliveryMethod === 'ekspedisi'} onChange={() => setSelectedDeliveryMethod('ekspedisi')} />
                                            <div className="w-5 h-5 mr-4 flex items-center justify-center rounded-full border-2 border-gray-400">
                                                {selectedDeliveryMethod === 'ekspedisi' && <div className="w-3 h-3 bg-green-500 rounded-full"></div>}
                                            </div>
                                            <span className="font-semibold">Pakai Ekspedisi</span>
                                        </label>
                                    </div>

                                    {selectedDeliveryMethod === 'ambil_sendiri' && (
                                        <div className="p-4 border-t mt-4">
                                            <label htmlFor="pickupTime" className="block font-semibold mb-2">Pilih Jam Pengambilan:</label>
                                            <input
                                                type="time"
                                                id="pickupTime"
                                                value={pickupTime}
                                                onChange={(e) => setPickupTime(e.target.value)}
                                                className="w-full p-2 border rounded-lg"
                                                min={getMinPickupTime().substring(11, 16)}
                                            />
                                        </div>
                                    )}

                                    {selectedDeliveryMethod === 'ekspedisi' && (
                                        <div className="pt-4 border-t mt-4 space-y-4">
                                            {/* Opsi Kurir */}
                                            {shippingOptions && shippingOptions.length > 0 ? (
                                                shippingOptions.map((option) => {
                                                    const isSelected = data.pengiriman && data.pengiriman.name === `${option.code.toUpperCase()} - ${option.service}`;
                                                    return (
                                                        <label key={`${option.code}-${option.service}`} className={`flex items-center p-4 border rounded-lg cursor-pointer transition-all ${isSelected ? 'border-green-500 ring-2 ring-green-200' : 'border-gray-300'}`}>
                                                            <input type="radio" name="shippingOption" className="hidden" checked={!!isSelected} onChange={() => setData('pengiriman', { name: `${option.code.toUpperCase()} - ${option.service}`, price: option.cost, description: `Estimasi ${option.etd}` })} />
                                                            <div className="flex-grow">
                                                                <p className="font-semibold">{option.name} - {option.service}</p>
                                                                <p className="text-sm text-gray-500">{option.description} (Estimasi: {option.etd})</p>
                                                            </div>
                                                            <div className="font-bold text-lg">{formatCurrency(option.cost)}</div>
                                                            <div className="w-5 h-5 ml-4 flex items-center justify-center rounded-full border-2 border-gray-400">{isSelected && <div className="w-3 h-3 bg-green-500 rounded-full"></div>}</div>
                                                        </label>
                                                    );
                                                })
                                            ) : (
                                                <p className="text-yellow-800">Tidak ada opsi kurir.</p>
                                            )}
                                        </div>
                                    )}
                                </div>
                            ) : (
                                // Tampilan untuk Pengguna di Luar Duri
                                <div className="space-y-4">
                                    <button type="button" onClick={() => setShowCourierDropdown(!showCourierDropdown)} className="w-full flex justify-between items-center p-4 border rounded-lg bg-white hover:bg-gray-50">
                                        <span className="font-semibold">Pilih Ekspedisi</span>
                                        <svg className={`w-5 h-5 transition-transform ${showCourierDropdown ? 'transform rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
                                    </button>

                                    {showCourierDropdown && (
                                        <div className="pt-4 space-y-4">
                                            {shippingOptions && shippingOptions.length > 0 ? (
                                                shippingOptions.map((option) => {
                                                    const isSelected = data.pengiriman && data.pengiriman.name === `${option.code.toUpperCase()} - ${option.service}`;
                                                    return (
                                                        <label key={`${option.code}-${option.service}`} className={`flex items-center p-4 border rounded-lg cursor-pointer transition-all ${isSelected ? 'border-green-500 ring-2 ring-green-200' : 'border-gray-300'}`}>
                                                            <input type="radio" name="shippingOption" className="hidden" checked={!!isSelected} onChange={() => setData('pengiriman', { name: `${option.code.toUpperCase()} - ${option.service}`, price: option.cost, description: `Estimasi ${option.etd}` })} />
                                                            <div className="flex-grow">
                                                                <p className="font-semibold">{option.name} - {option.service}</p>
                                                                <p className="text-sm text-gray-500">{option.description} (Estimasi: {option.etd})</p>
                                                            </div>
                                                            <div className="font-bold text-lg">{formatCurrency(option.cost)}</div>
                                                            <div className="w-5 h-5 ml-4 flex items-center justify-center rounded-full border-2 border-gray-400">{isSelected && <div className="w-3 h-3 bg-green-500 rounded-full"></div>}</div>
                                                        </label>
                                                    );
                                                })
                                            ) : (
                                                <div className="p-4 border border-yellow-300 bg-yellow-50 rounded-lg">
                                                    <p className="text-yellow-800">Tidak ada opsi pengiriman yang tersedia untuk alamat tujuan Anda.</p>
                                                </div>
                                            )}
                                        </div>
                                    )}
                                </div>
                            )}

                            <div className="flex justify-between items-center mt-8">
                                <Link href={route('checkout.index')} className="text-gray-600 hover:text-black">
                                    ← Kembali ke Alamat
                                </Link>
                                <button
                                    type="submit"
                                    disabled={processing}
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