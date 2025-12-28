<?php
use Illuminate\Support\Facades\Http;

require __DIR__.'/vendor/autoload.php';
$app = require_once __DIR__.'/bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

$apiKey = config('rajaongkir.api_key');
$baseUrl = rtrim(config('rajaongkir.base_url'), '/');

echo "Searching for Mandau, Bengkalis, Riau...\n";

// Helper to find ID
function findId($items, $name, $keyName = 'name', $keyId = 'id') {
    foreach ($items as $item) {
        $n = $item[$keyName] ?? $item['name'] ?? $item['province'] ?? $item['city_name'] ?? $item['subdistrict_name'] ?? '';
        if (stripos($n, $name) !== false) {
             // Avoid "Kepulauan Riau" when looking for "Riau"
             if ($name === 'Riau' && stripos($n, 'Kepulauan') !== false) continue;
             
             $id = $item[$keyId] ?? $item['id'] ?? $item['province_id'] ?? $item['city_id'] ?? $item['subdistrict_id'] ?? null;
             return ['id' => $id, 'name' => $n];
        }
    }
    return null;
}

// 1. Province
$url = $baseUrl . '/destination/province';
$response = Http::withHeaders(['key' => $apiKey])->get($url);
$data = $response->json()['data'] ?? [];
$riau = findId($data, 'Riau');

if (!$riau) die("Province Riau not found.\n");
echo "Province: {$riau['name']} (ID: {$riau['id']})\n";

// 2. City
$url = $baseUrl . '/destination/city/' . $riau['id'];
$response = Http::withHeaders(['key' => $apiKey])->get($url);
$data = $response->json()['data'] ?? [];
$bengkalis = findId($data, 'Bengkalis');

if (!$bengkalis) die("City Bengkalis not found.\n");
echo "City: {$bengkalis['name']} (ID: {$bengkalis['id']})\n";

// 3. District
$url = $baseUrl . '/destination/district/' . $bengkalis['id'];
$response = Http::withHeaders(['key' => $apiKey])->get($url);
$data = $response->json()['data'] ?? [];
$mandau = findId($data, 'Mandau');

if (!$mandau) die("District Mandau not found.\n");
echo "District: {$mandau['name']} (ID: {$mandau['id']})\n";

echo "FINAL ORIGIN ID SHOULD BE: " . $mandau['id'] . "\n";
