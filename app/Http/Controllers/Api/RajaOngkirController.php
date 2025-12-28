<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class RajaOngkirController extends Controller
{
    protected $apiKey;
    protected $baseUrl;

    public function __construct()
    {
        // Mengembalikan ke cara yang benar setelah debugging
        $this->apiKey = config('rajaongkir.api_key');
        $this->baseUrl = config('rajaongkir.base_url');
    }

    private function sendApiResponse($response, $errorMessage)
    {
        if ($response->failed()) {
            Log::error("Komerce API Error: {$errorMessage}", [
                'status' => $response->status(),
                'body' => $response->body()
            ]);
            return response()->json(['error' => $errorMessage], 500);
        }

        return response()->json($response->json()['data'] ?? []);
    }

    public function getProvinces()
    {
        $response = Http::withHeaders(['key' => $this->apiKey])
            ->get($this->baseUrl . '/destination/province');
        
        return $this->sendApiResponse($response, 'Gagal mengambil daftar provinsi.');
    }

    public function getCities($provinceId)
    {
        $response = Http::withHeaders(['key' => $this->apiKey])
            ->get($this->baseUrl . '/destination/city/' . $provinceId);

        return $this->sendApiResponse($response, 'Gagal mengambil daftar kota.');
    }

    public function getDistricts($cityId)
    {
        $response = Http::withHeaders(['key' => $this->apiKey])
            ->get($this->baseUrl . '/destination/district/' . $cityId);

        return $this->sendApiResponse($response, 'Gagal mengambil daftar kecamatan.');
    }

    public function getSubdistricts($districtId)
    {
        $response = Http::withHeaders(['key' => $this->apiKey])
            ->get($this->baseUrl . '/destination/sub-district/' . $districtId);

        return $this->sendApiResponse($response, 'Gagal mengambil daftar kelurahan.');
    }
}