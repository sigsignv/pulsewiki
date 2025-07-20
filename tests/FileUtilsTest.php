<?php

use PHPUnit\Framework\TestCase;
use Pulsewiki\FileUtils;

class FileUtilsTest extends TestCase
{
    private string $filePath;

    protected function setUp(): void
    {
        $this->filePath = sys_get_temp_dir() . '/test_FileUtils.txt';
    }

    protected function tearDown(): void
    {
        if (file_exists($this->filePath)) {
            unlink($this->filePath);
        }
    }

    public function testGetContentReadsEntireFile()
    {
        $expected = "line1\nline2\nline3\n";
        file_put_contents($this->filePath, $expected, LOCK_EX);

        $actual = FileUtils::getContent($this->filePath);
        $this->assertSame($expected, $actual);
    }

    public function testGetContentEmptyFile()
    {
        file_put_contents($this->filePath, '', LOCK_EX);

        $actual = FileUtils::getContent($this->filePath);
        $this->assertSame('', $actual);
    }

    public function testGetContentWithLength()
    {
        $expected = "line1\nline2\nline3\n";
        file_put_contents($this->filePath, $expected, LOCK_EX);

        $actual = FileUtils::getContent($this->filePath, 6);
        $this->assertSame("line1\n", $actual);
    }

    public function testGetContentWithOffset()
    {
        $expected = "line1\nline2\nline3\n";
        file_put_contents($this->filePath, $expected, LOCK_EX);

        $actual = FileUtils::getContent($this->filePath, 6, 6);
        $this->assertSame("line2\n", $actual);
    }

    public function testGetContentThrowsIfFileDoesNotExist()
    {
        $this->expectException(\RuntimeException::class);
        FileUtils::getContent($this->filePath);
    }

    public function testReadLinesYieldsAllLines()
    {
        $expected = ["line1\n", "line2\n", "line3\n"];
        file_put_contents($this->filePath, implode('', $expected), LOCK_EX);

        $actual = iterator_to_array(FileUtils::readLines($this->filePath));
        $this->assertSame($expected, $actual);
    }

    public function testReadLinesEmptyFile()
    {
        file_put_contents($this->filePath, '', LOCK_EX);

        $actual = iterator_to_array(FileUtils::readLines($this->filePath));
        $this->assertSame([], $actual);
    }

    public function testReadLinesThrowsIfFileDoesNotExist()
    {
        $this->expectException(\RuntimeException::class);
        iterator_to_array(FileUtils::readLines($this->filePath));
    }

    public function testReadLinesReleasesLockOnGeneratorDestruction()
    {
        $content = "line1\nline2\nline3\n";
        file_put_contents($this->filePath, $content, LOCK_EX);

        $generator = FileUtils::readLines($this->filePath);
        foreach ($generator as $line) {
            break;
        }
        unset($generator);

        $fp = fopen($this->filePath, 'rb');
        $this->assertTrue(flock($fp, LOCK_EX | LOCK_NB));
        fclose($fp);
    }
}
