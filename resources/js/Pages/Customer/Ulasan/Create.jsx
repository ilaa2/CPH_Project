import React from 'react';
import CustomerLayout, { SiteHeader, FooterNote } from '@/Layouts/CustomerLayout';
import { Head, useForm, Link } from '@inertiajs/react';
import { FaStar } from 'react-icons/fa';
import InputError from '@/Components/InputError';
import PrimaryButton from '@/Components/PrimaryButton';

export default function Create({ auth, pesanan }) {
    // Inisialisasi state reviews berdasarkan item pesanan
    const { data, setData, post, processing, errors } = useForm({
        pesanan_id: pesanan.id,
        reviews: pesanan.items.map(item => ({
            produk_id: item.produk_id,
            nama_produk: item.produk ? item.produk.nama : 'Produk Tidak Ditemukan',
            gambar_produk: item.produk ? item.produk.gambar : null,
            rating: 5,
            komentar: '',
            fotos: []
        }))
    });

    // Helper untuk mengubah data review spesifik
    const handleReviewChange = (index, field, value) => {
        const newReviews = [...data.reviews];
        newReviews[index][field] = value;
        setData('reviews', newReviews);
    };

    // Helper untuk upload foto review spesifik
    const handleFotoChange = (index, e) => {
        const files = Array.from(e.target.files);
        // Batasi maksimal 3 foto per produk
        if (files.length > 3) {
            alert('Maksimal 3 foto per produk.');
            return;
        }
        handleReviewChange(index, 'fotos', files);
    };

    const submit = (e) => {
        e.preventDefault();
        post(route('customer.ulasan.store'));
    };

    return (
        <>
            <Head title="Beri Ulasan Produk" />
            <SiteHeader auth={auth} />

            <div className="py-12 bg-gray-50 min-h-screen">
                <div className="max-w-4xl mx-auto sm:px-6 lg:px-8">
                    <div className="bg-white overflow-hidden shadow-sm sm:rounded-lg">
                        <div className="p-6 text-gray-900">
                            <h2 className="text-2xl font-bold mb-6 text-gray-800 border-b pb-4">Beri Ulasan Pesanan #{pesanan.nomor_pesanan}</h2>

                            <form onSubmit={submit} encType="multipart/form-data">
                                <div className="space-y-8">
                                    {data.reviews.map((review, index) => (
                                        <div key={review.produk_id} className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                                            <div className="flex items-center gap-4 mb-4">
                                                <div className="w-16 h-16 bg-white rounded-md border overflow-hidden flex-shrink-0">
                                                    {review.gambar_produk ? (
                                                        <img src={`/storage/${review.gambar_produk}`} alt={review.nama_produk} className="w-full h-full object-cover" />
                                                    ) : (
                                                        <div className="w-full h-full bg-gray-200 flex items-center justify-center text-xs text-gray-500">No Img</div>
                                                    )}
                                                </div>
                                                <div>
                                                    <h3 className="font-semibold text-lg text-gray-800">{review.nama_produk}</h3>
                                                    <p className="text-sm text-gray-500">Bagaimana kualitas produk ini?</p>
                                                </div>
                                            </div>

                                            {/* Rating Stars */}
                                            <div className="mb-4">
                                                <label className="block font-medium text-sm text-gray-700 mb-1">Rating</label>
                                                <div className="flex items-center gap-1">
                                                    {[1, 2, 3, 4, 5].map((star) => (
                                                        <button
                                                            type="button"
                                                            key={star}
                                                            onClick={() => handleReviewChange(index, 'rating', star)}
                                                            className="focus:outline-none transition-colors"
                                                        >
                                                            <FaStar
                                                                size={28}
                                                                className={star <= review.rating ? "text-yellow-400" : "text-gray-300"}
                                                            />
                                                        </button>
                                                    ))}
                                                </div>
                                                {errors[`reviews.${index}.rating`] && (
                                                    <div className="text-red-600 text-sm mt-1">{errors[`reviews.${index}.rating`]}</div>
                                                )}
                                            </div>

                                            {/* Komentar */}
                                            <div className="mb-4">
                                                <label className="block font-medium text-sm text-gray-700 mb-1">Komentar Anda</label>
                                                <textarea
                                                    className="w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500"
                                                    rows="3"
                                                    placeholder={`Ceritakan pengalaman Anda menggunakan ${review.nama_produk}...`}
                                                    value={review.komentar}
                                                    onChange={(e) => handleReviewChange(index, 'komentar', e.target.value)}
                                                ></textarea>
                                                {errors[`reviews.${index}.komentar`] && (
                                                    <div className="text-red-600 text-sm mt-1">{errors[`reviews.${index}.komentar`]}</div>
                                                )}
                                            </div>

                                            {/* Foto Upload */}
                                            <div>
                                                <label className="block font-medium text-sm text-gray-700 mb-1">Foto Produk (Opsional, Max 3)</label>
                                                <input
                                                    type="file"
                                                    multiple
                                                    accept="image/*"
                                                    onChange={(e) => handleFotoChange(index, e)}
                                                    className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-green-50 file:text-green-700 hover:file:bg-green-100 transition"
                                                />
                                                {errors[`reviews.${index}.fotos`] && (
                                                    <div className="text-red-600 text-sm mt-1">{errors[`reviews.${index}.fotos`]}</div>
                                                )}
                                            </div>
                                        </div>
                                    ))}
                                </div>

                                <div className="mt-8 flex justify-end gap-3">
                                    <Link
                                        href={route('customer.pesanan.index')}
                                        className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition font-medium"
                                    >
                                        Batal
                                    </Link>
                                    <PrimaryButton disabled={processing}>
                                        {processing ? 'Mengirim...' : 'Kirim Semua Ulasan'}
                                    </PrimaryButton>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            </div>
            <FooterNote />
        </>
    );
}
