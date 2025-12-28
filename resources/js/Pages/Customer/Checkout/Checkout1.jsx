import { Head, useForm, router } from '@inertiajs/react';
import { SiteHeader, FooterNote } from '@/Layouts/CustomerLayout';
import React, { useState, useEffect } from 'react';
import axios from 'axios';

export default function Checkout1({ pelanggan }) {
    const { data, setData, post, processing, errors } = useForm({
        nama: pelanggan?.nama || '',
        telepon: pelanggan?.telepon || '',
        alamat: pelanggan?.alamat || '',
        
        province_id: '',
        province_name: '',
        city_id: '',
        city_name: '',
        district_id: '',
        district_name: '',
        subdistrict_id: '',
        subdistrict_name: '',
        zip_code: '',
    });

    const [provinces, setProvinces] = useState([]);
    const [cities, setCities] = useState([]);
    const [districts, setDistricts] = useState([]);
    const [subdistricts, setSubdistricts] = useState([]);
    const [isLoading, setIsLoading] = useState({ provinces: false, cities: false, districts: false, subdistricts: false });

    // Fetch provinces on component mount
    useEffect(() => {
        setIsLoading(prev => ({ ...prev, provinces: true }));
        axios.get(route('api.locations.provinces'))
            .then(response => setProvinces(response.data))
            .catch(error => console.error("Error fetching provinces:", error))
            .finally(() => setIsLoading(prev => ({ ...prev, provinces: false })));
    }, []);

    // Fetch cities when province changes
    useEffect(() => {
        if (data.province_id) {
            setIsLoading(prev => ({ ...prev, cities: true }));
            setCities([]);
            setDistricts([]);
            setSubdistricts([]);
            setData(data => ({ ...data, city_id: '', district_id: '', subdistrict_id: '', zip_code: '' }));
            
            axios.get(route('api.locations.cities', { provinceId: data.province_id }))
                .then(response => setCities(response.data))
                .catch(error => console.error("Error fetching cities:", error))
                .finally(() => setIsLoading(prev => ({ ...prev, cities: false })));
        }
    }, [data.province_id]);

    // Fetch districts when city changes
    useEffect(() => {
        if (data.city_id) {
            setIsLoading(prev => ({ ...prev, districts: true }));
            setDistricts([]);
            setSubdistricts([]);
            setData(data => ({ ...data, district_id: '', subdistrict_id: '', zip_code: '' }));

            axios.get(route('api.locations.districts', { cityId: data.city_id }))
                .then(response => setDistricts(response.data))
                .catch(error => console.error("Error fetching districts:", error))
                .finally(() => setIsLoading(prev => ({ ...prev, districts: false })));
        }
    }, [data.city_id]);

    // Fetch subdistricts when district changes
    useEffect(() => {
        if (data.district_id) {
            setIsLoading(prev => ({ ...prev, subdistricts: true }));
            setSubdistricts([]);
            setData(data => ({ ...data, subdistrict_id: '', zip_code: '' }));

            axios.get(route('api.locations.subdistricts', { districtId: data.district_id }))
                .then(response => setSubdistricts(response.data))
                .catch(error => console.error("Error fetching subdistricts:", error))
                .finally(() => setIsLoading(prev => ({ ...prev, subdistricts: false })));
        }
    }, [data.district_id]);

    const handleSelectChange = (e, type) => {
        const selectedId = e.target.value;
        const selectedName = e.target.options[e.target.selectedIndex].text;

        if (type === 'province') {
            setData({ ...data, province_id: selectedId, province_name: selectedName });
        } else if (type === 'city') {
            setData({ ...data, city_id: selectedId, city_name: selectedName });
        } else if (type === 'district') {
            setData({ ...data, district_id: selectedId, district_name: selectedName });
        } else if (type === 'subdistrict') {
            const selectedOption = subdistricts.find(s => s.id.toString() === selectedId);
            setData({ 
                ...data, 
                subdistrict_id: selectedId, 
                subdistrict_name: selectedName,
                zip_code: selectedOption?.zip_code || ''
            });
        }
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        post(route('checkout.saveAddress'), {
            onSuccess: () => router.visit(route('checkout.shipping')),
        });
    };

    return (
        <>
            <Head title="Checkout - Alamat Pengiriman" />
            <SiteHeader auth={{ user: pelanggan }} />

            <main className="bg-gray-50 min-h-screen py-10">
                <div className="max-w-4xl mx-auto px-4">
                    <div className="flex items-center justify-center mb-8">
                        <div className="flex items-center text-green-600">
                            <div className="rounded-full border-2 border-green-600 bg-white text-green-600 w-8 h-8 flex items-center justify-center font-bold">1</div>
                            <span className="font-semibold ml-2">Alamat</span>
                        </div>
                        <div className="flex-auto border-t-2 border-gray-300 mx-4"></div>
                        <div className="flex items-center text-gray-500">
                            <div className="rounded-full border-2 border-gray-300 w-8 h-8 flex items-center justify-center">2</div>
                            <span className="font-medium ml-2">Pengiriman</span>
                        </div>
                        <div className="flex-auto border-t-2 border-gray-300 mx-4"></div>
                        <div className="flex items-center text-gray-500">
                            <div className="rounded-full border-2 border-gray-300 w-8 h-8 flex items-center justify-center">3</div>
                            <span className="font-medium ml-2">Pembayaran</span>
                        </div>
                    </div>

                    <div className="bg-white p-6 sm:p-8 rounded-lg shadow-md">
                        <h1 className="text-2xl font-bold mb-6 text-gray-800">Langkah 1: Alamat Pengiriman</h1>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            {/* Nama, Telepon, Alamat Lengkap (Sama seperti sebelumnya) */}
                            <div>
                                <label htmlFor="nama" className="block font-medium text-gray-700">Nama Lengkap</label>
                                <input id="nama" type="text" value={data.nama} onChange={(e) => setData('nama', e.target.value)} className="w-full border-gray-300 rounded-md shadow-sm mt-1 focus:ring-green-500 focus:border-green-500" required />
                                {errors.nama && <div className="text-red-500 text-sm mt-1">{errors.nama}</div>}
                            </div>
                            <div>
                                <label htmlFor="telepon" className="block font-medium text-gray-700">Nomor Telepon</label>
                                <input id="telepon" type="text" value={data.telepon} onChange={(e) => setData('telepon', e.target.value)} className="w-full border-gray-300 rounded-md shadow-sm mt-1 focus:ring-green-500 focus:border-green-500" required />
                                {errors.telepon && <div className="text-red-500 text-sm mt-1">{errors.telepon}</div>}
                            </div>
                            <div>
                                <label htmlFor="alamat" className="block font-medium text-gray-700">Alamat Lengkap (Nama Jalan, Gedung, No. Rumah)</label>
                                <textarea id="alamat" value={data.alamat} onChange={(e) => setData('alamat', e.target.value)} className="w-full border-gray-300 rounded-md shadow-sm mt-1 focus:ring-green-500 focus:border-green-500" rows="3" placeholder="Contoh: Jl. Merdeka No. 17, RT 01/RW 02" required />
                                {errors.alamat && <div className="text-red-500 text-sm mt-1">{errors.alamat}</div>}
                            </div>

                            {/* Dropdown Dinamis */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label htmlFor="provinsi" className="block font-medium text-gray-700">Provinsi</label>
                                    <select id="provinsi" value={data.province_id} onChange={(e) => handleSelectChange(e, 'province')} className="w-full border-gray-300 rounded-md shadow-sm mt-1 focus:ring-green-500 focus:border-green-500" required disabled={isLoading.provinces}>
                                        <option value="">{isLoading.provinces ? 'Memuat...' : 'Pilih Provinsi'}</option>
                                        {provinces.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                                    </select>
                                    {errors.province_id && <div className="text-red-500 text-sm mt-1">{errors.province_id}</div>}
                                </div>
                                <div>
                                    <label htmlFor="kota" className="block font-medium text-gray-700">Kota / Kabupaten</label>
                                    <select id="kota" value={data.city_id} onChange={(e) => handleSelectChange(e, 'city')} className="w-full border-gray-300 rounded-md shadow-sm mt-1 focus:ring-green-500 focus:border-green-500" required disabled={!data.province_id || isLoading.cities}>
                                        <option value="">{isLoading.cities ? 'Memuat...' : 'Pilih Kota/Kabupaten'}</option>
                                        {cities.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                                    </select>
                                    {errors.city_id && <div className="text-red-500 text-sm mt-1">{errors.city_id}</div>}
                                </div>
                                <div>
                                    <label htmlFor="kecamatan" className="block font-medium text-gray-700">Kecamatan</label>
                                    <select id="kecamatan" value={data.district_id} onChange={(e) => handleSelectChange(e, 'district')} className="w-full border-gray-300 rounded-md shadow-sm mt-1 focus:ring-green-500 focus:border-green-500" required disabled={!data.city_id || isLoading.districts}>
                                        <option value="">{isLoading.districts ? 'Memuat...' : 'Pilih Kecamatan'}</option>
                                        {districts.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
                                    </select>
                                    {errors.district_id && <div className="text-red-500 text-sm mt-1">{errors.district_id}</div>}
                                </div>
                                <div>
                                    <label htmlFor="kelurahan" className="block font-medium text-gray-700">Kelurahan</label>
                                    <select id="kelurahan" value={data.subdistrict_id} onChange={(e) => handleSelectChange(e, 'subdistrict')} className="w-full border-gray-300 rounded-md shadow-sm mt-1 focus:ring-green-500 focus:border-green-500" required disabled={!data.district_id || isLoading.subdistricts}>
                                        <option value="">{isLoading.subdistricts ? 'Memuat...' : 'Pilih Kelurahan'}</option>
                                        {subdistricts.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                                    </select>
                                    {errors.subdistrict_id && <div className="text-red-500 text-sm mt-1">{errors.subdistrict_id}</div>}
                                </div>
                            </div>
                            <div>
                                <label htmlFor="kode_pos" className="block font-medium text-gray-700">Kode Pos</label>
                                <input id="kode_pos" type="text" value={data.zip_code} className="w-full border-gray-300 rounded-md shadow-sm mt-1 bg-gray-100" readOnly placeholder="Akan terisi otomatis" />
                            </div>

                            <div className="pt-4">
                                <button type="submit" disabled={processing || !data.subdistrict_id} className="w-full bg-green-600 text-white font-bold py-3 px-4 rounded-lg hover:bg-green-700 disabled:opacity-50 transition-colors">
                                    {processing ? 'Menyimpan...' : 'Lanjut ke Pengiriman →'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            </main>
            <FooterNote />
        </>
    );
}