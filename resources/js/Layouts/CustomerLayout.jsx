import { Link, router, usePage } from '@inertiajs/react';
import { FiShoppingCart, FiUser, FiLogIn, FiMenu, FiX, FiSearch } from 'react-icons/fi';
import React, { useState, useRef, useEffect, useCallback } from 'react';
import CartPanel from '@/Components/CartPanel'; // <-- Impor CartPanel
import { debounce } from 'lodash';
import Swal from 'sweetalert2';

// Komponen Header
export function SiteHeader({ auth, onCartClick }) {
    // Gunakan auth.user jika auth.pelanggan null (misal login sebagai admin)
    const user = auth?.pelanggan || auth?.user;
    const { cart } = usePage().props;
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [isProfileOpen, setIsProfileOpen] = useState(false);
    const profileDropdownRef = useRef(null);
    const [searchQuery, setSearchQuery] = useState('');

    const handleLinkClick = () => { setIsMenuOpen(false); };

    // Debounced search function - real-time as user types
    const debouncedSearch = useCallback(
        debounce((query) => {
            router.get('/customer/belanja', { search: query || undefined }, { preserveState: true, replace: true });
        }, 400),
        []
    );

    const handleSearchChange = (e) => {
        const value = e.target.value;
        setSearchQuery(value);
        debouncedSearch(value);
    };

    const handleSearch = (e) => {
        e.preventDefault();
        // Optional: immediate search on Enter
        router.get('/customer/belanja', { search: searchQuery || undefined }, { preserveState: true, replace: true });
    };

    const handleProtectedAction = (action) => {
        if (!user) {
            Swal.fire({
                title: 'Akses Terbatas',
                text: "Silakan login terlebih dahulu untuk mengakses fitur ini.",
                icon: 'warning',
                showCancelButton: true,
                confirmButtonColor: '#16a34a',
                cancelButtonColor: '#d33',
                confirmButtonText: 'Login Sekarang',
                cancelButtonText: 'Batal'
            }).then((result) => {
                if (result.isConfirmed) {
                    router.visit('/login');
                }
            });
        } else {
            action();
        }
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
            <div className="mx-auto max-w-7xl px-4 sm:px-6">
                <div className="h-16 flex items-center justify-between">
                    <div className="flex items-center gap-2 min-w-0">
                        <Link href="/"><img src="/storage/logo/central_palantea.png" alt="Logo" className="h-14 w-auto flex-shrink-0" /></Link>
                        <Link href="/" className="min-w-0">
                            <span className="hidden sm:block text-xl font-extrabold text-green-800">Central Palantea Hidroponik</span>
                            <span className="sm:hidden text-sm font-extrabold text-green-800 leading-tight block">Central Palantea<br />Hidroponik</span>
                        </Link>
                    </div>
                    <nav className="hidden md:flex items-center gap-8 text-sm text-gray-700">
                        <Link href="/" className={`font-semibold ${currentPath === '/' ? 'text-green-700' : 'hover:text-green-700'}`}>Beranda</Link>
                        <Link href="/customer/belanja" className={`font-semibold ${currentPath.startsWith('/customer/belanja') ? 'text-green-700' : 'hover:text-green-700'}`}>Belanja</Link>
                        <Link href="/customer/kunjungan" className={`font-semibold ${currentPath.startsWith('/customer/kunjungan') ? 'text-green-700' : 'hover:text-green-700'}`}>Kunjungan</Link>
                        <Link href="/tentang-kami" className={`font-semibold ${currentPath.startsWith('/tentang-kami') ? 'text-green-700' : 'hover:text-green-700'}`}>Tentang Kami</Link>
                    </nav>
                    <div className="flex items-center gap-3">
                        <form onSubmit={handleSearch}>
                            <input type="search" placeholder="Cari produk..." value={searchQuery} onChange={handleSearchChange} className="hidden sm:block h-9 w-40 md:w-56 rounded-md border border-green-200 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-green-500" />
                        </form>

                        {/* Hide Cart for Admin */
                            (user?.role !== 'admin') && (
                                <button
                                    onClick={() => handleProtectedAction(onCartClick)}
                                    className="relative h-9 w-9 rounded-full flex items-center justify-center bg-green-50 text-green-800 hover:bg-green-100 transition-colors"
                                    title="Keranjang"
                                >
                                    <FiShoppingCart />
                                    {(!user || user.role === 'customer') && cart.count > 0 && (
                                        <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold w-5 h-5 rounded-full flex items-center justify-center">
                                            {cart.count}
                                        </span>
                                    )}
                                </button>
                            )}

                        {/* Profile / Login Button */}
                        <div className="relative" ref={profileDropdownRef}>
                            {user ? (
                                <>
                                    <button
                                        onClick={() => setIsProfileOpen(!isProfileOpen)}
                                        className="h-9 w-9 rounded-full flex items-center justify-center bg-green-50 text-green-800 hover:bg-green-100 transition-colors"
                                        title={user.role === 'admin' ? "Akun Admin" : "Akun Saya"}
                                    >
                                        <FiUser />
                                        {/* Indikator Admin */}
                                        {user.role === 'admin' && (
                                            <span className="absolute -bottom-1 -right-1 bg-red-500 text-white text-[9px] px-1 rounded-full">A</span>
                                        )}
                                    </button>

                                    <div className={`absolute top-full right-0 mt-2 w-56 bg-white border rounded-lg shadow-lg transition-opacity duration-200 z-50 ${isProfileOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}`}>
                                        <div className="px-4 py-3 border-b">
                                            <p className="text-sm font-semibold truncate">{user.nama || user.name}</p>
                                            <p className="text-xs text-gray-500 truncate">{user.email}</p>
                                            {user.role === 'admin' && (
                                                <span className="block mt-1 text-xs font-bold text-red-600 bg-red-50 w-fit px-2 py-0.5 rounded">Administrator</span>
                                            )}
                                        </div>
                                        <div className="p-1">
                                            {user.role === 'admin' ? (
                                                <Link href="/admin" className="block w-full text-left px-3 py-2 text-sm font-semibold text-green-700 rounded-md hover:bg-green-50">
                                                    Dashboard Admin
                                                </Link>
                                            ) : (
                                                <>
                                                    <Link href="/customer/profile" className="block w-full text-left px-3 py-2 text-sm rounded-md hover:bg-gray-50">Profil Saya</Link>
                                                    <Link href="/customer/pesanan" className="block w-full text-left px-3 py-2 text-sm rounded-md hover:bg-gray-50">Riwayat Pesanan</Link>
                                                </>
                                            )}
                                            <Link href="/logout" method="post" as="button" className="block w-full text-left px-3 py-2 text-sm text-red-600 rounded-md hover:bg-red-50">Logout</Link>
                                        </div>
                                    </div>
                                </>
                            ) : (
                                <a
                                    href="/login"
                                    className="hidden sm:flex items-center gap-2 h-9 px-4 rounded-full bg-green-600 text-white text-sm font-medium hover:bg-green-700 transition-colors"
                                >
                                    <FiLogIn /> Login
                                </a>
                            )}
                        </div>
                        <button className="md:hidden h-9 w-9 flex items-center justify-center" onClick={() => setIsMenuOpen(!isMenuOpen)}>{isMenuOpen ? <FiX size={24} /> : <FiMenu size={24} />}</button>
                    </div>
                </div>
                {isMenuOpen && (
                    <nav className="md:hidden pb-4 space-y-2 border-t mt-1 pt-3">
                        <form onSubmit={handleSearch} className="px-4">
                            <div className="relative">
                                <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                                <input type="search" placeholder="Cari produk..." value={searchQuery} onChange={handleSearchChange} className="w-full h-10 rounded-md border border-gray-300 pl-10 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-green-500" />
                            </div>
                        </form>
                        <Link href="/" onClick={handleLinkClick} className={`block px-4 py-2 rounded-md ${currentPath === '/' ? 'font-semibold bg-green-50 text-green-700' : 'hover:bg-gray-50'}`}>Beranda</Link>
                        <Link href="/customer/belanja" onClick={handleLinkClick} className={`block px-4 py-2 rounded-md ${currentPath.startsWith('/customer/belanja') ? 'font-semibold bg-green-50 text-green-700' : 'hover:bg-gray-50'}`}>Belanja</Link>
                        <Link href="/customer/kunjungan" onClick={handleLinkClick} className={`block px-4 py-2 rounded-md ${currentPath.startsWith('/customer/kunjungan') ? 'font-semibold bg-green-50 text-green-700' : 'hover:bg-gray-50'}`}>Kunjungan</Link>
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
                        <li><Link href="/tentang-kami" className="text-gray-600 hover:text-green-600">Tentang Kami</Link></li>
                    </ul>
                </div>
                <div>
                    <h3 className="font-semibold text-gray-800 mb-4">Kontak</h3>
                    <ul className="space-y-3 text-sm">
                        <li className="flex items-center gap-2 text-gray-600">Duri, Riau</li>
                        <li className="flex items-center gap-2 text-gray-600">+62 852-1571-8965</li>
                        <li className="flex items-center gap-2 text-gray-600">centralpalantea@gmail.com</li>
                    </ul>
                </div>
            </div>
            <div className="bg-gray-100 text-center py-4">
                <p className="text-xs text-gray-500">&copy; {new Date().getFullYear()} Central Palantea Hidroponik.</p>
            </div>
        </footer>
    );
}

// Swal sudah diimport di atas

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