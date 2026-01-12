<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Log;

class RajaOngkirController extends Controller
{
    private function getApiKey()
    {
        return config('rajaongkir.api_key');
    }

    private function getBaseUrl()
    {
        return config('rajaongkir.base_url');
    }

    /**
     * Get all provinces
     */
    /**
     * Get all provinces
     */
    public function provinces()
    {
        // Cache for 24 hours
        $provinces = Cache::remember('rajaongkir_provinces', 86400, function () {
            try {
                $url = $this->getBaseUrl() . '/province';
                Log::info('RajaOngkir Request URL: ' . $url);
                
                $response = Http::withHeaders(['key' => $this->getApiKey()])
                    ->get($url);

                Log::info('RajaOngkir provinces response: ' . $response->body());

                if ($response->successful()) {
                    $json = $response->json();
                    
                    if (isset($json['data']) && is_array($json['data'])) {
                        return $json['data'];
                    }
                    if (isset($json['rajaongkir']['results'])) {
                        return $json['rajaongkir']['results'];
                    }
                    
                    return $json;
                }

                $errorMessage = $response->json()['message'] ?? $response->body();
                Log::error('RajaOngkir provinces error: ' . $response->status() . ' - ' . $errorMessage);
                return ['error' => $errorMessage, 'status' => $response->status()];
            } catch (\Exception $e) {
                Log::error('RajaOngkir provinces exception: ' . $e->getMessage());
                return ['error' => $e->getMessage(), 'status' => 500];
            }
        });

        if (isset($provinces['error'])) {
            return response()->json(['error' => $provinces['error']], $provinces['status'] ?? 502);
        }

        return response()->json($provinces);
    }

    /**
     * Get cities by province ID
     */
    /**
     * Get cities by province ID
     */
    public function cities($provinceId)
    {
        $cacheKey = "rajaongkir_cities_{$provinceId}";
        
        $cities = Cache::remember($cacheKey, 86400, function () use ($provinceId) {
            try {
                $url = $this->getBaseUrl() . '/city';
                $response = Http::withHeaders(['key' => $this->getApiKey()])
                    ->get($url, [
                        'province' => $provinceId // Parameter name for city endpoint is usually 'province'
                    ]);

                Log::info('RajaOngkir cities response: ' . $response->body());

                if ($response->successful()) {
                    $json = $response->json();
                    
                    if (isset($json['data']) && is_array($json['data'])) {
                        return $json['data'];
                    }
                    if (isset($json['rajaongkir']['results'])) {
                        return $json['rajaongkir']['results'];
                    }
                    
                    return $json;
                }

                Log::error('RajaOngkir cities error: ' . $response->status() . ' - ' . $response->body());
                return null;
            } catch (\Exception $e) {
                Log::error('RajaOngkir cities exception: ' . $e->getMessage());
                return null;
            }
        });

        if ($cities === null) {
            return response()->json(['error' => 'Failed to fetch cities from RajaOngkir'], 502);
        }

        return response()->json($cities);
    }

    /**
     * Get subdistricts by city ID
     */
    /**
     * Get subdistricts by city ID
     */
    public function subdistricts($cityId)
    {
        $cacheKey = "rajaongkir_subdistricts_{$cityId}";
        
        $subdistricts = Cache::remember($cacheKey, 86400, function () use ($cityId) {
            try {
                $url = $this->getBaseUrl() . '/subdistrict';
                $response = Http::withHeaders(['key' => $this->getApiKey()])
                    ->get($url, [
                        'city' => $cityId // Parameter name for subdistrict endpoint is usually 'city'
                    ]);

                Log::info('RajaOngkir subdistricts response: ' . $response->body());

                if ($response->successful()) {
                    $json = $response->json();
                    
                    if (isset($json['data']) && is_array($json['data'])) {
                        return $json['data'];
                    }
                    if (isset($json['rajaongkir']['results'])) {
                        return $json['rajaongkir']['results'];
                    }
                    
                    return $json;
                }

                // If 400 Bad Request, it might be due to starter plan not supporting subdistrict
                if ($response->status() === 400) {
                     Log::warning('RajaOngkir subdistrict fetch failed (possibly unavailable in Starter plan): ' . $response->body());
                     // Return empty array for starter plan so it doesn't break the UI, just no subdistricts
                     return [];
                }

                Log::error('RajaOngkir subdistricts error: ' . $response->status() . ' - ' . $response->body());
                return null;
            } catch (\Exception $e) {
                Log::error('RajaOngkir subdistricts exception: ' . $e->getMessage());
                return null;
            }
        });

        if ($subdistricts === null) {
            return response()->json(['error' => 'Failed to fetch subdistricts from RajaOngkir'], 502);
        }

        return response()->json($subdistricts);
    }
}