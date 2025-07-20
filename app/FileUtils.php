<?php

declare(strict_types=1);

namespace Pulsewiki;

final class FileUtils
{
    /**
     * Read file content with a shared lock.
     *
     * @param string $filePath Path to the file.
     * @param int|null $length Maximum bytes to read, or null for no limit.
     * @param int $offset Offset to start reading from.
     * @return string Content read from the file.
     * @throws \RuntimeException If the file cannot be opened, locked, or read.
     */
    public static function getContent(string $filePath, ?int $length = null, int $offset = 0): string
    {
        $fp = @fopen($filePath, 'rb');
        if ($fp === false) {
            throw new \RuntimeException("Failed to open file: {$filePath}");
        }

        try {
            if (!flock($fp, LOCK_SH)) {
                throw new \RuntimeException("Failed to lock file: {$filePath}");
            }
            $content = stream_get_contents($fp, $length, $offset);
            if ($content === false) {
                throw new \RuntimeException("Failed to read file: {$filePath}");
            }
        } finally {
            flock($fp, LOCK_UN);
            fclose($fp);
        }

        return $content;
    }

    /**
     * Read lines from a file using a generator.
     *
     * @param string $filePath Path to the file.
     * @return iterable<string> Each line from the file.
     * @throws \RuntimeException If the file cannot be opened, locked, or read.
     */
    public static function readLines(string $filePath): iterable
    {
        $fp = @fopen($filePath, 'rb');
        if ($fp === false) {
            throw new \RuntimeException("Failed to open file: {$filePath}");
        }

        try {
            if (!flock($fp, LOCK_SH)) {
                throw new \RuntimeException("Failed to lock file: {$filePath}");
            }
            while (($line = fgets($fp)) !== false) {
                yield $line;
            }
            if (!feof($fp)) {
                throw new \RuntimeException("Error reading file: {$filePath}");
            }
        } finally {
            flock($fp, LOCK_UN);
            fclose($fp);
        }
    }
}
