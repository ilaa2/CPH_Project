import { Head, usePage, router, Link, useForm } from '@inertiajs/react';
import Mainbar from '@/Components/Bar/Mainbar';
import Modal from '@/Components/Modal';
import Swal from 'sweetalert2';
import { format } from 'date-fns';
import { id } from 'date-fns/locale';
import { useState } from 'react';

// Komponen untuk menampilkan bintang rating
const StarRating = ({ rating }) => (
  <div className="flex items-center">
    {[...Array(5)].map((_, i) => (
      <svg key={i} className={`w-4 h-4 ${i < rating ? 'text-yellow-400' : 'text-gray-300'}`} fill="currentColor" viewBox="0 0 20 20">
        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.286 3.967a1 1 0 00.95.69h4.178c.969 0 1.371 1.24.588 1.81l-3.39 2.46a1 1 0 00-.364 1.118l1.286 3.966c.3.922-.755 1.688-1.54 1.118l-3.39-2.46a1 1 0 00-1.175 0l-3.39 2.46c-.784.57-1.838-.196-1.54-1.118l1.287-3.966a1 1 0 00-.364-1.118L2.045 9.394c-.783-.57-.38-1.81.588-1.81h4.178a1 1 0 00.95-.69l1.287-3.967z" />
      </svg>
    ))}
  </div>
);

export default function UlasanIndex() {
  const { ulasanList, currentFilter, stats } = usePage().props;

  // State for Reply Modal
  const [isReplyModalOpen, setIsReplyModalOpen] = useState(false);
  const [selectedUlasan, setSelectedUlasan] = useState(null);
  const [expandedReplies, setExpandedReplies] = useState({});
  const [replyText, setReplyText] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);

  const templates = [
    "Terima kasih atas ulasan positif Anda.",
    "Terima kasih atas masukan Anda, kami akan melakukan evaluasi.",
    "Mohon maaf atas ketidaknyamanannya, kami akan meningkatkan kualitas layanan."
  ];

  const toggleReply = (id) => {
    setExpandedReplies(prev => ({
      ...prev,
      [id]: !prev[id]
    }));
  };

  function handleHapus(idId) {
    Swal.fire({
      title: 'Hapus Ulasan?',
      text: "Ulasan yang dihapus tidak dapat dikembalikan.",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      confirmButtonText: 'Ya, hapus!',
    }).then((result) => {
      if (result.isConfirmed) {
        router.delete(route('admin.ulasan.destroy', idId), {
          onSuccess: () => Swal.fire('Berhasil!', 'Ulasan telah dihapus.', 'success'),
        });
      }
    });
  }

  const openReplyModal = (ulasan) => {
    setSelectedUlasan(ulasan);
    setReplyText(ulasan.balasan || '');
    setIsReplyModalOpen(true);
  };

  const closeReplyModal = () => {
    setIsReplyModalOpen(false);
    setSelectedUlasan(null);
    setReplyText('');
  };

  const handleReplySubmit = (e) => {
    e.preventDefault();
    setIsProcessing(true);
    router.post(route('admin.ulasan.reply', selectedUlasan.id), {
      balasan: replyText
    }, {
      onSuccess: () => {
        closeReplyModal();
        Swal.fire({
          icon: 'success',
          title: 'Berhasil!',
          text: 'Balasan ulasan berhasil dikirim.',
          timer: 1500,
          showConfirmButton: false
        });
      },
      onFinish: () => setIsProcessing(false)
    });
  };

  const FilterButton = ({ filterValue, children }) => {
    const isActive = currentFilter === filterValue;
    const baseClasses = 'px-4 py-2 text-sm font-medium rounded-md focus:outline-none transition-colors';
    const activeClasses = 'bg-green-600 text-white shadow-sm';
    const inactiveClasses = 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-300';

    return (
      <Link href={route('admin.ulasan.index', { filter: filterValue })} className={`${baseClasses} ${isActive ? activeClasses : inactiveClasses}`} preserveState preserveScroll>
        {children}
      </Link>
    );
  };

  return (
    <Mainbar header={<h2 className="text-xl font-semibold text-gray-800">Ulasan & Feedback</h2>}>
      <Head title="Ulasan & Feedback" />

      <div className="p-4 md:p-6 space-y-6">

        {/* Summary Stats Cards */}
        {stats && (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex flex-col justify-center items-center text-center">
              <div className="text-gray-500 text-xs font-semibold uppercase tracking-wider mb-1">Total Ulasan</div>
              <div className="text-3xl font-bold text-gray-800">{stats.total}</div>
            </div>
            <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex flex-col justify-center items-center text-center">
              <div className="text-gray-500 text-xs font-semibold uppercase tracking-wider mb-1">Rata-rata Rating</div>
              <div className="text-3xl font-bold text-yellow-500 flex items-center gap-1">
                {stats.rata_rating} <span className="text-xl">⭐</span>
              </div>
            </div>
            <div className="bg-white p-4 rounded-xl shadow-sm border border-yellow-200 bg-yellow-50 flex flex-col justify-center items-center text-center">
              <div className="text-yellow-700 text-xs font-semibold uppercase tracking-wider mb-1">Belum Dibalas</div>
              <div className="text-3xl font-bold text-yellow-600">{stats.belum_dibalas}</div>
            </div>
            <div className="bg-white p-4 rounded-xl shadow-sm border border-red-200 bg-red-50 flex flex-col justify-center items-center text-center">
              <div className="text-red-700 text-xs font-semibold uppercase tracking-wider mb-1">Rating ≤ 3</div>
              <div className="text-3xl font-bold text-red-600">{stats.rating_rendah}</div>
            </div>
          </div>
        )}

        <div className="flex flex-wrap gap-2">
          <FilterButton filterValue="semua">Semua</FilterButton>
          <FilterButton filterValue="belum_dibalas">Belum Dibalas</FilterButton>
          <FilterButton filterValue="rating_rendah">Rating ≤ 3</FilterButton>
          <FilterButton filterValue="produk">Produk</FilterButton>
          <FilterButton filterValue="kunjungan">Kunjungan</FilterButton>
        </div>

        <div className="overflow-x-auto bg-white rounded-xl shadow-md custom-scrollbar">
          <table className="min-w-full text-sm text-left text-gray-700">
            <thead className="text-xs uppercase bg-green-100 text-green-800">
              <tr>
                <th className="px-4 py-3">Pelanggan</th>
                <th className="px-4 py-3 min-w-[250px]">Ulasan</th>
                <th className="px-4 py-3">Gambar</th>
                <th className="px-4 py-3 text-center">Status</th>
                <th className="px-4 py-3 text-center">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {ulasanList.length > 0 ? (
                ulasanList.map((item) => (
                  <tr key={item.id} className="border-b hover:bg-gray-50">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <img src={item.foto_profil || `https://ui-avatars.com/api/?name=${item.nama}&color=7F9CF5&background=EBF4FF`} alt={item.nama} className="w-10 h-10 rounded-full object-cover shrink-0" />
                        <div>
                          <div className="font-medium text-gray-900">{item.nama}</div>
                          <div className="text-xs text-gray-500">{format(new Date(item.tanggal), 'd MMM yyyy', { locale: id })}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="mb-1"><StarRating rating={item.rating} /></div>
                      <p className="font-semibold text-xs text-gray-500 mb-1">{item.subject}</p>
                      <p className="text-gray-800 text-sm line-clamp-2">{item.komentar}</p>
                      {item.balasan && (
                        <div className="mt-2 text-xs">
                          <button
                            onClick={() => toggleReply(item.id)}
                            className="font-semibold text-blue-600 hover:text-blue-800 flex items-center gap-1 transition-colors"
                          >
                            {expandedReplies[item.id] ? 'Sembunyikan Balasan 🔼' : 'Lihat Balasan 🔽'}
                          </button>
                          {expandedReplies[item.id] && (
                            <div className="mt-2 bg-gray-50 p-2.5 rounded border border-gray-100 text-gray-700">
                              <span className="font-semibold text-green-700 block mb-1">Balasan Anda:</span>
                              {item.balasan}
                            </div>
                          )}
                        </div>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      {item.foto_ulasan && item.foto_ulasan.length > 0 ? (
                        <div className="flex gap-1">
                          {item.foto_ulasan.map((foto, idx) => (
                            <img key={idx} src={foto} alt="Foto Ulasan" className="w-12 h-12 rounded object-cover border" />
                          ))}
                        </div>
                      ) : (
                        <span className="text-xs text-gray-400">-</span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-center">
                      <span className={`inline-flex px-2 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${item.balasan ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>
                        {item.balasan ? 'Sudah Dibalas' : 'Belum Dibalas'}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-center gap-2">
                        <button
                          onClick={() => openReplyModal(item)}
                          className={`p-2 rounded-lg flex items-center gap-1 transition-colors text-xs font-semibold ${item.balasan ? 'bg-gray-100 text-gray-700 hover:bg-gray-200' : 'bg-blue-50 text-blue-600 hover:bg-blue-100'}`}
                          title={item.balasan ? "Edit Balasan" : "Balas Ulasan"}
                        >
                          <span>💬</span> {item.balasan ? "Edit Balasan" : "Balas"}
                        </button>
                        <button onClick={() => handleHapus(item.id)} className="p-2 bg-red-50 text-red-600 hover:bg-red-100 rounded-lg transition-colors" title="Hapus">
                          🗑️
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="5" className="text-center py-12 text-gray-500">
                    <div className="text-4xl mb-3">📭</div>
                    Tidak ada ulasan yang sesuai dengan filter.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal Balasan */}
      <Modal show={isReplyModalOpen} onClose={closeReplyModal} maxWidth="xl">
        <div className="p-6">
          <h2 className="text-lg font-bold text-gray-900 mb-4 border-b pb-2">Balas Ulasan Pelanggan</h2>

          {selectedUlasan && (
            <div className="mb-6 bg-gray-50 p-4 rounded-lg border border-gray-100">
              <div className="flex items-center gap-3 mb-2">
                <img src={selectedUlasan.foto_profil || `https://ui-avatars.com/api/?name=${selectedUlasan.nama}&color=7F9CF5&background=EBF4FF`} className="w-8 h-8 rounded-full" />
                <div>
                  <div className="font-semibold text-sm">{selectedUlasan.nama}</div>
                  <StarRating rating={selectedUlasan.rating} />
                </div>
              </div>
              <p className="text-sm text-gray-700 italic">"{selectedUlasan.komentar}"</p>
            </div>
          )}

          <form onSubmit={handleReplySubmit}>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">Tulis Balasan:</label>
              <textarea
                className="w-full border-gray-300 rounded-lg shadow-sm focus:border-green-500 focus:ring-green-500 text-sm"
                rows="4"
                placeholder="Ketik balasan Anda di sini..."
                value={replyText}
                onChange={(e) => setReplyText(e.target.value)}
                required
              ></textarea>
            </div>

            <div className="mb-6">
              <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Pilih Template Cepat:</label>
              <div className="flex flex-col gap-2">
                {templates.map((tmpl, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setReplyText(tmpl)}
                    className="text-left text-sm py-2 px-3 bg-gray-50 hover:bg-green-50 border hover:border-green-200 rounded text-gray-700 transition-colors"
                  >
                    {tmpl}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-4 border-t">
              <button type="button" onClick={closeReplyModal} className="px-4 py-2 bg-white border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50">
                Batal
              </button>
              <button type="submit" disabled={isProcessing} className="px-4 py-2 bg-green-600 text-white rounded-lg text-sm font-medium hover:bg-green-700 disabled:opacity-50">
                Kirim Balasan
              </button>
            </div>
          </form>
        </div>
      </Modal>
    </Mainbar>
  );
}