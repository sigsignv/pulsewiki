<?php

declare(strict_types=1);

namespace Pulsewiki\Store;

use Pulsewiki\Store\StoreInterface;

final class ChainStore implements StoreInterface
{
    private $stores;

    public function __construct(StoreInterface ...$stores)
    {
        if (empty($stores)) {
            throw new \InvalidArgumentException("At least one store must be required.");
        }

        $this->stores = $stores;
    }

    public function delete(string $key): void
    {
        foreach ($this->stores as $store) {
            if ($store->exists($key)) {
                $store->delete($key);
            }
        }
    }

    public function exists(string $key): bool
    {
        foreach ($this->stores as $store) {
            if ($store->exists($key)) {
                return true;
            }
        }
        return false;
    }

    public function load(string $key): string
    {
        foreach ($this->stores as $store) {
            if ($store->exists($key)) {
                return $store->load($key);
            }
        }
        throw new \RuntimeException("Key not found: {$key}");
    }

    public function save(string $key, string $content): void
    {
        $this->stores[0]->save($key, $content);
    }
}
