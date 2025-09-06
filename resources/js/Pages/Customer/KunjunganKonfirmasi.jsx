import { Head, router } from '@inertiajs/react';
import { SiteHeader, FooterNote } from '@/Layouts/CustomerLayout';
import { FiUser, FiPhone, FiCalendar, FiUsers, FiClipboard, FiArrowLeft, FiCheckCircle, FiDollarSign } from 'react-icons/fi';
import React, { useState } from 'react';
import { motion } from 'framer-motion';

// Komponen untuk menampilkan baris detail
const DetailRow = ({ icon, label, value }) => (
    <div className="flex items-start gap-4 p-3 border-b last:border-b-0">
        <span className="text-green-600 mt-1">{icon}</span>
        <div>
            <p className="text-sm text-gray-500">{label}</p>
            <p className="font-semibold text-gray-800">{value}</p>
        </div>
    </div>
);


export default function KunjunganKonfirmasi({ auth, dataKunjungan }) {
    // State untuk processing button
    const [processing, setProcessing] = useState(false);


    // Fungsi untuk submit data ke method 'store'
    const handleSubmit = () => {
        setProcessing(true);
        router.post(route('kunjungan.store'), dataKunjungan, {
            onFinish: () => setProcessing(false),
        });
    };

    // Format mata uang
    const formatCurrency = (number) => {
        return new Intl.NumberFormat('id-ID', {
            style: 'currency',
            currency: 'IDR',
            minimumFractionDigits: 0
        }).format(number);
    };

    return (
        <div className="min-h-screen w-full bg-gradient-to-b from-green-50 to-green-100 text-gray-800">
            <Head title="Konfirmasi Kunjungan" />
            <SiteHeader auth={auth} />

            <section className="relative h-[300px] bg-cover bg-center" style={{ backgroundImage: 'url(https://images.unsplash.com/photo-1524592094714-0f0654e20314?auto=format&fit=crop&w=1600&q=80)' }}>
                <div className="absolute inset-0 bg-gradient-to-r from-green-900/70 to-green-600/60"></div>
                <div className="relative z-10 max-w-3xl mx-auto text-center px-6 py-20 text-white">
                    <motion.h1 initial={{ opacity: 0, y: -40 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }} className="text-4xl sm:text-5xl font-extrabold mb-4 drop-shadow-lg">
                        Konfirmasi Kunjungan
                    </motion.h1>
                    <motion.p initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 1, delay: 0.3 }} className="text-lg sm:text-xl opacity-90 max-w-2xl mx-auto">
                        Periksa kembali detail kunjungan Anda sebelum melanjutkan.
                    </motion.p>
                </div>
            </section>

            <main className="py-16 -mt-20 relative z-20">
                <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.6 }} className="max-w-2xl mx-auto px-6">
                    <div className="bg-white/90 backdrop-blur-xl p-6 sm:p-10 rounded-3xl shadow-2xl border border-green-100">
                        <div className="flex items-center justify-center mb-8 space-x-6 text-sm font-medium text-gray-600">
                            <div className="flex items-center gap-2 text-green-600"><FiCheckCircle /> Isi Data</div>
                            <span>➝</span>
                            <div className="flex items-center gap-2 text-green-600"><FiCheckCircle /> Konfirmasi</div>
                            <span>➝</span>
                            <div>Selesai</div>
                        </div>

                        {/* Detail Kunjungan */}
                        <div className="border rounded-xl overflow-hidden">
                            <DetailRow icon={<FiUser size={20} />} label="Nama Lengkap" value={dataKunjungan.nama_lengkap} />
                            <DetailRow icon={<FiPhone size={20} />} label="No HP" value={dataKunjungan.no_hp} />
                            <DetailRow icon={<FiCalendar size={20} />} label="Tanggal" value={dataKunjungan.tanggal_kunjungan} />
                            <DetailRow icon={<FiClipboard size={20} />} label="Tipe Kunjungan" value={dataKunjungan.nama_tipe} />
                            <DetailRow icon={<FiUsers size={20} />} label="Jumlah Pengunjung" value={`${dataKunjungan.jumlah_pengunjung} Orang`} />
                            <DetailRow icon={<FiDollarSign size={20} />} label="Total Biaya" value={formatCurrency(dataKunjungan.total_biaya)} />
                        </div>

                        {/* Tombol Aksi */}
                        <div className="mt-10 flex flex-col sm:flex-row gap-4 justify-center">
                            <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} type="button" onClick={() => window.history.back()} className="inline-flex items-center justify-center gap-2 px-8 py-3 font-semibold rounded-xl border border-green-600 text-green-600 bg-white hover:bg-green-50 transition">
                                <FiArrowLeft /> Ubah Data
                            </motion.button>

                            <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={handleSubmit} disabled={processing} className="inline-flex items-center justify-center gap-2 px-8 py-3 font-semibold rounded-xl shadow-lg text-white bg-green-600 hover:bg-green-700 disabled:opacity-50 transition">
                                <FiCheckCircle /> {processing ? 'Memproses...' : 'Konfirmasi & Kirim'}
                            </motion.button>
                        </div>
                    </div>
                </motion.div>
            </main>

            <FooterNote />
        </div>
    );
}
