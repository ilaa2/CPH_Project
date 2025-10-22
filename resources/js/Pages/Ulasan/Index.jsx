import { Head, usePage, router, Link } from '@inertiajs/react';
import Mainbar from '@/Components/Bar/Mainbar';
import Swal from 'sweetalert2';
import { format } from 'date-fns';
import { id } from 'date-fns/locale';

// Komponen untuk menampilkan bintang rating
const StarRating = ({ rating }) => (
  <div className="flex items-center">
    {[...Array(5)].map((_, i) => (
      <svg key={i} className={`w-5 h-5 ${i < rating ? 'text-yellow-400' : 'text-gray-300'}`} fill="currentColor" viewBox="0 0 20 20">
        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.286 3.967a1 1 0 00.95.69h4.178c.969 0 1.371 1.24.588 1.81l-3.39 2.46a1 1 0 00-.364 1.118l1.286 3.966c.3.922-.755 1.688-1.54 1.118l-3.39-2.46a1 1 0 00-1.175 0l-3.39 2.46c-.784.57-1.838-.196-1.54-1.118l1.287-3.966a1 1 0 00-.364-1.118L2.045 9.394c-.783-.57-.38-1.81.588-1.81h4.178a1 1 0 00.95-.69l1.287-3.967z" />
      </svg>
    ))}
  </div>
);

export default function UlasanIndex() {
  const { ulasanList, currentFilter } = usePage().props;

  function handleHapus(id) {
    Swal.fire({
      title: 'Hapus Ulasan?',
      text: "Ulasan yang dihapus tidak dapat dikembalikan.",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      confirmButtonText: 'Ya, hapus!',
    }).then((result) => {
      if (result.isConfirmed) {
        router.delete(route('ulasan.destroy', id), {
          onSuccess: () => Swal.fire('Berhasil!', 'Ulasan telah dihapus.', 'success'),
        });
      }
    });
  }

  const FilterButton = ({ filterValue, children }) => {
    const isActive = currentFilter === filterValue || (!currentFilter && filterValue === null);
    const baseClasses = 'px-4 py-2 text-sm font-medium rounded-md focus:outline-none transition-colors';
    const activeClasses = 'bg-green-600 text-white shadow-sm';
    const inactiveClasses = 'bg-white text-gray-700 hover:bg-gray-100 border';

    return (
      <Link href={route('ulasan.index', { filter: filterValue })} className={`${baseClasses} ${isActive ? activeClasses : inactiveClasses}`} preserveState preserveScroll>
        {children}
      </Link>
    );
  };

  return (
    <Mainbar header={<h2 className="text-xl font-semibold text-gray-800">Ulasan & Feedback</h2>}>
      <Head title="Ulasan & Feedback" />

      <div className="p-6 space-y-6">
        <div className="flex space-x-2">
          <FilterButton filterValue={null}>Semua</FilterButton>
          <FilterButton filterValue="produk">Produk</FilterButton>
          <FilterButton filterValue="kunjungan">Kunjungan</FilterButton>
        </div>

        <div className="overflow-x-auto bg-white rounded-xl shadow-md">
          <table className="min-w-full text-sm text-left text-gray-700">
            <thead className="text-xs uppercase bg-green-100 text-green-800">
              <tr>
                <th className="px-4 py-3">No</th>
                <th className="px-4 py-3">Pelanggan</th>
                <th className="px-4 py-3">Rating</th>
                <th className="px-4 py-3">Ulasan</th>
                <th className="px-4 py-3">Gambar</th>
                <th className="px-4 py-3">Tipe</th>
                <th className="px-4 py-3 text-center">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {ulasanList.length > 0 ? (
                ulasanList.map((item, index) => (
                  <tr key={item.id} className="border-b hover:bg-gray-50">
                    <td className="px-4 py-2">{index + 1}</td>
                    <td className="px-4 py-2">
                      <div className="flex items-center gap-3">
                        <img src={item.foto_profil || `https://ui-avatars.com/api/?name=${item.nama}&color=7F9CF5&background=EBF4FF`} alt={item.nama} className="w-10 h-10 rounded-full object-cover"/>
                        <div>
                          <div className="font-medium">{item.nama}</div>
                          <div className="text-xs text-gray-500">{format(new Date(item.tanggal), 'd MMM yyyy', { locale: id })}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-2"><StarRating rating={item.rating} /></td>
                    <td className="px-4 py-2">
                      <p className="font-semibold truncate max-w-xs">{item.subject}</p>
                      <p className="text-gray-600 line-clamp-2 max-w-xs">{item.komentar}</p>
                    </td>
                    <td className="px-4 py-2">
                      {item.foto_ulasan && item.foto_ulasan.length > 0 ? (
                        <img src={item.foto_ulasan[0]} alt="Foto Ulasan" className="w-16 h-16 rounded-md object-cover"/>
                      ) : (
                        <span className="text-xs text-gray-400">N/A</span>
                      )}
                    </td>
                    <td className="px-4 py-2">
                      <span className={`px-2 py-1 rounded-full text-xs ${item.type === 'Produk' ? 'bg-blue-100 text-blue-800' : 'bg-purple-100 text-purple-800'}`}>
                        {item.type}
                      </span>
                    </td>
                    <td className="px-4 py-2">
                      <div className="flex items-center justify-center">
                        <button onClick={() => handleHapus(item.id)} className="p-2 bg-red-100 hover:bg-red-200 rounded-full" title="Hapus">
                          🗑️
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="7" className="text-center py-12 text-gray-500">Tidak ada ulasan untuk ditampilkan.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </Mainbar>
  );
}