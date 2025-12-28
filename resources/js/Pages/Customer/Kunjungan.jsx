import CustomerLayout from '@/Layouts/CustomerLayout';
import { useForm, usePage, Head } from '@inertiajs/react';
import { useEffect, useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { FiUser, FiPhone, FiCalendar, FiUsers, FiSend, FiCheckCircle, FiClipboard, FiDollarSign, FiArrowRight, FiSmile, FiBriefcase } from 'react-icons/fi';
import Swal from 'sweetalert2';

// Komponen InputField yang Ditingkatkan
const InputField = ({ id, label, type, value, onChange, error, icon, description, ...props }) => (
    <div className="space-y-2">
        <label htmlFor={id} className="block text-sm font-semibold text-gray-700">{label}</label>
        {description && <p className="text-xs text-gray-500 -mt-1">{description}</p>}
        <div className="relative group">
            <span className="absolute inset-y-0 left-0 flex items-center pl-4 text-gray-400 group-focus-within:text-green-600 transition-colors duration-300">
                {icon}
            </span>
            <input
                id={id}
                type={type}
                value={value}
                onChange={onChange}
                className={`block w-full pl-12 pr-4 py-3 rounded-lg border ${error ? 'border-red-500' : 'border-gray-300'} bg-gray-50 focus:border-green-500 focus:ring-2 focus:ring-green-200 transition-all duration-300 text-sm`}
                {...props}
            />
        </div>
        {error && <div className="text-red-600 text-xs mt-1">{error}</div>}
    </div>
);

// Komponen Kartu Pilihan Tipe Kunjungan
const TipeKunjunganCard = ({ tipe, isSelected, onSelect }) => (
    <motion.div
        onClick={() => onSelect(tipe.id)}
        className={`p-5 border-2 rounded-xl cursor-pointer transition-all duration-300 ${isSelected ? 'border-green-500 bg-green-50 shadow-lg' : 'border-gray-300 bg-white hover:border-green-400'}`}
        whileHover={{ scale: 1.03 }}
    >
        <div className="flex items-center justify-between">
            <div className='flex items-center gap-4'>
                <div className={`w-8 h-8 rounded-full flex items-center justify-center ${isSelected ? 'bg-green-500' : 'bg-gray-200'}`}>
                    <FiClipboard className={`transition-colors ${isSelected ? 'text-white' : 'text-gray-600'}`} />
                </div>
                <div>
                    <h3 className="font-bold text-gray-800">{tipe.nama_tipe}</h3>
                    <p className="text-sm text-gray-500">{tipe.deskripsi || 'Pilih tipe kunjungan ini.'}</p>
                </div>
            </div>
            <div className={`w-6 h-6 rounded-full flex items-center justify-center border-2 ${isSelected ? 'border-green-500 bg-green-500' : 'border-gray-300'}`}>
                {isSelected && <FiCheckCircle className="text-white" />}
            </div>
        </div>
    </motion.div>
);


export default function Kunjungan({ auth, tipeKunjungan }) {
    const { flash } = usePage().props;

    // Definisikan fungsi formatCurrency di sini, sebelum digunakan oleh hooks.
    const formatCurrency = (number) => {
        return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(number);
    };

    const { data, setData, post, processing, errors, reset } = useForm({
        nama_lengkap: auth.pelanggan.nama || '',
        no_hp: auth.pelanggan.telepon || '',
        tanggal_kunjungan: '',
        tipe_kunjungan_id: tipeKunjungan.length > 0 ? tipeKunjungan[0].id : '',
        jumlah_dewasa: 1,
        jumlah_anak: 0,
        jumlah_balita: 0,
    });

    const selectedTipe = useMemo(() => {
        return tipeKunjungan.find(t => t.id === data.tipe_kunjungan_id);
    }, [data.tipe_kunjungan_id, tipeKunjungan]);

    // --- PERUBAHAN DIMULAI DI SINI ---
    // useEffect untuk me-reset jumlah pengunjung saat tipe kunjungan berubah
    useEffect(() => {
        if (!selectedTipe) return;

        if (selectedTipe.nama_tipe === 'Outing Class') {
            setData(currentData => ({
                ...currentData,
                jumlah_dewasa: 0,
                jumlah_anak: 0, // Reset ke 0, atau 1 jika Anda mau
                jumlah_balita: 0,
            }));
        } else if (selectedTipe.nama_tipe === 'Umum') {
            setData(currentData => ({
                ...currentData,
                jumlah_dewasa: 1, // Default 1 dewasa untuk sewa tempat
                jumlah_anak: 0,
                jumlah_balita: 0,
            }));
        }
        // Hapus error terkait field yang mungkin disembunyikan
        reset('jumlah_dewasa', 'jumlah_anak', 'jumlah_balita');
    }, [selectedTipe]); // Hanya bergantung pada selectedTipe
    // --- PERUBAHAN SELESAI DI SINI ---


    const { totalBiaya, rincianBiaya } = useMemo(() => {
        if (!selectedTipe) return { totalBiaya: 0, rincianBiaya: null };

        let biaya = 0;
        let rincian = {};

        // Menggunakan nama_tipe untuk logika, ini harus konsisten dengan data di database
        if (selectedTipe.nama_tipe === 'Umum') {
            const totalOrangBayar = data.jumlah_dewasa + data.jumlah_anak;
            biaya = totalOrangBayar * 10000; // Rp 10.000 per orang (dewasa + anak > 2th)
            rincian = {
                deskripsi: `${totalOrangBayar} Orang x ${formatCurrency(10000)}`,
                catatan: `Termasuk sound system. Balita (0-2 thn) gratis. Tidak dapat buket sayur.`
            };
        } else if (selectedTipe.nama_tipe === 'Outing Class') {
            if (data.jumlah_anak < 30) {
                biaya = 300000; // Biaya flat
                rincian = {
                    deskripsi: `Biaya Flat (< 30 Anak)`,
                    catatan: `Setiap anak dapat 1 pak sayur.`
                };
            } else {
                biaya = data.jumlah_anak * 10000; // Rp 10.000 per anak
                rincian = {
                    deskripsi: `${data.jumlah_anak} Anak x ${formatCurrency(10000)}`,
                    catatan: `Setiap anak dapat 1 pak sayur.`
                };
            }
        } else {
            // Logika default jika ada tipe lain
            const totalPengunjung = data.jumlah_dewasa + data.jumlah_anak + (data.jumlah_balita || 0);
            biaya = totalPengunjung * (selectedTipe.biaya || 0);
            rincian = {
                deskripsi: `${totalPengunjung} Orang x ${formatCurrency(selectedTipe.biaya || 0)}`,
                catatan: null
            };
        }

        return { totalBiaya: biaya, rincianBiaya: rincian };
    }, [selectedTipe, data.jumlah_dewasa, data.jumlah_anak, data.jumlah_balita, formatCurrency]);


    useEffect(() => {
        if (flash.success) {
            Swal.fire({
                icon: 'success',
                title: 'Berhasil!',
                text: flash.success,
                confirmButtonColor: '#22c55e',
            });
        } else if (flash.error) {
            Swal.fire({
                icon: 'error',
                title: 'Oops...',
                text: flash.error,
                confirmButtonColor: '#ef4444',
            });
        }
    }, [flash]);

    const handleSubmit = (e) => {
        e.preventDefault();
        // Data yang dikirim ke backend sekarang menyertakan rincian jumlah pengunjung
        post(route('kunjungan.handle_form'), {
            preserveScroll: true,
        });
    };

    return (
        <>
            <Head title="Jadwalkan Kunjungan" />

            <section className="relative h-[300px] sm:h-[400px] bg-cover bg-center" style={{ backgroundImage: "url('/storage/galeri/foto-palantea-14.jpeg')" }}>
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-black/20"></div>
                <div className="relative z-10 max-w-6xl mx-auto text-center px-6 flex flex-col justify-end h-full pb-20 text-white">
                    <motion.h1 initial={{ opacity: 0, y: 40 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }} className="text-4xl sm:text-5xl font-extrabold mb-2 drop-shadow-lg">
                        Jadwalkan Kunjungan Anda
                    </motion.h1>
                    <motion.p initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 1, delay: 0.3 }} className="text-lg sm:text-xl opacity-90 max-w-3xl mx-auto">
                        Rasakan pengalaman seru menjelajahi kebun hidroponik modern dan temukan kesegaran sayuran langsung dari sumbernya.
                    </motion.p>
                </div>
            </section>

            <main className="py-16 -mt-24 relative z-20">
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }} className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
                    <form onSubmit={handleSubmit}>
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 lg:gap-12">
                            {/* KOLOM KIRI: FORM & PILIHAN */}
                            <div className="lg:col-span-2 bg-white p-8 rounded-2xl shadow-lg border border-gray-100 space-y-8">
                                <div>
                                    <h2 className="text-2xl font-bold text-gray-800 mb-1">Langkah 1: Pilih Tipe Kunjungan</h2>
                                    <p className="text-gray-500 mb-6">Setiap tipe kunjungan menawarkan pengalaman dan harga yang berbeda.</p>
                                    <div className="space-y-4">
                                        {tipeKunjungan.map(tipe => (
                                            <TipeKunjunganCard
                                                key={tipe.id}
                                                tipe={tipe}
                                                isSelected={data.tipe_kunjungan_id === tipe.id}
                                                onSelect={(id) => setData('tipe_kunjungan_id', id)}
                                            />
                                        ))}
                                    </div>
                                    {errors.tipe_kunjungan_id && <div className="text-red-600 text-xs mt-2">{errors.tipe_kunjungan_id}</div>}
                                </div>

                                <div className="border-t border-gray-200 pt-8">
                                    <h2 className="text-2xl font-bold text-gray-800 mb-1">Langkah 2: Isi Detail Kunjungan</h2>
                                    <p className="text-gray-500">Lengkapi data diri dan jumlah pengunjung.</p>
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <InputField id="nama_lengkap" label="Nama Lengkap Kontak" type="text" value={data.nama_lengkap} onChange={e => setData('nama_lengkap', e.target.value)} error={errors.nama_lengkap} icon={<FiUser />} required />
                                    <InputField id="no_hp" label="Nomor HP (WhatsApp)" type="tel" value={data.no_hp} onChange={e => setData('no_hp', e.target.value)} error={errors.no_hp} icon={<FiPhone />} placeholder="08xxxxxxxxxx" required />
                                    <InputField id="tanggal_kunjungan" label="Tanggal Kunjungan" type="date" value={data.tanggal_kunjungan} onChange={e => setData('tanggal_kunjungan', e.target.value)} error={errors.tanggal_kunjungan} icon={<FiCalendar />} min={new Date().toISOString().split("T")[0]} required />
                                </div>

                                {/* --- PERUBAHAN DIMULAI DI SINI --- */}
                                {/* Input Jumlah Pengunjung Dinamis */}
                                {selectedTipe && selectedTipe.nama_tipe === 'Umum' && (
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-6 items-end">
                                        <InputField id="jumlah_dewasa" label="Jumlah Dewasa" type="number" value={data.jumlah_dewasa} onChange={e => setData('jumlah_dewasa', Math.max(1, Number(e.target.value)))} error={errors.jumlah_dewasa} icon={<FiBriefcase />} min="1" required />
                                        <InputField id="jumlah_anak" label="Jumlah Anak" description="Usia di atas 2 tahun" type="number" value={data.jumlah_anak} onChange={e => setData('jumlah_anak', Math.max(0, Number(e.target.value)))} error={errors.jumlah_anak} icon={<FiUsers />} min="0" required />
                                        <InputField id="jumlah_balita" label="Jumlah Balita" description="Usia 0-2 tahun" type="number" value={data.jumlah_balita} onChange={e => setData('jumlah_balita', Math.max(0, Number(e.target.value)))} error={errors.jumlah_balita} icon={<FiSmile />} min="0" required />
                                    </div>
                                )}

                                {selectedTipe?.nama_tipe === 'Outing Class' && (
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-6">
                                        <div className="md:col-span-1"> {/* Dibuat agar lebarnya sama */}
                                            <InputField id="jumlah_anak" label="Jumlah Anak" description="Total peserta anak" type="number" value={data.jumlah_anak} onChange={e => setData('jumlah_anak', Math.max(0, Number(e.target.value)))} error={errors.jumlah_anak} icon={<FiUsers />} min="0" required />
                                        </div>
                                    </div>
                                )}
                                {/* --- PERUBAHAN SELESAI DI SINI --- */}

                            </div>

                            {/* KOLOM KANAN: RINGKASAN BIAYA */}
                            <div className="lg:col-span-1">
                                <div className="bg-white p-8 rounded-2xl shadow-lg border border-gray-100 sticky top-24">
                                    <h2 className="text-2xl font-bold text-gray-800 mb-6">Ringkasan Biaya</h2>

                                    {selectedTipe ? (
                                        <div className="space-y-4">
                                            <div className="flex justify-between items-center">
                                                <span className="text-gray-600">Tipe Kunjungan</span>
                                                <span className="font-semibold text-gray-800">{selectedTipe.nama_tipe}</span>
                                            </div>

                                            {/* --- PERUBAHAN DIMULAI DI SINI --- */}
                                            {/* Tampilkan rincian jumlah hanya jika relevan */}
                                            <div className="border-t border-gray-200 pt-4 mt-4 space-y-2">
                                                {selectedTipe.nama_tipe === 'Umum' && (
                                                    <>
                                                        <div className="flex justify-between items-center text-sm">
                                                            <span className="text-gray-600">Dewasa</span>
                                                            <span className="font-medium text-gray-800">x {data.jumlah_dewasa}</span>
                                                        </div>
                                                        <div className="flex justify-between items-center text-sm">
                                                            <span className="text-gray-600">Anak (2th)</span>
                                                            <span className="font-medium text-gray-800">x {data.jumlah_anak}</span>
                                                        </div>
                                                        <div className="flex justify-between items-center text-sm">
                                                            <span className="text-gray-600">Balita (0-2th)</span>
                                                            <span className="font-medium text-gray-800">x {data.jumlah_balita}</span>
                                                        </div>
                                                    </>
                                                )}
                                                {selectedTipe.nama_tipe === 'Outing Class' && (
                                                    <div className="flex justify-between items-center text-sm">
                                                        <span className="text-gray-600">Anak</span>
                                                        <span className="font-medium text-gray-800">x {data.jumlah_anak}</span>
                                                    </div>
                                                )}
                                            </div>
                                            {/* --- PERUBAHAN SELESAI DI SINI --- */}


                                            {rincianBiaya && (
                                                <div className="bg-green-50 p-3 rounded-lg text-center">
                                                    <p className="text-sm font-semibold text-green-800">{rincianBiaya.deskripsi}</p>
                                                    {rincianBiaya.catatan && <p className="text-xs text-green-700 mt-1">{rincianBiaya.catatan}</p>}
                                                </div>
                                            )}

                                            <div className="border-t-2 border-dashed my-4 pt-4">
                                                <div className="flex justify-between font-bold text-xl">
                                                    <span>Total Biaya</span>
                                                    <span className="text-green-600">{formatCurrency(totalBiaya)}</span>
                                                </div>
                                            </div>
                                        </div>
                                    ) : (
                                        <p className="text-gray-500 text-center">Pilih tipe kunjungan untuk melihat rincian biaya.</p>
                                    )}

                                    <motion.button
                                        whileHover={{ scale: 1.05 }}
                                        whileTap={{ scale: 0.95 }}
                                        type="submit"
                                        disabled={processing}
                                        className="w-full mt-8 inline-flex items-center justify-center gap-2 px-8 py-4 font-semibold rounded-xl shadow-lg shadow-green-400/30 text-white bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 focus:ring-4 focus:ring-green-300 disabled:opacity-60 disabled:cursor-not-allowed transition-all"
                                    >
                                        {processing ? 'Memproses...' : 'Lanjut ke Konfirmasi'}
                                        {!processing && <FiArrowRight className="text-lg" />}
                                    </motion.button>
                                </div>
                            </div>
                        </div>
                    </form>
                </motion.div>
            </main>
        </>
    );
}

Kunjungan.layout = page => <CustomerLayout auth={page.props.auth}>{page}</CustomerLayout>;
