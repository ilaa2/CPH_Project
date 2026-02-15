import InputError from '@/Components/InputError';
import InputLabel from '@/Components/InputLabel';
import PrimaryButton from '@/Components/PrimaryButton';
import TextInput from '@/Components/TextInput';
import GuestLayout from '@/Layouts/GuestLayout';
import { Head, useForm } from '@inertiajs/react';
import { useMemo } from 'react';

function PasswordCriteria({ met, label }) {
    return (
        <li className={`flex items-center gap-1.5 text-xs ${met ? 'text-green-600' : 'text-red-500'}`}>
            {met ? (
                <svg className="w-3.5 h-3.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
            ) : (
                <svg className="w-3.5 h-3.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
            )}
            <span>{label}</span>
        </li>
    );
}

export default function ResetPassword({ token, email }) {
    const { data, setData, post, processing, errors, reset } = useForm({
        token: token,
        email: email,
        password: '',
        password_confirmation: '',
    });

    const passwordChecks = useMemo(() => ({
        minLength: data.password.length >= 8,
        hasUppercase: /[A-Z]/.test(data.password),
        hasLowercase: /[a-z]/.test(data.password),
        hasNumber: /[0-9]/.test(data.password),
        hasSymbol: /[^A-Za-z0-9]/.test(data.password),
    }), [data.password]);

    const submit = (e) => {
        e.preventDefault();

        post(route('password.store'), {
            onFinish: () => reset('password', 'password_confirmation'),
        });
    };

    return (
        <GuestLayout>
            <Head title="Reset Password" />

            <div className="w-full max-w-md mx-auto bg-white border shadow-md rounded-lg p-6 mt-10">
                <div className="text-center mb-6">
                    <img src="/storage/logo/logoo.png" alt="Logo" className="w-14 mx-auto" />
                    <h1 className="text-2xl font-bold text-green-700 mt-2">Reset Password</h1>
                    <p className="text-sm text-gray-500 mt-1">Masukkan password baru Anda</p>
                </div>

                <form onSubmit={submit} className="space-y-4">
                    <div>
                        <InputLabel htmlFor="email" value="Email" className="text-gray-700" />
                        <TextInput
                            id="email"
                            type="email"
                            name="email"
                            value={data.email}
                            className="mt-1 block w-full border-gray-300 focus:border-green-500 focus:ring-green-500 rounded-md shadow-sm bg-gray-100"
                            autoComplete="username"
                            readOnly
                        />
                        <InputError message={errors.email} className="mt-2" />
                    </div>

                    <div>
                        <InputLabel htmlFor="password" value="Password Baru" className="text-gray-700" />
                        <TextInput
                            id="password"
                            type="password"
                            name="password"
                            value={data.password}
                            className="mt-1 block w-full border-gray-300 focus:border-green-500 focus:ring-green-500 rounded-md shadow-sm"
                            autoComplete="new-password"
                            isFocused={true}
                            onChange={(e) => setData('password', e.target.value)}
                            required
                        />
                        {data.password.length > 0 && (
                            <ul className="mt-2 space-y-1 bg-gray-50 rounded-md p-2.5 border border-gray-200">
                                <PasswordCriteria met={passwordChecks.minLength} label="Minimal 8 karakter" />
                                <PasswordCriteria met={passwordChecks.hasUppercase} label="Mengandung huruf kapital (A-Z)" />
                                <PasswordCriteria met={passwordChecks.hasLowercase} label="Mengandung huruf kecil (a-z)" />
                                <PasswordCriteria met={passwordChecks.hasNumber} label="Mengandung angka (0-9)" />
                                <PasswordCriteria met={passwordChecks.hasSymbol} label="Mengandung simbol (@, #, !, dll)" />
                            </ul>
                        )}
                        <InputError message={errors.password} className="mt-2" />
                    </div>

                    <div>
                        <InputLabel htmlFor="password_confirmation" value="Konfirmasi Password Baru" className="text-gray-700" />
                        <TextInput
                            type="password"
                            id="password_confirmation"
                            name="password_confirmation"
                            value={data.password_confirmation}
                            className="mt-1 block w-full border-gray-300 focus:border-green-500 focus:ring-green-500 rounded-md shadow-sm"
                            autoComplete="new-password"
                            onChange={(e) => setData('password_confirmation', e.target.value)}
                            required
                        />
                        <InputError message={errors.password_confirmation} className="mt-2" />
                    </div>

                    <div className="flex justify-center">
                        <PrimaryButton
                            className="bg-green-600 hover:bg-green-700 focus:ring-green-500 px-6"
                            disabled={processing}
                        >
                            Reset Password
                        </PrimaryButton>
                    </div>
                </form>
            </div>
        </GuestLayout>
    );
}
