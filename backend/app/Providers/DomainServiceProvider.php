<?php

namespace App\Providers;

use App\Domain\FlowX\FlowXEloquentStore;
use App\Domain\FlowX\FlowXPayloadMapper;
use App\Domain\Transactions\SettlementClock;
use App\Domain\Transactions\TransactionFactory;
use App\Domain\Transactions\TransactionStateMachine;
use App\Domain\Transactions\TransactionStore;
use App\Domain\Users\ActorIdentity;
use Illuminate\Http\Request;
use Illuminate\Support\ServiceProvider;

class DomainServiceProvider extends ServiceProvider
{
    public function register(): void
    {
        $this->app->singleton(SettlementClock::class, fn (): SettlementClock => new SettlementClock(
            (int) config('salamhack.demo_config.payment_window_minutes', 1),
        ));

        $this->app->singleton(TransactionStore::class);
        $this->app->singleton(FlowXPayloadMapper::class);
        $this->app->singleton(FlowXEloquentStore::class);

        $this->app->singleton(TransactionFactory::class, fn ($app): TransactionFactory => new TransactionFactory(
            $app->make(TransactionStore::class),
            (array) config('salamhack.demo_config', []),
            (array) config('salamhack.transaction_defaults', []),
            (string) config('salamhack.transaction_id_prefix', 'TR-'),
        ));

        $this->app->bind(TransactionStateMachine::class);

        $this->app->bind(ActorIdentity::class, function ($app): ActorIdentity {
            $request = $app->make(Request::class);

            return ActorIdentity::fromBearerToken(
                $request->bearerToken() ?? '',
                (array) config('salamhack.admin_tokens', []),
            );
        });
    }

    public function boot(): void
    {
        //
    }
}
