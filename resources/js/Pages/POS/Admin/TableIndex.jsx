import React from 'react';
import { Head, router } from '@inertiajs/react';
import Sidebar from '@/Components/Bar/Sidebar';
import Swal from 'sweetalert2';
import { FiGrid, FiRefreshCw, FiCheckCircle, FiAlertCircle, FiXCircle, FiSlash } from 'react-icons/fi';

export default function TableIndex({ tables = [] }) {
  const handleStatusChange = (tableId, nomorMeja, newStatus) => {
    router.post(route('admin.pos.tables.update-status', tableId), {
      status: newStatus,
    }, {
      onSuccess: () => {
        Swal.fire({
          toast: true,
          position: 'top-end',
          icon: 'success',
          title: `Status No. Antrian ${nomorMeja} diubah ke ${newStatus}`,
          showConfirmButton: false,
          timer: 2000,
        });
      }
    });
  };

  const handleResetAll = () => {
    Swal.fire({
      title: 'Reset Semua 30 Nomor Antrian?',
      text: 'Semua nomor antrian akan di-set menjadi AVAILABLE (Tersedia). Pastikan seluruh transaksi telah selesai.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#16a34a',
      confirmButtonText: 'Ya, Reset Semua',
      cancelButtonText: 'Batal',
    }).then((result) => {
      if (result.isConfirmed) {
        router.post(route('admin.pos.tables.reset-all'), {}, {
          onSuccess: () => {
            Swal.fire({ icon: 'success', title: 'Seluruh Nomor Antrian Di-reset!', timer: 2000, showConfirmButton: false });
          }
        });
      }
    });
  };

  return (
    <Sidebar header={
      <div className="flex justify-between items-center w-full">
        <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
          <FiGrid className="text-green-600" /> Manajemen Nomor Antrian Kantin (30 Nomor)
        </h2>
        <button
          onClick={handleResetAll}
          className="px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs rounded-lg shadow transition-colors flex items-center gap-1.5"
        >
          <FiRefreshCw size={14} /> Reset Semua Nomor (Set Available)
        </button>
      </div>
    }>
      <Head title="Manajemen Nomor Antrian - Central Palantea" />

      <div className="space-y-6">

        {/* SUMMARY STATS */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white p-4 rounded-xl border shadow-sm flex items-center gap-3">
            <div className="p-3 bg-green-100 text-green-700 rounded-xl">
              <FiCheckCircle size={24} />
            </div>
            <div>
              <span className="text-xs text-gray-500 font-medium block">Nomor Tersedia (Free)</span>
              <span className="text-2xl font-black text-green-700">
                {tables.filter(t => t.status === 'AVAILABLE').length} Nomor
              </span>
            </div>
          </div>

          <div className="bg-white p-4 rounded-xl border shadow-sm flex items-center gap-3">
            <div className="p-3 bg-red-100 text-red-700 rounded-xl">
              <FiXCircle size={24} />
            </div>
            <div>
              <span className="text-xs text-gray-500 font-medium block">Nomor Dipakai (Occupied)</span>
              <span className="text-2xl font-black text-red-700">
                {tables.filter(t => t.status === 'OCCUPIED').length} Nomor
              </span>
            </div>
          </div>

          <div className="bg-white p-4 rounded-xl border shadow-sm flex items-center gap-3">
            <div className="p-3 bg-amber-100 text-amber-700 rounded-xl">
              <FiAlertCircle size={24} />
            </div>
            <div>
              <span className="text-xs text-gray-500 font-medium block">Perlu Dikembalikan</span>
              <span className="text-2xl font-black text-amber-700">
                {tables.filter(t => t.status === 'NEEDS_CLEANING').length} Nomor
              </span>
            </div>
          </div>

          <div className="bg-white p-4 rounded-xl border shadow-sm flex items-center gap-3">
            <div className="p-3 bg-gray-100 text-gray-600 rounded-xl">
              <FiSlash size={24} />
            </div>
            <div>
              <span className="text-xs text-gray-500 font-medium block">Tidak Tersedia (Off)</span>
              <span className="text-2xl font-black text-gray-700">
                {tables.filter(t => t.status === 'UNAVAILABLE').length} Nomor
              </span>
            </div>
          </div>
        </div>

        {/* 30 NUMBERS CARDS GRID */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 lg:grid-cols-6 gap-3">
          {tables.map(table => {
            let bgBorderClass = 'bg-green-50/50 border-green-300';
            if (table.status === 'OCCUPIED') bgBorderClass = 'bg-red-50/50 border-red-300';
            if (table.status === 'NEEDS_CLEANING') bgBorderClass = 'bg-amber-50/50 border-amber-300';
            if (table.status === 'UNAVAILABLE') bgBorderClass = 'bg-gray-100 border-gray-300 opacity-75';

            return (
              <div key={table.id} className={`p-3 rounded-xl border ${bgBorderClass} shadow-2xs space-y-2 flex flex-col justify-between`}>
                <div className="text-center">
                  <span className="text-xs text-gray-400 font-bold uppercase tracking-wider block">ANTRIAN</span>
                  <span className={`text-2xl font-black ${table.status === 'UNAVAILABLE' ? 'text-gray-400' : 'text-gray-800'}`}>NO. {table.nomor_meja}</span>
                </div>

                <div className="text-center">
                  <select
                    value={table.status}
                    onChange={(e) => handleStatusChange(table.id, table.nomor_meja, e.target.value)}
                    className="w-full text-xs font-bold py-1 px-1.5 border rounded-md focus:ring-green-500 bg-white"
                  >
                    <option value="AVAILABLE">🟢 Available</option>
                    <option value="OCCUPIED">🔴 Dipakai</option>
                    <option value="NEEDS_CLEANING">🟡 Selesai</option>
                    <option value="UNAVAILABLE">⚪ Tidak Tersedia</option>
                  </select>
                </div>
              </div>
            );
          })}
        </div>

      </div>
    </Sidebar>
  );
}
