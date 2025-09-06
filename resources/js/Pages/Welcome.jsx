import { Head, Link } from '@inertiajs/react';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Autoplay } from 'swiper/modules';
import 'swiper/css';
import { useCallback, useState } from 'react';

export default function Welcome({ auth, laravelVersion, phpVersion, produkCount, kunjunganCount, pelangganCount, orderCount }) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const faq = [
    {
      question: "Apa itu sayuran hidroponik?",
      answer: "Sayuran hidroponik adalah tanaman yang dibudidayakan tanpa menggunakan tanah, melainkan dengan larutan nutrisi dan air sebagai media tumbuh."
    },
    {
      question: "Apakah sayuran hidroponik aman untuk dikonsumsi?",
      answer: "Ya, sangat aman. Bahkan, sayuran hidroponik cenderung lebih bersih karena tidak terkena tanah dan lebih minim pestisida."
    },
    {
      question: "Apakah saya bisa berkunjung langsung ke kebun?",
      answer: "Bisa! Kami menyediakan layanan kunjungan edukasi ke kebun hidroponik. Silakan booking melalui halaman 'Booking Kunjungan'."
    },
    {
      question: "Bagaimana cara memesan produk?",
      answer: "Anda bisa memesan langsung melalui website kami di halaman 'Produk', lalu pilih produk dan klik tombol 'Tambah ke Keranjang'."
    },
    {
      question: "Kapan jadwal pengiriman produk?",
      answer: "Pengiriman dilakukan setiap hari Senin–Sabtu pukul 08.00–16.00 WIB. Pesanan yang masuk sebelum pukul 12.00 akan dikirim di hari yang sama."
    }
  ];

  const testimonials = [
    { text: "Sayuran hidroponik dari Central Palantea sangat segar dan tahan lama.", name: "Ibu Rina", role: "Pelanggan Sayuran" },
    { text: "Kegiatan outing class di kebun hidroponik ini sangat edukatif dan menyenangkan.", name: "Pak Andi", role: "Guru Biologi" },
    { text: "Saya membawa keluarga untuk kunjungan umum ke Central Palantea.", name: "Bu Lestari", role: "Pengunjung Umum" },
    { text: "Kualitas dan pelayanan luar biasa. Saya rutin memesan sayuran.", name: "Chef Budi", role: "Pemilik Restoran" },
  ];

  const scrollToSection = useCallback((id) => {
    const element = document.getElementById(id);
    if (!element) return;
    const yOffset = -80; // tinggi header sticky
    const y = element.getBoundingClientRect().top + window.pageYOffset + yOffset;
    window.scrollTo({ top: y, behavior: 'smooth' });
    setMobileMenuOpen(false); // tutup menu setelah klik
  }, []);

  return (
    <>
      <Head title="Welcome">
        <link href="https://cdn.materialdesignicons.com/7.2.96/css/materialdesignicons.min.css" rel="stylesheet" />
      </Head>

      <style>{`
        html {
          scroll-behavior: smooth;
        }
        /* hilangkan scrollbar horizontal di nav */
        .no-scrollbar::-webkit-scrollbar {
          display: none;
        }
        .no-scrollbar {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}</style>

      <div className="bg-white text-green-900 font-sans">
        {/* HEADER */}
        <header className="bg-white shadow-md sticky top-0 z-50" style={{ height: 80 }}>
          <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 py-4 flex flex-wrap items-center justify-between" style={{ height: '100%' }}>
            {/* Logo & Title */}
            <div className="flex flex-wrap items-center gap-3 min-w-0">
              <img src="/storage/logo/central_palantea.png" alt="Logo" className="h-14 w-auto flex-shrink-0" />
              <h1 className="text-green-700 font-extrabold tracking-wide min-w-0" style={{ whiteSpace: 'normal' }}>
                <span className="block text-lg sm:text-xl truncate max-w-xs sm:max-w-md">
                  Central Palantea Hidroponik
                </span>
              </h1>
            </div>

            {/* Desktop Nav */}
            <nav className="hidden md:flex space-x-4 sm:space-x-6 text-green-700 font-semibold text-sm sm:text-base overflow-x-auto no-scrollbar max-w-full">
              <button onClick={() => scrollToSection('tentang')} className="hover:text-green-900 cursor-pointer bg-transparent border-0 p-0 whitespace-nowrap">Tentang Kami</button>
              <button onClick={() => scrollToSection('kunjungan')} className="hover:text-green-900 cursor-pointer bg-transparent border-0 p-0 whitespace-nowrap">Program Kunjungan</button>
              <button onClick={() => scrollToSection('layanan')} className="hover:text-green-900 cursor-pointer bg-transparent border-0 p-0 whitespace-nowrap">Layanan</button>
              <button onClick={() => scrollToSection('faq')} className="hover:text-green-900 cursor-pointer bg-transparent border-0 p-0 whitespace-nowrap">FAQ</button>
              <button onClick={() => scrollToSection('testimoni')} className="hover:text-green-900 cursor-pointer bg-transparent border-0 p-0 whitespace-nowrap">Testimoni</button>
              <button onClick={() => scrollToSection('kontak')} className="hover:text-green-900 cursor-pointer bg-transparent border-0 p-0 whitespace-nowrap">Kontak</button>

              {auth.user ? (
                <Link href={route('dashboard')} className="bg-green-600 text-white font-semibold px-4 py-2 rounded hover:bg-green-700 transition whitespace-nowrap">
                  Kembali ke Dashboard
                </Link>
              ) : (
                <Link href={route('login')} className="bg-green-600 text-white font-semibold px-4 py-2 rounded hover:bg-green-700 transition whitespace-nowrap">
                  Masuk
                </Link>
              )}
            </nav>

            {/* Mobile Hamburger */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 rounded-md text-green-700 hover:text-green-900 focus:outline-none focus:ring-2 focus:ring-green-600"
              aria-label="Toggle menu"
              type="button"
            >
              <svg
                className="h-8 w-8"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                {mobileMenuOpen ? (
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
                )}
              </svg>
            </button>
          </div>

          {/* Mobile Menu Dropdown */}
          {mobileMenuOpen && (
            <nav className="md:hidden bg-white border-t border-green-200 shadow-inner">
              <div className="flex flex-col space-y-1 px-4 py-3">
                <button onClick={() => scrollToSection('tentang')} className="text-green-700 hover:bg-green-100 rounded px-3 py-2 text-left font-semibold">Tentang Kami</button>
                <button onClick={() => scrollToSection('kunjungan')} className="text-green-700 hover:bg-green-100 rounded px-3 py-2 text-left font-semibold">Program Kunjungan</button>
                <button onClick={() => scrollToSection('layanan')} className="text-green-700 hover:bg-green-100 rounded px-3 py-2 text-left font-semibold">Layanan</button>
                <button onClick={() => scrollToSection('faq')} className="text-green-700 hover:bg-green-100 rounded px-3 py-2 text-left font-semibold">FAQ</button>
                <button onClick={() => scrollToSection('testimoni')} className="text-green-700 hover:bg-green-100 rounded px-3 py-2 text-left font-semibold">Testimoni</button>
                <button onClick={() => scrollToSection('kontak')} className="text-green-700 hover:bg-green-100 rounded px-3 py-2 text-left font-semibold">Kontak</button>

                {auth.user ? (
                  <Link
                    href={route('dashboard')}
                    className="mt-2 bg-green-600 text-white font-semibold px-4 py-2 rounded hover:bg-green-700 transition text-center"
                  >
                    Kembali ke Dashboard
                  </Link>
                ) : (
                  <Link
                    href={route('login')}
                    className="mt-2 bg-green-600 text-white font-semibold px-4 py-2 rounded hover:bg-green-700 transition text-center"
                  >
                    Masuk
                  </Link>
                )}
              </div>
            </nav>
          )}
        </header>

        {/* SLIDER */}
        <div className="max-w-7xl mx-auto mt-8 mb-14 px-4">
          <Swiper
            modules={[Autoplay]}
            autoplay={{ delay: 4000, disableOnInteraction: false }}
            loop={true}
            slidesPerView={1}
            className="rounded-xl overflow-hidden shadow-lg"
          >
            <SwiperSlide>
              <img
                src="/storage/slide/SlideA.png"
                alt="Slide A"
                className="w-full h-auto"
              />
            </SwiperSlide>
            <SwiperSlide>
              <img
                src="/storage/slide/SlideB.png"
                alt="Slide B"
                className="w-full h-auto"
              />
            </SwiperSlide>
            <SwiperSlide>
              <img
                src="/storage/slide/SlideC.png"
                alt="Slide C"
                className="w-full h-auto"
              />
            </SwiperSlide>
          </Swiper>
        </div>

        {/* TENTANG & KUNJUNGAN */}
        <div id="tentang" className="max-w-7xl mx-auto px-4 sm:px-6 grid md:grid-cols-2 gap-10 mb-20" style={{ scrollMarginTop: '80px' }}>
          <div className="bg-green-50 p-6 rounded-lg shadow-md hover:shadow-lg transition duration-300">
            <h2 className="text-xl font-bold text-green-700 mb-3">Tentang Kami</h2>
            <p className="text-gray-700 leading-relaxed">
              Central Palantea Hidroponik adalah usaha pertanian modern yang berfokus pada produksi dan edukasi hidroponik berkelanjutan di Pekanbaru.
            </p>
          </div>

          <div id="kunjungan" className="bg-green-50 p-6 rounded-lg shadow-md hover:shadow-lg transition duration-300" style={{ scrollMarginTop: '80px' }}>
            <h2 className="text-xl font-bold text-green-700 mb-3">Program Kunjungan</h2>
            <p className="text-gray-700 leading-relaxed">
              Kami membuka peluang untuk kunjungan edukatif bagi sekolah, komunitas, dan masyarakat umum. Anda bisa belajar langsung tentang hidroponik.
            </p>
          </div>
        </div>

        {/* LAYANAN */}
        <section id="layanan" className="max-w-7xl mx-auto px-4 sm:px-6 mb-20" style={{ scrollMarginTop: '80px' }}>
          <h2 className="text-2xl font-bold text-green-700 mb-8 text-center">Layanan Kami</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-8">
            <div className="bg-green-50 p-6 rounded-lg shadow-md hover:shadow-lg transition duration-300 text-center">
              <i className="mdi mdi-leaf text-green-700 text-4xl mb-4"></i>
              <h3 className="font-semibold text-green-800 mb-2">Produk Sayuran</h3>
              <p className="text-gray-700 text-sm">Berbagai jenis sayuran hidroponik segar siap dikirim ke rumah Anda.</p>
            </div>
            <div className="bg-green-50 p-6 rounded-lg shadow-md hover:shadow-lg transition duration-300 text-center">
              <i className="mdi mdi-school-outline text-green-700 text-4xl mb-4"></i>
              <h3 className="font-semibold text-green-800 mb-2">Kunjungan Edukasi</h3>
              <p className="text-gray-700 text-sm">Kunjungan belajar ke kebun hidroponik untuk sekolah dan komunitas.</p>
            </div>
            <div className="bg-green-50 p-6 rounded-lg shadow-md hover:shadow-lg transition duration-300 text-center">
              <i className="mdi mdi-headset text-green-700 text-4xl mb-4"></i>
              <h3 className="font-semibold text-green-800 mb-2">Konsultasi Hidroponik</h3>
              <p className="text-gray-700 text-sm">Dukungan dan konsultasi untuk memulai usaha hidroponik Anda sendiri.</p>
            </div>
            <div className="bg-green-50 p-6 rounded-lg shadow-md hover:shadow-lg transition duration-300 text-center">
              {/* Ikon pelatihan tambahan */}
              <i className="mdi mdi-school text-green-700 text-4xl mb-4"></i>
              <h3 className="font-semibold text-green-800 mb-2">Pelatihan</h3>
              <p className="text-gray-700 text-sm">Pelatihan intensif untuk teknik dan manajemen hidroponik modern.</p>
            </div>
          </div>
        </section>

        {/* FUN FACTS */}
        <div className="bg-green-100 py-16">
          <div className="max-w-screen-xl mx-auto px-4 grid grid-cols-2 sm:grid-cols-2 md:grid-cols-4 gap-6 text-center">
            {[
              [produkCount, "Jenis Sayuran Hidroponik", "sprout"],
              [kunjunganCount, "Pengunjung Edukasi", "account-group-outline"],
              [pelangganCount, "Pelanggan Tetap", "storefront-outline"],
              [orderCount, "Pesanan Terkirim", "truck-fast-outline"]
            ].map(([count, label, icon], i) => (
              <div key={i}>
                <div className="flex justify-center mb-3">
                  <span className="bg-green-200 p-4 rounded-full inline-flex items-center justify-center">
                    <i className={`mdi mdi-${icon} text-green-700 text-3xl`} />
                  </span>
                </div>
                <h2 className="text-3xl font-bold text-green-800">{count}+</h2>
                <p className="text-green-700 mt-1 text-sm sm:text-base">{label}</p>
              </div>
            ))}
          </div>
        </div>

        {/* FAQ */}
        <section id="faq" className="max-w-5xl mx-auto px-4 py-10" style={{ scrollMarginTop: '80px' }}>
          <h3 className="text-3xl font-bold text-green-700 text-center mb-10">Pertanyaan yang Sering Diajukan</h3>
          <div className="space-y-6">
            {faq.map((item, i) => (
              <details key={i} className="border rounded-lg p-5 bg-green-50">
                <summary className="font-semibold cursor-pointer text-green-800">{item.question}</summary>
                <p className="mt-3 text-sm text-gray-700 leading-relaxed">{item.answer}</p>
              </details>
            ))}
          </div>
        </section>

        {/* TESTIMONI PELANGGAN */}
        <section id="testimoni" className="bg-white py-16" style={{ scrollMarginTop: '80px' }}>
          <div className="max-w-6xl mx-auto px-4">
            <h3 className="text-3xl font-bold text-green-700 text-center mb-10">Apa Kata Mereka?</h3>
            <Swiper
              modules={[Autoplay]}
              autoplay={{ delay: 3000, disableOnInteraction: false }}
              loop={true}
              breakpoints={{
                0: { slidesPerView: 1 },
                640: { slidesPerView: 1.2 },
                768: { slidesPerView: 2 },
                1024: { slidesPerView: 3 },
              }}
              spaceBetween={20}
              className="overflow-hidden"
            >
              {testimonials.map((item, i) => (
                <SwiperSlide key={i}>
                  <div className="h-full bg-green-50 px-6 py-8 rounded-lg shadow hover:shadow-md transition flex flex-col items-center justify-between text-center min-h-[240px]">
                    <p className="text-gray-800 italic mb-4">“{item.text}”</p>
                    <div className="flex justify-center mb-2">
                      {[...Array(5)].map((_, i) => (
                        <i key={i} className="mdi mdi-star text-yellow-500 text-xl" />
                      ))}
                    </div>
                    <div>
                      <div className="text-green-800 font-semibold">{item.name}</div>
                      <div className="text-sm text-green-600">{item.role}</div>
                    </div>
                  </div>
                </SwiperSlide>
              ))}
            </Swiper>
          </div>
        </section>

        {/* FOOTER */}
        <footer id="kontak" className="bg-white border-t" style={{ scrollMarginTop: '80px' }}>
          <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12 grid grid-cols-1 md:grid-cols-4 gap-8">
            {/* Kolom 1: Info Perusahaan */}
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

            {/* Kolom 2: Layanan */}
            <div>
              <h3 className="font-semibold text-gray-800 mb-4">Layanan</h3>
              <ul className="space-y-2 text-sm">
                <li><button onClick={() => scrollToSection('layanan')} className="text-gray-600 hover:text-green-600 cursor-pointer bg-transparent border-0 p-0">Produk Sayuran</button></li>
                <li><button onClick={() => scrollToSection('kunjungan')} className="text-gray-600 hover:text-green-600 cursor-pointer bg-transparent border-0 p-0">Kunjungan Edukasi</button></li>
                <li><button onClick={() => scrollToSection('layanan')} className="text-gray-600 hover:text-green-600 cursor-pointer bg-transparent border-0 p-0">Konsultasi Hidroponik</button></li>
                <li><button onClick={() => scrollToSection('layanan')} className="text-gray-600 hover:text-green-600 cursor-pointer bg-transparent border-0 p-0">Pelatihan</button></li>
              </ul>
            </div>

            {/* Kolom 3: Kontak */}
            <div>
              <h3 className="font-semibold text-gray-800 mb-4">Kontak</h3>
              <ul className="space-y-3 text-sm">
                <li className="flex items-center gap-2 text-gray-600"><i className="mdi mdi-map-marker"></i>Duri, Riau</li>
                <li className="flex items-center gap-2 text-gray-600"><i className="mdi mdi-phone"></i>+62 8211 0987 211</li>
                <li className="flex items-center gap-2 text-gray-600"><i className="mdi mdi-email"></i>info@centralpalantea.com</li>
              </ul>
            </div>
          </div>
          <div className="bg-gray-50 text-center py-4">
            <p className="text-xs text-gray-500">&copy; 2025 Central Palantea Hidroponik. Semua hak dilindungi.</p>
          </div>
        </footer>
      </div>
    </>
  );
}
