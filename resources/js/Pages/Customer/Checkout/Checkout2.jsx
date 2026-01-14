import { Head, Link, useForm, router } from '@inertiajs/react';
import { SiteHeader, FooterNote } from '@/Layouts/CustomerLayout';
import CheckoutStepper from '@/Components/CheckoutStepper';
import React, { useState } from 'react';
import { FiCheck, FiTruck, FiPackage, FiAlertTriangle, FiArrowLeft, FiArrowRight, FiInfo } from 'react-icons/fi';
import Swal from 'sweetalert2';

export default function Checkout2({ alamat, auth, shippingOptions = [], shippingError, checkoutMethod, distance }) {
    const [selectedOption, setSelectedOption] = useState(null);
    const [useExtraPackaging, setUseExtraPackaging] = useState(false); // New State

    const { data, setData, post, processing } = useForm({
        pengiriman: null,
        extra_packaging: false, // Add to form data
    });

    const formatCurrency = (number) => {
        return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(number);
    };

    const handleSelect = (option) => {
        setSelectedOption(option);
        setData('pengiriman', {
            name: `${option.name} - ${option.service}`,
            price: option.cost,
            description: `Estimasi ${option.etd}`,
        });
    };

    // Effect to update form data when options change
    React.useEffect(() => {
        if (selectedOption) {
            setData('pengiriman', {
                name: `${selectedOption.name} - ${selectedOption.service}${useExtraPackaging ? ' (+ Extra Packaging)' : ''}`,
                price: selectedOption.cost + (useExtraPackaging ? 10000 : 0),
                description: `Estimasi ${selectedOption.etd}`,
                extra_packaging: useExtraPackaging
            });
        }
    }, [selectedOption, useExtraPackaging]);

    const handleSubmit = (e) => {
        e.preventDefault();

        if (!selectedOption) {
            Swal.fire({
                icon: 'warning',
                title: 'Pilih Pengiriman',
                text: 'Silakan pilih metode pengiriman terlebih dahulu.',
            });
            return;
        }

        post(route('checkout.saveShipping'), {
            data: { pengiriman: data.pengiriman },
            onError: (errors) => {
                Swal.fire({
                    icon: 'error',
                    title: 'Gagal',
                    text: Object.values(errors).join(' ') || 'Terjadi kesalahan.',
                });
            }
        });
    };

    const formatAddress = (addressString) => {
        if (!addressString) return '';
        const parts = addressString.split(', ');
        return parts.filter(part => part && part.trim() !== 'undefined' && part.trim() !== 'null').join(', ');
    };

    const methodLabel = checkoutMethod === 'local' ? 'Kurir Lokal' : 'Ekspedisi';

    return (
        <>
            <Head title="Checkout - Pilih Pengiriman" />
            <SiteHeader auth={auth} />

            <main className="bg-gradient-to-b from-gray-50 to-white min-h-screen py-8">
                <div className="max-w-4xl mx-auto px-4">
                    {/* Stepper */}
                    <CheckoutStepper currentStep={3} />

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        {/* Left Column - Shipping Options */}
                        <div className="lg:col-span-2 space-y-4">
                            {/* Address Card */}
                            <div className="bg-white p-4 rounded-xl shadow-sm border">
                                <div className="flex justify-between items-start">
                                    <div>
                                        <p className="font-bold text-gray-800">{alamat?.nama}</p>
                                        <p className="text-sm text-gray-600">{alamat?.telepon}</p>
                                        <p className="text-sm text-gray-500 mt-1">{formatAddress(alamat?.full_address_string)}</p>
                                    </div>
                                    <Link href={route('checkout.address')} className="text-green-600 text-sm hover:underline">
                                        Ubah
                                    </Link>
                                </div>
                            </div>

                            {/* Title */}
                            <div className="flex items-center gap-2 pt-2">
                                {checkoutMethod === 'local' ? <FiPackage className="text-blue-600" /> : <FiTruck className="text-orange-600" />}
                                <h2 className="font-bold text-lg text-gray-800">Pilih {methodLabel}</h2>
                            </div>

                            {/* Error Message */}
                            {shippingError && (
                                <div className="bg-red-50 border border-red-200 rounded-xl p-4 flex items-start gap-3">
                                    <FiAlertTriangle className="text-red-600 text-xl flex-shrink-0 mt-0.5" />
                                    <div>
                                        <p className="font-semibold text-red-800">Tidak Tersedia</p>
                                        <p className="text-sm text-red-700">{shippingError}</p>
                                        <Link href={route('checkout.index')} className="text-red-600 font-semibold text-sm mt-2 inline-block hover:underline">
                                            ← Pilih Metode Lain
                                        </Link>
                                    </div>
                                </div>
                            )}

                            {/* Info Box for Fresh Produce */}
                            {checkoutMethod === 'expedition' && !shippingError && (
                                <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 flex items-start gap-3">
                                    <FiInfo className="text-amber-600 text-lg flex-shrink-0 mt-0.5" />
                                    <p className="text-sm text-amber-800">
                                        <strong>🌿 Produk Segar:</strong> Untuk menjaga kualitas sayur dan buah, disarankan memilih layanan dengan estimasi maksimal 5 hari.
                                    </p>
                                </div>
                            )}

                            {/* Shipping Options */}

                            {/* Extra Packaging Option for Expedition */}
                            {checkoutMethod === 'expedition' && !shippingError && shippingOptions.length > 0 && (
                                <div className="bg-white border border-gray-200 rounded-xl p-4 flex items-center gap-3 shadow-sm hover:border-green-300 transition-colors">
                                    <input
                                        type="checkbox"
                                        id="extraPackaging"
                                        checked={useExtraPackaging}
                                        onChange={(e) => setUseExtraPackaging(e.target.checked)}
                                        className="w-5 h-5 text-green-600 border-gray-300 rounded focus:ring-green-500"
                                    />
                                    <label htmlFor="extraPackaging" className="flex-1 cursor-pointer select-none">
                                        <div className="font-bold text-gray-800 flex items-center gap-2">
                                            <FiPackage className="text-orange-500" />
                                            Extra Packaging <span className="text-xs bg-green-100 text-green-800 px-2 py-0.5 rounded-full">+ Rp 10.000</span>
                                        </div>
                                        <p className="text-sm text-gray-500 mt-1">
                                            Kemasan lebih aman dengan Plastik, Box, dan Ice Gel. <span className='text-orange-600 italic font-semibold text-xs'>(Sangat disarankan untuk produk segar)</span>
                                        </p>
                                    </label>
                                </div>
                            )}

                            {!shippingError && shippingOptions.length > 0 && (
                                <div className="space-y-3">
                                    {shippingOptions.map((option, index) => {
                                        const isSelected = selectedOption &&
                                            selectedOption.name === option.name &&
                                            selectedOption.service === option.service;
                                        const isNotRecommended = option.max_days > 5;

                                        return (
                                            <button
                                                key={`${option.code}-${option.service}-${index}`}
                                                type="button"
                                                onClick={() => handleSelect(option)}
                                                className={`w-full text-left p-4 rounded-xl border-2 transition-all ${isSelected
                                                    ? 'border-green-500 bg-green-50 shadow-md'
                                                    : isNotRecommended
                                                        ? 'border-orange-200 bg-orange-50 hover:border-orange-300'
                                                        : 'border-gray-200 hover:border-gray-300 bg-white'
                                                    }`}
                                            >
                                                <div className="flex items-center justify-between">
                                                    <div className="flex items-center gap-3">
                                                        {/* Radio indicator */}
                                                        <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 ${isSelected ? 'border-green-500 bg-green-500' : 'border-gray-300'
                                                            }`}>
                                                            {isSelected && <FiCheck className="text-white text-xs" />}
                                                        </div>

                                                        <div>
                                                            <div className="flex items-center gap-2">
                                                                <span className="font-bold text-gray-800">{option.name}</span>
                                                                <span className="text-gray-600">- {option.service}</span>
                                                                {isNotRecommended && (
                                                                    <span className="text-xs bg-orange-500 text-white px-2 py-0.5 rounded font-semibold">
                                                                        Tidak Disarankan
                                                                    </span>
                                                                )}
                                                                {option.is_recommended && !isNotRecommended && (
                                                                    <span className="text-xs bg-green-500 text-white px-2 py-0.5 rounded font-semibold">
                                                                        Disarankan
                                                                    </span>
                                                                )}
                                                            </div>
                                                            <p className="text-sm text-gray-500">
                                                                {option.description} • Estimasi: <strong>{option.etd}</strong>
                                                            </p>
                                                        </div>
                                                    </div>

                                                    <div className="text-right">
                                                        <p className="font-bold text-lg text-green-600">{formatCurrency(option.cost)}</p>
                                                    </div>
                                                </div>
                                            </button>
                                        );
                                    })}
                                </div>
                            )}

                            {/* No Options */}
                            {!shippingError && shippingOptions.length === 0 && (
                                <div className="bg-gray-100 rounded-xl p-6 text-center">
                                    <p className="text-gray-600">Memuat opsi pengiriman...</p>
                                </div>
                            )}
                        </div>

                        {/* Right Column - Summary (Sticky) */}
                        <div className="lg:col-span-1">
                            <div className="bg-white rounded-xl shadow-sm border sticky top-24 overflow-hidden">
                                <div className="px-5 py-4 border-b bg-gradient-to-r from-gray-50 to-white">
                                    <h3 className="font-bold text-gray-800">Ringkasan Pengiriman</h3>
                                </div>

                                <div className="p-5 space-y-4">
                                    {/* Selected Method */}
                                    <div className="flex justify-between text-sm">
                                        <span className="text-gray-600">Metode</span>
                                        <span className="font-medium text-gray-800">{methodLabel}</span>
                                    </div>

                                    {checkoutMethod === 'local' && distance > 0 && (
                                        <div className="flex justify-between text-sm">
                                            <span className="text-gray-600">Jarak</span>
                                            <span className="font-medium text-gray-800">~{distance} km</span>
                                        </div>
                                    )}

                                    {selectedOption && (
                                        <>
                                            <div className="flex justify-between text-sm">
                                                <span className="text-gray-600">Kurir</span>
                                                <span className="font-medium text-gray-800">{selectedOption.name}</span>
                                            </div>
                                            <div className="flex justify-between text-sm">
                                                <span className="text-gray-600">Layanan</span>
                                                <span className="font-medium text-gray-800">{selectedOption.service}</span>
                                            </div>
                                            <div className="flex justify-between text-sm">
                                                <span className="text-gray-600">Estimasi</span>
                                                <span className="font-medium text-gray-800">{selectedOption.etd}</span>
                                            </div>

                                            {/* Extra Packaging Cost Summary */}
                                            {useExtraPackaging && (
                                                <div className="flex justify-between text-sm text-green-700 bg-green-50 p-2 rounded-lg mt-2">
                                                    <span>+ Packaging</span>
                                                    <span className="font-semibold">Rp 10.000</span>
                                                </div>
                                            )}
                                        </>
                                    )}

                                    <div className="border-t-2 border-dashed border-gray-200 pt-4">
                                        <div className="flex justify-between items-center">
                                            <span className="font-bold text-gray-800">Ongkos Kirim</span>
                                            <span className="text-xl font-extrabold text-green-600">
                                                {selectedOption ? formatCurrency(selectedOption.cost + (useExtraPackaging ? 10000 : 0)) : 'Rp -'}
                                            </span>
                                        </div>
                                    </div>

                                    {/* Action Buttons */}
                                    <div className="space-y-3 pt-2">
                                        <button
                                            onClick={handleSubmit}
                                            disabled={!selectedOption || processing || shippingError}
                                            className={`w-full py-4 rounded-xl font-bold text-white flex items-center justify-center gap-2 transition-all ${selectedOption && !processing && !shippingError
                                                ? 'bg-green-600 hover:bg-green-700 shadow-lg hover:shadow-xl'
                                                : 'bg-gray-300 cursor-not-allowed'
                                                }`}
                                        >
                                            {processing ? 'Memproses...' : 'Lanjut ke Pembayaran'}
                                            {!processing && <FiArrowRight />}
                                        </button>

                                        <Link
                                            href={route('checkout.address')}
                                            className="w-full py-3 rounded-xl font-semibold text-gray-600 border-2 border-gray-200 flex items-center justify-center gap-2 hover:bg-gray-50 transition"
                                        >
                                            <FiArrowLeft /> Ubah Alamat
                                        </Link>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </main>
            <FooterNote />
        </>
    );
}