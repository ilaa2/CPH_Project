import { Head, useForm, router } from '@inertiajs/react';
import { SiteHeader, FooterNote } from '@/Layouts/CustomerLayout';
import React from 'react';

export default function Checkout1({ pelanggan }) {
    const { data, setData, post, processing, errors } = useForm({
        nama: pelanggan?.nama || '',
        telepon: pelanggan?.telepon || '',
        alamat: pelanggan?.alamat || '',

        province_name: '',
        city_name: '',
        district_name: '',
        zip_code: '',
    });

    const handleSubmit = (e) => {
        e.preventDefault();
        post(route('checkout.saveAddress'), {
            onSuccess: () => router.visit(route('checkout.shipping')),
        });
    };

    return (
        <>
            <Head title="Checkout - Alamat Pengiriman" />
            <SiteHeader auth={{ user: pelanggan }} />

            <main className="bg-gray-50 min-h-screen py-10">
                <div className="max-w-4xl mx-auto px-4">
                    <div className="flex items-center justify-center mb-8">
                        <div className="flex items-center text-green-600">
                            <div className="rounded-full border-2 border-green-600 bg-white text-green-600 w-8 h-8 flex items-center justify-center font-bold">✓</div>
                            <span className="hidden sm:inline font-semibold ml-2">Metode</span>
                        </div>
                        <div className="flex-auto border-t-2 border-green-600 mx-2 sm:mx-4"></div>
                        <div className="flex items-center text-green-600">
                            <div className="rounded-full border-2 border-green-600 bg-white text-green-600 w-8 h-8 flex items-center justify-center font-bold">2</div>
                            <span className="font-semibold ml-2">Alamat</span>
                        </div>
                        <div className="flex-auto border-t-2 border-gray-300 mx-2 sm:mx-4"></div>
                        <div className="flex items-center text-gray-500">
                            <div className="rounded-full border-2 border-gray-300 w-8 h-8 flex items-center justify-center">3</div>
                            <span className="hidden sm:inline font-medium ml-2">Pengiriman</span>
                        </div>
                        <div className="flex-auto border-t-2 border-gray-300 mx-2 sm:mx-4"></div>
                        <div className="flex items-center text-gray-500">
                            <div className="rounded-full border-2 border-gray-300 w-8 h-8 flex items-center justify-center">4</div>
                            <span className="hidden sm:inline font-medium ml-2">Bayar</span>
                        </div>
                    </div>

                    <div className="bg-white p-6 sm:p-8 rounded-lg shadow-md">
                        <h1 className="text-2xl font-bold mb-6 text-gray-800">Langkah 1: Alamat Pengiriman</h1>
                        <form onSubmit={handleSubmit} className="space-y-4">

                            <div>
                                <label htmlFor="nama" className="block font-medium text-gray-700">Nama Lengkap</label>
                                <input id="nama" type="text" value={data.nama} onChange={(e) => setData('nama', e.target.value)} className="w-full border-gray-300 rounded-md shadow-sm mt-1 focus:ring-green-500 focus:border-green-500" required />
                                {errors.nama && <div className="text-red-500 text-sm mt-1">{errors.nama}</div>}
                            </div>

                            <div>
                                <label htmlFor="telepon" className="block font-medium text-gray-700">Nomor Telepon</label>
                                <input id="telepon" type="text" value={data.telepon} onChange={(e) => setData('telepon', e.target.value)} className="w-full border-gray-300 rounded-md shadow-sm mt-1 focus:ring-green-500 focus:border-green-500" required />
                                {errors.telepon && <div className="text-red-500 text-sm mt-1">{errors.telepon}</div>}
                            </div>

                            <div>
                                <label htmlFor="alamat" className="block font-medium text-gray-700">Alamat Lengkap (Jalan, No. Rumah, RT/RW)</label>
                                <textarea id="alamat" value={data.alamat} onChange={(e) => setData('alamat', e.target.value)} className="w-full border-gray-300 rounded-md shadow-sm mt-1 focus:ring-green-500 focus:border-green-500" rows="3" placeholder="Contoh: Jl. Merdeka No. 17" required />
                                {errors.alamat && <div className="text-red-500 text-sm mt-1">{errors.alamat}</div>}
                            </div>

                            {/* Manual Input Fields - No API */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label htmlFor="province" className="block font-medium text-gray-700">Provinsi</label>
                                    <input id="province" type="text" value={data.province_name} onChange={(e) => setData('province_name', e.target.value)} className="w-full border-gray-300 rounded-md shadow-sm mt-1 focus:ring-green-500 focus:border-green-500" placeholder="Contoh: Riau" required />
                                    {errors.province_name && <div className="text-red-500 text-sm mt-1">{errors.province_name}</div>}
                                </div>
                                <div>
                                    <label htmlFor="city" className="block font-medium text-gray-700">Kota / Kabupaten</label>
                                    <input id="city" type="text" value={data.city_name} onChange={(e) => setData('city_name', e.target.value)} className="w-full border-gray-300 rounded-md shadow-sm mt-1 focus:ring-green-500 focus:border-green-500" placeholder="Contoh: Bengkalis" required />
                                    {errors.city_name && <div className="text-red-500 text-sm mt-1">{errors.city_name}</div>}
                                </div>
                                <div className="md:col-span-2">
                                    <label htmlFor="district" className="block font-medium text-gray-700">Kecamatan</label>
                                    <input id="district" type="text" value={data.district_name} onChange={(e) => setData('district_name', e.target.value)} className="w-full border-gray-300 rounded-md shadow-sm mt-1 focus:ring-green-500 focus:border-green-500" placeholder="Contoh: Mandau" required />
                                    {errors.district_name && <div className="text-red-500 text-sm mt-1">{errors.district_name}</div>}
                                </div>
                            </div>

                            <div>
                                <label htmlFor="zip_code" className="block font-medium text-gray-700">Kode Pos</label>
                                <input
                                    id="zip_code"
                                    type="text"
                                    value={data.zip_code}
                                    onChange={(e) => {
                                        const val = e.target.value.replace(/\D/g, '').slice(0, 5);
                                        setData('zip_code', val);
                                    }}
                                    className="w-full border-gray-300 rounded-md shadow-sm mt-1 focus:ring-green-500 focus:border-green-500"
                                    placeholder="5 Digit"
                                    required
                                    minLength={5}
                                    maxLength={5}
                                />
                                {errors.zip_code && <div className="text-red-500 text-sm mt-1">{errors.zip_code}</div>}
                            </div>

                            <div className="pt-4">
                                <button type="submit" disabled={processing || !data.zip_code || data.zip_code.length !== 5} className="w-full bg-green-600 text-white font-bold py-3 px-4 rounded-lg hover:bg-green-700 disabled:opacity-50 transition-colors">
                                    {processing ? 'Menyimpan...' : 'Lanjut ke Pengiriman →'}
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