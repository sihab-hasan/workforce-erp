<?php

namespace App\Services\Sms;

use App\Contracts\SmsProviderInterface;
use Illuminate\Support\Facades\Http;
use RuntimeException;

class HttpSmsProvider implements SmsProviderInterface
{
    public function send(string $e164Phone, string $message): void
    {
        $endpoint = (string) config('security.sms.endpoint');
        $token = (string) config('security.sms.token');
        if ($endpoint === '' || $token === '') {
            throw new RuntimeException('A production SMS provider is not configured.');
        }
        $response = Http::timeout(10)->withToken($token)->post($endpoint, ['to' => $e164Phone, 'message' => $message, 'sender' => config('security.sms.sender')]);
        if (! $response->successful()) {
            throw new RuntimeException('SMS provider rejected the message.');
        }
    }
}
