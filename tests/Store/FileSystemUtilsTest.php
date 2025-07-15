<?php

use PHPUnit\Framework\TestCase;
use Pulsewiki\Store\FileSystemUtils;

final class FileSystemUtilsTest extends TestCase
{
    public function testEncodeAscii()
    {
        $this->assertEquals(
            '46726F6E7450616765',
            FileSystemUtils::encode('FrontPage')
        );
        $this->assertEquals(
            '466F726D617474696E6752756C6573',
            FileSystemUtils::encode('FormattingRules')
        );
    }

    public function testEncodeUTF8()
    {
        $this->assertEquals(
            'E38386E382B9E38388',
            FileSystemUtils::encode('テスト')
        );
        $this->assertEquals(
            'E697A5E69CACE8AA9E',
            FileSystemUtils::encode('日本語')
        );
    }

    public function testEncodeEUCJP()
    {
        $this->assertEquals(
            'A5C6A5B9A5C8',
            FileSystemUtils::encode(mb_convert_encoding('テスト', 'EUC-JP', 'UTF-8'))
        );
        $this->assertEquals(
            'C6FCCBDCB8EC',
            FileSystemUtils::encode(mb_convert_encoding('日本語', 'EUC-JP', 'UTF-8'))
        );
    }

    public function testDecodeAscii()
    {
        $this->assertEquals(
            'FrontPage',
            FileSystemUtils::decode('46726F6E7450616765')
        );
        $this->assertEquals(
            'FormattingRules',
            FileSystemUtils::decode('466F726D617474696E6752756C6573')
        );
    }

    public function testDecodeUTF8()
    {
        $this->assertEquals(
            'テスト',
            FileSystemUtils::decode('E38386E382B9E38388')
        );
        $this->assertEquals(
            '日本語',
            FileSystemUtils::decode('E697A5E69CACE8AA9E')
        );
    }

    public function testDecodeEUCJP()
    {
        $this->assertEquals(
            mb_convert_encoding('テスト', 'EUC-JP', 'UTF-8'),
            FileSystemUtils::decode('A5C6A5B9A5C8')
        );
        $this->assertEquals(
            mb_convert_encoding('日本語', 'EUC-JP', 'UTF-8'),
            FileSystemUtils::decode('C6FCCBDCB8EC')
        );
    }

    public function testDecodeFailed()
    {
        $this->expectException(\InvalidArgumentException::class);
        @FileSystemUtils::decode('InvalidHexString');
    }
}
