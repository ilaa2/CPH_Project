import { Link, usePage } from '@inertiajs/react';
import { createContext, useContext, useState } from "react";
import {
  FiHome, FiShoppingBag, FiCalendar, FiSettings,
  FiHelpCircle, FiFileText, FiLogOut
} from "react-icons/fi";
import { BsBoxSeam, BsPeople } from "react-icons/bs";

const SidebarContext = createContext();

export default function Sidebar({ children }) {
  const [expanded, setExpanded] = useState(true);
  const { auth } = usePage().props;

  return (
    <div className="flex">
      {/* === SIDEBAR === */}
      <aside
        className={`fixed top-0 left-0 h-screen bg-white border-r shadow-sm z-50 transition-all duration-300 ease-in-out ${
          expanded ? "w-64" : "w-20"
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
    <SidebarItem icon={<FiHome size={20} />} text="Dashboard" href="/dashboard" active={route().current('dashboard')} />
    <SidebarItem icon={<BsBoxSeam size={20} />} text="Produk" href="/produk" active={route().current('produk.index')} />
    <SidebarItem icon={<FiShoppingBag size={20} />} text="Pesanan" href="/pesanan" active={route().current('pesanan.index')} />
    <SidebarItem icon={<FiFileText size={20} />} text="Laporan" href="/laporan" active={route().current('laporan.index')} />
    <SidebarItem icon={<BsPeople size={20} />} text="Pelanggan" href="/pelanggan" active={route().current('pelanggan.index')} />
    <SidebarItem icon={<FiCalendar size={20} />} text="Kunjungan" href="/kunjungan" active={route().current('kunjungan.index')} />

    {/* Gabungan Setelan & Bantuan */}
    <SidebarItem icon={<FiSettings size={20} />} text="Setelan & Bantuan" href="/setelan" active={route().current('setelan.index') || route().current('bantuan.index')} />

    {/* Tambahan Ulasan & Feedback */}
    <SidebarItem icon={<FiHelpCircle size={20} />} text="Ulasan & Feedback" href="/ulasan" active={route().current('ulasan.index')} />

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
          <div className="border-t p-3 flex items-center">
            <img src="/storage/logo/logoo.png" alt="User" className="w-10 h-10 rounded-md" />
            {expanded && (
              <div className="ml-3 leading-4">
                <h4 className="font-semibold text-green-800">{auth.user?.name || 'Pengguna'}</h4>
                <span className="text-xs text-gray-600">{auth.user?.email || 'email@domain.com'}</span>
              </div>
            )}
          </div>
        </nav>
      </aside>

      {/* === MAIN CONTENT === */}
      <main
        className={`min-h-screen flex-1 transition-all duration-300 ease-in-out ${
          expanded ? "ml-64" : "ml-20"
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
        className={`relative flex items-center w-full py-2 px-3 font-medium rounded-md transition-colors group text-left ${
          active
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
