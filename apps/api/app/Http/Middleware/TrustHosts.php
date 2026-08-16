<?php

namespace App\Http\Middleware;

use Illuminate\Http\Middleware\TrustHosts as Middleware;

class TrustHosts extends Middleware
{
    /**
     * Get the host patterns that should be trusted.
     *
     * @return array<int, string|null>
     */
    public function hosts(): array
    {
        $configuredHosts = config('workforce.trusted_hosts', []);

        if (is_array($configuredHosts) && $configuredHosts !== []) {
            return array_map(
                static fn (string $host): string => '^'.preg_quote($host, '/').'$',
                $configuredHosts
            );
        }

        return [
            $this->allSubdomainsOfApplicationUrl(),
        ];
    }
}
