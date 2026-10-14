import React, { useState, useEffect } from 'react';
import { Head, router, Link } from '@inertiajs/react';
import Sidebar from '@/Components/Bar/Sidebar';
import Receipt from '@/Pages/POS/Receipt';
import CashierGuideModal from '@/Pages/POS/CashierGuideModal';
import Swal from 'sweetalert2';
import {
  FiTv, FiCoffee, FiShoppingBag, FiCheckCircle, FiClock,
  FiPrinter, FiDollarSign, FiSearch, FiRefreshCw, FiVolume2,
  FiVolumeX, FiAlertCircle, FiX, FiCheck, FiTrash2, FiPlusCircle,
  FiArrowRight, FiSliders, FiEdit2, FiBookOpen
} from 'react-icons/fi';

// Audio Synthesizer Chime
const playNotificationChime = () => {
  try {
    if (typeof window === 'undefined') return;
    const AudioContext = window.AudioContext || window.webkitAudioContext;
    if (!AudioContext) return;
    const ctx = new AudioContext();

    const osc1 = ctx.createOscillator();
    const gain1 = ctx.createGain();
    osc1.type = 'triangle';
    osc1.frequency.setValueAtTime(587.33, ctx.currentTime);
    gain1.gain.setValueAtTime(0.3, ctx.currentTime);
    gain1.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.4);
    osc1.connect(gain1);
    gain1.connect(ctx.destination);
    osc1.start();
    osc1.stop(ctx.currentTime + 0.4);

    const osc2 = ctx.createOscillator();
    const gain2 = ctx.createGain();
    osc2.type = 'sine';
    osc2.frequency.setValueAtTime(880, ctx.currentTime + 0.15);
    gain2.gain.setValueAtTime(0.5, ctx.currentTime + 0.15);
    gain2.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.6);
    osc2.connect(gain2);
    gain2.connect(ctx.destination);
    osc2.start(ctx.currentTime + 0.15);
    osc2.stop(ctx.currentTime + 0.6);
  } catch (e) {
    console.error('Audio synth error', e);
  }
};

const speakVoiceNotification = (text) => {
  try {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) return;
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'id-ID';
    utterance.rate = 0.95;
    utterance.pitch = 1.0;
    const voices = window.speechSynthesis.getVoices();
    const idVoice = voices.find(v => v.lang && (v.lang.includes('id') || v.lang.includes('ID')));
    if (idVoice) utterance.voice = idVoice;
    window.speechSynthesis.speak(utterance);
  } catch (e) {
    console.error('Speech synthesis error', e);
  }
};

export default function OrderMonitor({ tables = [], activeOrders = [] }) {
  const [activeTab, setActiveTab] = useState('active'); // 'active', 'unpaid', 'completed', 'all'
  const [selectedTableFilter, setSelectedTableFilter] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [soundEnabled, setSoundEnabled] = useState(false);
  const [showGuideModal, setShowGuideModal] = useState(false);

  // Modal State: Print Struk
  const [showReceiptModal, setShowReceiptModal] = useState(false);
  const [selectedReceiptOrder, setSelectedReceiptOrder] = useState(null);
  const [receiptType, setReceiptType] = useState('both');
  const [bothPrintStep, setBothPrintStep] = useState(1);

  // Modal State: Pembayaran Kasir
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [payingOrder, setPayingOrder] = useState(null);
  const [paymentMethod, setPaymentMethod] = useState('Cash');
  const [cashAmountInput, setCashAmountInput] = useState('');
  const [qrisAmountInput, setQrisAmountInput] = useState('');
  const [isSubmittingPayment, setIsSubmittingPayment] = useState(false);

  // Auto Polling State every 5 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      router.reload({ only: ['tables', 'activeOrders'], preserveScroll: true, preserveState: true });
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  const formatRp = (val) => `Rp ${Number(val || 0).toLocaleString('id-ID')}`;

  const toggleSound = () => {
    const nextState = !soundEnabled;
    setSoundEnabled(nextState);
    if (nextState) {
      playNotificationChime();
      speakVoiceNotification('Notifikasi suara monitor kasir aktif');
      Swal.fire({
        toast: true,
        position: 'top-end',
        icon: 'success',
        title: '🔊 Notifikasi Suara Aktif!',
        showConfirmButton: false,
        timer: 2000,
      });
    }
  };

  // Filter Orders
  const filteredOrders = activeOrders.filter(order => {
    if (selectedTableFilter && order.table?.id !== selectedTableFilter) {
      return false;
    }

    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      const matchOrderNo = order.nomor_pesanan.toLowerCase().includes(q);
      const matchCustomer = (order.nama_pelanggan || '').toLowerCase().includes(q);
      const matchTable = (order.table?.nomor_meja || '').toLowerCase().includes(q);
      if (!matchOrderNo && !matchCustomer && !matchTable) return false;
    }

    if (activeTab === 'active') {
      return order.order_status !== 'COMPLETED' && order.order_status !== 'CANCELLED';
    }
    if (activeTab === 'unpaid') {
      return order.payment_status === 'UNPAID' && order.order_status !== 'CANCELLED';
    }
    if (activeTab === 'completed') {
      return order.order_status === 'COMPLETED';
    }
    return true;
  });

  // KPI Metrics
  const activeCount = activeOrders.filter(o => o.order_status !== 'COMPLETED' && o.order_status !== 'CANCELLED').length;
  const unpaidCount = activeOrders.filter(o => o.payment_status === 'UNPAID' && o.order_status !== 'CANCELLED').length;
  const completedTodayCount = activeOrders.filter(o => o.order_status === 'COMPLETED').length;

  // Toggle Item Served
  const handleToggleItemServed = (item) => {
    router.post(route('pos.order-item.toggle-served', item.id), {}, {
      preserveScroll: true,
      onSuccess: () => {
        if (soundEnabled) {
          playNotificationChime();
        }
      }
    });
  };

  // Selesaikan Pesanan (1-Klik dari Kasir)
  const handleCompleteOrder = (order) => {
    if (order.payment_status === 'UNPAID') {
      Swal.fire({
        title: '⚠️ Pesanan Belum Dibayar!',
        text: `Pesanan Meja ${order.table?.nomor_meja || '--'} belum dibayar (Total: ${formatRp(order.total)}). Apakah Anda ingin melunasi pembayarannya sekarang?`,
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#16a34a',
        cancelButtonColor: '#6b7280',
        confirmButtonText: '💳 Bayar Kasir Sekarang',
        cancelButtonText: 'Batal',
      }).then((result) => {
        if (result.isConfirmed) {
          handleOpenPaymentModal(order);
        }
      });
      return;
    }

    Swal.fire({
      title: 'Selesaikan Pesanan & Kosongkan Meja?',
      text: `Pesanan No. ${order.nomor_pesanan} di Meja ${order.table?.nomor_meja || '--'} akan ditandai SELESAI dan nomor antrian otomatis KOSONG untuk pelanggan berikutnya.`,
      icon: 'question',
      showCancelButton: true,
      confirmButtonColor: '#16a34a',
      cancelButtonColor: '#6b7280',
      confirmButtonText: '✅ Ya, Selesai & Meja Kosong',
      cancelButtonText: 'Batal',
    }).then((result) => {
      if (result.isConfirmed) {
        router.post(route('pos.order.complete', order.id), {}, {
          preserveScroll: true,
          onSuccess: () => {
            if (soundEnabled) {
              speakVoiceNotification(`Pesanan nomor antrian ${order.table?.nomor_meja || ''} selesai`);
            }
            Swal.fire({
              icon: 'success',
              title: 'Pesanan Selesai!',
              text: `Meja ${order.table?.nomor_meja || '--'} kini telah kosong dan siap digunakan.`,
              timer: 1800,
              showConfirmButton: false,
            });
          }
        });
      }
    });
  };

  // Batalkan Seluruh Pesanan
  const handleCancelOrder = (order) => {
    Swal.fire({
      title: 'Batalkan Pesanan Ini?',
      text: `Pesanan ${order.nomor_pesanan} di Meja ${order.table?.nomor_meja || '--'} akan dibatalkan utuh dan meja dikosongkan.`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#dc2626',
      cancelButtonColor: '#6b7280',
      confirmButtonText: 'Ya, Batalkan Pesanan',
      cancelButtonText: 'Kembali',
    }).then((result) => {
      if (result.isConfirmed) {
        router.post(route('pos.order.cancel', order.id), {}, {
          preserveScroll: true,
          onSuccess: () => {
            Swal.fire({ icon: 'success', title: 'Pesanan Dibatalkan', timer: 1500, showConfirmButton: false });
          }
        });
      }
    });
  };

  // Reset Meja Manual
  const handleResetTable = (table) => {
    Swal.fire({
      title: `Kosongkan Meja ${table.nomor_meja}?`,
      text: `Nomor antrian ini akan diubah statusnya menjadi Tersedia (Hijau).`,
      icon: 'question',
      showCancelButton: true,
      confirmButtonColor: '#16a34a',
      cancelButtonColor: '#6b7280',
      confirmButtonText: '🧹 Kosongkan Meja',
      cancelButtonText: 'Batal',
    }).then((result) => {
      if (result.isConfirmed) {
        router.post(route('pos.table.reset', table.id), {}, {
          preserveScroll: true,
          onSuccess: () => {
            Swal.fire({ icon: 'success', title: `Meja ${table.nomor_meja} Siap Digunakan!`, timer: 1500, showConfirmButton: false });
          }
        });
      }
    });
  };

  // Buka Modal Bayar
  const handleOpenPaymentModal = (order) => {
    setPayingOrder(order);
    const currMethod = order.payment?.metode_pembayaran || order.metode_pembayaran || 'QRIS';
    setPaymentMethod(currMethod);
    setCashAmountInput(order.total.toString());
    setQrisAmountInput(order.total.toString());
    setShowPaymentModal(true);
  };

  // Submit Pembayaran Kasir
  const handleSubmitPayment = (e) => {
    e.preventDefault();
    if (!payingOrder) return;

    let bayarInt = 0;
    let cashVal = 0;
    let qrisVal = 0;

    if (paymentMethod === 'SPLIT') {
      cashVal = parseInt(cashAmountInput) || 0;
      qrisVal = parseInt(qrisAmountInput) || 0;
      bayarInt = cashVal + qrisVal;
      if (bayarInt < payingOrder.total) {
        Swal.fire({
          icon: 'warning',
          title: 'Nominal Kurang',
          text: `Total Cash + QRIS (${formatRp(bayarInt)}) kurang dari tagihan (${formatRp(payingOrder.total)})`,
        });
        return;
      }
    } else if (paymentMethod === 'Cash') {
      bayarInt = parseInt(cashAmountInput) || 0;
      cashVal = bayarInt;
      if (bayarInt < payingOrder.total) {
        Swal.fire({
          icon: 'warning',
          title: 'Nominal Kurang',
          text: `Jumlah bayar tunai (${formatRp(bayarInt)}) kurang dari tagihan (${formatRp(payingOrder.total)})`,
        });
        return;
      }
    } else { // QRIS
      bayarInt = parseInt(qrisAmountInput) || payingOrder.total;
      qrisVal = bayarInt;
      cashVal = 0;
    }

    const kembalian = Math.max(0, bayarInt - payingOrder.total);
    setIsSubmittingPayment(true);

    const isAlreadyPaid = payingOrder.payment_status === 'PAID';
    const targetRoute = isAlreadyPaid
      ? route('admin.pos.reports.payment.update-note', payingOrder.id)
      : route('pos.payment.process');

    router.post(targetRoute, {
      order_id: payingOrder.id,
      metode_pembayaran: paymentMethod,
      jumlah_bayar: bayarInt,
      cash_amount: cashVal,
      qris_amount: qrisVal,
      kembalian: kembalian,
    }, {
      preserveScroll: true,
      onSuccess: () => {
        setIsSubmittingPayment(false);
        setShowPaymentModal(false);

        if (soundEnabled) {
          playAudioAndVoice?.(isAlreadyPaid
            ? `Metode pembayaran nomor antrian ${payingOrder.table?.nomor_meja || ''} diperbarui`
            : `Pembayaran nomor antrian ${payingOrder.table?.nomor_meja || ''} berhasil`
          );
        }

        Swal.fire({
          icon: 'success',
          title: isAlreadyPaid ? 'Metode Pembayaran Diperbarui!' : 'Pembayaran Berhasil!',
          text: `Pesanan tercatat lunas dengan ${paymentMethod}.`,
          timer: 1600,
          showConfirmButton: false,
        });

        const paidReceiptData = {
          ...payingOrder,
          payment_status: 'PAID',
          payment: {
            metode_pembayaran: paymentMethod,
            jumlah_bayar: bayarInt,
            cash_amount: cashVal,
            qris_amount: qrisVal,
            kembalian: kembalian,
          }
        };

        setSelectedReceiptOrder(paidReceiptData);
        setReceiptType('customer');
        setShowReceiptModal(true);
      },
      onError: (err) => {
        setIsSubmittingPayment(false);
        Swal.fire({ icon: 'error', title: 'Gagal Memproses Bayar', text: Object.values(err).join('\n') });
      }
    });
  };

  // Buka Modal Struk
  const handleOpenReceipt = (order, type = 'both') => {
    setSelectedReceiptOrder(order);
    setReceiptType(type);
    setBothPrintStep(1);
    setShowReceiptModal(true);
  };

  return (
    <Sidebar header={
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 w-full">
        <div>
          <h2 className="text-xl font-black text-gray-800 flex items-center gap-2">
            <FiTv className="text-green-600" /> Monitor Pesanan Kantin
          </h2>
          <p className="text-xs text-gray-500">
            Kelola alur hidangan, checklist menu diantar, dan selesaikan nomor antrian langsung dari kasir.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setShowGuideModal(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-amber-500 hover:bg-amber-600 text-white rounded-lg text-xs font-bold transition-all shadow-xs cursor-pointer"
            title="Buka Buku Panduan Operasional Kasir"
          >
            <FiBookOpen size={14} /> Panduan Kasir
          </button>
          <button
            onClick={toggleSound}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
              soundEnabled ? 'bg-green-600 text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            {soundEnabled ? <FiVolume2 size={15} /> : <FiVolumeX size={15} />}
            {soundEnabled ? 'Suara Aktif' : 'Aktifkan Suara'}
          </button>
          <Link
            href="/order"
            className="flex items-center gap-1.5 px-3 py-1.5 bg-green-700 hover:bg-green-800 text-white rounded-lg text-xs font-bold shadow-sm transition-all"
          >
            <FiCoffee size={15} /> Buka POS Kasir
          </Link>
        </div>
      </div>
    }>
      <Head title="Monitor Pesanan Kantin - Central Palantea" />

      <div className="space-y-5 pb-10">

        {/* 1. TOP METRIC BADGES */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="bg-white p-3.5 rounded-2xl shadow-sm border border-gray-100 flex items-center justify-between">
            <div>
              <p className="text-[11px] font-bold text-gray-500 uppercase tracking-wider">Sedang Berjalan</p>
              <h3 className="text-2xl font-black text-blue-700 mt-0.5">{activeCount} Pesanan</h3>
              <p className="text-[10px] text-gray-400 mt-1">Dalam proses masak & antar</p>
            </div>
            <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center text-xl font-bold">
              🍳
            </div>
          </div>

          <div className="bg-white p-3.5 rounded-2xl shadow-sm border border-amber-200 flex items-center justify-between">
            <div>
              <p className="text-[11px] font-bold text-amber-800 uppercase tracking-wider">Belum Lunas (UNPAID)</p>
              <h3 className="text-2xl font-black text-amber-600 mt-0.5">{unpaidCount} Meja</h3>
              <p className="text-[10px] text-amber-700 mt-1">Perlu ditagih sebelum pulang</p>
            </div>
            <div className="w-12 h-12 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center text-xl font-bold">
              ⚠️
            </div>
          </div>

          <div className="bg-white p-3.5 rounded-2xl shadow-sm border border-green-100 flex items-center justify-between">
            <div>
              <p className="text-[11px] font-bold text-green-700 uppercase tracking-wider">Selesai Hari Ini</p>
              <h3 className="text-2xl font-black text-green-700 mt-0.5">{completedTodayCount} Pesanan</h3>
              <p className="text-[10px] text-green-600 mt-1">Telah diantar & diselesaikan</p>
            </div>
            <div className="w-12 h-12 rounded-xl bg-green-50 text-green-600 flex items-center justify-center text-xl font-bold">
              ✅
            </div>
          </div>
        </div>

        {/* 2. NOMOR ANTRIAN VISUAL STATUS (30 MEJA) */}
        <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 mb-3">
            <div>
              <h3 className="text-xs font-black text-gray-800 uppercase tracking-wider flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-green-600"></span> Status 30 Nomor Antrian Meja
              </h3>
              <p className="text-[11px] text-gray-400">Klik nomor meja untuk filter pesanan atau reset meja kuning menjadi kosong.</p>
            </div>
            <div className="flex items-center gap-2 text-[10px] font-bold">
              <span className="flex items-center gap-1 text-green-700"><span className="w-2 h-2 rounded-full bg-green-500"></span> Free</span>
              <span className="flex items-center gap-1 text-red-700"><span className="w-2 h-2 rounded-full bg-red-500"></span> Terisi</span>
              <span className="flex items-center gap-1 text-amber-700"><span className="w-2 h-2 rounded-full bg-amber-500"></span> Perlu Reset</span>
              {selectedTableFilter && (
                <button
                  onClick={() => setSelectedTableFilter(null)}
                  className="px-2 py-0.5 rounded bg-gray-200 hover:bg-gray-300 text-gray-700 transition-colors"
                >
                  ✕ Hapus Filter Meja
                </button>
              )}
            </div>
          </div>

          <div className="grid grid-cols-6 sm:grid-cols-10 md:grid-cols-15 gap-1.5">
            {tables.map(table => {
              const isSelected = selectedTableFilter === table.id;
              let bg = 'bg-green-50 text-green-800 border-green-200 hover:bg-green-100';
              if (table.status === 'OCCUPIED') bg = 'bg-red-50 text-red-800 border-red-300 hover:bg-red-100 font-bold';
              if (table.status === 'NEEDS_CLEANING') bg = 'bg-amber-100 text-amber-900 border-amber-300 hover:bg-amber-200 font-bold animate-pulse';
              if (table.status === 'UNAVAILABLE') bg = 'bg-gray-100 text-gray-400 border-gray-200 opacity-60';
              if (isSelected) bg += ' ring-2 ring-blue-600 scale-105';

              return (
                <button
                  key={table.id}
                  type="button"
                  onClick={() => {
                    if (table.status === 'NEEDS_CLEANING') {
                      handleResetTable(table);
                    } else if (table.status === 'OCCUPIED') {
                      setSelectedTableFilter(isSelected ? null : table.id);
                    } else {
                      setSelectedTableFilter(isSelected ? null : table.id);
                    }
                  }}
                  className={`p-1.5 rounded-lg border text-center text-xs flex flex-col items-center justify-center transition-all ${bg}`}
                  title={
                    table.status === 'NEEDS_CLEANING'
                      ? `Meja ${table.nomor_meja} selesai - Klik untuk kosongkan!`
                      : `Meja ${table.nomor_meja} (${table.status})`
                  }
                >
                  <span className="font-extrabold text-[11px]">{table.nomor_meja}</span>
                  <span className="text-[8px] font-black uppercase">
                    {table.status === 'AVAILABLE' ? 'Free' : table.status === 'OCCUPIED' ? 'Isi' : table.status === 'NEEDS_CLEANING' ? '🧹 Reset' : 'Off'}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* 3. FILTER TABS & SEARCH BAR */}
        <div className="bg-white p-3.5 rounded-2xl shadow-sm border border-gray-100 flex flex-col sm:flex-row justify-between items-center gap-3">
          <div className="flex flex-wrap items-center gap-1 bg-gray-100 p-1 rounded-xl w-full sm:w-auto">
            <button
              onClick={() => setActiveTab('active')}
              className={`px-3 py-1.5 rounded-lg text-xs font-black transition-all ${
                activeTab === 'active' ? 'bg-white text-green-700 shadow-sm' : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              🔥 Pesanan Aktif ({activeCount})
            </button>
            <button
              onClick={() => setActiveTab('unpaid')}
              className={`px-3 py-1.5 rounded-lg text-xs font-black transition-all ${
                activeTab === 'unpaid' ? 'bg-white text-amber-700 shadow-sm' : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              ⚠️ Belum Lunas ({unpaidCount})
            </button>
            <button
              onClick={() => setActiveTab('completed')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                activeTab === 'completed' ? 'bg-white text-blue-700 shadow-sm' : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              ✅ Selesai Hari Ini ({completedTodayCount})
            </button>
            <button
              onClick={() => setActiveTab('all')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                activeTab === 'all' ? 'bg-white text-gray-800 shadow-sm' : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Semua
            </button>
          </div>

          <div className="relative w-full sm:w-72">
            <FiSearch className="absolute left-3 top-2.5 text-gray-400" size={14} />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Cari nomor meja, nama, order..."
              className="w-full pl-9 pr-3 py-1.5 border border-gray-200 rounded-xl text-xs focus:ring-2 focus:ring-green-500"
            />
          </div>
        </div>

        {/* 4. ORDER CARDS GRID (WIDE MULTI-COLUMN) */}
        {filteredOrders.length === 0 ? (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 py-16 text-center text-gray-400">
            <FiShoppingBag size={48} className="mx-auto mb-2 text-gray-300" />
            <h4 className="text-base font-extrabold text-gray-700">Tidak Ada Pesanan Pada Filter Ini</h4>
            <p className="text-xs text-gray-400 mt-1 max-w-sm mx-auto">
              Saat ini tidak ada pesanan aktif yang sedang diproses. Pesanan baru dari kasir akan muncul di sini secara otomatis.
            </p>
            <Link
              href="/order"
              className="inline-flex items-center gap-1.5 mt-4 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-xl text-xs font-bold shadow-sm transition-all"
            >
              <FiCoffee size={14} /> Buat Pesanan Baru di POS
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {filteredOrders.map(order => {
              const isPaid = order.payment_status === 'PAID';
              const isCompleted = order.order_status === 'COMPLETED';
              const activeItems = order.items?.filter(i => i.status === 'ACTIVE') || [];
              const servedCount = activeItems.filter(i => i.is_served).length;
              const totalItems = activeItems.length;
              const progressPct = totalItems > 0 ? Math.round((servedCount / totalItems) * 100) : 0;

              return (
                <div
                  key={order.id}
                  className={`bg-white rounded-2xl shadow-sm border transition-all flex flex-col justify-between overflow-hidden ${
                    isCompleted
                      ? 'border-green-200 bg-green-50/20'
                      : !isPaid
                      ? 'border-amber-300 shadow-amber-500/5'
                      : 'border-gray-200 hover:border-green-400'
                  }`}
                >
                  {/* CARD HEADER */}
                  <div className="p-3.5 border-b border-gray-100 bg-gray-50/70">
                    <div className="flex justify-between items-start gap-2">
                      <div className="flex items-center gap-2.5">
                        <div className="px-3 py-1.5 bg-gradient-to-br from-green-700 to-green-800 text-white rounded-xl font-black text-center shadow-xs">
                          <span className="block text-[9px] uppercase tracking-wider text-green-200 font-bold">MEJA</span>
                          <span className="text-lg leading-none">{order.table?.nomor_meja || '--'}</span>
                        </div>
                        <div>
                          <h4 className="font-mono font-bold text-xs text-gray-900">{order.nomor_pesanan}</h4>
                          <span className="text-xs font-extrabold text-gray-700 uppercase block">
                            {order.nama_pelanggan || 'Pelanggan'}
                          </span>
                          <span className="text-[10px] text-gray-400 flex items-center gap-1 mt-0.5">
                            <FiClock size={10} />
                            {new Date(order.created_at).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })} WIB
                          </span>
                        </div>
                      </div>

                      {/* Status Badges */}
                      <div className="text-right space-y-1">
                        <span className={`inline-block px-2 py-0.5 rounded text-[10px] font-black uppercase ${
                          isCompleted
                            ? 'bg-green-100 text-green-800'
                            : 'bg-blue-100 text-blue-800'
                        }`}>
                          {isCompleted ? '✅ SELESAI' : '⏳ DIMASAK'}
                        </span>
                        <div>
                          {isPaid ? (
                            <button
                              type="button"
                              onClick={() => handleOpenPaymentModal(order)}
                              className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[10px] font-black bg-emerald-100 text-emerald-800 hover:bg-emerald-200 transition-colors cursor-pointer border border-emerald-200"
                              title="Klik untuk ubah metode pembayaran (Cash / QRIS / Split)"
                            >
                              <span>LUNAS ({order.payment?.metode_pembayaran || order.metode_pembayaran || 'Cash'})</span>
                              <FiEdit2 size={9} />
                            </button>
                          ) : (
                            <button
                              type="button"
                              onClick={() => handleOpenPaymentModal(order)}
                              className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[10px] font-black bg-amber-100 text-amber-900 border border-amber-300 animate-pulse hover:bg-amber-200 transition-colors cursor-pointer"
                              title="Klik untuk bayar QRIS / Cash / Split"
                            >
                              <span>⚠️ BELUM BAYAR</span>
                              <FiDollarSign size={10} />
                            </button>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Catatan Meja */}
                    {order.catatan && (
                      <div className="mt-2 p-1.5 bg-yellow-50 border border-yellow-200 rounded-lg text-[11px] text-yellow-900 font-medium">
                        📌 Catatan: {order.catatan}
                      </div>
                    )}

                    {/* Progress Bar Selesai Diantar */}
                    <div className="mt-2.5">
                      <div className="flex justify-between items-center text-[10px] font-bold text-gray-600 mb-1">
                        <span>Progress Masak/Antar:</span>
                        <span className={progressPct === 100 ? 'text-green-700' : 'text-blue-700'}>
                          {servedCount} dari {totalItems} Menu ({progressPct}%)
                        </span>
                      </div>
                      <div className="w-full h-1.5 bg-gray-200 rounded-full overflow-hidden">
                        <div
                          className={`h-full transition-all duration-300 ${progressPct === 100 ? 'bg-green-600' : 'bg-blue-600'}`}
                          style={{ width: `${progressPct}%` }}
                        ></div>
                      </div>
                    </div>
                  </div>

                  {/* CARD BODY: ITEM LIST */}
                  <div className="p-3.5 space-y-2 flex-1 overflow-y-auto max-h-64 custom-scrollbar">
                    {order.items?.map((item) => {
                      const isCancelled = item.status === 'CANCELLED';
                      const isServed = !!item.is_served;

                      return (
                        <div
                          key={item.id}
                          className={`p-2 rounded-xl border text-xs flex justify-between items-center transition-colors ${
                            isCancelled
                              ? 'bg-red-50/50 border-red-100 opacity-60'
                              : isServed
                              ? 'bg-green-50/70 border-green-200'
                              : 'bg-gray-50 border-gray-200'
                          }`}
                        >
                          <div className="flex-1 pr-2">
                            <div className="flex items-center gap-1.5 flex-wrap">
                              <span className={`font-black text-sm ${isServed ? 'text-green-800' : 'text-gray-900'}`}>
                                {item.jumlah}x
                              </span>
                              <span className={`font-bold ${isCancelled ? 'line-through text-red-500' : isServed ? 'text-green-900' : 'text-gray-800'}`}>
                                {item.food?.nama || 'Menu'}
                              </span>
                              {item.batch_no > 1 && (
                                <span className="text-[9px] font-black text-blue-700 bg-blue-100 border border-blue-200 px-1 py-0.2 rounded">
                                  ⚡ Tambahan #{item.batch_no - 1}
                                </span>
                              )}
                              {isCancelled && (
                                <span className="text-[9px] font-black text-red-700 bg-red-100 px-1 py-0.2 rounded">
                                  Batal
                                </span>
                              )}
                            </div>
                            {item.catatan && (
                              <p className="text-[10px] text-red-600 italic font-medium mt-0.5">* {item.catatan}</p>
                            )}
                          </div>

                          {/* Tombol Checklist Per-Item */}
                          {!isCancelled && !isCompleted && (
                            <button
                              type="button"
                              onClick={() => handleToggleItemServed(item)}
                              className={`px-2.5 py-1 rounded-lg text-xs font-black transition-all flex items-center gap-1 shrink-0 ${
                                isServed
                                  ? 'bg-green-600 text-white hover:bg-green-700'
                                  : 'bg-white text-blue-700 border border-blue-300 hover:bg-blue-50 shadow-xs'
                              }`}
                            >
                              {isServed ? <FiCheck size={13} /> : '🍽️'}
                              {isServed ? 'Diantar' : 'Antar'}
                            </button>
                          )}
                        </div>
                      );
                    })}
                  </div>

                  {/* CARD FOOTER: ACTIONS */}
                  <div className="p-3.5 bg-gray-50 border-t border-gray-100 space-y-2">
                    <div className="flex justify-between items-center text-xs font-bold">
                      <span className="text-gray-500">Total Tagihan:</span>
                      <span className="text-sm font-black text-green-700">{formatRp(order.total)}</span>
                    </div>

                    <div className="grid grid-cols-2 gap-1.5">
                      {/* Tombol Cetak Resi */}
                      <button
                        type="button"
                        onClick={() => handleOpenReceipt(order, 'both')}
                        className="py-2 bg-white hover:bg-gray-100 text-gray-700 font-bold rounded-xl text-xs border border-gray-200 transition-colors flex items-center justify-center gap-1"
                      >
                        <FiPrinter size={13} /> Struk
                      </button>

                      {/* Tombol Batal Order */}
                      {!isCompleted && (
                        <button
                          type="button"
                          onClick={() => handleCancelOrder(order)}
                          className="py-2 bg-red-50 hover:bg-red-100 text-red-700 font-bold rounded-xl text-xs border border-red-200 transition-colors flex items-center justify-center gap-1"
                        >
                          <FiTrash2 size={13} /> Batal
                        </button>
                      )}
                    </div>

                    {/* Tombol Bayar jika UNPAID */}
                    {!isPaid && !isCompleted && (
                      <button
                        type="button"
                        onClick={() => handleOpenPaymentModal(order)}
                        className="w-full py-2.5 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white font-black rounded-xl text-xs shadow-sm transition-all flex items-center justify-center gap-1.5"
                      >
                        <FiDollarSign size={15} /> 💳 Tagih & Bayar Kasir
                      </button>
                    )}

                    {/* Tombol Selesai Pesanan Utama */}
                    {!isCompleted && (
                      <button
                        type="button"
                        onClick={() => handleCompleteOrder(order)}
                        className="w-full py-2.5 bg-green-600 hover:bg-green-700 text-white font-black rounded-xl text-xs shadow-sm transition-all flex items-center justify-center gap-1.5"
                      >
                        <FiCheckCircle size={15} /> ✅ Tandai Selesai & Meja Kosong
                      </button>
                    )}

                    {isCompleted && (
                      <div className="p-2 bg-green-100/80 rounded-xl text-center text-green-800 text-xs font-bold flex items-center justify-center gap-1.5">
                        <FiCheckCircle size={14} /> Pesanan ini telah selesai
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}

      </div>

      {/* MODAL PEMBAYARAN KASIR */}
      {showPaymentModal && payingOrder && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full overflow-hidden border border-gray-200 animate-fadeIn">
            <div className={`p-4 text-white flex justify-between items-center ${
              payingOrder.payment_status === 'PAID'
                ? 'bg-gradient-to-r from-amber-500 to-yellow-600'
                : 'bg-gradient-to-r from-green-600 to-emerald-700'
            }`}>
              <div>
                <h3 className="font-extrabold text-sm flex items-center gap-1.5">
                  <FiDollarSign size={16} /> {payingOrder.payment_status === 'PAID' ? 'Ubah Metode Bayar & Koreksi' : 'Pelunasan Pembayaran Kasir'}
                </h3>
                <p className={`text-[11px] mt-0.5 ${payingOrder.payment_status === 'PAID' ? 'text-amber-100' : 'text-green-100'}`}>
                  Order #{payingOrder.nomor_pesanan} • Meja {payingOrder.table?.nomor_meja || '--'}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setShowPaymentModal(false)}
                className="p-1 rounded-lg hover:bg-white/20 text-white transition-colors"
              >
                <FiX size={18} />
              </button>
            </div>

            <form onSubmit={handleSubmitPayment} className="p-5 space-y-4">
              {/* Box Total */}
              <div className="p-3 bg-gray-50 rounded-xl border border-gray-200 text-center">
                <span className="text-xs text-gray-500 font-bold block uppercase">Total Tagihan</span>
                <span className="text-2xl font-black text-green-700">{formatRp(payingOrder.total)}</span>
              </div>

              {/* Tabs Metode Bayar */}
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1.5">Pilih Metode Pembayaran</label>
                <div className="grid grid-cols-3 gap-1.5">
                  {['QRIS', 'Cash', 'SPLIT'].map((m) => (
                    <button
                      key={m}
                      type="button"
                      onClick={() => {
                        setPaymentMethod(m);
                        if (m === 'QRIS' && payingOrder) {
                          setQrisAmountInput(payingOrder.total.toString());
                          setCashAmountInput('0');
                        } else if (m === 'Cash' && payingOrder) {
                          setCashAmountInput(payingOrder.total.toString());
                          setQrisAmountInput('0');
                        } else if (m === 'SPLIT' && payingOrder) {
                          const half = Math.floor(payingOrder.total / 2);
                          setCashAmountInput(half.toString());
                          setQrisAmountInput((payingOrder.total - half).toString());
                        }
                      }}
                      className={`py-2 rounded-xl text-xs font-black transition-all ${
                        paymentMethod === m
                          ? (m === 'QRIS' ? 'bg-blue-600 text-white shadow-xs' : m === 'SPLIT' ? 'bg-purple-600 text-white shadow-xs' : 'bg-emerald-600 text-white shadow-xs')
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      {m === 'QRIS' ? '📱 QRIS' : m === 'Cash' ? '💵 Cash' : '⚡ SPLIT'}
                    </button>
                  ))}
                </div>
              </div>

              {/* Input Nominal Sesuai Metode */}
              {paymentMethod === 'Cash' && (
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">Jumlah Uang Tunai Diterima (Rp)</label>
                  <input
                    type="number"
                    min="0"
                    value={cashAmountInput}
                    onChange={(e) => setCashAmountInput(e.target.value)}
                    className="w-full px-3 py-2 border rounded-xl text-base font-black text-gray-900 focus:ring-2 focus:ring-green-500"
                    placeholder="0"
                    required
                  />
                  {parseInt(cashAmountInput) > payingOrder.total && (
                    <p className="text-xs font-bold text-green-700 mt-1">
                      Kembalian Tunai: {formatRp(parseInt(cashAmountInput) - payingOrder.total)}
                    </p>
                  )}
                </div>
              )}

              {paymentMethod === 'QRIS' && (
                <div className="p-3 bg-blue-50 border border-blue-200 rounded-xl text-blue-900 text-xs">
                  <p className="font-bold">📱 Pembayaran QRIS / Transfer Bank</p>
                  <p className="mt-0.5">Pastikan customer telah berhasil scan QRIS sejumlah {formatRp(payingOrder.total)}.</p>
                </div>
              )}

              {paymentMethod === 'SPLIT' && (
                <div className="space-y-3 p-3 bg-purple-50/70 border border-purple-200 rounded-xl">
                  <div>
                    <label className="block text-xs font-bold text-purple-900 mb-1">Porsi Uang Tunai (Rp)</label>
                    <input
                      type="number"
                      min="0"
                      value={cashAmountInput}
                      onChange={(e) => setCashAmountInput(e.target.value)}
                      className="w-full px-3 py-2 border rounded-xl text-sm font-bold text-gray-900"
                      placeholder="0"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-purple-900 mb-1">Porsi QRIS / Transfer (Rp)</label>
                    <input
                      type="number"
                      min="0"
                      value={qrisAmountInput}
                      onChange={(e) => setQrisAmountInput(e.target.value)}
                      className="w-full px-3 py-2 border rounded-xl text-sm font-bold text-gray-900"
                      placeholder="0"
                    />
                  </div>
                  <div className="text-xs font-bold text-purple-950 flex justify-between pt-1 border-t border-purple-200">
                    <span>Total Gabungan:</span>
                    <span>{formatRp((parseInt(cashAmountInput) || 0) + (parseInt(qrisAmountInput) || 0))}</span>
                  </div>
                </div>
              )}

              {/* Form Buttons */}
              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowPaymentModal(false)}
                  className="flex-1 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold rounded-xl text-xs transition-colors"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={isSubmittingPayment}
                  className={`flex-1 py-2.5 text-white font-extrabold rounded-xl text-xs shadow-sm transition-all disabled:opacity-50 ${
                    payingOrder.payment_status === 'PAID'
                      ? 'bg-amber-600 hover:bg-amber-700'
                      : 'bg-green-600 hover:bg-green-700'
                  }`}
                >
                  {isSubmittingPayment
                    ? 'Memproses...'
                    : (payingOrder.payment_status === 'PAID' ? '💾 Simpan Perubahan Metode' : '✅ Lunaskan Pembayaran')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL CETAK STRUK RESI */}
      {showReceiptModal && selectedReceiptOrder && (() => {
        const activeTypeToRender = receiptType === 'both'
          ? (bothPrintStep === 1 ? 'customer' : 'kitchen')
          : receiptType;

        const handlePrintStep = () => {
          if (receiptType === 'both') {
            if (bothPrintStep === 1) {
              window.print();
              setBothPrintStep(2);
            } else if (bothPrintStep === 2) {
              window.print();
              setBothPrintStep(3);
            } else {
              setBothPrintStep(1);
            }
          } else {
            window.print();
          }
        };

        return (
          <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full max-h-[92vh] flex flex-col overflow-hidden border border-gray-200">
              <div className="p-3 bg-gray-50 border-b flex justify-between items-center shrink-0">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-extrabold text-sm text-gray-800 flex items-center gap-1.5">
                      <FiPrinter className="text-green-600" /> Cetak Resi
                    </span>
                    <span className="text-xs px-2 py-0.5 rounded font-bold bg-green-100 text-green-800">
                      Meja {selectedReceiptOrder.table?.nomor_meja || '--'}
                    </span>
                  </div>
                  <div className="flex items-center gap-1.5 mt-1.5">
                    <button
                      onClick={() => { setReceiptType('both'); setBothPrintStep(1); }}
                      className={`px-2 py-0.5 rounded-lg text-xs font-black transition-all ${
                        receiptType === 'both' ? 'bg-green-600 text-white shadow-xs' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                      }`}
                    >
                      ✂️ 2 Lembar
                    </button>
                    <button
                      onClick={() => setReceiptType('customer')}
                      className={`px-2 py-0.5 rounded-lg text-xs font-bold transition-all ${
                        receiptType === 'customer' ? 'bg-green-600 text-white shadow-xs' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                      }`}
                    >
                      🖨️ Customer
                    </button>
                    <button
                      onClick={() => setReceiptType('kitchen')}
                      className={`px-2 py-0.5 rounded-lg text-xs font-bold transition-all ${
                        receiptType === 'kitchen' ? 'bg-blue-600 text-white shadow-xs' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                      }`}
                    >
                      🍳 Dapur
                    </button>
                  </div>
                </div>
                <button
                  onClick={() => setShowReceiptModal(false)}
                  className="p-1.5 rounded-lg hover:bg-gray-200 text-gray-500 hover:text-gray-800 transition-colors"
                >
                  <FiX size={18} />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto p-4 bg-gray-100 custom-scrollbar">
                <Receipt order={selectedReceiptOrder} type={activeTypeToRender} paperSize="80mm" />
              </div>

              <div className="p-3 bg-white border-t space-y-1.5 shrink-0">
                <button
                  type="button"
                  onClick={handlePrintStep}
                  className="w-full py-2.5 bg-green-600 hover:bg-green-700 text-white rounded-xl text-xs sm:text-sm font-black flex items-center justify-center gap-1.5 shadow-sm"
                >
                  <FiPrinter size={16} /> Print {receiptType === 'both' ? `[Klik ${bothPrintStep}]` : ''} Sekarang
                </button>
                <button
                  type="button"
                  onClick={() => setShowReceiptModal(false)}
                  className="w-full py-1.5 bg-gray-100 hover:bg-gray-200 text-gray-600 font-bold rounded-xl text-xs transition-colors"
                >
                  Tutup
                </button>
              </div>
            </div>
          </div>
        );
      })()}

      {/* MODAL BUKU PANDUAN KASIR */}
      <CashierGuideModal
        isOpen={showGuideModal}
        onClose={() => setShowGuideModal(false)}
      />
    </Sidebar>
  );
}
