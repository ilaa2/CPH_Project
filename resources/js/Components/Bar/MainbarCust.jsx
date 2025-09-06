// resources/js/Components/Bar/MainbarCust.jsx

import { Head, Link, usePage, router } from '@inertiajs/react';
import { FiShoppingCart, FiUser, FiLogIn, FiMenu, FiX } from 'react-icons/fi';
import React, { useState, useRef, useEffect } from 'react';

// === KOMPONEN HEADER ===
function SiteHeader({ auth }) {
    const user = auth?.user;
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [isProfileOpen, setIsProfileOpen] = useState(false);
    const profileDropdownRef = useRef(null);
    const [searchQuery, setSearchQuery] = useState('');

    const handleLinkClick = () => {
        setIsMenuOpen(false);
    };

    const handleSearch = (e) => {
        e.preventDefault();
        router.get(route('belanja.index'), { search: searchQuery }, {
            preserveState: true,
            replace: true,
        });
    };

    useEffect(() => {
        function handleClickOutside(event) {
            if (profileDropdownRef.current && !profileDropdownRef.current.contains(event.target)) {
                setIsProfileOpen(false);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, [profileDropdownRef]);

    return (
        <header className="sticky top-0 z-50 bg-white/90 backdrop-blur border-b border-green-100">
            <div className="mx-auto max-w-7xl px-4 sm:px-6">
                <div className="h-16 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <Link href={route('home')}>
                            <img src="/storage/logo/central_palantea.png" alt="Logo" className="h-14 w-auto flex-shrink-0" />
                        </Link>
                        <Link href={route('home')}>
                            <span className="hidden sm:block text-xl font-extrabold text-green-800">Central Palantea Hidroponik</span>
                        </Link>
                    </div>
                    <nav className="hidden md:flex items-center gap-8 text-sm text-gray-700">
                        <Link href={route('home')} className={`font-semibold ${route().current('home') ? 'text-green-700' : 'hover:text-green-700'}`}>Beranda</Link>
                        <Link href={route('belanja.index')} className={`font-semibold ${route().current('belanja.index') ? 'text-green-700' : 'hover:text-green-700'}`}>Belanja</Link>
                        <Link href={route('kunjungan.index')} className={`font-semibold ${route().current('kunjungan.index') ? 'text-green-700' : 'hover:text-green-700'}`}>Kunjungan</Link>
                    </nav>
                    <div className="flex items-center gap-3">
                        <form onSubmit={handleSearch}>
                            <input
                                type="search"
                                placeholder="Cari produk..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="hidden sm:block h-9 w-40 md:w-56 rounded-md border border-green-200 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
                            />
                        </form>
                        <Link href={user ? '#' : route('login')} className="h-9 w-9 rounded-full flex items-center justify-center bg-green-50 text-green-800 hover:bg-green-100" title="Keranjang">
                            <FiShoppingCart />
                        </Link>
                        <div className="relative" ref={profileDropdownRef}>
                            <button onClick={() => setIsProfileOpen(!isProfileOpen)} className="h-9 w-9 rounded-full flex items-center justify-center bg-green-50 text-green-800 hover:bg-green-100" title="Akun Saya">
                                <FiUser />
                            </button>
                            <div className={`absolute top-full right-0 mt-2 w-56 bg-white border rounded-lg shadow-lg transition-opacity duration-200 ${isProfileOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}`}>
                                {user ? (
                                    <>
                                        <div className="px-4 py-3 border-b">
                                            <p className="text-sm font-semibold truncate">{user.name}</p>
                                            <p className="text-xs text-gray-500 truncate">{user.email}</p>
                                        </div>
                                        <div className="p-1">
                                            <Link href={route('profile.edit')} className="block w-full text-left px-3 py-2 text-sm rounded-md hover:bg-gray-50">Profil Saya</Link>
                                            <Link href={route('logout')} method="post" as="button" className="block w-full text-left px-3 py-2 text-sm text-red-600 rounded-md hover:bg-red-50">Logout</Link>
                                        </div>
                                    </>
                                ) : (
                                    <div className="p-1">
                                        <Link href={route('login')} className="block w-full text-left px-3 py-2 text-sm rounded-md hover:bg-gray-50">Login</Link>
                                        <Link href={route('register')} className="block w-full text-left px-3 py-2 text-sm rounded-md hover:bg-gray-50">Daftar</Link>
                                    </div>
                                )}
                            </div>
                        </div>
                        <button className="md:hidden h-9 w-9 flex items-center justify-center" onClick={() => setIsMenuOpen(!isMenuOpen)}>
                            {isMenuOpen ? <FiX size={24} /> : <FiMenu size={24} />}
                        </button>
                    </div>
                </div>
                {isMenuOpen && (
                    <nav className="md:hidden pb-4 space-y-2 border-t mt-1 pt-3">
                        <Link href={route('home')} onClick={handleLinkClick} className={`block px-4 py-2 rounded-md ${route().current('home') ? 'font-semibold bg-green-50 text-green-700' : 'hover:bg-gray-50'}`}>Beranda</Link>
                        <Link href={route('belanja.index')} onClick={handleLinkClick} className={`block px-4 py-2 rounded-md ${route().current('belanja.index') ? 'font-semibold bg-green-50 text-green-700' : 'hover:bg-gray-50'}`}>Belanja</Link>
                        <Link href={route('kunjungan.index')} onClick={handleLinkClick} className={`block px-4 py-2 rounded-md ${route().current('kunjungan.index') ? 'font-semibold bg-green-50 text-green-700' : 'hover:bg-gray-50'}`}>Kunjungan</Link>
                    </nav>
                )}
            </div>
        </header>
    );
}

// === KOMPONEN FOOTER ===
function FooterNote({ user }) {
    return (
        <footer className="bg-green-50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12 grid grid-cols-1 md:grid-cols-4 gap-8">
                <div className="md:col-span-2">
                    <div className="flex items-center gap-3 mb-4">
                        <img src="/storage/logo/central_palantea.png" alt="Logo" className="h-12 w-auto" />
                        <div>
                            <h2 className="text-lg font-bold text-green-700">Central Palantea</h2>
                            <p className="text-sm text-gray-500">Hidroponik Modern</p>
                        </div>
                    </div>
                    <p className="text-sm text-gray-600 max-w-md">
                        Membangun masa depan pertanian yang berkelanjutan dengan teknologi hidroponik modern.
                    </p>
                </div>
                <div>
                    <h3 className="font-semibold text-gray-800 mb-4">Navigasi</h3>
                    <ul className="space-y-2 text-sm">
                        <li><Link href={route('home')} className="text-gray-600 hover:text-green-600">Beranda</Link></li>
                        <li><Link href={route('belanja.index')} className="text-gray-600 hover:text-green-600">Belanja</Link></li>
                        <li><Link href={route('kunjungan.index')} className="text-gray-600 hover:text-green-600">Kunjungan</Link></li>
                    </ul>
                </div>
                <div>
                    <h3 className="font-semibold text-gray-800 mb-4">Kontak</h3>
                    <ul className="space-y-3 text-sm">
                        <li className="flex items-center gap-2 text-gray-600">Duri, Riau</li>
                        <li className="flex items-center gap-2 text-gray-600">+62 8211 0987 211</li>
                        <li className="flex items-center gap-2 text-gray-600">info@centralpalantea.com</li>
                    </ul>
                </div>
            </div>
            <div className="bg-gray-100 text-center py-4">
                <p className="text-xs text-gray-500">&copy; {new Date().getFullYear()} Central Palantea Hidroponik.</p>
            </div>
        </footer>
    );
}

// === KOMPONEN UTAMA MainbarCust ===
export default function MainbarCust({ auth, children }) {
    return (
        <div className="min-h-screen w-full bg-white text-gray-800">
            <SiteHeader auth={auth} />
            <main>{children}</main>
            <FooterNote user={auth.user} />
        </div>
    );
}
