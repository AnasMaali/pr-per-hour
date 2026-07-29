<?php

declare(strict_types=1);

namespace App\Enums;

enum PaymentMethod: string
{
    case Card = 'card';
    case BankTransfer = 'bank_transfer';
    case Cash = 'cash';
    case Wallet = 'wallet';
}
