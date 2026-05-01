<?php

use App\Http\Controllers\AdminTransactionController;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\FlowX\AuditLogResourceController;
use App\Http\Controllers\FlowX\ConfigResourceController;
use App\Http\Controllers\FlowX\DisputeResourceController;
use App\Http\Controllers\FlowX\NotificationResourceController;
use App\Http\Controllers\FlowX\StaticResourceController;
use App\Http\Controllers\FlowX\TransferActionController;
use App\Http\Controllers\FlowX\TransferResourceController;
use App\Http\Controllers\FlowX\UserResourceController;
use App\Http\Controllers\FlowX\VerificationResourceController;
use App\Http\Controllers\FlowX\WalletResourceController;
use App\Http\Controllers\HealthController;
use App\Http\Controllers\TransactionController;
use Illuminate\Support\Facades\Route;

Route::get('/healthz', [HealthController::class, 'show'])->name('healthz.show');

Route::get('/users', [UserResourceController::class, 'index'])->name('flowx.users.index');
Route::post('/users', [UserResourceController::class, 'store'])->name('flowx.users.store');
Route::get('/users/{id}', [UserResourceController::class, 'show'])->name('flowx.users.show');
Route::patch('/users/{id}', [UserResourceController::class, 'patch'])->name('flowx.users.patch');

Route::get('/wallets', [WalletResourceController::class, 'index'])->name('flowx.wallets.index');
Route::post('/wallets', [WalletResourceController::class, 'store'])->name('flowx.wallets.store');
Route::patch('/wallets/{id}', [WalletResourceController::class, 'patch'])->name('flowx.wallets.patch');

Route::get('/transfers', [TransferResourceController::class, 'index'])->name('flowx.transfers.index');
Route::post('/transfers', [TransferResourceController::class, 'store'])->name('flowx.transfers.store');
Route::get('/transfers/{id}', [TransferResourceController::class, 'show'])->name('flowx.transfers.show');
Route::patch('/transfers/{id}', [TransferResourceController::class, 'patch'])->name('flowx.transfers.patch');
Route::post('/transfers/{id}/match-request', [TransferActionController::class, 'matchRequest'])->name('flowx.transfers.match-request');
Route::post('/transfers/{id}/submit', [TransferActionController::class, 'submit'])->name('flowx.transfers.submit');
Route::post('/transfers/{id}/risk-approval', [TransferActionController::class, 'riskApproval'])->name('flowx.transfers.risk-approval');
Route::post('/transfers/{id}/risk-rejection', [TransferActionController::class, 'riskRejection'])->name('flowx.transfers.risk-rejection');
Route::post('/transfers/{id}/refund', [TransferActionController::class, 'refund'])->name('flowx.transfers.refund');

Route::get('/verifications', [VerificationResourceController::class, 'index'])->name('flowx.verifications.index');
Route::post('/verifications', [VerificationResourceController::class, 'store'])->name('flowx.verifications.store');
Route::patch('/verifications/{id}', [VerificationResourceController::class, 'patch'])->name('flowx.verifications.patch');

Route::get('/notifications', [NotificationResourceController::class, 'index'])->name('flowx.notifications.index');
Route::post('/notifications', [NotificationResourceController::class, 'store'])->name('flowx.notifications.store');
Route::patch('/notifications/{id}', [NotificationResourceController::class, 'patch'])->name('flowx.notifications.patch');

Route::get('/disputes', [DisputeResourceController::class, 'index'])->name('flowx.disputes.index');
Route::post('/disputes', [DisputeResourceController::class, 'store'])->name('flowx.disputes.store');
Route::patch('/disputes/{id}', [DisputeResourceController::class, 'patch'])->name('flowx.disputes.patch');

Route::get('/config', [ConfigResourceController::class, 'show'])->name('flowx.config.show');
Route::patch('/config', [ConfigResourceController::class, 'patch'])->name('flowx.config.patch');

Route::get('/auditLogs', [AuditLogResourceController::class, 'index'])->name('flowx.audit-logs.index');
Route::post('/auditLogs', [AuditLogResourceController::class, 'store'])->name('flowx.audit-logs.store');

Route::get('/agents', fn (StaticResourceController $controller) => $controller->index('agents'))->name('flowx.agents.index');
Route::get('/paymentMethods', fn (StaticResourceController $controller) => $controller->index('paymentMethods'))->name('flowx.payment-methods.index');
Route::get('/analytics', fn (StaticResourceController $controller) => $controller->index('analytics'))->name('flowx.analytics.index');
Route::get('/activities', fn (StaticResourceController $controller) => $controller->index('activities'))->name('flowx.activities.index');
Route::get('/requests', fn (StaticResourceController $controller) => $controller->index('requests'))->name('flowx.requests.index');

Route::middleware('auth.bearer.presence')->group(function (): void {
    Route::get('/transactions', [TransactionController::class, 'index'])->name('transactions.index');
    Route::get('/transactions/{id}', [TransactionController::class, 'show'])->name('transactions.show');
    Route::post('/transactions', [TransactionController::class, 'store'])->name('transactions.store');
    Route::post('/transactions/{id}/cancel', [TransactionController::class, 'cancel'])->name('transactions.cancel');
    Route::post('/transactions/{id}/confirm-match', [TransactionController::class, 'confirmMatch'])->name('transactions.confirm-match');
    Route::post('/transactions/{id}/deposits', [TransactionController::class, 'confirmDeposit'])->name('transactions.deposits');
    Route::post('/transactions/{id}/process-payouts', [TransactionController::class, 'processPayouts'])->name('transactions.process-payouts');
    Route::post('/transactions/{id}/disputes', [TransactionController::class, 'openDispute'])->name('transactions.disputes');
    Route::post('/transactions/{id}/auto-match', [TransactionController::class, 'autoMatch'])->name('transactions.auto-match');

    Route::middleware('admin.guard')->group(function (): void {
        Route::get('/admin/transactions', [AdminTransactionController::class, 'index'])->name('admin.transactions.index');
        Route::post('/admin/transactions/{id}/flag-risk', [AdminTransactionController::class, 'flagRisk'])->name('admin.transactions.flag-risk');
        Route::post('/admin/transactions/{id}/approve', [AdminTransactionController::class, 'approve'])->name('admin.transactions.approve');
        Route::post('/admin/transactions/{id}/refund', [AdminTransactionController::class, 'refund'])->name('admin.transactions.refund');
        Route::post('/admin/transactions/{id}/resolve-dispute', [AdminTransactionController::class, 'resolveDispute'])->name('admin.transactions.resolve-dispute');
    });

    Route::post('/auth/verify', [AuthController::class, 'verify'])->name('auth.verify');
    Route::post('/auth/logout', [AuthController::class, 'logout'])->name('auth.logout');
});

Route::post('/auth/signup', [AuthController::class, 'signup'])->name('auth.signup');
Route::post('/auth/login', [AuthController::class, 'login'])->name('auth.login');
