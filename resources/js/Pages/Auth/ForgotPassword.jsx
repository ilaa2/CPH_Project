import InputError from '@/Components/InputError';
import InputLabel from '@/Components/InputLabel';
import PrimaryButton from '@/Components/PrimaryButton';
import TextInput from '@/Components/TextInput';
import GuestLayout from '@/Layouts/GuestLayout';
import { Head, Link, useForm } from '@inertiajs/react';

export default function ForgotPassword({ status }) {
    const { data, setData, post, processing, errors } = useForm({
        email: '',
    });

    const submit = (e) => {
        e.preventDefault();

        post(route('password.email'));
    };

    return (
        <GuestLayout>
            <Head title="Lupa Password" />

            <div className="w-full max-w-md mx-auto bg-white border shadow-md rounded-lg p-6 mt-10">
                <div className="text-center mb-6">
                    <img src="/storage/logo/logoo.png" alt="Logo" className="w-14 mx-auto" />
                    <h1 className="text-2xl font-bold text-green-700 mt-2">Lupa Password</h1>
                    <p className="text-sm text-gray-500 mt-1">
                        Masukkan email yang terdaftar dan kami akan mengirimkan link untuk mengatur ulang password Anda.
                    </p>
                </div>

                {status && (
                    <div className="mb-4 text-sm font-medium text-green-600 bg-green-50 border border-green-200 rounded-md p-3 text-center">
                        {status}
                    </div>
                )}

                <form onSubmit={submit} className="space-y-4">
                    <div>
                        <InputLabel htmlFor="email" value="Email" className="text-gray-700" />
                        <TextInput
                            id="email"
                            type="email"
                            name="email"
                            value={data.email}
                            className="mt-1 block w-full border-gray-300 focus:border-green-500 focus:ring-green-500 rounded-md shadow-sm"
                            isFocused={true}
                            onChange={(e) => setData('email', e.target.value)}
                            required
                        />
                        <InputError message={errors.email} className="mt-2" />
                    </div>

                    <div className="flex justify-center">
                        <PrimaryButton
                            className="bg-green-600 hover:bg-green-700 focus:ring-green-500 px-6"
                            disabled={processing}
                        >
                            Kirim Link Reset Password
                        </PrimaryButton>
                    </div>

                    <div className="flex justify-center gap-x-1 text-sm text-gray-600">
                        <span>Sudah ingat password?</span>
                        <Link
                            href={route('login')}
                            className="text-green-600 hover:underline font-medium"
                        >
                            Masuk
                        </Link>
                    </div>
                </form>
            </div>
        </GuestLayout>
    );
}
