import React, { useState } from 'react';
import { Head, router, Link } from '@inertiajs/react';
import { SiteHeader, FooterNote } from '@/Layouts/CustomerLayout';
import CheckoutStepper from '@/Components/CheckoutStepper';
import { FiMapPin, FiTruck, FiPackage, FiCheck, FiArrowRight } from 'react-icons/fi';

const STORE_ADDRESS = "Jl. Melayu, Babussalam, Mandau, Kab. Bengkalis, Riau 28784";

export default function CheckoutMethod({ auth }) {
    const [selectedMethod, setSelectedMethod] = useState(null);
    const [processing, setProcessing] = useState(false);

    const methods = [
        {
            id: 'pickup',
            title: 'Ambil di Toko',
            icon: FiMapPin,
            iconBg: 'bg-green-100',
            iconColor: 'text-green-600',
            description: 'Ambil pesanan langsung di lokasi kami',
            details: STORE_ADDRESS,
            badge: 'GRATIS',
            badgeColor: 'bg-green-500',
        },
        {
            id: 'local',
            title: 'Kurir Lokal',
            icon: FiPackage,
            iconBg: 'bg-blue-100',
            iconColor: 'text-blue-600',
            description: 'Pengiriman cepat khusus area Duri & sekitarnya',
            details: 'Jarak maksimal 10 km dari toko',
            badge: 'SAME DAY',
            badgeColor: 'bg-blue-500',
        },
        {
            id: 'expedition',
            title: 'Ekspedisi',
            icon: FiTruck,
            iconBg: 'bg-orange-100',
            iconColor: 'text-orange-600',
            description: 'Kirim ke seluruh Indonesia via kurir nasional',
            details: 'JNE, POS Indonesia, TIKI (via RajaOngkir)',
            badge: null,
            badgeColor: null,
        },
    ];

    const handleContinue = () => {
        if (!selectedMethod) return;

        setProcessing(true);
        router.post(route('checkout.saveMethod'), { method: selectedMethod }, {
            onFinish: () => setProcessing(false),
        });
    };

    return (
        <>
            <Head title="Pilih Metode Pengiriman" />
            <SiteHeader auth={auth} />

            <main className="bg-gradient-to-b from-gray-50 to-white min-h-screen py-8">
                <div className="max-w-3xl mx-auto px-4">
                    {/* Stepper */}
                    <CheckoutStepper currentStep={1} />

                    {/* Main Card */}
                    <div className="bg-white p-6 sm:p-8 rounded-2xl shadow-lg border border-gray-100">
                        <h1 className="text-2xl font-bold mb-1 text-gray-800">Pilih Metode Pengiriman</h1>
                        <p className="text-gray-500 mb-6">Bagaimana Anda ingin menerima pesanan?</p>

                        {/* Method Options */}
                        <div className="space-y-4">
                            {methods.map((method) => {
                                const Icon = method.icon;
                                const isSelected = selectedMethod === method.id;

                                return (
                                    <button
                                        key={method.id}
                                        onClick={() => setSelectedMethod(method.id)}
                                        className={`w-full text-left p-5 rounded-xl border-2 transition-all ${isSelected
                                            ? 'border-green-500 bg-green-50 shadow-md'
                                            : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                                            }`}
                                    >
                                        <div className="flex items-start gap-4">
                                            {/* Icon */}
                                            <div className={`${method.iconBg} p-3 rounded-xl flex-shrink-0`}>
                                                <Icon className={`text-2xl ${method.iconColor}`} />
                                            </div>

                                            {/* Content */}
                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-center gap-2 mb-1">
                                                    <h3 className="font-bold text-gray-800">{method.title}</h3>
                                                    {method.badge && (
                                                        <span className={`${method.badgeColor} text-white text-xs font-bold px-2 py-0.5 rounded`}>
                                                            {method.badge}
                                                        </span>
                                                    )}
                                                </div>
                                                <p className="text-sm text-gray-600 mb-1">{method.description}</p>
                                                <p className="text-xs text-gray-400">{method.details}</p>
                                            </div>

                                            {/* Check indicator */}
                                            <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-all ${isSelected
                                                ? 'border-green-500 bg-green-500'
                                                : 'border-gray-300'
                                                }`}>
                                                {isSelected && <FiCheck className="text-white text-sm" />}
                                            </div>
                                        </div>
                                    </button>
                                );
                            })}
                        </div>

                        {/* Info Box for Fresh Produce */}
                        <div className="mt-6 bg-amber-50 border border-amber-200 rounded-xl p-4">
                            <p className="text-sm text-amber-800">
                                <strong>🌿 Tips Produk Segar:</strong> Untuk menjaga kualitas sayur dan buah, kami sarankan memilih pengiriman dengan estimasi maksimal 5 hari.
                            </p>
                        </div>

                        {/* Continue Button */}
                        <button
                            onClick={handleContinue}
                            disabled={!selectedMethod || processing}
                            className={`w-full mt-6 py-4 rounded-xl font-bold text-white flex items-center justify-center gap-2 transition-all ${selectedMethod && !processing
                                ? 'bg-green-600 hover:bg-green-700 shadow-lg hover:shadow-xl'
                                : 'bg-gray-300 cursor-not-allowed'
                                }`}
                        >
                            {processing ? 'Memproses...' : 'Lanjutkan'}
                            {!processing && <FiArrowRight />}
                        </button>

                        {/* Back Link */}
                        <div className="mt-4 text-center">
                            <Link href={route('belanja.index')} className="text-sm text-gray-500 hover:text-gray-700 underline">
                                ← Kembali Belanja
                            </Link>
                        </div>
                    </div>
                </div>
            </main>
            <FooterNote />
        </>
    );
}
