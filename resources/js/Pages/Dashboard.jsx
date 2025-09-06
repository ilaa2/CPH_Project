import { Head } from '@inertiajs/react';
import Mainbar from "@/Components/Bar/Mainbar";
import { BsBoxSeam, BsPeople } from "react-icons/bs";
import { FiShoppingBag, FiCalendar } from "react-icons/fi";
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    BarElement,
    LineElement,
    PointElement,
    Title,
    Tooltip,
    Legend
} from 'chart.js';
import { Chart } from 'react-chartjs-2';

ChartJS.register(
    CategoryScale,
    LinearScale,
    BarElement,
    LineElement,
    PointElement,
    Title,
    Tooltip,
    Legend
);

export default function Dashboard() {
    const chartLabels = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'];

    const productChartData = {
        labels: chartLabels,
        datasets: [
            {
                label: 'Penjualan Produk',
                data: [120, 150, 180, 90, 200, 170],
                backgroundColor: 'rgba(34,197,94,0.8)',
                hoverBackgroundColor: 'rgba(34,197,94,1)',
                borderRadius: 8,
                borderSkipped: false,
            }
        ],
    };

    const visitChartData = {
        labels: chartLabels,
        datasets: [
            {
                label: 'Jumlah Kunjungan',
                data: [60, 80, 75, 40, 100, 90],
                borderColor: 'rgba(34,197,94,0.9)',
                backgroundColor: 'rgba(34,197,94,0.2)',
                pointBackgroundColor: 'rgba(34,197,94,1)',
                pointBorderColor: '#fff',
                fill: true,
                tension: 0.4,
                pointRadius: 5,
                pointHoverRadius: 7,
            }
        ],
    };

    const chartOptions = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: { display: false },
            tooltip: {
                backgroundColor: '#f0fdf4',
                titleColor: '#15803d',
                bodyColor: '#14532d',
                borderColor: '#86efac',
                borderWidth: 1,
            },
        },
        scales: {
            x: {
                ticks: {
                    font: { family: 'Poppins', size: 12 },
                    color: '#4d4d4d',
                },
                grid: { display: false }
            },
            y: {
                beginAtZero: true,
                ticks: {
                    stepSize: 50,
                    font: { family: 'Poppins', size: 12 },
                    color: '#4d4d4d',
                },
                grid: { color: '#e2e8f0', borderDash: [4, 4] }
            }
        }
    };

    return (
        <Mainbar
            header={
                <h2 className="text-xl font-semibold leading-tight text-gray-800 dark:text-gray-200 truncate">
                    Dashboard
                </h2>
            }
        >
            <Head title="Dashboard" />

            <div className="p-4 sm:p-6 space-y-6">
                {/* Ringkasan Statistik */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
                    <StatCard icon={<BsBoxSeam size={24} className="text-green-700" />} title="Total Produk" value="128" />
                    <StatCard icon={<FiShoppingBag size={24} className="text-green-700" />} title="Total Pesanan" value="450" />
                    <StatCard icon={<BsPeople size={24} className="text-green-700" />} title="Total Pelanggan" value="300" />
                    <StatCard icon={<FiCalendar size={24} className="text-green-700" />} title="Total Kunjungan" value="95" />
                </div>

                {/* Chart Penjualan Produk */}
                <div className="bg-white rounded-lg shadow p-4 sm:p-6 w-full">
                    <h3 className="text-lg font-semibold text-gray-700 mb-4 truncate">
                        Penjualan Produk per Bulan
                    </h3>
                    <div className="w-full h-64 sm:h-72">
                        <Chart type="bar" data={productChartData} options={chartOptions} />
                    </div>
                </div>

                {/* Chart Jumlah Kunjungan */}
                <div className="bg-white rounded-lg shadow p-4 sm:p-6 w-full">
                    <h3 className="text-lg font-semibold text-gray-700 mb-4 truncate">
                        Jumlah Kunjungan per Bulan
                    </h3>
                    <div className="w-full h-64 sm:h-72">
                        <Chart type="line" data={visitChartData} options={chartOptions} />
                    </div>
                </div>
            </div>
        </Mainbar>
    );
}

// Komponen stat kartu ringkasan
function StatCard({ icon, title, value }) {
    return (
        <div className="bg-gradient-to-br from-green-100 to-green-50 rounded-lg shadow p-3 sm:p-4 flex items-center">
            <div className="p-2 sm:p-3 bg-white rounded-full shadow-md mr-3 sm:mr-4 flex-shrink-0">
                {icon}
            </div>
            <div className="truncate">
                <h3 className="text-sm sm:text-base text-gray-600 truncate">{title}</h3>
                <p className="text-xl sm:text-2xl font-bold text-gray-800">{value}</p>
            </div>
        </div>
    );
}
