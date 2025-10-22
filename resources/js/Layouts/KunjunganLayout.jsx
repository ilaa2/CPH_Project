import { Link, usePage } from '@inertiajs/react';
import Mainbar from '@/Components/Bar/Mainbar';

export default function KunjunganLayout({ children }) {
  const { url } = usePage();

  const tabs = [
    { name: 'Jadwal Kunjungan', href: route('kunjungan.jadwal'), current: url.startsWith('/kunjungan/jadwal') },
    { name: 'Kalender Kunjungan', href: route('kunjungan.kalender'), current: url.startsWith('/kunjungan/kalender') },
    { name: 'Riwayat Kunjungan', href: route('kunjungan.riwayat'), current: url.startsWith('/kunjungan/riwayat') },
  ];

  return (
    <Mainbar
      header={
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center">
          <h2 className="text-xl font-semibold text-gray-800">Manajemen Kunjungan</h2>
        </div>
      }
    >
      <div className="px-6 pt-2 pb-6">
        <div className="mb-6">
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex space-x-6" aria-label="Tabs">
              {tabs.map((tab) => (
                <Link
                  key={tab.name}
                  href={tab.href}
                  className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                    tab.current
                      ? 'border-green-500 text-green-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  {tab.name}
                </Link>
              ))}
            </nav>
          </div>
        </div>
        <main>{children}</main>
      </div>
    </Mainbar>
  );
}
