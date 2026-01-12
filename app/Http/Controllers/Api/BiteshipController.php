<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class BiteshipController extends Controller
{
    private function getApiKey()
    {
        return config('biteship.api_key');
    }

    private function getBaseUrl()
    {
        return config('biteship.base_url');
    }

    public function searchArea(Request $request)
    {
        $input = $request->query('input');
        if (strlen($input) < 3) return response()->json([]);

        try {
            $response = Http::withHeaders(['Authorization' => 'Bearer ' . $this->getApiKey()])
                ->get($this->getBaseUrl() . '/maps/areas', [
                    'countries' => 'ID',
                    'input' => $input,
                    'type' => 'single'
                ]);
            
            if ($response->successful()) {
                return response()->json($response->json()['areas'] ?? []);
            }

            Log::error('Biteship search error: ' . $response->body());
            return response()->json([], 502);
        } catch (\Exception $e) {
            Log::error('Biteship search exception: ' . $e->getMessage());
            return response()->json([], 500);
        }
    }

    public function checkRates(Request $request)
    {
        $request->validate([
            'destination_area_id' => 'required|string',
            'items' => 'required|array'
        ]);

        $originId = config('biteship.origin_area_id'); // Mandau
        
        // Items payload transformation if needed
        $items = $request->items; 
        
        $payload = [
            'origin_area_id' => $originId,
            'destination_area_id' => $request->destination_area_id,
            'couriers' => 'jne,sicepat,jnt,gojek,grab,paxel', // Standard couriers
            'items' => $items
        ];

        try {
            Log::info('Biteship Rates Payload: ' . json_encode($payload));
            
            $response = Http::withHeaders(['Authorization' => 'Bearer ' . $this->getApiKey()])
                ->post($this->getBaseUrl() . '/rates/couriers', $payload);

            Log::info('Biteship Rates Response: ' . $response->body());

            if ($response->successful()) {
                $pricing = $response->json()['pricing'] ?? [];
                // Filter logic can be added here
                return response()->json($pricing);
            }

            return response()->json([
                'error' => 'Biteship Error', 
                'details' => $response->json()
            ], $response->status());

        } catch (\Exception $e) {
            Log::error('Biteship rates exception: ' . $e->getMessage());
            return response()->json(['error' => $e->getMessage()], 500);
        }
    }
}
