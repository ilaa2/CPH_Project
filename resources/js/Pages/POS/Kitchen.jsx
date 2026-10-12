import React, { useState, useEffect, useRef } from 'react';
import { Head, usePage, router } from '@inertiajs/react';
import Sidebar from '@/Components/Bar/Sidebar';
import Swal from 'sweetalert2';
import {
  FiTv, FiClock, FiCheckCircle, FiAlertCircle, FiVolume2, FiVolumeX,
  FiRefreshCw, FiCheck, FiX, FiRotateCcw, FiList
} from 'react-icons/fi';

// Web Audio API Synthesizer Sound Generator (Guaranteed Sound without external files)
const playNotificationChime = () => {
  try {
    const AudioContext = window.AudioContext || window.webkitAudioContext;
    if (!AudioContext) return;
    const ctx = new AudioContext();
    
    // Tone 1 (High chime E5)
    const osc1 = ctx.createOscillator();
    const gain1 = ctx.createGain();
    osc1.type = 'sine';
    osc1.frequency.setValueAtTime(659.25, ctx.currentTime);
    gain1.gain.setValueAtTime(0.4, ctx.currentTime);
    gain1.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.3);
    osc1.connect(gain1);
    gain1.connect(ctx.destination);
    osc1.start(ctx.currentTime);
    osc1.stop(ctx.currentTime + 0.3);
    
    // Tone 2 (Higher chime A5)
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
    console.error('Audio synth chime error', e);
  }
};

// Web Speech API Voice Synthesizer (Bahasa Indonesia Voice)
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
    if (idVoice) {
      utterance.voice = idVoice;
    }

    window.speechSynthesis.speak(utterance);
  } catch (e) {
    console.error('Speech synthesis error', e);
  }
};

const playAudioAndVoice = (voiceText) => {
  playNotificationChime();
  if (voiceText) {
    setTimeout(() => {
      speakVoiceNotification(voiceText);
    }, 350);
  }
};

export default function Kitchen({
  newOrders = [],
  processingOrders = [],
  readyOrders = [],
  completedOrders = [],
  tablesNeedingCleaning = []
}) {
  const [activeMobileTab, setActiveMobileTab] = useState('processing'); // 'new', 'processing', 'completed', 'cleaning'
  const [soundEnabled, setSoundEnabled] = useState(false);
  const [showHistoryModal, setShowHistoryModal] = useState(false);
  const [showCleaningModal, setShowCleaningModal] = useState(false);
  const prevNewCount = useRef(newOrders.length);

  // Ambil daftar pesanan selesai (fallback ke readyOrders jika data lama)
  const finishedOrders = (completedOrders && completedOrders.length > 0)
    ? completedOrders
    : readyOrders;

  // Auto Polling State every 5 seconds for Realtime KDS Updates
  useEffect(() => {
    const interval = setInterval(() => {
      router.reload({
        only: ['newOrders', 'processingOrders', 'completedOrders', 'tablesNeedingCleaning'],
        preserveScroll: true,
        preserveState: true,
      });
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  // Toggle Sound with Instant Audio Test Chime & Voice
  const toggleSound = () => {
    const nextState = !soundEnabled;
    setSoundEnabled(nextState);
    if (nextState) {
      playAudioAndVoice('Notifikasi suara dapur aktif');
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

  // Play audio alert & voice if new order arrives
  useEffect(() => {
    if (newOrders.length > prevNewCount.current) {
      const latestOrder = newOrders[0];
      const tableNum = latestOrder?.table?.nomor_meja || '';
      const custName = latestOrder?.nama_pelanggan;

      if (soundEnabled) {
        const speechText = custName 
          ? `Pesanan baru masuk, Nomor Antrian ${tableNum}, atas nama ${custName}`
          : `Pesanan baru masuk, Nomor Antrian ${tableNum}`;
        playAudioAndVoice(speechText);
      }

      Swal.fire({
        toast: true,
        position: 'top-end',
        icon: 'info',
        title: '🔔 PESANAN BARU MASUK!',
        text: `Ada ${newOrders.length - prevNewCount.current} pesanan baru dari Kasir.`,
        showConfirmButton: false,
        timer: 4000,
        background: '#15803d',
        color: '#ffffff',
      });
    }
    prevNewCount.current = newOrders.length;
  }, [newOrders.length, soundEnabled, newOrders]);

  // Update Status Order (NEW -> PROCESSING / COMPLETED)
  const handleUpdateStatus = (orderId, status, tableNum) => {
    const targetUrl = `/kitchen/order/${orderId}/status`;

    router.post(targetUrl, {
      order_status: status,
    }, {
      preserveScroll: true,
      onSuccess: () => {
        let msg = 'Pesanan Diproses';
        let voiceText = `Pesanan Nomor Antrian ${tableNum || ''} sedang diproses`;

        if (status === 'COMPLETED') {
          msg = 'Pesanan Selesai Diantar!';
          voiceText = `Semua menu nomor antrian ${tableNum || ''} selesai diantar`;
        }

        if (soundEnabled) {
          playAudioAndVoice(voiceText);
        }

        Swal.fire({
          toast: true,
          position: 'top-end',
          icon: 'success',
          title: msg,
          showConfirmButton: false,
          timer: 2200,
        });
      }
    });
  };

  // Tandai 1 item selesai dimasak / diantar duluan ke meja
  // JIKA SEMUA ITEM SELESAI, SISTEM OTOMATIS SELESAIKAN PESANAN!
  const handleToggleItemServed = (itemId, foodName, tableNum, orderId, willAutoComplete = false) => {
    const targetUrl = orderId ? `/kitchen/order/${orderId}/status` : `/kitchen/item/${itemId}/toggle-served`;

    router.post(targetUrl, {
      toggle_item_id: itemId,
    }, {
      preserveScroll: true,
      preserveState: true,
      onSuccess: () => {
        if (willAutoComplete) {
          if (soundEnabled) {
            playAudioAndVoice(`Semua menu nomor antrian ${tableNum || ''} selesai diantar`);
          }
          Swal.fire({
            toast: true,
            position: 'top-end',
            icon: 'success',
            title: `🎉 No. Antrian ${tableNum} Selesai Otomatis!`,
            text: 'Semua hidangan telah diantar ke meja pelanggan.',
            showConfirmButton: false,
            timer: 3000,
          });
        } else {
          if (soundEnabled) {
            playAudioAndVoice(`${foodName} diantar ke nomor antrian ${tableNum || ''}`);
          }
        }
      },
      onError: (err) => {
        console.error('Toggle item error:', err);
      }
    });
  };

  // Clean Table (NEEDS_CLEANING -> AVAILABLE)
  const handleCleanTable = (tableId, tableNum) => {
    router.post(`/kitchen/table/${tableId}/clean`, {}, {
      preserveScroll: true,
      onSuccess: () => {
        if (soundEnabled) {
          playAudioAndVoice(`Nomor Antrian ${tableNum || ''} siap digunakan kembali`);
        }

        Swal.fire({
          toast: true,
          position: 'top-end',
          icon: 'success',
          title: `No. Antrian ${tableNum} Ready!`,
          text: 'Kartu nomor antrian dapat dikembalikan ke kasir.',
          showConfirmButton: false,
          timer: 2500,
        });
      }
    });
  };

  return (
    <Sidebar header={
      <div className="flex flex-wrap justify-between items-center w-full gap-2">
        <div className="flex items-center gap-2">
          <h2 className="text-xl font-black text-gray-800 flex items-center gap-2">
            <FiTv className="text-green-600" /> Kitchen Display System (KDS Dapur)
          </h2>
          <span className="hidden sm:inline-block px-2 py-0.5 rounded-full text-[11px] font-bold bg-green-100 text-green-800">
            Auto-Complete Aktif ⚡
          </span>
        </div>

        <div className="flex items-center gap-2">
          {/* Tombol Riwayat Selesai */}
          <button
            onClick={() => setShowHistoryModal(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold bg-white hover:bg-gray-100 text-gray-700 border border-gray-300 shadow-2xs transition-colors"
            title="Lihat pesanan yang sudah selesai hari ini"
          >
            <FiList size={14} className="text-blue-600" />
            <span>Riwayat Selesai ({finishedOrders.length})</span>
          </button>

          {/* Tombol Kartu Antrian Butuh Direset */}
          {tablesNeedingCleaning.length > 0 && (
            <button
              onClick={() => setShowCleaningModal(true)}
              className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-black bg-amber-500 hover:bg-amber-600 text-white shadow-2xs transition-colors animate-pulse"
              title="Ada kartu nomor antrian yang siap dikembalikan"
            >
              <FiAlertCircle size={14} />
              <span>{tablesNeedingCleaning.length} Kartu Selesai</span>
            </button>
          )}

          {/* Tombol Suara */}
          <button
            onClick={toggleSound}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-colors ${soundEnabled ? 'bg-green-600 text-white shadow-xs' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}`}
          >
            {soundEnabled ? <FiVolume2 size={16} /> : <FiVolumeX size={16} />}
            <span className="hidden sm:inline">{soundEnabled ? 'Suara Aktif' : 'Aktifkan Suara'}</span>
          </button>

          {/* Tombol Refresh */}
          <button
            onClick={() => router.reload()}
            className="p-1.5 rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-600 transition-colors"
            title="Segarkan Layar"
          >
            <FiRefreshCw size={16} />
          </button>
        </div>
      </div>
    }>
      <Head title="Kitchen Display System - Central Palantea" />

      {/* MOBILE TABS (Tampil hanya di layar HP kecil) */}
      <div className="flex lg:hidden overflow-x-auto gap-2 mb-4 pb-1">
        <button
          onClick={() => setActiveMobileTab('new')}
          className={`px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap flex items-center gap-1.5 ${activeMobileTab === 'new' ? 'bg-red-600 text-white' : 'bg-white border text-gray-700'}`}
        >
          🚨 Baru ({newOrders.length})
        </button>
        <button
          onClick={() => setActiveMobileTab('processing')}
          className={`px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap flex items-center gap-1.5 ${activeMobileTab === 'processing' ? 'bg-blue-600 text-white' : 'bg-white border text-gray-700'}`}
        >
          👩‍🍳 Sedang Dimasak ({processingOrders.length})
        </button>
        <button
          onClick={() => setShowHistoryModal(true)}
          className="px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap flex items-center gap-1.5 bg-white border text-gray-700"
        >
          ✅ Riwayat Selesai ({finishedOrders.length})
        </button>
      </div>

      {/* WIDE 2-SECTION KDS LAYOUT (Anti-Scroll: Memasak Disusun Grid Berjejer ke Samping) */}
      <div className="flex flex-col lg:flex-row gap-5 items-start w-full">

        {/* SECTION 1: PESANAN BARU (KIRI - RAMPING ~300px) */}
        <div className={`w-full lg:w-80 xl:w-88 shrink-0 space-y-3 ${activeMobileTab !== 'new' ? 'hidden lg:block' : ''}`}>
          <div className="bg-red-600 text-white p-3 rounded-2xl shadow-sm flex justify-between items-center">
            <h3 className="font-extrabold text-sm uppercase tracking-wider flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-white animate-ping"></span>
              1. PESANAN BARU
            </h3>
            <span className="bg-white text-red-700 text-xs font-black px-2.5 py-0.5 rounded-full shadow-2xs">
              {newOrders.length}
            </span>
          </div>

          <div className="space-y-3 max-h-[calc(100vh-170px)] overflow-y-auto pr-1">
            {newOrders.length === 0 ? (
              <div className="bg-white border border-dashed border-gray-300 rounded-2xl p-8 text-center text-gray-400">
                <FiCheckCircle size={32} className="mx-auto mb-2 opacity-40 text-green-500" />
                <p className="text-xs font-semibold">Tidak ada antrian pesanan baru.</p>
              </div>
            ) : (
              newOrders.map(order => (
                <div key={order.id} className="bg-white border-2 border-red-500 rounded-2xl shadow-md p-4 space-y-3">
                  {/* HEADER ANTRIAN */}
                  <div className="flex justify-between items-start bg-red-50/80 border border-red-200 p-2.5 rounded-xl">
                    <div>
                      <span className="text-[10px] uppercase font-bold text-red-600 tracking-wider block">NO. ANTRIAN</span>
                      <span className="text-3xl font-black text-red-700 block leading-tight">NO. {order.table?.nomor_meja}</span>
                      <span className="text-xs font-bold text-gray-900 block mt-1">
                        👤 {order.nama_pelanggan || 'Pelanggan'}
                      </span>
                    </div>
                    <div className="text-right">
                      <span className="text-xs font-semibold text-gray-700 flex items-center gap-1 justify-end">
                        <FiClock size={12} /> {new Date(order.created_at).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}
                      </span>
                      {order.payment_status === 'UNPAID' ? (
                        <span className="inline-block text-[10px] font-black px-2 py-0.5 rounded bg-amber-100 text-amber-900 border border-amber-300 mt-1 shadow-2xs">
                          ⚠️ BELUM BAYAR
                        </span>
                      ) : (
                        <span className="inline-block text-[10px] font-black px-2 py-0.5 rounded bg-green-100 text-green-800 border border-green-300 mt-1 shadow-2xs">
                          ✅ LUNAS
                        </span>
                      )}
                    </div>
                  </div>

                  {/* ITEMS LIST */}
                  <div className="space-y-1.5 border-y py-2 text-xs">
                    {order.items?.map((item, idx) => (
                      <div key={idx} className="font-bold text-gray-900 border-b border-gray-100 pb-1 last:border-0 last:pb-0">
                        <div className="flex justify-between items-center">
                          <span className="text-sm">
                            <span className="text-red-600 font-black">{item.jumlah}x</span> {item.food?.nama}
                          </span>
                        </div>
                        {item.catatan && (
                          <p className="text-[11px] font-bold text-red-600 italic block mt-0.5">
                            * {item.catatan}
                          </p>
                        )}
                      </div>
                    ))}
                  </div>

                  {order.catatan && (
                    <div className="bg-amber-50 border border-amber-200 p-2 rounded-lg text-xs">
                      <span className="font-bold text-amber-900 block">Catatan Pesanan:</span>
                      <span className="text-amber-800 font-semibold italic">{order.catatan}</span>
                    </div>
                  )}

                  {/* TOMBOL TERIMA & MULAI MASAK */}
                  <button
                    onClick={() => handleUpdateStatus(order.id, 'PROCESSING', order.table?.nomor_meja)}
                    className="w-full py-2.5 bg-red-600 hover:bg-red-700 active:scale-[0.98] text-white font-black text-xs uppercase rounded-xl shadow-md transition-all flex items-center justify-center gap-1.5"
                  >
                    👩‍🍳 TERIMA & MULAI MASAK
                  </button>
                </div>
              ))
            )}
          </div>
        </div>

        {/* SECTION 2: AREA MEMASAK & DIANTAR (KANAN - LEBAR, FORMAT GRID BERJAJAR KE SAMPING) */}
        <div className={`flex-1 min-w-0 space-y-3 ${activeMobileTab !== 'processing' ? 'hidden lg:block' : ''}`}>
          <div className="bg-blue-600 text-white p-3 rounded-2xl shadow-sm flex flex-wrap justify-between items-center gap-2">
            <div className="flex items-center gap-2">
              <h3 className="font-black text-sm uppercase tracking-wider flex items-center gap-2">
                <FiClock size={16} /> 2. SEDANG DIMASAK & DIANTAR
              </h3>
              <span className="bg-white text-blue-700 text-xs font-black px-2.5 py-0.5 rounded-full shadow-2xs">
                {processingOrders.length}
              </span>
            </div>
            <span className="text-[11px] font-medium bg-blue-700/80 px-2.5 py-0.5 rounded-full">
              💡 Menu matang langsung klik <strong>Antar</strong> • Otomatis selesai jika semua menu diantar
            </span>
          </div>

          <div className="max-h-[calc(100vh-170px)] overflow-y-auto pr-1">
            {processingOrders.length === 0 ? (
              <div className="bg-white border-2 border-dashed border-gray-200 rounded-2xl p-12 text-center text-gray-400">
                <div className="w-16 h-16 rounded-full bg-blue-50 text-blue-500 mx-auto flex items-center justify-center mb-3">
                  <FiCheckCircle size={32} />
                </div>
                <h4 className="text-base font-bold text-gray-700 mb-1">Dapur Sedang Santai</h4>
                <p className="text-xs text-gray-400 max-w-sm mx-auto">
                  Belum ada pesanan yang sedang dimasak. Klik <strong>"Terima & Mulai Masak"</strong> pada pesanan baru di kolom sebelah kiri.
                </p>
              </div>
            ) : (
              /* GRID BERJAJAR KE SAMPING: 2 ATAU 3 KOLOM KARTU (TIDAK PERLU SCROLL KE BAWAH) */
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 pb-4">
                {processingOrders.map(order => {
                  const totalItems = order.items?.length || 0;
                  const servedItems = order.items?.filter(i => i.is_served)?.length || 0;
                  const isAllServed = totalItems > 0 && servedItems === totalItems;
                  const percent = Math.round(totalItems > 0 ? (servedItems / totalItems) * 100 : 0);

                  return (
                    <div
                      key={order.id}
                      className="bg-white border-2 border-blue-400 rounded-2xl shadow-sm hover:shadow-md transition-all p-4 space-y-3 flex flex-col justify-between"
                    >
                      <div>
                        {/* HEADER KARTU MEJA */}
                        <div className="flex justify-between items-start bg-blue-50 border border-blue-200 p-2.5 rounded-xl mb-3">
                          <div>
                            <span className="text-[10px] uppercase font-bold text-blue-600 tracking-wider block">NO. ANTRIAN</span>
                            <span className="text-3xl font-black text-blue-900 block leading-tight">NO. {order.table?.nomor_meja}</span>
                            <span className="text-xs font-bold text-gray-900 block mt-0.5">
                              👤 {order.nama_pelanggan || 'Pelanggan'}
                            </span>
                          </div>
                          <div className="text-right">
                            <span className="text-xs font-semibold text-gray-700 flex items-center gap-1 justify-end">
                              <FiClock size={12} /> {new Date(order.created_at).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}
                            </span>
                            {order.payment_status === 'UNPAID' ? (
                              <span className="inline-block text-[10px] font-black px-2 py-0.5 rounded bg-amber-100 text-amber-900 border border-amber-300 mt-1 shadow-2xs">
                                ⚠️ BELUM BAYAR
                              </span>
                            ) : (
                              <span className="inline-block text-[10px] font-black px-2 py-0.5 rounded bg-green-100 text-green-800 border border-green-300 mt-1 shadow-2xs">
                                ✅ LUNAS
                              </span>
                            )}
                          </div>
                        </div>

                        {/* PROGRESS BAR PENGANTARAN */}
                        <div className="space-y-1.5 mb-3">
                          <div className="flex justify-between items-center text-[11px] font-bold">
                            <span className="text-gray-600 flex items-center gap-1">
                              🍽️ Progress Diantar:
                            </span>
                            <span className={isAllServed ? "text-green-700 bg-green-100 px-2 py-0.5 rounded-full text-[10px] font-black" : "text-blue-700 bg-blue-100 px-2 py-0.5 rounded-full text-[10px]"}>
                              {servedItems} dari {totalItems} Menu ({percent}%)
                            </span>
                          </div>
                          <div className="w-full bg-gray-200 h-2 rounded-full overflow-hidden">
                            <div
                              className={`h-full transition-all duration-300 ${isAllServed ? 'bg-green-500' : 'bg-blue-600'}`}
                              style={{ width: `${percent}%` }}
                            ></div>
                          </div>
                        </div>

                        {/* DAFTAR MENU DENGAN CHECKLIST ANTAR */}
                        <div className="space-y-2 text-xs">
                          {order.items?.map((item, idx) => {
                            const isServed = !!item.is_served;
                            // Jika belum diantar, dan setelah ini diantar jumlahnya memenuhi totalItems, maka otomatis selesai!
                            const willAutoComplete = !isServed && (servedItems + 1 >= totalItems);

                            return (
                              <div
                                key={item.id || idx}
                                className={`p-2 rounded-xl border transition-all flex items-center justify-between gap-2 ${
                                  isServed
                                    ? 'bg-green-50/70 border-green-200 shadow-2xs'
                                    : 'bg-gray-50 border-gray-200 hover:border-blue-300'
                                }`}
                              >
                                <div className="flex-1 min-w-0">
                                  <div className="flex items-center gap-1.5">
                                    <span className={`text-base font-black shrink-0 ${isServed ? 'text-green-700' : 'text-blue-600'}`}>
                                      {item.jumlah}x
                                    </span>
                                    <span className={`text-xs font-bold leading-tight ${isServed ? 'text-gray-400 line-through' : 'text-gray-900'}`}>
                                      {item.food?.nama}
                                    </span>
                                  </div>
                                  {item.catatan && (
                                    <p className="text-[10px] font-bold text-red-600 italic mt-0.5">
                                      * {item.catatan}
                                    </p>
                                  )}
                                </div>

                                <button
                                  type="button"
                                  onClick={() => handleToggleItemServed(item.id, item.food?.nama, order.table?.nomor_meja, order.id, willAutoComplete)}
                                  className={`shrink-0 px-3 py-1.5 rounded-lg text-xs font-black transition-all flex items-center gap-1 shadow-2xs active:scale-95 ${
                                    isServed
                                      ? 'bg-green-600 hover:bg-green-700 text-white'
                                      : 'bg-white hover:bg-blue-600 text-blue-700 hover:text-white border-2 border-blue-400'
                                  }`}
                                  title={isServed ? "Sudah diantar. Klik untuk batalkan jika salah." : "Klik jika masakan ini sudah diantar ke meja"}
                                >
                                  {isServed ? (
                                    <>
                                      <FiCheck size={14} className="stroke-[3]" />
                                      <span>Diantar</span>
                                    </>
                                  ) : (
                                    <>
                                      <span>🍽️ Antar</span>
                                    </>
                                  )}
                                </button>
                              </div>
                            );
                          })}
                        </div>

                        {order.catatan && (
                          <div className="bg-amber-50 border border-amber-200 p-2 rounded-lg text-xs mt-3">
                            <span className="font-bold text-amber-900 block">Catatan Pesanan:</span>
                            <span className="text-amber-800 font-semibold italic">{order.catatan}</span>
                          </div>
                        )}
                      </div>

                      {/* TOMBOL CEPAT JIKA MAU SELESAIKAN LANGSUNG SEMUA */}
                      <div className="pt-2">
                        <button
                          onClick={() => handleUpdateStatus(order.id, 'COMPLETED', order.table?.nomor_meja)}
                          className="w-full py-2 bg-gray-100 hover:bg-green-600 text-gray-700 hover:text-white font-extrabold text-[11px] uppercase rounded-xl border border-gray-200 hover:border-green-600 shadow-2xs transition-all flex items-center justify-center gap-1"
                          title="Klik jika semua makanan meja ini sudah diantar sekaligus"
                        >
                          <FiCheck size={14} /> Selesaikan Semua Sekarang
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

      </div>

      {/* MODAL RIWAYAT SELESAI HARI INI */}
      {showHistoryModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[85vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            {/* Header Modal */}
            <div className="p-4 bg-gray-900 text-white flex justify-between items-center">
              <div>
                <h3 className="font-black text-base flex items-center gap-2">
                  <FiCheckCircle className="text-green-400" /> Riwayat Pesanan Selesai Hari Ini
                </h3>
                <p className="text-xs text-gray-400">Daftar pesanan yang telah selesai diantar ke pelanggan</p>
              </div>
              <button
                onClick={() => setShowHistoryModal(false)}
                className="p-1 rounded-lg text-gray-400 hover:text-white hover:bg-gray-800 transition-colors"
              >
                <FiX size={20} />
              </button>
            </div>

            {/* Konten Riwayat */}
            <div className="p-4 overflow-y-auto space-y-3 flex-1">
              {finishedOrders.length === 0 ? (
                <div className="text-center py-10 text-gray-400">
                  <p className="text-sm">Belum ada pesanan yang diselesaikan hari ini.</p>
                </div>
              ) : (
                finishedOrders.map(order => (
                  <div key={order.id} className="p-3.5 bg-gray-50 border border-gray-200 rounded-xl flex flex-col sm:flex-row justify-between sm:items-center gap-3">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-lg font-black text-gray-800">NO. {order.table?.nomor_meja}</span>
                        <span className="text-xs font-semibold text-gray-600">👤 {order.nama_pelanggan || 'Pelanggan'}</span>
                        <span className="text-[10px] font-bold text-green-700 bg-green-100 px-2 py-0.5 rounded-full">
                          Selesai
                        </span>
                      </div>
                      <div className="text-xs text-gray-500 mt-1">
                        {order.items?.map(i => `${i.jumlah}x ${i.food?.nama}`).join(', ')}
                      </div>
                      <span className="text-[10px] text-gray-400 block mt-0.5">
                        Jam Selesai: {new Date(order.updated_at).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>

                    <button
                      onClick={() => {
                        handleUpdateStatus(order.id, 'PROCESSING', order.table?.nomor_meja);
                        setShowHistoryModal(false);
                      }}
                      className="px-3 py-1.5 rounded-lg text-xs font-bold text-amber-700 hover:bg-amber-100 border border-amber-300 flex items-center gap-1 self-start sm:self-auto transition-colors"
                      title="Kembalikan pesanan ini ke antrian memasak jika salah klik selesai"
                    >
                      <FiRotateCcw size={12} />
                      <span>Masak Kembali</span>
                    </button>
                  </div>
                ))
              )}
            </div>

            {/* Footer Modal */}
            <div className="p-3 bg-gray-100 border-t flex justify-end">
              <button
                onClick={() => setShowHistoryModal(false)}
                className="px-4 py-2 bg-gray-800 hover:bg-gray-900 text-white rounded-xl text-xs font-bold transition-colors"
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL KARTU ANTRIAN SIAP DIKEMBALIKAN */}
      {showCleaningModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full max-h-[85vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="p-4 bg-amber-600 text-white flex justify-between items-center">
              <div>
                <h3 className="font-black text-base flex items-center gap-2">
                  <FiAlertCircle /> Kartu Nomor Antrian Siap Digunakan
                </h3>
                <p className="text-xs text-amber-100">Ambil kartu antrian dari meja pelanggan dan reset untuk kasir</p>
              </div>
              <button
                onClick={() => setShowCleaningModal(false)}
                className="p-1 rounded-lg text-amber-200 hover:text-white hover:bg-amber-700 transition-colors"
              >
                <FiX size={20} />
              </button>
            </div>

            <div className="p-4 overflow-y-auto space-y-3 flex-1">
              {tablesNeedingCleaning.length === 0 ? (
                <div className="text-center py-8 text-gray-400">
                  <FiCheckCircle size={32} className="mx-auto mb-2 text-green-500 opacity-60" />
                  <p className="text-xs font-semibold">Semua kartu nomor antrian sudah tersedia di kasir!</p>
                </div>
              ) : (
                tablesNeedingCleaning.map(table => (
                  <div key={table.id} className="p-3 bg-amber-50 border border-amber-300 rounded-xl flex justify-between items-center">
                    <div>
                      <span className="text-2xl font-black text-amber-900">NO. {table.nomor_meja}</span>
                      <span className="text-xs text-amber-700 block">Meja selesai digunakan</span>
                    </div>

                    <button
                      onClick={() => handleCleanTable(table.id, table.nomor_meja)}
                      className="px-3 py-2 bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold rounded-lg shadow-2xs transition-colors flex items-center gap-1"
                    >
                      ✨ Reset (Siap Dipakai)
                    </button>
                  </div>
                ))
              )}
            </div>

            <div className="p-3 bg-gray-100 border-t flex justify-end">
              <button
                onClick={() => setShowCleaningModal(false)}
                className="px-4 py-2 bg-gray-800 hover:bg-gray-900 text-white rounded-xl text-xs font-bold transition-colors"
              >
                Selesai
              </button>
            </div>
          </div>
        </div>
      )}

    </Sidebar>
  );
}
