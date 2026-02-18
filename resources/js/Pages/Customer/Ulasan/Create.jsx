import React, { useState } from 'react';
import CustomerLayout from '@/Layouts/CustomerLayout';
import { Head, useForm, Link } from '@inertiajs/react';
import PrimaryButton from '@/Components/PrimaryButton';

// Komponen Bintang Rating
const StarRating = ({ rating, setRating }) => {
    return (
        <div className="flex space-x-1">
            {[1, 2, 3, 4, 5].map((star) => (
                <svg
                    key={star}
                    onClick={() => setRating(star)}
                    className={`w-8 h-8 cursor-pointer transition-colors ${rating >= star ? 'text-yellow-400' : 'text-gray-300'}`}
                    fill="currentColor"
                    viewBox="0 0 20 20"
                >
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.286 3.957a1 1 0 00.95.69h4.16c.969 0 1.371 1.24.588 1.81l-3.363 2.44a1 1 0 00-.364 1.118l1.287 3.957c.3.921-.755 1.688-1.54 1.118l-3.363-2.44a1 1 0 00-1.175 0l-3.363 2.44c-.784.57-1.838-.197-1.54-1.118l1.287-3.957a1 1 0 00-.364-1.118L2.07 9.384c-.783-.57-.38-1.81.588-1.81h4.16a1 1 0 00.95-.69L9.049 2.927z" />
                </svg>
            ))}
        </div>
    );
};

export default function Create({ auth, pesanan }) {
    const { data, setData, post, processing, errors } = useForm({
        pesanan_id: pesanan.id,
        reviews: (pesanan.items || []).map(item => ({
            produk_id: item.produk_id,
            nama_produk: item.produk ? item.produk.nama : 'Produk',
            gambar_produk: item.produk ? item.produk.gambar : null,
            rating: 0,
        })),
        komentar: '',
        fotos: []
    });

    const [previews, setPreviews] = useState([]);

    const handleReviewChange = (index, field, value) => {
        const newReviews = [...data.reviews];
        newReviews[index][field] = value;
        setData('reviews', newReviews);
    };

    const handleFotoChange = (e) => {
        const files = Array.from(e.target.files);
        if (files.length > 3) {
            alert('Maksimal 3 foto.');
            return;
        }
        setData('fotos', files);

        // Generate preview
        setPreviews(files.map(file => URL.createObjectURL(file)));
    };

    const submit = (e) => {
        e.preventDefault();
        post(route('customer.ulasan.store'));
    };

    return (
        <CustomerLayout auth={auth}>
            <Head title="Beri Ulasan Pesanan" />

            <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
                <div className="max-w-2xl mx-auto">
                    <div className="bg-white p-8 rounded-lg shadow-md">
                        <h1 className="text-2xl font-bold text-gray-800 mb-2">Beri Ulasan</h1>
                        <p className="text-gray-600 mb-6">
                            Bagaimana pengalaman belanja Anda pada pesanan #{pesanan.nomor_pesanan || pesanan.kode_pesanan || pesanan.id}?
                        </p>

                        {data.reviews.length === 0 ? (
                            <div className="text-center py-8 text-gray-500">
                                <p>Tidak ada produk untuk diulas pada pesanan ini.</p>
                                <Link
                                    href={route('customer.pesanan.index')}
                                    className="mt-4 inline-block text-green-600 hover:text-green-700 font-medium"
                                >
                                    ← Kembali ke Pesanan
                                </Link>
                            </div>
                        ) : (
                            <form onSubmit={submit} className="space-y-8">
                                {/* List Produk & Rating */}
                                <div className="space-y-6">
                                    {data.reviews.map((review, index) => (
                                        <div key={review.produk_id} className="flex flex-col sm:flex-row sm:items-center gap-4 bg-gray-50 p-4 rounded-lg border border-gray-100">
                                            {/* Product Info */}
                                            <div className="flex items-center gap-4 flex-1">
                                                <div className="w-14 h-14 bg-white rounded-md border overflow-hidden flex-shrink-0">
                                                    {review.gambar_produk ? (
                                                        <img src={`/storage/${review.gambar_produk}`} alt={review.nama_produk} className="w-full h-full object-cover" />
                                                    ) : (
                                                        <div className="w-full h-full bg-gray-200 flex items-center justify-center text-xs text-gray-500">No Img</div>
                                                    )}
                                                </div>
                                                <div>
                                                    <h3 className="font-semibold text-gray-800">{review.nama_produk}</h3>
                                                    <p className="text-sm text-gray-500">Bagaimana kualitas produk ini?</p>
                                                </div>
                                            </div>

                                            {/* Rating Stars */}
                                            <div className="flex flex-col sm:items-end">
                                                <StarRating
                                                    rating={review.rating}
                                                    setRating={(rating) => handleReviewChange(index, 'rating', rating)}
                                                />
                                                {errors[`reviews.${index}.rating`] && (
                                                    <p className="text-sm text-red-600 mt-1">{errors[`reviews.${index}.rating`]}</p>
                                                )}
                                            </div>
                                        </div>
                                    ))}
                                </div>

                                {/* Global Comment & Photos */}
                                <div className="bg-white border-t pt-6 space-y-6">
                                    <h2 className="text-lg font-semibold text-gray-800">Ceritakan Pengalaman Anda</h2>

                                    {/* Komentar Global */}
                                    <div>
                                        <label htmlFor="komentar" className="block text-sm font-medium text-gray-700">
                                            Komentar untuk seluruh pesanan
                                        </label>
                                        <textarea
                                            id="komentar"
                                            value={data.komentar}
                                            onChange={(e) => setData('komentar', e.target.value)}
                                            rows="4"
                                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500"
                                            placeholder="Ceritakan pengalaman belanja Anda secara umum..."
                                        ></textarea>
                                        {errors.komentar && (
                                            <p className="text-sm text-red-600 mt-2">{errors.komentar}</p>
                                        )}
                                    </div>

                                    {/* Foto Upload Global */}
                                    <div>
                                        <label htmlFor="fotos" className="block text-sm font-medium text-gray-700">
                                            Unggah Foto (Opsional, Max 3)
                                        </label>
                                        <input
                                            type="file"
                                            id="fotos"
                                            multiple
                                            accept="image/*"
                                            onChange={handleFotoChange}
                                            className="mt-1 block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-green-50 file:text-green-700 hover:file:bg-green-100"
                                        />
                                        {previews.length > 0 && (
                                            <div className="mt-4">
                                                <p className="font-medium text-sm text-gray-700 mb-2">Pratinjau Gambar:</p>
                                                <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
                                                    {previews.map((url, i) => (
                                                        <img
                                                            key={i}
                                                            src={url}
                                                            alt={`Preview ${i + 1}`}
                                                            className="w-full h-24 object-cover rounded-lg border"
                                                        />
                                                    ))}
                                                </div>
                                            </div>
                                        )}
                                        {errors.fotos && (
                                            <p className="text-sm text-red-600 mt-2">{errors.fotos}</p>
                                        )}
                                    </div>
                                </div>

                                <div className="flex justify-end gap-3 pt-4 border-t">
                                    <Link
                                        href={route('customer.pesanan.index')}
                                        className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition font-medium"
                                    >
                                        Batal
                                    </Link>
                                    <PrimaryButton disabled={processing}>
                                        {processing ? 'Mengirim...' : 'Kirim Ulasan'}
                                    </PrimaryButton>
                                </div>
                            </form>
                        )}
                    </div>
                </div>
            </div>
        </CustomerLayout>
    );
}
