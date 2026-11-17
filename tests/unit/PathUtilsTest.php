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
use Pulsewiki\Utils\PathUtils;

final class PathUtilsTest extends TestCase
{
    #[DataProvider('joinCases')]
    public function testJoin(array $parts, string $expected): void
    {
        self::assertSame($expected, PathUtils::join(...$parts));
    }

    /** @return list<array{list<string>, string}> */
    public static function joinCases(): array
    {
        return [
            [[], ''],
            [['', ''], ''],
            [['/var', 'log', 'app.log'], '/var/log/app.log'],
            [['path', 'to', 'app.log'], 'path/to/app.log'],
            [['/', 'var//', '/log///app.log'], '/var/log/app.log'],
            [['/var//log/'], '/var/log'],
            [['', '///', '//', '/', ''], '/'],
            [['foo', '///'], 'foo'],
            [['', 'path', '', 'to', ''], 'path/to'],
            [['/var', '.', 'tmp', '..', 'log'], '/var/./tmp/../log'],
        ];
    }
}
