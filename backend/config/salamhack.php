<?php

return [
    'demo_config' => [
        'fee_percent' => (float) env('SALAMHACK_FEE_PERCENT', 2),
        'exchange_rate' => (float) env('SALAMHACK_EXCHANGE_RATE', 1.0),
        'rate_lock_minutes' => (int) env('SALAMHACK_RATE_LOCK_MINUTES', 15),
        'payment_window_minutes' => (int) env('SALAMHACK_PAYMENT_WINDOW_MINUTES', 1),
    ],
    'transaction_defaults' => [
        'source' => env('SALAMHACK_DEFAULT_SOURCE', 'Gaza'),
        'destination' => env('SALAMHACK_DEFAULT_DESTINATION', 'Egypt'),
    ],
    'admin_tokens' => array_values(array_filter(array_map(
        'trim',
        explode(',', (string) env('SALAMHACK_ADMIN_TOKENS', ''))
    ))),
    'transaction_id_prefix' => env('SALAMHACK_TX_ID_PREFIX', 'TR-'),
];
