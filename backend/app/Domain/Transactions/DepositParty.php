<?php

namespace App\Domain\Transactions;

enum DepositParty: string
{
    case A = 'A';
    case B = 'B';
}
