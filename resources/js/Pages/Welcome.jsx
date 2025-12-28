import { Head, Link } from '@inertiajs/react';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Autoplay } from 'swiper/modules';
import 'swiper/css';
import { useCallback } from 'react';
import CustomerLayout from '@/Layouts/CustomerLayout'; // Import CustomerLayout

export default function Welcome({ auth, laravelVersion, phpVersion, produkCount, kunjunganCount, pelangganCount, orderCount }) {
  const faq = [
    // ... (data faq tetap sama)
  ];

  const testimonials = [
    // ... (data testimonials tetap sama)
  ];

  const scrollToSection = useCallback((id) => {
    // ... (fungsi scrollToSection tetap sama)
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
      `}</style>

      <div className="bg-white text-green-900 font-sans">
        {/* KONTEN UTAMA MULAI DI SINI (HEADER MANUAL DIHAPUS) */}

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

        {/* FOOTER MANUAL DIHAPUS */}
      </div>
    </>
  );
}

// Tambahkan baris ini untuk menggunakan CustomerLayout
Welcome.layout = page => <CustomerLayout>{page}</CustomerLayout>;
