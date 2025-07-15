<?php

use PHPUnit\Framework\TestCase;

class FuncTest extends TestCase
{
    protected function setUp(): void
    {
        require_once __DIR__ . '/../../lib/func.php';
    }

    public function testGetPregUDisable()
    {
        $this->assertEquals(get_preg_u(), '');
    }

    public function testGetPregUEnable()
    {
        define('PKWK_UTF8_ENABLE', 1);
        $this->assertEquals(get_preg_u(), 'u');
    }

    public function testEncodeAscii()
    {
        $this->assertEquals('', encode(''));
        $this->assertEquals('46726F6E7450616765', encode('FrontPage'));
        $this->assertEquals('466F726D617474696E6752756C6573', encode('FormattingRules'));
    }

    public function testEncodeUTF8()
    {
        $this->assertEquals('E38386E382B9E38388', encode('テスト'));
        $this->assertEquals('E697A5E69CACE8AA9E', encode('日本語'));
    }

    public function testEncodeEUCJP()
    {
        $this->assertEquals(
            'A5C6A5B9A5C8',
            encode(mb_convert_encoding('テスト', 'EUC-JP', 'UTF-8'))
        );
        $this->assertEquals(
            'C6FCCBDCB8EC',
            encode(mb_convert_encoding('日本語', 'EUC-JP', 'UTF-8'))
        );
    }

    public function testDecodeAscii()
    {
        $this->assertEquals('', decode(''));
        $this->assertEquals('FrontPage', decode('46726F6E7450616765'));
        $this->assertEquals('FormattingRules', decode('466F726D617474696E6752756C6573'));
    }

    public function testDecodeUTF8()
    {
        $this->assertEquals('テスト', decode('E38386E382B9E38388'));
        $this->assertEquals('日本語', decode('E697A5E69CACE8AA9E'));
    }

    public function testDecodeEUCJP()
    {
        $this->assertEquals(
            mb_convert_encoding('テスト', 'EUC-JP', 'UTF-8'),
            decode('A5C6A5B9A5C8')
        );
        $this->assertEquals(
            mb_convert_encoding('日本語', 'EUC-JP', 'UTF-8'),
            decode('C6FCCBDCB8EC')
        );
    }
}
