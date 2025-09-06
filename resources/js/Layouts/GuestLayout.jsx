import ApplicationLogo from '@/Components/ApplicationLogo';
import { Link } from '@inertiajs/react';

export default function Guest({ children }) {
    return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-gray-100">
            <div className="w-full sm:max-w-md px-6 py-8 bg-white shadow-lg rounded-lg">
                {children}
            </div>
        </div>
    );
}
