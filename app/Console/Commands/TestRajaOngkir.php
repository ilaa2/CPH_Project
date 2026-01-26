<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use Illuminate\Support\Facades\Http;

class TestRajaOngkir extends Command
{
    protected $signature = 'test:rajaongkir {key? : Optional manual API Key}';
    protected $description = 'Test RajaOngkir API Connectivity';

    public function handle()
    {
        $activeKey = $this->argument('key') ?: config('rajaongkir.api_key');
        
        $this->info("--- PROBING PRO ENDPOINTS (FINAL CHECK) ---");
        $this->info("Active Key: " . $activeKey); 

        $scenarios = [
            ['url' => 'https://pro.rajaongkir.com/api/province', 'header' => 'key'],
            ['url' => 'https://api.rajaongkir.com/basic/province', 'header' => 'key'],
            ['url' => 'https://x.rajaongkir.com/api/province', 'header' => 'key'], // Wild guess
        ];

        foreach ($scenarios as $s) {
            $url = $s['url'];
            $headerName = $s['header'];
            
            $this->info("\nTrying: $url");
            
            try {
                $response = Http::withHeaders([$headerName => $activeKey])->get($url);
                $status = $response->status();
                $this->info("Status: $status");
                
                if ($status == 200) {
                    $this->info("SUCCESS! Found correct endpoint: $url");
                    $this->info("Body: " . substr($response->body(), 0, 150));
                    return; 
                } else {
                    $this->line("Failed ($status): " . substr($response->body(), 0, 150));
                }
            } catch (\Exception $e) {
                $this->error("Exception: " . $e->getMessage());
            }
        }
    }
}
