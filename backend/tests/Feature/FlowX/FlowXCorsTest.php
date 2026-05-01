<?php

it('allows patch preflight for FlowX resources from configured frontend origin', function (): void {
    config()->set('cors.allowed_origins', ['http://localhost:5000']);

    $this->withHeaders([
        'Origin' => 'http://localhost:5000',
        'Access-Control-Request-Method' => 'PATCH',
    ])->options('/users/usr-user')
        ->assertHeader('Access-Control-Allow-Origin', 'http://localhost:5000');
});
