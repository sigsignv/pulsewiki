<?php

declare(strict_types=1);

namespace Pulsewiki\Store;

use Pulsewiki\Store\StoreInterface;

final class ArrayStore implements StoreInterface
{
    private $contents;

    public function __construct(array $contents = [])
    {
        foreach ($contents as $key => $value) {
            if (!is_string($key) || !is_string($value)) {
                throw new \InvalidArgumentException("Keys and values must be strings.");
            }
        }
        $this->contents = $contents;
    }

    public function exists(string $key): bool
    {
        return isset($this->contents[$key]);
    }

    public function load(string $key): string
    {
        if (!$this->exists($key)) {
            throw new \RuntimeException("Key not found: {$key}");
        }
        return $this->contents[$key];
    }

    public function save(string $key, string $content): void
    {
        $this->contents[$key] = $content;
    }
}
