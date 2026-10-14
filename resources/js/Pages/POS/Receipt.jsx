import React from 'react';

/**
 * Helper to format Date without seconds (DD/MM/YYYY, HH.MM)
 */
const formatDateNoSeconds = (dateStr) => {
  if (!dateStr) return '';
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return dateStr;
  const dateFormatted = d.toLocaleDateString('id-ID', { day: 'numeric', month: 'numeric', year: 'numeric' });
  const timeFormatted = d.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit', hour12: false });
  return `${dateFormatted}, ${timeFormatted.replace(':', '.')}`;
};

/**
 * Single Receipt Content: Handles Customer Receipt or Kitchen Ticket
 * Edge-to-edge width & bold readable typography
 * KITCHEN TICKET: All CAPSLOCK & Extra Large Fonts
 */
function SingleReceiptContent({ order, isKitchen, paperSize = '80mm' }) {
  const rawPaymentMethod = order.payment?.metode_pembayaran || order.metode_pembayaran || 'Cash';
  const isCash = rawPaymentMethod.toLowerCase() === 'cash';
  const isPaid = (order.payment_status || '').toUpperCase() === 'PAID' || Boolean(order.payment);

  /* =========================================================
   * 1. STRUK CUSTOMER (VERSI PERSIS 21 MENIT LALU)
   * ========================================================= */
  if (!isKitchen) {
    return (
      <div className="pos-receipt-printable w-full mx-auto font-mono text-black leading-tight px-0">
        {/* HEADER TOKO */}
        <div className="text-center mb-2 pb-2 border-b-2 border-dashed border-gray-600 space-y-1">
          <img
            src="/storage/logo/logoo.png"
            alt="Logo Palantea"
            className="w-24 h-auto mx-auto mb-1 object-contain"
          />
          <h2 className="font-black text-lg sm:text-xl uppercase tracking-wider text-black leading-tight">
            CENTRAL PALANTEA HIDROPONIK
          </h2>
          <p className="text-xs font-bold text-black">
            Agrowisata Center — Cafe • Space • Hydroponic
          </p>
          <p className="text-xs text-gray-800 leading-tight">
            Jl. Melayu, Babussalam, Mandau, Bengkalis, Riau
          </p>
        </div>

        {/* NOMOR MEJA & INFORMASI PESANAN */}
        <div className="space-y-1 mb-2 pb-1.5 border-b-2 border-dashed border-gray-600">
          <div className="flex justify-between items-center my-1 py-1 px-1.5 bg-gray-100 border-y-2 border-black">
            <span className="font-black uppercase tracking-wider text-xs sm:text-sm text-black">
              NO. MEJA:
            </span>
            <span className="font-black tracking-tight text-3xl sm:text-4xl text-black">
              NO. {order.table?.nomor_meja || order.table_id || order.nomor_meja || '--'}
            </span>
          </div>

          <div className="flex justify-between text-xs sm:text-sm font-bold text-black pt-0.5">
            <span>Pelanggan:</span>
            <span className="uppercase font-black">{order.nama_pelanggan || 'Pelanggan'}</span>
          </div>

          <div className="flex justify-between text-xs text-black">
            <span>No Pesanan:</span>
            <span className="font-bold">{order.nomor_pesanan}</span>
          </div>

          <div className="flex justify-between text-xs sm:text-sm text-black">
            <span>Bayar Via:</span>
            <span className="font-black uppercase">{rawPaymentMethod.toUpperCase()}</span>
          </div>

          <div className="flex justify-between text-xs text-black">
            <span>Waktu:</span>
            <span className="font-semibold">{formatDateNoSeconds(order.created_at || Date.now())}</span>
          </div>

          <div className="flex justify-between text-xs text-black">
            <span>Kasir:</span>
            <span className="font-semibold">{order.cashier?.name || 'Kasir'}</span>
          </div>
        </div>

        {/* DAFTAR MENU (ITEMS) DENGAN PISAHAN BATCH AWAL & TAMBAHAN */}
        <div className="mb-2 pb-2 border-b-2 border-dashed border-gray-600 space-y-2">
          <div className="text-xs font-black uppercase tracking-wider border-b-2 border-black pb-1 flex justify-between">
            <span>MENU PESANAN</span>
            <span>HARGA</span>
          </div>

          {(() => {
            const hasMultipleBatches = order.items && order.items.some(it => (it.batch_no || 1) > 1);
            if (!hasMultipleBatches) {
              return (
                <div className="space-y-1.5 pt-0.5">
                  {order.items?.map((item, idx) => (
                    <div key={idx} className="space-y-0.5 pb-1 border-b border-gray-200 last:border-b-0 text-xs sm:text-sm">
                      <div className="flex justify-between items-start gap-1">
                        <span className="font-bold text-black text-sm sm:text-base leading-snug break-words flex-1">
                          <span className="text-base sm:text-lg font-black mr-1">{item.jumlah}x</span> {item.food?.nama || 'Menu'}
                        </span>
                        <span className="font-black text-black text-sm sm:text-base whitespace-nowrap shrink-0 text-right">
                          Rp {Number(item.subtotal).toLocaleString('id-ID')}
                        </span>
                      </div>
                      {item.jumlah > 1 && (
                        <div className="text-xs text-gray-700 pl-6">
                          @ Rp {Number(item.harga_satuan).toLocaleString('id-ID')}
                        </div>
                      )}
                      {item.catatan && (
                        <div className="text-xs font-black italic text-black pl-6">
                          * Note: {item.catatan}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              );
            }

            // Group by batch_no
            const batches = {};
            order.items.forEach(it => {
              const b = (it.batch_no && Number(it.batch_no) > 0) ? Number(it.batch_no) : 1;
              if (!batches[b]) batches[b] = [];
              batches[b].push(it);
            });

            const sortedBatchKeys = Object.keys(batches).map(Number).sort((a, b) => a - b);

            return (
              <div className="space-y-3 pt-0.5">
                {sortedBatchKeys.map(bNo => {
                  const bItems = batches[bNo];
                  const bSubtotal = bItems.filter(i => i.status !== 'CANCELLED').reduce((s, i) => s + (Number(i.subtotal) || 0), 0);
                  const isFirstBatch = bNo === 1;

                  return (
                    <div key={bNo} className="space-y-1">
                      <div className="bg-gray-100 px-1.5 py-0.5 border-y border-dashed border-gray-500 flex justify-between text-xs font-black uppercase">
                        <span>{isFirstBatch ? '▶ PESANAN AWAL' : `▶ PESANAN TAMBAHAN #${bNo - 1}`}</span>
                        <span>Rp {bSubtotal.toLocaleString('id-ID')}</span>
                      </div>
                      <div className="space-y-1 pl-1">
                        {bItems.map((item, idx) => (
                          <div key={idx} className="space-y-0.5 pb-1 border-b border-gray-200 last:border-b-0 text-xs sm:text-sm">
                            <div className="flex justify-between items-start gap-1">
                              <span className="font-bold text-black text-sm sm:text-base leading-snug break-words flex-1">
                                <span className="text-base sm:text-lg font-black mr-1">{item.jumlah}x</span> {item.food?.nama || 'Menu'}
                              </span>
                              <span className="font-black text-black text-sm sm:text-base whitespace-nowrap shrink-0 text-right">
                                Rp {Number(item.subtotal).toLocaleString('id-ID')}
                              </span>
                            </div>
                            {item.jumlah > 1 && (
                              <div className="text-xs text-gray-700 pl-6">
                                @ Rp {Number(item.harga_satuan).toLocaleString('id-ID')}
                              </div>
                            )}
                            {item.catatan && (
                              <div className="text-xs font-black italic text-black pl-6">
                                * Note: {item.catatan}
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            );
          })()}
        </div>

        {/* CATATAN PESANAN UMUM */}
        {order.catatan && (
          <div className="mb-2 p-1.5 bg-gray-100 rounded text-xs sm:text-sm border-2 border-dashed border-black">
            <span className="font-black block uppercase text-xs">Catatan Pesanan:</span>
            <span className="font-bold italic">{order.catatan}</span>
          </div>
        )}

        {/* TOTAL & RINCIAN PEMBAYARAN */}
        <div className="space-y-1.5 mb-3 pt-1 text-xs sm:text-sm">
          {Number(order.diskon || 0) > 0 && (
            <>
              <div className="flex justify-between font-bold">
                <span>Subtotal:</span>
                <span>Rp {Number(order.subtotal || order.total || 0).toLocaleString('id-ID')}</span>
              </div>
              <div className="flex justify-between font-bold text-red-600">
                <span>Diskon:</span>
                <span>- Rp {Number(order.diskon).toLocaleString('id-ID')}</span>
              </div>
            </>
          )}

          {/* TOTAL UTAMA */}
          <div className="flex justify-between font-black text-xl sm:text-2xl pt-1.5 pb-1.5 border-t-2 border-b-2 border-black text-black">
            <span>TOTAL:</span>
            <span>Rp {Number(order.total || 0).toLocaleString('id-ID')}</span>
          </div>

          {(order.payment || order.payment_status === 'PAID') ? (
            <div className="pt-1 text-xs sm:text-sm space-y-1">
              <div className="flex justify-between font-semibold">
                <span>Metode Pembayaran:</span>
                <span className="font-black uppercase">{rawPaymentMethod.toUpperCase()}</span>
              </div>
              {rawPaymentMethod.toUpperCase() === 'SPLIT' ? (
                <>
                  <div className="flex justify-between font-semibold">
                    <span>Bayar Cash (Tunai):</span>
                    <span className="font-bold">Rp {Number(order.payment?.cash_amount ?? 0).toLocaleString('id-ID')}</span>
                  </div>
                  <div className="flex justify-between font-semibold">
                    <span>Bayar QRIS:</span>
                    <span className="font-bold">Rp {Number(order.payment?.qris_amount ?? 0).toLocaleString('id-ID')}</span>
                  </div>
                  {order.payment?.kembalian > 0 && (
                    <div className="flex justify-between font-black text-base pt-0.5 border-t border-dashed border-gray-400">
                      <span>Kembalian Tunai:</span>
                      <span>Rp {Number(order.payment.kembalian).toLocaleString('id-ID')}</span>
                    </div>
                  )}
                </>
              ) : isCash ? (
                <>
                  <div className="flex justify-between font-semibold">
                    <span>Uang Diterima:</span>
                    <span className="font-bold">Rp {Number(order.payment?.jumlah_bayar ?? order.total ?? 0).toLocaleString('id-ID')}</span>
                  </div>
                  <div className="flex justify-between font-black text-base pt-0.5 border-t border-dashed border-gray-400">
                    <span>Kembalian:</span>
                    <span>Rp {Number(order.payment?.kembalian ?? 0).toLocaleString('id-ID')}</span>
                  </div>
                </>
              ) : (
                <>
                  <div className="flex justify-between font-bold">
                    <span>Bayar QRIS:</span>
                    <span>Rp {Number(order.payment?.qris_amount || order.payment?.jumlah_bayar || order.total || 0).toLocaleString('id-ID')}</span>
                  </div>
                  {order.payment?.kembalian > 0 && (
                    <div className="flex justify-between font-black text-sm pt-0.5 border-t border-dashed border-gray-400">
                      <span>Kembalian Tunai:</span>
                      <span>Rp {Number(order.payment.kembalian).toLocaleString('id-ID')}</span>
                    </div>
                  )}
                </>
              )}
              {order.payment?.catatan_koreksi && (
                <div className="mt-1 p-1 bg-gray-100 border border-gray-300 rounded text-[11px] font-bold text-gray-800 italic">
                  * Ket: {order.payment.catatan_koreksi}
                </div>
              )}
            </div>
          ) : order.payment_status === 'UNPAID' && (
            <div className="my-2 p-2 bg-gray-100 border-2 border-dashed border-black rounded text-center text-xs text-black font-black space-y-0.5">
              <p className="text-sm font-black uppercase">⚠️ TAGIHAN BELUM LUNAS</p>
              {order.payment?.jumlah_bayar > 0 && (
                <p className="text-xs font-bold text-black">
                  Sudah Dibayar Sebelumnya: Rp {Number(order.payment.jumlah_bayar).toLocaleString('id-ID')}
                </p>
              )}
              <p className="text-xs uppercase">* Pembayaran ditagih saat makanan diantar / selesai makan *</p>
            </div>
          )}
        </div>

        {/* FOOTER STRUK */}
        <div className="text-center text-xs text-gray-800 pt-2 border-t-2 border-dashed border-gray-600 space-y-0.5">
          <p className="font-black text-black text-xs uppercase">Terima Kasih Atas Kunjungan Anda!</p>
          <p className="font-bold text-gray-800">Mohon Ditunggu, Hidangan Segera Kami Antarkan</p>
        </div>
      </div>
    );
  }

  /* =========================================================
   * 2. TICKET KANTIN / DAPUR (FONT BESAR, ALL-CAPS, NO BLOK HITAM MEJA)
   * ========================================================= */
  return (
    <div className="pos-receipt-printable w-full mx-auto font-mono text-black leading-tight px-0">
      {/* HEADER TICKET DAPUR */}
      <div className="text-center mb-2 pb-1.5 border-b-2 border-dashed border-gray-600">
        <h2 className="font-black text-2xl sm:text-3xl uppercase tracking-wider text-black leading-tight">
          {order.is_additional ? '--- TICKET DAPUR (TAMBAHAN) ---' : '--- TICKET DAPUR ---'}
        </h2>
        {order.is_additional ? (
          <div className="my-1 py-1 px-2 bg-black text-white font-black text-xs sm:text-sm uppercase rounded">
            ★ HANYA MASAK MENU TAMBAHAN INI ★
          </div>
        ) : (
          <p className="text-xs sm:text-sm font-black text-black uppercase mt-0.5">
            SEGERA SIAPKAN & MASAK
          </p>
        )}
      </div>

      {/* NOMOR MEJA & INFORMASI PESANAN (TANPA BOLD BLOK HITAM) */}
      <div className="space-y-1 mb-2 pb-1.5 border-b-2 border-dashed border-gray-600">
        {/* NOMOR MEJA: Teks Bersih di Atas Latar Putih / Garis Abu (Bukan Blok Hitam Tebal) */}
        <div className="flex justify-between items-center my-1 py-1 px-1 border-y-2 border-dashed border-gray-500 bg-gray-50">
          <span className="font-bold text-xs sm:text-sm text-black uppercase tracking-wider">
            NO. MEJA:
          </span>
          <span className="font-black text-2xl sm:text-3xl text-black tracking-tight">
            NO. {order.table?.nomor_meja || order.table_id || order.nomor_meja || '--'}
          </span>
        </div>

        <div className="flex justify-between text-xs sm:text-sm font-bold text-black pt-0.5">
          <span>PELANGGAN:</span>
          <span className="uppercase font-black">{order.nama_pelanggan || 'Pelanggan'}</span>
        </div>

        <div className="flex justify-between text-xs text-black">
          <span>NO PESANAN:</span>
          <span className="font-bold">{order.nomor_pesanan}</span>
        </div>

        <div className="flex justify-between text-xs sm:text-sm py-0.5">
          <span className="font-black text-black uppercase">STATUS BAYAR:</span>
          <span className={`font-black uppercase ${isPaid ? 'text-black' : 'text-black underline'}`}>
            {isPaid ? '✅ LUNAS' : '⚠️ BELUM LUNAS'}
          </span>
        </div>

        <div className="flex justify-between text-xs text-black">
          <span>WAKTU PESAN:</span>
          <span className="font-semibold">{formatDateNoSeconds(order.created_at || Date.now())}</span>
        </div>
      </div>

      {/* DAFTAR MENU (TULISAN BESAR & ALL-CAPSLOCK UNTUK DAPUR) */}
      <div className="mb-2 pb-2 border-b-2 border-dashed border-gray-600 space-y-2">
        <div className="text-xs sm:text-sm font-black uppercase tracking-wider border-b-2 border-black pb-1">
          DAFTAR MENU (MASAK)
        </div>

        {(() => {
          let kitchenItems = order.items || [];
          if (order.is_additional) {
            if (order.addon_items && order.addon_items.length > 0) {
              kitchenItems = order.addon_items;
            } else {
              // Jika addon_items tidak diberikan, ambil item dengan batch tertinggi
              const maxBatch = Math.max(...kitchenItems.map(i => Number(i.batch_no) || 1));
              if (maxBatch > 1) {
                kitchenItems = kitchenItems.filter(i => (Number(i.batch_no) || 1) === maxBatch);
              }
            }
          }

          return (
            <div className="space-y-2.5 pt-1">
              {kitchenItems.map((item, idx) => (
                <div key={idx} className="pb-2 border-b border-gray-300 last:border-b-0 space-y-1">
                  <div className="flex items-start gap-2">
                    <span className="text-2xl sm:text-3xl font-black text-black shrink-0 leading-none">
                      {item.jumlah}X
                    </span>
                    <span className="text-lg sm:text-xl font-black uppercase text-black leading-tight flex-1 break-words">
                      {item.food?.nama || 'MENU'}
                    </span>
                  </div>
                  {item.catatan && (
                    <div className="text-xs sm:text-sm font-black uppercase text-black bg-gray-100 p-1.5 border border-black rounded">
                      * CATATAN: {item.catatan.toUpperCase()}
                    </div>
                  )}
                </div>
              ))}
            </div>
          );
        })()}
      </div>

      {/* CATATAN PESANAN UMUM */}
      {order.catatan && (
        <div className="mb-2 p-1.5 bg-gray-100 rounded text-xs sm:text-sm border-2 border-dashed border-black">
          <span className="font-black block uppercase text-xs">CATATAN PESANAN MEJA:</span>
          <span className="font-bold uppercase text-black">
            {order.catatan}
          </span>
        </div>
      )}

      {order.payment_status === 'UNPAID' && (
        <div className="my-1.5 p-1.5 bg-gray-100 border-2 border-dashed border-black rounded text-center text-xs sm:text-sm font-black uppercase">
          ⚠️ BELUM DIBAYAR - HARAP TAGIH KE MEJA
        </div>
      )}

      {/* FOOTER TICKET DAPUR */}
      <div className="text-center text-xs text-black pt-1.5 border-t-2 border-dashed border-gray-600">
        <p className="font-black uppercase text-sm">*** SEGERA ANTAR SAAT MATANG ***</p>
      </div>
    </div>
  );
}

/**
 * Thermal Receipt Component for 58mm / 80mm printers
 * Supports 'customer', 'kitchen', or 'both' (prints 2 separate auto-cut sheets)
 */
export default function Receipt({ order, type = 'customer', paperSize = '80mm' }) {
  if (!order) return null;

  const showCustomer = type === 'customer' || type === 'both';
  const showKitchen = type === 'kitchen' || type === 'both';

  return (
    <div className="pos-receipt-container text-black font-mono bg-white p-2 border shadow-sm mx-auto my-1 leading-tight max-w-full">
      <style>
        {`
          @media print {
            @page {
              size: 80mm auto;
              margin: 0mm !important;
            }
            @page :left {
              margin: 0mm !important;
            }
            @page :right {
              margin: 0mm !important;
            }
            @page :first {
              margin: 0mm !important;
            }
            html, body {
              width: 100% !important;
              min-width: 100% !important;
              max-width: 100% !important;
              height: auto !important;
              overflow: visible !important;
              margin: 0 !important;
              padding: 0 !important;
              background: #ffffff !important;
              -webkit-print-color-adjust: exact !important;
              print-color-adjust: exact !important;
            }
            body * {
              visibility: hidden !important;
            }

            /* Netralkan semua modal dialog pembungkus agar tidak membatasi lebar kertas 80mm */
            .fixed, [class*="fixed"] {
              position: static !important;
              padding: 0 !important;
              margin: 0 !important;
              background: transparent !important;
              width: 100% !important;
              max-width: 100% !important;
              min-width: 100% !important;
            }
            .max-w-md, [class*="max-w-"] {
              max-width: 100% !important;
              width: 100% !important;
              margin: 0 !important;
              padding: 0 !important;
              border: none !important;
              box-shadow: none !important;
            }
            .overflow-hidden, .overflow-y-auto {
              overflow: visible !important;
            }

            .pos-receipt-container {
              position: static !important;
              width: 100% !important;
              min-width: 100% !important;
              max-width: 100% !important;
              margin: 0 !important;
              padding: 0 !important;
              border: none !important;
              box-shadow: none !important;
            }

            .pos-receipt-printable-wrap,
            .pos-receipt-printable-wrap * {
              visibility: visible !important;
            }
            .pos-receipt-printable-wrap {
              position: static !important;
              left: 0 !important;
              top: 0 !important;
              width: 100% !important;
              min-width: 100% !important;
              max-width: 100% !important;
              margin: 0 !important;
              padding: 0 !important;
              display: block !important;
            }
            .pos-receipt-printable {
              width: 100% !important;
              min-width: 100% !important;
              max-width: 100% !important;
              margin: 0 !important;
              padding: 0 0mm 12mm 0mm !important;
              box-sizing: border-box !important;
              page-break-inside: avoid !important;
              break-inside: avoid !important;
              color: #000000 !important;
            }
            .receipt-first-page {
              page-break-after: always !important;
              break-after: page !important;
              margin-bottom: 8mm !important;
              padding-bottom: 8mm !important;
            }
            .receipt-second-page {
              page-break-before: always !important;
              break-before: page !important;
              margin-top: 4mm !important;
            }
            .receipt-separator-preview {
              display: none !important;
              visibility: hidden !important;
              height: 0 !important;
              overflow: hidden !important;
            }
          }
        `}
      </style>

      <div className="pos-receipt-printable-wrap w-full">
        {showCustomer && (
          <div className={type === 'both' ? 'receipt-first-page' : ''}>
            <SingleReceiptContent
              order={order}
              isKitchen={false}
              paperSize={paperSize}
            />
          </div>
        )}

        {type === 'both' && (
          <div className="receipt-separator-preview my-4 py-2 border-t-2 border-dashed border-gray-400 text-center text-xs text-gray-500 font-bold">
            ✂️ --- LEMBAR 2 (TICKET DAPUR - POTONG OTOMATIS) --- ✂️
          </div>
        )}

        {showKitchen && (
          <div className={type === 'both' ? 'receipt-second-page' : ''}>
            <SingleReceiptContent
              order={order}
              isKitchen={true}
              paperSize={paperSize}
            />
          </div>
        )}
      </div>
    </div>
  );
}
