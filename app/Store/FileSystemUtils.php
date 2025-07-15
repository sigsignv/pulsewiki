<?php

declare(strict_types=1);

namespace Pulsewiki\Store;

final class FileSystemUtils
{
    /**
     * Encode a string to uppercase hexadecimal.
     *
     * @param string $str The input string to encode.
     * @return string The encoded uppercase hexadecimal string.
     */
    public static function encode(string $str): string
    {
        return strtoupper(bin2hex($str));
    }
}
