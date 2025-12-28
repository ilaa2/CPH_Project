import React from 'react';
import { Head, router, Link } from '@inertiajs/react';
import { SiteHeader, FooterNote } from '@/Layouts/CustomerLayout';
import { FiMapPin, FiTruck } from 'react-icons/fi';
import { useState } from 'react';

export default function CheckoutMethod({ auth }) {
    const [processing, setProcessing] = useState(false);

    const selectMethod = (method) => {
        router.post(route('checkout.saveMethod'), { method: method }, {
            onStart: () => setProcessing(true),
            onFinish: () => setProcessing(false),
        });
    };

    return (
        <>
            <Head title="Pilih Metode Pengiriman" />
            <SiteHeader auth={auth} />

            <main className="bg-gray-50 min-h-screen py-10">
                <div className="max-w-4xl mx-auto px-4">
                    {/* Step Indicator */}
                    <div className="flex items-center justify-center mb-8">
                        <div className="flex items-center text-green-600">
                            <div className="rounded-full border-2 border-green-600 bg-white text-green-600 w-8 h-8 flex items-center justify-center font-bold">1</div>
                            <span className="font-semibold ml-2">Metode</span>
                        </div>
                        <div className="flex-auto border-t-2 border-gray-300 mx-4"></div>
                        <div className="flex items-center text-gray-500">
                            <div className="rounded-full border-2 border-gray-300 w-8 h-8 flex items-center justify-center">2</div>
                            <span className="font-medium ml-2">Detail</span>
                        </div>
                        <div className="flex-auto border-t-2 border-gray-300 mx-4"></div>
                        <div className="flex items-center text-gray-500">
                            <div className="rounded-full border-2 border-gray-300 w-8 h-8 flex items-center justify-center">3</div>
                            <span className="font-medium ml-2">Bayar</span>
                        </div>
                    </div>

                    <div className="bg-white p-6 sm:p-8 rounded-lg shadow-md">
                        <h1 className="text-2xl font-bold mb-2 text-gray-800 text-center">Pilih Metode Pengiriman</h1>
                        <p className="text-gray-600 text-center mb-8">Bagaimana Anda ingin menerima pesanan Anda?</p>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {/* Option 1: Self Pickup */}
                            <button
                                onClick={() => selectMethod('pickup')}
                                disabled={processing}
                                className={`flex flex-col items-center justify-center p-8 border-2 rounded-xl transition-all hover:shadow-lg group ${processing ? 'opacity-50 cursor-not-allowed' : 'hover:border-green-500 hover:bg-green-50 border-gray-200'
                                    }`}
                            >
                                <div className="bg-green-100 p-4 rounded-full mb-4 group-hover:bg-green-200 transition-colors">
                                    <FiMapPin className="text-3xl text-green-600" />
                                </div>
                                <h3 className="text-xl font-bold text-gray-800 mb-2">Ambil Sendiri</h3>
                                <p className="text-gray-500 text-center text-sm">
                                    Ambil pesanan Anda langsung di toko kami.<br />
                                    <strong>Tanpa ongkos kirim.</strong>
                                </p>
                            </button>

                            {/* Option 2: Delivery */}
                            <button
                                onClick={() => selectMethod('delivery')}
                                disabled={processing}
                                className={`flex flex-col items-center justify-center p-8 border-2 rounded-xl transition-all hover:shadow-lg group ${processing ? 'opacity-50 cursor-not-allowed' : 'hover:border-green-500 hover:bg-green-50 border-gray-200'
                                    }`}
                            >
                                <div className="bg-blue-100 p-4 rounded-full mb-4 group-hover:bg-blue-200 transition-colors">
                                    <FiTruck className="text-3xl text-blue-600" />
                                </div>
                                <h3 className="text-xl font-bold text-gray-800 mb-2">Jasa Ekspedisi</h3>
                                <p className="text-gray-500 text-center text-sm">
                                    Kirim pesanan ke alamat Anda menggunakan kurir.<br />
                                    (JNE, POS, TIKI, dll)
                                </p>
                            </button>
                        </div>

                        <div className="mt-8 text-center text-sm text-gray-400">
                            <Link href={route('belanja.index')} className="hover:text-gray-600 underline">
                                Kembali Belanja
                            </Link>
                        </div>
                    </div>
                </div>
            </main>
            <FooterNote />
        </>
    );
}
