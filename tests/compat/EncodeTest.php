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
use PHPUnit\Framework\Attributes\PreserveGlobalState;
use PHPUnit\Framework\Attributes\RunTestsInSeparateProcesses;
use PHPUnit\Framework\TestCase;

#[RunTestsInSeparateProcesses]
#[PreserveGlobalState(false)]
final class EncodeTest extends TestCase
{
    protected function setUp(): void
    {
        require_once __DIR__ . '/../../lib/func.php';
    }

    #[DataProvider('encodeCases')]
    public function testEncode(string $input, string $expected): void
    {
        self::assertSame($expected, encode($input));
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
            ["\x00\x0F\x10\x7F\x80\xFF", '000F107F80FF'],
        ];
    }

    public function testEncodeConvertsNonStringValues(): void
    {
        self::assertSame('', encode(null));
        self::assertSame('', encode(false));
        self::assertSame('31', encode(true));
        self::assertSame('30', encode(0));
        self::assertSame('313233', encode(123));
    }
}
