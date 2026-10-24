<?php

declare(strict_types=1);

use PHPUnit\Framework\Attributes\PreserveGlobalState;
use PHPUnit\Framework\Attributes\RunTestsInSeparateProcesses;
use PHPUnit\Framework\TestCase;

#[RunTestsInSeparateProcesses]
#[PreserveGlobalState(false)]
final class DiffConstructorTest extends TestCase
{
    protected function setUp(): void
    {
        require_once __DIR__ . '/../../lib/diff.php';
    }

    public function testLineDiffWithDefaultMarkers(): void
    {
        $diff = new line_diff();

        self::assertInstanceOf(line_diff::class, $diff);
        self::assertSame('+', $diff->plus);
        self::assertSame('-', $diff->minus);
        self::assertSame(' ', $diff->equal);
    }

    public function testLineDiffWithCustomMarkers(): void
    {
        $diff = new line_diff('ADD', 'DEL', 'SAME');

        self::assertInstanceOf(line_diff::class, $diff);
        self::assertSame('ADD', $diff->plus);
        self::assertSame('DEL', $diff->minus);
        self::assertSame('SAME', $diff->equal);
    }

    public function testDiffLine(): void
    {
        $line = new DiffLine('line');

        self::assertInstanceOf(DiffLine::class, $line);
        self::assertSame("line\n", $line->text);
        self::assertSame([], $line->status);
    }
}
