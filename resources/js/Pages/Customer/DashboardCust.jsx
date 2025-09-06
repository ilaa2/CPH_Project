// File: resources/js/Pages/Customer/DashboardCust.jsx

import { Head, Link, router, usePage } from '@inertiajs/react'; // <-- Pastikan 'usePage' di-import
import {
    FiHeart, FiMinus, FiPlus, FiShoppingCart,
    FiArrowRight, FiUsers, FiSun, FiUser, FiLogIn, FiMenu, FiX
} from 'react-icons/fi';
import { BsBookmarkCheckFill, BsFillCartFill } from 'react-icons/bs';
import { useState, useRef, useEffect } from 'react';

// Import Swiper React components
import { Swiper, SwiperSlide } from 'swiper/react';
import { Autoplay, Navigation, Pagination } from 'swiper/modules';

// Import Swiper styles
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';

// ===================================================================
// === 1. IMPORT HEADER DAN FOOTER DARI FILE LAYOUT ===
// ===================================================================
import { SiteHeader, FooterNote } from '@/Layouts/CustomerLayout';


// Komponen utama Dashboard
export default function CustomerDashboard({ latestBuah, latestSayur, tipeKunjungan }) {
    // Ambil data 'auth' dari props global menggunakan usePage
    const { auth } = usePage().props;

    return (
        <div className="min-h-screen w-full bg-white text-gray-800">
            <Head title="Central Palantea Hidroponik" />

            {/* 2. GUNAKAN KOMPONEN YANG SUDAH DI-IMPORT */}
            <SiteHeader auth={auth} />

            <main className="w-full overflow-hidden">
                <ImageSlider />
                <KunjunganSection tipeKunjungan={tipeKunjungan} />
                <AboutSteps />
                <LatestProducts title="Buah Segar Terbaru" products={latestBuah} />
                <LatestProducts title="Sayuran Segar Terbaru" products={latestSayur} />
                <QualityFeatures />
            </main>

            {/* 2. GUNAKAN KOMPONEN YANG SUDAH DI-IMPORT */}
            <FooterNote />
        </div>
    );
}


// ===================================================================
// === KOMPONEN-KOMPONEN HALAMAN (SiteHeader dan FooterNote dihapus dari sini) ===
// ===================================================================

/* ========== IMAGE SLIDER (RESPONSIF) ========== */
function ImageSlider() {
    // Karena Ziggy dihapus, kita gunakan URL manual di sini
    const slides = [
        { background: '/storage/slide/SlideA.jpeg', title: 'SELAMAT DATANG DI CENTRAL PALANTEA HIDROPONIK', subtitle: 'Bersama kita wujudkan pertanian sehat, hijau, dan berkelanjutan untuk masa depan yang lebih baik.', type: 'welcome' },
        { background: '/storage/slide/SlideB.jpeg', title: 'Outing Class, Kunjungan Umum hingga Acara Bisa di Central Palantea Hidroponik!', buttonText: 'Booking Sekarang!', buttonIcon: <BsBookmarkCheckFill />, type: 'promo', buttonStyle: 'promo-booking', buttonLink: '/customer/kunjungan' },
        { background: '/storage/slide/SlideC.jpeg', title: 'Sayuran Hidroponik untuk Masa Depan Sehat', subtitle: 'Tanpa pestisida, tanpa tanah, lebih bersih dan lebih baik untuk keluargamu.', buttonText: 'Belanja Sekarang!', buttonIcon: <BsFillCartFill />, type: 'promo', buttonStyle: 'promo-shop', buttonLink: '/customer/belanja' }
    ];
    const getButtonStyle = (style) => {
        switch (style) {
            case 'promo-booking': return 'bg-white text-pink-600 font-bold py-3 px-6 rounded-lg shadow-md hover:bg-gray-200 transition-all duration-300';
            case 'promo-shop': return 'bg-lime-300 text-green-900 font-bold py-3 px-6 rounded-lg shadow-md hover:bg-lime-400 transition-all duration-300';
            default: return 'bg-white text-green-800 font-bold py-3 px-6 rounded-lg shadow-md hover:bg-gray-200 transition-all duration-300';
        }
    };
    return (
        <div className="max-w-7xl mx-auto mt-4 md:mt-8 mb-10 md:mb-14 px-4">
            <Swiper
                modules={[Autoplay, Navigation, Pagination]}
                autoplay={{ delay: 5000, disableOnInteraction: false }}
                loop={true}
                slidesPerView={1}
                navigation
                pagination={{ clickable: true }}
                className="rounded-2xl overflow-hidden shadow-lg"
            >
                {slides.map((slide, index) => (
                    <SwiperSlide key={index}>
                        {slide.type === 'welcome' && (
                            <div className="w-full aspect-video md:aspect-[21/9] bg-cover bg-center flex items-center p-6 sm:p-8 md:p-12 lg:p-16" style={{ backgroundImage: `url(${slide.background})` }}>
                                <div className="max-w-lg">
                                    <h1 className="text-3xl sm:text-5xl lg:text-6xl font-bold leading-tight text-[#4a7e26]" dangerouslySetInnerHTML={{ __html: slide.title.replace('CENTRAL PALANTEA HIDROPONIK', '<span class="block">CENTRAL PALANTEA</span> <span class="block">HIDROPONIK</span>') }}></h1>
                                    <p className="text-sm sm:text-base md:text-lg mt-4 sm:mt-6 font-semibold text-[#4a7e26]">{slide.subtitle}</p>
                                </div>
                            </div>
                        )}
                        {slide.type === 'promo' && (
                            <Link href={slide.buttonLink} className="block w-full aspect-video md:aspect-[21/9] bg-cover bg-center relative" style={{ backgroundImage: `url(${slide.background})` }}>
                                <div className="absolute inset-0 bg-black/20"></div>
                                <div className="absolute top-1/2 left-6 sm:left-8 md:left-12 lg:left-16 transform -translate-y-1/2 w-10/12 sm:w-7/12 md:w-1/2 lg:w-2/5">
                                    <div className="z-10 text-white max-w-md">
                                        <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold leading-tight drop-shadow-md">{slide.title}</h1>
                                        {slide.subtitle && <p className="text-sm sm:text-base md:text-lg mt-4 mb-6 drop-shadow-sm">{slide.subtitle}</p>}
                                        <div className={`inline-flex items-center gap-3 mt-6 sm:mt-8 text-sm sm:text-base ${getButtonStyle(slide.buttonStyle)}`}>
                                            {slide.buttonIcon}
                                            {slide.buttonText}
                                        </div>
                                    </div>
                                </div>
                            </Link>
                        )}
                    </SwiperSlide>
                ))}
            </Swiper>
        </div>
    );
}

// ... (semua komponen lainnya seperti KunjunganSection, AboutSteps, dll. biarkan tetap di sini)
// ...
// ... (Saya persingkat agar tidak terlalu panjang, tapi di kode Anda biarkan saja)
// ...

/* ========== SEKSI KUNJungan ========== */
function KunjunganSection({ tipeKunjungan }) {
    if (!tipeKunjungan || tipeKunjungan.length === 0) return null;
    const tipeDetails = {
        'Outing Class': { description: 'Program edukasi interaktif untuk sekolah dan grup belajar, langsung di kebun kami.', icon: <FiUsers className="h-8 w-8 text-white" />, bgColor: 'bg-gradient-to-br from-blue-500 to-blue-700' },
        'Umum': { description: 'Kunjungan rekreasi untuk keluarga dan umum yang ingin menikmati suasana kebun.', icon: <FiSun className="h-8 w-8 text-white" />, bgColor: 'bg-gradient-to-br from-green-500 to-green-700' },
    };
    return (
        <section id="kunjungan" className="py-16 sm:py-20 bg-gray-50">
            <div className="mx-auto max-w-7xl px-4 sm:px-6">
                <div className="text-center">
                    <h2 className="text-3xl sm:text-4xl font-extrabold text-gray-800">Jadwalkan Kunjungan Anda</h2>
                    <p className="mt-4 text-lg text-gray-600 max-w-2xl mx-auto">
                        Pilih tipe kunjungan yang sesuai dengan kebutuhan Anda dan rasakan pengalaman tak terlupakan di kebun kami.
                    </p>
                </div>
                <div className="mt-12 grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
                    {tipeKunjungan.map((tipe) => {
                        const details = tipeDetails[tipe.nama_tipe] || {};
                        return <KunjunganCard key={tipe.id} title={tipe.nama_tipe} {...details} />;
                    })}
                </div>
            </div>
        </section>
    );
}

function KunjunganCard({ title, description, icon, bgColor }) {
    return (
        <div className={`relative rounded-xl overflow-hidden p-8 text-white shadow-lg transform transition-transform hover:scale-105 ${bgColor}`}>
            <div className="relative z-10">
                <div className="flex items-center gap-4">
                    <div className="bg-white/20 p-3 rounded-full">{icon}</div>
                    <h3 className="text-2xl font-bold">{title}</h3>
                </div>
                <p className="mt-4 text-white/90">{description}</p>
                <Link
                    href={'/customer/kunjungan'} // URL Manual
                    className="mt-6 inline-flex items-center gap-2 bg-white text-gray-800 font-semibold px-6 py-3 rounded-lg transition-colors hover:bg-gray-200"
                >
                    Daftar Sekarang <FiArrowRight />
                </Link>
            </div>
        </div>
    );
}

/* ========== TENTANG KAMI (ABOUT STEPS) ========== */
function AboutSteps() {
    const items = [
        { title: 'SIAPA KAMI', text: 'Kami adalah penyedia produk organik segar yang berkomitmen pada kualitas dan kesehatan Anda.' },
        { title: 'CARA KERJA KAMI', text: 'Kami bekerja sama dengan petani lokal terbaik untuk menghadirkan hasil panen langsung ke meja Anda.' },
        { title: 'PRODUK BERKUALITAS', text: 'Setiap item dipilih dengan standar tertinggi untuk memastikan nutrisi dan rasa yang optimal.' },
    ];
    return (
        <section id="about" className="relative py-14 sm:py-20">
            <div className="mx-auto max-w-7xl px-4 sm:px-6">
                <div className="grid gap-10 sm:grid-cols-3 text-center relative">
                    {items.map((it, idx) => (
                        <div key={idx} className="flex flex-col items-center">
                            <div className="h-24 w-24 rounded-full overflow-hidden shadow-md ring-1 ring-black/5">
                                <div className="h-full w-full bg-gradient-to-br from-green-200 to-green-400" />
                            </div>
                            <h3 className="mt-6 text-lg font-semibold text-green-800">{it.title}</h3>
                            <p className="mt-3 text-sm text-gray-600 max-w-xs">{it.text}</p>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}


/* ========== PRODUK TERBARU ========== */
function LatestProducts({ title, products }) {
    if (!products || products.length === 0) return null;

    const handleAddToCart = (productId) => {
        router.post('/customer/cart/store', { // URL Manual
            product_id: productId
        }, {
            preserveScroll: true,
            onSuccess: () => {
                alert('Produk ditambahkan ke keranjang!');
            }
        });
    };

    return (
        <section className="py-10 sm:py-14 bg-gray-50 last:bg-white">
            <div className="mx-auto max-w-7xl px-4 sm:px-6">
                <div className="flex items-end justify-between">
                    <div>
                        <h2 className="text-3xl sm:text-4xl font-extrabold text-green-800">{title}</h2>
                        <p className="mt-2 text-gray-500">Pilihan terbaik untuk Anda, langsung dari kebun.</p>
                    </div>
                    <Link href={'/customer/belanja'} className="text-green-700 font-semibold hover:underline">Lihat semua</Link>
                </div>
                <div className="mt-8 grid gap-6 grid-cols-2 sm:grid-cols-3 md:grid-cols-4">
                    {products.map(p => (
                        <ProductCard key={p.id} data={p} onAddToCart={() => handleAddToCart(p.id)} />
                    ))}
                </div>
            </div>
        </section>
    );
}

function ProductCard({ data, onAddToCart }) {
    const formattedPrice = new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(data.harga);
    return (
        <div className="group rounded-2xl border border-gray-200 bg-white p-4 shadow-sm hover:shadow-lg transition-shadow duration-300 flex flex-col">
            <div className="relative overflow-hidden rounded-xl bg-gray-50 aspect-square">
                {data.stok === 0 && (
                    <span className="absolute left-3 top-3 text-xs font-semibold text-white px-2 py-1 rounded bg-gray-500 z-10">HABIS</span>
                )}
                <img src={`/storage/${data.gambar}`} alt={data.nama} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
            </div>
            <div className="mt-4 flex flex-col flex-grow">
                <h4 className="font-semibold text-gray-800 truncate">{data.nama}</h4>
                <p className="mt-1 font-bold text-green-700 text-lg">{formattedPrice}</p>
                <div className="mt-4 flex items-center justify-between mt-auto pt-2">
                    <button onClick={onAddToCart} disabled={data.stok === 0} className="w-full h-10 rounded-md bg-green-100 text-green-800 font-bold text-sm flex items-center justify-center gap-2 hover:bg-green-600 hover:text-white transition-colors duration-300 disabled:bg-gray-200 disabled:text-gray-400 disabled:cursor-not-allowed">
                        <FiShoppingCart />
                        <span>Tambah</span>
                    </button>
                </div>
            </div>
        </div>
    );
}

/* ========== FITUR KUALITAS ========== */
function QualityFeatures() {
    const features = [
        { title: 'Organik', text: 'Dipanen dari kebun yang dikelola secara alami.', icon: '🤲' },
        { title: '100% Alami', text: 'Makan lokal, lebih dekat dengan alam.', icon: '🌲' },
        { title: 'Produk Pilihan', text: 'Produk kami segar dan terkurasi.', icon: '🏷️' },
        { title: 'Kebun Modern', text: 'Kebun modern untuk menanam & memasok.', icon: '🏡' },
        { title: 'Selalu Segar', text: 'Produk kami selalu segar dan terkurasi.', icon: '🧪' },
        { title: 'Berkelanjutan', text: 'Konsumsi bebas bahan kimia.', icon: '♻️' },
    ];
    return (
        <section className="py-14 sm:py-20 bg-white">
            <div className="mx-auto max-w-7xl px-4 sm:px-6">
                <h2 className="text-center text-3xl sm:text-4xl font-extrabold text-green-800">Kami Menjaga Kualitas Terbaik</h2>
                <p className="mt-2 text-center text-gray-500">Kebahagiaan Anda adalah tujuan kami</p>
                <div className="mt-12 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
                    {features.map((feature, i) => (
                        <FeatureItem key={i} {...feature} />
                    ))}
                </div>
            </div>
        </section>
    );
}

function FeatureItem({ title, text, icon }) {
    return (
        <div className="flex items-start gap-4">
            <div className="h-12 w-12 bg-green-100 rounded-full flex items-center justify-center text-2xl flex-shrink-0">{icon}</div>
            <div>
                <h4 className="font-semibold text-green-800">{title}</h4>
                <p className="text-sm text-gray-600">{text}</p>
            </div>
        </div>
    );
}
