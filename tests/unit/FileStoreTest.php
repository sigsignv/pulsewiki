<?php

/**
 * This file is part of the PulseWiki project.
 *
 * Copyright (C) 2026  Sigsign
 *
 * This program is free software; you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation; either version 2 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with this program; if not, see <https://www.gnu.org/licenses/>.
 */

declare(strict_types=1);

use PHPUnit\Framework\Attributes\DataProvider;
use PHPUnit\Framework\TestCase;
use Pulsewiki\Store\FileStore;

final class FileStoreTest extends TestCase
{
    private string $dir;
    private FileStore $store;

    protected function setUp(): void
    {
        $this->dir = sys_get_temp_dir() . '/pulsewiki-file-store-' . bin2hex(random_bytes(8));
        self::assertTrue(mkdir($this->dir, 0o700));
        $this->store = new FileStore($this->dir);
    }

    protected function tearDown(): void
    {
        foreach (new FilesystemIterator($this->dir) as $entry) {
            if ($entry->isDir() && !$entry->isLink()) {
                rmdir($entry->getPathname());
            } else {
                unlink($entry->getPathname());
            }
        }

        rmdir($this->dir);
    }

    #[DataProvider('pageCases')]
    public function testHasFindsRegularFile(string $name, string $filename): void
    {
        file_put_contents($this->dir . '/' . $filename, 'wiki text...');

        self::assertTrue($this->store->has($name));
    }

    /** @return list<array{string, string}> */
    public static function pageCases(): array
    {
        return [
            ['FrontPage', '46726F6E7450616765.txt'],
            ['日本語', 'E697A5E69CACE8AA9E.txt'],
        ];
    }

    public function testHasReturnsFalseForMissingPage(): void
    {
        file_put_contents($this->dir . '/46726F6E7450616765.txt', 'wiki text...');

        self::assertFalse($this->store->has('MissingPage'));
    }

    public function testHasFindsEmptyFile(): void
    {
        touch($this->dir . '/46726F6E7450616765.txt');

        self::assertTrue($this->store->has('FrontPage'));
    }

    public function testHasReturnsFalseForDirectory(): void
    {
        mkdir($this->dir . '/46726F6E7450616765.txt');

        self::assertFalse($this->store->has('FrontPage'));
    }

    public function testHasAcceptsDirectoryWithTrailingSlash(): void
    {
        file_put_contents($this->dir . '/46726F6E7450616765.txt', 'wiki text...');
        $store = new FileStore($this->dir . '/');

        self::assertTrue($store->has('FrontPage'));
    }

    public function testHasDetectsNewlyCreatedPage(): void
    {
        self::assertFalse($this->store->has('FrontPage'));

        file_put_contents($this->dir . '/46726F6E7450616765.txt', 'wiki text...');

        self::assertTrue($this->store->has('FrontPage'));
    }

    public function testHasDetectsDeletedPage(): void
    {
        $path = $this->dir . '/46726F6E7450616765.txt';
        file_put_contents($path, 'wiki text...');

        self::assertTrue($this->store->has('FrontPage'));

        unlink($path);

        self::assertFalse($this->store->has('FrontPage'));
    }

    #[DataProvider('encodeCases')]
    public function testEncode(string $input, string $expected): void
    {
        self::assertSame($expected, FileStore::encode($input));
    }

    /** @return list<array{string, string}> */
    public static function encodeCases(): array
    {
        return [
            ['', ''],
            ['0', '30'],
            ['9', '39'],
            ['A', '41'],
            ['Z', '5A'],
            ['a', '61'],
            ['z', '7A'],
            ['FrontPage', '46726F6E7450616765'],
            ['Foo/Bar 1', '466F6F2F4261722031'],
            ['日本語', 'E697A5E69CACE8AA9E'],
        ];
    }
}
