import React, { useState } from 'react';
import { Head, useForm } from '@inertiajs/react';
import { SiteHeader, FooterNote } from '@/Layouts/CustomerLayout';
import PrimaryButton from '@/Components/PrimaryButton';
import InputError from '@/Components/InputError';
import InputLabel from '@/Components/InputLabel';
import TextInput from '@/Components/TextInput';
import { FiStar } from 'react-icons/fi';

const StarRating = ({ rating, setRating }) => {
    return (
        <div className="flex space-x-1">
            {[...Array(5)].map((_, index) => {
                const starValue = index + 1;
                return (
                    <FiStar
                        key={starValue}
                        className={`w-8 h-8 cursor-pointer ${starValue <= rating ? 'text-yellow-400' : 'text-gray-300'}`}
                        fill={starValue <= rating ? 'currentColor' : 'none'}
                        onClick={() => setRating(starValue)}
                    />
                );
            })}
        </div>
    );
};

export default function CreateUlasan({ auth, pesanan_id }) {
    const { data, setData, post, processing, errors } = useForm({
        rating: 0,
        komentar: '',
        foto_ulasan: [],
        pesanan_id: pesanan_id,
    });

    const [preview, setPreview] = useState([]);

    const handleFileChange = (e) => {
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
        post(route('customer.ulasan.store'));
    };

    return (
        <>
            <Head title="Beri Ulasan" />
            <SiteHeader auth={auth} />

            <main className="bg-gray-50 font-sans">
                <div className="max-w-2xl mx-auto px-4 py-12">
                    <div className="bg-white p-8 rounded-xl shadow-sm border">
                        <h1 className="text-2xl font-bold text-gray-900 tracking-tight mb-6">Beri Ulasan Anda</h1>

                        <form onSubmit={submit} className="space-y-6">
                            <div>
                                <InputLabel value="Rating Anda" />
                                <div className="mt-2">
                                    <StarRating rating={data.rating} setRating={(value) => setData('rating', value)} />
                                </div>
                                <InputError message={errors.rating} className="mt-2" />
                            </div>

                            <div>
                                <InputLabel htmlFor="komentar" value="Ulasan Anda" />
                                <textarea
                                    id="komentar"
                                    value={data.komentar}
                                    onChange={(e) => setData('komentar', e.target.value)}
                                    className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:border-green-500 focus:ring-green-500 sm:text-sm"
                                    rows="5"
                                    placeholder="Bagaimana pengalaman Anda dengan produk ini?"
                                ></textarea>
                                <InputError message={errors.komentar} className="mt-2" />
                            </div>

                            <div>
                                <InputLabel htmlFor="foto_ulasan" value="Unggah Foto (Opsional)" />
                                <TextInput
                                    id="foto_ulasan"
                                    type="file"
                                    className="mt-1 block w-full"
                                    onChange={handleFileChange}
                                    multiple // Memungkinkan pemilihan banyak file
                                    accept="image/*" // Membatasi hanya untuk file gambar
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
                                <InputError message={errors.foto_ulasan} className="mt-2" />
                            </div>

                            <div className="flex justify-end">
                                <PrimaryButton disabled={processing}>
                                    {processing ? 'Mengirim...' : 'Kirim Ulasan'}
                                </PrimaryButton>
                            </div>
                        </form>
                    </div>
                </div>
            </main>

            <FooterNote />
        </>
    );
}
