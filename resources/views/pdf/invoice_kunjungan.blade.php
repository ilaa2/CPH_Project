<!DOCTYPE html>
<html>
<head>
    <meta http-equiv="Content-Type" content="text/html; charset=utf-8"/>
    <title>Invoice #INV-K{{ str_pad($kunjungan->id, 5, '0', STR_PAD_LEFT) }}</title>
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
        
        .totals-table {
            float: right;
            width: 300px;
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
        .note-box {
            margin-top: 20px;
            padding: 15px;
            background-color: #f0fdf4;
            border: 1px solid #bbf7d0;
            border-radius: 8px;
            color: #166534;
            font-size: 12px;
        }
    </style>
</head>
<body>

    <div class="header">
        <div class="header-left">
            <div class="title">INVOICE KUNJUNGAN</div>
            <div class="invoice-number">#INV-K{{ str_pad($kunjungan->id, 5, '0', STR_PAD_LEFT) }}</div>
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
            <div class="info-value">{{ $kunjungan->user->name ?? 'Pelanggan' }}</div>
            <div class="info-sub">{{ $kunjungan->user->email ?? '-' }}</div>
            <div class="info-sub">{{ $kunjungan->user->phone ?? '-' }}</div>
        </div>
        <div class="info-col text-right">
            <div style="margin-bottom: 20px;">
                <div class="info-label">MIDTRANS ID</div>
                <div class="info-value">{{ $kunjungan->midtrans_order_id ?? '-' }}</div>
            </div>

            <div style="margin-bottom: 20px;">
                <div class="info-label">TANGGAL KUNJUNGAN</div>
                <div class="info-value">
                    {{ \Carbon\Carbon::parse($kunjungan->tanggal)->locale('id')->isoFormat('D MMMM Y') }}
                </div>
                <div class="info-sub">{{ substr($kunjungan->jam, 0, 5) }} WIB</div>
            </div>
            
            <div>
                <div class="info-label">STATUS PEMBAYARAN</div>
                <span class="status-badge status-paid">LUNAS</span>
            </div>
        </div>
    </div>

    <table>
        <thead>
            <tr>
                <th width="50%">DESKRIPSI</th>
                <th width="15%" class="text-center">JUMLAH ORANG</th>
                <th width="35%" class="text-right">TOTAL</th>
            </tr>
        </thead>
        <tbody>
            <tr>
                <td>
                    <strong>Kunjungan {{ $kunjungan->tipe->nama_tipe }}</strong>
                    <br>
                    <span style="font-size: 11px; color: #666;">
                        Paket Kunjungan Wisata/Edukasi
                        @if($kunjungan->tipe->nama_tipe == 'Outing Class')
                            <br><span style="color: #15803d; font-weight: bold;">* Termasuk Paket Edukasi & Buket Sayur per Anak</span>
                        @endif
                    </span>
                </td>
                <td class="text-center">
                    {{ $kunjungan->jumlah_dewasa + $kunjungan->jumlah_anak + ($kunjungan->jumlah_balita ?? 0) }} Orang
                    <div style="font-size: 10px; color: #888; margin-top: 2px;">
                        (Dewasa: {{ $kunjungan->jumlah_dewasa }}, Anak: {{ $kunjungan->jumlah_anak }}, Balita: {{ $kunjungan->jumlah_balita ?? 0 }})
                    </div>
                </td>
                <td class="text-right">Rp {{ number_format($kunjungan->total_biaya, 0, ',', '.') }}</td>
            </tr>
        </tbody>
    </table>

    <div class="clear"></div>

    <table class="totals-table">
        <tr>
            <td style="text-align: left; padding: 10px 0; border-top: 1px solid #ddd; font-size: 16px; font-weight: bold; color: #000;">Total Bayar</td>
            <td style="text-align: right; padding: 10px 0; border-top: 1px solid #ddd; font-size: 16px; font-weight: bold; color: #15803d;">
                Rp {{ number_format($kunjungan->total_biaya, 0, ',', '.') }}
            </td>
        </tr>
    </table>
    <div class="clear"></div>

    @if($kunjungan->tipe->nama_tipe == 'Outing Class')
    <div class="note-box">
        <strong>CATATAN KHUSUS:</strong>
        <p style="margin: 5px 0 0 0;">
            Kunjungan ini termasuk fasilitas <strong>1 Buket Sayur</strong> untuk setiap peserta anak-anak yang terdaftar. Silakan tunjukkan invoice ini kepada petugas saat kedatangan untuk pengambilan paket.
        </p>
    </div>
    @endif

    <div class="footer">
        <div class="footer-text">Terima kasih telah berkunjung ke Central Palantea Hidroponik.</div>
        <div class="footer-sub">Invoice ini dihasilkan secara otomatis oleh sistem.</div>
    </div>

</body>
</html>
