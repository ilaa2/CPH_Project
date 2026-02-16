<?php
/**
 * WAF Test Script
 * Upload this to public/ folder on hosting and access it via browser.
 * It tests if ModSecurity/WAF is properly disabled.
 */

echo "<h1>WAF Configuration Test</h1>";
echo "<hr>";

// Test 1: Check if ModSecurity headers are present
echo "<h2>1. Server Info</h2>";
echo "<p>Server Software: " . ($_SERVER['SERVER_SOFTWARE'] ?? 'Unknown') . "</p>";
echo "<p>PHP Version: " . phpversion() . "</p>";

// Test 2: Check .htaccess directives
echo "<h2>2. .htaccess Status</h2>";
$htaccessPath = __DIR__ . '/.htaccess';
if (file_exists($htaccessPath)) {
    $content = file_get_contents($htaccessPath);
    $hasModSec = strpos($content, 'SecRuleEngine') !== false;
    $hasSecFilter = strpos($content, 'SecFilterEngine') !== false;
    echo "<p style='color:green'>✅ .htaccess exists (" . strlen($content) . " bytes)</p>";
    echo "<p>" . ($hasModSec ? "✅ ModSecurity directives found" : "❌ No ModSecurity directives") . "</p>";
    echo "<p>" . ($hasSecFilter ? "✅ SecFilter directives found" : "❌ No SecFilter directives") . "</p>";
} else {
    echo "<p style='color:red'>❌ .htaccess NOT FOUND!</p>";
}

// Test 3: Simple POST test form
echo "<h2>3. POST Request Test</h2>";
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    echo "<p style='color:green; font-size:24px'>✅ POST REQUEST SUKSES!</p>";
    echo "<p>Data received: " . htmlspecialchars(json_encode($_POST)) . "</p>";
    echo "<p>Jika Anda melihat ini, WAF TIDAK memblokir POST request ke script ini.</p>";
} else {
    echo "<form method='POST' action=''>";
    echo "<input type='hidden' name='test' value='hello'>";
    echo "<button type='submit' style='padding:10px 20px; background:green; color:white; border:none; border-radius:5px; cursor:pointer; font-size:16px'>Test POST Request</button>";
    echo "</form>";
}

// Test 4: Check if specific routes would work  
echo "<h2>4. Route Accessibility Test</h2>";
echo "<p>Coba akses URL berikut di tab baru (harus login dulu sebagai customer):</p>";
echo "<ul>";
echo "<li><a href='/customer/pesanan' target='_blank'>/customer/pesanan</a> - Riwayat Pesanan</li>";
echo "<li><a href='/customer/checkout/shipping' target='_blank'>/customer/checkout/shipping</a> - Checkout Shipping</li>";
echo "<li><a href='/customer/payment/finish' target='_blank'>/customer/payment/finish</a> - Payment Finish</li>";
echo "</ul>";

echo "<hr>";
echo "<h2>Kesimpulan</h2>";
echo "<p>Jika POST test di atas <strong>GAGAL (403)</strong>, maka WAF masih aktif.</p>";
echo "<p>Dalam hal ini, Anda perlu <strong>menonaktifkan ModSecurity dari cPanel</strong>:</p>";
echo "<ol>";
echo "<li>Login ke cPanel → Cari <strong>'ModSecurity'</strong></li>";
echo "<li>Klik pada domain <strong>centralpalantea.my.id</strong></li>";
echo "<li>Ubah status dari <strong>ON</strong> menjadi <strong>OFF</strong></li>";
echo "<li>Simpan perubahan</li>";
echo "</ol>";
echo "<p><em>Atau hubungi support hosting untuk meminta mereka menonaktifkan ModSecurity untuk domain Anda.</em></p>";

// Self-cleanup link
echo "<hr>";
echo "<p><small><a href='?cleanup=1'>Hapus script test ini</a></small></p>";
if (isset($_GET['cleanup'])) {
    unlink(__FILE__);
    echo "<p style='color:green'>✅ Script test dihapus!</p>";
}
?>
