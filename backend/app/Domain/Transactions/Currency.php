<?php

namespace App\Domain\Transactions;

enum Currency: string
{
    case USD = 'USD';
    case EGP = 'EGP';
    case ILS = 'ILS';
}
