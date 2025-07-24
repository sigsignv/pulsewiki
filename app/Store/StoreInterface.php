<?php

declare(strict_types=1);

namespace Pulsewiki\Store;

interface StoreInterface
{
    public function exists(string $key): bool;
    public function load(string $key): string;
    public function store(string $key, string $content): void;
}
