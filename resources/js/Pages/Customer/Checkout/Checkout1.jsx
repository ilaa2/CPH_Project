import { useState, useCallback } from 'react';
import { Head, Link, useForm } from '@inertiajs/react';
import CheckoutStepper from '@/Components/CheckoutStepper';
import CustomerLayout from '@/Layouts/CustomerLayout';
import { FiUser, FiPhone, FiMapPin } from 'react-icons/fi';
import AsyncSelect from 'react-select/async';

export default function Checkout1({ auth, savedAddress, pelanggan }) {
    // Initial data from session or empty
    const { data, setData, post, processing, errors } = useForm({
        nama: savedAddress?.nama || pelanggan?.nama || auth?.user?.name || '',
        telepon: savedAddress?.telepon || pelanggan?.telepon || auth?.user?.telepon || '',
        alamat: savedAddress?.alamat || '',

        // Biteship Data
        area_id: savedAddress?.area_id || '',
        province_name: savedAddress?.province_name || '',
        city_name: savedAddress?.city_name || '',
        district_name: savedAddress?.district_name || '',
        zip_code: savedAddress?.zip_code || '',

        // Store full object for UI restoring
        full_area_label: savedAddress?.full_area_label || '',
    });

    // Biteship Search Function
    const loadOptions = useCallback(async (inputValue) => {
        if (inputValue.length < 3) return [];
        try {
            const response = await fetch(`/api/biteship/maps/areas?input=${inputValue}`);
            const result = await response.json();

            return result.map(area => ({
                label: `${area.name}, ${area.administrative_division_level_2_name}, ${area.administrative_division_level_1_name} (${area.postal_code})`,
                value: area.id,
                details: area
            }));
        } catch (error) {
            console.error('Biteship search error:', error);
            return [];
        }
    }, []);

    // Handle Selection
    const handleAreaChange = (selectedOption) => {
        if (selectedOption) {
            const area = selectedOption.details;
            setData(prev => ({
                ...prev,
                area_id: area.id,
                district_name: area.name, // Kecamatan/District name from Biteship 'name'
                city_name: area.administrative_division_level_2_name,
                province_name: area.administrative_division_level_1_name,
                zip_code: area.postal_code,
                full_area_label: selectedOption.label
            }));
        } else {
            // Clear if cleared
            setData(prev => ({
                ...prev,
                area_id: '',
                district_name: '',
                city_name: '',
                province_name: '',
                zip_code: '',
                full_area_label: ''
            }));
        }
    };

    const submit = (e) => {
        e.preventDefault();
        post(route('checkout.save-address'));
    };

    const isFormValid = data.nama && data.telepon && data.alamat && data.area_id;

    // Custom Styles for React Select to match Tailwind
    const customStyles = {
        control: (base, state) => ({
            ...base,
            borderRadius: '0.5rem',
            borderColor: state.isFocused ? '#22c55e' : '#e5e7eb', // Green-500 focus
            boxShadow: state.isFocused ? '0 0 0 1px #22c55e' : null,
            padding: '2px',
            '&:hover': {
                borderColor: '#22c55e'
            }
        }),
        option: (base, state) => ({
            ...base,
            backgroundColor: state.isSelected ? '#22c55e' : state.isFocused ? '#dcfce7' : null, // Green-500 selected, Green-100 focused
            color: state.isSelected ? 'white' : '#1f2937',
            cursor: 'pointer'
        })
    };

    return (
        <CustomerLayout auth={auth}>
            <Head title="Checkout - Alamat Pengiriman" />

            <div className="py-12 bg-gray-50 min-h-screen">
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">

                    <CheckoutStepper currentStep={2} />

                    <div className="mt-8 max-w-3xl mx-auto">
                        <div className="bg-white overflow-hidden shadow-sm sm:rounded-lg border border-gray-100">
                            <div className="p-6 bg-white border-b border-gray-200">

                                <div className="mb-6">
                                    <h2 className="text-xl font-bold text-gray-800">Alamat Pengiriman</h2>
                                    <p className="text-sm text-gray-500">Lengkapi data penerima dan alamat tujuan.</p>
                                </div>

                                <form onSubmit={submit} className="space-y-6">

                                    {/* Nama & Telepon */}
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">Nama Penerima</label>
                                            <div className="relative">
                                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                                    <FiUser className="text-gray-400" />
                                                </div>
                                                <input
                                                    type="text"
                                                    value={data.nama}
                                                    onChange={(e) => setData('nama', e.target.value)}
                                                    className="pl-10 block w-full rounded-lg border-gray-300 shadow-sm focus:ring-green-500 focus:border-green-500 transition-colors"
                                                    placeholder="Nama Lengkap"
                                                />
                                            </div>
                                            {errors.nama && <p className="text-red-500 text-xs mt-1">{errors.nama}</p>}
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">Nomor Telepon</label>
                                            <div className="relative">
                                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                                    <FiPhone className="text-gray-400" />
                                                </div>
                                                <input
                                                    type="text"
                                                    value={data.telepon}
                                                    onChange={(e) => setData('telepon', e.target.value)}
                                                    className="pl-10 block w-full rounded-lg border-gray-300 shadow-sm focus:ring-green-500 focus:border-green-500 transition-colors"
                                                    placeholder="08xxxxxxxxxx"
                                                />
                                            </div>
                                            {errors.telepon && <p className="text-red-500 text-xs mt-1">{errors.telepon}</p>}
                                        </div>
                                    </div>

                                    {/* Biteship Location Search */}
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Cari Kecamatan / Kota <span className="text-red-500">*</span>
                                        </label>
                                        <AsyncSelect
                                            cacheOptions
                                            loadOptions={loadOptions}
                                            defaultOptions
                                            onChange={handleAreaChange}
                                            styles={customStyles}
                                            placeholder="Ketik nama kecamatan atau kota..."
                                            noOptionsMessage={() => "Ketik minimal 3 huruf untuk mencari..."}
                                            loadingMessage={() => "Mencari data wilayah..."}
                                            defaultValue={data.area_id ? { label: data.full_area_label, value: data.area_id } : null}
                                            classNames={{
                                                control: () => 'text-sm',
                                            }}
                                        />
                                        <p className="text-xs text-gray-500 mt-1">
                                            Data wilayah disediakan oleh Biteship. Pilih dari daftar yang muncul.
                                        </p>
                                        {errors.area_id && <p className="text-red-500 text-xs mt-1">{errors.area_id}</p>}
                                    </div>

                                    {/* Auto-filled Fields (Read Only but visible) */}
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-gray-50 p-4 rounded-lg border border-gray-200">
                                        <div>
                                            <label className="block text-xs font-medium text-gray-500 uppercase">Provinsi</label>
                                            <p className="font-medium text-gray-800">{data.province_name || '-'}</p>
                                        </div>
                                        <div>
                                            <label className="block text-xs font-medium text-gray-500 uppercase">Kota/Kabupaten</label>
                                            <p className="font-medium text-gray-800">{data.city_name || '-'}</p>
                                        </div>
                                        <div>
                                            <label className="block text-xs font-medium text-gray-500 uppercase">Kecamatan</label>
                                            <p className="font-medium text-gray-800">{data.district_name || '-'}</p>
                                        </div>
                                        <div>
                                            <label className="block text-xs font-medium text-gray-500 uppercase">Kode Pos</label>
                                            <p className="font-medium text-gray-800">{data.zip_code || '-'}</p>
                                        </div>
                                    </div>


                                    {/* Alamat Lengkap */}
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">Alamat Lengkap (Jalan, No. Rumah, RT/RW)</label>
                                        <div className="relative">
                                            <div className="absolute top-3 left-3 flex items-start pointer-events-none">
                                                <FiMapPin className="text-gray-400 mt-0.5" />
                                            </div>
                                            <textarea
                                                value={data.alamat}
                                                onChange={(e) => setData('alamat', e.target.value)}
                                                rows="3"
                                                className="pl-10 block w-full rounded-lg border-gray-300 shadow-sm focus:ring-green-500 focus:border-green-500 transition-colors"
                                                placeholder="Contoh: Jl. Sudirman No. 45, RT 01/RW 02"
                                            ></textarea>
                                        </div>
                                        {errors.alamat && <p className="text-red-500 text-xs mt-1">{errors.alamat}</p>}
                                    </div>

                                    <div className="flex items-center justify-end pt-4 border-t border-gray-100">
                                        <Link
                                            href={route().has('checkout.method') ? route('checkout.method') : route('checkout.index')}
                                            className="text-gray-600 hover:text-gray-900 font-medium mr-6 transition-colors"
                                        >
                                            Kembali
                                        </Link>

                                        <button
                                            type="submit"
                                            disabled={processing || !isFormValid}
                                            className={`
                                                flex items-center px-6 py-3 rounded-xl font-semibold text-white shadow-lg transition-all
                                                ${processing || !isFormValid
                                                    ? 'bg-gray-400 cursor-not-allowed'
                                                    : 'bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 hover:shadow-green-500/30 transform hover:-translate-y-0.5'
                                                }
                                            `}
                                        >
                                            {processing ? 'Menyimpan...' : 'Lanjut ke Ongkir'}
                                        </button>
                                    </div>
                                </form>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </CustomerLayout>
    );
}