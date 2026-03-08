import { useForm } from '@inertiajs/react';
import { useEffect, useState } from 'react';
import Swal from 'sweetalert2';
import Modal from '@/Components/Modal';
import InputError from '@/Components/InputError';
import Select from 'react-select';

export default function KunjunganFormModal({ isOpen, onClose, pelangganList, tipeKunjunganList }) {
    const { data, setData, post, processing, errors, reset, clearErrors } = useForm({
        user_id: '',
        tipe_id: '',
        tanggal: new Date().toISOString().split('T')[0],
        jam: '08:00',
        jumlah_dewasa: 1,
        jumlah_anak: 0,
        jumlah_balita: 0,
        status: 'Dijadwalkan',
        payment_status: 'paid', // Admin entry assumed paid or pay later
    });

    const handleSubmit = (e) => {
        e.preventDefault();
        post(route('admin.kunjungan.store'), {
            onSuccess: () => {
                Swal.fire({
                    icon: 'success',
                    title: 'Berhasil',
                    text: 'Kunjungan berhasil dijadwalkan!',
                    timer: 2000,
                    showConfirmButton: false
                });
                reset();
                clearErrors();
                onClose();
            },
            onError: (errs) => {
                Swal.fire({ icon: 'error', title: 'Gagal', text: 'Periksa inputan Anda.' });
            }
        });
    };

    const handleClose = () => {
        reset();
        clearErrors();
        onClose();
    };

    // Safe Checks & Formatting
    const safeTipeList = Array.isArray(tipeKunjunganList) ? tipeKunjunganList : [];
    const safePelangganList = Array.isArray(pelangganList) ? pelangganList : [];

    const pelangganOptions = safePelangganList.map(p => ({
        value: p.id,
        label: `${p.name} (${p.email})`
    }));

    const tipeOptions = safeTipeList.map(t => ({
        value: t.id,
        label: t.nama_tipe === 'Umum'
            ? `${t.nama_tipe} - Mulai dari Rp 10.000`
            : `${t.nama_tipe} - Rp ${(t.harga_tiket || 0).toLocaleString('id-ID')}`
    }));

    return (
        <Modal show={isOpen} onClose={handleClose} maxWidth="2xl">
            <div className="flex flex-col h-full bg-white rounded-lg overflow-hidden">

                <div className="px-6 py-4 border-b flex justify-between items-center bg-green-50">
                    <h2 className="text-xl font-bold text-green-800">Buat Jadwal Kunjungan Baru</h2>
                    <button onClick={handleClose} className="text-gray-400 hover:text-gray-600">✕</button>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-4 overflow-y-auto max-h-[80vh]">

                    {/* Pelanggan */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Pelanggan</label>
                        <Select
                            options={pelangganOptions}
                            value={pelangganOptions.find(opt => opt.value === data.user_id)}
                            onChange={(opt) => setData('user_id', opt ? opt.value : '')}
                            placeholder="Pilih Pelanggan..."
                            className="text-sm"
                        />
                        <InputError message={errors.user_id} className="mt-1" />
                    </div>

                    {/* Tanggal & Jam */}
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Tanggal</label>
                            <input type="date" className="w-full border-gray-300 rounded-md shadow-sm focus:ring-green-500 focus:border-green-500"
                                value={data.tanggal} onChange={e => setData('tanggal', e.target.value)} />
                            <InputError message={errors.tanggal} className="mt-1" />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Jam</label>
                            <input type="time" className="w-full border-gray-300 rounded-md shadow-sm focus:ring-green-500 focus:border-green-500"
                                value={data.jam} onChange={e => setData('jam', e.target.value)} />
                            <InputError message={errors.jam} className="mt-1" />
                        </div>
                    </div>

                    {/* Tipe Kunjungan */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Tipe Kunjungan</label>
                        <Select
                            options={tipeOptions}
                            value={tipeOptions.find(opt => opt.value === data.tipe_id)}
                            onChange={(opt) => setData('tipe_id', opt ? opt.value : '')}
                            placeholder="Pilih Paket..."
                            className="text-sm"
                        />
                        <InputError message={errors.tipe_id} className="mt-1" />
                    </div>

                    {/* Jumlah Peserta */}
                    <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                        <label className="block text-sm font-semibold text-gray-700 mb-2">Jumlah Peserta</label>
                        <div className="grid grid-cols-3 gap-4">
                            <div>
                                <label className="text-xs text-gray-500">Dewasa</label>
                                <input type="number" min="1" className="w-full border-gray-300 rounded-md text-sm"
                                    value={data.jumlah_dewasa} onChange={e => setData('jumlah_dewasa', e.target.value)} />
                            </div>
                            <div>
                                <label className="text-xs text-gray-500">Anak-anak</label>
                                <input type="number" min="0" className="w-full border-gray-300 rounded-md text-sm"
                                    value={data.jumlah_anak} onChange={e => setData('jumlah_anak', e.target.value)} />
                            </div>
                            <div>
                                <label className="text-xs text-gray-500">Balita</label>
                                <input type="number" min="0" className="w-full border-gray-300 rounded-md text-sm"
                                    value={data.jumlah_balita} onChange={e => setData('jumlah_balita', e.target.value)} />
                            </div>
                        </div>
                        {(errors.jumlah_dewasa || errors.jumlah_anak) && <p className="text-xs text-red-500 mt-1">Minimal 1 peserta dewasa/anak.</p>}
                    </div>

                    {/* Status */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Status Kunjungan</label>
                        <select className="w-full border-gray-300 rounded-md shadow-sm focus:ring-green-500 focus:border-green-500"
                            value={data.status} onChange={e => setData('status', e.target.value)}>
                            <option value="Dijadwalkan">Dijadwalkan (Confirmed)</option>
                            <option value="Menunggu Pembayaran">Menunggu Pembayaran</option>
                            <option value="Selesai">Selesai</option>
                        </select>
                    </div>

                    <div className="pt-4 border-t flex justify-end space-x-3">
                        <button type="button" onClick={handleClose} className="px-4 py-2 bg-gray-100 text-gray-700 rounded hover:bg-gray-200">Batal</button>
                        <button type="submit" disabled={processing} className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 shadow disabled:opacity-50">
                            {processing ? 'Menyimpan...' : 'Simpan Jadwal'}
                        </button>
                    </div>

                </form>
            </div>
        </Modal>
    );
}
