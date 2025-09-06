import { Head } from '@inertiajs/react';
import Mainbar from '@/Components/Bar/Mainbar';
import {
  FiHelpCircle, FiPackage, FiShoppingCart,
  FiCreditCard, FiTruck, FiPhoneCall
} from 'react-icons/fi';

export default function BantuanIndex() {
  const bantuanList = [
    {
      icon: <FiPackage className="text-green-600 text-2xl mb-3" />,
      title: 'Menambahkan Produk & Pelanggan',
      desc: 'Panduan cara menambah data produk dan pelanggan ke sistem.'
    },
    {
      icon: <FiShoppingCart className="text-green-600 text-2xl mb-3" />,
      title: 'Melihat & Mengelola Pesanan',
      desc: 'Cara melihat detail pesanan dan memperbarui status transaksi.'
    },
    {
      icon: <FiCreditCard className="text-green-600 text-2xl mb-3" />,
      title: 'Metode Pembayaran & Diskon',
      desc: 'Pengaturan transfer bank, QRIS, dan kupon promosi.'
    },
    {
      icon: <FiTruck className="text-green-600 text-2xl mb-3" />,
      title: 'Mengatur Ongkir & Kunjungan',
      desc: 'Panduan ongkos kirim dan kelola jadwal kunjungan pelanggan.'
    },
    {
      icon: <FiPhoneCall className="text-green-600 text-2xl mb-3" />,
      title: 'Kontak Bantuan',
      desc: 'Hubungi admin via WhatsApp: ',
      extra: <strong>0822-xxx-xxxx</strong>
    },
    {
      icon: <FiHelpCircle className="text-green-600 text-2xl mb-3" />,
      title: 'FAQ Umum',
      desc: 'Pertanyaan yang sering ditanyakan terkait sistem Central Palantea.'
    },
  ];

  return (
    <Mainbar header={
      <h2 className="text-xl font-semibold leading-tight text-gray-800 dark:text-gray-200">
        Bantuan
      </h2>
    }>
      <Head title="Bantuan" />

      <div className="p-4 space-y-6">
        <h3 className="text-lg font-semibold text-gray-700">Pusat Bantuan</h3>
        <p className="text-sm text-gray-600">Temukan panduan penggunaan sistem Central Palantea di bawah ini.</p>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {bantuanList.map((item, idx) => (
            <div
              key={idx}
              className="bg-white border rounded-xl p-4 shadow-md hover:border-green-500 hover:shadow-lg transition-all duration-300"
            >
              <div className="flex flex-col items-start">
                {item.icon}
                <h4 className="text-lg font-semibold text-green-700 mb-1">{item.title}</h4>
                <p className="text-sm text-gray-600 leading-snug">
                  {item.desc} {item.extra && item.extra}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </Mainbar>
  );
}
