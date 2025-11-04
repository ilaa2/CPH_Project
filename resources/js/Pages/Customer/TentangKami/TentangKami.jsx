import CustomerLayout from '@/Layouts/CustomerLayout';
import { Head, Link } from '@inertiajs/react';
import { FiFacebook, FiGlobe, FiExternalLink } from 'react-icons/fi';
import { FaTiktok, FaWhatsapp } from 'react-icons/fa';

export default function TentangKami({ auth, galleryImages }) {
    // ... (mediaLinks array is unchanged)
    const mediaLinks = [
        {
            name: 'DETAK24COM',
            url: 'https://detak24.com/central-palantea-edukasi-anak-sekolah-tanam-sayur-mayur-di-kota-duri/',
            title: 'Central Palantea, Edukasi Anak Sekolah Tanam Sayur Mayur di Kota Duri'
        },
        {
            name: 'classnews.id',
            url: 'https://classnews.id/agrowisata-perkotaan-central-palantea-edukasi-anak-sekolah-tanam-sayur-mayur-hidroponik/',
            title: 'Agrowisata Perkotaan Central Palantea Edukasi Anak Sekolah'
        },
        {
            name: 'RIAU24JAM.COM',
            url: 'https://riau24jam.com/2024/11/10/central-palantea-kota-duri-nikmati-sensasi-alam-dan-edukasi/',
            title: 'Nikmati Sensasi Alam dan Edukasi di Central Palantea'
        },
        {
            name: 'hariantimes.com',
            url: 'https://hariantimes.com/read-14173-2024-11-10-kunjungi-central-palantea-central-kota-duri-bagus-santoso-ini-kerja-bagus-dan-menginspirasi.html',
            title: 'Kunjungi Central Palantea, Bagus Santoso: Ini Kerja Bagus dan Menginspirasi'
        },
        
        {
            name: 'infoduri',
            url: 'https://vt.tiktok.com/ZSU6WGYvU/',
            title: 'Liputan Video di TikTok oleh Infoduri'
        },
        {
            name: 'indoduri.visit',
            url: 'https://www.instagram.com/p/DOCkUAlE8pt/',
            title: 'Liputan Kunjungan di Instagram oleh Indoduri Visit'
        },
        {
            name: 'Duri Pos',
            url: 'https://www.duripos.com/2024/11/10/edukasi-anak-sekolah-tanam-sayur-mayur-kota-duri/',
            title: 'Edukasi Anak Sekolah Tanam Sayur Mayur Kota Duri'
        }
    ];

    const WhatsAppButton = () => (
        <a
            href="https://wa.me/6285215718965"
            target="_blank"
            rel="noopener noreferrer"
            className="fixed bottom-6 right-6 bg-green-500 text-white p-4 rounded-full shadow-lg hover:bg-green-600 transition-transform hover:scale-110 z-50"
            aria-label="Hubungi kami di WhatsApp"
        >
            <FaWhatsapp size={28} />
        </a>
    );

    return (
        <>
            <Head title="Tentang Kami" />
            <WhatsAppButton />
            <main className="py-12">
                <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
                    {/* All the sections from the original component */}
                    {/* Bagian Profil Perusahaan */}
                    <section className="bg-white p-8 rounded-lg shadow-md">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
                            {/* Kolom Gambar */}
                            <div className="w-full h-80 rounded-lg overflow-hidden shadow-lg">
                                <img
                                    src={galleryImages && galleryImages.length > 0 ? `/${galleryImages[0]}` : 'https://via.placeholder.com/500x320?text=Kebun+Hidroponik'}
                                    alt="Kebun Central Palantea Hidroponik"
                                    className="w-full h-full object-cover"
                                />
                            </div>
                            {/* Kolom Teks */}
                            <div className="text-left">
                                <h1 className="text-4xl font-bold text-green-700 mb-4">Tentang Central Palantea Hidroponik</h1>
                                <p className="text-lg text-gray-600">
                                    Central Palantea Hidroponik adalah pelopor dalam penyediaan sayuran dan buah-buahan segar yang ditanam menggunakan metode hidroponik modern. Kami berkomitmen untuk menghasilkan produk berkualitas tinggi, sehat, dan bebas pestida untuk masyarakat. Dengan teknologi inovatif, kami memastikan setiap produk yang sampai ke tangan Anda adalah yang terbaik.
                                </p>
                            </div>
                        </div>

                        {/* Sub-bagian Keunggulan Kami */}
                        <div className="mt-12">
                            <h2 className="text-3xl font-bold text-center text-gray-800 mb-8">Mengapa Memilih Kami?</h2>
                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-8 text-center">
                                {/* Poin 1 */}
                                <div className="flex flex-col items-center">
                                    <div className="bg-green-100 p-4 rounded-full mb-4">
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-green-700" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                                    </div>
                                    <h3 className="text-xl font-bold text-gray-800 mb-2">100% Hidroponik Segar</h3>
                                    <p className="text-gray-600">Produk kami tanam dan panen setiap hari untuk menjamin kesegaran maksimal.</p>
                                </div>
                                {/* Poin 2 */}
                                <div className="flex flex-col items-center">
                                    <div className="bg-green-100 p-4 rounded-full mb-4">
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-green-700" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                                    </div>
                                    <h3 className="text-xl font-bold text-gray-800 mb-2">Bebas Pestisida</h3>
                                    <p className="text-gray-600">Kami menjamin setiap produk aman dan sehat untuk dikonsumsi keluarga Anda.</p>
                                </div>
                                {/* Poin 3 */}
                                <div className="flex flex-col items-center">
                                    <div className="bg-green-100 p-4 rounded-full mb-4">
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-green-700" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 4v12l-4-2-4 2V4M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                                    </div>
                                    <h3 className="text-xl font-bold text-gray-800 mb-2">Edukasi & Wisata</h3>
                                    <p className="text-gray-600">Nikmati pengalaman belajar dan memetik sayuran langsung dari kebun kami.</p>
                                </div>
                            </div>
                        </div>
                    </section>

                    {/* Bagian Galeri */}
                    <section className="bg-white p-8 rounded-lg shadow-md">
                        <h2 className="text-3xl font-bold text-center text-gray-800 mb-6">Galeri Kami</h2>
                        {galleryImages && galleryImages.length > 0 ? (
                            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                                {galleryImages.map((image, index) => (
                                    <div key={index} className="overflow-hidden rounded-lg aspect-w-1 aspect-h-1">
                                        <img
                                            src={`/${image}`}
                                            alt={`Galeri ${index + 1}`}
                                            className="w-full h-full object-cover transition-transform duration-300 hover:scale-110"
                                        />
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <p className="text-center text-gray-500">Galeri masih kosong. Silakan unggah beberapa gambar.</p>
                        )}
                    </section>

                    {/* Bagian Peta Lokasi */}
                    <section className="bg-white p-8 rounded-lg shadow-md">
                        <h2 className="text-3xl font-bold text-center text-gray-800 mb-6">Kunjungi Kami</h2>
                        <div className="group relative aspect-w-16 aspect-h-9 rounded-lg overflow-hidden border-2 border-gray-200">
                            <iframe
                                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3988.8410355134647!2d101.17465923484191!3d1.268178873540584!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x31d37b4231f4d4b1%3A0x89f0635b3dfdda6f!2sCentral%20Palantea%20Hidroponik!5e0!3m2!1sid!2sid!4v1759987311149!5m2!1sid!2sid"
                                width="100%"
                                height="450"
                                style={{ border: 0 }}
                                allowFullScreen=""
                                loading="lazy"
                                referrerPolicy="no-referrer-when-downgrade"
                            ></iframe>
                            <a
                                href="https://share.google/IRHXXsyVfuh2MHypR"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="absolute top-0 left-0 w-full h-full bg-black bg-opacity-50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                            >
                                <span className="flex items-center px-4 py-2 bg-white text-gray-800 font-bold rounded-lg shadow-md">
                                    <FiExternalLink className="mr-2" />
                                    Buka di Google Maps
                                </span>
                            </a>
                        </div>
                    </section>

                    {/* Bagian Liputan Media */}
                    <section className="bg-white p-8 rounded-lg shadow-md">
                        <h2 className="text-3xl font-bold text-center text-gray-800 mb-8">Liputan Media</h2>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                            {mediaLinks.map((link) => {
                                // ... (mapping logic is unchanged)
                                const getFallback = (name) => name.charAt(0).toUpperCase();
                                const getLogoUrl = (url) => {
                                    if (!url || url === '#') return null;
                                    try {
                                        const hostname = new URL(url).hostname;
                                        return `https://logo.clearbit.com/${hostname}`;
                                    } catch (error) {
                                        return null;
                                    }
                                };
                                const logoUrl = getLogoUrl(link.url);
                                return (
                                    <div
                                        key={link.name}
                                        className="bg-gray-50 border border-gray-200 rounded-lg shadow-sm flex flex-col transition-all duration-300 hover:shadow-lg hover:border-green-300"
                                    >
                                        <div className="p-6 flex-grow flex flex-col">
                                            <div className="flex items-center mb-4">
                                                {logoUrl ? (
                                                    <img
                                                        src={logoUrl}
                                                        alt={`${link.name} logo`}
                                                        className="w-10 h-10 object-contain mr-4"
                                                        onError={(e) => {
                                                            e.currentTarget.style.display = 'none';
                                                            const fallback = e.currentTarget.nextElementSibling;
                                                            if (fallback) fallback.style.display = 'flex';
                                                        }}
                                                    />
                                                ) : null}
                                                <div
                                                    style={{ display: logoUrl ? 'none' : 'flex' }}
                                                    className="w-10 h-10 bg-green-100 text-green-700 font-bold text-xl rounded-full items-center justify-center mr-4"
                                                >
                                                    {getFallback(link.name)}
                                                </div>
                                                <h3 className="font-bold text-gray-800 text-lg">{link.name}</h3>
                                            </div>
                                            <p className="text-gray-600 mb-4 flex-grow">
                                                {link.title}
                                            </p>
                                            <a
                                                href={link.url}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="inline-flex items-center justify-center px-4 py-2 bg-green-600 text-white font-semibold rounded-lg text-sm hover:bg-green-700 transition-colors duration-300 mt-auto"
                                            >
                                                Baca Selengkapnya
                                                <FiExternalLink className="ml-2" />
                                            </a>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </section>
                </div>
            </main>
        </>
    );
}

TentangKami.layout = page => <CustomerLayout children={page} />;