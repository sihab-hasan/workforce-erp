<?php

namespace App\Contracts;

interface SmsProviderInterface
{
    public function send(string $e164Phone, string $message): void;
}
