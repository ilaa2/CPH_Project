import { Head, Link, useForm, usePage } from '@inertiajs/react';
import Mainbar from '@/Components/Bar/Mainbar';
import { useEffect, useMemo } from 'react';
import Select from 'react-select';
import InputError from '@/Components/InputError';
import InputLabel from '@/Components/InputLabel';
import TextInput from '@/Components/TextInput';
import PrimaryButton from '@/Components/PrimaryButton';
import SecondaryButton from '@/Components/SecondaryButton';

export default function CreateKunjungan() {
  const { pelanggan: pelangganList, tipe: tipeList } = usePage().props;

  const { data, setData, post, processing, errors, reset } = useForm({
    pelanggan_id: '',
    tipe_kunjungan_id: '',
    tanggal: '',
    jam: '',
    jumlah_dewasa: 0,
    jumlah_anak: 0,
    jumlah_balita: 0,
    total_biaya: 0,
    status: 'Dijadwalkan',
  });

  const pelangganOptions = pelangganList.map(p => ({ value: p.id, label: p.nama }));
  const tipeOptions = tipeList.map(t => ({ value: t.id, label: t.nama_tipe }));

  const selectedTipe = useMemo(() => {
    return tipeList.find(t => t.id === data.tipe_kunjungan_id);
  }, [data.tipe_kunjungan_id, tipeList]);

  // Reset jumlah pengunjung saat tipe berubah
  useEffect(() => {
    if (!selectedTipe) return;

    if (selectedTipe.nama_tipe === 'Outing Class') {
      setData(currentData => ({
        ...currentData,
        jumlah_dewasa: 0,
        jumlah_anak: 1, // Default 1 anak
        jumlah_balita: 0,
      }));
    } else if (selectedTipe.nama_tipe === 'Umum') {
      setData(currentData => ({
        ...currentData,
        jumlah_dewasa: 1, // Default 1 dewasa
        jumlah_anak: 0,
        jumlah_balita: 0,
      }));
    }
    reset('jumlah_dewasa', 'jumlah_anak', 'jumlah_balita');
  }, [selectedTipe]);

  // Kalkulasi biaya otomatis
  const calculatedBiaya = useMemo(() => {
    if (!selectedTipe) return 0;

    let biaya = 0;
    if (selectedTipe.nama_tipe === 'Umum') {
      const totalOrangBayar = (parseInt(data.jumlah_dewasa, 10) || 0) + (parseInt(data.jumlah_anak, 10) || 0);
      biaya = totalOrangBayar * 10000;
    } else if (selectedTipe.nama_tipe === 'Outing Class') {
      const anak = parseInt(data.jumlah_anak, 10) || 0;
      if (anak < 30) {
        biaya = 300000;
      } else {
        biaya = anak * 10000;
      }
    }
    return biaya;
  }, [selectedTipe, data.jumlah_dewasa, data.jumlah_anak]);

  // Update total_biaya state hanya jika belum diubah manual
  useEffect(() => {
    setData('total_biaya', calculatedBiaya);
  }, [calculatedBiaya]);


  const handleSubmit = (e) => {
    e.preventDefault();
    post(route('kunjungan.store'));
  };

  const customStyles = {
    control: (provided) => ({ ...provided, borderRadius: '0.5rem', minHeight: '42px' }),
    menu: (provided) => ({ ...provided, borderRadius: '0.5rem', zIndex: 20 }),
  };

  return (
    <Mainbar header={<h2 className="text-xl font-semibold text-gray-800">Tambah Kunjungan Manual</h2>}>
      <Head title="Tambah Kunjungan" />

      <div className="p-6 max-w-2xl mx-auto">
        <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow-md space-y-6 p-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <InputLabel htmlFor="pelanggan_id" value="Pelanggan" />
              <Select
                id="pelanggan_id"
                options={pelangganOptions}
                styles={customStyles}
                onChange={(option) => setData('pelanggan_id', option.value)}
                placeholder="-- Pilih Pelanggan --"
                className="mt-1"
              />
              <InputError message={errors.pelanggan_id} className="mt-2" />
            </div>
            <div>
              <InputLabel htmlFor="tipe_kunjungan_id" value="Tipe Kunjungan" />
              <Select
                id="tipe_kunjungan_id"
                options={tipeOptions}
                styles={customStyles}
                onChange={(option) => setData('tipe_kunjungan_id', option.value)}
                placeholder="-- Pilih Tipe --"
                className="mt-1"
              />
              <InputError message={errors.tipe_kunjungan_id} className="mt-2" />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <InputLabel htmlFor="tanggal" value="Tanggal" />
              <TextInput id="tanggal" type="date" value={data.tanggal} onChange={(e) => setData('tanggal', e.target.value)} className="w-full mt-1" />
              <InputError message={errors.tanggal} className="mt-2" />
            </div>
            <div>
              <InputLabel htmlFor="jam" value="Jam" />
              <TextInput id="jam" type="time" value={data.jam} onChange={(e) => setData('jam', e.target.value)} className="w-full mt-1" />
              <InputError message={errors.jam} className="mt-2" />
            </div>
          </div>

          {/* -- Input Jumlah Pengunjung Dinamis -- */}
          {selectedTipe && (
            <div className="pt-4 border-t">
              <h3 className="text-lg font-medium text-gray-800 mb-2">Detail Peserta</h3>
              {selectedTipe.nama_tipe === 'Umum' && (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div>
                    <InputLabel htmlFor="jumlah_dewasa" value="Jumlah Dewasa" />
                    <TextInput id="jumlah_dewasa" type="number" min="0" value={data.jumlah_dewasa} onChange={(e) => setData('jumlah_dewasa', e.target.value)} className="w-full mt-1" />
                    <InputError message={errors.jumlah_dewasa} className="mt-2" />
                  </div>
                  <div>
                    <InputLabel htmlFor="jumlah_anak" value="Jumlah Anak (>2 thn)" />
                    <TextInput id="jumlah_anak" type="number" min="0" value={data.jumlah_anak} onChange={(e) => setData('jumlah_anak', e.target.value)} className="w-full mt-1" />
                    <InputError message={errors.jumlah_anak} className="mt-2" />
                  </div>
                  <div>
                    <InputLabel htmlFor="jumlah_balita" value="Jumlah Balita (0-2 thn)" />
                    <TextInput id="jumlah_balita" type="number" min="0" value={data.jumlah_balita} onChange={(e) => setData('jumlah_balita', e.target.value)} className="w-full mt-1" />
                    <InputError message={errors.jumlah_balita} className="mt-2" />
                  </div>
                </div>
              )}
              {selectedTipe.nama_tipe === 'Outing Class' && (
                <div>
                  <InputLabel htmlFor="jumlah_anak" value="Jumlah Anak" />
                  <TextInput id="jumlah_anak" type="number" min="1" value={data.jumlah_anak} onChange={(e) => setData('jumlah_anak', e.target.value)} className="w-full mt-1" />
                  <InputError message={errors.jumlah_anak} className="mt-2" />
                </div>
              )}
            </div>
          )}

          <div className="pt-4 border-t">
            <InputLabel htmlFor="total_biaya" value="Total Biaya (Rp)" />
            <TextInput
              id="total_biaya"
              type="number"
              value={data.total_biaya}
              onChange={(e) => setData('total_biaya', e.target.value)}
              className="w-full mt-1 text-lg font-semibold"
              placeholder="Akan terisi otomatis"
            />
            <p className="text-xs text-gray-500 mt-1">Biaya akan terisi otomatis, namun Anda bisa mengubahnya jika ada harga khusus.</p>
            <InputError message={errors.total_biaya} className="mt-2" />
          </div>

          <div className="flex justify-end gap-4 pt-4">
            <Link href={route('kunjungan.jadwal')}>
              <SecondaryButton>Batal</SecondaryButton>
            </Link>
            <PrimaryButton disabled={processing}>
              {processing ? 'Menyimpan...' : 'Simpan Kunjungan'}
            </PrimaryButton>
          </div>
        </form>
      </div>
    </Mainbar>
  );
}
