<!DOCTYPE html>
<html>
<head>
    <title>{{ $title }}</title>
    <style>
        body { font-family: 'Helvetica', sans-serif; color: #333; margin: 0; padding: 0; }
        .header { text-align: center; border-bottom: 2px solid #22c55e; padding-bottom: 10px; margin-bottom: 20px; }
        .header h1 { margin: 0; color: #166534; font-size: 24px; }
        .header p { margin: 5px 0 0; color: #666; font-size: 14px; }
        .info { margin-bottom: 20px; font-size: 12px; }
        table { border-collapse: collapse; width: 100%; table-layout: fixed; word-wrap: break-word; }
        th { background-color: #f0fdf4; color: #166534; border: 1px solid #dcfce7; padding: 10px; text-align: left; font-size: 11px; text-transform: uppercase; }
        td { border: 1px solid #f0f0f0; padding: 8px; text-align: left; font-size: 10px; vertical-align: top; }
        tr:nth-child(even) { background-color: #fafafa; }
        .footer { margin-top: 30px; text-align: right; font-size: 10px; color: #999; border-top: 1px solid #eee; padding-top: 10px; }
    </style>
</head>
<body>
    <div class="header">
        <h1>CENTRAL PALANTEA HIDROPONIK</h1>
        <p>Jl. Melayu, Babussalam, Mandau, Bengkalis Regency, Riau 28784</p>
        <h2 style="margin-top: 15px; color: #333;">{{ $title }}</h2>
    </div>
    
    <div class="info">
        <p><strong>{{ $period }}</strong></p>
        <p>Tanggal Cetak: {{ date('d/m/Y H:i') }}</p>
    </div>

    <table>
        <thead>
            <tr>
                @foreach($headers as $header)
                    <th>{{ $header }}</th>
                @endforeach
            </tr>
        </thead>
        <tbody>
            @foreach($data as $row)
                <tr>
                    @foreach($row as $header => $value)
                        @php
                            $displayValue = $value;
                            if (strpos($header, 'Telepon') !== false) {
                                $displayValue = trim($value, "'");
                            } elseif (is_numeric($value) && strpos($header, 'ID') === false && $value > 1000) {
                                $displayValue = number_format($value, 0, ',', '.');
                            }
                        @endphp
                        <td>{{ $displayValue }}</td>
                    @endforeach
                </tr>
            @endforeach
        </tbody>
    </table>

    <div class="footer">
        <p>Laporan ini dihasilkan secara otomatis oleh sistem Manajemen CPH.</p>
    </div>
</body>
</html>
