import Modal from '@/Components/Modal';
import { useForm } from '@inertiajs/react';
import { useEffect } from 'react';
import Swal from 'sweetalert2';

export default function EditModal({ item, onClose }) {
    const { data, setData, put, processing, errors, reset } = useForm({
        status: item?.status || 'Dijadwalkan',
        jumlah_dewasa: item?.jumlah_dewasa || 0,
        jumlah_anak: item?.jumlah_anak || 0,
        jumlah_balita: item?.jumlah_balita || 0,
        total_biaya: item?.total_biaya || 0,
        pelanggan_id: item?.pelanggan_id || '',
        tipe_id: item?.tipe_id || '',
        tanggal: item?.tanggal || '',
        jam: item?.jam || '',
    });

    useEffect(() => {
        if (item) {
            reset({
                status: item.status,
                jumlah_dewasa: item.jumlah_dewasa,
                jumlah_anak: item.jumlah_anak,
                jumlah_balita: item.jumlah_balita,
                total_biaya: item.total_biaya,
                pelanggan_id: item.pelanggan_id,
                tipe_id: item.tipe_id,
                tanggal: item.tanggal,
                jam: item.jam,
            });
        }
    }, [item]);

    const handleSubmit = (e) => {
        e.preventDefault();

        put(route('kunjungan.update', item.id), {
            onSuccess: () => {
                Swal.fire({
                    icon: 'success',
                    title: 'Berhasil',
                    text: 'Data kunjungan berhasil diperbarui!',
                    timer: 2000,
                    showConfirmButton: false,
                });
                onClose();
            },
        });
    };

    return (
        <Modal show={true} onClose={onClose} maxWidth="lg">
            <div className="p-6">
                <h2 className="text-xl font-bold text-gray-800 mb-6 border-b pb-3">Edit Status & Data Kunjungan</h2>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-1">Status Kunjungan</label>
                        <select
                            value={data.status}
                            onChange={e => setData('status', e.target.value)}
                            className="w-full border-gray-300 rounded-lg shadow-sm focus:border-green-500 focus:ring-green-500"
                        >
                            <option value="Dijadwalkan">Dijadwalkan</option>
                            <option value="Selesai">Selesai</option>
                        </select>
                        {errors.status && <div className="text-red-500 text-xs mt-1">{errors.status}</div>}
                    </div>

                    <div className="grid grid-cols-3 gap-4">
                        <div>
                            <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Dewasa</label>
                            <input
                                type="number"
                                value={data.jumlah_dewasa}
                                onChange={e => setData('jumlah_dewasa', e.target.value)}
                                className="w-full border-gray-300 rounded-lg text-sm"
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Anak</label>
                            <input
                                type="number"
                                value={data.jumlah_anak}
                                onChange={e => setData('jumlah_anak', e.target.value)}
                                className="w-full border-gray-300 rounded-lg text-sm"
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Balita</label>
                            <input
                                type="number"
                                value={data.jumlah_balita}
                                onChange={e => setData('jumlah_balita', e.target.value)}
                                className="w-full border-gray-300 rounded-lg text-sm"
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-1">Total Biaya (Rp)</label>
                        <input
                            type="number"
                            value={data.total_biaya}
                            onChange={e => setData('total_biaya', e.target.value)}
                            className="w-full border-gray-300 rounded-lg shadow-sm focus:border-green-500 focus:ring-green-500"
                        />
                        {errors.total_biaya && <div className="text-red-500 text-xs mt-1">{errors.total_biaya}</div>}
                    </div>

                    <div className="mt-8 flex justify-end space-x-3">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-6 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold rounded-xl transition-all"
                        >
                            Batal
                        </button>
                        <button
                            type="submit"
                            disabled={processing}
                            className="px-6 py-2 bg-green-600 hover:bg-green-700 text-white font-bold rounded-xl transition-all shadow-md active:scale-95 disabled:opacity-50"
                        >
                            Simpan Perubahan
                        </button>
                    </div>
                </form>
            </div>
        </Modal>
    );
}
