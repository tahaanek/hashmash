<?php

namespace Modules\HashMash\Providers;

use Illuminate\Support\ServiceProvider;

class HashMashServiceProvider extends ServiceProvider
{
    public function register(): void
    {
        $this->mergeConfigFrom(__DIR__ . '/../../config/config.php', 'hashmash');
    }

    public function boot(): void
    {
        $this->loadRoutesFrom(__DIR__ . '/../../routes/api.php');
    }
}
