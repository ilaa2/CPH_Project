import { useRef, useEffect } from 'react';
import Mainbar from '@/Components/Bar/Mainbar';
import { Head, Link } from '@inertiajs/react';
import {
    FiBox, FiUsers, FiShoppingCart, FiCalendar, FiAlertCircle,
    FiTrendingUp, FiActivity, FiClock, FiCheckCircle, FiPackage
} from 'react-icons/fi';
import { format } from 'date-fns';
import { id } from 'date-fns/locale';
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Filler,
    Legend,
} from 'chart.js';
import { Line } from 'react-chartjs-2';

ChartJS.register(
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Filler,
    Legend
);

export default function Dashboard({ auth, stats, pesananTerbaru, pelangganTerbaru, stokMenipis, pesananPerluDiproses, kunjunganHariIni, grafikPendapatan }) {

    // Format Currency
    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('id-ID', {
            style: 'currency',
            currency: 'IDR',
            minimumFractionDigits: 0,
        }).format(amount || 0);
    };

    // Safe Name Access
    const getSafeName = (user) => {
        return user?.name || 'Guest';
    };

    const getInitial = (name) => {
        return (name || '?').charAt(0).toUpperCase();
    };

    // Chart Data Configuration
    const chartData = {
        labels: grafikPendapatan?.map(item => format(new Date(item.date), 'dd MMM', { locale: id })) || [],
        datasets: [
            {
                fill: true,
                label: 'Pendapatan Harian',
                data: grafikPendapatan?.map(item => item.total) || [],
                borderColor: 'rgb(22, 163, 74)', // Green-600
                backgroundColor: 'rgba(22, 163, 74, 0.1)',
                tension: 0.4,
            },
        ],
    };

    const chartOptions = {
        responsive: true,
        plugins: {
            legend: { display: false },
            tooltip: {
                callbacks: {
                    label: (context) => formatCurrency(context.raw)
                }
            }
        },
        scales: {
            y: {
                beginAtZero: true,
                ticks: { callback: (value) => value >= 1000 ? `${value / 1000}k` : value }
            },
            x: { grid: { display: false } }
        }
    };

    return (
        <Mainbar header={<h2 className="text-xl font-bold text-gray-800">Dashboard</h2>}>
            <Head title="Dashboard Admin" />

            {/* 1. Header & Welcome Message */}
            <div className="mb-8">
                <h1 className="text-2xl font-bold text-gray-800">Hi, {getSafeName(auth.user)} 👋</h1>
                <p className="text-gray-500">Inilah ringkasan aktivitas toko Anda hari ini.</p>
            </div>

            {/* 2. Key Metrics Summary */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                <StatCard
                    title="Total Produk"
                    value={stats?.totalProduk || 0}
                    icon={<FiBox />}
                    color="bg-blue-100 text-blue-600"
                    link={route('produk.index')}
                />
                <StatCard
                    title="Pelanggan"
                    value={stats?.totalPelanggan || 0}
                    icon={<FiUsers />}
                    color="bg-purple-100 text-purple-600"
                    link={route('pelanggan.index')}
                />
                <StatCard
                    title="Pesanan Selesai"
                    value={stats?.totalPesananSelesai || 0}
                    icon={<FiShoppingCart />}
                    color="bg-green-100 text-green-600"
                    link={route('pesanan.index')}
                />
                <StatCard
                    title="Total Kunjungan"
                    value={stats?.totalKunjungan || 0}
                    icon={<FiCalendar />}
                    color="bg-orange-100 text-orange-600"
                    link={route('kunjunganAdmin.index')}
                />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">

                {/* 3. Priority Section (Span 2 Cols) */}
                <div className="lg:col-span-2 space-y-8">

                    {/* Action Items: Pending Orders & Low Stock */}
                    <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                        <div className="p-5 border-b border-gray-100 flex items-center justify-between bg-gray-50/50">
                            <h3 className="font-semibold text-gray-800 flex items-center gap-2">
                                <FiAlertCircle className="text-red-500" /> Perlu Perhatian
                            </h3>
                        </div>
                        <div className="p-5 grid grid-cols-1 md:grid-cols-2 gap-6">

                            {/* Pesanan Pending */}
                            <div>
                                <h4 className="text-sm font-medium text-gray-500 mb-3 uppercase tracking-wider">Pesanan Pending ({pesananPerluDiproses?.length || 0})</h4>
                                <div className="space-y-3">
                                    {pesananPerluDiproses && pesananPerluDiproses.length > 0 ? (
                                        pesananPerluDiproses.map(p => (
                                            <div key={p.id} className="flex items-center justify-between p-3 bg-yellow-50 rounded-lg border border-yellow-100">
                                                <div>
                                                    <div className="font-medium text-gray-800">#{p.kode_pesanan}</div>
                                                    <div className="text-xs text-gray-500">{p.nama_pelanggan} • {formatCurrency(p.total)}</div>
                                                </div>
                                                <Link href={route('pesanan.edit', p.id)} className="px-3 py-1 bg-white text-yellow-700 text-xs font-medium rounded border border-yellow-200 shadow-sm hover:bg-yellow-50">
                                                    Proses
                                                </Link>
                                            </div>
                                        ))
                                    ) : (
                                        <EmptyState message="Semua aman! Tidak ada pesanan pending." />
                                    )}
                                </div>
                            </div>

                            {/* Stok Menipis */}
                            <div>
                                <h4 className="text-sm font-medium text-gray-500 mb-3 uppercase tracking-wider">Stok Menipis ({stokMenipis?.length || 0})</h4>
                                <div className="space-y-3">
                                    {stokMenipis && stokMenipis.length > 0 ? (
                                        stokMenipis.map(p => (
                                            <div key={p.id} className="flex items-center justify-between p-3 bg-red-50 rounded-lg border border-red-100">
                                                <div className="flex items-center gap-3">
                                                    <img src={p.gambar ? `/storage/${p.gambar}` : 'https://via.placeholder.com/150'} alt="" className="w-8 h-8 rounded object-cover bg-gray-200" />
                                                    <div>
                                                        <div className="font-medium text-gray-800 text-sm line-clamp-1">{p.nama}</div>
                                                        <div className="text-xs text-red-600 font-medium">Sisa: {p.stok} unit</div>
                                                    </div>
                                                </div>
                                                <Link href={route('produk.index')} className="text-gray-400 hover:text-gray-600">
                                                    <FiShoppingCart />
                                                </Link>
                                            </div>
                                        ))
                                    ) : (
                                        <EmptyState message="Stok produk aman." Icon={FiCheckCircle} />
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Sales Trend Chart */}
                    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="font-semibold text-gray-800 flex items-center gap-2">
                                <FiTrendingUp className="text-green-600" /> Tren Pendapatan (7 Hari)
                            </h3>
                        </div>
                        <div className="h-64">
                            {grafikPendapatan && grafikPendapatan.length > 0 ? (
                                <Line options={chartOptions} data={chartData} />
                            ) : (
                                <div className="h-full flex flex-col items-center justify-center text-gray-400">
                                    <FiActivity className="text-4xl mb-2 text-gray-300" />
                                    <p>Belum ada data penjualan minggu ini.</p>
                                </div>
                            )}
                        </div>
                    </div>

                </div>

                {/* 4. Sidebar Section (Right Col) */}
                <div className="space-y-8">

                    {/* Today's Schedule */}
                    <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                        <div className="p-4 border-b border-gray-100 bg-green-50/50 flex justify-between items-center">
                            <h3 className="font-semibold text-gray-800 flex items-center gap-2">
                                <FiClock className="text-green-600" /> Jadwal Hari Ini
                            </h3>
                            <span className="text-xs font-bold bg-green-200 text-green-800 px-2 py-1 rounded-full">{kunjunganHariIni?.length || 0}</span>
                        </div>
                        <div className="p-0">
                            {kunjunganHariIni && kunjunganHariIni.length > 0 ? (
                                <div className="divide-y divide-gray-50">
                                    {kunjunganHariIni.map((k) => (
                                        <div key={k.id} className="p-4 hover:bg-gray-50 transition">
                                            <div className="flex justify-between items-start mb-1">
                                                <span className="font-bold text-gray-800">{k.jam}</span>
                                                <span className={`text-[10px] px-2 py-0.5 rounded-full ${k.tipe?.nama === 'Outing Class' ? 'bg-purple-100 text-purple-700' : 'bg-blue-100 text-blue-700'
                                                    }`}>
                                                    {k.tipe?.nama || 'Umum'}
                                                </span>
                                            </div>
                                            <div className="text-sm font-medium text-gray-700 block mb-1">{k.nama_pelanggan}</div>
                                            <div className="text-xs text-gray-500 flex items-center gap-1">
                                                <FiUsers size={10} /> {k.jumlah_pengunjung} Orang
                                            </div>
                                        </div>
                                    ))}
                                    <div className="p-3 bg-gray-50 text-center">
                                        <Link href={route('kunjungan.jadwal')} className="text-sm text-green-600 font-medium hover:underline">Lihat Semua Jadwal →</Link>
                                    </div>
                                </div>
                            ) : (
                                <div className="p-8 text-center">
                                    <div className="inline-block p-3 rounded-full bg-gray-100 mb-3"><FiCalendar className="text-gray-400" /></div>
                                    <p className="text-sm text-gray-500">Tidak ada kunjungan terjadwal hari ini.</p>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Recent Orders Short List */}
                    <div className="bg-white rounded-xl shadow-sm border border-gray-100">
                        <div className="p-4 border-b border-gray-100">
                            <h3 className="font-semibold text-gray-800 flex items-center gap-2">
                                <FiPackage className="text-blue-600" /> Pesanan Baru
                            </h3>
                        </div>
                        <div className="p-0">
                            {pesananTerbaru && pesananTerbaru.map(p => (
                                <div key={p.id} className="p-4 border-b last:border-0 border-gray-50 flex items-center justify-between hover:bg-gray-50">
                                    <div className="flex items-center gap-3">
                                        <div className="w-8 h-8 rounded-full bg-blue-50 flex items-center justify-center text-blue-600 font-bold text-xs">
                                            {getInitial(p.nama_pelanggan)}
                                        </div>
                                        <div>
                                            <div className="text-sm font-medium text-gray-800 truncate w-32">{p.nama_pelanggan}</div>
                                            <div className="text-xs text-gray-500">{format(new Date(p.created_at), 'dd MMM HH:mm')}</div>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <div className="text-sm font-bold text-gray-700">{formatCurrency(p.total)}</div>
                                        <span className={`text-[10px] uppercase font-bold ${p.status === 'Selesai' ? 'text-green-600' :
                                            p.status === 'Dibatalkan' ? 'text-red-500' : 'text-yellow-600'
                                            }`}>{p.status}</span>
                                    </div>
                                </div>
                            ))}
                            <div className="p-3 bg-gray-50 text-center rounded-b-xl">
                                <Link href={route('pesanan.index')} className="text-sm text-blue-600 font-medium hover:underline">Lihat Semua Pesanan →</Link>
                            </div>
                        </div>
                    </div>

                </div>
            </div>
        </Mainbar>
    );
}

// Sub-components
const StatCard = ({ title, value, icon, color, link }) => (
    <Link href={link || '#'} className="block group">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-all duration-300 relative overflow-hidden">
            <div className="flex items-center justify-between z-10 relative">
                <div>
                    <p className="text-sm font-medium text-gray-500 mb-1">{title}</p>
                    <h3 className="text-2xl font-bold text-gray-800 group-hover:scale-110 transition-transform origin-left">{value || 0}</h3>
                </div>
                <div className={`p-3 rounded-lg ${color} bg-opacity-20`}>
                    <div className="text-xl">{icon}</div>
                </div>
            </div>
            <div className={`absolute -bottom-4 -right-4 w-24 h-24 rounded-full ${color} opacity-5 blur-2xl group-hover:opacity-10 transition-opacity`}></div>
        </div>
    </Link>
);

const EmptyState = ({ message, Icon = FiCheckCircle }) => (
    <div className="flex flex-col items-center justify-center py-6 text-center">
        <Icon className="text-gray-300 text-3xl mb-2" />
        <p className="text-sm text-gray-500">{message}</p>
    </div>
);