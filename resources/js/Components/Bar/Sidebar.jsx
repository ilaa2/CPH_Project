import { Link, usePage } from '@inertiajs/react';
import { createContext, useContext, useState } from "react";
import {
  FiHome, FiShoppingBag, FiCalendar, FiSettings,
  FiHelpCircle, FiFileText, FiLogOut, FiUser, FiX
} from "react-icons/fi";
import { BsBoxSeam, BsPeople } from "react-icons/bs";

const SidebarContext = createContext();

export default function Sidebar({ children }) {
  const [expanded, setExpanded] = useState(true);
  const [showProfile, setShowProfile] = useState(false);
  const { auth } = usePage().props;

  return (
    <div className="flex">
      {/* === SIDEBAR === */}
      <aside
        className={`fixed top-0 left-0 h-screen bg-white border-r shadow-sm z-50 transition-all duration-300 ease-in-out ${expanded ? "w-64" : "w-20"
          }`}
      >
        <nav className="h-full flex flex-col justify-between">
          <div>
            {/* LOGO & TOGGLE */}
            <div className="flex items-center justify-between p-4">
              <div className="flex items-center gap-2">
                <img src="/storage/logo/logoo.png" alt="Logo" className="w-8 h-8" />
                {expanded && (
                  <span className="text-sm font-semibold text-green-700">
                    CENTRAL PALANTEA
                  </span>
                )}
              </div>
              <button onClick={() => setExpanded(!expanded)} className="p-1.5 rounded hover:bg-gray-100">
                {expanded ? "←" : "→"}
              </button>
            </div>

            {/* MENU */}
            <SidebarContext.Provider value={{ expanded }}>
              <ul className="px-3 space-y-1">
                <SidebarItem icon={<FiHome size={20} />} text="Dashboard" href="/admin" active={route().current('admin.dashboard')} />
                <SidebarItem icon={<BsBoxSeam size={20} />} text="Produk" href="/admin/produk" active={route().current('admin.produk.index')} />
                <SidebarItem icon={<FiShoppingBag size={20} />} text="Pesanan" href="/admin/pesanan" active={route().current('admin.pesanan.index')} />
                <SidebarItem icon={<FiFileText size={20} />} text="Laporan" href="/admin/laporan" active={route().current('admin.laporan.index')} />
                <SidebarItem icon={<BsPeople size={20} />} text="Customer" href="/admin/pelanggan" active={route().current('admin.pelanggan.index')} />
                <SidebarItem icon={<FiCalendar size={20} />} text="Kunjungan" href="/admin/kunjungan" active={route().current('admin.kunjungan.index')} />

                {/* Gabungan Setelan & Bantuan - Hidden for demo */}
                {/* <SidebarItem icon={<FiSettings size={20} />} text="Setelan & Bantuan" href="/setelan" active={route().current('setelan.index') || route().current('bantuan.index')} /> */}

                {/* Tambahan Ulasan & Feedback */}
                {/* SidebarItem Ulasan dihapus */}

                {/* LOGOUT */}
                <SidebarItem
                  icon={<FiLogOut size={20} />}
                  text="Logout"
                  href={route('logout')}
                  method="post"
                  as="button"
                  active={false}
                />
              </ul>
            </SidebarContext.Provider>

          </div>

          {/* USER INFO */}
          {/* USER INFO */}
          <div className="relative border-t p-3">
            {showProfile && expanded && (
              <div className="absolute bottom-full left-3 mb-2 w-64 bg-white rounded-xl shadow-2xl border border-green-100 overflow-hidden z-50 animate-fade-in-up">
                <div className="bg-gradient-to-r from-green-600 to-green-500 p-4">
                  <div className="flex justify-between items-start text-white">
                    <div>
                      <h3 className="font-bold text-lg">Info Akun</h3>
                      <p className="text-xs text-green-100 opacity-90">Administrator System</p>
                    </div>
                    <button
                      onClick={(e) => { e.stopPropagation(); setShowProfile(false); }}
                      className="text-white/80 hover:text-white transition-colors bg-white/10 rounded-full p-1"
                    >
                      <FiX size={16} />
                    </button>
                  </div>
                </div>
                <div className="p-4 bg-white space-y-4">
                  <div className="flex items-start gap-3">
                    <div className="p-2 bg-green-50 text-green-600 rounded-lg">
                      <FiUser size={18} />
                    </div>
                    <div className="flex-1">
                      <label className="text-[10px] uppercase font-bold text-gray-400 tracking-wider">Nama Pengguna</label>
                      <p className="text-sm font-semibold text-gray-800">{auth.user?.name}</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <div className="p-2 bg-green-50 text-green-600 rounded-lg">
                      <FiFileText size={18} />
                    </div>
                    <div className="flex-1">
                      <label className="text-[10px] uppercase font-bold text-gray-400 tracking-wider">Email</label>
                      <p className="text-sm font-semibold text-gray-800 break-all">{auth.user?.email}</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <div className="p-2 bg-green-50 text-green-600 rounded-lg">
                      <FiSettings size={18} />
                    </div>
                    <div className="flex-1">
                      <label className="text-[10px] uppercase font-bold text-gray-400 tracking-wider">Role Akses</label>
                      <div className="mt-1">
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-green-100 text-green-700 border border-green-200 text-xs font-bold">
                          <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse"></span>
                          ADMIN
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="bg-gray-50 px-4 py-2 border-t text-[10px] text-gray-400 text-center">
                  Central Palantea Hidroponik © 2026
                </div>
              </div>
            )}

            <div
              className={`flex items-center cursor-pointer hover:bg-green-50 p-2 rounded-lg transition-colors ${showProfile ? 'bg-green-50' : ''}`}
              onClick={() => setExpanded(true) || setShowProfile(!showProfile)}
            >
              <img src="/storage/logo/logoo.png" alt="User" className="w-10 h-10 rounded-md border border-gray-100 shadow-sm" />
              {expanded && (
                <div className="ml-3 leading-4 flex-1">
                  <h4 className="font-semibold text-green-800 text-sm">{auth.user?.name || 'Pengguna'}</h4>
                  <span className="text-xs text-gray-500">{auth.user?.email || 'email@domain.com'}</span>
                </div>
              )}
            </div>
          </div>
        </nav>
      </aside>

      {/* === MAIN CONTENT === */}
      <main
        className={`min-h-screen flex-1 transition-all duration-300 ease-in-out ${expanded ? "ml-64" : "ml-20"
          }`}
      >
        {children}
      </main>
    </div>
  );
}

function SidebarItem({ icon, text, active, alert, href, method = 'get', as = 'a' }) {
  const { expanded } = useContext(SidebarContext);

  return (
    <li>
      <Link
        href={href}
        method={method}
        as={as}
        type={as === 'button' ? 'button' : undefined}
        className={`relative flex items-center w-full py-2 px-3 font-medium rounded-md transition-colors group text-left ${active
          ? "bg-gradient-to-tr from-green-600 to-green-500 text-white"
          : "hover:bg-green-200 text-gray-600"
          }`}
      >
        {icon}
        <span className={`overflow-hidden transition-all ${expanded ? "w-52 ml-3" : "w-0"}`}>
          {text}
        </span>

        {alert && <div className="absolute right-2 w-2 h-2 rounded bg-green-300" />}

        {!expanded && (
          <div className="absolute left-full rounded-sm px-2 py-1 ml-6 bg-green-100 text-green-900 text-sm invisible opacity-0 -translate-x-3 transition-all group-hover:visible group-hover:opacity-100 group-hover:translate-x-0">
            {text}
          </div>
        )}
      </Link>
    </li>
  );
}
