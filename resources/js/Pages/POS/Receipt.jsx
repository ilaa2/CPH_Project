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
 */
function SingleReceiptContent({ order, isKitchen, paperWidthClass }) {
  const rawPaymentMethod = order.payment?.metode_pembayaran || order.metode_pembayaran || 'Cash';
  const isCash = rawPaymentMethod.toLowerCase() === 'cash';
  const isPaid = (order.payment_status || '').toUpperCase() === 'PAID' || Boolean(order.payment);

  return (
    <div className={`pos-receipt-printable ${paperWidthClass} mx-auto font-mono text-[11px] px-2`}>
      {/* HEADER */}
      <div className="text-center mb-2 pb-1.5 border-b border-dashed border-gray-400 space-y-0.5">
        {!isKitchen && (
          <img
            src="/storage/logo/logoo.png"
            alt="Logo Palantea"
            className="w-20 h-auto mx-auto mb-1.5 object-contain"
          />
        )}
        <h2 className="font-extrabold text-sm uppercase tracking-wider text-gray-900">
          {isKitchen ? '--- KITCHEN TICKET ---' : 'CENTRAL PALANTEA HIDROPONIK'}
        </h2>
        {!isKitchen && (
          <>
            <p className="text-[10px] font-bold text-gray-800">Agrowisata Center — Cafe • Space • Hydroponic</p>
            <p className="text-[9px] text-gray-600 leading-tight">Jl. Melayu, Babussalam, Mandau, Bengkalis Regency, Riau 28784</p>
          </>
        )}
      </div>

      {/* ORDER META INFO */}
      <div className="space-y-0.5 mb-2 pb-1 border-b border-dashed border-gray-400">
        <div className="flex justify-between items-center font-extrabold text-xs mb-1 py-1 px-1 bg-gray-50 border-y border-gray-300">
          <span className="text-gray-900">NO. MEJA:</span>
          <span className="text-sm font-black text-gray-900 pr-1">
            NO. {order.table?.nomor_meja || order.table_id || order.nomor_meja || '--'}
          </span>
        </div>
        <div className="flex justify-between text-[10px] font-bold text-gray-900">
          <span>Pelanggan:</span>
          <span className="uppercase">{order.nama_pelanggan || 'Pelanggan'}</span>
        </div>
        <div className="flex justify-between text-[10px]">
          <span>No:</span>
          <span>{order.nomor_pesanan}</span>
        </div>
        {isKitchen ? (
          <div className="flex justify-between text-[10px]">
            <span>Status Bayar:</span>
            <span className={`font-extrabold uppercase ${isPaid ? 'text-green-700' : 'text-red-600'}`}>
              {isPaid ? 'LUNAS' : 'BELUM LUNAS'}
            </span>
          </div>
        ) : (
          <div className="flex justify-between text-[10px]">
            <span>Bayar Via:</span>
            <span className="font-bold uppercase text-green-700">{rawPaymentMethod.toUpperCase()}</span>
          </div>
        )}
        <div className="flex justify-between text-[10px]">
          <span>Waktu:</span>
          <span>{formatDateNoSeconds(order.created_at || Date.now())}</span>
        </div>
        <div className="flex justify-between text-[10px]">
          <span>Kasir:</span>
          <span>{order.cashier?.name || 'Kasir'}</span>
        </div>
      </div>

      {/* ITEMS LIST */}
      <div className="mb-2 pb-1.5 border-b border-dashed border-gray-400 space-y-1.5">
        {order.items?.map((item, idx) => (
          <div key={idx} className="space-y-0.5 text-[11px]">
            <div className="flex justify-between items-start gap-1">
              <span className="font-semibold text-gray-900 leading-tight break-words flex-1">
                {item.jumlah}x {item.food?.nama || 'Menu'}
              </span>
              {!isKitchen && (
                <span className="font-bold text-gray-900 whitespace-nowrap shrink-0 text-right">
                  Rp {Number(item.subtotal).toLocaleString('id-ID')}
                </span>
              )}
            </div>
            {!isKitchen && item.jumlah > 1 && (
              <div className="text-[9px] text-gray-500 pl-3">
                @ Rp {Number(item.harga_satuan).toLocaleString('id-ID')}
              </div>
            )}
            {item.catatan && (
              <div className="text-[9px] font-bold italic text-red-600 pl-3">
                * Note: {item.catatan}
              </div>
            )}
          </div>
        ))}
      </div>

      {/* ORDER NOTES */}
      {order.catatan && (
        <div className="mb-2 p-1 bg-gray-100 rounded text-[9px] border border-dashed border-gray-300">
          <span className="font-bold block">Catatan Pesanan:</span>
          <span className="italic">{order.catatan}</span>
        </div>
      )}

      {/* TOTALS & PAYMENT INFO (For Customer Receipt only) */}
      {!isKitchen && (
        <div className="space-y-1 mb-3 pt-1 text-xs">
          <div className="flex justify-between">
            <span>Subtotal:</span>
            <span>Rp {Number(order.subtotal || 0).toLocaleString('id-ID')}</span>
          </div>
          {order.diskon > 0 && (
            <div className="flex justify-between text-red-600">
              <span>Diskon:</span>
              <span>- Rp {Number(order.diskon).toLocaleString('id-ID')}</span>
            </div>
          )}
          <div className="flex justify-between font-bold text-sm pt-1 border-t border-gray-300">
            <span>TOTAL:</span>
            <span>Rp {Number(order.total || 0).toLocaleString('id-ID')}</span>
          </div>

          {(order.payment || order.payment_status === 'PAID') ? (
            <div className="pt-1 mt-1 border-t border-dashed border-gray-300 text-[10px] space-y-0.5">
              <div className="flex justify-between">
                <span>Metode:</span>
                <span className="font-semibold uppercase">{rawPaymentMethod.toUpperCase()}</span>
              </div>
              {isCash ? (
                <>
                  <div className="flex justify-between">
                    <span>Bayar:</span>
                    <span>Rp {Number(order.payment?.jumlah_bayar ?? order.total ?? 0).toLocaleString('id-ID')}</span>
                  </div>
                  <div className="flex justify-between font-semibold">
                    <span>Kembalian:</span>
                    <span>Rp {Number(order.payment?.kembalian ?? 0).toLocaleString('id-ID')}</span>
                  </div>
                </>
              ) : (
                <div className="flex justify-between">
                  <span>Bayar:</span>
                  <span>Rp {Number(order.total || 0).toLocaleString('id-ID')} (PAS)</span>
                </div>
              )}
            </div>
          ) : order.payment_status === 'UNPAID' && (
            <div className="my-2 p-2 bg-amber-50 border-2 border-dashed border-amber-400 rounded text-center text-[10px] text-amber-900 font-bold space-y-0.5">
              <p className="text-xs font-black text-amber-900">⚠️ BELUM DIBAYAR</p>
              <p className="text-[9px] font-extrabold text-red-700 uppercase">* Pembayaran ditagih saat pengantaran *</p>
            </div>
          )}
        </div>
      )}

      {isKitchen && order.payment_status === 'UNPAID' && (
        <div className="my-1.5 p-1 bg-amber-100 border border-amber-400 rounded text-center text-[9px] font-extrabold text-amber-900 uppercase">
          ⚠️ BELUM DIBAYAR - TAGIH SAAT PENGANTARAN
        </div>
      )}

      {/* FOOTER */}
      <div className="text-center text-[9px] text-gray-600 pt-1.5 border-t border-dashed border-gray-400 space-y-0.5">
        {isKitchen ? (
          <p className="font-bold text-gray-900">SEGERA PROSES PESANAN</p>
        ) : (
          <>
            <p className="font-bold text-gray-900 text-[10px]">Terima Kasih Atas Kunjungan Anda!</p>
            <p className="font-semibold text-gray-700">Mohon Ditunggu, Hidangan Segera Kami Antarkan</p>
          </>
        )}
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

  const paperWidthClass = paperSize === '80mm' ? 'w-[62mm]' : 'w-[46mm]';
  const showCustomer = type === 'customer' || type === 'both';
  const showKitchen = type === 'kitchen' || type === 'both';

  return (
    <div className="pos-receipt-container text-black font-mono bg-white p-2 border shadow-sm mx-auto my-2 text-xs leading-tight">
      <style>
        {`
          @media print {
            html, body {
              width: 100% !important;
              height: auto !important;
              overflow: visible !important;
              margin: 0 !important;
              padding: 0 !important;
              background: #ffffff !important;
            }
            body * {
              visibility: hidden !important;
            }
            .pos-receipt-printable-wrap,
            .pos-receipt-printable-wrap * {
              visibility: visible !important;
            }
            .pos-receipt-printable-wrap {
              position: absolute !important;
              left: 0 !important;
              top: 0 !important;
              width: 100% !important;
              margin: 0 !important;
              padding: 0 !important;
            }
            .pos-receipt-printable {
              width: ${paperSize === '80mm' ? '62mm' : '46mm'} !important;
              margin: 0 auto !important;
              padding: 0 2px 14px 2px !important;
              box-sizing: border-box !important;
              page-break-inside: avoid !important;
              break-inside: avoid !important;
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
            @page {
              size: portrait;
              margin: 0mm;
            }
          }
        `}
      </style>

      <div className="pos-receipt-printable-wrap">
        {showCustomer && (
          <div className={type === 'both' ? 'receipt-first-page' : ''}>
            <SingleReceiptContent order={order} isKitchen={false} paperWidthClass={paperWidthClass} />
          </div>
        )}

        {type === 'both' && (
          <div className="receipt-separator-preview my-4 py-2 border-t-2 border-dashed border-gray-400 text-center text-[10px] text-gray-500 font-bold">
            ✂️ --- LEMBAR 2 (TICKET DAPUR - POTONG OTOMATIS) --- ✂️
          </div>
        )}

        {showKitchen && (
          <div className={type === 'both' ? 'receipt-second-page' : ''}>
            <SingleReceiptContent order={order} isKitchen={true} paperWidthClass={paperWidthClass} />
          </div>
        )}
      </div>
    </div>
  );
}
