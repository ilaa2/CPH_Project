import React, { useState, useEffect, useRef } from 'react';
import { Head, useForm, usePage, router, Link } from '@inertiajs/react';
import Sidebar from '@/Components/Bar/Sidebar';
import Receipt from './Receipt';
import Swal from 'sweetalert2';
import {
  FiCoffee, FiShoppingBag, FiCheckCircle, FiClock, FiAlertCircle,
  FiPlus, FiMinus, FiTrash2, FiPrinter, FiSearch, FiX, FiDollarSign,
  FiCreditCard, FiRefreshCw, FiVolume2, FiVolumeX, FiSlash,
  FiCornerUpLeft, FiPlusCircle, FiEdit3, FiTv, FiCheck
} from 'react-icons/fi';

// Web Audio API Synthesizer Sound Generator
const playNotificationChime = () => {
  try {
    const AudioContext = window.AudioContext || window.webkitAudioContext;
    if (!AudioContext) return;
    const ctx = new AudioContext();
    
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

export default function Kasir({ tables = [], categories = [], activeOrders = [] }) {
  const { auth } = usePage().props;

  // Selected State
  const [selectedTable, setSelectedTable] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [cart, setCart] = useState([]);
  const [customerName, setCustomerName] = useState('');
  const [orderNote, setOrderNote] = useState('');
  const [soundEnabled, setSoundEnabled] = useState(false);
  const [paymentStatusOption, setPaymentStatusOption] = useState('Cash');
  const [orderCashGiven, setOrderCashGiven] = useState('');

  // Toggle Sound
  const toggleSound = () => {
    const nextState = !soundEnabled;
    setSoundEnabled(nextState);
    if (nextState) {
      playAudioAndVoice('Notifikasi suara kasir aktif');
      Swal.fire({
        toast: true,
        position: 'top-end',
        icon: 'success',
        title: '🔊 Notifikasi Suara Kasir Aktif!',
        showConfirmButton: false,
        timer: 2000,
      });
    }
  };

  // Modals state
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [showReceiptModal, setShowReceiptModal] = useState(false);
  const [showQuickPrintModal, setShowQuickPrintModal] = useState(false);
  const [printCustomerReceipt, setPrintCustomerReceipt] = useState(true);
  const [printKitchenReceipt, setPrintKitchenReceipt] = useState(true);
  const [currentReceiptOrder, setCurrentReceiptOrder] = useState(null);
  const [receiptType, setReceiptType] = useState('both'); // 'both', 'customer', or 'kitchen'
  const [bothPrintStep, setBothPrintStep] = useState(1); // 1 = Customer, 2 = Kitchen, 3 = Selesai
  const [receiptPaperSize, setReceiptPaperSize] = useState('80mm');
  const [showMobileCart, setShowMobileCart] = useState(false);

  // Payment Form state (Pilih Cash, QRIS, atau SPLIT di Modal Bayar)
  const [paymentMethod, setPaymentMethod] = useState('Cash');
  const [jumlahBayar, setJumlahBayar] = useState('');

  // Addon menu state (Tambah menu ke pesanan meja aktif)
  const [isAddingAddon, setIsAddingAddon] = useState(false);
  const [addonCart, setAddonCart] = useState([]);

  // Split payment state saat order baru (AVAILABLE)
  const [orderSplitCash, setOrderSplitCash] = useState('');
  const [orderSplitQris, setOrderSplitQris] = useState('');

  // Split payment state saat proses bayar aktif (Modal Bayar)
  const [paymentSplitCash, setPaymentSplitCash] = useState('');
  const [paymentSplitQris, setPaymentSplitQris] = useState('');
  const [isSubmittingOrder, setIsSubmittingOrder] = useState(false);

  // Throttle ref to prevent double click
  const lastAddClickRef = useRef(0);

  // Auto Polling State every 5 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      router.reload({ only: ['tables', 'activeOrders'], preserveScroll: true, preserveState: true });
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  // Filter Foods
  const allFoods = categories.flatMap(cat => cat.foods || []);
  const filteredFoods = allFoods.filter(food => {
    const matchCategory = selectedCategory === 'all' || food.category_id === Number(selectedCategory);
    const matchSearch = food.nama.toLowerCase().includes(searchQuery.toLowerCase());
    return matchCategory && matchSearch;
  });

  // Select Table Handler
  const handleSelectTable = (table) => {
    setSelectedTable(table);
    setIsAddingAddon(false);
    setAddonCart([]);
    // Reset cart if switching to new table
    if (table.status === 'AVAILABLE') {
      setCart([]);
      setOrderNote('');
      setOrderSplitCash('');
      setOrderSplitQris('');
    }
  };

  // Add Item to Cart (Proteksi Double Click & Dukungan Addon Menu Meja Aktif)
  const handleAddToCart = (food) => {
    const now = Date.now();
    if (now - lastAddClickRef.current < 150) {
      return; // Anti double trigger / touchscreen bounce
    }
    lastAddClickRef.current = now;

    if (!selectedTable) {
      Swal.fire({
        icon: 'warning',
        title: 'Pilih Meja Terlebih Dahulu',
        text: 'Silakan klik salah satu meja berwarna HIJAU (Tersedia) atau meja terisi di panel atas.',
        confirmColor: '#16a34a',
      });
      return;
    }

    if (selectedTable.status === 'UNAVAILABLE') {
      Swal.fire({
        icon: 'warning',
        title: 'Nomor Antrian Tidak Tersedia',
        text: `Nomor Antrian ${selectedTable.nomor_meja} saat ini sedang dinonaktifkan/tidak tersedia.`,
        confirmColor: '#16a34a',
      });
      return;
    }

    // Jika meja OCCUPIED dan kasir sedang mode Tambah Menu Pesanan
    if (isAddingAddon && selectedTable.status === 'OCCUPIED' && selectedTable.active_order) {
      setAddonCart(prev => {
        const existing = prev.find(item => item.food_id === food.id);
        if (existing) {
          return prev.map(item => item.food_id === food.id ? { ...item, jumlah: item.jumlah + 1 } : item);
        }
        return [...prev, { food_id: food.id, food, jumlah: 1, catatan: '' }];
      });
      return;
    }

    if (selectedTable.status !== 'AVAILABLE') {
      Swal.fire({
        icon: 'info',
        title: 'Meja Sedang Terisi',
        text: `Meja ${selectedTable.nomor_meja} sedang ada pesanan aktif. Untuk menambah menu, klik tombol "➕ Tambah Menu Pesanan" di panel kanan.`,
        confirmColor: '#2563eb',
      });
      return;
    }

    setCart(prevCart => {
      const existing = prevCart.find(item => item.food_id === food.id);
      if (existing) {
        return prevCart.map(item =>
          item.food_id === food.id ? { ...item, jumlah: item.jumlah + 1 } : item
        );
      }
      return [...prevCart, { food_id: food.id, food, jumlah: 1, catatan: '' }];
    });
  };

  // Update Quantity in Addon Cart
  const handleUpdateAddonQty = (foodId, delta) => {
    setAddonCart(prev => {
      return prev.map(item => {
        if (item.food_id === foodId) {
          const newQty = item.jumlah + delta;
          return newQty > 0 ? { ...item, jumlah: newQty } : null;
        }
        return item;
      }).filter(Boolean);
    });
  };

  // Submit Addon Items to Kitchen
  const handleSubmitAddonOrder = () => {
    const activeOrder = selectedTable?.active_order;
    if (!activeOrder || addonCart.length === 0) return;

    router.post(route('pos.order.add-items', activeOrder.id), {
      items: addonCart.map(item => ({
        food_id: item.food_id,
        jumlah: item.jumlah,
        catatan: item.catatan,
      })),
    }, {
      onSuccess: (page) => {
        setIsAddingAddon(false);
        setAddonCart([]);
        if (soundEnabled) {
          playAudioAndVoice(`Menu tambahan nomor antrian ${selectedTable?.nomor_meja || ''} berhasil dikirim ke dapur`);
        }
        const updatedOrder = page.props?.flash?.latestOrder;
        const newAddedItems = page.props?.flash?.newAddedItems || [];
        if (updatedOrder) {
          // Siapkan receipt data KHUSUS untuk menu tambahan (kitchen ticket)
          setCurrentReceiptOrder({
            ...updatedOrder,
            items: newAddedItems.length > 0 ? newAddedItems : updatedOrder.items,
            is_additional: true,
          });
          setReceiptType('kitchen');
          setBothPrintStep(2);
          setShowReceiptModal(true);
        }
      },
      onError: (err) => {
        Swal.fire({ icon: 'error', title: 'Gagal Menambah Menu', text: Object.values(err).flat().join('\n') });
      }
    });
  };

  // Cancel Item inside Order
  const handleCancelOrderItem = (item) => {
    Swal.fire({
      title: 'Batalkan Menu Ini?',
      text: `Yakin ingin membatalkan menu ${item.jumlah}x ${item.food?.nama || 'Item'}? Tagihan meja akan disesuaikan otomatis.`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#dc2626',
      cancelButtonColor: '#6b7280',
      confirmButtonText: 'Ya, Batalkan Menu',
      cancelButtonText: 'Batal',
    }).then((res) => {
      if (res.isConfirmed) {
        router.post(route('pos.order-item.cancel', item.id), {}, {
          onSuccess: () => {
            Swal.fire({
              icon: 'success',
              title: 'Menu Dibatalkan',
              text: 'Item berhasil dibatalkan dan total tagihan dikurangi.',
              timer: 1500,
              showConfirmButton: false,
            });
          },
          onError: (err) => {
            Swal.fire({ icon: 'error', title: 'Gagal Membatalkan Item', text: Object.values(err).flat().join('\n') });
          }
        });
      }
    });
  };

  // Cancel Entire Order
  const handleCancelEntireOrder = () => {
    const activeOrder = selectedTable?.active_order;
    if (!activeOrder) return;

    Swal.fire({
      title: 'Batalkan Seluruh Pesanan?',
      text: `Pesanan ${activeOrder.nomor_pesanan} untuk No. Antrian ${selectedTable.nomor_meja} akan dibatalkan. Nomor antrian akan kembali bebas/tersedia.`,
      icon: 'warning',
      input: 'text',
      inputPlaceholder: 'Tulis alasan pembatalan...',
      showCancelButton: true,
      confirmButtonColor: '#dc2626',
      cancelButtonColor: '#6b7280',
      confirmButtonText: 'Ya, Batalkan Pesanan',
      cancelButtonText: 'Kembali',
    }).then((res) => {
      if (res.isConfirmed) {
        router.post(route('pos.order.cancel', activeOrder.id), {
          alasan: res.value || 'Dibatalkan oleh kasir',
        }, {
          onSuccess: () => {
            setSelectedTable(null);
            setIsAddingAddon(false);
            setAddonCart([]);
            Swal.fire({
              icon: 'success',
              title: 'Pesanan Dibatalkan',
              text: 'Seluruh pesanan meja telah dibatalkan.',
              timer: 1500,
              showConfirmButton: false,
            });
          },
          onError: (err) => {
            Swal.fire({ icon: 'error', title: 'Gagal Membatalkan Pesanan', text: Object.values(err).flat().join('\n') });
          }
        });
      }
    });
  };

  // Update Quantity in Cart
  const handleUpdateQty = (foodId, delta) => {
    setCart(prevCart => {
      return prevCart.map(item => {
        if (item.food_id === foodId) {
          const newQty = item.jumlah + delta;
          return newQty > 0 ? { ...item, jumlah: newQty } : null;
        }
        return item;
      }).filter(Boolean);
    });
  };

  // Update Item Note
  const handleItemNoteChange = (foodId, text) => {
    setCart(prevCart =>
      prevCart.map(item => (item.food_id === foodId ? { ...item, catatan: text } : item))
    );
  };

  // Calculate Cart Total
  const subtotal = cart.reduce((acc, item) => acc + item.food.harga * item.jumlah, 0);

  // Send Order to Kitchen
  const handleSendOrder = (e) => {
    e.preventDefault();

    if (isSubmittingOrder) return;
    if (!selectedTable || cart.length === 0) return;

    let bayarInt = subtotal;
    let kembalianInt = 0;
    let cashVal = 0;
    let qrisVal = 0;

    if (paymentStatusOption === 'SPLIT') {
      cashVal = parseInt(orderSplitCash) || 0;
      qrisVal = parseInt(orderSplitQris) || 0;
      bayarInt = cashVal + qrisVal;
      kembalianInt = Math.max(0, bayarInt - subtotal);
      if (bayarInt < subtotal) {
        Swal.fire({
          icon: 'warning',
          title: 'Nominal Split Kurang',
          text: `Total Cash (Rp ${cashVal.toLocaleString('id-ID')}) + QRIS (Rp ${qrisVal.toLocaleString('id-ID')}) = Rp ${bayarInt.toLocaleString('id-ID')} masih kurang dari tagihan Rp ${subtotal.toLocaleString('id-ID')}`,
          confirmColor: '#ea580c',
        });
        return;
      }
    } else if (paymentStatusOption === 'Cash') {
      cashVal = parseInt(orderCashGiven) || subtotal;
      bayarInt = cashVal;
      kembalianInt = Math.max(0, bayarInt - subtotal);
    } else if (paymentStatusOption === 'QRIS') {
      qrisVal = subtotal;
      bayarInt = subtotal;
      kembalianInt = 0;
    }

    setIsSubmittingOrder(true);

    router.post(route('pos.order.store'), {
      table_id: selectedTable.id,
      nama_pelanggan: customerName,
      status_pembayaran: paymentStatusOption, // 'Cash', 'QRIS', 'SPLIT', or 'UNPAID'
      metode_pembayaran: paymentStatusOption === 'UNPAID' ? 'Cash' : paymentStatusOption,
      jumlah_bayar: bayarInt,
      cash_amount: cashVal,
      qris_amount: qrisVal,
      items: cart.map(item => ({
        food_id: item.food_id,
        jumlah: item.jumlah,
        catatan: item.catatan,
      })),
      catatan: orderNote,
    }, {
      onSuccess: (page) => {
        setIsSubmittingOrder(false);
        if (page?.props?.flash?.error) {
          Swal.fire({
            icon: 'error',
            title: 'Gagal Membuat Pesanan',
            text: page.props.flash.error,
            confirmColor: '#dc2626',
          });
          return;
        }

        if (soundEnabled) {
          const voiceMsg = paymentStatusOption === 'UNPAID'
            ? `Pesanan Nomor Antrian ${selectedTable?.nomor_meja || ''} belum dibayar, berhasil dikirim ke dapur`
            : `Pesanan Nomor Antrian ${selectedTable?.nomor_meja || ''} lunas, berhasil dikirim ke dapur`;
          playAudioAndVoice(voiceMsg);
        }

        const serverOrder = page?.props?.flash?.latestOrder;
        const orderForReceipt = serverOrder ? {
          ...serverOrder,
          payment: serverOrder.payment || (paymentStatusOption !== 'UNPAID' ? {
            metode_pembayaran: paymentStatusOption,
            jumlah_bayar: bayarInt,
            cash_amount: cashVal,
            qris_amount: qrisVal,
            kembalian: kembalianInt,
          } : null),
        } : {
          nomor_pesanan: 'CP-POS-' + Date.now(),
          table: selectedTable,
          nama_pelanggan: customerName || 'Pelanggan',
          metode_pembayaran: paymentStatusOption === 'UNPAID' ? 'Cash' : paymentStatusOption,
          payment_status: paymentStatusOption === 'UNPAID' ? 'UNPAID' : 'PAID',
          subtotal: subtotal,
          diskon: 0,
          total: subtotal,
          catatan: orderNote,
          created_at: new Date().toISOString(),
          items: cart.map(item => ({
            jumlah: item.jumlah,
            food: item.food,
            harga_satuan: item.food.harga,
            subtotal: item.food.harga * item.jumlah,
            catatan: item.catatan,
          })),
          payment: paymentStatusOption !== 'UNPAID' ? {
            metode_pembayaran: paymentStatusOption,
            jumlah_bayar: bayarInt,
            cash_amount: cashVal,
            qris_amount: qrisVal,
            kembalian: kembalianInt,
          } : null,
          cashier: auth.user,
        };

        setCurrentReceiptOrder(orderForReceipt);
        setCart([]);
        setOrderNote('');
        setCustomerName('');
        setOrderCashGiven('');
        setOrderSplitCash('');
        setOrderSplitQris('');
        setPaymentStatusOption('Cash');
        setSelectedTable(null);
        setShowMobileCart(false);

        // Khusus BELUM BAYAR (UNPAID): Langsung mode Dapur Saja (kitchen)
        if (paymentStatusOption === 'UNPAID') {
          setReceiptType('kitchen');
          setBothPrintStep(2);
        } else {
          setReceiptType('both');
          setBothPrintStep(1);
        }
        setShowReceiptModal(true);
      },
      onError: (errors) => {
        setIsSubmittingOrder(false);
        const errorMsg = Object.values(errors).flat().join('\n');
        Swal.fire({ icon: 'error', title: 'Gagal Membuat Pesanan', text: errorMsg });
      }
    });
  };

  // Open Payment Modal for Active Order
  const handleOpenPaymentModal = () => {
    if (!selectedTable || !selectedTable.active_order) return;
    setPaymentMethod('Cash');
    setJumlahBayar(selectedTable.active_order.total.toString());
    const half = Math.floor(selectedTable.active_order.total / 2);
    setPaymentSplitCash(half.toString());
    setPaymentSplitQris((selectedTable.active_order.total - half).toString());
    setShowPaymentModal(true);
  };

  // Submit Payment
  const handleProcessPayment = (e) => {
    e.preventDefault();
    const activeOrder = selectedTable?.active_order;
    if (!activeOrder) return;

    let bayarInt = 0;
    let cashVal = 0;
    let qrisVal = 0;

    if (paymentMethod === 'SPLIT') {
      cashVal = parseInt(paymentSplitCash) || 0;
      qrisVal = parseInt(paymentSplitQris) || 0;
      bayarInt = cashVal + qrisVal;
      if (bayarInt < activeOrder.total) {
        Swal.fire({
          icon: 'warning',
          title: 'Pembayaran Split Kurang',
          text: `Total Cash (Rp ${cashVal.toLocaleString('id-ID')}) + QRIS (Rp ${qrisVal.toLocaleString('id-ID')}) = Rp ${bayarInt.toLocaleString('id-ID')} masih kurang dari total tagihan Rp ${Number(activeOrder.total).toLocaleString('id-ID')}`,
          confirmColor: '#ea580c',
        });
        return;
      }
    } else if (paymentMethod === 'Cash') {
      bayarInt = parseInt(jumlahBayar) || 0;
      cashVal = bayarInt;
      if (bayarInt < activeOrder.total) {
        Swal.fire({
          icon: 'warning',
          title: 'Pembayaran Kurang',
          text: `Jumlah bayar Rp ${bayarInt.toLocaleString('id-ID')} kurang dari total tagihan Rp ${Number(activeOrder.total).toLocaleString('id-ID')}`,
          confirmColor: '#ea580c',
        });
        return;
      }
    } else { // QRIS
      bayarInt = parseInt(jumlahBayar) || activeOrder.total;
      qrisVal = bayarInt;
    }

    const kembalian = Math.max(0, bayarInt - activeOrder.total);

    router.post(route('pos.payment.process'), {
      order_id: activeOrder.id,
      metode_pembayaran: paymentMethod,
      jumlah_bayar: bayarInt,
      cash_amount: cashVal,
      qris_amount: qrisVal,
    }, {
      onSuccess: () => {
        if (soundEnabled) {
          playAudioAndVoice(`Pembayaran Nomor Antrian ${activeOrder?.table?.nomor_meja || ''} berhasil`);
        }
        setShowPaymentModal(false);

        // Prepare receipt data
        const orderForReceipt = {
          ...activeOrder,
          payment: {
            metode_pembayaran: paymentMethod,
            jumlah_bayar: bayarInt,
            cash_amount: cashVal,
            qris_amount: qrisVal,
            kembalian: kembalian,
          }
        };

        setCurrentReceiptOrder(orderForReceipt);
        setSelectedTable(null);

        // Cetak struk customer karena pembayaran baru saja dilunasi
        setReceiptType('customer');
        setShowReceiptModal(true);
      },
      onError: (err) => {
        Swal.fire({ icon: 'error', title: 'Gagal Memproses Pembayaran', text: Object.values(err).join('\n') });
      }
    });
  };

  // Complete Order & Free Table
  const handleCompleteOrder = (order) => {
    if (!order) return;
    Swal.fire({
      title: 'Selesaikan Pesanan & Kosongkan Meja?',
      text: `Pesanan No. ${order.nomor_pesanan} (Meja ${order.table?.nomor_meja || '--'}) akan ditandai SELESAI dan meja langsung KOSONG (Tersedia) untuk pelanggan berikutnya.`,
      icon: 'question',
      showCancelButton: true,
      confirmButtonColor: '#16a34a',
      cancelButtonColor: '#6b7280',
      confirmButtonText: '✅ Ya, Selesaikan & Kosongkan',
      cancelButtonText: 'Batal',
    }).then((result) => {
      if (result.isConfirmed) {
        router.post(route('pos.order.complete', order.id), {}, {
          preserveScroll: true,
          onSuccess: () => {
            setSelectedTable(null);
            if (soundEnabled) {
              playAudioAndVoice(`Pesanan nomor antrian ${order.table?.nomor_meja || ''} selesai`);
            }
            Swal.fire({
              icon: 'success',
              title: 'Pesanan Selesai!',
              text: `Meja ${order.table?.nomor_meja || '--'} kini telah KOSONG & siap digunakan.`,
              timer: 1800,
              showConfirmButton: false,
            });
          }
        });
      }
    });
  };

  // Reset Meja Manual
  const handleResetTable = (table) => {
    if (!table) return;
    router.post(route('pos.table.reset', table.id), {}, {
      preserveScroll: true,
      onSuccess: () => {
        setSelectedTable(null);
        Swal.fire({
          icon: 'success',
          title: `Meja ${table.nomor_meja} Siap!`,
          text: `Status meja telah diubah menjadi Tersedia (Hijau).`,
          timer: 1500,
          showConfirmButton: false,
        });
      }
    });
  };

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

  // Helper Table Status Badge
  const renderTableBadge = (status) => {
    switch (status) {
      case 'AVAILABLE':
        return <span className="text-[10px] font-bold text-green-700 bg-green-100 px-1.5 py-0.5 rounded">🟢 Tersedia</span>;
      case 'OCCUPIED':
        return <span className="text-[10px] font-bold text-red-700 bg-red-100 px-1.5 py-0.5 rounded">🔴 Terisi</span>;
      case 'NEEDS_CLEANING':
        return <span className="text-[10px] font-bold text-amber-800 bg-amber-100 px-1.5 py-0.5 rounded">🟡 Perlu Dibersihkan</span>;
      case 'UNAVAILABLE':
        return <span className="text-[10px] font-bold text-gray-700 bg-gray-200 px-1.5 py-0.5 rounded">⚪ Tidak Tersedia</span>;
      default:
        return null;
    }
  };

  return (
    <Sidebar header={
      <div className="flex justify-between items-center w-full">
        <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
          <FiCoffee className="text-green-600" /> POS / Order Makanan Kantin
        </h2>
        <div className="flex items-center gap-2">
          <Link
            href="/pos/monitor"
            className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-bold transition-all shadow-xs"
          >
            <FiTv size={15} /> Monitor Pesanan
          </Link>
          <button
            onClick={toggleSound}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-colors ${soundEnabled ? 'bg-green-600 text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}`}
          >
            {soundEnabled ? <FiVolume2 size={16} /> : <FiVolumeX size={16} />}
            {soundEnabled ? 'Suara Aktif' : 'Aktifkan Suara'}
          </button>
        </div>
      </div>
    }>
      <Head title="POS Order Kantin - Central Palantea" />

      <div className="flex flex-col lg:flex-row gap-6">

        {/* LEFT & CENTER COLUMN: TABLES & MENU */}
        <div className="flex-1 space-y-6">

          {/* 1. VISUAL 30 NUMBERS GRID */}
          <div className="bg-white rounded-xl shadow-sm border p-4">
            <div className="flex justify-between items-center mb-3">
              <div>
                <h3 className="font-bold text-gray-800 text-sm flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-green-600"></span>
                  Pilih Nomor Antrian Pelanggan (No. 01 - 30)
                </h3>
                <p className="text-xs text-gray-500">Klik nomor berwarna hijau untuk diserahkan ke pelanggan, atau merah untuk proses bayar/selesai.</p>
              </div>
              <div className="flex items-center gap-3 text-xs">
                <span className="flex items-center gap-1 font-medium text-green-700"><span className="w-2 h-2 rounded-full bg-green-500"></span> Tersedia</span>
                <span className="flex items-center gap-1 font-medium text-red-700"><span className="w-2 h-2 rounded-full bg-red-500"></span> Dipakai</span>
                <span className="flex items-center gap-1 font-medium text-amber-700"><span className="w-2 h-2 rounded-full bg-amber-500"></span> Selesai/Siap</span>
                <span className="flex items-center gap-1 font-medium text-gray-500"><span className="w-2 h-2 rounded-full bg-gray-400"></span> Tidak Tersedia</span>
              </div>
            </div>

            <div className="grid grid-cols-5 sm:grid-cols-6 md:grid-cols-10 gap-2">
              {tables.map(table => {
                const isSelected = selectedTable?.id === table.id;
                let bgClass = 'bg-green-50 border-green-300 hover:bg-green-100 text-green-800';
                if (table.status === 'OCCUPIED') bgClass = 'bg-red-50 border-red-300 hover:bg-red-100 text-red-800';
                if (table.status === 'NEEDS_CLEANING') bgClass = 'bg-amber-50 border-amber-300 hover:bg-amber-100 text-amber-800';
                if (table.status === 'UNAVAILABLE') bgClass = 'bg-gray-100 border-gray-300 text-gray-400 opacity-60';
                if (isSelected) bgClass += ' ring-2 ring-green-600 font-bold scale-105 shadow-md';

                const isUnpaid = table.active_order?.payment_status === 'UNPAID';

                return (
                  <button
                    key={table.id}
                    onClick={() => handleSelectTable(table)}
                    className={`p-2 rounded-lg border text-center transition-all flex flex-col items-center justify-center ${bgClass}`}
                  >
                    <span className="text-xs font-extrabold">NO. {table.nomor_meja}</span>
                    <span className="text-[9px] font-bold mt-0.5">
                      {table.status === 'AVAILABLE' ? '🟢 Free' : table.status === 'UNAVAILABLE' ? '⚪ Off' : isUnpaid ? '⚠️ UNPAID' : table.status === 'OCCUPIED' ? '🔴 Lunas' : '🟡 Clean'}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* 2. CATEGORY TABS & SEARCH MENU */}
          <div className="bg-white rounded-xl shadow-sm border p-4 space-y-4">
            <div className="flex flex-col sm:flex-row gap-3 justify-between items-center">
              {/* Category Filter Tabs */}
              <div className="flex gap-2 overflow-x-auto w-full sm:w-auto pb-1 sm:pb-0">
                <button
                  onClick={() => setSelectedCategory('all')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors ${selectedCategory === 'all' ? 'bg-green-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
                >
                  Semua ({allFoods.length})
                </button>
                {categories.map(cat => (
                  <button
                    key={cat.id}
                    onClick={() => setSelectedCategory(cat.id.toString())}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors ${selectedCategory === cat.id.toString() ? 'bg-green-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
                  >
                    {cat.nama_kategori} ({cat.foods?.length || 0})
                  </button>
                ))}
              </div>

              {/* Search Bar */}
              <div className="relative w-full sm:w-64">
                <input
                  type="text"
                  placeholder="Cari menu makanan/minuman..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-8 pr-7 py-1.5 text-xs border rounded-lg focus:ring-green-500 focus:border-green-500"
                />
                <FiSearch className="absolute left-2.5 top-2.5 text-gray-400" size={14} />
                {searchQuery && (
                  <button onClick={() => setSearchQuery('')} className="absolute right-2 top-2 text-gray-400 hover:text-gray-600">
                    <FiX size={14} />
                  </button>
                )}
              </div>
            </div>

            {/* FOOD ITEMS GRID */}
            {filteredFoods.length === 0 ? (
              <div className="text-center py-10 text-gray-400">
                <FiCoffee size={36} className="mx-auto mb-2 opacity-50" />
                <p className="text-sm font-medium">Menu makanan tidak ditemukan.</p>
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                {filteredFoods.map(food => (
                  <div
                    key={food.id}
                    onClick={() => handleAddToCart(food)}
                    className="group bg-gray-50 hover:bg-green-50/50 border hover:border-green-400 rounded-xl p-2.5 cursor-pointer transition-all duration-200 shadow-2xs hover:shadow-md flex flex-col justify-between"
                  >
                    <div>
                      <div className="aspect-square bg-gray-200 rounded-lg mb-2 overflow-hidden relative">
                        {food.gambar ? (
                          <img
                            src={encodeURI(food.gambar.startsWith('/') || food.gambar.startsWith('http') ? food.gambar : `/storage/${food.gambar}`)}
                            alt={food.nama}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-gray-400 font-semibold text-xs">
                            🍽️ {food.nama}
                          </div>
                        )}
                        <span className="absolute top-1 right-1 bg-black/60 text-white text-[9px] px-1.5 py-0.5 rounded font-mono">
                          {food.category_id === 1 ? 'Makanan' : food.category_id === 2 ? 'Minuman' : 'Snack'}
                        </span>
                      </div>
                      <h4 className="font-bold text-xs text-gray-800 line-clamp-2 mb-1">{food.nama}</h4>
                      {food.deskripsi && (
                        <p className="text-[10px] text-gray-500 line-clamp-1 mb-2">{food.deskripsi}</p>
                      )}
                    </div>

                    <div className="flex justify-between items-center pt-2 border-t border-gray-200">
                      <span className="font-extrabold text-xs text-green-700">
                        Rp {Number(food.harga).toLocaleString('id-ID')}
                      </span>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleAddToCart(food);
                        }}
                        className="p-1 bg-green-600 hover:bg-green-700 active:scale-95 text-white rounded-md transition-all"
                        title="Tambah Menu"
                      >
                        <FiPlus size={14} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* RIGHT COLUMN: CURRENT ORDER / CART PANEL (Desktop) */}
        <div className="w-full lg:w-96 bg-white rounded-xl shadow-sm border p-4 flex flex-col h-auto lg:h-[calc(100vh-120px)] lg:sticky lg:top-24 overflow-hidden">

          {/* Header Panel */}
          <div className="flex justify-between items-center border-b pb-3 mb-3 shrink-0">
            <div>
              <h3 className="font-bold text-gray-800 text-base flex items-center gap-2">
                <FiShoppingBag className="text-green-600" />
                {selectedTable ? `No. Antrian ${selectedTable.nomor_meja}` : 'Pilih No. Antrian'}
              </h3>
              {selectedTable && (
                <div className="mt-1">{renderTableBadge(selectedTable.status)}</div>
              )}
            </div>
            {selectedTable && (
              <button
                onClick={() => setSelectedTable(null)}
                className="text-xs text-gray-400 hover:text-gray-600 font-semibold"
              >
                Ganti Nomor
              </button>
            )}
          </div>

          {/* CASE 1: NO TABLE SELECTED */}
          {!selectedTable && (
            <div className="text-center py-12 text-gray-400 my-auto">
              <FiCoffee size={48} className="mx-auto mb-3 text-gray-300" />
              <p className="font-semibold text-sm text-gray-600">Belum Ada Nomor Antrian Terpilih</p>
              <p className="text-xs text-gray-400 mt-1 max-w-xs mx-auto">
                Silakan klik salah satu nomor antrian pada grid di atas untuk menginput pesanan baru atau memproses pembayaran.
              </p>
            </div>
          )}

          {/* CASE 2: TABLE OCCUPIED - DISPLAY ACTIVE ORDER & PAYMENT BUTTON */}
          {selectedTable && selectedTable.status === 'OCCUPIED' && selectedTable.active_order && (
            <div className="flex-1 flex flex-col min-h-0 overflow-hidden justify-between space-y-3">
              <div className="bg-red-50 border border-red-200 rounded-lg p-3 text-xs shrink-0 space-y-1">
                <div className="flex justify-between font-bold text-red-800 mb-1">
                  <span>No. Pesanan:</span>
                  <span>{selectedTable.active_order.nomor_pesanan}</span>
                </div>
                <div className="flex justify-between text-gray-700 font-semibold mb-1">
                  <span>Nama Customer:</span>
                  <span>{selectedTable.active_order.nama_pelanggan || 'Pelanggan'}</span>
                </div>
                <div className="flex justify-between text-gray-600 text-[11px]">
                  <span>Status Dapur:</span>
                  <span className="font-bold uppercase text-blue-600">{selectedTable.active_order.order_status}</span>
                </div>
                <div className="flex justify-between items-center text-[11px] pt-1 border-t border-red-200">
                  <span>Status Pembayaran:</span>
                  {selectedTable.active_order.payment_status === 'UNPAID' ? (
                    <span className="font-extrabold text-[10px] px-2 py-0.5 rounded bg-amber-100 text-amber-900 border border-amber-300 animate-pulse">
                      ⚠️ BELUM DIBAYAR
                    </span>
                  ) : (
                    <span className="font-extrabold text-[10px] px-2 py-0.5 rounded bg-green-100 text-green-800 border border-green-300">
                      ✅ LUNAS
                    </span>
                  )}
                </div>
              </div>

              {/* Scrollable Items in Occupied Order */}
              <div className="flex-1 overflow-y-auto min-h-0 space-y-2 border-y py-2 pr-1">
                <div className="flex justify-between items-center sticky top-0 bg-white py-1 z-10 border-b border-gray-100">
                  <h4 className="text-xs font-bold text-gray-700 uppercase tracking-wider">Item Pesanan:</h4>
                  <button
                    type="button"
                    onClick={() => setIsAddingAddon(!isAddingAddon)}
                    className={`text-[10px] font-extrabold px-2 py-0.5 rounded-lg border flex items-center gap-1 transition-all ${
                      isAddingAddon ? 'bg-blue-600 text-white border-blue-600 shadow-xs' : 'bg-blue-50 text-blue-700 border-blue-200 hover:bg-blue-100'
                    }`}
                  >
                    <FiPlus size={12} /> {isAddingAddon ? 'Tutup Tambah Menu' : '+ Tambah Menu'}
                  </button>
                </div>

                {selectedTable.active_order.items?.map((item, i) => {
                  const isCancelled = item.status === 'CANCELLED';
                  return (
                    <div key={i} className={`flex justify-between items-center text-xs py-1.5 border-b border-gray-100 ${isCancelled ? 'opacity-50 bg-red-50/50 rounded px-1' : ''}`}>
                      <div className="flex-1 pr-2">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <span className={`font-bold ${isCancelled ? 'line-through text-red-500' : 'text-gray-900'}`}>
                            {item.jumlah}x {item.food?.nama}
                          </span>
                          {isCancelled ? (
                            <span className="text-[9px] font-black text-red-700 bg-red-100 border border-red-200 px-1.5 py-0.5 rounded">
                              ❌ Dibatalkan
                            </span>
                          ) : item.is_served ? (
                            <button
                              type="button"
                              onClick={() => handleToggleItemServed(item)}
                              className="text-[9px] font-black text-green-700 bg-green-100 hover:bg-green-200 border border-green-200 px-1.5 py-0.5 rounded transition-all cursor-pointer"
                              title="Klik untuk ubah status"
                            >
                              ✅ Diantar
                            </button>
                          ) : (
                            <button
                              type="button"
                              onClick={() => handleToggleItemServed(item)}
                              className="text-[9px] font-bold text-blue-700 bg-blue-50 hover:bg-blue-100 border border-blue-200 px-1.5 py-0.5 rounded transition-all cursor-pointer"
                              title="Klik untuk tandai sudah diantar"
                            >
                              🍽️ Antar
                            </button>
                          )}
                        </div>
                        {item.catatan && <p className="text-[10px] text-red-500 italic">* {item.catatan}</p>}
                        {item.batal_alasan && <p className="text-[10px] text-red-600 italic">Alasan: {item.batal_alasan}</p>}
                      </div>
                      <div className="flex items-center gap-1.5 shrink-0">
                        <span className={`font-semibold ${isCancelled ? 'line-through text-gray-400' : 'text-gray-700'}`}>
                          Rp {Number(item.subtotal).toLocaleString('id-ID')}
                        </span>
                        {!isCancelled && !item.is_served && (
                          <button
                            type="button"
                            onClick={() => handleCancelOrderItem(item)}
                            className="p-1 text-red-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors"
                            title="Batalkan Menu Ini"
                          >
                            <FiTrash2 size={13} />
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Panel Mode Tambah Menu Pesanan */}
              {isAddingAddon && (
                <div className="p-2.5 bg-blue-50/90 border border-blue-300 rounded-xl space-y-2 shrink-0 animate-fade-in shadow-2xs">
                  <div className="flex justify-between items-center text-xs font-bold text-blue-950">
                    <span className="flex items-center gap-1.5">
                      <FiPlusCircle className="text-blue-600" /> Keranjang Menu Tambahan ({addonCart.length}):
                    </span>
                    <button
                      type="button"
                      onClick={() => { setIsAddingAddon(false); setAddonCart([]); }}
                      className="text-red-600 hover:text-red-800 text-[10px] font-bold"
                    >
                      Tutup
                    </button>
                  </div>
                  {addonCart.length === 0 ? (
                    <p className="text-[11px] text-blue-700 italic py-1 text-center font-medium">
                      👈 Klik item menu di panel kiri untuk menambah pesanan ke meja ini.
                    </p>
                  ) : (
                    <div className="space-y-1.5 max-h-32 overflow-y-auto custom-scrollbar">
                      {addonCart.map(item => (
                        <div key={item.food_id} className="flex justify-between items-center text-xs bg-white p-1.5 rounded-lg border border-blue-200">
                          <div className="flex-1 pr-1 truncate">
                            <span className="font-bold text-gray-800">{item.food.nama}</span>
                            <span className="text-[10px] text-green-700 block font-semibold">Rp {Number(item.food.harga).toLocaleString('id-ID')}</span>
                          </div>
                          <div className="flex items-center gap-1 shrink-0">
                            <button
                              type="button"
                              onClick={() => handleUpdateAddonQty(item.food_id, -1)}
                              className="w-5 h-5 bg-gray-200 hover:bg-gray-300 text-gray-800 rounded flex items-center justify-center text-xs font-bold"
                            >
                              -
                            </button>
                            <span className="w-5 text-center text-xs font-bold">{item.jumlah}</span>
                            <button
                              type="button"
                              onClick={() => handleUpdateAddonQty(item.food_id, 1)}
                              className="w-5 h-5 bg-blue-600 hover:bg-blue-700 text-white rounded flex items-center justify-center text-xs font-bold"
                            >
                              +
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  {addonCart.length > 0 && (
                    <button
                      type="button"
                      onClick={handleSubmitAddonOrder}
                      className="w-full py-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-extrabold rounded-lg text-xs flex items-center justify-center gap-1.5 shadow-sm transition-all"
                    >
                      🍳 Kirim Menu Tambahan ke Dapur
                    </button>
                  )}
                </div>
              )}

              <div className="shrink-0 space-y-2 pt-1 border-t bg-white">
                {selectedTable.active_order.payment_status === 'UNPAID' && (
                  <div className="p-2 bg-amber-50 border border-amber-300 rounded-lg text-amber-900 text-[11px] font-semibold text-center">
                    📌 <strong>Reminder Kasir:</strong> Pembayaran ditagih saat pengantaran hidangan atau customer selesai makan.
                  </div>
                )}

                <div className="flex justify-between font-bold text-sm text-gray-900">
                  <span>Total Tagihan:</span>
                  <span className="text-green-700">Rp {Number(selectedTable.active_order.total).toLocaleString('id-ID')}</span>
                </div>

                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setIsAddingAddon(!isAddingAddon)}
                    className="flex-1 py-2 bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200 font-bold rounded-xl text-xs transition-colors flex items-center justify-center gap-1"
                  >
                    <FiPlus size={14} /> + Nambah Menu
                  </button>
                  <button
                    type="button"
                    onClick={handleCancelEntireOrder}
                    className="py-2 px-3 bg-red-50 hover:bg-red-100 text-red-600 border border-red-200 font-bold rounded-xl text-xs transition-colors flex items-center justify-center gap-1"
                    title="Batalkan Seluruh Pesanan Meja Ini"
                  >
                    <FiTrash2 size={14} /> Batal Order
                  </button>
                </div>

                {selectedTable.active_order.payment_status === 'UNPAID' ? (
                  <button
                    onClick={handleOpenPaymentModal}
                    className="w-full py-3 bg-gradient-to-r from-amber-600 to-amber-500 hover:from-amber-700 hover:to-amber-600 text-white font-bold rounded-xl shadow-md text-sm transition-all flex items-center justify-center gap-2"
                  >
                    <FiDollarSign size={18} />
                    💳 PROSES PEMBAYARAN (TAGIH CUSTOMER)
                  </button>
                ) : (
                  <div className="space-y-1.5">
                    <button
                      type="button"
                      onClick={() => handleCompleteOrder(selectedTable.active_order)}
                      className="w-full py-2.5 bg-green-600 hover:bg-green-700 text-white font-black rounded-xl shadow-md text-xs transition-all flex items-center justify-center gap-2"
                    >
                      <FiCheckCircle size={16} /> ✅ Selesai Makan & Kosongkan Meja
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setCurrentReceiptOrder(selectedTable.active_order);
                        setReceiptType('both');
                        setBothPrintStep(1);
                        setShowReceiptModal(true);
                      }}
                      className="w-full py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold rounded-xl text-xs transition-all flex items-center justify-center gap-1.5 border border-gray-200"
                    >
                      <FiPrinter size={15} /> Cetak Struk
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* CASE 3: TABLE NEEDS CLEANING */}
          {selectedTable && selectedTable.status === 'NEEDS_CLEANING' && (
            <div className="text-center py-8 bg-amber-50 rounded-xl border border-amber-200 p-4 my-auto space-y-3">
              <FiAlertCircle size={40} className="mx-auto text-amber-600" />
              <div>
                <h4 className="font-bold text-amber-900 text-sm">Nomor Antrian Selesai Digunakan</h4>
                <p className="text-xs text-amber-700 mt-1">
                  Customer sudah selesai makan dan bayar. Klik tombol di bawah untuk mengosongkan meja agar siap untuk pelanggan berikutnya.
                </p>
              </div>
              <button
                type="button"
                onClick={() => handleResetTable(selectedTable)}
                className="w-full py-2.5 bg-green-600 hover:bg-green-700 text-white font-black rounded-xl text-xs shadow-sm transition-all flex items-center justify-center gap-1.5"
              >
                🧹 Kosongkan & Jadikan Tersedia (Hijau)
              </button>
            </div>
          )}

          {/* CASE 3.5: TABLE UNAVAILABLE */}
          {selectedTable && selectedTable.status === 'UNAVAILABLE' && (
            <div className="text-center py-8 bg-gray-50 rounded-xl border border-gray-200 p-4 my-auto">
              <FiSlash size={40} className="mx-auto mb-2 text-gray-400" />
              <h4 className="font-bold text-gray-800 text-sm">Nomor Antrian Sedang Tidak Tersedia</h4>
              <p className="text-xs text-gray-500 mt-1">
                Nomor antrian ini sedang dinonaktifkan oleh admin (misal rusak/hilang/sedang disimpan).
              </p>
            </div>
          )}

          {/* CASE 4: TABLE AVAILABLE - CREATE NEW ORDER CART */}
          {selectedTable && selectedTable.status === 'AVAILABLE' && (
            <div className="flex-1 flex flex-col min-h-0 overflow-hidden">
              {cart.length === 0 ? (
                <div className="text-center py-12 text-gray-400 my-auto">
                  <p className="text-xs font-medium">Keranjang masih kosong.</p>
                  <p className="text-[11px] text-gray-400 mt-1">Klik item menu di sebelah kiri untuk menambah pesanan.</p>
                </div>
              ) : (
                <>
                  {/* SCROLLABLE CART ITEMS LIST ONLY */}
                  <div className="flex-1 overflow-y-auto min-h-0 pr-1 space-y-2 custom-scrollbar">
                    {cart.map(item => (
                      <div key={item.food_id} className="p-2 bg-gray-50 border rounded-lg space-y-1.5">
                        <div className="flex justify-between items-start">
                          <div>
                            <h5 className="font-bold text-xs text-gray-800">{item.food.nama}</h5>
                            <span className="text-[10px] text-green-700 font-semibold">
                              Rp {Number(item.food.harga).toLocaleString('id-ID')}
                            </span>
                          </div>
                          <button
                            onClick={() => handleUpdateQty(item.food_id, -item.jumlah)}
                            className="text-red-400 hover:text-red-600 p-1"
                          >
                            <FiTrash2 size={14} />
                          </button>
                        </div>

                        {/* Quantity controls & notes */}
                        <div className="flex justify-between items-center pt-1">
                          <input
                            type="text"
                            placeholder="Catatan (mis: Pedas/No es)"
                            value={item.catatan}
                            onChange={(e) => handleItemNoteChange(item.food_id, e.target.value)}
                            className="text-[10px] px-2 py-0.5 border rounded w-36 focus:ring-green-500"
                          />
                          <div className="flex items-center gap-1">
                            <button
                              onClick={() => handleUpdateQty(item.food_id, -1)}
                              className="w-6 h-6 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded flex items-center justify-center text-xs font-bold"
                            >
                              -
                            </button>
                            <span className="w-6 text-center text-xs font-bold">{item.jumlah}</span>
                            <button
                              onClick={() => handleUpdateQty(item.food_id, 1)}
                              className="w-6 h-6 bg-green-600 hover:bg-green-700 text-white rounded flex items-center justify-center text-xs font-bold"
                            >
                              +
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* FIXED BOTTOM FORM INPUTS */}
                  <div className="shrink-0 pt-3 mt-2 border-t space-y-2 bg-white">
                    <div>
                      <label className="text-xs font-bold text-gray-700 block mb-1">
                        Nama Customer / Pemesan:
                      </label>
                      <input
                        type="text"
                        placeholder="Ketik nama customer (mis: Budi)"
                        value={customerName}
                        onChange={(e) => setCustomerName(e.target.value)}
                        className="w-full text-xs p-2 border border-gray-300 rounded-lg focus:ring-green-500 font-semibold"
                      />
                    </div>

                    <div>
                      <label className="text-xs font-bold text-gray-700 block mb-1">
                        Status Pembayaran saat Pesan:
                      </label>
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5">
                        <button
                          type="button"
                          onClick={() => setPaymentStatusOption('Cash')}
                          className={`py-1.5 px-1 rounded-lg text-[10px] font-bold border transition-colors ${paymentStatusOption === 'Cash' ? 'bg-green-600 text-white border-green-600 shadow-xs ring-2 ring-green-300' : 'bg-gray-50 text-gray-700 hover:bg-gray-100'}`}
                        >
                          💵 Cash
                        </button>
                        <button
                          type="button"
                          onClick={() => setPaymentStatusOption('QRIS')}
                          className={`py-1.5 px-1 rounded-lg text-[10px] font-bold border transition-colors ${paymentStatusOption === 'QRIS' ? 'bg-blue-600 text-white border-blue-600 shadow-xs ring-2 ring-blue-300' : 'bg-gray-50 text-gray-700 hover:bg-gray-100'}`}
                        >
                          📱 QRIS
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setPaymentStatusOption('SPLIT');
                            const half = Math.floor(subtotal / 2);
                            setOrderSplitCash(half.toString());
                            setOrderSplitQris((subtotal - half).toString());
                          }}
                          className={`py-1.5 px-1 rounded-lg text-[10px] font-bold border transition-colors ${paymentStatusOption === 'SPLIT' ? 'bg-purple-600 text-white border-purple-600 shadow-xs ring-2 ring-purple-300' : 'bg-gray-50 text-gray-700 hover:bg-gray-100'}`}
                        >
                          💵📱 Split
                        </button>
                        <button
                          type="button"
                          onClick={() => setPaymentStatusOption('UNPAID')}
                          className={`py-1.5 px-1 rounded-lg text-[10px] font-bold border transition-colors ${paymentStatusOption === 'UNPAID' ? 'bg-amber-500 text-white border-amber-600 shadow-xs ring-2 ring-amber-300' : 'bg-gray-50 text-gray-700 hover:bg-gray-100'}`}
                        >
                          ⚠️ Belum Bayar
                        </button>
                      </div>

                      {paymentStatusOption === 'Cash' && (
                        <div className="p-2.5 bg-green-50/80 border border-green-300 rounded-xl space-y-2 animate-fade-in mt-1.5 shadow-2xs">
                          <div className="flex justify-between items-center text-xs font-bold text-green-950">
                            <span>Uang Diberikan (Rp):</span>
                            <input
                              type="number"
                              placeholder={`Default Pas (${subtotal.toLocaleString('id-ID')})`}
                              value={orderCashGiven}
                              onChange={(e) => setOrderCashGiven(e.target.value)}
                              className="w-32 text-xs font-extrabold p-1.5 border border-green-400 rounded-lg focus:ring-green-600 text-right bg-white text-green-900"
                            />
                          </div>
                          {/* Presets only equal or greater than subtotal */}
                          <div className="flex gap-1">
                            {Array.from(new Set([
                              subtotal,
                              Math.ceil(subtotal / 10000) * 10000,
                              50000,
                              100000,
                              200000,
                            ]))
                              .filter(v => v >= subtotal)
                              .slice(0, 4)
                              .map((preset, pIdx) => {
                                const isActive = orderCashGiven === preset.toString() || (pIdx === 0 && !orderCashGiven);
                                return (
                                  <button
                                    key={pIdx}
                                    type="button"
                                    onClick={() => setOrderCashGiven(preset.toString())}
                                    className={`flex-1 py-1 border rounded-md text-[10px] font-bold transition-all ${isActive ? 'bg-green-700 text-white border-green-700 shadow-xs' : 'bg-white border-green-300 hover:bg-green-100 text-green-800'}`}
                                  >
                                    {preset === subtotal ? 'Uang Pas' : `${preset / 1000}k`}
                                  </button>
                                );
                              })}
                          </div>
                          <div className="flex justify-between text-xs font-black text-green-950 border-t border-green-200 pt-1.5">
                            <span>Kembalian Tunai:</span>
                            <span className={(parseInt(orderCashGiven) || subtotal) < subtotal ? 'text-red-600' : 'text-green-700'}>
                              Rp {Math.max(0, (parseInt(orderCashGiven) || subtotal) - subtotal).toLocaleString('id-ID')}
                            </span>
                          </div>
                        </div>
                      )}

                      {paymentStatusOption === 'QRIS' && (
                        <div className="p-2.5 bg-blue-50/80 border border-blue-300 rounded-xl space-y-1 animate-fade-in mt-1.5 shadow-2xs text-xs text-blue-900">
                          <div className="flex justify-between items-center font-bold">
                            <span>📱 Scan QRIS / Transfer:</span>
                            <span className="font-black text-sm text-blue-800">Rp {subtotal.toLocaleString('id-ID')}</span>
                          </div>
                          <p className="text-[10px] text-blue-700">Pastikan customer scan QRIS sesuai total tagihan di atas.</p>
                        </div>
                      )}

                      {paymentStatusOption === 'SPLIT' && (
                        <div className="p-2.5 bg-purple-50/90 border border-purple-300 rounded-xl space-y-2 animate-fade-in mt-1.5 shadow-2xs text-xs">
                          <div className="flex justify-between items-center text-purple-950 font-bold">
                            <span>💵 Uang Cash (Rp):</span>
                            <input
                              type="number"
                              placeholder="0"
                              value={orderSplitCash}
                              onChange={(e) => {
                                const val = e.target.value;
                                setOrderSplitCash(val);
                                const cNum = parseInt(val) || 0;
                                setOrderSplitQris(Math.max(0, subtotal - cNum).toString());
                              }}
                              className="w-28 text-xs font-black p-1.5 border border-purple-400 rounded-lg focus:ring-purple-600 text-right bg-white text-purple-900"
                            />
                          </div>
                          <div className="flex justify-between items-center text-purple-950 font-bold">
                            <span>📱 Bayar QRIS (Rp):</span>
                            <input
                              type="number"
                              placeholder="0"
                              value={orderSplitQris}
                              onChange={(e) => setOrderSplitQris(e.target.value)}
                              className="w-28 text-xs font-black p-1.5 border border-purple-400 rounded-lg focus:ring-purple-600 text-right bg-white text-purple-900"
                            />
                          </div>
                          <div className="flex justify-between text-xs font-black text-purple-950 border-t border-purple-200 pt-1.5">
                            <span>Total Pembayaran:</span>
                            <span>Rp {((parseInt(orderSplitCash) || 0) + (parseInt(orderSplitQris) || 0)).toLocaleString('id-ID')}</span>
                          </div>
                          {((parseInt(orderSplitCash) || 0) + (parseInt(orderSplitQris) || 0)) > subtotal && (
                            <div className="flex justify-between text-xs font-black text-green-700">
                              <span>Kembalian Tunai:</span>
                              <span>Rp {(((parseInt(orderSplitCash) || 0) + (parseInt(orderSplitQris) || 0)) - subtotal).toLocaleString('id-ID')}</span>
                            </div>
                          )}
                          {((parseInt(orderSplitCash) || 0) + (parseInt(orderSplitQris) || 0)) < subtotal && (
                            <p className="text-[10px] text-red-600 font-bold italic">
                              ⚠️ Total pembayaran masih kurang Rp {(subtotal - ((parseInt(orderSplitCash) || 0) + (parseInt(orderSplitQris) || 0))).toLocaleString('id-ID')}
                            </p>
                          )}
                        </div>
                      )}
                    </div>

                    <div>
                      <label className="text-xs font-bold text-gray-700 block mb-1">
                        Catatan Pesanan:
                      </label>
                      <textarea
                        placeholder="Catatan umum pesanan antrian..."
                        value={orderNote}
                        onChange={(e) => setOrderNote(e.target.value)}
                        className="w-full text-xs p-1.5 border border-gray-300 rounded-lg focus:ring-green-500"
                        rows={1}
                      />
                    </div>

                    <div className="flex justify-between font-bold text-sm pt-1">
                      <span>Total Pesanan:</span>
                      <span className="text-green-700">Rp {subtotal.toLocaleString('id-ID')}</span>
                    </div>

                    <button
                      onClick={handleSendOrder}
                      disabled={isSubmittingOrder}
                      className={`w-full py-2.5 bg-green-600 hover:bg-green-700 text-white font-bold rounded-xl text-sm shadow transition-colors flex items-center justify-center gap-2 ${isSubmittingOrder ? 'opacity-50 cursor-not-allowed' : ''}`}
                    >
                      <FiCheckCircle size={18} />
                      {isSubmittingOrder ? 'Memproses Pesanan...' : 'Kirim Pesanan ke Dapur'}
                    </button>
                  </div>
                </>
              )}
            </div>
          )}
        </div>

      </div>

      {/* MODAL PEMBAYARAN */}
      {showPaymentModal && selectedTable?.active_order && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4">
            <div className="flex justify-between items-center border-b pb-3">
              <h3 className="font-bold text-base text-gray-800 flex items-center gap-2">
                <FiCreditCard className="text-green-600" />
                Pembayaran No. Antrian {selectedTable.nomor_meja}
              </h3>
              <button onClick={() => setShowPaymentModal(false)} className="text-gray-400 hover:text-gray-600">
                <FiX size={20} />
              </button>
            </div>

            <div className="bg-green-50 border border-green-200 rounded-xl p-4 text-center">
              <span className="text-xs text-green-800 font-semibold block uppercase tracking-wider">Total Tagihan</span>
              <span className="text-2xl font-black text-green-700">
                Rp {Number(selectedTable.active_order.total).toLocaleString('id-ID')}
              </span>
            </div>

            {/* Payment Method Selector (Cash, QRIS, or SPLIT) */}
            <div>
              <label className="text-xs font-bold text-gray-700 block mb-1">Metode Pembayaran:</label>
              <div className="grid grid-cols-3 gap-1.5">
                {[
                  { id: 'Cash', label: '💵 Cash' },
                  { id: 'QRIS', label: '📱 QRIS' },
                  { id: 'SPLIT', label: '💵📱 Split' },
                ].map(m => (
                  <button
                    key={m.id}
                    type="button"
                    onClick={() => {
                      setPaymentMethod(m.id);
                      if (m.id === 'QRIS' && selectedTable?.active_order) {
                        setJumlahBayar(selectedTable.active_order.total.toString());
                      } else if (m.id === 'SPLIT' && selectedTable?.active_order) {
                        const half = Math.floor(selectedTable.active_order.total / 2);
                        setPaymentSplitCash(half.toString());
                        setPaymentSplitQris((selectedTable.active_order.total - half).toString());
                      }
                    }}
                    className={`py-2 rounded-lg text-xs font-bold border transition-colors ${paymentMethod === m.id ? 'bg-green-600 text-white border-green-600 shadow-xs ring-2 ring-green-300' : 'bg-gray-50 text-gray-700 hover:bg-gray-100'}`}
                  >
                    {m.label}
                  </button>
                ))}
              </div>
            </div>

            {paymentMethod === 'Cash' && (
              <>
                {/* Jumlah Bayar Input */}
                <div>
                  <label className="text-xs font-bold text-gray-700 block mb-1">Jumlah Bayar Tunai / Cash (Rp):</label>
                  <input
                    type="number"
                    value={jumlahBayar}
                    onChange={(e) => setJumlahBayar(e.target.value)}
                    className="w-full text-base font-bold text-gray-800 px-3 py-2 border rounded-lg focus:ring-green-500"
                    placeholder="Masukkan nominal bayar"
                  />

                  {/* Quick Cash Presets */}
                  <div className="flex gap-1.5 mt-2">
                    {[
                      selectedTable.active_order.total,
                      20000,
                      50000,
                      100000,
                    ].map((val, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => setJumlahBayar(val.toString())}
                        className="flex-1 py-1 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded text-[11px] font-semibold"
                      >
                        {val === selectedTable.active_order.total ? 'Uang Pas' : `${val / 1000}k`}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Kembalian Calculation */}
                <div className="flex justify-between items-center pt-2 border-t text-sm font-bold">
                  <span>Kembalian:</span>
                  <span className={(parseInt(jumlahBayar) || 0) < selectedTable.active_order.total ? 'text-red-600' : 'text-green-700'}>
                    Rp {Math.max(0, (parseInt(jumlahBayar) || 0) - selectedTable.active_order.total).toLocaleString('id-ID')}
                  </span>
                </div>
              </>
            )}

            {paymentMethod === 'QRIS' && (
              <div className="bg-blue-50 border border-blue-200 rounded-xl p-3.5 text-center space-y-1">
                <span className="text-xs font-bold text-blue-900 flex items-center justify-center gap-1.5">
                  📱 Pembayaran QRIS Non-Tunai
                </span>
                <p className="text-xs text-blue-700 font-medium">
                  Nominal pembayaran QRIS otomatis pas sesuai tagihan: <strong className="font-extrabold text-blue-900">Rp {Number(selectedTable.active_order.total).toLocaleString('id-ID')}</strong> (tanpa kembalian).
                </p>
              </div>
            )}

            {paymentMethod === 'SPLIT' && (
              <div className="p-3 bg-purple-50/90 border border-purple-300 rounded-xl space-y-2.5 text-xs animate-fade-in shadow-2xs">
                <div className="flex justify-between items-center text-purple-950 font-bold">
                  <span>💵 Uang Cash Diterima (Rp):</span>
                  <input
                    type="number"
                    placeholder="0"
                    value={paymentSplitCash}
                    onChange={(e) => {
                      const val = e.target.value;
                      setPaymentSplitCash(val);
                      const cNum = parseInt(val) || 0;
                      setPaymentSplitQris(Math.max(0, selectedTable.active_order.total - cNum).toString());
                    }}
                    className="w-32 text-xs font-black p-1.5 border border-purple-400 rounded-lg focus:ring-purple-600 text-right bg-white text-purple-900"
                  />
                </div>
                <div className="flex justify-between items-center text-purple-950 font-bold">
                  <span>📱 Nominal QRIS (Rp):</span>
                  <input
                    type="number"
                    placeholder="0"
                    value={paymentSplitQris}
                    onChange={(e) => setPaymentSplitQris(e.target.value)}
                    className="w-32 text-xs font-black p-1.5 border border-purple-400 rounded-lg focus:ring-purple-600 text-right bg-white text-purple-900"
                  />
                </div>
                <div className="flex justify-between text-xs font-black text-purple-950 border-t border-purple-200 pt-1.5">
                  <span>Total Pembayaran Masuk:</span>
                  <span>Rp {((parseInt(paymentSplitCash) || 0) + (parseInt(paymentSplitQris) || 0)).toLocaleString('id-ID')}</span>
                </div>
                {((parseInt(paymentSplitCash) || 0) + (parseInt(paymentSplitQris) || 0)) > selectedTable.active_order.total && (
                  <div className="flex justify-between text-xs font-black text-green-700">
                    <span>Kembalian Tunai:</span>
                    <span>Rp {(((parseInt(paymentSplitCash) || 0) + (parseInt(paymentSplitQris) || 0)) - selectedTable.active_order.total).toLocaleString('id-ID')}</span>
                  </div>
                )}
                {((parseInt(paymentSplitCash) || 0) + (parseInt(paymentSplitQris) || 0)) < selectedTable.active_order.total && (
                  <p className="text-[10px] text-red-600 font-bold italic">
                    ⚠️ Total pembayaran masih kurang Rp {(selectedTable.active_order.total - ((parseInt(paymentSplitCash) || 0) + (parseInt(paymentSplitQris) || 0))).toLocaleString('id-ID')}
                  </p>
                )}
              </div>
            )}

            <button
              onClick={handleProcessPayment}
              className="w-full py-3 bg-green-600 hover:bg-green-700 text-white font-bold rounded-xl text-sm transition-colors shadow"
            >
              Konfirmasi & Selesaikan Pembayaran
            </button>
          </div>
        </div>
      )}



      {/* MODAL PRINT RECEIPT (PREVIEW & PRINT) */}
      {showReceiptModal && currentReceiptOrder && (() => {
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
          <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4 animate-fade-in">
            <div className="bg-white rounded-2xl max-w-md w-full max-h-[92vh] flex flex-col p-4 shadow-2xl space-y-3 overflow-hidden">
              {/* Header with Type Selector */}
              <div className="flex justify-between items-center border-b pb-2 shrink-0">
                <div>
                  <h3 className="font-bold text-sm text-gray-800 flex items-center gap-2">
                    <FiPrinter className="text-green-600" />
                    Cetak Struk Thermal POS (80mm)
                  </h3>
                  <div className="flex items-center gap-1.5 mt-1.5">
                    <button
                      onClick={() => {
                        setReceiptType('both');
                        setBothPrintStep(1);
                      }}
                      className={`px-2.5 py-1 rounded-lg text-xs font-black transition-all ${
                        receiptType === 'both' ? 'bg-green-600 text-white shadow-xs' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                      }`}
                    >
                      ✂️ 2 Lembar (Klik 2x)
                    </button>
                    <button
                      onClick={() => setReceiptType('customer')}
                      className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all ${
                        receiptType === 'customer' ? 'bg-green-600 text-white shadow-xs' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                      }`}
                    >
                      🖨️ Customer Saja
                    </button>
                    <button
                      onClick={() => setReceiptType('kitchen')}
                      className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all ${
                        receiptType === 'kitchen' ? 'bg-blue-600 text-white shadow-xs' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                      }`}
                    >
                      🍳 Dapur Saja
                    </button>
                  </div>
                </div>
                <button onClick={() => setShowReceiptModal(false)} className="text-gray-400 hover:text-gray-600 p-1.5 rounded-lg hover:bg-gray-100">
                  <FiX size={18} />
                </button>
              </div>

              {/* Status info bar saat mode 2 lembar */}
              {receiptType === 'both' && (
                <div className="px-3 py-1.5 rounded-xl text-xs font-bold flex justify-between items-center bg-gray-100 border border-gray-200">
                  <span className="text-gray-800">
                    {bothPrintStep === 1 && '📄 Lembar 1: Struk Pembayaran Customer'}
                    {bothPrintStep === 2 && '🍳 Lembar 2: Ticket Pesanan Dapur'}
                    {bothPrintStep === 3 && '✅ Kedua lembar resi telah dicetak!'}
                  </span>
                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-black ${
                    bothPrintStep === 1 ? 'bg-green-100 text-green-800' :
                    bothPrintStep === 2 ? 'bg-blue-100 text-blue-800 animate-pulse' :
                    'bg-emerald-100 text-emerald-800'
                  }`}>
                    {bothPrintStep === 1 && 'Klik 1 dari 2'}
                    {bothPrintStep === 2 && 'Klik 2 dari 2'}
                    {bothPrintStep === 3 && 'Selesai'}
                  </span>
                </div>
              )}

              {/* Scrollable Printable Preview */}
              <div className="flex-1 overflow-y-auto min-h-0 py-2 px-1 bg-gray-50 rounded-xl border border-gray-200 custom-scrollbar">
                <Receipt order={currentReceiptOrder} type={activeTypeToRender} paperSize="80mm" />
              </div>

              {/* Action Buttons with 2-Click Sequence */}
              <div className="space-y-1.5 shrink-0 pt-1 border-t">
                {receiptType === 'both' ? (
                  <>
                    {bothPrintStep === 1 && (
                      <button
                        onClick={handlePrintStep}
                        className="w-full py-3 bg-green-600 hover:bg-green-700 active:scale-[0.99] text-white font-black rounded-xl text-xs sm:text-sm flex items-center justify-center gap-2 shadow-md transition-all"
                      >
                        <FiPrinter size={18} /> [Klik 1] Print Struk Customer
                      </button>
                    )}

                    {bothPrintStep === 2 && (
                      <button
                        onClick={handlePrintStep}
                        className="w-full py-3 bg-blue-600 hover:bg-blue-700 active:scale-[0.99] text-white font-black rounded-xl text-xs sm:text-sm flex items-center justify-center gap-2 shadow-md transition-all animate-pulse"
                      >
                        <FiPrinter size={18} /> [Klik 2] Lanjut Print Ticket Dapur
                      </button>
                    )}

                    {bothPrintStep === 3 && (
                      <div className="flex gap-2">
                        <button
                          onClick={() => setBothPrintStep(1)}
                          className="flex-1 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-800 font-bold rounded-xl text-xs transition-colors flex items-center justify-center gap-1.5"
                        >
                          🔄 Cetak Ulang Lembar 1
                        </button>
                        <button
                          onClick={() => setShowReceiptModal(false)}
                          className="flex-1 py-2.5 bg-green-600 hover:bg-green-700 text-white font-bold rounded-xl text-xs transition-colors"
                        >
                          ✅ Selesai & Tutup
                        </button>
                      </div>
                    )}

                    <p className="text-[11px] text-gray-500 text-center font-medium">
                      {bothPrintStep === 1 && '💡 Klik tombol ini untuk print struk customer, lalu robek kertas.'}
                      {bothPrintStep === 2 && '✂️ Kertas struk customer sudah dirobek? Klik untuk print ticket dapur.'}
                      {bothPrintStep === 3 && 'Kedua resi telah selesai dicetak terpisah.'}
                    </p>
                  </>
                ) : (
                  <button
                    onClick={handlePrintStep}
                    className={`w-full py-3 active:scale-[0.99] text-white font-black rounded-xl text-xs sm:text-sm flex items-center justify-center gap-2 shadow-md transition-all ${
                      receiptType === 'kitchen' ? 'bg-blue-600 hover:bg-blue-700' : 'bg-green-600 hover:bg-green-700'
                    }`}
                  >
                    <FiPrinter size={18} /> Print {receiptType === 'customer' ? 'Struk Customer' : 'Ticket Dapur'}
                  </button>
                )}

                <div className="flex gap-2 pt-1">
                  <button
                    type="button"
                    onClick={() => {
                      setShowReceiptModal(false);
                      if (currentReceiptOrder?.table) {
                        setSelectedTable(currentReceiptOrder.table);
                      }
                    }}
                    className="flex-1 py-2 bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-300 font-bold rounded-xl text-xs transition-colors flex items-center justify-center gap-1.5"
                    title="Kembali ke pesanan meja ini untuk edit atau tambah menu"
                  >
                    <FiCornerUpLeft size={14} /> ⬅️ Kembali / Edit Pesanan
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowReceiptModal(false)}
                    className="flex-1 py-2 bg-gray-100 hover:bg-gray-200 text-gray-600 font-bold rounded-xl text-xs transition-colors"
                  >
                    Tutup
                  </button>
                </div>
              </div>
            </div>
          </div>
        );
      })()}
    </Sidebar>
  );
}
