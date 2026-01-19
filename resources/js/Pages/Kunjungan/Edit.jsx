import Mainbar from '@/Components/Bar/Mainbar';
import { Head, useForm, Link } from '@inertiajs/react';
import TextInput from '@/Components/TextInput';
import InputLabel from '@/Components/InputLabel';
import InputError from '@/Components/InputError';
import PrimaryButton from '@/Components/PrimaryButton';
import SecondaryButton from '@/Components/SecondaryButton';

export default function Edit({ auth, kunjungan }) {
    const { data, setData, put, processing, errors } = useForm({
        pelanggan_id: kunjungan.pelanggan_id || '',
        tipe_id: kunjungan.tipe_id || '',
        tanggal: kunjungan.tanggal || '',
        jam: kunjungan.jam || '',
        jumlah_dewasa: kunjungan.jumlah_dewasa || 0,
        jumlah_anak: kunjungan.jumlah_anak || 0,
        jumlah_balita: kunjungan.jumlah_balita || 0,
        total_biaya: kunjungan.total_biaya || 0,
        status: kunjungan.status || 'Dijadwalkan',
    });

    const submit = (e) => {
        e.preventDefault();
        put(route('admin.kunjungan.update', kunjungan.id));
    };

    return (
        <Mainbar
            header={<h2 className="font-semibold text-xl text-gray-800 leading-tight">Edit Kunjungan</h2>}
        >
            <Head title="Edit Kunjungan" />

            <div className="py-12">
                <div className="max-w-2xl mx-auto sm:px-6 lg:px-8">
                    <div className="bg-white overflow-hidden shadow-sm sm:rounded-lg">
                        <div className="p-8 text-gray-900">
                            <h3 className="text-lg font-medium text-gray-900 mb-6">
                                Form Edit Status Kunjungan
                            </h3>
                            <form onSubmit={submit} className="space-y-6">
                                <div>
                                    <InputLabel htmlFor="pelanggan_id" value="Pelanggan" />
                                    <select
                                        id="pelanggan_id"
                                        value={data.pelanggan_id}
                                        className="mt-1 block w-full border-gray-300 focus:border-green-500 focus:ring-green-500 rounded-md shadow-sm"
                                        onChange={(e) => setData('pelanggan_id', e.target.value)}
                                    >
                                        <option value="">Pilih Pelanggan</option>
                                        {pelanggan?.map(p => <option key={p.id} value={p.id}>{p.nama}</option>)}
                                    </select>
                                    <InputError message={errors.pelanggan_id} className="mt-2" />
                                </div>

                                <div>
                                    <InputLabel htmlFor="tipe_id" value="Tipe Kunjungan" />
                                    <select
                                        id="tipe_id"
                                        value={data.tipe_id}
                                        className="mt-1 block w-full border-gray-300 focus:border-green-500 focus:ring-green-500 rounded-md shadow-sm"
                                        onChange={(e) => setData('tipe_id', e.target.value)}
                                    >
                                        <option value="">Pilih Tipe</option>
                                        {tipe?.map(t => <option key={t.id} value={t.id}>{t.nama_tipe}</option>)}
                                    </select>
                                    <InputError message={errors.tipe_id} className="mt-2" />
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <InputLabel htmlFor="tanggal" value="Tanggal" />
                                        <TextInput id="tanggal" type="date" value={data.tanggal} onChange={e => setData('tanggal', e.target.value)} className="mt-1 block w-full" />
                                        <InputError message={errors.tanggal} className="mt-2" />
                                    </div>
                                    <div>
                                        <InputLabel htmlFor="jam" value="Jam" />
                                        <TextInput id="jam" type="time" value={data.jam} onChange={e => setData('jam', e.target.value)} className="mt-1 block w-full" />
                                        <InputError message={errors.jam} className="mt-2" />
                                    </div>
                                </div>

                                <div className="grid grid-cols-3 gap-4">
                                    <div>
                                        <InputLabel value="Dewasa" />
                                        <TextInput type="number" value={data.jumlah_dewasa} onChange={e => setData('jumlah_dewasa', e.target.value)} className="mt-1 block w-full" />
                                    </div>
                                    <div>
                                        <InputLabel value="Anak" />
                                        <TextInput type="number" value={data.jumlah_anak} onChange={e => setData('jumlah_anak', e.target.value)} className="mt-1 block w-full" />
                                    </div>
                                    <div>
                                        <InputLabel value="Balita" />
                                        <TextInput type="number" value={data.jumlah_balita} onChange={e => setData('jumlah_balita', e.target.value)} className="mt-1 block w-full" />
                                    </div>
                                </div>

                                <div>
                                    <InputLabel value="Total Biaya" />
                                    <TextInput type="number" value={data.total_biaya} onChange={e => setData('total_biaya', e.target.value)} className="mt-1 block w-full font-bold text-green-600" />
                                </div>

                                <div>
                                    <InputLabel htmlFor="status" value="Status Kunjungan" />
                                    <select
                                        id="status"
                                        name="status"
                                        value={data.status}
                                        className="mt-1 block w-full border-gray-300 focus:border-green-500 focus:ring-green-500 rounded-md shadow-sm"
                                        onChange={(e) => setData('status', e.target.value)}
                                    >
                                        <option value="Dijadwalkan">Dijadwalkan</option>
                                        <option value="Selesai">Selesai</option>
                                    </select>
                                    <InputError message={errors.status} className="mt-2" />
                                </div>

                                <div className="border-t border-gray-200 my-6"></div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4 text-sm">
                                    <div>
                                        <p className="font-semibold text-gray-600">Pelanggan</p>
                                        <p>{kunjungan.pelanggan.nama}</p>
                                    </div>
                                    <div>
                                        <p className="font-semibold text-gray-600">Tipe Kunjungan</p>
                                        <p>{kunjungan.tipe.nama_tipe}</p>
                                    </div>
                                    <div>
                                        <p className="font-semibold text-gray-600">Tanggal & Jam</p>
                                        <p>{kunjungan.tanggal} pukul {kunjungan.jam}</p>
                                    </div>
                                    <div>
                                        <p className="font-semibold text-gray-600">Total Biaya</p>
                                        <p>Rp {parseInt(kunjungan.total_biaya).toLocaleString('id-ID')}</p>
                                    </div>
                                    <div className="md:col-span-2 grid grid-cols-3 gap-4">
                                        {kunjungan.tipe.nama_tipe === 'Outing Class' ? (
                                            <div className="col-span-3">
                                                <p className="font-semibold text-gray-600">Jumlah Anak</p>
                                                <p>{kunjungan.jumlah_anak} Orang</p>
                                            </div>
                                        ) : (
                                            <>
                                                <div>
                                                    <p className="font-semibold text-gray-600">Dewasa</p>
                                                    <p>{kunjungan.jumlah_dewasa} Orang</p>
                                                </div>
                                                <div>
                                                    <p className="font-semibold text-gray-600">Anak</p>
                                                    <p>{kunjungan.jumlah_anak} Orang</p>
                                                </div>
                                                <div>
                                                    <p className="font-semibold text-gray-600">Balita</p>
                                                    <p>{kunjungan.jumlah_balita} Orang</p>
                                                </div>
                                            </>
                                        )}
                                    </div>
                                </div>


                                <div className="flex items-center justify-end mt-8">
                                    <Link href={route('admin.kunjungan.jadwal')}>
                                        <SecondaryButton className="ms-4" disabled={processing}>
                                            Batal
                                        </SecondaryButton>
                                    </Link>
                                    <PrimaryButton className="ms-4 bg-green-600 hover:bg-green-700" disabled={processing}>
                                        Simpan Perubahan
                                    </PrimaryButton>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            </div>
        </Mainbar>
    );
}