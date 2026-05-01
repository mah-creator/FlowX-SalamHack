<?php

namespace App\Providers;

use App\Domain\FlowX\FlowXStore;
use Illuminate\Support\ServiceProvider;
use RuntimeException;

class AppServiceProvider extends ServiceProvider
{
    /**
     * Register any application services.
     */
    public function register(): void
    {
        $this->app->singleton(FlowXStore::class);
    }

    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {
        if ($this->app->runningUnitTests() || $this->app->runningInConsole()) {
            return;
        }

        $errors = self::configurationErrors([
            'app_key' => (string) config('app.key'),
            'app_env' => (string) config('app.env'),
            'cors_allowed_origins' => (string) env('CORS_ALLOWED_ORIGINS', ''),
        ]);

        if ($errors !== []) {
            throw new RuntimeException(implode(' ', $errors));
        }
    }

    /**
     * @param  array{app_key?: string, app_env?: string, cors_allowed_origins?: string}  $values
     * @return list<string>
     */
    public static function configurationErrors(array $values): array
    {
        $errors = [];
        $appKey = trim((string) ($values['app_key'] ?? ''));
        $appEnv = trim((string) ($values['app_env'] ?? 'production'));
        $corsAllowedOrigins = trim((string) ($values['cors_allowed_origins'] ?? ''));

        if ($appKey === '') {
            $errors[] = 'APP_KEY is required. Run php artisan key:generate.';
        }

        if ($corsAllowedOrigins === '') {
            $errors[] = 'CORS_ALLOWED_ORIGINS is required.';
        }

        $origins = array_values(array_filter(array_map('trim', explode(',', $corsAllowedOrigins))));

        foreach ($origins as $origin) {
            if ($origin === '*' && $appEnv !== 'local') {
                $errors[] = 'CORS_ALLOWED_ORIGINS cannot contain * outside APP_ENV=local.';

                continue;
            }

            if ($origin !== '*' && ! filter_var($origin, FILTER_VALIDATE_URL)) {
                $errors[] = 'CORS_ALLOWED_ORIGINS entries must be absolute http(s) origins.';

                continue;
            }

            if ($origin !== '*' && ! str_starts_with($origin, 'http://') && ! str_starts_with($origin, 'https://')) {
                $errors[] = 'CORS_ALLOWED_ORIGINS entries must be absolute http(s) origins.';
            }
        }

        return array_values(array_unique($errors));
    }
}
