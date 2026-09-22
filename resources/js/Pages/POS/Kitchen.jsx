import React, { useState, useEffect, useRef } from 'react';
import { Head, useForm, usePage, router } from '@inertiajs/react';
import Sidebar from '@/Components/Bar/Sidebar';
import Swal from 'sweetalert2';
import {
  FiTv, FiClock, FiCheckCircle, FiAlertCircle, FiVolume2, FiVolumeX,
  FiRefreshCw, FiArrowRight, FiCheck, FiCheckSquare, FiTrash2
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

export default function Kitchen({ newOrders = [], processingOrders = [], readyOrders = [], tablesNeedingCleaning = [] }) {
  const [activeTab, setActiveTab] = useState('new'); // 'new', 'processing', 'ready', 'cleaning'
  const [soundEnabled, setSoundEnabled] = useState(false);
  const prevNewCount = useRef(newOrders.length);

  // Auto Polling State every 5 seconds for Realtime KDS Updates
  useEffect(() => {
    const interval = setInterval(() => {
      router.reload({
        only: ['newOrders', 'processingOrders', 'readyOrders', 'tablesNeedingCleaning'],
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

  // Update Status Order (NEW -> PROCESSING -> READY -> COMPLETED)
  const handleUpdateStatus = (orderId, status, tableNum) => {
    router.post(route('pos.kitchen.order.status', orderId), {
      order_status: status,
    }, {
      preserveScroll: true,
      onSuccess: () => {
        let msg = 'Pesanan Diproses';
        let voiceText = `Pesanan Nomor Antrian ${tableNum || ''} sedang diproses`;

        if (status === 'READY') {
          msg = 'Pesanan Siap Disajikan';
          voiceText = `Pesanan Nomor Antrian ${tableNum || ''} siap disajikan`;
        }
        if (status === 'COMPLETED') {
          msg = 'Pesanan Selesai Diserahkan!';
          voiceText = `Pesanan Nomor Antrian ${tableNum || ''} selesai diserahkan`;
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
          timer: 2000,
        });
      }
    });
  };

  // Clean Table (NEEDS_CLEANING -> AVAILABLE)
  const handleCleanTable = (tableId, tableNum) => {
    router.post(route('pos.kitchen.table.clean', tableId), {}, {
      preserveScroll: true,
      onSuccess: () => {
        if (soundEnabled) {
          playAudioAndVoice(`Nomor Antrian ${tableNum || ''} siap digunakan kembali`);
        }

        Swal.fire({
          toast: true,
          position: 'top-end',
          icon: 'success',
          title: `No. Antrian ${tableNum} Ready Dipakai Kembali!`,
          text: 'Kartu nomor antrian dapat dikembalikan ke kasir.',
          showConfirmButton: false,
          timer: 2500,
        });
      }
    });
  };

  return (
    <Sidebar header={
      <div className="flex justify-between items-center w-full">
        <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
          <FiTv className="text-green-600" /> Kitchen Display System (KDS Dapur)
        </h2>
        <button
          onClick={toggleSound}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-colors ${soundEnabled ? 'bg-green-600 text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}`}
        >
          {soundEnabled ? <FiVolume2 size={16} /> : <FiVolumeX size={16} />}
          {soundEnabled ? 'Suara Aktif' : 'Aktifkan Suara'}
        </button>
      </div>
    }>
      <Head title="Kitchen Display System - Central Palantea" />

      {/* MOBILE TABS */}
      <div className="flex lg:hidden overflow-x-auto gap-2 mb-4 pb-1">
        <button
          onClick={() => setActiveTab('new')}
          className={`px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap flex items-center gap-1.5 ${activeTab === 'new' ? 'bg-red-600 text-white' : 'bg-white border text-gray-700'}`}
        >
          🚨 Baru ({newOrders.length})
        </button>
        <button
          onClick={() => setActiveTab('processing')}
          className={`px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap flex items-center gap-1.5 ${activeTab === 'processing' ? 'bg-blue-600 text-white' : 'bg-white border text-gray-700'}`}
        >
          👩‍🍳 Diproses ({processingOrders.length})
        </button>
        <button
          onClick={() => setActiveTab('ready')}
          className={`px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap flex items-center gap-1.5 ${activeTab === 'ready' ? 'bg-green-600 text-white' : 'bg-white border text-gray-700'}`}
        >
          ✅ Siap ({readyOrders.length})
        </button>
        <button
          onClick={() => setActiveTab('cleaning')}
          className={`px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap flex items-center gap-1.5 ${activeTab === 'cleaning' ? 'bg-amber-600 text-white' : 'bg-white border text-gray-700'}`}
        >
          🧹 Bersihkan ({tablesNeedingCleaning.length})
        </button>
      </div>

      {/* DESKTOP 4-COLUMN KDS BOARD */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">

        {/* COLUMN 1: PESANAN BARU (NEW) */}
        <div className={`space-y-3 ${activeTab !== 'new' ? 'hidden lg:block' : ''}`}>
          <div className="bg-red-600 text-white p-3 rounded-xl shadow-sm flex justify-between items-center">
            <h3 className="font-extrabold text-sm uppercase tracking-wider flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-white animate-ping"></span>
              1. PESANAN BARU
            </h3>
            <span className="bg-white text-red-700 text-xs font-black px-2 py-0.5 rounded-full">
              {newOrders.length}
            </span>
          </div>

          <div className="space-y-3 max-h-[calc(100vh-220px)] overflow-y-auto pr-1">
            {newOrders.length === 0 ? (
              <div className="bg-white border border-dashed border-gray-300 rounded-xl p-8 text-center text-gray-400">
                <FiCheckCircle size={32} className="mx-auto mb-2 opacity-40 text-green-500" />
                <p className="text-xs font-semibold">Tidak ada pesanan baru.</p>
              </div>
            ) : (
              newOrders.map(order => (
                <div key={order.id} className="bg-white border-2 border-red-500 rounded-xl shadow-md p-4 space-y-3 animate-pulse-subtle">
                  {/* ANTRIAN NUMBER & CUSTOMER NAME */}
                  <div className="flex justify-between items-start bg-red-50 border border-red-200 p-2.5 rounded-lg">
                    <div>
                      <span className="text-[10px] uppercase font-bold text-red-600 tracking-wider block">NO. ANTRIAN</span>
                      <span className="text-3xl font-black text-red-700 block">NO. {order.table?.nomor_meja}</span>
                      <span className="text-xs font-bold text-gray-900 block mt-1">
                        👤 {order.nama_pelanggan || 'Pelanggan'}
                      </span>
                    </div>
                    <div className="text-right">
                      <span className="text-[10px] text-gray-500 font-mono block">{order.nomor_pesanan}</span>
                      <span className="text-xs font-semibold text-gray-700 flex items-center gap-1 justify-end mt-1">
                        <FiClock size={12} /> {new Date(order.created_at).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}
                      </span>
                      {order.payment_status === 'UNPAID' ? (
                        <span className="inline-block text-[10px] font-black px-2 py-0.5 rounded bg-amber-100 text-amber-900 border border-amber-300 mt-1 shadow-2xs animate-pulse">
                          ⚠️ BELUM DIBAYAR
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
                      <div key={idx} className="flex justify-between font-bold text-gray-900 border-b border-gray-100 pb-1">
                        <span className="text-sm"><span className="text-red-600 text-base">{item.jumlah}x</span> {item.food?.nama}</span>
                        {item.catatan && (
                          <p className="text-[11px] font-extrabold text-red-600 italic block w-full mt-0.5">
                            * {item.catatan}
                          </p>
                        )}
                      </div>
                    ))}
                  </div>

                  {order.catatan && (
                    <div className="bg-amber-50 border border-amber-200 p-2 rounded text-xs">
                      <span className="font-bold text-amber-900 block">Catatan Pesanan:</span>
                      <span className="text-amber-800 font-semibold italic">{order.catatan}</span>
                    </div>
                  )}

                  {/* ACTION BUTTON */}
                  <button
                    onClick={() => handleUpdateStatus(order.id, 'PROCESSING', order.table?.nomor_meja)}
                    className="w-full py-2.5 bg-red-600 hover:bg-red-700 text-white font-extrabold text-xs uppercase rounded-lg shadow transition-colors flex items-center justify-center gap-1"
                  >
                    👩‍🍳 TERIMA PESANAN & PROSES
                  </button>
                </div>
              ))
            )}
          </div>
        </div>

        {/* COLUMN 2: DIPROSES (PROCESSING) */}
        <div className={`space-y-3 ${activeTab !== 'processing' ? 'hidden lg:block' : ''}`}>
          <div className="bg-blue-600 text-white p-3 rounded-xl shadow-sm flex justify-between items-center">
            <h3 className="font-extrabold text-sm uppercase tracking-wider flex items-center gap-2">
              <FiClock size={16} /> 2. SEDANG DIPROSES
            </h3>
            <span className="bg-white text-blue-700 text-xs font-black px-2 py-0.5 rounded-full">
              {processingOrders.length}
            </span>
          </div>

          <div className="space-y-3 max-h-[calc(100vh-220px)] overflow-y-auto pr-1">
            {processingOrders.length === 0 ? (
              <div className="bg-white border border-dashed border-gray-300 rounded-xl p-8 text-center text-gray-400">
                <p className="text-xs font-semibold">Tidak ada pesanan sedang dimasak.</p>
              </div>
            ) : (
              processingOrders.map(order => (
                <div key={order.id} className="bg-white border-2 border-blue-400 rounded-xl shadow-sm p-4 space-y-3">
                  <div className="flex justify-between items-start bg-blue-50 border border-blue-200 p-2.5 rounded-lg">
                    <div>
                      <span className="text-[10px] uppercase font-bold text-blue-600 tracking-wider block">NO. ANTRIAN</span>
                      <span className="text-3xl font-black text-blue-800 block">NO. {order.table?.nomor_meja}</span>
                      <span className="text-xs font-bold text-gray-900 block mt-1">
                        👤 {order.nama_pelanggan || 'Pelanggan'}
                      </span>
                    </div>
                    <div className="text-right">
                      <span className="text-[10px] text-gray-500 font-mono block">{order.nomor_pesanan}</span>
                      {order.payment_status === 'UNPAID' ? (
                        <span className="inline-block text-[10px] font-black px-2 py-0.5 rounded bg-amber-100 text-amber-900 border border-amber-300 mt-1 shadow-2xs">
                          ⚠️ BELUM DIBAYAR
                        </span>
                      ) : (
                        <span className="inline-block text-[10px] font-black px-2 py-0.5 rounded bg-green-100 text-green-800 border border-green-300 mt-1 shadow-2xs">
                          ✅ LUNAS
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="space-y-1.5 border-y py-2 text-xs">
                    {order.items?.map((item, idx) => (
                      <div key={idx} className="font-bold text-gray-900 border-b border-gray-100 pb-1">
                        <span className="text-sm"><span className="text-blue-600 text-base">{item.jumlah}x</span> {item.food?.nama}</span>
                        {item.catatan && <p className="text-[11px] font-bold text-red-600 italic">* {item.catatan}</p>}
                      </div>
                    ))}
                  </div>

                  {order.catatan && (
                    <div className="bg-amber-50 border border-amber-200 p-2 rounded text-xs">
                      <span className="font-bold text-amber-900 block">Catatan Pesanan:</span>
                      <span className="text-amber-800 font-semibold italic">{order.catatan}</span>
                    </div>
                  )}

                  <button
                    onClick={() => handleUpdateStatus(order.id, 'READY', order.table?.nomor_meja)}
                    className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-extrabold text-xs uppercase rounded-lg shadow transition-colors flex items-center justify-center gap-1"
                  >
                    ✅ MAKANAN SIAP DISAJIKAN
                  </button>
                </div>
              ))
            )}
          </div>
        </div>

        {/* COLUMN 3: SIAP (READY) */}
        <div className={`space-y-3 ${activeTab !== 'ready' ? 'hidden lg:block' : ''}`}>
          <div className="bg-green-600 text-white p-3 rounded-xl shadow-sm flex justify-between items-center">
            <h3 className="font-extrabold text-sm uppercase tracking-wider flex items-center gap-2">
              <FiCheckCircle size={16} /> 3. SIAP / DISAJIKAN
            </h3>
            <span className="bg-white text-green-700 text-xs font-black px-2 py-0.5 rounded-full">
              {readyOrders.length}
            </span>
          </div>

          <div className="space-y-3 max-h-[calc(100vh-220px)] overflow-y-auto pr-1">
            {readyOrders.length === 0 ? (
              <div className="bg-white border border-dashed border-gray-300 rounded-xl p-8 text-center text-gray-400">
                <p className="text-xs font-semibold">Belum ada hidangan siap.</p>
              </div>
            ) : (
              readyOrders.map(order => (
                <div key={order.id} className="bg-white border border-green-300 rounded-xl shadow-2xs p-3 space-y-2 opacity-95 hover:opacity-100">
                  <div className="flex justify-between items-center bg-green-50 p-2 rounded-lg">
                    <div>
                      <span className="text-xl font-black text-green-800 block">NO. {order.table?.nomor_meja}</span>
                      <span className="text-xs font-bold text-gray-800 block">
                        👤 {order.nama_pelanggan || 'Pelanggan'}
                      </span>
                    </div>
                    <div className="text-right">
                      <span className="text-[10px] font-bold text-green-700 bg-green-200 px-2 py-0.5 rounded block mb-1">SIAP DISAJIKAN</span>
                      {order.payment_status === 'UNPAID' ? (
                        <span className="inline-block text-[10px] font-black px-1.5 py-0.5 rounded bg-amber-100 text-amber-900 border border-amber-300">
                          ⚠️ BELUM DIBAYAR
                        </span>
                      ) : (
                        <span className="inline-block text-[10px] font-black px-1.5 py-0.5 rounded bg-green-100 text-green-800 border border-green-300">
                          ✅ LUNAS
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="text-xs space-y-1 border-t pt-1">
                    {order.items?.map((item, idx) => (
                      <div key={idx} className="text-gray-700">
                        <span className="font-bold">{item.jumlah}x</span> {item.food?.nama}
                      </div>
                    ))}
                  </div>

                  <button
                    onClick={() => handleUpdateStatus(order.id, 'COMPLETED', order.table?.nomor_meja)}
                    className="w-full py-2 bg-green-600 hover:bg-green-700 text-white font-extrabold text-xs uppercase rounded-lg shadow transition-colors flex items-center justify-center gap-1 mt-2"
                  >
                    🎉 SERAHKAN & SELESAIKAN
                  </button>
                </div>
              ))
            )}
          </div>
        </div>

        {/* COLUMN 4: NOMOR ANTRIAN SIAP DIKEMBALIKAN (NEEDS_CLEANING) */}
        <div className={`space-y-3 ${activeTab !== 'cleaning' ? 'hidden lg:block' : ''}`}>
          <div className="bg-amber-600 text-white p-3 rounded-xl shadow-sm flex justify-between items-center">
            <h3 className="font-extrabold text-sm uppercase tracking-wider flex items-center gap-2">
              <FiAlertCircle size={16} /> 4. KARTU ANTRIAN SELESAI
            </h3>
            <span className="bg-white text-amber-800 text-xs font-black px-2 py-0.5 rounded-full">
              {tablesNeedingCleaning.length}
            </span>
          </div>

          <div className="space-y-3 max-h-[calc(100vh-220px)] overflow-y-auto pr-1">
            {tablesNeedingCleaning.length === 0 ? (
              <div className="bg-white border border-dashed border-gray-300 rounded-xl p-8 text-center text-gray-400">
                <FiCheckCircle size={32} className="mx-auto mb-2 text-green-500 opacity-50" />
                <p className="text-xs font-semibold">Semua kartu nomor antrian tersedia!</p>
              </div>
            ) : (
              tablesNeedingCleaning.map(table => (
                <div key={table.id} className="bg-amber-50 border-2 border-amber-400 rounded-xl shadow-md p-4 space-y-3">
                  <div className="text-center py-2 bg-amber-100 rounded-lg">
                    <span className="text-[10px] uppercase font-bold text-amber-800 tracking-wider block">PESANAN SELESAI & BAYAR</span>
                    <span className="text-3xl font-black text-amber-900">NO. {table.nomor_meja}</span>
                  </div>

                  <p className="text-xs text-amber-800 font-medium text-center">
                    Harap ambil dan kembalikan kartu <strong>NO. ANTRIAN {table.nomor_meja}</strong> ke kasir!
                  </p>

                  <button
                    onClick={() => handleCleanTable(table.id, table.nomor_meja)}
                    className="w-full py-2.5 bg-amber-600 hover:bg-amber-700 text-white font-extrabold text-xs uppercase rounded-lg shadow transition-colors flex items-center justify-center gap-1.5"
                  >
                    ✨ RESET (NOMOR ANTRIAN SIAP KEMBALI)
                  </button>
                </div>
              ))
            )}
          </div>
        </div>

      </div>
    </Sidebar>
  );
}

