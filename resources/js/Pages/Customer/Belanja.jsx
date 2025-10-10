import { Head, Link, router } from '@inertiajs/react'; // DIUBAH: Hapus useForm
import { GiFruitTree, GiHerbsBundle } from "react-icons/gi";
import { VscChecklist } from "react-icons/vsc";
import { FaCartPlus } from 'react-icons/fa';
import React, { useState } from 'react'; // DIUBAH: Tambah useState
import CustomerLayout from '@/Layouts/CustomerLayout';
import Swal from 'sweetalert2';

// Komponen Utama Halaman Belanja
export default function Belanja({ auth, products, filters }) {

    const FilterButton = ({ categoryId, label, icon }) => (
        <button
            onClick={() => router.get(route('belanja.index', { category: categoryId }), {}, { preserveState: true })}
            className={`flex items-center gap-3 px-4 py-2 rounded-full border transition-colors ${filters.kategori == categoryId ? 'bg-green-600 text-white border-green-600' : 'bg-white text-gray-700 border-gray-200 hover:bg-green-50'}`}
        >
            {icon}
            <span className="text-sm font-semibold">{label}</span>
        </button>
    );

    // DITAMBAHKAN: Logika handleAddToCart dipindah ke sini, meniru DashboardCust.jsx
    const handleAddToCart = (product) => {
        if (!auth.pelanggan) {
            Swal.fire({
                title: 'Anda Belum Login',
                text: "Silakan login terlebih dahulu untuk menambahkan produk ke keranjang.",
                icon: 'warning',
                showCancelButton: true,
                confirmButtonColor: '#16a34a',
                cancelButtonColor: '#d33',
                confirmButtonText: 'Login Sekarang',
                cancelButtonText: 'Nanti Saja'
            }).then((result) => {
                if (result.isConfirmed) {
                    router.visit(route('login'));
                }
            });
            return;
        }

        router.post(route('cart.store'), { product_id: product.id }, {
            preserveScroll: true,
            onSuccess: () => {
                Swal.fire({
                    toast: true,
                    position: 'top-end',
                    icon: 'success',
                    title: `${product.nama} ditambahkan!`,
                    showConfirmButton: false,
                    timer: 2000,
                });
            },
            onError: (errors) => {
                Swal.fire({
                    toast: true,
                    position: 'top-end',
                    icon: 'error',
                    title: 'Gagal menambahkan produk.',
                    text: Object.values(errors)[0] || '',
                    showConfirmButton: false,
                    timer: 3000,
                });
            }
        });
    };

    return (
        <>
            <Head title="Belanja" />
            <div className="bg-white">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
                    <div className="text-center mb-12">
                        <h1 className="text-4xl font-extrabold text-green-800 tracking-tight">Jelajahi Produk Segar Kami</h1>
                        <p className="mt-4 max-w-2xl mx-auto text-lg text-gray-500">
                            Pilih sayuran hidroponik favorit Anda yang ditanam secara lokal dan bebas pestisida.
                        </p>
                    </div>

                    <div className="flex justify-center items-center gap-4 mb-10 flex-wrap">
                        <FilterButton categoryId="" label="Semua Produk" icon={<VscChecklist size={20} />} />
                        <FilterButton categoryId="1" label="Sayuran Daun" icon={<GiHerbsBundle size={20} />} />
                        <FilterButton categoryId="2" label="Sayuran Buah" icon={<GiFruitTree size={20} />} />
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6">
                        {products.length > 0 ? (
                            products.map((product) => (
                                <ProductCard
                                    key={product.id}
                                    product={product}
                                    onAddToCart={handleAddToCart} // DIUBAH: Kirim fungsi sebagai prop
                                />
                            ))
                        ) : (
                            <div className="col-span-full text-center py-12">
                                <p className="text-gray-500 text-lg">Belum ada produk yang tersedia.</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </>
    );
}

Belanja.layout = page => <CustomerLayout auth={page.props.auth}>{page}</CustomerLayout>;

// -- KOMPONEN KARTU PRODUK (DISEDERHANAKAN) --
function ProductCard({ product, onAddToCart }) { // DIUBAH: Hapus auth, tambah onAddToCart
    const [isProcessing, setIsProcessing] = useState(false); // DIUBAH: State lokal untuk status loading
    const imageUrl = `/storage/${product.gambar}`;

    const handleButtonClick = (e) => {
        e.stopPropagation();
        e.preventDefault();
        setIsProcessing(true);
        onAddToCart(product);
        // Set timeout untuk mengembalikan state tombol setelah beberapa saat
        setTimeout(() => setIsProcessing(false), 2500);
    };

    return (
        <Link
            href={`/customer/belanja/${product.id}`}
            className="group bg-white rounded-2xl shadow-md overflow-hidden transition-all duration-300 hover:shadow-xl hover:-translate-y-2 flex flex-col"
        >
            <div className="relative w-full aspect-square overflow-hidden">
                <img
                    src={imageUrl}
                    alt={product.nama}
                    className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                />
                {product.stok === 0 && (
                    <span className="absolute top-3 left-3 bg-slate-700 text-white text-xs font-bold px-3 py-1 rounded-full">Habis</span>
                )}
                <span className="absolute bottom-3 right-3 bg-green-600 text-white text-xs font-semibold px-3 py-1 rounded-full shadow">
                    {product.kategori ? product.kategori.nama_kategori : "Tanpa Kategori"}
                </span>
            </div>

            <div className="p-5 border-t flex flex-col flex-grow">
                <h3 className="text-lg font-bold text-slate-800 line-clamp-1">{product.nama}</h3>
                <p className="text-xl font-extrabold text-green-700 mt-2 mb-2">
                    {new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(product.harga)}
                </p>
                {product.stok > 0 && (
                    <p className="text-xs text-gray-500 mb-3">Stok: {product.stok} tersedia</p>
                )}
                <div className="mt-auto">
                    <button
                        onClick={handleButtonClick}
                        disabled={product.stok === 0 || isProcessing}
                        className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-green-600 text-white text-sm font-semibold rounded-full hover:bg-green-700 disabled:bg-slate-400 disabled:cursor-not-allowed transition-colors"
                    >
                        <FaCartPlus />
                        {isProcessing ? 'Menambahkan...' : 'Keranjang'}
                    </button>
                </div>
            </div>
        </Link>
    );
}
