<?php

declare(strict_types=1);

use PHPUnit\Framework\Attributes\DataProvider;
use PHPUnit\Framework\Attributes\PreserveGlobalState;
use PHPUnit\Framework\Attributes\RunTestsInSeparateProcesses;
use PHPUnit\Framework\TestCase;

#[RunTestsInSeparateProcesses]
#[PreserveGlobalState(false)]
final class ConfigConstructorTest extends TestCase
{
    protected function setUp(): void
    {
        require_once __DIR__ . '/../../lib/config.php';
    }

    public function testConfig(): void
    {
        $config = new Config('plugin/test');

        self::assertInstanceOf(Config::class, $config);
        self::assertSame('plugin/test', $config->name);
        self::assertSame(':config/plugin/test', $config->page);
    }

    /** @param class-string<ConfigTable> $className */
    #[DataProvider('configTableClasses')]
    public function testConfigTable(string $className): void
    {
        $table = new $className('*title');

        self::assertInstanceOf($className, $table);
        self::assertSame('title', $table->title);
        self::assertSame(['*title'], $table->before);
    }

    /** @param class-string<ConfigTable> $className */
    #[DataProvider('configTableClasses')]
    public function testConfigTableWithSource(string $className): void
    {
        $source = new ConfigTable('*source');
        $table = new $className('*ignored', $source);

        self::assertInstanceOf($className, $table);
        self::assertSame('source', $table->title);
        self::assertSame(['*source'], $table->before);
    }

    /** @return array<string, array{class-string<ConfigTable>}> */
    public static function configTableClasses(): array
    {
        return [
            'ConfigTable' => [ConfigTable::class],
            'ConfigTable_Sequential' => [ConfigTable_Sequential::class],
            'ConfigTable_Direct' => [ConfigTable_Direct::class],
        ];
    }
}
