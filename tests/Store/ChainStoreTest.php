<?php

declare(strict_types=1);

use PHPUnit\Framework\TestCase;
use Pulsewiki\Store\ArrayStore;
use Pulsewiki\Store\ChainStore;

final class ChainStoreTest extends TestCase
{
    public function testConstructorWithEmptyStoresThrowsException(): void
    {
        $this->expectException(\InvalidArgumentException::class);
        $this->expectExceptionMessage("At least one store must be required.");

        new ChainStore();
    }

    public function testExistsReturnsTrueWhenKeyFoundInFirstStore(): void
    {
        $store1 = new ArrayStore(['key' => 'value']);
        $store2 = new ArrayStore();

        $chainStore = new ChainStore($store1, $store2);
        $this->assertTrue($chainStore->exists('key'));
    }

    public function testExistsReturnsTrueWhenKeyFoundInSecondStore(): void
    {
        $store1 = new ArrayStore();
        $store2 = new ArrayStore(['key' => 'value']);

        $chainStore = new ChainStore($store1, $store2);
        $this->assertTrue($chainStore->exists('key'));
    }

    public function testExistsReturnsFalseWhenKeyNotFoundInAnyStore(): void
    {
        $store1 = new ArrayStore();
        $store2 = new ArrayStore();

        $chainStore = new ChainStore($store1, $store2);
        $this->assertFalse($chainStore->exists('key'));
    }

    public function testLoadReturnsContentFromFirstStoreWhenKeyExists(): void
    {
        $store1 = new ArrayStore(['key' => 'value from store1']);
        $store2 = new ArrayStore();

        $chainStore = new ChainStore($store1, $store2);
        $this->assertSame('value from store1', $chainStore->load('key'));
    }

    public function testLoadReturnsContentFromSecondStoreWhenKeyExistsOnlyThere(): void
    {
        $store1 = new ArrayStore();
        $store2 = new ArrayStore(['key' => 'value from store2']);

        $chainStore = new ChainStore($store1, $store2);
        $this->assertSame('value from store2', $chainStore->load('key'));
    }

    public function testLoadThrowsExceptionWhenKeyNotFoundInAnyStore(): void
    {
        $store1 = new ArrayStore();
        $store2 = new ArrayStore();

        $chainStore = new ChainStore($store1, $store2);

        $this->expectException(\RuntimeException::class);
        $chainStore->load('key');
    }

    public function testStoreCallsFirstStoreOnly(): void
    {
        $store1 = new ArrayStore();
        $store2 = new ArrayStore();

        $chainStore = new ChainStore($store1, $store2);
        $chainStore->store('key', 'value');

        $this->assertTrue($store1->exists('key'));
        $this->assertFalse($store2->exists('key'));
    }
}
