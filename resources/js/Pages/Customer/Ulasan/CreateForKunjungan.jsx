import { Head, useForm } from '@inertiajs/react';
import CustomerLayout from '@/Layouts/CustomerLayout';
import PrimaryButton from '@/Components/PrimaryButton';
import { useState } from 'react';

// Komponen Bintang Rating
const StarRating = ({ rating, setRating }) => {
    return (
        <div className="flex space-x-1">
            {[1, 2, 3, 4, 5].map((star) => (
                <svg
                    key={star}
                    onClick={() => setRating(star)}
                    className={`w-8 h-8 cursor-pointer ${rating >= star ? 'text-yellow-400' : 'text-gray-300'}`}
                    fill="currentColor"
                    viewBox="0 0 20 20"
                >
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.286 3.957a1 1 0 00.95.69h4.16c.969 0 1.371 1.24.588 1.81l-3.363 2.44a1 1 0 00-.364 1.118l1.287 3.957c.3.921-.755 1.688-1.54 1.118l-3.363-2.44a1 1 0 00-1.175 0l-3.363 2.44c-.784.57-1.838-.197-1.54-1.118l1.287-3.957a1 1 0 00-.364-1.118L2.07 9.384c-.783-.57-.38-1.81.588-1.81h4.16a1 1 0 00.95-.69L9.049 2.927z" />
                </svg>
            ))}
        </div>
    );
};


export default function CreateForKunjungan({ auth, kunjungan }) {
    const { data, setData, post, processing, errors } = useForm({
        kunjungan_id: kunjungan.id,
        rating: 0,
        komentar: '',
        foto_ulasan: [],
    });

    const [preview, setPreview] = useState([]);

    const handleImageChange = (e) => {
        const files = Array.from(e.target.files);
        setData('foto_ulasan', files);

        if (files.length > 0) {
            const newPreviews = files.map(file => URL.createObjectURL(file));
            setPreview(newPreviews);
        } else {
            setPreview([]);
        }
    };

    const submit = (e) => {
        e.preventDefault();
        post(route('customer.kunjungan.ulasan.store'));
    };

    return (
        <CustomerLayout user={auth.pelanggan}>
            <Head title="Beri Ulasan Kunjungan" />

            <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
                <div className="max-w-2xl mx-auto bg-white p-8 rounded-lg shadow-md">
                    <h1 className="text-2xl font-bold text-gray-800 mb-2">Beri Ulasan</h1>
                    <p className="text-gray-600 mb-6">Bagaimana pengalaman kunjungan Anda pada tanggal {kunjungan.tanggal}?</p>

                    <form onSubmit={submit} className="space-y-6">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Rating Anda</label>
                            <StarRating rating={data.rating} setRating={(rating) => setData('rating', rating)} />
                            {errors.rating && <p className="text-sm text-red-600 mt-2">{errors.rating}</p>}
                        </div>

                        <div>
                            <label htmlFor="komentar" className="block text-sm font-medium text-gray-700">
                                Komentar
                            </label>
                            <textarea
                                id="komentar"
                                value={data.komentar}
                                onChange={(e) => setData('komentar', e.target.value)}
                                rows="4"
                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500"
                                placeholder="Ceritakan pengalaman Anda..."
                            ></textarea>
                            {errors.komentar && <p className="text-sm text-red-600 mt-2">{errors.komentar}</p>}
                        </div>

                        <div>
                            <label htmlFor="foto_ulasan" className="block text-sm font-medium text-gray-700">
                                Unggah Foto (Opsional)
                            </label>
                            <input
                                type="file"
                                id="foto_ulasan"
                                onChange={handleImageChange}
                                className="mt-1 block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-green-50 file:text-green-700 hover:file:bg-green-100"
                                multiple
                                accept="image/*"
                            />
                            {preview.length > 0 && (
                                <div className="mt-4">
                                    <p className="font-medium text-sm text-gray-700 mb-2">Pratinjau Gambar:</p>
                                    <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-4">
                                        {preview.map((url, index) => (
                                            <img
                                                key={index}
                                                src={url}
                                                alt={`Preview ${index + 1}`}
                                                className="w-full h-24 object-cover rounded-lg border"
                                            />
                                        ))}
                                    </div>
                                </div>
                            )}
                            {errors.foto_ulasan && <p className="text-sm text-red-600 mt-2">{errors.foto_ulasan}</p>}
                        </div>

                        <div className="flex justify-end">
                            <PrimaryButton disabled={processing}>
                                {processing ? 'Mengirim...' : 'Kirim Ulasan'}
                            </PrimaryButton>
                        </div>
                    </form>
                </div>
            </div>
        </CustomerLayout>
    );
}
