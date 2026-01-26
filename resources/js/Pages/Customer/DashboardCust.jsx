import { Swiper, SwiperSlide } from 'swiper/react';
import { Autoplay, Pagination, Navigation, EffectFade } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/pagination';
import 'swiper/css/navigation';
import 'swiper/css/effect-fade';
import { Link, Head, router, usePage } from '@inertiajs/react';
import { FiShoppingCart, FiMapPin, FiCalendar, FiZap, FiArrowRight, FiHeart, FiSearch, FiInstagram } from 'react-icons/fi';
import { BsStarFill, BsStarHalf } from 'react-icons/bs';
import Swal from 'sweetalert2';
import CustomerLayout from '@/Layouts/CustomerLayout';
import { useState, useEffect } from 'react';

// ===================================================================
// === MODERN NATURE THEME DASHBOARD ===
// ===================================================================

/**
 * 1. Immersive Hero Slider
 * Uses the user's gallery photos for a stunning first impression.
 */
function ImmersiveHero() {
    return (
        <section className="relative group h-[500px] sm:h-[600px] lg:h-[700px] overflow-hidden">
            <Swiper
                modules={[Autoplay, Pagination, Navigation, EffectFade]}
                effect={'fade'}
                autoplay={{ delay: 5000, disableOnInteraction: false }}
                pagination={{
                    clickable: true,
                    dynamicBullets: true,
                    renderBullet: function (index, className) {
                        return '<span class="' + className + ' !bg-white !w-3 !h-3 !opacity-100 ring-2 ring-green-500/50"></span>';
                    }
                }}
                navigation={{
                    nextEl: '.swiper-button-next-custom',
                    prevEl: '.swiper-button-prev-custom',
                }}
                loop={true}
                className="w-full h-full"
            >
                {/* Slide 1: General Greenhouse View */}
                <SwiperSlide>
                    <div className="relative w-full h-full">
                        <img src="/storage/dashboard/20251029_055603.jpg" className="w-full h-full object-cover" alt="Greenhouse" />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent"></div>
                        <div className="absolute inset-0 flex flex-col justify-end pb-20 sm:pb-32 px-6 sm:px-12 lg:px-24">
                            <span className="inline-block px-4 py-1.5 bg-green-500 text-white font-bold rounded-full text-sm w-max mb-4 shadow-lg animate-fade-in-up">
                                🌿 Wisata Edukasi & Belanja
                            </span>
                            <h1 className="text-4xl sm:text-6xl font-extrabold text-white mb-4 drop-shadow-lg leading-tight animate-fade-in-up delay-100">
                                Segarnya Alam <br /> <span className="text-green-400">Di Tengah Kota</span>
                            </h1>
                            <p className="text-gray-200 text-lg sm:text-xl max-w-2xl mb-8 animate-fade-in-up delay-200">
                                Nikmati pengalaman memetik sayur hidroponik langsung dari kebun kami atau pesan online sekarang.
                            </p>
                            <div className="flex flex-wrap gap-4 animate-fade-in-up delay-300">
                                <Link href="/customer/kunjungan" className="bg-white text-green-800 font-bold px-8 py-3.5 rounded-full hover:bg-green-50 active:scale-95 transition shadow-xl flex items-center gap-2">
                                    <FiCalendar /> Jadwalkan Kunjungan
                                </Link>
                                <Link href="/customer/belanja" className="bg-green-600/90 backdrop-blur-md text-white font-bold px-8 py-3.5 rounded-full hover:bg-green-600 active:scale-95 transition shadow-xl flex items-center gap-2 border border-white/20">
                                    <FiShoppingCart /> Belanja Sayur
                                </Link>
                            </div>
                        </div>
                    </div>
                </SwiperSlide>

                {/* Slide 2: Vegetable Close-up */}
                <SwiperSlide>
                    <div className="relative w-full h-full">
                        <img src="/storage/dashboard/20250926_081253.jpg" className="w-full h-full object-cover" alt="Fresh Veggies" />
                        <div className="absolute inset-0 bg-black/40"></div>
                        <div className="absolute inset-0 flex flex-col justify-center items-center text-center px-6">
                            <h2 className="text-4xl sm:text-6xl font-bold text-white mb-6 drop-shadow-xl">
                                100% Bebas Pestisida
                            </h2>
                            <p className="text-xl text-white/90 max-w-3xl mb-10 font-light">
                                Kami menjamin sayuran yang Anda terima adalah yang paling segar, sehat, dan terbaik untuk keluarga Anda.
                            </p>
                            <Link href="/customer/belanja" className="bg-green-500 hover:bg-green-600 text-white text-lg font-bold px-10 py-4 rounded-full shadow-2xl hover:shadow-green-500/50 transition transform hover:-translate-y-1">
                                Lihat Produk Kami
                            </Link>
                        </div>
                    </div>
                </SwiperSlide>

                {/* Slide 3: Activities */}
                <SwiperSlide>
                    <div className="relative w-full h-full">
                        {/* Fallback image if 20 doesn't exist, using 12 */}
                        <img src="/storage/galeri/foto-palantea-10.jpeg" className="w-full h-full object-cover" alt="Activities" />
                        <div className="absolute inset-0 bg-gradient-to-r from-black/70 to-transparent"></div>
                        <div className="absolute inset-0 flex flex-col justify-center px-6 sm:px-16 lg:px-32">
                            <h2 className="text-3xl sm:text-5xl font-bold text-white mb-6 leading-tight">
                                Belajar Hidroponik <br /> Menyenangkan
                            </h2>
                            <p className="text-lg text-gray-200 max-w-xl mb-8">
                                Program outing class dan pelatihan untuk sekolah, komunitas, dan umum.
                            </p>
                            <Link href="/customer/kunjungan" className="text-white border-2 border-white px-8 py-3 rounded-full hover:bg-white hover:text-green-800 font-bold transition w-max">
                                Info Selengkapnya
                            </Link>
                        </div>
                    </div>
                </SwiperSlide>
            </Swiper>

            {/* Custom Navigation Buttons */}
            <button className="swiper-button-prev-custom absolute left-4 top-1/2 -translate-y-1/2 z-10 w-12 h-12 bg-white/10 backdrop-blur hover:bg-white text-white hover:text-green-800 rounded-full flex items-center justify-center transition opacity-0 group-hover:opacity-100">
                <FiArrowRight className="rotate-180 text-xl" />
            </button>
            <button className="swiper-button-next-custom absolute right-4 top-1/2 -translate-y-1/2 z-10 w-12 h-12 bg-white/10 backdrop-blur hover:bg-white text-white hover:text-green-800 rounded-full flex items-center justify-center transition opacity-0 group-hover:opacity-100">
                <FiArrowRight className="text-xl" />
            </button>
        </section>
    );
}

/**
 * 2. Elegant Category Pills
 */
function CategoryPills() {
    const categories = [
        { name: 'Semua', icon: '✨', link: '/customer/belanja' },
        { name: 'Sayuran Daun', icon: '🥬', link: '/customer/belanja?cat=sayur' },
        { name: 'Buah Segar', icon: '🍉', link: '/customer/belanja?cat=buah' },
        { name: 'Outing Class', icon: '🎒', link: '/customer/kunjungan' },
        { name: 'Kunjungan', icon: '🚌', link: '/customer/kunjungan' },
        { name: 'Tentang Kami', icon: '🏡', link: '/tentang-kami' },
    ];

    return (
        <section className="-mt-10 relative z-20 px-4 mb-16">
            <div className="max-w-7xl mx-auto">
                <div className="bg-white rounded-2xl shadow-xl p-4 sm:p-6 flex flex-wrap justify-between gap-4 items-center border border-gray-100">
                    {categories.map((cat, idx) => (
                        <Link
                            key={idx}
                            href={cat.link}
                            className="flex flex-col sm:flex-row items-center gap-3 group px-4 py-2 rounded-xl hover:bg-green-50 transition flex-1 min-w-[100px] justify-center"
                        >
                            <div className="w-10 h-10 sm:w-12 sm:h-12 bg-green-100 rounded-full flex items-center justify-center text-xl sm:text-2xl group-hover:bg-green-500 group-hover:text-white transition-colors duration-300">
                                {cat.icon}
                            </div>
                            <span className="font-semibold text-gray-700 text-sm sm:text-base group-hover:text-green-700 whitespace-nowrap">
                                {cat.name}
                            </span>
                        </Link>
                    ))}
                </div>
            </div>
        </section>
    );
}

/**
 * 3. Featured Promo / Flash Sale (Card Style)
 */
function FeaturedPromos({ flashSaleProducts }) {
    if (!flashSaleProducts || flashSaleProducts.length === 0) return null;

    return (
        <section className="max-w-7xl mx-auto px-4 mb-20">
            <div className="flex items-end justify-between mb-8">
                <div>
                    <h2 className="text-3xl font-extrabold text-gray-900">
                        Penawaran <span className="text-green-600">Spesial</span>
                    </h2>
                    <p className="text-gray-500 mt-2">Dapatkan harga terbaik untuk produk pilihan hari ini.</p>
                </div>
                <Link href="/customer/belanja" className="hidden sm:flex items-center text-green-600 font-bold hover:text-green-800">
                    Lihat Semua <FiArrowRight className="ml-2" />
                </Link>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Big Promo Banner */}
                <div className="relative h-[300px] md:h-auto rounded-3xl overflow-hidden group shadow-lg">
                    <img src="/storage/galeri/foto-palantea-20.jpeg" className="w-full h-full object-cover transition duration-700 group-hover:scale-110" alt="Promo" />
                    <div className="absolute inset-0 bg-black/40 group-hover:bg-black/30 transition"></div>
                    <div className="absolute bottom-0 left-0 p-8 text-white">
                        <span className="bg-orange-500 text-white text-xs font-bold px-3 py-1 rounded-full mb-3 inline-block">TERBATAS</span>
                        <h3 className="text-2xl sm:text-3xl font-bold mb-2">Paket Panen Sendiri</h3>
                        <p className="mb-6 opacity-90 text-sm sm:text-base">Rasakan sensasi memetik sayur langsung dari instalasi hidroponik kami.</p>
                        <Link href="/customer/kunjungan" className="bg-white text-green-800 px-6 py-2.5 rounded-full font-bold text-sm hover:bg-green-50 transition shadow-lg">
                            Reservasi Sekarang
                        </Link>
                    </div>
                </div>

                {/* Flash Sale Grid */}
                <div className="bg-orange-50 rounded-3xl p-6 sm:p-8 border border-orange-100">
                    <div className="flex items-center justify-between mb-6">
                        <div className="flex items-center gap-2 text-orange-600 font-bold text-xl">
                            <FiZap className="fill-current" /> FLASH SALE
                        </div>
                        <div className="text-xs font-bold bg-orange-200 text-orange-800 px-2 py-1 rounded">Berakhir dalam 02:59:00</div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        {flashSaleProducts.slice(0, 4).map((product) => (
                            <Link key={product.id} href={`/customer/belanja/${product.id}`} className="bg-white p-3 rounded-2xl shadow-sm hover:shadow-md transition group">
                                <div className="relative aspect-square rounded-xl overflow-hidden mb-3 bg-gray-100">
                                    <img src={`/storage/${product.gambar}`} alt={product.nama} className="w-full h-full object-cover group-hover:scale-105 transition" />
                                    <div className="absolute top-2 left-2 bg-red-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full">
                                        -{product.discount_percentage || 20}%
                                    </div>
                                </div>
                                <h4 className="font-bold text-gray-800 text-sm truncate">{product.nama}</h4>
                                <div className="flex items-center gap-2 mt-1">
                                    <span className="text-green-600 font-bold text-sm">
                                        {new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(product.harga)}
                                    </span>
                                    <span className="text-[10px] text-gray-400 line-through">
                                        {new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(product.original_price)}
                                    </span>
                                </div>
                            </Link>
                        ))}
                    </div>
                </div>
            </div>
        </section>
    );
}

/**
 * 4. Elegant Product Feed
 */
function DailyFreshFeed({ products }) {
    const { auth } = usePage().props;

    const handleAddToCart = (e, product) => {
        e.preventDefault();
        e.stopPropagation();

        if (!auth?.pelanggan) {
            return Swal.fire({ icon: 'warning', title: 'Login Diperlukan', text: 'Silakan login untuk belanja.', showConfirmButton: false, timer: 1500 });
        }

        router.post('/customer/cart', { product_id: product.id }, {
            preserveScroll: true,
            onSuccess: () => Swal.fire({ toast: true, position: 'bottom-end', icon: 'success', title: 'Ditambahkan ke keranjang', showConfirmButton: false, timer: 1500 })
        });
    };

    return (
        <section className="bg-gray-50 py-20 px-4">
            <div className="max-w-7xl mx-auto">
                <div className="text-center mb-12">
                    <h2 className="text-3xl sm:text-4xl font-extrabold text-gray-900 mb-4">
                        Pilihan <span className="text-green-600">Segar Hari Ini</span>
                    </h2>
                    <p className="text-gray-600 max-w-2xl mx-auto">
                        Kami memanen setiap hari untuk memastikan Anda mendapatkan nutrisi terbaik dari alam.
                    </p>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
                    {products?.map((product) => (
                        <div key={product.id} className="group bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col">
                            {/* Image */}
                            <Link href={`/customer/belanja/${product.id}`} className="relative aspect-[4/5] bg-gray-100 overflow-hidden">
                                <img src={`/storage/${product.gambar}`} alt={product.nama} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                                {product.stok <= 0 && (
                                    <div className="absolute inset-0 bg-black/60 flex items-center justify-center text-white font-bold tracking-widest uppercase">
                                        Habis
                                    </div>
                                )}
                                {/* Floating Cart Button */}
                                <button
                                    onClick={(e) => handleAddToCart(e, product)}
                                    disabled={product.stok <= 0}
                                    className="absolute bottom-4 right-4 bg-white text-green-700 p-3 rounded-full shadow-lg translate-y-12 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-300 hover:bg-green-600 hover:text-white disabled:invisible"
                                >
                                    <FiShoppingCart size={20} />
                                </button>
                            </Link>

                            {/* Info */}
                            <div className="p-5 flex flex-col flex-1">
                                <div className="text-xs text-gray-500 mb-1">{product.kategori?.nama}</div>
                                <h3 className="font-bold text-gray-900 mb-2 truncate group-hover:text-green-600 transition">
                                    <Link href={`/customer/belanja/${product.id}`}>{product.nama}</Link>
                                </h3>
                                <div className="mt-auto flex items-center justify-between">
                                    <span className="text-lg font-bold text-green-700">
                                        {new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(product.harga)}
                                    </span>
                                    <div className="flex items-center text-xs text-orange-400">
                                        <BsStarFill /> <span className="text-gray-500 ml-1">4.9</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                <div className="mt-16 text-center">
                    <Link href="/customer/belanja" className="inline-flex items-center gap-2 border-2 border-green-600 text-green-600 font-bold px-8 py-3 rounded-full hover:bg-green-600 hover:text-white transition duration-300">
                        Lihat Semua Produk <FiArrowRight />
                    </Link>
                </div>
            </div>
        </section>
    );
}

/**
 * 5. Visit Invitation (Parallax Style)
 */
function VisitSection() {
    return (
        <section className="relative py-24 md:py-32 flex items-center justify-center bg-fixed bg-cover bg-center" style={{ backgroundImage: "url('/storage/galeri/foto-palantea-17.jpeg')" }}>
            <div className="absolute inset-0 bg-black/60"></div>
            <div className="relative z-10 text-center px-4 max-w-4xl mx-auto text-white">
                <h2 className="text-4xl md:text-5xl font-extrabold mb-6">Ingin Belajar Hidroponik?</h2>
                <p className="text-lg md:text-xl text-gray-200 mb-10 leading-relaxed">
                    Kami membuka pintu untuk siapa saja yang ingin belajar. Mulai dari anak sekolah hingga calon pengusaha tani.
                    Dapatkan ilmu langsung dari para ahli di kebun kami.
                </p>
                <Link href="/customer/kunjungan" className="bg-white text-green-900 font-bold px-10 py-4 rounded-full text-lg shadow-2xl hover:bg-green-50 transition transform hover:scale-105 inline-block">
                    Daftar Kunjungan Sekarang
                </Link>
            </div>
        </section>
    );
}


// ===================================================================
// === MAIN COMPONENT ===
// ===================================================================

export default function CustomerDashboard({
    bestSellerProducts,
    latestProducts,
    flashSaleProducts,
    testimonials
}) {
    // Merge products for the main feed for variety
    const feedProducts = [...(bestSellerProducts || []), ...(latestProducts || [])].slice(0, 10);

    return (
        <CustomerLayout>
            <Head title="Beranda" />
            <main className="bg-white w-full overflow-x-hidden font-sans">
                <ImmersiveHero />
                <CategoryPills />
                <FeaturedPromos flashSaleProducts={flashSaleProducts} />
                <DailyFreshFeed products={feedProducts} />
                <VisitSection />

                {/* Footer Note / Insta Feed Placeholder */}
                <div className="bg-green-900 text-white/70 py-6 text-center text-sm">
                    <div className="flex items-center justify-center gap-2 mb-2">
                        <FiInstagram /> @central_palantea_hidroponik
                    </div>
                    <p>Ikuti kami untuk update panen harian!</p>
                </div>
            </main>
        </CustomerLayout>
    );
}
