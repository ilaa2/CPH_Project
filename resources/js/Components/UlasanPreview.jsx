import { useState } from 'react';
import { useForm } from '@inertiajs/react';

// Sub-komponen Bintang Rating
const StarRating = ({ rating }) => (
    <div className="flex items-center space-x-0.5">
        {[...Array(5)].map((_, i) => (
            <svg key={i} className={`w-4 h-4 ${i < rating ? 'text-yellow-400' : 'text-gray-300'}`} fill="currentColor" viewBox="0 0 20 20">
                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.286 3.967a1 1 0 00.95.69h4.178c.969 0 1.371 1.24.588 1.81l-3.39 2.46a1 1 0 00-.364 1.118l1.286 3.966c.3.922-.755 1.688-1.54 1.118l-3.39-2.46a1 1 0 00-1.175 0l-3.39 2.46c-.784.57-1.838-.196-1.54-1.118l1.287-3.966a1 1 0 00-.364-1.118L2.045 9.394c-.783-.57-.38-1.81.588-1.81h4.178a1 1 0 00.95-.69l1.287-3.967z" />
            </svg>
        ))}
    </div>
);

export default function UlasanPreview({ ulasan, pelanggan, tipe, isAdmin = false }) {
    if (!ulasan) {
        return (
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-6 text-center">
                <p className="text-gray-500 font-medium">Pelanggan belum memberikan ulasan</p>
            </div>
        );
    }

    const { data, setData, post, processing, reset } = useForm({
        balasan: '',
    });
    const [isReplying, setIsReplying] = useState(false);
    const [localBalasan, setLocalBalasan] = useState(ulasan.balasan || null);

    const submitReply = (e) => {
        e.preventDefault();
        post(route('admin.ulasan.reply', ulasan.id), {
            preserveScroll: true,
            preserveState: true,
            onSuccess: () => {
                setLocalBalasan(data.balasan);
                setIsReplying(false);
                reset();
            }
        });
    };

    const hasBalasan = localBalasan || ulasan.balasan;

    return (
        <div className="bg-white border text-left border-gray-200 rounded-xl p-4 shadow-sm hover:shadow-md transition-shadow">

            <div className="flex items-start gap-4">
                {/* Avatar Pelanggan */}
                <img
                    src={pelanggan?.avatar ? `/storage/${pelanggan.avatar}` : `https://ui-avatars.com/api/?name=${pelanggan?.name}&color=7F9CF5&background=EBF4FF`}
                    alt={pelanggan?.name}
                    className="w-12 h-12 rounded-full object-cover border border-gray-100"
                />

                <div className="flex-1 space-y-3">
                    {/* Header: Nama & Tanggal */}
                    <div className="flex justify-between items-start">
                        <div>
                            <p className="font-bold text-gray-900 text-sm">{pelanggan?.name || 'Pelanggan'}</p>
                            <div className="flex items-center gap-2 text-xs text-gray-500 mt-0.5">
                                <span>{new Date(ulasan.tanggal).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}</span>
                                {tipe && (
                                    <>
                                        <span>•</span>
                                        <span className="bg-blue-50 text-blue-600 px-1.5 py-0.5 rounded">{tipe}</span>
                                    </>
                                )}
                            </div>
                        </div>
                        <StarRating rating={ulasan.rating} />
                    </div>

                    {/* Komentar */}
                    <div className="text-sm text-gray-700 leading-relaxed bg-gray-50 p-3 rounded-lg">
                        "{ulasan.komentar}"
                    </div>

                    {/* Foto Ulasan */}
                    {ulasan.fotos && ulasan.fotos.length > 0 && (
                        <div className="flex gap-2 overflow-x-auto pb-2">
                            {ulasan.fotos.map((foto, index) => (
                                <img
                                    key={index}
                                    src={`/storage/${foto.foto_path}`}
                                    alt={`Foto ${index + 1}`}
                                    className="w-20 h-20 object-cover rounded-lg border border-gray-200 hover:scale-105 transition-transform cursor-pointer"
                                    onClick={() => window.open(`/storage/${foto.foto_path}`, '_blank')}
                                />
                            ))}
                        </div>
                    )}

                    {/* Balasan Admin */}
                    {hasBalasan && (
                        <div className="mt-4 pl-4 border-l-4 border-green-500 bg-green-50 p-3 rounded-r-lg">
                            <p className="text-xs font-bold text-green-800 mb-1">Balasan Admin {ulasan.tanggal_balasan && `(${new Date(ulasan.tanggal_balasan).toLocaleDateString('id-ID')})`}</p>
                            <p className="text-sm text-gray-700">"{localBalasan || ulasan.balasan}"</p>
                        </div>
                    )}

                    {/* Form Balasan (Jika Admin & Belum ada balasan) */}
                    {isAdmin && !hasBalasan && (
                        <div className="mt-4">
                            {!isReplying ? (
                                <button
                                    onClick={() => setIsReplying(true)}
                                    className="text-sm text-green-600 font-medium hover:underline flex items-center gap-1"
                                >
                                    <span className="text-lg">↩️</span> Balas Ulasan
                                </button>
                            ) : (
                                <form onSubmit={submitReply} className="space-y-2">
                                    <textarea
                                        value={data.balasan}
                                        onChange={e => setData('balasan', e.target.value)}
                                        className="w-full text-sm border-gray-300 rounded-md shadow-sm focus:border-green-500 focus:ring-green-500"
                                        placeholder="Tulis balasan Anda..."
                                        rows="3"
                                        required
                                    ></textarea>
                                    <div className="flex gap-2 justify-end">
                                        <button
                                            type="button"
                                            onClick={() => setIsReplying(false)}
                                            className="px-3 py-1 text-xs text-gray-600 hover:text-gray-800"
                                        >
                                            Batal
                                        </button>
                                        <button
                                            type="submit"
                                            disabled={processing}
                                            className="px-3 py-1 text-xs bg-green-600 text-white rounded hover:bg-green-700 disabled:opacity-50"
                                        >
                                            Kirim Balasan
                                        </button>
                                    </div>
                                </form>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
