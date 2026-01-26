import { Head, Link } from '@inertiajs/react';
import CustomerLayout from '@/Layouts/CustomerLayout';
import { FiCalendar, FiUsers, FiBook, FiArrowRight, FiCheckCircle, FiMapPin, FiClock, FiCamera } from 'react-icons/fi';

// ===================================================================
// === KUNJUNGAN LANDING PAGE ===
// === Introduce the two types of visits: Umum & Outing Class ===
// ===================================================================

export default function KunjunganLanding() {
    return (
        <CustomerLayout>
            <Head title="Kunjungan & Edukasi Hidroponik" />

            {/* Hero Section */}
            <section className="relative h-[70vh] min-h-[500px] flex items-center justify-center overflow-hidden">
                <img
                    src="/storage/dashboard/20251201_094635.jpg"
                    alt="Kebun Hidroponik"
                    className="absolute inset-0 w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent"></div>
                <div className="relative z-10 text-center px-4 max-w-4xl">
                    <span className="inline-block bg-green-500 text-white text-sm font-bold px-4 py-2 rounded-full mb-6 animate-pulse">
                        🌱 Buka Setiap Hari!
                    </span>
                    <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-white leading-tight mb-6 drop-shadow-xl">
                        Jelajahi Kebun <span className="text-green-400">Hidroponik</span> Kami
                    </h1>
                    <p className="text-lg sm:text-xl text-gray-200 max-w-2xl mx-auto mb-10">
                        Pengalaman edukatif yang menyenangkan untuk keluarga, sekolah, dan komunitas. Belajar menanam sayur, menikmati suasana hijau, dan bawa pulang hasil panen!
                    </p>
                    <a href="#pilih-kunjungan" className="inline-flex items-center gap-2 bg-white text-green-800 font-bold px-8 py-4 rounded-full shadow-xl hover:bg-green-50 transition">
                        Mulai Reservasi <FiArrowRight />
                    </a>
                </div>
            </section>

            {/* Visit Type Selection */}
            <section id="pilih-kunjungan" className="py-20 px-4 bg-gray-50">
                <div className="max-w-7xl mx-auto">
                    <div className="text-center mb-16">
                        <h2 className="text-3xl sm:text-4xl font-extrabold text-gray-900 mb-4">
                            Pilih Tipe <span className="text-green-600">Kunjungan</span>
                        </h2>
                        <p className="text-gray-600 max-w-2xl mx-auto">
                            Kami menyediakan dua jenis program kunjungan yang bisa Anda pilih sesuai kebutuhan.
                        </p>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                        {/* Kunjungan Umum Card */}
                        <div className="bg-white rounded-3xl overflow-hidden shadow-xl hover:shadow-2xl transition-all duration-300 group flex flex-col">
                            <div className="relative h-64 overflow-hidden">
                                <img
                                    src="/storage/dashboard/20251115_153513.jpg"
                                    alt="Kunjungan Umum"
                                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                                />
                                <div className="absolute top-4 left-4 bg-blue-600 text-white text-xs font-bold px-3 py-1 rounded-full">
                                    UNTUK UMUM
                                </div>
                            </div>
                            <div className="p-8 flex-1 flex flex-col">
                                <h3 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                                    <FiUsers className="text-blue-600" /> Kunjungan Umum
                                </h3>
                                <p className="text-gray-600 mb-6 flex-1">
                                    Cocok untuk keluarga, pasangan, arisan, atau komunitas yang ingin menikmati suasana asri dan bersantai. Sewa tempat untuk acara dengan fasilitas lengkap!
                                </p>

                                <ul className="space-y-3 mb-8">
                                    <li className="flex items-center gap-3 text-gray-700">
                                        <FiCheckCircle className="text-green-500 flex-shrink-0" />
                                        <span>Sewa hall/gazebo untuk arisan & acara</span>
                                    </li>
                                    <li className="flex items-center gap-3 text-gray-700">
                                        <FiCheckCircle className="text-green-500 flex-shrink-0" />
                                        <span>Free sound system + 2 microphone</span>
                                    </li>
                                    <li className="flex items-center gap-3 text-gray-700">
                                        <FiCheckCircle className="text-green-500 flex-shrink-0" />
                                        <span>Foto-foto di kandang burung, ayam & kolam ikan</span>
                                    </li>
                                    <li className="flex items-center gap-3 text-gray-700">
                                        <FiCheckCircle className="text-green-500 flex-shrink-0" />
                                        <span>Buka setiap hari, pukul 07.30 - 18.00 WIB</span>
                                    </li>
                                </ul>

                                <div className="flex items-center justify-between border-t pt-6 mt-auto">
                                    <div>
                                        <span className="text-sm text-gray-500">Mulai dari</span>
                                        <div className="text-2xl font-extrabold text-green-700">Rp 15.000<span className="text-sm font-normal text-gray-500">/orang</span></div>
                                    </div>
                                    <Link
                                        href="/customer/kunjungan/form?type=umum"
                                        className="bg-blue-600 hover:bg-blue-700 text-white font-bold px-6 py-3 rounded-full flex items-center gap-2 transition"
                                    >
                                        Reservasi <FiArrowRight />
                                    </Link>
                                </div>
                            </div>
                        </div>

                        {/* Outing Class Card */}
                        <div className="bg-white rounded-3xl overflow-hidden shadow-xl hover:shadow-2xl transition-all duration-300 group flex flex-col relative">
                            {/* Popular Badge */}
                            <div className="absolute -top-3 -right-3 z-10 bg-orange-500 text-white text-xs font-bold px-4 py-2 rounded-full shadow-lg rotate-12">
                                ⭐ POPULER
                            </div>
                            <div className="relative h-64 overflow-hidden">
                                <img
                                    src="/storage/dashboard/20251112_110526.jpg"
                                    alt="Outing Class"
                                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                                />
                                <div className="absolute top-4 left-4 bg-orange-600 text-white text-xs font-bold px-3 py-1 rounded-full">
                                    UNTUK SEKOLAH
                                </div>
                            </div>
                            <div className="p-8 flex-1 flex flex-col">
                                <h3 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                                    <FiBook className="text-orange-600" /> Outing Class
                                </h3>
                                <p className="text-gray-600 mb-6 flex-1">
                                    Program edukasi khusus untuk TK, SD, SMP, SMA, dan kampus. Siswa belajar tentang pertanian modern, proses menanam sayur hidroponik, dan pentingnya makan sehat.
                                </p>

                                <ul className="space-y-3 mb-8">
                                    <li className="flex items-center gap-3 text-gray-700">
                                        <FiCheckCircle className="text-green-500 flex-shrink-0" />
                                        <span>Materi edukasi sesuai jenjang pendidikan</span>
                                    </li>
                                    <li className="flex items-center gap-3 text-gray-700">
                                        <FiCheckCircle className="text-green-500 flex-shrink-0" />
                                        <span>Praktik menanam langsung di kebun</span>
                                    </li>
                                    <li className="flex items-center gap-3 text-gray-700">
                                        <FiCheckCircle className="text-green-500 flex-shrink-0" />
                                        <span>Gratis buket sayur untuk setiap anak</span>
                                    </li>
                                    <li className="flex items-center gap-3 text-gray-700">
                                        <FiCheckCircle className="text-green-500 flex-shrink-0" />
                                        <span>Guru/pendamping <strong>GRATIS</strong> masuk</span>
                                    </li>
                                    <li className="flex items-center gap-3 text-gray-700">
                                        <FiCheckCircle className="text-green-500 flex-shrink-0" />
                                        <span>Free sound system + 2 microphone</span>
                                    </li>
                                </ul>

                                <div className="flex items-center justify-between border-t pt-6 mt-auto">
                                    <div>
                                        <span className="text-sm text-gray-500">Mulai dari</span>
                                        <div className="text-2xl font-extrabold text-green-700">Rp 10.000<span className="text-sm font-normal text-gray-500">/anak</span></div>
                                    </div>
                                    <Link
                                        href="/customer/kunjungan/form?type=outing"
                                        className="bg-orange-600 hover:bg-orange-700 text-white font-bold px-6 py-3 rounded-full flex items-center gap-2 transition"
                                    >
                                        Reservasi <FiArrowRight />
                                    </Link>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Info Section */}
            <section className="py-16 px-4 bg-white">
                <div className="max-w-7xl mx-auto">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
                        <div className="p-6">
                            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4 text-green-600 text-2xl">
                                <FiMapPin />
                            </div>
                            <h4 className="font-bold text-gray-900 mb-2">Lokasi Strategis</h4>
                            <p className="text-gray-600 text-sm">Jl Melayu, Babussalam, Mandau, Bengkalis Regency, Riau 28784</p>
                        </div>
                        <div className="p-6">
                            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4 text-green-600 text-2xl">
                                <FiClock />
                            </div>
                            <h4 className="font-bold text-gray-900 mb-2">Buka Setiap Hari</h4>
                            <p className="text-gray-600 text-sm">Senin - Minggu, Pukul 07.30 - 18.00 WIB.</p>
                        </div>
                        <div className="p-6">
                            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4 text-green-600 text-2xl">
                                <FiCamera />
                            </div>
                            <h4 className="font-bold text-gray-900 mb-2">Spot Foto Menarik</h4>
                            <p className="text-gray-600 text-sm">Banyak area instagramable di sekitar kebun. Perfect for content!</p>
                        </div>
                    </div>
                </div>
            </section>

            {/* Gallery Teaser */}
            <section className="py-16 px-4 bg-gray-100">
                <div className="max-w-7xl mx-auto">
                    <h3 className="text-2xl font-bold text-gray-900 text-center mb-8">Galeri Kegiatan</h3>
                    <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
                        <img src="/storage/dashboard/20251112_110611.jpg" alt="Outing Class" className="rounded-xl aspect-square object-cover w-full hover:opacity-90 transition" />
                        <img src="/storage/dashboard/20251009_093255.jpg" alt="Visitor 1" className="rounded-xl aspect-square object-cover w-full hover:opacity-90 transition" />
                        <img src="/storage/dashboard/20251015_163003(0).jpg" alt="Visitor 2" className="rounded-xl aspect-square object-cover w-full hover:opacity-90 transition" />
                        <img src="/storage/dashboard/20251018_101931.jpg" alt="Visitor 3" className="rounded-xl aspect-square object-cover w-full hover:opacity-90 transition" />
                        <img src="/storage/dashboard/20251021_162031(0).jpg" alt="Visitor 4" className="rounded-xl aspect-square object-cover w-full hover:opacity-90 transition" />
                        <img src="/storage/dashboard/20251029_164510.jpg" alt="Visitor 5" className="rounded-xl aspect-square object-cover w-full hover:opacity-90 transition" />
                        <img src="/storage/dashboard/20251029_175949.jpg" alt="Visitor 6" className="rounded-xl aspect-square object-cover w-full hover:opacity-90 transition" />
                        <img src="/storage/dashboard/20251031_100252.jpg" alt="Visitor 7" className="rounded-xl aspect-square object-cover w-full hover:opacity-90 transition" />
                        <img src="/storage/dashboard/20251105_144210.jpg" alt="Visitor 8" className="rounded-xl aspect-square object-cover w-full hover:opacity-90 transition" />
                        <img src="/storage/dashboard/20251105_160406.jpg" alt="Visitor 9" className="rounded-xl aspect-square object-cover w-full hover:opacity-90 transition" />
                        <img src="/storage/dashboard/20251106_091214.jpg" alt="Visitor 10" className="rounded-xl aspect-square object-cover w-full hover:opacity-90 transition" />
                        <img src="/storage/dashboard/20251106_093447.jpg" alt="Visitor 11" className="rounded-xl aspect-square object-cover w-full hover:opacity-90 transition" />
                        <img src="/storage/dashboard/20251115_153513.jpg" alt="Visitor 12" className="rounded-xl aspect-square object-cover w-full hover:opacity-90 transition" />
                        <img src="/storage/dashboard/20251122_152019.jpg" alt="Visitor 13" className="rounded-xl aspect-square object-cover w-full hover:opacity-90 transition" />
                        <img src="/storage/dashboard/20251124_102442.jpg" alt="Visitor 14" className="rounded-xl aspect-square object-cover w-full hover:opacity-90 transition" />
                        <img src="/storage/dashboard/20251125_112913.jpg" alt="Visitor 15" className="rounded-xl aspect-square object-cover w-full hover:opacity-90 transition" />
                        <img src="/storage/dashboard/20251024_085625.jpg" alt="Visitor 16" className="rounded-xl aspect-square object-cover w-full hover:opacity-90 transition" />
                        <img src="/storage/dashboard/20251112_110417.jpg" alt="Gallery 1" className="rounded-xl aspect-square object-cover w-full hover:opacity-90 transition" />
                        <img src="/storage/dashboard/20260114_113437.jpg" alt="Gallery 2" className="rounded-xl aspect-square object-cover w-full hover:opacity-90 transition" />
                        <img src="/storage/dashboard/20260114_113550.jpg" alt="Gallery 3" className="rounded-xl aspect-square object-cover w-full hover:opacity-90 transition" />
                    </div>
                </div>
            </section>

            {/* CTA */}
            <section className="py-20 px-4 bg-gradient-to-r from-green-700 to-emerald-700 text-white text-center">
                <h2 className="text-3xl sm:text-4xl font-extrabold mb-4">Siap Berkunjung?</h2>
                <p className="text-lg text-green-100 mb-8 max-w-xl mx-auto">
                    Hubungi kami atau langsung pilih tipe kunjungan di atas untuk memulai reservasi.
                </p>
                <a
                    href="https://wa.me/6285215718965"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 bg-white text-green-800 font-bold px-8 py-4 rounded-full shadow-xl hover:bg-green-50 transition"
                >
                    💬 Chat via WhatsApp
                </a>
            </section>
        </CustomerLayout>
    );
}
