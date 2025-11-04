import { Swiper, SwiperSlide } from 'swiper/react';
import { Autoplay, Navigation, Pagination, EffectFade } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';
import 'swiper/css/effect-fade';
import { Link, Head, router } from '@inertiajs/react';
import { FiEye, FiShoppingCart, FiUsers, FiSun, FiArrowRight } from 'react-icons/fi';
import { BsStarFill, BsStar } from 'react-icons/bs';
import Swal from 'sweetalert2';
import CustomerLayout from '@/Layouts/CustomerLayout';

// ... (other imports)

// ===================================================================
// === KOMPONEN-KOMPONEN HALAMAN BERANDA (REDESIGN) ✨ ===
// ===================================================================

/**
 * Hero Slider (Revisi)
 * Menggunakan Swiper/carousel dengan desain yang konsisten dan modern untuk setiap slide.
 */
function HeroSlider() {
    const slides = [
        {
            background: '/storage/slide/SlideC.jpg',
            title: 'Kualitas Terbaik, Langsung dari Kebun',
            subtitle: 'Temukan kesegaran sayuran dan buah hidroponik yang ditanam dengan cinta dan tanpa pestisida.',
            buttonText: 'Pelajari Lebih Lanjut',
            buttonLink: route('belanja.index'),
        },
        {
            background: '/storage/slide/SlideB.jpg',
            title: 'Belanja Hasil Panen Segar Hari Ini',
            subtitle: 'Nikmati kemudahan memesan produk segar kami secara online dan diantar langsung ke rumah Anda.',
            buttonText: 'Belanja Sekarang!',
            buttonLink: route('kunjungan.index'),
        },
        {
            background: '/storage/slide/SlideA.jpg',
            title: 'Edukasi Menyenangkan untuk Sekolah',
            subtitle: 'Ajak siswa belajar tentang hidroponik melalui program outing class yang interaktif dan edukatif.',
            buttonText: 'Jadwalkan Outing Class',
            buttonLink: route('tentang.kami'),
        },
        {
            background: '/storage/slide/SlideD.jpg',
            title: 'Rasakan Pengalaman Berwisata di Kebun',
            subtitle: 'Jadwalkan kunjungan Anda dan keluarga untuk melihat langsung proses tanam modern kami.',
            buttonText: 'Jadwalkan Kunjungan',
            buttonLink: route('tentang.kami'),
        },
    ];

    return (
        <section className="relative w-full h-[60vh] md:h-[70vh] text-white">
            <Swiper
                modules={[Autoplay, Navigation, Pagination, EffectFade]}
                effect="fade"
                fadeEffect={{ crossFade: true }}
                autoplay={{ delay: 5000, disableOnInteraction: false }}
                loop={true}
                navigation
                pagination={{ clickable: true }}
                className="h-full"
            >
                {slides.map((slide, index) => (
                    <SwiperSlide key={index} className="relative h-full">
                        <img
                            src={slide.background}
                            alt="" // Decorative background image
                            className="absolute inset-0 w-full h-full object-cover"
                        />
                        <div className="absolute inset-0 bg-black/50"></div>
                        <div className="relative z-10 h-full flex flex-col items-center justify-center text-center max-w-4xl mx-auto px-4">
                            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold leading-tight drop-shadow-lg">
                                {slide.title}
                            </h1>
                            <p className="mt-6 text-lg sm:text-xl text-gray-200 drop-shadow-md">
                                {slide.subtitle}
                            </p>
                            <Link
                                href={slide.buttonLink}
                                className="mt-10 inline-block bg-green-600 text-white font-bold py-4 px-10 rounded-lg text-lg shadow-lg hover:bg-green-700 transition-all duration-300 ease-in-out transform hover:scale-105"
                            >
                                {slide.buttonText}
                            </Link>
                        </div>
                    </SwiperSlide>
                ))}
            </Swiper>
        </section>
    );
}

/**
 * Fitur Kualitas (Value Proposition Utama)
 * Dipindahkan ke atas, tepat di bawah Hero Section.
 */
function QualityFeatures() {
    const features = [
        { title: '100% Organik', text: 'Dipanen dari kebun yang dikelola secara alami.', icon: '🤲' },
        { title: 'Selalu Segar', text: 'Produk kami selalu segar dan terkurasi setiap hari.', icon: '🌿' },
        { title: 'Bebas Pestisida', text: 'Konsumsi bebas bahan kimia berbahaya.', icon: '🛡️' },
        { title: 'Kebun Modern', text: 'Teknologi hidroponik untuk hasil terbaik.', icon: '🏡' },
        { title: 'Dukungan Lokal', text: 'Mendukung petani dan komunitas lokal.', icon: '🤝' },
        { title: 'Berkelanjutan', text: 'Praktik ramah lingkungan untuk masa depan.', icon: '♻️' },
    ];
    return (
        <section className="py-16 sm:py-24 bg-white">
            <div className="mx-auto max-w-7xl px-4 sm:px-6">
                <div className="text-center max-w-3xl mx-auto">
                    <h2 className="text-3xl sm:text-4xl font-extrabold text-green-800">Kami Menjaga Kualitas Terbaik</h2>
                    <p className="mt-4 text-lg text-gray-600">Kebahagiaan dan kesehatan Anda adalah tujuan utama kami. Inilah janji kami untuk Anda.</p>
                </div>
                <div className="mt-16 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-12">
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
        <div className="flex items-start gap-5">
            <div className="h-14 w-14 bg-green-100 rounded-full flex items-center justify-center text-3xl flex-shrink-0">{icon}</div>
            <div>
                <h4 className="text-lg font-bold text-green-800">{title}</h4>
                <p className="mt-1 text-gray-600">{text}</p>
            </div>
        </div>
    );
}

/**
 * Kartu Produk (Desain Ulang dengan Hover)
 * Tombol aksi disembunyikan dan hanya muncul saat hover.
 */
function ProductCard({ data, onAddToCart }) {
    const formattedPrice = new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(data.harga);
    const rating = data.rating || 4.5;

    return (
        <div className="group w-full max-w-sm bg-white rounded-2xl shadow-md hover:shadow-xl transition-shadow duration-300 ease-in-out">
            <div className="relative overflow-hidden rounded-t-2xl">
                <Link href={route('belanja.show', data.id)} className="block h-56">
                    <img className="h-full w-full object-cover transition-transform duration-500 ease-in-out group-hover:scale-110" src={`/storage/${data.gambar}`} alt={data.nama} />
                </Link>
                <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-40 transition-all duration-300 flex items-center justify-center opacity-0 group-hover:opacity-100">
                    <div className="flex items-center space-x-3">
                        <Link href={route('belanja.show', data.id)} className="flex items-center justify-center rounded-full bg-white text-gray-800 h-10 w-10 shadow-lg hover:bg-gray-200 transition-colors" title="Lihat Detail">
                            <FiEye size={20} />
                        </Link>
                        <button onClick={(e) => { e.preventDefault(); onAddToCart(data); }} disabled={data.stok === 0} className="flex items-center justify-center rounded-full bg-green-600 text-white h-10 w-10 shadow-lg hover:bg-green-700 transition-colors disabled:bg-gray-400" title="Tambah ke Keranjang">
                            <FiShoppingCart size={20} />
                        </button>
                    </div>
                </div>
                {data.stok === 0 && (
                    <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                        <span className="rounded-full bg-gray-800 px-3 py-1 text-xs font-semibold text-white">Stok Habis</span>
                    </div>
                )}
            </div>
            <div className="p-4 text-center">
                {data.kategori && <p className="text-xs text-gray-500 mb-1">{data.kategori.nama}</p>}
                <h5 className="text-base font-semibold text-gray-900 truncate" title={data.nama}>
                    <Link href={route('belanja.show', data.id)} className="hover:text-green-600">{data.nama}</Link>

                </h5>
                <p className="text-lg font-bold text-green-600 my-1">{formattedPrice}</p>
                <div className="flex items-center justify-center">
                    {[...Array(5)].map((_, i) => (i < Math.round(rating) ? <BsStarFill key={i} className="h-3 w-3 text-yellow-400" /> : <BsStar key={i} className="h-3 w-3 text-gray-300" />))}
                    <span className="ml-2 text-xs text-gray-500">({rating.toFixed(1)})</span>
                </div>
            </div>
        </div>
    );
}

/**
 * Seksi Produk Terbaru
 * Menggunakan ProductCard yang sudah didesain ulang.
 */
function LatestProducts({ title, products }) {
    if (!products || products.length === 0) return null;

    const handleAddToCart = (product) => {
        router.post('/customer/cart', { product_id: product.id }, {
            preserveScroll: true,
            onSuccess: () => Swal.fire({ toast: true, position: 'top-end', icon: 'success', title: `${product.nama} ditambahkan!`, showConfirmButton: false, timer: 2000 }),
            onError: (errors) => Swal.fire({ toast: true, position: 'top-end', icon: 'error', title: 'Gagal menambahkan produk.', text: Object.values(errors)[0] || '', showConfirmButton: false, timer: 3000 })
        });
    };

    return (
        <section className="py-16 sm:py-24 bg-gray-50">
            <div className="mx-auto max-w-7xl px-4 sm:px-6">
                <div className="flex items-end justify-between">
                    <div>
                        <h2 className="text-3xl sm:text-4xl font-extrabold text-green-800">{title}</h2>
                        <p className="mt-2 text-lg text-gray-600">Pilihan terbaik untuk Anda, langsung dari kebun.</p>
                    </div>
                    <Link href={route('belanja.index')} className="text-green-700 font-semibold hover:underline hidden sm:inline-block">Lihat semua</Link>
                </div>
                <div className="mt-12 grid grid-cols-2 justify-items-center gap-x-6 gap-y-10 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
                    {products.map(p => <ProductCard key={p.id} data={p} onAddToCart={handleAddToCart} />)}
                </div>
                <div className="mt-10 text-center sm:hidden">
                    <Link href={route('belanja.index')} className="text-green-700 font-semibold hover:underline">Lihat semua</Link>
                </div>
            </div>
        </section>
    );
}

/**
 * Seksi Kunjungan
 * Kartu 'Outing Class' diubah warnanya menjadi hijau.
 */
function KunjunganSection({ tipeKunjungan }) {
    if (!tipeKunjungan || tipeKunjungan.length === 0) return null;
    const tipeDetails = {
        'Outing Class': { description: 'Program edukasi interaktif untuk sekolah dan grup belajar, langsung di kebun kami.', icon: <FiUsers className="h-8 w-8 text-white" />, bgColor: 'bg-gradient-to-br from-teal-500 to-green-700' }, // Warna diubah
        'Umum': { description: 'Kunjungan rekreasi untuk keluarga dan umum yang ingin menikmati suasana kebun.', icon: <FiSun className="h-8 w-8 text-white" />, bgColor: 'bg-gradient-to-br from-orange-500 to-amber-600' },
    };
    return (
        <section id="kunjungan" className="py-16 sm:py-24 bg-white">
            <div className="mx-auto max-w-7xl px-4 sm:px-6">
                <div className="text-center max-w-3xl mx-auto">
                    <h2 className="text-3xl sm:text-4xl font-extrabold text-gray-800">Jadwalkan Kunjungan Anda</h2>
                    <p className="mt-4 text-lg text-gray-600">Pilih tipe kunjungan yang sesuai dengan kebutuhan Anda dan rasakan pengalaman tak terlupakan di kebun kami.</p>
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
        <div className={`relative rounded-2xl overflow-hidden p-8 text-white shadow-lg transform transition-transform hover:scale-105 ${bgColor}`}>
            <div className="relative z-10">
                <div className="flex items-center gap-4">
                    <div className="bg-white/20 p-3 rounded-full">{icon}</div>
                    <h3 className="text-2xl font-bold">{title}</h3>
                </div>
                <p className="mt-4 text-white/90">{description}</p>
                <Link href={route('kunjungan.index')} className="mt-8 inline-flex items-center gap-2 bg-white text-gray-800 font-semibold px-6 py-3 rounded-lg transition-colors hover:bg-gray-200">
                    Daftar Sekarang <FiArrowRight />
                </Link>
            </div>
        </div>
    );
}

// ===================================================================
// === KOMPONEN UTAMA DASHBOARD (SUSUNAN BARU) ===
// ===================================================================
export default function CustomerDashboard({ latestBuah, latestSayur, tipeKunjungan }) {
    return (
        <CustomerLayout>
            <Head title="Central Palantea Hidroponik" />
            <main className="w-full overflow-hidden">
                <HeroSlider />
                <QualityFeatures />
                <LatestProducts title="Buah Segar Pilihan" products={latestBuah} />
                <LatestProducts title="Sayuran Segar Pilihan" products={latestSayur} />
                <KunjunganSection tipeKunjungan={tipeKunjungan} />
            </main>
        </CustomerLayout>
    );
}
