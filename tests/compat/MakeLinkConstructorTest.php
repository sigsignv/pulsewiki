<?php

declare(strict_types=1);

use PHPUnit\Framework\Attributes\DataProvider;
use PHPUnit\Framework\Attributes\PreserveGlobalState;
use PHPUnit\Framework\Attributes\RunTestsInSeparateProcesses;
use PHPUnit\Framework\TestCase;

#[RunTestsInSeparateProcesses]
#[PreserveGlobalState(false)]
final class MakeLinkConstructorTest extends TestCase
{
    protected function setUp(): void
    {
        require_once __DIR__ . '/support/WikiConversionFixture.php';
        WikiConversionFixture::load();
    }

    /** @param class-string<Link> $className */
    #[DataProvider('linkClasses')]
    public function testLink(string $className): void
    {
        $link = new $className(7);

        self::assertInstanceOf($className, $link);
        self::assertSame(7, $link->start);
    }

    /** @return array<string, array{class-string<Link>}> */
    public static function linkClasses(): array
    {
        return [
            'Link' => [Link::class],
            'Link_plugin' => [Link_plugin::class],
            'Link_note' => [Link_note::class],
            'Link_url' => [Link_url::class],
            'Link_url_interwiki' => [Link_url_interwiki::class],
            'Link_mailto' => [Link_mailto::class],
            'Link_interwikiname' => [Link_interwikiname::class],
            'Link_bracketname' => [Link_bracketname::class],
            'Link_wikiname' => [Link_wikiname::class],
            'Link_autolink' => [Link_autolink::class],
            'Link_autolink_a' => [Link_autolink_a::class],
            'Link_autoalias' => [Link_autoalias::class],
            'Link_autoalias_a' => [Link_autoalias_a::class],
        ];
    }

    /**
     * @param list<list<string>> $arguments
     * @param list<class-string<Link>> $expectedClassNames
     */
    #[DataProvider('inlineConverterCases')]
    public function testInlineConverter(array $arguments, array $expectedClassNames): void
    {
        $converter = new InlineConverter(...$arguments);

        self::assertInstanceOf(InlineConverter::class, $converter);
        self::assertIsArray($converter->converters);
        self::assertSame(
            $expectedClassNames,
            array_values(array_map(static fn(Link $link): string => $link::class, $converter->converters)),
        );
        self::assertIsString($converter->pattern);
        if ($expectedClassNames === []) {
            self::assertSame('', $converter->pattern);
        } else {
            self::assertNotSame('', $converter->pattern);
        }
    }

    /** @return array<string, array{list<list<string>>, list<class-string<Link>>}> */
    public static function inlineConverterCases(): array
    {
        return [
            'default converters' => [
                [],
                [
                    Link_plugin::class,
                    Link_note::class,
                    Link_url::class,
                    Link_url_interwiki::class,
                    Link_mailto::class,
                    Link_interwikiname::class,
                    Link_bracketname::class,
                    Link_wikiname::class,
                ],
            ],
            'selected converters' => [
                [['url', 'mailto']],
                [Link_url::class, Link_mailto::class],
            ],
            'excluded converter' => [
                [['url', 'mailto'], ['mailto']],
                [Link_url::class],
            ],
            'empty converters' => [
                [[]],
                [],
            ],
        ];
    }
}
