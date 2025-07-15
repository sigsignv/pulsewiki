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

    /**
     * Decode a hexadecimal string to original string.
     *
     * @param string $str The input hexadecimal string to decode.
     * @return string The decoded string.
     */
    public static function decode(string $str): string
    {
        return hex2bin($str);
    }
}
