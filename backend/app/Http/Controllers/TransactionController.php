<?php

namespace App\Http\Controllers;

use App\Domain\Transactions\Currency;
use App\Domain\Transactions\DepositParty;
use App\Domain\Transactions\TransactionFactory;
use App\Domain\Transactions\TransactionStateMachine;
use App\Domain\Transactions\TransactionStore;
use App\Domain\Users\ActorIdentity;
use App\Exceptions\OwnershipDeniedException;
use App\Http\Requests\ConfirmDepositRequest;
use App\Http\Requests\EmptyBodyRequest;
use App\Http\Requests\OpenDisputeRequest;
use App\Http\Requests\StoreTransactionRequest;
use App\Http\Resources\TransactionCollection;
use App\Http\Resources\TransactionResource;
use Carbon\CarbonImmutable;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Response;
use Symfony\Component\HttpKernel\Exception\NotFoundHttpException;

class TransactionController extends Controller
{
    public function __construct(
        private readonly TransactionStore $store,
        private readonly TransactionFactory $factory,
        private readonly TransactionStateMachine $stateMachine,
    ) {}

    public function index(): TransactionCollection
    {
        return new TransactionCollection($this->store->ownedBy($this->actor()->id));
    }

    public function show(string $id): TransactionResource
    {
        return new TransactionResource($this->ownedTransaction($id));
    }

    public function store(StoreTransactionRequest $request): JsonResponse
    {
        $validated = $request->validated();
        $tx = $this->factory->create(
            $this->actor()->id,
            (float) $validated['amount'],
            Currency::from($validated['currency']),
            CarbonImmutable::now(),
        );

        $this->store->put($tx);

        return (new TransactionResource($tx))->response()->setStatusCode(Response::HTTP_CREATED);
    }

    public function cancel(string $id, EmptyBodyRequest $request): TransactionResource
    {
        return $this->mutateOwned($id, fn ($tx) => $this->stateMachine->cancel($tx, $this->actor(), CarbonImmutable::now()));
    }

    public function confirmMatch(string $id, EmptyBodyRequest $request): TransactionResource
    {
        return $this->mutateOwned($id, fn ($tx) => $this->stateMachine->confirmMatch($tx, $this->actor(), CarbonImmutable::now()));
    }

    public function confirmDeposit(string $id, ConfirmDepositRequest $request): TransactionResource
    {
        return $this->mutateOwned($id, fn ($tx) => $this->stateMachine->confirmDeposit(
            $tx,
            DepositParty::from($request->validated('party')),
            $this->actor(),
            CarbonImmutable::now(),
        ));
    }

    public function processPayouts(string $id, EmptyBodyRequest $request): TransactionResource
    {
        return $this->mutateOwned($id, fn ($tx) => $this->stateMachine->processPayouts($tx, $this->actor(), CarbonImmutable::now()));
    }

    public function openDispute(string $id, OpenDisputeRequest $request): TransactionResource
    {
        return $this->mutateOwned($id, fn ($tx) => $this->stateMachine->openDispute(
            $tx,
            $request->validated('reason'),
            $this->actor(),
            CarbonImmutable::now(),
        ));
    }

    public function autoMatch(string $id, EmptyBodyRequest $request): TransactionResource
    {
        return $this->mutateOwned($id, fn ($tx) => $this->stateMachine->autoMatch($tx, $this->actor(), CarbonImmutable::now()));
    }

    private function ownedTransaction(string $id)
    {
        $tx = $this->store->get($id);

        if ($tx === null) {
            throw new NotFoundHttpException;
        }

        if ($tx->ownerId !== $this->actor()->id) {
            throw new OwnershipDeniedException($id);
        }

        return $tx;
    }

    private function mutateOwned(string $id, callable $mutation): TransactionResource
    {
        $updated = $mutation($this->ownedTransaction($id));
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
