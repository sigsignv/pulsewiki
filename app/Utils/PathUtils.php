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

namespace Pulsewiki\Utils;

final class PathUtils
{
    /**
     * Join path strings into a path.
     *
     * Empty strings are ignored, and repeated slashes are collapsed.
     * Trailing slashes are removed except for the root path.
     */
    public static function join(string ...$paths): string
    {
        $paths = array_filter($paths, fn($p) => $p !== '');
        $path = implode('/', $paths);
        $path = preg_replace('/\/{2,}/', '/', $path);

        return $path === '/' ? $path : rtrim($path, '/');
    }

    /**
     * Encode a string as uppercase hexadecimal.
     */
    public static function encode(string $key): string
    {
        return strtoupper(bin2hex($key));
    }
}
