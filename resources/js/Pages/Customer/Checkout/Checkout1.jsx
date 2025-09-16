import { Head, useForm, router } from '@inertiajs/react';
import { SiteHeader, FooterNote } from '@/Layouts/CustomerLayout';
import React from 'react';

// Props 'pelanggan' dikirim dari CheckoutController@index
export default function Checkout1({ pelanggan }) {
    // Inisialisasi form dengan data pelanggan jika ada
    const { data, setData, post, processing, errors } = useForm({
        nama: pelanggan?.nama || '',
        telepon: pelanggan?.telepon || '',
        alamat: pelanggan?.alamat || '',
        kecamatan: pelanggan?.kecamatan || '',
        kota: pelanggan?.kota || '',
        provinsi: pelanggan?.provinsi || '',
        kode_pos: pelanggan?.kode_pos || '',
    });

    const handleSubmit = (e) => {
        e.preventDefault();
        // Gunakan nama route yang baru: 'checkout.saveAddress'
        post(route('checkout.saveAddress'), {
            onSuccess: () => {
                // Redirect ke halaman berikutnya jika berhasil
                router.visit(route('checkout.shipping'));
            },
        });
    };

    return (
        <>
            <Head title="Checkout - Alamat Pengiriman" />
            <SiteHeader auth={{ user: pelanggan }} />

            {/* Latar belakang abu-abu untuk kontras */}
            <main className="bg-gray-50 min-h-screen py-10">
                <div className="max-w-4xl mx-auto px-4">

                    {/* === PROGRESS STEPPER DITAMBAHKAN DI SINI === */}
                    <div className="flex items-center justify-center mb-8">
                        {/* Step 1: Aktif */}
                        <div className="flex items-center text-green-600">
                            <div className="rounded-full border-2 border-green-600 bg-white text-green-600 w-8 h-8 flex items-center justify-center font-bold">1</div>
                            <span className="font-semibold ml-2">Alamat</span>
                        </div>
                        {/* Garis penghubung */}
                        <div className="flex-auto border-t-2 border-gray-300 mx-4"></div>
                        {/* Step 2: Belum Aktif */}
                        <div className="flex items-center text-gray-500">
                            <div className="rounded-full border-2 border-gray-300 w-8 h-8 flex items-center justify-center">2</div>
                            <span className="font-medium ml-2">Pengiriman</span>
                        </div>
                        {/* Garis penghubung */}
                        <div className="flex-auto border-t-2 border-gray-300 mx-4"></div>
                        {/* Step 3: Belum Aktif */}
                        <div className="flex items-center text-gray-500">
                            <div className="rounded-full border-2 border-gray-300 w-8 h-8 flex items-center justify-center">3</div>
                            <span className="font-medium ml-2">Pembayaran</span>
                        </div>
                    </div>

                    {/* Form Alamat */}
                    <div className="bg-white p-6 sm:p-8 rounded-lg shadow-md">
                        <h1 className="text-2xl font-bold mb-6 text-gray-800">Langkah 1: Alamat Pengiriman</h1>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            {/* Nama */}
                            <div>
                                <label htmlFor="nama" className="block font-medium text-gray-700">Nama Lengkap</label>
                                <input
                                    id="nama"
                                    type="text"
                                    value={data.nama}
                                    onChange={(e) => setData('nama', e.target.value)}
                                    className="w-full border-gray-300 rounded-md shadow-sm mt-1 focus:ring-green-500 focus:border-green-500"
                                    required
                                />
                                {errors.nama && <div className="text-red-500 text-sm mt-1">{errors.nama}</div>}
                            </div>

                            {/* Telepon */}
                            <div>
                                <label htmlFor="telepon" className="block font-medium text-gray-700">Nomor Telepon</label>
                                <input
                                    id="telepon"
                                    type="text"
                                    value={data.telepon}
                                    onChange={(e) => setData('telepon', e.target.value)}
                                    className="w-full border-gray-300 rounded-md shadow-sm mt-1 focus:ring-green-500 focus:border-green-500"
                                    required
                                />
                                {errors.telepon && <div className="text-red-500 text-sm mt-1">{errors.telepon}</div>}
                            </div>

                            {/* Alamat Lengkap */}
                            <div>
                                <label htmlFor="alamat" className="block font-medium text-gray-700">Alamat Lengkap</label>
                                <textarea
                                    id="alamat"
                                    value={data.alamat}
                                    onChange={(e) => setData('alamat', e.target.value)}
                                    className="w-full border-gray-300 rounded-md shadow-sm mt-1 focus:ring-green-500 focus:border-green-500"
                                    rows="3"
                                    placeholder="Contoh: Jl. Merdeka No. 17, RT 01/RW 02"
                                    required
                                />
                                {errors.alamat && <div className="text-red-500 text-sm mt-1">{errors.alamat}</div>}
                            </div>

                            {/* Grid untuk Kecamatan & Kota */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label htmlFor="kecamatan" className="block font-medium text-gray-700">Kecamatan</label>
                                    <input
                                        id="kecamatan"
                                        type="text"
                                        value={data.kecamatan}
                                        onChange={(e) => setData('kecamatan', e.target.value)}
                                        className="w-full border-gray-300 rounded-md shadow-sm mt-1 focus:ring-green-500 focus:border-green-500"
                                        required
                                    />
                                    {errors.kecamatan && <div className="text-red-500 text-sm mt-1">{errors.kecamatan}</div>}
                                </div>
                                <div>
                                    <label htmlFor="kota" className="block font-medium text-gray-700">Kota / Kabupaten</label>
                                    <input
                                        id="kota"
                                        type="text"
                                        value={data.kota}
                                        onChange={(e) => setData('kota', e.target.value)}
                                        className="w-full border-gray-300 rounded-md shadow-sm mt-1 focus:ring-green-500 focus:border-green-500"
                                        required
                                    />
                                    {errors.kota && <div className="text-red-500 text-sm mt-1">{errors.kota}</div>}
                                </div>
                            </div>

                            {/* Grid untuk Provinsi & Kode Pos */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label htmlFor="provinsi" className="block font-medium text-gray-700">Provinsi</label>
                                    <input
                                        id="provinsi"
                                        type="text"
                                        value={data.provinsi}
                                        onChange={(e) => setData('provinsi', e.target.value)}
                                        className="w-full border-gray-300 rounded-md shadow-sm mt-1 focus:ring-green-500 focus:border-green-500"
                                        required
                                    />
                                    {errors.provinsi && <div className="text-red-500 text-sm mt-1">{errors.provinsi}</div>}
                                </div>
                                <div>
                                    <label htmlFor="kode_pos" className="block font-medium text-gray-700">Kode Pos</label>
                                    <input
                                        id="kode_pos"
                                        type="text"
                                        value={data.kode_pos}
                                        onChange={(e) => setData('kode_pos', e.target.value)}
                                        className="w-full border-gray-300 rounded-md shadow-sm mt-1 focus:ring-green-500 focus:border-green-500"
                                        required
                                    />
                                    {errors.kode_pos && <div className="text-red-500 text-sm mt-1">{errors.kode_pos}</div>}
                                </div>
                            </div>

                            <div className="pt-4">
                                <button type="submit" disabled={processing} className="w-full bg-green-600 text-white font-bold py-3 px-4 rounded-lg hover:bg-green-700 disabled:opacity-50 transition-colors">
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
