import Modal from '@/Components/Modal';
import { format } from 'date-fns';
import { id } from 'date-fns/locale';

export default function DetailModal({ item, onClose, onEdit, onViewReview }) {
    if (!item) return null;

    const totalVisitors = Number(item.jumlah_dewasa || 0) + Number(item.jumlah_anak || 0) + Number(item.jumlah_balita || 0);

    return (
        <Modal show={true} onClose={onClose} maxWidth="lg">
            <div className="p-6">
                <div className="flex justify-between items-center mb-6 border-b pb-3">
                    <h2 className="text-xl font-bold text-gray-800">Detail Kunjungan</h2>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition-colors">✕</button>
                </div>

                <div className="space-y-4">
                    <div className="grid grid-cols-3 gap-2">
                        <span className="text-sm font-semibold text-gray-500 uppercase tracking-wider">Pelanggan</span>
                        <span className="col-span-2 text-sm text-gray-900 font-medium">: {item.user?.name || '-'}</span>
                    </div>
                    <div className="grid grid-cols-3 gap-2">
                        <span className="text-sm font-semibold text-gray-500 uppercase tracking-wider">Tipe</span>
                        <span className="col-span-2 text-sm text-gray-900">: {item.tipe?.nama_tipe || '-'}</span>
                    </div>
                    <div className="grid grid-cols-3 gap-2">
                        <span className="text-sm font-semibold text-gray-500 uppercase tracking-wider">Tanggal</span>
                        <span className="col-span-2 text-sm text-gray-900">: {item.tanggal ? format(new Date(item.tanggal), 'eeee, dd MMMM yyyy', { locale: id }) : '-'}</span>
                    </div>
                    <div className="grid grid-cols-3 gap-2">
                        <span className="text-sm font-semibold text-gray-500 uppercase tracking-wider">Jam</span>
                        <span className="col-span-2 text-sm text-gray-900">: {item.jam || '-'} WIB</span>
                    </div>

                    <div className="border-t pt-4 mt-4">
                        <h3 className="text-xs font-bold text-gray-400 uppercase mb-3 tracking-widest">Rincian Pengunjung</h3>
                        <div className="grid grid-cols-1 gap-2 bg-gray-50 p-3 rounded-lg border border-gray-100">
                            <div className="flex justify-between text-sm">
                                <span className="text-gray-600">Dewasa</span>
                                <span className="font-semibold">{item.jumlah_dewasa || 0}</span>
                            </div>
                            <div className="flex justify-between text-sm">
                                <span className="text-gray-600">Anak (&gt;2 thn)</span>
                                <span className="font-semibold">{item.jumlah_anak || 0}</span>
                            </div>
                            <div className="flex justify-between text-sm">
                                <span className="text-gray-600">Balita (&lt;2 thn)</span>
                                <span className="font-semibold">{item.jumlah_balita || 0}</span>
                            </div>
                            <div className="flex justify-between text-sm border-t pt-2 mt-1 font-bold text-green-700">
                                <span>Total Peserta</span>
                                <span>{totalVisitors} Orang</span>
                            </div>
                        </div>
                    </div>

                    <div className="border-t pt-4">
                        <div className="flex justify-between items-center mb-1">
                            <span className="text-sm font-semibold text-gray-500 uppercase tracking-wider">Status</span>
                            <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase ${item.status === 'Selesai' ? 'bg-blue-100 text-blue-800' :
                                item.status === 'Dijadwalkan' ? 'bg-green-100 text-green-800' :
                                    'bg-orange-100 text-orange-800'
                                }`}>
                                {item.status}
                            </span>
                        </div>
                        <div className="flex justify-between items-center pt-2">
                            <span className="text-sm font-semibold text-gray-500 uppercase tracking-wider">Total Biaya</span>
                            <span className="text-lg font-bold text-green-700">
                                {new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(item.total_biaya || 0)}
                            </span>
                        </div>
                    </div>
                </div>

                <div className="mt-8 flex justify-end space-x-3">


                    {(item.status === 'Dijadwalkan' || item.status === 'Menunggu Konfirmasi') && (
                        <button
                            onClick={() => { onClose(); if (onEdit) onEdit(item); }}
                            className="px-4 py-2 bg-green-50 hover:bg-green-100 text-green-700 font-bold rounded-xl transition-all border border-green-200 flex items-center gap-1"
                        >
                            <span>✅</span> Selesaikan
                        </button>
                    )}

                    <button
                        onClick={onClose}
                        className="px-6 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold rounded-xl transition-all shadow-sm"
                    >
                        Tutup
                    </button>
                </div>
            </div>
        </Modal>
    );
}
