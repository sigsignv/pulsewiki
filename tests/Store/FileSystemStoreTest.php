<?php

declare(strict_types=1);

use PHPUnit\Framework\TestCase;
use Pulsewiki\Store\FileSystemStore;

final class FileSystemStoreTest extends TestCase
{
    private $basePath;

    protected function setUp(): void
    {
        $this->basePath = sys_get_temp_dir() . DIRECTORY_SEPARATOR . uniqid("test_filesystem_store_");
        mkdir($this->basePath);
    }

    protected function tearDown(): void
    {
        array_map('unlink', glob($this->basePath . '/*.txt'));
        rmdir($this->basePath);
    }

    public function testConstructorWithInvalidDirectory(): void
    {
        $this->expectException(\InvalidArgumentException::class);
        $store = new FileSystemStore($this->basePath . DIRECTORY_SEPARATOR . 'non_existent_directory');
    }

    public function testExistsReturnsFalseForNonExistentKey(): void
    {
        $store = new FileSystemStore($this->basePath);
        $this->assertFalse($store->exists('nonexistent'));
    }

    public function testExistsReturnsTrueForExistingKey(): void
    {
        // 46726F6E7450616765: bin2hex('FrontPage')
        $filePath = $this->basePath . DIRECTORY_SEPARATOR . '46726F6E7450616765.txt';
        file_put_contents($filePath, "* FrontPage\n");

        $store = new FileSystemStore($this->basePath);
        $this->assertTrue($store->exists('FrontPage'));
    }

    public function testLoadReturnsContentForExistingKey(): void
    {
        $filePath = $this->basePath . DIRECTORY_SEPARATOR . '46726F6E7450616765.txt';
        $content = "* FrontPage\n";
        file_put_contents($filePath, $content);

        $store = new FileSystemStore($this->basePath);
        $this->assertEquals($content, $store->load('FrontPage'));
    }

    public function testLoadThrowsExceptionForNonExistentKey(): void
    {
        $this->expectException(\RuntimeException::class);

        $store = new FileSystemStore($this->basePath);
        $store->load('nonexistent');
    }
}
