import CustomerLayout from '@/Layouts/CustomerLayout';
import { useForm, usePage, Head } from '@inertiajs/react';
import { useEffect } from 'react';
import { motion } from 'framer-motion';
import { FiUser, FiPhone, FiCalendar, FiUsers, FiSend, FiCheckCircle, FiClipboard } from 'react-icons/fi';
import Swal from 'sweetalert2';

// Komponen InputField yang digunakan di form
const InputField = ({ id, label, type, value, onChange, error, icon, ...props }) => (
    <div className="space-y-2">
        <label htmlFor={id} className="block text-sm font-semibold text-gray-700">{label}</label>
        <div className="relative group">
            <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-green-500 group-focus-within:text-green-600 transition">
                {icon}
            </span>
            <input
                id={id}
                type={type}
                value={value}
                onChange={onChange}
                className={`block w-full pl-10 pr-3 py-3 rounded-xl border ${error ? 'border-red-500' : 'border-gray-300'} bg-white/60 backdrop-blur-md shadow-sm focus:border-green-500 focus:ring-2 focus:ring-green-400 transition text-sm`}
                {...props}
            />
        </div>
        {error && <div className="text-red-600 text-xs">{error}</div>}
    </div>
);

export default function Kunjungan({ auth, tipeKunjungan }) {
  // ... (kode form logic tetap sama)
  const { flash } = usePage().props;

  const { data, setData, post, processing, errors } = useForm({
    nama_lengkap: auth.pelanggan.nama || '',
    no_hp: '',
    tanggal_kunjungan: '',
    tipe_kunjungan_id: '',
    jumlah_pengunjung: 1,
  });

  useEffect(() => {
    if (flash.success) {
      Swal.fire({
        icon: 'success',
        title: 'Berhasil!',
        text: flash.success,
        confirmButtonColor: '#22c55e',
      });
    }
  }, [flash]);

// GANTI SELURUH FUNGSI handleSubmit ANDA DENGAN INI

// Ganti handleSubmit Anda dengan ini.
// Ubah hanya fungsi handleSubmit

const handleSubmit = (e) => {
    e.preventDefault();
    // PASTIKAN INI MEMANGGIL NAMA ROUTE YANG BENAR
    post(route('kunjungan.handle_form'), {
        preserveScroll: true,
    });
};


  return (
    <>
      <Head title="Jadwalkan Kunjungan" />

      <section className="relative h-[350px] sm:h-[450px] bg-cover bg-center" style={{ backgroundImage: 'url(https://images.unsplash.com/photo-1501004318641-b39e6451bec6?auto=format&fit=crop&w=1600&q=80)' }}>
        <div className="absolute inset-0 bg-gradient-to-r from-green-900/70 to-green-600/60"></div>
        <div className="relative z-10 max-w-4xl mx-auto text-center px-6 py-20 text-white">
          <motion.h1
            initial={{ opacity: 0, y: -40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-4xl sm:text-5xl font-extrabold mb-4 drop-shadow-lg"
          >
            Jadwalkan Kunjungan Anda
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 0.3 }}
            className="text-lg sm:text-xl opacity-90 max-w-2xl mx-auto"
          >
            Rasakan pengalaman seru menjelajahi kebun hidroponik modern dan temukan kesegaran sayuran langsung dari sumbernya.
          </motion.p>
        </div>
      </section>

      <main className="py-16 -mt-24 relative z-20">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6 }}
          className="max-w-3xl mx-auto px-6"
        >
          <div className="bg-white/80 backdrop-blur-xl p-10 rounded-3xl shadow-2xl border border-green-100">
            <div className="flex items-center justify-center mb-8 space-x-6 text-sm font-medium text-gray-600">
              <div className="flex items-center gap-2 text-green-600">
                <FiCheckCircle /> Isi Data
              </div>
              <span>➝</span>
              <div>Konfirmasi</div>
              <span>➝</span>
              <div>Selesai</div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <InputField
                  id="nama_lengkap"
                  label="Nama Lengkap"
                  type="text"
                  value={data.nama_lengkap}
                  onChange={e => setData('nama_lengkap', e.target.value)}
                  error={errors.nama_lengkap}
                  icon={<FiUser />}
                  required
                />
                <InputField
                  id="no_hp"
                  label="Nomor HP (WhatsApp)"
                  type="tel"
                  value={data.no_hp}
                  onChange={e => setData('no_hp', e.target.value)}
                  error={errors.no_hp}
                  icon={<FiPhone />}
                  placeholder="08xxxxxxxxxx"
                  required
                />
                <InputField
                  id="tanggal_kunjungan"
                  label="Tanggal Kunjungan"
                  type="date"
                  value={data.tanggal_kunjungan}
                  onChange={e => setData('tanggal_kunjungan', e.target.value)}
                  error={errors.tanggal_kunjungan}
                  icon={<FiCalendar />}
                  min={new Date().toISOString().split("T")[0]}
                  required
                />

                <div className="space-y-2">
                    <label htmlFor="tipe_kunjungan_id" className="block text-sm font-semibold text-gray-700">Tipe Kunjungan</label>
                    <div className="relative group">
                        <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-green-500 group-focus-within:text-green-600 transition">
                            <FiClipboard />
                        </span>
                        <select
                            id="tipe_kunjungan_id"
                            value={data.tipe_kunjungan_id}
                            onChange={e => setData('tipe_kunjungan_id', e.target.value)}
                            className="block w-full pl-10 pr-3 py-3 rounded-xl border border-gray-300 bg-white/60 backdrop-blur-md shadow-sm focus:border-green-500 focus:ring-2 focus:ring-green-400 transition text-sm"
                            required
                        >
                            <option value="">Pilih Tipe Kunjungan</option>
                            {tipeKunjungan.map(tipe => (
                                <option key={tipe.id} value={tipe.id}>
                                    {tipe.nama_tipe}
                                </option>
                            ))}
                        </select>
                    </div>
                    {errors.tipe_kunjungan_id && <div className="text-red-600 text-xs">{errors.tipe_kunjungan_id}</div>}
                </div>

                <div className="md:col-span-2">
                  <InputField
                    id="jumlah_pengunjung"
                    label="Jumlah Pengunjung"
                    type="number"
                    value={data.jumlah_pengunjung}
                    onChange={e => setData('jumlah_pengunjung', Number(e.target.value))}
                    error={errors.jumlah_pengunjung}
                    icon={<FiUsers />}
                    min="1"
                    required
                  />
                </div>
              </div>

              <div className="pt-6 text-center">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  type="submit"
                  disabled={processing}
                  className="inline-flex items-center justify-center gap-2 px-12 py-4 font-semibold rounded-2xl shadow-lg shadow-green-400/30 text-white bg-gradient-to-r from-green-500 via-green-600 to-green-700 hover:from-green-600 hover:to-green-800 focus:ring-4 focus:ring-green-300 disabled:opacity-50 transition-all"
                >
                  <FiSend className="text-lg" />
                  {processing ? 'Mengirim...' : 'Lanjut ke Konfirmasi'}
                </motion.button>
              </div>
            </form>
          </div>
        </motion.div>
      </main>
    </>
  );
}

Kunjungan.layout = page => <CustomerLayout auth={page.props.auth}>{page}</CustomerLayout>;
