// File: resources/js/Pages/Customer/Profile.jsx

import React, { useState, useEffect } from 'react'; // 1. Tambahkan useEffect
import { useForm, Head } from '@inertiajs/react';
import Swal from 'sweetalert2'; // 2. Import SweetAlert2
import { SiteHeader, FooterNote } from '@/Layouts/CustomerLayout';
import DangerButton from '@/Components/DangerButton';
import Modal from '@/Components/Modal';
import TextInput from '@/Components/TextInput';
import InputLabel from '@/Components/InputLabel';
import SecondaryButton from '@/Components/SecondaryButton';
import PrimaryButton from '@/Components/PrimaryButton';
import InputError from '@/Components/InputError';

export default function Edit({ user, status }) {
    const [confirmingUserDeletion, setConfirmingUserDeletion] = useState(false);

    // Form untuk update informasi profil
    const { data, setData, patch, errors, processing, recentlySuccessful } = useForm({
        nama: user.nama,
        email: user.email,
        telepon: user.telepon || '',
        alamat: user.alamat || '',
    });

    // Form untuk update password
    const { data: passwordData, setData: setPasswordData, put: updatePassword, errors: passwordErrors, processing: passwordProcessing, recentlySuccessful: passwordRecentlySuccessful, reset: resetPasswordForm } = useForm({
        current_password: '',
        password: '',
        password_confirmation: '',
    });

    // Form untuk hapus akun
    const { data: deleteData, setData: setDeleteData, delete: deleteUser, processing: deleteProcessing, reset: resetDeleteForm, errors: deleteErrors, } = useForm({
        password: '',
    });


    // 3. Tambahkan useEffect hook untuk notifikasi
    useEffect(() => {
        if (recentlySuccessful) {
            if (status === 'profile-updated') {
                Swal.fire({
                    toast: true,
                    position: 'top-end',
                    icon: 'success',
                    title: 'Profil berhasil diperbarui!',
                    showConfirmButton: false,
                    timer: 3000,
                });
            }
            if (status === 'password-updated') {
                 Swal.fire({
                    toast: true,
                    position: 'top-end',
                    icon: 'success',
                    title: 'Password berhasil diubah!',
                    showConfirmButton: false,
                    timer: 3000,
                });
            }
        }
    }, [recentlySuccessful, status]); // Efek ini berjalan saat recentlySuccessful atau status berubah


    const submitProfile = (e) => {
        e.preventDefault();
        patch('/customer/profile');
    };

    const submitPassword = (e) => {
        e.preventDefault();
        updatePassword('/customer/profile/password', {
            preserveScroll: true,
            onSuccess: () => resetPasswordForm(),
        });
    };

    const confirmUserDeletion = () => {
        setConfirmingUserDeletion(true);
    };

    const closeModal = () => {
        setConfirmingUserDeletion(false);
        resetDeleteForm();
    };

    const submitDeleteUser = (e) => {
        e.preventDefault();
        deleteUser('/customer/profile', {
            preserveScroll: true,
            onSuccess: () => closeModal(),
        });
    };

    return (
        <>
            <Head title="Profil Saya" />
            <SiteHeader auth={{ user }} />

            <div className="bg-gray-50 py-12 sm:py-16">
                <div className="max-w-4xl mx-auto px-4 sm:px-6 space-y-8">

                    {/* Kartu Informasi Profil */}
                    <div className="bg-white border border-gray-200 rounded-lg shadow-sm p-6 sm:p-8">
                        <header>
                            <h2 className="text-lg font-medium text-gray-900">Informasi Profil</h2>
                            <p className="mt-1 text-sm text-gray-600">Perbarui informasi profil dan data pribadi Anda.</p>
                        </header>
                        <form onSubmit={submitProfile} className="mt-6 space-y-6">
                            <div>
                                <InputLabel htmlFor="nama" value="Nama" />
                                <TextInput id="nama" className="mt-1 block w-full" value={data.nama} onChange={(e) => setData('nama', e.target.value)} required />
                                <InputError message={errors.nama} className="mt-2" />
                            </div>
                            <div>
                                <InputLabel htmlFor="email" value="Email" />
                                <TextInput id="email" type="email" className="mt-1 block w-full" value={data.email} onChange={(e) => setData('email', e.target.value)} required />
                                <InputError message={errors.email} className="mt-2" />
                            </div>
                            <div>
                                <InputLabel htmlFor="telepon" value="Nomor Telepon" />
                                <TextInput id="telepon" type="tel" className="mt-1 block w-full" value={data.telepon} onChange={(e) => setData('telepon', e.target.value)} placeholder="08xxxxxxxxxx" />
                                <InputError message={errors.telepon} className="mt-2" />
                            </div>
                            <div>
                                <InputLabel htmlFor="alamat" value="Alamat" />
                                <textarea
                                    id="alamat"
                                    className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:border-green-500 focus:ring-green-500 sm:text-sm"
                                    value={data.alamat}
                                    onChange={(e) => setData('alamat', e.target.value)}
                                    rows="3"
                                    placeholder="Masukkan alamat lengkap Anda"
                                ></textarea>
                                <InputError message={errors.alamat} className="mt-2" />
                            </div>
                            <div className="flex items-center gap-4">
                                <PrimaryButton disabled={processing}>Simpan</PrimaryButton>
                                {/* 4. Hapus notifikasi teks yang lama */}
                                {/* {recentlySuccessful && status === 'profile-updated' && <p>Tersimpan.</p>} */}
                            </div>
                        </form>
                    </div>

                    {/* Kartu Ubah Password */}
                    <div className="bg-white border border-gray-200 rounded-lg shadow-sm p-6 sm:p-8">
                        <header>
                            <h2 className="text-lg font-medium text-gray-900">Ubah Password</h2>
                            <p className="mt-1 text-sm text-gray-600">Pastikan akun Anda menggunakan kata sandi yang panjang dan acak agar tetap aman.</p>
                        </header>
                        <form onSubmit={submitPassword} className="mt-6 space-y-6">
                            <div>
                                <InputLabel htmlFor="current_password" value="Password Saat Ini" />
                                <TextInput id="current_password" type="password" value={passwordData.current_password} onChange={(e) => setPasswordData('current_password', e.target.value)} className="mt-1 block w-full" />
                                <InputError message={passwordErrors.current_password} className="mt-2" />
                            </div>
                            <div>
                                <InputLabel htmlFor="password" value="Password Baru" />
                                <TextInput id="password" type="password" value={passwordData.password} onChange={(e) => setPasswordData('password', e.target.value)} className="mt-1 block w-full" />
                                <InputError message={passwordErrors.password} className="mt-2" />
                            </div>
                            <div>
                                <InputLabel htmlFor="password_confirmation" value="Konfirmasi Password Baru" />
                                <TextInput id="password_confirmation" type="password" value={passwordData.password_confirmation} onChange={(e) => setPasswordData('password_confirmation', e.target.value)} className="mt-1 block w-full" />
                                <InputError message={passwordErrors.password_confirmation} className="mt-2" />
                            </div>
                            <div className="flex items-center gap-4">
                                <PrimaryButton disabled={passwordProcessing}>Ubah Password</PrimaryButton>
                                {/* 4. Hapus notifikasi teks yang lama */}
                                {/* {recentlySuccessful && status === 'password-updated' && <p>Tersimpan.</p>} */}
                            </div>
                        </form>
                    </div>

                    {/* Kartu Hapus Akun */}
                    <div className="bg-white border border-gray-200 rounded-lg shadow-sm p-6 sm:p-8">
                        <header>
                            <h2 className="text-lg font-medium text-gray-900">Hapus Akun</h2>
                            <p className="mt-1 text-sm text-gray-600">Setelah akun Anda dihapus, semua sumber daya dan datanya akan dihapus secara permanen.</p>
                        </header>
                        <DangerButton onClick={confirmUserDeletion} className="mt-6">Hapus Akun</DangerButton>
                        <Modal show={confirmingUserDeletion} onClose={closeModal}>
                            <form onSubmit={submitDeleteUser} className="p-6">
                                <h2 className="text-lg font-medium text-gray-900">Apakah Anda yakin ingin menghapus akun Anda?</h2>
                                <p className="mt-1 text-sm text-gray-600">
                                    Silakan masukkan kata sandi Anda untuk mengonfirmasi bahwa Anda ingin menghapus akun Anda secara permanen.
                                </p>
                                <div className="mt-6">
                                    <InputLabel htmlFor="password_delete" value="Password" className="sr-only" />
                                    <TextInput id="password_delete" type="password" name="password" value={deleteData.password} onChange={(e) => setDeleteData('password', e.target.value)} className="mt-1 block w-3/a" placeholder="Password" />
                                    <InputError message={deleteErrors.password} className="mt-2" />
                                </div>
                                <div className="mt-6 flex justify-end">
                                    <SecondaryButton onClick={closeModal}>Batal</SecondaryButton>
                                    <DangerButton className="ms-3" disabled={deleteProcessing}>Hapus Akun</DangerButton>
                                </div>
                            </form>
                        </Modal>
                    </div>
                </div>
            </div>
            <FooterNote />
        </>
    );
}
