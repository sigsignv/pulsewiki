<?php

declare(strict_types=1);

namespace Pulsewiki\Store;

use Pulsewiki\FileUtils;
use Pulsewiki\Store\FileSystemUtils;
use Pulsewiki\Store\StoreInterface;

final class FileSystemStore implements StoreInterface
{
    private $basePath;

    public function __construct(string $basePath)
    {
        if (!is_dir($basePath)) {
            throw new \InvalidArgumentException("This path is not a directory: $basePath");
        }
        $this->basePath = rtrim($basePath, DIRECTORY_SEPARATOR);
    }

    public function delete(string $key): void
    {
        throw new \RuntimeException("Not implemented yet");
    }

    public function exists(string $key): bool
    {
        $filePath = $this->getFilePath($key);
        return is_file($filePath);
    }

    public function load(string $key): string
    {
        if (!$this->exists($key)) {
            throw new \RuntimeException("Key not found: $key");
        }
        $filePath = $this->getFilePath($key);
        return FileUtils::getContent($filePath);
    }

    public function save(string $key, string $content): void
    {
        throw new \RuntimeException("Not implemented yet");
    }

    private function getFilePath(string $key): string
    {
        $filename = FileSystemUtils::encode($key) . '.txt';
        return $this->basePath . DIRECTORY_SEPARATOR . $filename;
    }
}
