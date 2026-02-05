<!DOCTYPE html>
<html>
<head>
    <meta http-equiv="Content-Type" content="text/html; charset=utf-8"/>
    <title>Invoice #INV-{{ str_pad($pesanan->id, 5, '0', STR_PAD_LEFT) }}</title>
    <style>
        body {
            font-family: 'Helvetica', sans-serif;
            color: #333;
            line-height: 1.4;
            margin: 0;
            padding: 0;
        }
        .header {
            margin-bottom: 30px;
        }
        .header-left {
            float: left;
        }
        .header-right {
            float: right;
            text-align: right;
        }
        .title {
            font-size: 24px;
            font-weight: bold;
            color: #333;
            margin-bottom: 5px;
        }
        .invoice-number {
            font-size: 14px;
            color: #666;
        }
        .company-name {
            font-size: 16px;
            font-weight: bold;
            color: #15803d; /* green-700 */
            text-transform: uppercase;
        }
        .company-address {
            font-size: 12px;
            color: #666;
            margin-top: 5px;
            max-width: 250px;
        }
        .clear {
            clear: both;
        }
        .info-section {
            display: table;
            width: 100%;
            margin-bottom: 30px;
            border-top: 1px solid #eee;
            border-bottom: 1px solid #eee;
            padding: 20px 0;
        }
        .info-col {
            display: table-cell;
            width: 50%;
            vertical-align: top;
        }
        .info-label {
            font-size: 10px;
            font-weight: bold;
            color: #888;
            text-transform: uppercase;
            margin-bottom: 5px;
        }
        .info-value {
            font-size: 14px;
            font-weight: bold;
            color: #000;
        }
        .info-sub {
            font-size: 12px;
            color: #555;
            margin-top: 3px;
        }
        .status-badge {
            display: inline-block;
            padding: 4px 10px;
            border-radius: 9999px;
            font-size: 10px;
            font-weight: bold;
            text-transform: uppercase;
        }
        .status-paid { background-color: #dcfce7; color: #15803d; }
        .status-shipped { background-color: #dcfce7; color: #15803d; }
        .status-completed { background-color: #dcfce7; color: #15803d; }
        .status-pending { background-color: #fef9c3; color: #a16207; }
        .status-cancelled { background-color: #fee2e2; color: #991b1b; }
        
        table {
            width: 100%;
            border-collapse: collapse;
            margin-bottom: 30px;
        }
        th {
            background-color: #f9fafb;
            padding: 12px 8px;
            text-align: left;
            font-size: 12px;
            font-weight: bold;
            color: #666;
            border-bottom: 1px solid #e5e7eb;
            text-transform: uppercase;
        }
        td {
            padding: 12px 8px;
            font-size: 13px;
            border-bottom: 1px solid #f3f4f6;
        }
        .text-center { text-align: center; }
        .text-right { text-align: right; }
        
        .totals {
            float: right;
            width: 250px;
        }
        .total-row {
            margin-bottom: 10px;
        }
        .total-label {
            float: left;
            font-size: 13px;
            color: #666;
            font-weight: bold;
        }
        .total-value {
            float: right;
            font-size: 13px;
            color: #333;
        }
        .grand-total {
            border-top: 1px solid #ddd;
            padding-top: 10px;
            margin-top: 10px;
        }
        .grand-total .total-label {
            font-size: 16px;
            color: #000;
        }
        .grand-total .total-value {
            font-size: 16px;
            color: #15803d;
            font-weight: bold;
        }
        
        .footer {
            margin-top: 50px;
            border-top: 1px solid #eee;
            padding-top: 20px;
            text-align: center;
        }
        .footer-text {
            font-size: 12px;
            color: #666;
            font-weight: bold;
        }
        .footer-sub {
            font-size: 10px;
            color: #999;
            font-style: italic;
            margin-top: 5px;
        }
        
        /* Utility for PDF page break if needed */
        .page-break {
            page-break-after: always;
        }
    </style>
</head>
<body>

    <div class="header">
        <div class="header-left">
            <div class="title">INVOICE</div>
            <div class="invoice-number">#INV-{{ str_pad($pesanan->id, 5, '0', STR_PAD_LEFT) }}</div>
        </div>
        <div class="header-right">
            <div class="company-name">CENTRAL PALANTEA HIDROPONIK</div>
            <div class="company-address">
                Jl. Melayu, Babussalam, Mandau,<br>Bengkalis Regency, Riau 28784
            </div>
        </div>
        <div class="clear"></div>
    </div>

    <div class="info-section">
        <div class="info-col">
            <div class="info-label">DITAGIHKAN KEPADA</div>
            <div class="info-value">{{ $pesanan->user->name ?? $pesanan->nama_penerima ?? 'Pelanggan' }}</div>
            <div class="info-sub">{{ $pesanan->alamat_pengiriman ?? $pesanan->user->alamat ?? '-' }}</div>
            <div class="info-sub">{{ $pesanan->nomor_telepon ?? $pesanan->user->phone ?? '-' }}</div>
        </div>
        <div class="info-col text-right">
            <div style="margin-bottom: 20px;">
                <div class="info-label">NOMOR PESANAN</div>
                <div class="info-value">{{ $pesanan->nomor_pesanan ?? '-' }}</div>
            </div>
            
            <div style="margin-bottom: 20px;">
                <div class="info-label">TANGGAL PESANAN</div>
                <div class="info-value">
                    {{ \Carbon\Carbon::parse($pesanan->tanggal)->locale('id')->isoFormat('D MMMM Y') }}
                </div>
            </div>

            <div style="margin-bottom: 20px;">
                <div class="info-label">METODE PENGIRIMAN</div>
                <div class="info-value">{{ $pesanan->metode_pengiriman ?? '-' }}</div>
            </div>
            <div>
                <div class="info-label">STATUS</div>
                @php
                    $status = strtolower($pesanan->status);
                    $paymentStatus = strtolower($pesanan->payment_status);
                    
                    $badgeClass = 'status-pending';
                    $badgeLabel = $pesanan->status;
                    
                    if ($status == 'completed' || $status == 'selesai') {
                        $badgeClass = 'status-completed';
                        $badgeLabel = 'SELESAI';
                    } elseif ($status == 'shipped' || $status == 'dikirim') {
                        $badgeClass = 'status-shipped';
                        $badgeLabel = 'DIKIRIM';
                    } elseif ($paymentStatus == 'paid') {
                         $badgeClass = 'status-paid';
                         $badgeLabel = 'DIBAYAR';
                    } elseif ($paymentStatus == 'failed' || $status == 'dibatalkan') {
                        $badgeClass = 'status-cancelled';
                        $badgeLabel = 'DIBATALKAN';
                    }
                @endphp
                <span class="status-badge {{ $badgeClass }}">
                    {{ $badgeLabel }}
                </span>
            </div>
        </div>
    </div>

    <table>
        <thead>
            <tr>
                <th width="40%">PRODUK</th>
                <th width="15%" class="text-center">JUMLAH</th>
                <th width="20%" class="text-right">HARGA SATUAN</th>
                <th width="25%" class="text-right">SUBTOTAL</th>
            </tr>
        </thead>
        <tbody>
            @foreach($pesanan->items as $item)
            <tr>
                <td>{{ $item->produk->nama }}</td>
                <td class="text-center">{{ $item->jumlah }}</td>
                <td class="text-right">Rp {{ number_format($item->subtotal / $item->jumlah, 0, ',', '.') }}</td>
                <td class="text-right">Rp {{ number_format($item->subtotal, 0, ',', '.') }}</td>
            </tr>
            @endforeach
        </tbody>
    </table>

    <div class="clear"></div>

    <table class="totals-table" style="width: 250px; float: right; margin-top: 20px;">
        <tr>
            <td style="text-align: left; padding: 5px 0; border: none; font-weight: bold; color: #666;">Subtotal</td>
            <td style="text-align: right; padding: 5px 0; border: none; color: #333;">
                @php $subtotal = $pesanan->items->sum('subtotal'); @endphp
                Rp {{ number_format($subtotal, 0, ',', '.') }}
            </td>
        </tr>
        <tr>
            <td style="text-align: left; padding: 5px 0; border: none; font-weight: bold; color: #666;">Ongkos Kirim</td>
            <td style="text-align: right; padding: 5px 0; border: none; color: #333;">
                Rp {{ number_format($pesanan->total - $subtotal, 0, ',', '.') }}
            </td>
        </tr>
        <tr>
            <td style="text-align: left; padding: 10px 0; border-top: 1px solid #ddd; font-size: 16px; font-weight: bold; color: #000;">Total Tagihan</td>
            <td style="text-align: right; padding: 10px 0; border-top: 1px solid #ddd; font-size: 16px; font-weight: bold; color: #15803d;">
                Rp {{ number_format($pesanan->total, 0, ',', '.') }}
            </td>
        </tr>
    </table>
    <div class="clear"></div>

    <div class="footer">
        <div class="footer-text">Terima kasih telah berbelanja di Central Palantea Hidroponik.</div>
        <div class="footer-sub">Invoice ini dihasilkan secara otomatis oleh sistem.</div>
    </div>

</body>
</html>
