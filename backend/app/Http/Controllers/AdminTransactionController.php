<?php

namespace App\Http\Controllers;

use App\Domain\Transactions\Transaction;
use App\Domain\Transactions\TransactionStateMachine;
use App\Domain\Transactions\TransactionStore;
use App\Domain\Users\ActorIdentity;
use App\Http\Requests\EmptyBodyRequest;
use App\Http\Requests\IndexAdminTransactionsRequest;
use App\Http\Requests\ResolveDisputeRequest;
use App\Http\Resources\TransactionCollection;
use App\Http\Resources\TransactionResource;
use Carbon\CarbonImmutable;
use Illuminate\Http\Request;
use Symfony\Component\HttpKernel\Exception\NotFoundHttpException;

class AdminTransactionController extends Controller
{
    public function __construct(
        private readonly TransactionStore $store,
        private readonly TransactionStateMachine $stateMachine,
    ) {}

    public function index(IndexAdminTransactionsRequest $request): TransactionCollection
    {
        $status = $request->validated('status');
        $transactions = $this->store->all();

        if ($status !== null) {
            $transactions = array_values(array_filter(
                is_array($transactions) ? $transactions : iterator_to_array($transactions),
                fn (Transaction $tx): bool => $tx->status->value === $status,
            ));
        }

        return new TransactionCollection($transactions);
    }

    public function flagRisk(string $id, EmptyBodyRequest $request): TransactionResource
    {
        return $this->mutate($id, fn ($tx) => $this->stateMachine->flagRisk($tx, $this->actor(), CarbonImmutable::now()));
    }

    public function approve(string $id, EmptyBodyRequest $request): TransactionResource
    {
        return $this->mutate($id, fn ($tx) => $this->stateMachine->approve($tx, $this->actor(), CarbonImmutable::now()));
    }

    public function refund(string $id, EmptyBodyRequest $request): TransactionResource
    {
        return $this->mutate($id, fn ($tx) => $this->stateMachine->refund($tx, $this->actor(), CarbonImmutable::now()));
    }

    public function resolveDispute(string $id, ResolveDisputeRequest $request): TransactionResource
    {
        return $this->mutate($id, fn ($tx) => $this->stateMachine->resolveDispute(
            $tx,
            $request->validated('outcome'),
            $this->actor(),
            CarbonImmutable::now(),
        ));
    }

    private function find(string $id): Transaction
    {
        $tx = $this->store->get($id);

        if ($tx === null) {
            throw new NotFoundHttpException;
        }

        return $tx;
    }

    private function mutate(string $id, callable $mutation): TransactionResource
    {
        $updated = $mutation($this->find($id));
        $this->store->replace($id, $updated);

        return new TransactionResource($updated);
    }

    private function actor(): ActorIdentity
    {
        /** @var Request $request */
        $request = request();

        return ActorIdentity::fromBearerToken(
            $request->bearerToken() ?? '',
            (array) config('salamhack.admin_tokens', []),
        );
    }
}
