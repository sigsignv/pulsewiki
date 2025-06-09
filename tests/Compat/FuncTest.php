<?php

use PHPUnit\Framework\TestCase;

class FuncTest extends TestCase
{
    protected function setUp(): void
    {
        require_once __DIR__ . '/../../lib/func.php';
    }

    public function testGetPregU()
    {
        define('PKWK_UTF8_ENABLE', 1);
        $this->assertEquals(get_preg_u(), 'u');
    }
}
