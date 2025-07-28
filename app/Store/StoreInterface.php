<?php

declare(strict_types=1);

namespace Pulsewiki\Store;

interface StoreInterface
{
    public function delete(string $key): void;
    public function exists(string $key): bool;
    public function load(string $key): string;
    public function save(string $key, string $content): void;
}
