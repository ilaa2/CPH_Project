import { Head, usePage, router } from '@inertiajs/react';
import Mainbar from '@/Components/Bar/Mainbar';
import { useState } from 'react';
import Swal from 'sweetalert2';

export default function UlasanIndex() {
  const { ulasanList: initialList } = usePage().props;
  const [search, setSearch] = useState('');
  const [ulasanList, setUlasanList] = useState(initialList);

  function handleHapus(id) {
    Swal.fire({
      title: 'Hapus Ulasan?',
      text: "Ulasan yang dihapus tidak dapat dikembalikan.",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#16a34a',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Ya, hapus!',
      cancelButtonText: 'Batal'
    }).then((result) => {
      if (result.isConfirmed) {
        router.delete(route('ulasan.destroy', id), {
          onSuccess: () => {
            setUlasanList(prev => prev.filter(item => item.id !== id));
            Swal.fire({
              title: 'Berhasil!',
              text: 'Ulasan telah dihapus.',
              icon: 'success',
              timer: 1500,
              showConfirmButton: false
            });
          }
        });
      }
    });
  }

  const filtered = ulasanList.filter(item =>
    item.nama.toLowerCase().includes(search.toLowerCase()) ||
    item.komentar.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <Mainbar
      header={
        <h2 className="text-xl font-semibold leading-tight text-gray-800 dark:text-gray-200">
          Ulasan & Feedback
        </h2>
      }
    >
      <Head title="Ulasan & Feedback" />

      <div className="p-6 space-y-6">
        <input
          type="text"
          placeholder="Cari nama atau komentar..."
          className="border border-gray-300 px-4 py-2 rounded w-full md:w-1/2 focus:outline-none focus:ring-2 focus:ring-green-500"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />

        {filtered.length === 0 ? (
          <p className="text-gray-500 italic">Tidak ada ulasan yang cocok.</p>
        ) : (
          filtered.map((item) => (
            <div key={item.id} className="bg-white rounded-lg shadow p-4 border-l-4 border-green-500 space-y-2 relative">
              <button
                onClick={() => handleHapus(item.id)}
                title="Hapus ulasan"
                className="absolute top-2 right-2 text-red-400 hover:text-red-600 transition"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5-4h4m-4 0a1 1 0 00-1 1v1h6V4a1 1 0 00-1-1m-4 0h4" />
                </svg>
              </button>

              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-green-100 text-green-700 flex items-center justify-center rounded-full font-bold">
                  {item.nama.slice(0, 1)}
                </div>
                <div>
                  <h4 className="text-green-700 font-semibold">{item.nama}</h4>
                  <span className="text-xs text-gray-500">{item.tanggal}</span>
                </div>
              </div>

              <p className="text-gray-800 italic">"{item.komentar}"</p>

              <div className="flex gap-1">
                {[...Array(5)].map((_, i) => (
                  <svg
                    key={i}
                    className={`w-5 h-5 ${i < item.rating ? 'text-yellow-400' : 'text-gray-300'}`}
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.286 3.967a1 1 0 00.95.69h4.178c.969 0 1.371 1.24.588 1.81l-3.39 2.46a1 1 0 00-.364 1.118l1.286 3.966c.3.922-.755 1.688-1.54 1.118l-3.39-2.46a1 1 0 00-1.175 0l-3.39 2.46c-.784.57-1.838-.196-1.54-1.118l1.287-3.966a1 1 0 00-.364-1.118L2.045 9.394c-.783-.57-.38-1.81.588-1.81h4.178a1 1 0 00.95-.69l1.287-3.967z" />
                  </svg>
                ))}
              </div>
            </div>
          ))
        )}
      </div>
    </Mainbar>
  );
}
