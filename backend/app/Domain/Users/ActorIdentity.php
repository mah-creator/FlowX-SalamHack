<?php

namespace App\Domain\Users;

final readonly class ActorIdentity
{
    public function __construct(
        public string $id,
        public bool $isAdmin,
    ) {}

    public static function fromBearerToken(string $token, array $adminTokens): self
    {
        if (str_starts_with($token, 'usr-')) {
            return new self($token, $adminTokens === [] || in_array($token, $adminTokens, true));
        }

        return new self(
            'usr-'.substr(hash('sha256', $token), 0, 12),
            $adminTokens === [] || in_array($token, $adminTokens, true),
        );
    }
}
