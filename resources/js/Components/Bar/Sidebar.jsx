import { Link, usePage, useForm } from '@inertiajs/react';
import { createContext, useContext, useState, useMemo, useEffect } from "react";
import {
  FiHome, FiShoppingBag, FiCalendar, FiSettings,
  FiHelpCircle, FiFileText, FiLogOut, FiUser, FiX, FiLock, FiCheck, FiAlertCircle, FiMenu, FiStar,
  FiChevronLeft, FiChevronRight, FiCoffee, FiTv, FiGrid, FiTrendingUp
} from "react-icons/fi";
import { BsBoxSeam, BsPeople } from "react-icons/bs";

const SidebarContext = createContext();

export default function Sidebar({ header, children }) {
  // Initialize expanded: default false usually for mobile-first, but logic below handles classes
  const [expanded, setExpanded] = useState(true);
  const [showProfile, setShowProfile] = useState(false);
  const [activeTab, setActiveTab] = useState('info');
  const { auth } = usePage().props;

  // Auto-collapse on mobile on mount
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 768) {
        setExpanded(false);
      } else {
        setExpanded(true);
      }
    };

    // Set initial state
    handleResize();

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const { data, setData, put, processing, errors, reset, recentlySuccessful } = useForm({
    current_password: '',
    password: '',
    password_confirmation: '',
  });

  const passwordChecks = useMemo(() => ({
    minLength: data.password.length >= 8,
    hasUppercase: /[A-Z]/.test(data.password),
    hasLowercase: /[a-z]/.test(data.password),
    hasNumber: /[0-9]/.test(data.password),
    hasSymbol: /[^A-Za-z0-9]/.test(data.password),
  }), [data.password]);

  const handlePasswordUpdate = (e) => {
    e.preventDefault();
    put(route('password.update'), {
      preserveScroll: true,
      onSuccess: () => reset(),
    });
  };

  const handleCloseProfile = (e) => {
    if (e) e.stopPropagation();
    setShowProfile(false);
    setActiveTab('info');
    reset();
  };

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Mobile Overlay */}
      {expanded && (
        <div
          className="fixed inset-0 bg-black/50 z-40 md:hidden"
          onClick={() => setExpanded(false)}
        />
      )}

      {/* Mobile Toggle Button (Visible only on mobile when collapsed) */}
      {!expanded && (
        <button
          onClick={() => setExpanded(true)}
          className="fixed top-4 left-4 z-50 p-2 bg-white rounded-md shadow-md md:hidden text-green-700 hover:bg-green-50"
        >
          <FiMenu size={24} />
        </button>
      )}

      {/* === SIDEBAR === */}
      <aside
        className={`fixed top-0 left-0 h-screen bg-white border-r shadow-sm z-50 transition-all duration-300 ease-in-out
          ${expanded ? "translate-x-0 w-64" : "-translate-x-full w-64 md:translate-x-0 md:w-20"}
        `}
      >
        <nav className="h-full flex flex-col justify-between overflow-hidden">
          {/* LOGO & TOGGLE (Fixed Top) */}
          <div className={`p-4 flex ${expanded ? 'items-center justify-between' : 'flex-col items-center gap-4'} mb-1 shrink-0 border-b border-gray-100`}>
            <div className="flex items-center gap-2 overflow-hidden">
              <img src="/storage/logo/logoo.png" alt="Logo" className="w-8 h-8 shrink-0" />
              <span className={`text-sm font-semibold text-green-700 transition-opacity duration-300 ${expanded ? 'opacity-100' : 'opacity-0 md:hidden'}`}>
                CENTRAL PALANTEA
              </span>
            </div>

            {/* Desktop Toggle Button */}
            <button
              onClick={() => setExpanded(!expanded)}
              className="hidden md:flex p-1.5 rounded-lg hover:bg-gray-100 text-gray-500 hover:text-green-700 items-center justify-center transition-colors"
            >
              {expanded ? <FiChevronLeft size={20} /> : <FiChevronRight size={20} />}
            </button>

            {/* Mobile Close Button */}
            <button onClick={() => setExpanded(false)} className="md:hidden p-1.5 rounded hover:bg-gray-100">
              <FiX size={20} />
            </button>
          </div>

          {/* MENU (Scrollable list only) */}
          <div className="flex-1 overflow-y-auto min-h-0 py-2 custom-scrollbar">
            <SidebarContext.Provider value={{ expanded }}>
              <ul className="px-3 space-y-1">
                
                {/* SECTION 1: HIDROPONIK & SPACE (FITUR WEBSITE UTAMA) */}
                {auth.user?.role === 'admin' && (
                  <>
                    <div className="pt-3 pb-1 px-3 text-[10px] font-bold text-green-600 uppercase tracking-wider border-t mt-3">
                      {expanded && "HIDROPONIK & SPACE"}
                    </div>
                    <SidebarItem icon={<FiHome size={20} />} text="Dashboard" href="/admin" active={route().current('admin.dashboard')} />
                    <SidebarItem icon={<BsBoxSeam size={20} />} text="Produk Online" href="/admin/produk" active={route().current('admin.produk.*')} />
                    <SidebarItem icon={<FiShoppingBag size={20} />} text="Pesanan Online" href="/admin/pesanan" active={route().current('admin.pesanan.*')} />
                    <SidebarItem icon={<FiFileText size={20} />} text="Laporan" href="/admin/laporan" active={route().current('admin.laporan.*')} />
                    <SidebarItem icon={<BsPeople size={20} />} text="Customer" href="/admin/pelanggan" active={route().current('admin.pelanggan.*')} />
                    <SidebarItem icon={<FiCalendar size={20} />} text="Kunjungan" href="/admin/kunjungan" active={route().current('admin.kunjungan.*')} />
                    <SidebarItem icon={<FiStar size={20} />} text="Ulasan" href="/admin/ulasan" active={route().current('admin.ulasan.*')} />
                  </>
                )}

                {/* SECTION 2: KANTIN & POS (FITUR KASIR & DAPUR INTERNAL) */}
                {(auth.user?.role === 'admin' || auth.user?.role === 'kasir' || auth.user?.role === 'dapur') && (
                  <>
                    <div className="pt-4 pb-1 px-3 text-[10px] font-bold text-green-600 uppercase tracking-wider border-t mt-4">
                      {expanded && "KANTIN"}
                    </div>

                    {(auth.user?.role === 'admin' || auth.user?.role === 'kasir') && (
                      <SidebarItem icon={<FiCoffee size={20} />} text="Sistem POS Kasir" href="/order" active={route().current('pos.kasir')} />
                    )}
                    {(auth.user?.role === 'admin' || auth.user?.role === 'dapur') && (
                      <SidebarItem icon={<FiTv size={20} />} text="Kitchen Display" href="/kitchen" active={route().current('pos.kitchen')} />
                    )}
                    {(auth.user?.role === 'admin' || auth.user?.role === 'kasir') && (
                      <>
                        <SidebarItem icon={<FiCoffee size={20} />} text="Menu Makanan" href="/admin/pos-foods" active={route().current('admin.pos.foods.*')} />
                        <SidebarItem icon={<FiGrid size={20} />} text="Nomor Antrian" href="/admin/pos-tables" active={route().current('admin.pos.tables.*')} />
                        <SidebarItem icon={<FiTrendingUp size={20} />} text="Laporan & Penghasilan" href="/admin/pos-reports" active={route().current('admin.pos.reports.*')} />
                      </>
                    )}
                  </>
                )}

                {/* LOGOUT */}
                <div className="pt-3 border-t mt-4">
                  <SidebarItem
                    icon={<FiLogOut size={20} />}
                    text="Logout"
                    href={route('logout')}
                    method="post"
                    as="button"
                    active={false}
                  />
                </div>
              </ul>
            </SidebarContext.Provider>
          </div>

          {/* USER INFO (Fixed Bottom) */}
          <div className="relative border-t p-3 shrink-0 bg-white z-10">
            {showProfile && expanded && (
              <div className="absolute bottom-full left-3 mb-2 w-72 bg-white rounded-xl shadow-2xl border border-green-100 overflow-hidden z-50 animate-fade-in-up">
                {/* Header */}
                <div className="bg-gradient-to-r from-green-600 to-green-500 p-4">
                  <div className="flex justify-between items-start text-white">
                    <div>
                      <h3 className="font-bold text-lg">Akun Admin</h3>
                      <p className="text-xs text-green-100 opacity-90">Administrator System</p>
                    </div>
                    <button
                      onClick={handleCloseProfile}
                      className="text-white/80 hover:text-white transition-colors bg-white/10 rounded-full p-1"
                    >
                      <FiX size={16} />
                    </button>
                  </div>
                </div>

                {/* Tabs */}
                <div className="flex border-b border-gray-200">
                  <button
                    onClick={() => setActiveTab('info')}
                    className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 text-xs font-semibold transition-colors ${activeTab === 'info'
                      ? 'text-green-600 border-b-2 border-green-600 bg-green-50/50'
                      : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
                      }`}
                  >
                    <FiUser size={13} /> Info Akun
                  </button>
                  <button
                    onClick={() => setActiveTab('password')}
                    className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 text-xs font-semibold transition-colors ${activeTab === 'password'
                      ? 'text-green-600 border-b-2 border-green-600 bg-green-50/50'
                      : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
                      }`}
                  >
                    <FiLock size={13} /> Password
                  </button>
                </div>

                {/* Tab Content */}
                {activeTab === 'info' ? (
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
                ) : (
                  <form onSubmit={handlePasswordUpdate} className="p-4 bg-white space-y-3">
                    {recentlySuccessful && (
                      <div className="flex items-center gap-2 p-2 bg-green-50 border border-green-200 rounded-lg text-xs text-green-700 font-medium">
                        <FiCheck size={14} /> Password berhasil diperbarui!
                      </div>
                    )}

                    <div>
                      <label className="text-[10px] uppercase font-bold text-gray-400 tracking-wider block mb-1">Password Saat Ini</label>
                      <input
                        type="password"
                        value={data.current_password}
                        onChange={(e) => setData('current_password', e.target.value)}
                        className="w-full text-sm border border-gray-300 rounded-lg px-3 py-2 focus:ring-green-500 focus:border-green-500"
                        placeholder="Masukkan password saat ini"
                        required
                      />
                      {errors.current_password && (
                        <p className="mt-1 text-[11px] text-red-500 flex items-center gap-1">
                          <FiAlertCircle size={11} /> {errors.current_password}
                        </p>
                      )}
                    </div>

                    <div>
                      <label className="text-[10px] uppercase font-bold text-gray-400 tracking-wider block mb-1">Password Baru</label>
                      <input
                        type="password"
                        value={data.password}
                        onChange={(e) => setData('password', e.target.value)}
                        className="w-full text-sm border border-gray-300 rounded-lg px-3 py-2 focus:ring-green-500 focus:border-green-500"
                        placeholder="Masukkan password baru"
                        required
                      />
                      {data.password.length > 0 && (
                        <ul className="mt-1.5 space-y-0.5 bg-gray-50 rounded-md p-2 border border-gray-200">
                          {[
                            { met: passwordChecks.minLength, label: 'Min. 8 karakter' },
                            { met: passwordChecks.hasUppercase, label: 'Huruf kapital (A-Z)' },
                            { met: passwordChecks.hasLowercase, label: 'Huruf kecil (a-z)' },
                            { met: passwordChecks.hasNumber, label: 'Angka (0-9)' },
                            { met: passwordChecks.hasSymbol, label: 'Simbol (@, #, !)' },
                          ].map((c, i) => (
                            <li key={i} className={`flex items-center gap-1 text-[11px] ${c.met ? 'text-green-600' : 'text-red-500'}`}>
                              {c.met ? <FiCheck size={11} /> : <FiX size={11} />}
                              <span>{c.label}</span>
                            </li>
                          ))}
                        </ul>
                      )}
                      {errors.password && (
                        <p className="mt-1 text-[11px] text-red-500 flex items-center gap-1">
                          <FiAlertCircle size={11} /> {errors.password}
                        </p>
                      )}
                    </div>

                    <div>
                      <label className="text-[10px] uppercase font-bold text-gray-400 tracking-wider block mb-1">Konfirmasi Password</label>
                      <input
                        type="password"
                        value={data.password_confirmation}
                        onChange={(e) => setData('password_confirmation', e.target.value)}
                        className="w-full text-sm border border-gray-300 rounded-lg px-3 py-2 focus:ring-green-500 focus:border-green-500"
                        placeholder="Ulangi password baru"
                        required
                      />
                      {errors.password_confirmation && (
                        <p className="mt-1 text-[11px] text-red-500 flex items-center gap-1">
                          <FiAlertCircle size={11} /> {errors.password_confirmation}
                        </p>
                      )}
                    </div>

                    <button
                      type="submit"
                      disabled={processing}
                      className="w-full py-2 bg-green-600 hover:bg-green-700 text-white text-sm font-semibold rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {processing ? 'Menyimpan...' : 'Simpan Password'}
                    </button>
                  </form>
                )}

                {/* Footer */}
                <div className="bg-gray-50 px-4 py-2 border-t text-[10px] text-gray-400 text-center">
                  Central Palantea Hidroponik © 2026
                </div>
              </div>
            )}

            <div
              className={`flex items-center cursor-pointer hover:bg-green-50 p-2 rounded-lg transition-colors ${showProfile ? 'bg-green-50' : ''}`}
              onClick={() => setExpanded(true) || setShowProfile(!showProfile)}
            >
              <img src="/storage/logo/logoo.png" alt="User" className="w-10 h-10 rounded-md border border-gray-100 shadow-sm shrink-0" />
              <div className={`ml-3 leading-4 flex-1 transition-opacity duration-300 ${expanded ? 'opacity-100' : 'opacity-0 md:hidden'}`}>
                {/* On desktop collapsed, hide text. On mobile open, show text. */}
                {expanded && (
                  <>
                    <h4 className="font-semibold text-green-800 text-sm truncate">{auth.user?.name || 'Pengguna'}</h4>
                    <span className="text-xs text-gray-500 truncate block">{auth.user?.email || 'email@domain.com'}</span>
                  </>
                )}
              </div>
            </div>
          </div>
        </nav>
      </aside>

      {/* === MAIN CONTENT === */}
      <main
        className={`min-h-screen flex flex-col transition-all duration-300 ease-in-out
          ${expanded ? "md:ml-64" : "md:ml-20"}
          ml-0
        `}
      >
        {header && (
          <div className="sticky top-0 z-20 p-4 md:p-6 bg-white border-b border-gray-200">
            {/* On mobile, add padding left to account for hamburger if needed, or hamburger is absolute overlay */}
            <div className="pl-12 md:pl-0">
              {header}
            </div>
          </div>
        )}

        <div className="flex-1 p-4 md:p-6">
          {children}
        </div>
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
        <span className="shrink-0">{icon}</span> {/* Prevent icon shrinking */}
        <span className={`overflow-hidden transition-all whitespace-nowrap ${expanded ? "w-52 ml-3" : "w-0"}`}>
          {text}
        </span>

        {alert && <div className="absolute right-2 w-2 h-2 rounded bg-green-300" />}

        {!expanded && (
          <div className="absolute z-50 left-full rounded-sm px-2 py-1 ml-6 bg-green-100 text-green-900 text-sm invisible opacity-0 -translate-x-3 transition-all group-hover:visible group-hover:opacity-100 group-hover:translate-x-0 whitespace-nowrap shadow-md">
            {text}
          </div>
        )}
      </Link>
    </li>
  );
}

