// File: resources/js/Pages/Customer/DashboardCust.jsx

import { Head, Link, router } from '@inertiajs/react';
import {
    FiShoppingCart, FiHeart, FiEye, FiArrowRight,
    FiUsers, FiSun
} from 'react-icons/fi';
import { BsBookmarkCheckFill, BsFillCartFill, BsStar, BsStarFill } from 'react-icons/bs';
import Swal from 'sweetalert2';

// Import Swiper React components & styles
import { Swiper, SwiperSlide } from 'swiper/react';
import { Autoplay, Navigation, Pagination } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';

import CustomerLayout from '@/Layouts/CustomerLayout';


// ===================================================================
// === KARTU PRODUK BARU (UKURAN LEBIH KECIL) ✨ ===
// ===================================================================
function ProductCard({ data, onAddToCart }) {
    const formattedPrice = new Intl.NumberFormat('id-ID', {
        style: 'currency',
        currency: 'IDR',
        minimumFractionDigits: 0,
    }).format(data.harga);

    const rating = data.rating || 4.5; // Placeholder rating

    return (
        <div className="group w-full max-w-sm bg-white rounded-2xl shadow-md hover:shadow-xl transition-shadow duration-300 ease-in-out">
            <div className="relative overflow-hidden rounded-t-2xl">
                {/* Image Container */}
                <Link href={route('belanja.show', data.id)} className="block h-56"> {/* Tinggi gambar dikurangi */}
                    <img 
                        className="h-full w-full object-cover transition-transform duration-500 ease-in-out group-hover:scale-110" 
                        src={`/storage/${data.gambar}`} 
                        alt={data.nama} 
                    />
                </Link>

                {/* Overlay with Actions on Hover */}
                <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-40 transition-all duration-300 flex items-center justify-center opacity-0 group-hover:opacity-100">
                    <div className="flex items-center space-x-3">
                        <Link 
                            href={route('belanja.show', data.id)}
                            className="flex items-center justify-center rounded-full bg-white text-gray-800 h-10 w-10 shadow-lg hover:bg-gray-200 transition-colors"
                            title="Lihat Detail"
                        >
                            <FiEye size={20} />
                        </Link>
                        <button
                            onClick={(e) => { e.preventDefault(); onAddToCart(data); }}
                            disabled={data.stok === 0}
                            className="flex items-center justify-center rounded-full bg-green-600 text-white h-10 w-10 shadow-lg hover:bg-green-700 transition-colors disabled:bg-gray-400"
                            title="Tambah ke Keranjang"
                        >
                            <FiShoppingCart size={20} />
                        </button>
                    </div>
                </div>
                
                {data.stok === 0 && (
                    <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                        <span className="rounded-full bg-gray-800 px-3 py-1 text-xs font-semibold text-white">
                            Stok Habis
                        </span>
                    </div>
                )}
            </div>
            
            {/* Text Content */}
            <div className="p-4 text-center"> {/* Padding dikurangi */}
                {data.kategori && (
                    <p className="text-xs text-gray-500 mb-1">{data.kategori.nama}</p>
                )}
                <h5 className="text-base font-semibold text-gray-900 truncate" title={data.nama}> {/* Ukuran font dikurangi */}
                    <Link href={route('belanja.show', data.id)} className="hover:text-green-600">
                        {data.nama}
                    </Link>
                </h5>
                <p className="text-lg font-bold text-green-600 my-1">{formattedPrice}</p> {/* Ukuran font & margin dikurangi */}
                <div className="flex items-center justify-center">
                    {[...Array(5)].map((_, i) => (
                        i < Math.round(rating) ? <BsStarFill key={i} className="h-3 w-3 text-yellow-400" /> : <BsStar key={i} className="h-3 w-3 text-gray-300" />
                    ))}
                    <span className="ml-2 text-xs text-gray-500">({rating.toFixed(1)})</span>
                </div>
            </div>
        </div>
    );
}


// Komponen utama Dashboard
export default function CustomerDashboard({ latestBuah, latestSayur, tipeKunjungan }) {
    return (
        <CustomerLayout>
            <Head title="Central Palantea Hidroponik" />
            <main className="w-full overflow-hidden">
                <ImageSlider />
                <KunjunganSection tipeKunjungan={tipeKunjungan} />
                <AboutSteps />
                <LatestProducts title="Buah Segar Terbaru" products={latestBuah} />
                <LatestProducts title="Sayuran Segar Terbaru" products={latestSayur} />
                <QualityFeatures />
            </main>
        </CustomerLayout>
    );
}

/* ========== PRODUK TERBARU (DIPERBARUI) ========== */
function LatestProducts({ title, products }) {
    if (!products || products.length === 0) return null;

    // DIUBAH: Menggunakan SweetAlert untuk notifikasi
    const handleAddToCart = (product) => {
        router.post('/customer/cart', { product_id: product.id }, {
            preserveScroll: true,
            onSuccess: () => {
                Swal.fire({
                    toast: true,
                    position: 'top-end',
                    icon: 'success',
                    title: `${product.nama} ditambahkan!`,
                    showConfirmButton: false,
                    timer: 2000,
                });
            },
            onError: (errors) => {
                Swal.fire({
                    toast: true,
                    position: 'top-end',
                    icon: 'error',
                    title: 'Gagal menambahkan produk.',
                    text: Object.values(errors)[0] || '', // Menampilkan pesan error pertama jika ada
                    showConfirmButton: false,
                    timer: 3000,
                });
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
                    <Link href={'/customer/belanja'} className="text-green-700 font-semibold hover:underline hidden sm:inline-block">Lihat semua</Link>
                </div>
                <div className="mt-8 grid grid-cols-2 justify-items-center gap-6 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5"> {/* Grid diubah ke 5 kolom */}
                    {products.map(p => (
                        <ProductCard key={p.id} data={p} onAddToCart={handleAddToCart} />
                    ))}
                </div>
                <div className="mt-8 text-center sm:hidden">
                    <Link href={'/customer/belanja'} className="text-green-700 font-semibold hover:underline">Lihat semua</Link>
                </div>
            </div>
        </section>
    );
}


/* ========== SISA KOMPONEN (TIDAK PERLU DIUBAH) ========== */
// Komponen-komponen di bawah ini tidak diubah dan tetap sama seperti kode Anda sebelumnya.
// Cukup salin seluruh file ini dan semuanya akan bekerja.

function ImageSlider() {
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
                    href={'/customer/kunjungan'}
                    className="mt-6 inline-flex items-center gap-2 bg-white text-gray-800 font-semibold px-6 py-3 rounded-lg transition-colors hover:bg-gray-200"
                >
                    Daftar Sekarang <FiArrowRight />
                </Link>
            </div>
        </div>
    );
}

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
