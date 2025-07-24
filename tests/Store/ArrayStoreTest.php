<?php

declare(strict_types=1);

use PHPUnit\Framework\TestCase;
use Pulsewiki\Store\ArrayStore;

final class ArrayStoreTest extends TestCase
{
    public function testConstructorWithInvalidKeyThrowsException(): void
    {
        $this->expectException(\InvalidArgumentException::class);
        $this->expectExceptionMessage('Keys and values must be strings.');

        new ArrayStore([123 => 'value']);
    }

    public function testConstructorWithInvalidValueThrowsException(): void
    {
        $this->expectException(\InvalidArgumentException::class);
        $this->expectExceptionMessage('Keys and values must be strings.');

        new ArrayStore(['key' => 123]);
    }

    public function testExistsReturnsTrueForExistingKey(): void
    {
        $store = new ArrayStore(['key' => 'value']);

        $this->assertTrue($store->exists('key'));
    }

    public function testExistsReturnsFalseForNonExistingKey(): void
    {
        $store = new ArrayStore(['key' => 'value']);

        $this->assertFalse($store->exists('non-existing-key'));
    }

    public function testLoadReturnsCorrectValue(): void
    {
        $store = new ArrayStore(['key' => 'value']);

        $this->assertEquals('value', $store->load('key'));
    }

    public function testLoadThrowsExceptionForNonExistingKey(): void
    {
        $store = new ArrayStore();

        $this->expectException(\RuntimeException::class);
        $this->expectExceptionMessage('Key not found: non-existing-key');

        $store->load('non-existing-key');
    }

    public function testStoreAddsNewKeyValue(): void
    {
        $store = new ArrayStore();

        $store->store('key', 'value');

        $this->assertTrue($store->exists('key'));
        $this->assertEquals('value', $store->load('key'));
    }

    public function testStoreOverwritesExistingValue(): void
    {
        $store = new ArrayStore(['key' => 'value']);

        $store->store('key', 'newValue');

        $this->assertEquals('newValue', $store->load('key'));
    }
}
