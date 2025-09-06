import { Head, Link } from '@inertiajs/react';
import Mainbar from '@/Components/Bar/Mainbar';
import {
  FiSettings, FiCreditCard, FiTruck, FiTag,
  FiShoppingCart, FiImage, FiPhone, FiDatabase
} from 'react-icons/fi';

export default function SetelanIndex() {
  const cards = [
    {
      icon: <FiSettings className="text-green-600 text-2x1 mb-3" />,
      title: 'Informasi Toko',
      desc: 'Nama, alamat, deskripsi, dan jam operasional toko.',
      href: '/setelan/toko'
    },
    {
      icon: <FiCreditCard className="text-green-600 text-2x1 mb-3" />,
      title: 'Metode Pembayaran',
      desc: 'Tambah atau ubah Bank Transfer, COD, QRIS.',
      href: '/setelan/pembayaran'
    },
    {
      icon: <FiTruck className="text-green-600 text-2x1 mb-3" />,
      title: 'Ongkos Kirim',
      desc: 'Kelola tarif kirim per wilayah atau ekspedisi.',
      href: '/setelan/ongkir'
    },
    {
      icon: <FiTag className="text-green-600 text-2x1 mb-3" />,
      title: 'Pajak & Diskon',
      desc: 'Atur PPN dan kupon diskon promosi.',
      href: '/setelan/pajak-diskon'
    },
    {
      icon: <FiShoppingCart className="text-green-600 text-2x1 mb-3" />,
      title: 'Transaksi & Checkout',
      desc: 'Atur alur checkout, status pesanan otomatis.',
      href: '/setelan/checkout'
    },
    {
      icon: <FiImage className="text-green-600 text-2x1 mb-3" />,
      title: 'Logo & Tampilan',
      desc: 'Ganti logo, favicon, dan warna tema toko.',
      href: '/setelan/branding'
    },
    {
      icon: <FiPhone className="text-green-600 text-2x1 mb-3" />,
      title: 'Kontak & Bantuan',
      desc: 'Ubah nomor WhatsApp CS dan email support.',
      href: '/setelan/kontak'
    },
    {
      icon: <FiDatabase className="text-green-600 text-2x1 mb-3" />,
      title: 'Backup & Reset',
      desc: 'Simpan atau reset data sistem.',
      href: '/setelan/backup'
    },
  ];

  return (
    <Mainbar header={
      <h2 className="text-xl font-semibold leading-tight text-gray-800 dark:text-gray-200">
        Setelan
      </h2>
    }>
      <Head title="Setelan" />

      <div className="p-4 space-y-6">
        <h3 className="text-lg font-semibold text-gray-700">Panel Pengaturan Admin Central Palantea</h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {cards.map((card, idx) => (
            <Link key={idx} href={card.href} className="block transition transform hover:-translate-y-1 hover:shadow-lg">
              <div className="bg-white border rounded-xl p-4 shadow-md hover:border-green-500 transition-all duration-300">
                <div className="flex flex-col items-start">
                  {card.icon}
                  <h4 className="text-lg font-semibold text-green-700 mb-1">{card.title}</h4>
                  <p className="text-gray-600 text-sm leading-snug">{card.desc}</p>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </Mainbar>
  );
}
