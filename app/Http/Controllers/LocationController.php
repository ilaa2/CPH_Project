<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class LocationController extends Controller
{
    protected $apiKey;
    protected $baseUrl;

    public function __construct()
    {
        $this->apiKey = config('rajaongkir.api_key');
        $this->baseUrl = rtrim(config('rajaongkir.base_url'), '/');
    }

    private function fetchFromKomerce($endpoint, $logMessage)
    {
        try {
            $url = $this->baseUrl . $endpoint;
            Log::info("$logMessage URL: " . $url);
            
            $response = Http::withHeaders(['key' => $this->apiKey])->get($url);
            
            if ($response->successful()) {
                $json = $response->json();
                return $json['data'] ?? $json['rajaongkir']['results'] ?? [];
            }
            
            Log::error("Komerce API Error ($logMessage): " . $response->body());
            return null;
        } catch (\Exception $e) {
            Log::error("Exception ($logMessage): " . $e->getMessage());
            return null;
        }
    }

    public function provinces()
    {
        $data = $this->fetchFromKomerce('/destination/province', 'Provinces');
        if ($data === null) return response()->json(['error' => 'API Error'], 500);

        return response()->json(array_map(fn($p) => [
            'id' => $p['id'] ?? $p['province_id'],
            'name' => $p['name'] ?? $p['province']
        ], $data));
    }

    public function cities(Request $request)
    {
        $provinceId = $request->query('provinceId');
        if (!$provinceId) return response()->json([]);

        $data = $this->fetchFromKomerce("/destination/city/$provinceId", "Cities for Province $provinceId");
        if ($data === null) return response()->json(['error' => 'API Error'], 500);

        return response()->json(array_map(fn($c) => [
            'id' => $c['id'] ?? $c['city_id'],
            'name' => trim(($c['type'] ?? '') . ' ' . ($c['name'] ?? $c['city_name'])),
            'postal_code' => $c['zip_code'] ?? $c['postal_code'] ?? ''
        ], $data));
    }

    public function districts(Request $request)
    {
        // Komerce "District" (Kecamatan) endpoint: /destination/district/{city_id}
        // NOTE: Standard RajaOngkir uses 'subdistrict' for Kecamatan, but Komerce uses 'district'.
        $cityId = $request->query('cityId');
        if (!$cityId) return response()->json([]);

        $data = $this->fetchFromKomerce("/destination/district/$cityId", "Districts for City $cityId");
        
        // If /destination/district fails (returns 404), fallback to /destination/subdistrict (Standard RO compatibility)
        if ($data === null) {
             Log::info("Fallback: Trying Komerce Subdistrict endpoint for Districts");
             $data = $this->fetchFromKomerce("/destination/subdistrict/$cityId", "Subdistricts (Standard RO) for City $cityId");
        }
        
        if ($data === null) return response()->json(['error' => 'API Error'], 500);

        return response()->json(array_map(fn($d) => [
            'id' => $d['id'] ?? $d['subdistrict_id'],
            'name' => $d['name'] ?? $d['subdistrict_name']
        ], $data));
    }

    public function subdistricts(Request $request)
    {
        // Komerce "Subdistrict" (Kelurahan) endpoint: /destination/subdistrict/{district_id}
        // Only works if the previous step returned actual District IDs (Kecamatan IDs).
        $districtId = $request->query('districtId');
        if (!$districtId) return response()->json([]);

        $data = $this->fetchFromKomerce("/destination/subdistrict/$districtId", "Villages for District $districtId");
        
        if ($data === null) {
            // If API fails (e.g. tier doesn't support village), return a Mock to unblock user
            // This ensures they can at least submit the form
            Log::warning("Village API failed or not supported. Returning Mock data.");
            return response()->json([
                [
                    'id' => $districtId, // Reuse District ID to pass validation if needed
                    'name' => 'Kelurahan Umum / Lainnya', 
                    'zip_code' => ''
                ]
            ]);
        }

        return response()->json(array_map(fn($s) => [
            'id' => $s['id'] ?? $s['subdistrict_id'],
            'name' => $s['name'] ?? $s['subdistrict_name'],
            'zip_code' => $s['zip_code'] ?? '' // Komerce specific
        ], $data));
    }
}
