import { Head, usePage, router, Link } from '@inertiajs/react';
import Mainbar from '@/Components/Bar/Mainbar';
import Swal from 'sweetalert2';
import { useState } from 'react';
import Modal from '@/Components/Modal'; // Pastikan Anda memiliki komponen Modal
import { format } from 'date-fns';
import { id } from 'date-fns/locale';

// Komponen untuk menampilkan bintang rating
const StarRating = ({ rating }) => (
  <div className="flex items-center">
    {[...Array(5)].map((_, i) => (
      <svg
        key={i}
        className={`w-5 h-5 ${i < rating ? 'text-yellow-400' : 'text-gray-300'}`}
        fill="currentColor"
        viewBox="0 0 20 20"
      >
        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.286 3.967a1 1 0 00.95.69h4.178c.969 0 1.371 1.24.588 1.81l-3.39 2.46a1 1 0 00-.364 1.118l1.286 3.966c.3.922-.755 1.688-1.54 1.118l-3.39-2.46a1 1 0 00-1.175 0l-3.39 2.46c-.784.57-1.838-.196-1.54-1.118l1.287-3.966a1 1 0 00-.364-1.118L2.045 9.394c-.783-.57-.38-1.81.588-1.81h4.178a1 1 0 00.95-.69l1.287-3.967z" />
      </svg>
    ))}
  </div>
);

// Komponen Card untuk setiap ulasan
const UlasanCard = ({ ulasan, onHapus, onLihat }) => {
  const formattedDate = format(new Date(ulasan.tanggal), 'd MMMM yyyy', { locale: id });
  const cardColorClass = ulasan.type === 'Produk' ? 'bg-blue-500' : 'bg-purple-500';
  const cardAccentColorClass = ulasan.type === 'Produk' ? 'bg-blue-100 text-blue-800' : 'bg-purple-100 text-purple-800';

  return (
    <div className="bg-white rounded-xl shadow-lg overflow-hidden transform transition-all hover:shadow-2xl hover:-translate-y-1.5">
      <div className={`h-2 ${cardColorClass}`}></div>
      <div className="p-6 relative">
        <svg className="absolute top-4 right-4 w-16 h-16 text-gray-100 opacity-80" fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M10 3a1 1 0 011 1v2.586l2.293-2.293a1 1 0 111.414 1.414L12.414 8H15a1 1 0 110 2h-2.586l2.293 2.293a1 1 0 11-1.414 1.414L11 11.414V14a1 1 0 11-2 0v-2.586l-2.293 2.293a1 1 0 11-1.414-1.414L7.586 10H5a1 1 0 110-2h2.586L5.293 5.707a1 1 0 011.414-1.414L9 6.586V4a1 1 0 011-1z" clipRule="evenodd" />
        </svg>

        <div className="relative z-10">
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-center gap-4">
              <img
                src={ulasan.foto_profil || `https://ui-avatars.com/api/?name=${ulasan.nama}&color=7F9CF5&background=EBF4FF`}
                alt={ulasan.nama}
                className="w-14 h-14 rounded-full object-cover border-2 border-white shadow-md"
              />
              <div>
                <h4 className="font-bold text-lg text-gray-800">{ulasan.nama}</h4>
                <p className="text-sm text-gray-500">{formattedDate}</p>
              </div>
            </div>
            <StarRating rating={ulasan.rating} />
          </div>

          <div className="mb-4">
            <span className={`inline-block px-3 py-1 text-xs font-semibold rounded-full ${cardAccentColorClass}`}>
              Ulasan {ulasan.type}
            </span>
            <p className="font-semibold text-gray-700 mt-2 truncate">{ulasan.subject}</p>
          </div>

          <p className="text-gray-600 text-sm leading-relaxed line-clamp-3 h-16">
            {ulasan.komentar}
          </p>

          {ulasan.foto_ulasan && ulasan.foto_ulasan.length > 0 && (
            <div className="mt-4">
              <div className="relative w-24 h-24 rounded-lg overflow-hidden border">
                <img
                  src={ulasan.foto_ulasan[0]}
                  alt="Foto Ulasan"
                  className="w-full h-full object-cover"
                />
                {ulasan.foto_ulasan.length > 1 && (
                  <div className="absolute bottom-1 right-1 bg-gray-800 bg-opacity-75 text-white text-xs font-bold px-2 py-1 rounded">
                    +{ulasan.foto_ulasan.length - 1}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="bg-gray-50 px-6 py-3 flex justify-end items-center gap-3">
        <button
          onClick={() => onHapus(ulasan.id)}
          className="flex items-center gap-2 px-3 py-1.5 text-xs font-semibold text-red-700 bg-red-100 rounded-full hover:bg-red-200 transition-colors"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
          Hapus
        </button>
      </div>
    </div>
  );
};

export default function UlasanIndex() {
  const { ulasanList, currentFilter } = usePage().props;

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
          preserveState: true,
          onSuccess: () => {
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

  const FilterButton = ({ filterValue, children }) => {
    const isActive = currentFilter === filterValue || (!currentFilter && filterValue === null);
    const baseClasses = 'px-4 py-2 text-sm font-medium rounded-md focus:outline-none transition-colors';
    const activeClasses = 'bg-green-600 text-white shadow-sm';
    const inactiveClasses = 'bg-white text-gray-700 hover:bg-gray-100 border';

    return (
      <Link
        href={route('ulasan.index', { filter: filterValue })}
        className={`${baseClasses} ${isActive ? activeClasses : inactiveClasses}`}
        preserveState
        preserveScroll
      >
        {children}
      </Link>
    );
  };

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
        <div className="flex space-x-2">
          <FilterButton filterValue={null}>Semua</FilterButton>
          <FilterButton filterValue="produk">Produk</FilterButton>
          <FilterButton filterValue="kunjungan">Kunjungan</FilterButton>
        </div>

        {ulasanList.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {ulasanList.map((item) => (
              <UlasanCard key={item.id} ulasan={item} onHapus={handleHapus} />
            ))}
          </div>
        ) : (
          <div className="text-center py-12 text-gray-500">
            <p>Tidak ada ulasan untuk ditampilkan.</p>
          </div>
        )}
      </div>
    </Mainbar>
  );
}
