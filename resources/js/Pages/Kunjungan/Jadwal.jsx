import { Head, Link, router, useForm, usePage } from '@inertiajs/react';
import Mainbar from '@/Components/Bar/Mainbar';
import { useState, useEffect, useCallback } from 'react';
import Swal from 'sweetalert2';
import { debounce } from 'lodash';
import InputError from '@/Components/InputError';
import Select from 'react-select';
import KunjunganLayout from '@/Layouts/KunjunganLayout';
import Modal from '@/Components/Modal'; // <-- Import Modal Generik

// Komponen Baris Detail
const DetailRow = ({ label, value }) => (
  <div className="flex justify-between items-center py-3 border-b border-gray-200">
    <span className="text-sm font-medium text-gray-600">{label}</span>
    <span className="text-sm text-gray-900 font-semibold">{value}</span>
  </div>
);

// Komponen Modal Detail
const DetailModal = ({ item, onClose }) => (
  <Modal show={true} onClose={onClose} maxWidth="lg">
    <div className="p-6">
      <h2 className="text-xl font-bold text-green-700 mb-5">Detail Kunjungan</h2>
      <div className="space-y-2">
        <DetailRow label="Nama Pelanggan" value={item.pelanggan?.nama} />
        <DetailRow label="Tipe Kunjungan" value={item.tipe?.nama_tipe || '-'} />
        <DetailRow label="Tanggal & Jam" value={`${item.tanggal} - ${item.jam}`} />
        {item.tipe?.nama_tipe === 'Outing Class' ? (
          <DetailRow label="Jumlah Anak" value={`${item.jumlah_anak} Orang`} />
        ) : (
          <>
            <DetailRow label="Jumlah Dewasa" value={`${item.jumlah_dewasa} Orang`} />
            <DetailRow label="Jumlah Anak" value={`${item.jumlah_anak} Orang`} />
            <DetailRow label="Jumlah Balita" value={`${item.jumlah_balita} Orang`} />
          </>
        )}
        <DetailRow label="Total Biaya" value={`Rp ${item.total_biaya.toLocaleString('id-ID')}`} />
        <DetailRow label="Status" value={<span className="capitalize font-bold">{item.status}</span>} />
      </div>
      <div className="mt-8 text-right">
        <button onClick={onClose} className="px-6 py-2 bg-green-600 text-white rounded-lg shadow hover:bg-green-700 transition-transform transform hover:scale-105">
          Tutup
        </button>
      </div>
    </div>
  </Modal>
);


// Komponen Modal Edit
const EditModal = ({ item, onClose }) => {
  const { data, setData, put, processing, errors } = useForm({
    status: item.status || '',
  });

  const statusOptions = [
    { value: 'Dijadwalkan', label: 'Dijadwalkan' },
    { value: 'Selesai', label: 'Selesai' },
    { value: 'Dibatalkan', label: 'Dibatalkan' },
  ];

  const customStyles = {
    control: (provided) => ({
      ...provided,
      borderRadius: '0.5rem',
      borderColor: '#d1d5db',
      padding: '0.35rem',
      boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
      '&:hover': {
        borderColor: '#10b981',
      },
    }),
    menu: (provided) => ({
      ...provided,
      borderRadius: '0.5rem',
      zIndex: 9999,
    }),
    menuPortal: base => ({ ...base, zIndex: 9999 }),
    option: (provided, state) => ({
        ...provided,
        backgroundColor: state.isSelected ? '#10b981' : state.isFocused ? '#d1fae5' : 'white',
        color: state.isSelected ? 'white' : '#1f2937',
        '&:active': {
            backgroundColor: '#059669',
        },
    }),
  };

  const submit = (e) => {
    e.preventDefault();
    put(route('kunjungan.update', item.id), {
      onSuccess: () => onClose(),
    });
  };

  return (
    <Modal show={true} onClose={onClose} maxWidth="lg">
      <form onSubmit={submit} className="p-6">
        <h2 className="text-xl font-bold text-green-700 mb-5">Edit Status Kunjungan</h2>
        
        <div className="space-y-3 text-sm mb-6">
          <DetailRow label="Pelanggan" value={item.pelanggan?.nama} />
          <DetailRow label="Tanggal" value={item.tanggal} />
          <DetailRow label="Tipe" value={item.tipe?.nama_tipe} />
        </div>

        <div>
          <label htmlFor="status" className="block text-sm font-medium text-gray-700 mb-2">
            Status Kunjungan
          </label>
          <Select
            id="status"
            options={statusOptions}
            styles={customStyles}
            value={statusOptions.find(option => option.value === data.status)}
            onChange={selectedOption => setData('status', selectedOption.value)}
            menuPortalTarget={document.body}
            isSearchable={false}
            classNamePrefix="react-select"
          />
          <InputError message={errors.status} className="mt-2" />
        </div>

        <div className="mt-8 flex justify-end space-x-3">
          <button type="button" onClick={onClose} className="px-6 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition">
            Batal
          </button>
          <button type="submit" disabled={processing} className="px-6 py-2 bg-green-600 text-white rounded-lg shadow hover:bg-green-700 transition-transform transform hover:scale-105 disabled:opacity-50">
            Simpan Perubahan
          </button>
        </div>
      </form>
    </Modal>
  );
};

// Komponen Pagination
const Pagination = ({ links }) => (
    <div className="flex flex-wrap justify-center mt-4">
      {links.map((link, index) => (
        <Link
          key={index}
          href={link.url || '#'}
          dangerouslySetInnerHTML={{ __html: link.label }}
          className={`px-4 py-2 mx-1 my-1 rounded-md text-sm ${
            link.active ? 'bg-green-600 text-white shadow-md' : 'bg-white text-gray-700 hover:bg-gray-100'
          } ${!link.url ? 'text-gray-400 cursor-not-allowed' : ''}`}
          disabled={!link.url}
        />
      ))}
    </div>
  );
  
  // Komponen Filter Pills
  const FilterPills = ({ activeFilter, onFilterChange }) => {
    const filters = ['Semua', 'Umum', 'Outing Class'];
    return (
      <div className="flex space-x-2">
        {filters.map((filter) => (
          <button
            key={filter}
            onClick={() => onFilterChange(filter)}
            className={`px-4 py-2 rounded-full text-sm font-semibold transition ${
              activeFilter === filter
                ? 'bg-green-600 text-white shadow'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            {filter}
          </button>
        ))}
      </div>
    );
  };
export default function JadwalKunjungan({ kunjungan, filters }) {
  const [selected, setSelected] = useState(null);
  const [editingItem, setEditingItem] = useState(null);
  // Local state for inputs, initialized from props
  const [searchValue, setSearchValue] = useState(filters.search || '');
  const [tipeFilter, setTipeFilter] = useState(filters.tipe || 'Semua');
  const { flash } = usePage().props;
  const { data, links, from } = kunjungan;

  // Debounced router call
  const debouncedFilter = useCallback(
    debounce((nextValue, filterValue) => {
      const query = {};
      if (nextValue) query.search = nextValue;
      if (filterValue && filterValue !== 'Semua') query.tipe = filterValue;
      
      router.get(route('kunjungan.jadwal'), query, {
        preserveState: true,
        replace: true,
      });
    }, 300),
    [] // useCallback ensures the debounced function is stable
  );

  const handleSearchChange = (e) => {
    const newSearch = e.target.value;
    setSearchValue(newSearch);
    debouncedFilter(newSearch, tipeFilter);
  };

  const handleFilterChange = (newTipe) => {
    setTipeFilter(newTipe);
    debouncedFilter(searchValue, newTipe);
  };

  useEffect(() => {
    if (flash?.success) {
      Swal.fire({ icon: 'success', title: 'Berhasil!', text: flash.success, confirmButtonColor: '#16a34a' });
    }
  }, [flash]);

  const handleDelete = (id) => {
    Swal.fire({
      title: 'Yakin ingin menghapus?',
      text: 'Data akan dihapus secara permanen!',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#6b7280',
      confirmButtonText: 'Ya, hapus',
      cancelButtonText: 'Batal',
    }).then((result) => {
      if (result.isConfirmed) {
        router.delete(route('kunjungan.destroy', id));
      }
    });
  };

  return (
    <>
      <Head title="Jadwal Kunjungan" />
      <div className="space-y-6">
        <div className="bg-white p-4 rounded-xl shadow-md space-y-4">
          <div className="flex flex-wrap justify-between items-center gap-4">
            <FilterPills activeFilter={tipeFilter} onFilterChange={handleFilterChange} />
            <div className="relative">
              <input
                type="text"
                value={searchValue}
                onChange={handleSearchChange}
                placeholder="Cari nama pelanggan..."
                className="pl-10 pr-4 py-2 border border-gray-300 rounded-full focus:ring-green-500 focus:border-green-500"
              />
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">🔍</span>
            </div>
          </div>
        </div>

        <div className="overflow-x-auto bg-white rounded-xl shadow-md">
          <table className="min-w-full text-sm text-left text-gray-700">
            <thead className="text-xs uppercase bg-green-100 text-green-800">
              <tr>
                <th className="px-4 py-3">No</th>
                <th className="px-4 py-3">Nama Pelanggan</th>
                <th className="px-4 py-3">Tanggal</th>
                <th className="px-4 py-3">Tipe</th>
                <th className="px-4 py-3">Peserta</th>
                <th className="px-4 py-3">Total Biaya</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3 text-center">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {data.map((item, index) => (
                <tr key={item.id} className="border-b hover:bg-gray-50">
                  <td className="px-4 py-2">{from + index}</td>
                  <td className="px-4 py-2 font-medium text-gray-900">{item.pelanggan?.nama}</td>
                  <td className="px-4 py-2">{item.tanggal}</td>
                  <td className="px-4 py-2">{item.tipe?.nama_tipe || '-'}</td>
                  <td className="px-4 py-2">{`${(item.jumlah_dewasa || 0) + (item.jumlah_anak || 0) + (item.jumlah_balita || 0)} Orang`}</td>
                  <td className="px-4 py-2">{new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(item.total_biaya)}</td>
                  <td className="px-4 py-2 capitalize">{item.status}</td>
                  <td className="px-4 py-2 flex items-center justify-center gap-2">
                    <button onClick={() => setSelected(item)} className="p-2 bg-gray-100 text-gray-600 hover:bg-gray-200 rounded-full transition" title="Detail">👁️</button>
                    <button onClick={() => setEditingItem(item)} className="p-2 bg-blue-100 text-blue-600 hover:bg-blue-200 rounded-full transition" title="Edit">✏️</button>
                    <button onClick={() => handleDelete(item.id)} className="p-2 bg-red-100 text-red-600 hover:bg-red-200 rounded-full transition" title="Hapus">🗑️</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <Pagination links={links} />

        {selected && <DetailModal item={selected} onClose={() => setSelected(null)} />}
        {editingItem && <EditModal item={editingItem} onClose={() => setEditingItem(null)} />}
      </div>
    </>
  );
}

JadwalKunjungan.layout = page => <KunjunganLayout children={page} />