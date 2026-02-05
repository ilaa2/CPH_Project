import { useForm } from '@inertiajs/react';
import { useState } from 'react';
import Swal from 'sweetalert2';
import Modal from '@/Components/Modal';

export default function PesananFormModal({ isOpen, onClose, pelangganList, produkList }) {
    const { data, setData, post, processing, errors, reset, clearErrors } = useForm({
        pelanggan_id: '',
        tanggal: new Date().toISOString().split('T')[0],
        status: 'Diproses',
        metode_pengiriman: 'pickup',
        alamat_pengiriman: '',
        ekspedisi: '',
        estimasi: '',
        biaya_pengiriman: 0,
        items: [{ produk_id: '', jumlah: 1 }]
    });

    const handleChangeItem = (index, field, value) => {
        const newItems = [...data.items];
        newItems[index][field] = field === 'jumlah' ? parseInt(value) || 1 : value;
        setData('items', newItems);
    };

    const addItem = () => {
        setData('items', [...data.items, { produk_id: '', jumlah: 1 }]);
    };

    const removeItem = (index) => {
        setData('items', data.items.filter((_, i) => i !== index));
    };

    // Parse estimasi to check if > 5 days
    const getMaxDays = (est) => {
        if (!est) return 0;
        const matches = est.match(/\d+/g);
        return matches ? Math.max(...matches.map(Number)) : 0;
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        post(route('admin.pesanan.store'), {
            onSuccess: () => {
                Swal.fire({
                    icon: 'success',
                    title: 'Berhasil',
                    text: 'Pesanan berhasil disimpan!',
                    timer: 2000,
                    showConfirmButton: false
                });
                reset();
                clearErrors();
                onClose();
            },
            onError: (errs) => {
                const msg = errs.message || 'Harap periksa kembali inputan Anda.';
                Swal.fire({ icon: 'error', title: 'Gagal', text: msg });
            }
        });
    };

    const handleClose = () => {
        reset();
        clearErrors();
        onClose();
    };

    return (
        <Modal show={isOpen} onClose={handleClose} maxWidth="4xl">
            <div className="flex flex-col h-full bg-white rounded-lg overflow-hidden">

                {/* Header */}
                <div className="px-6 py-4 border-b flex justify-between items-center bg-gray-50">
                    <h2 className="text-xl font-bold text-gray-800">Tambah Pesanan Baru</h2>
                    <button onClick={handleClose} className="text-gray-400 hover:text-gray-600 transition p-1 hover:bg-gray-200 rounded-full">
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="flex-1 flex flex-col overflow-hidden">
                    <div className="flex-1 overflow-y-auto p-6 custom-scrollbar max-h-[70vh]">
                        <div className="space-y-6">
                            {/* ROW 1: Pelanggan & Tanggal */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <label className="block text-sm font-medium mb-1">Pelanggan <span className="text-red-500">*</span></label>
                                    <select
                                        value={data.pelanggan_id}
                                        onChange={(e) => setData('pelanggan_id', e.target.value)}
                                        className="w-full border-gray-300 rounded focus:ring-green-500 focus:border-green-500"
                                    >
                                        <option value="">-- Pilih Pelanggan --</option>
                                        {pelangganList.map((p) => (
                                            <option key={p.id} value={p.id}>{p.name}</option>
                                        ))}
                                    </select>
                                    {errors.pelanggan_id && <p className="text-sm text-red-600 mt-1">{errors.pelanggan_id}</p>}
                                </div>

                                <div>
                                    <label className="block text-sm font-medium mb-1">Tanggal Pesanan <span className="text-red-500">*</span></label>
                                    <input
                                        type="date"
                                        value={data.tanggal}
                                        onChange={(e) => setData('tanggal', e.target.value)}
                                        className="w-full border-gray-300 rounded focus:ring-green-500 focus:border-green-500"
                                    />
                                    {errors.tanggal && <p className="text-sm text-red-600 mt-1">{errors.tanggal}</p>}
                                </div>
                            </div>

                            {/* ROW 2: Metode Pengiriman */}
                            <div>
                                <label className="block text-sm font-medium mb-2">Metode Pengiriman <span className="text-red-500">*</span></label>
                                <div className="grid grid-cols-3 gap-4">
                                    {[
                                        { value: 'pickup', label: '🏪 Toko', desc: 'Ambil Sendiri' },
                                        { value: 'local', label: '🛵 Lokal', desc: 'Kurir Duri' },
                                        { value: 'shipping', label: '📦 Ekspedisi', desc: 'JNE/J&T' },
                                    ].map((opt) => (
                                        <label
                                            key={opt.value}
                                            className={`p-3 border-2 rounded-lg cursor-pointer transition-all text-center ${data.metode_pengiriman === opt.value
                                                ? 'border-green-500 bg-green-50 ring-2 ring-green-200'
                                                : 'border-gray-200 hover:border-gray-300'
                                                }`}
                                        >
                                            <input
                                                type="radio"
                                                name="metode_pengiriman"
                                                value={opt.value}
                                                checked={data.metode_pengiriman === opt.value}
                                                onChange={(e) => setData('metode_pengiriman', e.target.value)}
                                                className="sr-only"
                                            />
                                            <div className="text-base font-semibold">{opt.label}</div>
                                            <div className="text-xs text-gray-500">{opt.desc}</div>
                                        </label>
                                    ))}
                                </div>
                                {errors.metode_pengiriman && <p className="text-sm text-red-600 mt-1">{errors.metode_pengiriman}</p>}
                            </div>

                            {/* DYNAMIC FIELDS based on method */}
                            {data.metode_pengiriman !== 'pickup' && (
                                <div className="p-4 bg-gray-50 rounded-lg border border-gray-200 space-y-4">
                                    {/* Alamat */}
                                    <div>
                                        <label className="block text-sm font-medium mb-1">
                                            Alamat Pengiriman <span className="text-red-500">*</span>
                                        </label>
                                        <textarea
                                            rows="2"
                                            value={data.alamat_pengiriman}
                                            onChange={(e) => setData('alamat_pengiriman', e.target.value)}
                                            placeholder={data.metode_pengiriman === 'local' ? 'Contoh: Jln. Sudirman No. 10, Duri' : 'Alamat lengkap (Jl, Kec, Kota, Provinsi)'}
                                            className="w-full border-gray-300 rounded focus:ring-green-500 focus:border-green-500"
                                        />
                                        {errors.alamat_pengiriman && <p className="text-sm text-red-600 mt-1">{errors.alamat_pengiriman}</p>}
                                    </div>

                                    {/* Ekspedisi fields (only for 'shipping') */}
                                    {data.metode_pengiriman === 'shipping' && (
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <div>
                                                <label className="block text-sm font-medium mb-1">Nama Ekspedisi <span className="text-red-500">*</span></label>
                                                <input
                                                    type="text"
                                                    value={data.ekspedisi}
                                                    onChange={(e) => setData('ekspedisi', e.target.value)}
                                                    placeholder="JNE / J&T"
                                                    className="w-full border-gray-300 rounded focus:ring-green-500 focus:border-green-500"
                                                />
                                                {errors.ekspedisi && <p className="text-sm text-red-600 mt-1">{errors.ekspedisi}</p>}
                                            </div>
                                            <div>
                                                <label className="block text-sm font-medium mb-1">Estimasi</label>
                                                <input
                                                    type="text"
                                                    value={data.estimasi}
                                                    onChange={(e) => setData('estimasi', e.target.value)}
                                                    placeholder="Cth: 2-3 Hari"
                                                    className="w-full border-gray-300 rounded focus:ring-green-500 focus:border-green-500"
                                                />
                                                {getMaxDays(data.estimasi) > 5 && (
                                                    <p className="text-xs text-yellow-600 font-bold mt-1">⚠️ Estimasi lama!</p>
                                                )}
                                                {errors.estimasi && <p className="text-sm text-red-600 mt-1">{errors.estimasi}</p>}
                                            </div>
                                        </div>
                                    )}

                                    {/* Biaya Pengiriman */}
                                    <div>
                                        <label className="block text-sm font-medium mb-1">Biaya Pengiriman (Rp)</label>
                                        <input
                                            type="number"
                                            min="0"
                                            value={data.biaya_pengiriman}
                                            onChange={(e) => setData('biaya_pengiriman', parseInt(e.target.value) || 0)}
                                            placeholder="0"
                                            className="w-full border-gray-300 rounded focus:ring-green-500 focus:border-green-500"
                                        />
                                        {errors.biaya_pengiriman && <p className="text-sm text-red-600 mt-1">{errors.biaya_pengiriman}</p>}
                                    </div>
                                </div>
                            )}

                            {/* PRODUK */}
                            <div>
                                <label className="block text-sm font-medium mb-2">Detail Produk <span className="text-red-500">*</span></label>
                                <div className="space-y-3 bg-gray-50 p-4 rounded-lg border">
                                    {data.items.map((item, index) => (
                                        <div key={index} className="flex items-center gap-2">
                                            <select
                                                value={item.produk_id}
                                                onChange={(e) => handleChangeItem(index, 'produk_id', e.target.value)}
                                                className="flex-1 border-gray-300 rounded text-sm focus:ring-green-500 focus:border-green-500"
                                            >
                                                <option value="">-- Pilih Produk --</option>
                                                {produkList.map((p) => (
                                                    <option key={p.id} value={p.id}>{p.nama} (Stok: {p.stok})</option>
                                                ))}
                                            </select>
                                            <input
                                                type="number"
                                                min="1"
                                                placeholder="Qty"
                                                value={item.jumlah}
                                                onChange={(e) => handleChangeItem(index, 'jumlah', e.target.value)}
                                                className="w-20 border-gray-300 rounded text-sm focus:ring-green-500 focus:border-green-500"
                                            />
                                            {data.items.length > 1 && (
                                                <button type="button" onClick={() => removeItem(index)} className="text-red-500 hover:text-red-700 p-2 hover:bg-red-50 rounded">✕</button>
                                            )}
                                        </div>
                                    ))}
                                    <button type="button" onClick={addItem} className="text-green-600 text-sm font-semibold hover:underline flex items-center gap-1">
                                        <span>+</span> Tambah Item Lain
                                    </button>
                                </div>
                                {errors.items && <p className="text-sm text-red-600 mt-1">{errors.items}</p>}
                            </div>

                        </div>
                    </div>

                    {/* Footer */}
                    <div className="px-6 py-4 bg-gray-50 border-t flex justify-end gap-3 sticky bottom-0">
                        <button type="button" onClick={handleClose} className="px-5 py-2 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-100 font-medium transition text-sm">
                            Batal
                        </button>
                        <button
                            type="submit"
                            disabled={processing}
                            className="px-5 py-2 bg-green-600 text-white rounded-lg shadow-md hover:bg-green-700 font-bold transition text-sm disabled:opacity-50"
                        >
                            {processing ? 'Menyimpan...' : 'Simpan Pesanan'}
                        </button>
                    </div>
                </form>
            </div>
        </Modal>
    );
}
