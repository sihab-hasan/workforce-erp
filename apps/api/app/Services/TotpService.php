<?php

namespace App\Services;

use RuntimeException;

class TotpService
{
    public function generateSecret(int $bytes = 20): string
    {
        return $this->base32Encode(random_bytes($bytes));
    }

    public function verify(string $secret, string $code, int $window = 1): bool
    {
        if (! preg_match('/^\d{6}$/', $code)) {
            return false;
        } $counter = intdiv(time(), 30);
        for ($i = -$window; $i <= $window; $i++) {
            if (hash_equals($this->code($secret, $counter + $i), $code)) {
                return true;
            }
        }

        return false;
    }

    public function uri(string $secret, string $email, string $issuer = 'Workforce ERP'): string
    {
        $label = rawurlencode($issuer.':'.$email);

        return 'otpauth://totp/'.$label.'?'.http_build_query(['secret' => $secret, 'issuer' => $issuer, 'algorithm' => 'SHA1', 'digits' => 6, 'period' => 30]);
    }

    private function code(string $secret, int $counter): string
    {
        $key = $this->base32Decode($secret);
        $bin = pack('N2', intdiv($counter, 0x100000000), $counter & 0xFFFFFFFF);
        $hash = hash_hmac('sha1', $bin, $key, true);
        $offset = ord($hash[19]) & 0xF;
        $value = ((ord($hash[$offset]) & 0x7F) << 24) | ((ord($hash[$offset + 1]) & 0xFF) << 16) | ((ord($hash[$offset + 2]) & 0xFF) << 8) | (ord($hash[$offset + 3]) & 0xFF);

        return str_pad((string) ($value % 1000000), 6, '0', STR_PAD_LEFT);
    }

    private function base32Encode(string $data): string
    {
        $alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567';
        $bits = '';
        foreach (str_split($data) as $c) {
            $bits .= str_pad(decbin(ord($c)), 8, '0', STR_PAD_LEFT);
        } $out = '';
        foreach (str_split($bits, 5) as $chunk) {
            $chunk = str_pad($chunk, 5, '0');
            $out .= $alphabet[bindec($chunk)];
        }

        return $out;
    }

    private function base32Decode(string $data): string
    {
        $alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567';
        $data = strtoupper(preg_replace('/[^A-Z2-7]/', '', $data) ?? '');
        $bits = '';
        foreach (str_split($data) as $c) {
            $p = strpos($alphabet, $c);
            if ($p === false) {
                throw new RuntimeException('Invalid TOTP secret.');
            } $bits .= str_pad(decbin($p), 5, '0', STR_PAD_LEFT);
        } $out = '';
        foreach (str_split($bits, 8) as $chunk) {
            if (strlen($chunk) === 8) {
                $out .= chr(bindec($chunk));
            }
        }

        return $out;
    }
}
