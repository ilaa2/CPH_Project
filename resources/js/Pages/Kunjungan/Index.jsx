import { Head, Link } from '@inertiajs/react';
import Mainbar from '@/Components/Bar/Mainbar'
import { FiUserCheck, FiCalendar, FiClock } from 'react-icons/fi'

export default function KunjunganIndex() {
    const items = [
  {
    icon: <FiUserCheck className="text-green-600 text-2xl mb-3" />,
    title: 'Jadwal Kunjungan',
    desc: 'Lihat daftar kunjungan pelanggan yang telah dijadwalkan.',
    link: '/kunjungan/jadwal',
  },
  {
    icon: <FiCalendar className="text-green-600 text-2xl mb-3" />,
    title: 'Kalender Kunjungan',
    desc: 'Lihat kalender interaktif dengan daftar kunjungan.',
    link: '/kunjungan/kalender',
  },
  {
    icon: <FiClock className="text-green-600 text-2xl mb-3" />,
    title: 'Riwayat Kunjungan',
    desc: 'Rekap kunjungan yang telah dilakukan.',
    link: '/kunjungan/riwayat',
  },
];



  return (
    <Mainbar header={
      <h2 className="text-xl font-semibold leading-tight text-gray-800 dark:text-gray-200">
        Kunjungan
      </h2>
    }>
      <Head title="Kunjungan" />

      <div className="p-4 space-y-6">
        <h3 className="text-lg font-semibold text-gray-700">Panel Kunjungan Pelanggan</h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {items.map((item, idx) => (
  <Link
    key={idx}
    href={item.link}
    className="bg-white border rounded-xl p-4 shadow-md hover:shadow-lg transition-all duration-300 block"
  >
    <div className="flex flex-col items-start">
      {item.icon}
      <h4 className="text-lg font-semibold text-green-700 mb-1">{item.title}</h4>
      <p className="text-sm text-gray-600 leading-snug">{item.desc}</p>
    </div>
  </Link>
))}

        </div>
      </div>
    </Mainbar>
  )
}
