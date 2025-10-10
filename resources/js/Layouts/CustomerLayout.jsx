import { Link, router, usePage } from '@inertiajs/react';
import { FiShoppingCart, FiUser, FiLogIn, FiMenu, FiX, FiSearch } from 'react-icons/fi';
import React, { useState, useRef, useEffect } from 'react';
import CartPanel from '@/Components/CartPanel'; // <-- Impor CartPanel

// Komponen Header
export function SiteHeader({ auth, onCartClick }) { // <-- Tambahkan onCartClick
    const user = auth?.pelanggan;
    const { cart } = usePage().props;
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [isProfileOpen, setIsProfileOpen] = useState(false);
    const profileDropdownRef = useRef(null);
    const [searchQuery, setSearchQuery] = useState('');

    const handleLinkClick = () => { setIsMenuOpen(false); };

    const handleSearch = (e) => {
        e.preventDefault();
        router.get('/customer/belanja', { search: searchQuery }, { preserveState: true, replace: true });
    };

    useEffect(() => {
        function handleClickOutside(event) {
            if (profileDropdownRef.current && !profileDropdownRef.current.contains(event.target)) {
                setIsProfileOpen(false);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => { document.removeEventListener("mousedown", handleClickOutside); };
    }, [profileDropdownRef]);

    const currentPath = window.location.pathname;

    return (
        <header className="sticky top-0 z-40 bg-white/90 backdrop-blur border-b border-green-100">
            {/* ... (kode header lainnya tetap sama) ... */}
            <div className="mx-auto max-w-7xl px-4 sm:px-6">
                <div className="h-16 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <Link href="/"><img src="/storage/logo/central_palantea.png" alt="Logo" className="h-14 w-auto flex-shrink-0" /></Link>
                        <Link href="/"><span className="hidden sm:block text-xl font-extrabold text-green-800">Central Palantea Hidroponik</span></Link>
                    </div>
                    <nav className="hidden md:flex items-center gap-8 text-sm text-gray-700">
                        <Link href="/" className={`font-semibold ${currentPath === '/' ? 'text-green-700' : 'hover:text-green-700'}`}>Beranda</Link>
                        <Link href="/customer/belanja" className={`font-semibold ${currentPath.startsWith('/customer/belanja') ? 'text-green-700' : 'hover:text-green-700'}`}>Belanja</Link>
                        <Link href="/customer/kunjungan" className={`font-semibold ${currentPath.startsWith('/customer/kunjungan') ? 'text-green-700' : 'hover:text-green-700'}`}>Kunjungan</Link>
                        <Link href="/customer/ulasan" className={`font-semibold ${currentPath.startsWith('/customer/ulasan') ? 'text-green-700' : 'hover:text-green-700'}`}>Ulasan</Link>
                        <Link href="/tentang-kami" className={`font-semibold ${currentPath.startsWith('/tentang-kami') ? 'text-green-700' : 'hover:text-green-700'}`}>Tentang Kami</Link>
                    </nav>
                    <div className="flex items-center gap-3">
                        <form onSubmit={handleSearch}>
                            <input type="search" placeholder="Cari produk..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="hidden sm:block h-9 w-40 md:w-56 rounded-md border border-green-200 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-green-500" />
                        </form>

                        {/* Tombol Keranjang Diubah */}
                        <button onClick={onCartClick} className="relative h-9 w-9 rounded-full flex items-center justify-center bg-green-50 text-green-800 hover:bg-green-100" title="Keranjang">
                            <FiShoppingCart />
                            {user && cart.count > 0 && (
                                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold w-5 h-5 rounded-full flex items-center justify-center">
                                    {cart.count}
                                </span>
                            )}
                        </button>

                        <div className="relative" ref={profileDropdownRef}>
                            <button onClick={() => setIsProfileOpen(!isProfileOpen)} className="h-9 w-9 rounded-full flex items-center justify-center bg-green-50 text-green-800 hover:bg-green-100" title="Akun Saya"><FiUser /></button>
                            <div className={`absolute top-full right-0 mt-2 w-56 bg-white border rounded-lg shadow-lg transition-opacity duration-200 ${isProfileOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}`}>
                                {user ? (<>
                                    <div className="px-4 py-3 border-b">
                                        <p className="text-sm font-semibold truncate">{user.nama}</p>
                                        <p className="text-xs text-gray-500 truncate">{user.email}</p>
                                    </div>
                                <div className="p-1">
                                <Link href="/customer/profile" className="block w-full text-left px-3 py-2 text-sm rounded-md hover:bg-gray-50">Profil Saya</Link>
                                <Link href="/customer/pesanan" className="block w-full text-left px-3 py-2 text-sm rounded-md hover:bg-gray-50">Riwayat Pesanan</Link>
                                <Link href="/logout" method="post" as="button" className="block w-full text-left px-3 py-2 text-sm text-red-600 rounded-md hover:bg-red-50">Logout</Link>
                            </div>
                                </>) : (<div className="p-1">
                                    <Link href="/login" className="block w-full text-left px-3 py-2 text-sm rounded-md hover:bg-gray-50">Login</Link>
                                    <Link href="/register" className="block w-full text-left px-3 py-2 text-sm rounded-md hover:bg-gray-50">Daftar</Link>
                                </div>)}
                            </div>
                        </div>
                        <button className="md:hidden h-9 w-9 flex items-center justify-center" onClick={() => setIsMenuOpen(!isMenuOpen)}>{isMenuOpen ? <FiX size={24} /> : <FiMenu size={24} />}</button>
                    </div>
                </div>
                {isMenuOpen && (
                    <nav className="md:hidden pb-4 space-y-2 border-t mt-1 pt-3">
                        <form onSubmit={handleSearch} className="px-4">
                            <div className="relative">
                                <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                                <input type="search" placeholder="Cari produk..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="w-full h-10 rounded-md border border-gray-300 pl-10 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-green-500" />
                            </div>
                        </form>
                        <Link href="/" onClick={handleLinkClick} className={`block px-4 py-2 rounded-md ${currentPath === '/' ? 'font-semibold bg-green-50 text-green-700' : 'hover:bg-gray-50'}`}>Beranda</Link>
                        <Link href="/customer/belanja" onClick={handleLinkClick} className={`block px-4 py-2 rounded-md ${currentPath.startsWith('/customer/belanja') ? 'font-semibold bg-green-50 text-green-700' : 'hover:bg-gray-50'}`}>Belanja</Link>
                        <Link href="/customer/kunjungan" onClick={handleLinkClick} className={`block px-4 py-2 rounded-md ${currentPath.startsWith('/customer/kunjungan') ? 'font-semibold bg-green-50 text-green-700' : 'hover:bg-gray-50'}`}>Kunjungan</Link>
                        <Link href="/customer/ulasan" onClick={handleLinkClick} className={`block px-4 py-2 rounded-md ${currentPath.startsWith('/customer/ulasan') ? 'font-semibold bg-green-50 text-green-700' : 'hover:bg-gray-50'}`}>Ulasan</Link>
                        <Link href="/tentang-kami" onClick={handleLinkClick} className={`block px-4 py-2 rounded-md ${currentPath.startsWith('/tentang-kami') ? 'font-semibold bg-green-50 text-green-700' : 'hover:bg-gray-50'}`}>Tentang Kami</Link>
                        {!user && (<Link href="/login" className="flex items-center justify-center gap-2 h-10 w-full rounded-md bg-green-500 text-sm font-medium text-white hover:bg-green-600 mt-4"><FiLogIn /> Login</Link>)}
                    </nav>
                )}
            </div>
        </header>
    );
}

// Komponen Footer
export function FooterNote({ user }) {
    // ... (kode footer tetap sama) ...
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
                        Membangun masa depan pertanian yang berkelanjutan dengan teknologi hidroponik modern untuk menghasilkan sayuran berkualitas tinggi.
                    </p>
                </div>
                <div>
                    <h3 className="font-semibold text-gray-800 mb-4">Navigasi</h3>
                    <ul className="space-y-2 text-sm">
                        <li><Link href="/" className="text-gray-600 hover:text-green-600">Beranda</Link></li>
                        <li><Link href="/customer/belanja" className="text-gray-600 hover:text-green-600">Belanja</Link></li>
                        <li><Link href="/customer/kunjungan" className="text-gray-600 hover:text-green-600">Kunjungan</Link></li>
                        <li><Link href="/customer/ulasan" className="text-gray-600 hover:text-green-600">Ulasan</Link></li>
                        <li><Link href="/tentang-kami" className="text-gray-600 hover:text-green-600">Tentang Kami</Link></li>
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

import Swal from 'sweetalert2';

// Layout Utama Pelanggan
export default function CustomerLayout({ children }) {
    const { auth, cart, flash } = usePage().props;
    const [isCartOpen, setIsCartOpen] = useState(false);

    const cartItems = cart?.items ?? [];
    const subtotal = cart?.subtotal ?? 0;

    useEffect(() => {
        if (flash?.success) {
            Swal.fire({
                toast: true,
                position: 'top-end',
                icon: 'success',
                title: flash.success,
                showConfirmButton: false,
                timer: 2500,
            });
        }
        if (flash?.error) {
            Swal.fire({
                toast: true,
                position: 'top-end',
                icon: 'error',
                title: flash.error,
                showConfirmButton: false,
                timer: 3000,
            });
        }
    }, [flash]);

    return (
        <div className="min-h-screen bg-gray-50">
            <CartPanel 
                open={isCartOpen} 
                setOpen={setIsCartOpen}
                cartItems={cartItems}
                subtotal={subtotal}
            />
            <SiteHeader 
                auth={auth} 
                onCartClick={() => setIsCartOpen(true)} 
            />
            <main>{children}</main>
            <FooterNote user={auth.pelanggan} />
        </div>
    );
}