import Mainbar from '@/Components/Bar/Mainbar';
import { Head } from '@inertiajs/react';
import { FiBox, FiUsers, FiShoppingCart, FiCalendar } from 'react-icons/fi';
import { format } from 'date-fns';
import { id } from 'date-fns/locale';

// Komponen Kartu Statistik
const StatCard = ({ icon, title, value, color }) => {
    return (
        <div className={`bg-white p-6 rounded-lg shadow-sm border-l-4 ${color}`}>
            <div className="flex items-center">
                <div className="mr-4">{icon}</div>
                <div>
                    <p className="text-sm font-medium text-gray-500">{title}</p>
                    <p className="text-2xl font-bold text-gray-800">{value}</p>
                </div>
            </div>
        </div>
    );
};

// Komponen Tabel Aktivitas Terbaru
const ActivityTable = ({ title, headers, items, renderRow }) => {
    return (
        <div className="bg-white rounded-lg shadow-sm overflow-hidden">
            <div className="p-4 border-b border-gray-200">
                <h3 className="text-lg font-semibold text-gray-800">{title}</h3>
            </div>
            <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            {headers.map((header) => (
                                <th key={header} scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    {header}
                                </th>
                            ))}
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {items.length > 0 ? (
                            items.map(renderRow)
                        ) : (
                            <tr>
                                <td colSpan={headers.length} className="px-6 py-4 text-center text-gray-500">
                                    Tidak ada data.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default function Dashboard({ auth, stats, pesananTerbaru, pelangganTerbaru }) {
    const statCards = [
        {
            icon: <FiBox className="w-8 h-8 text-green-500" />,
            title: 'Total Produk',
            value: stats.totalProduk,
            color: 'border-green-500',
        },
        {
            icon: <FiUsers className="w-8 h-8 text-blue-500" />,
            title: 'Total Pelanggan',
            value: stats.totalPelanggan,
            color: 'border-blue-500',
        },
        {
            icon: <FiShoppingCart className="w-8 h-8 text-yellow-500" />,
            title: 'Total Pesanan',
            value: stats.totalPesanan,
            color: 'border-yellow-500',
        },
        {
            icon: <FiCalendar className="w-8 h-8 text-purple-500" />,
            title: 'Total Kunjungan',
            value: stats.totalKunjungan,
            color: 'border-purple-500',
        },
    ];

    const formatCurrency = (number) => {
        return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(number);
    };

    return (
        <Mainbar
            header={<h2 className="font-semibold text-xl text-gray-800 leading-tight">Dashboard Admin</h2>}
        >
            <Head title="Dashboard Admin" />

            <div className="py-12">
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
                    {/* Grid Kartu Statistik */}
                    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4 mb-8">
                        {statCards.map((card, index) => (
                            <StatCard key={index} {...card} />
                        ))}
                    </div>

                    {/* Grid Aktivitas Terbaru */}
                    <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
                        <ActivityTable
                            title="Pesanan Terbaru"
                            headers={['ID Pesanan', 'Pelanggan', 'Total', 'Tanggal']}
                            items={pesananTerbaru}
                            renderRow={(pesanan) => (
                                <tr key={pesanan.id}>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">#{pesanan.id}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{pesanan.pelanggan.nama}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{formatCurrency(pesanan.total_harga)}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                                        {format(new Date(pesanan.created_at), 'd MMM yyyy', { locale: id })}
                                    </td>
                                </tr>
                            )}
                        />
                        <ActivityTable
                            title="Pelanggan Baru"
                            headers={['Nama', 'Email', 'Bergabung']}
                            items={pelangganTerbaru}
                            renderRow={(pelanggan) => (
                                <tr key={pelanggan.id}>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{pelanggan.nama}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{pelanggan.email}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                                        {format(new Date(pelanggan.created_at), 'd MMM yyyy', { locale: id })}
                                    </td>
                                </tr>
                            )}
                        />
                    </div>
                </div>
            </div>
        </Mainbar>
    );
}