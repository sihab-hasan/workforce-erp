<?php

namespace Tests;

use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Foundation\Testing\TestCase as BaseTestCase;
use Illuminate\Routing\Middleware\ThrottleRequests;

abstract class TestCase extends BaseTestCase
{
    use CreatesApplication, RefreshDatabase;

    protected function setUp(): void
    {
        if (! getenv('OPENSSL_CONF')) {
            $cnf = dirname(PHP_BINARY).'/extras/ssl/openssl.cnf';
            if (file_exists($cnf)) {
                putenv("OPENSSL_CONF={$cnf}");
            }
        }

        parent::setUp();
        $this->withoutMiddleware(ThrottleRequests::class);
    }
}
