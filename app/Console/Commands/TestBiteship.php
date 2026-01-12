<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use Illuminate\Support\Facades\Http;

class TestBiteship extends Command
{
    protected $signature = 'test:biteship {key?}';
    protected $description = 'Test Biteship API Connectivity and Features';

    public function handle()
    {
        $key = $this->argument('key') ?: env('BITESHIP_API_KEY');
        $baseUrl = 'https://api.biteship.com/v1';
        
        $this->info("Testing Biteship API with Key: " . substr($key, 0, 10) . "...");

        // 1. Test Maps (Search)
        $this->info("\n--- 1. Testing Maps Search (Input: 'Jakarta') ---");
        try {
            $response = Http::withHeaders(['Authorization' => 'Bearer ' . $key])
                ->get("$baseUrl/maps/areas", [
                    'countries' => 'ID',
                    'input' => 'Jakarta',
                    'type' => 'single' // single area
                ]);
            
            $this->info("Status: " . $response->status());
            if ($response->successful()) {
                $data = $response->json();
                $this->info("Areas Found: " . count($data['areas'] ?? []));
                if (!empty($data['areas'])) {
                    $first = $data['areas'][0];
                    $this->info("Sample Area: Name={$first['name']}, ID={$first['id']}");
                    $this->info("Hierarchy: {$first['administrative_division_level_1_name']} > {$first['administrative_division_level_2_name']}");
                }
            } else {
                $this->error("Failed: " . $response->body());
            }
        } catch (\Exception $e) {
            $this->error("Exception: " . $e->getMessage());
        }

        // 2. Test Get Courier Rates (Need dummy IDs)
        // Let's assume we use the ID from above search for destination
        // Origin: Try searching for Store Address "Mandau"
        $this->info("\n--- 2. Searching Store Origin ID (Mandau, Bengkalis) ---");
        $originId = null;
        try {
             $response = Http::withHeaders(['Authorization' => 'Bearer ' . $key])
                ->get("$baseUrl/maps/areas", [
                    'countries' => 'ID',
                    'input' => 'Mandau',
                    'type' => 'single'
                ]);
             if ($response->successful()) {
                 $data = $response->json();
                 foreach ($data['areas'] as $area) {
                     if (str_contains($area['name'], 'Mandau') && str_contains($area['administrative_division_level_2_name'], 'Bengkalis')) {
                         $originId = $area['id'];
                         $this->info("Found Origin ID: $originId ({$area['name']})");
                         break;
                     }
                 }
             }
        } catch (\Exception $e) {}

        if ($originId) {
            $this->info("\n--- 3. Testing Rates (Origin: Mandau, Dest: Jakarta) ---");
            try {
                // Destination ID (Jakarta Selatan - hardcoded or from prev search)
                // Let's use a common one if prev search worked, or just search 'Tebet'
                $destId = 'IDNP6IDN04IDN0406'; // Example ID if known, otherwise fetch
                
                // Fetch valid destination first to be safe
                $resDest = Http::withHeaders(['Authorization' => 'Bearer ' . $key])->get("$baseUrl/maps/areas", ['countries'=>'ID','input'=>'Gambir','type'=>'single']);
                $destId = $resDest->json()['areas'][0]['id'] ?? null;

                if ($destId) {
                    $payload = [
                        'origin_area_id' => $originId,
                        'destination_area_id' => $destId,
                        'couriers' => 'jne,sicepat,jnt', // Standard
                        'items' => [
                            [
                                'name' => 'Sayuran',
                                'description' => 'Sayur Segar',
                                'value' => 50000,
                                'length' => 10,
                                'width' => 10,
                                'height' => 10,
                                'weight' => 1000,
                                'quantity' => 1
                            ]
                        ]
                    ];
                    
                    $response = Http::withHeaders(['Authorization' => 'Bearer ' . $key])
                        ->post("$baseUrl/rates/couriers", $payload);
                        
                    $this->info("Rates Status: " . $response->status());
                    if ($response->successful()) {
                        $rates = $response->json()['pricing'] ?? [];
                        $this->info("Rates Found: " . count($rates));
                        if (count($rates) > 0) {
                            $this->info("Sample Rate: " . $rates[0]['courier_name'] . " - " . $rates[0]['price']);
                        }
                    } else {
                        $this->error("Rates Failed: " . $response->body());
                    }
                }
            } catch (\Exception $e) { $this->error($e->getMessage()); }
        }
    }
}
