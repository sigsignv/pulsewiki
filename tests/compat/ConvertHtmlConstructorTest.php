<?php

declare(strict_types=1);

use PHPUnit\Framework\Attributes\PreserveGlobalState;
use PHPUnit\Framework\Attributes\RunTestsInSeparateProcesses;
use PHPUnit\Framework\TestCase;

#[RunTestsInSeparateProcesses]
#[PreserveGlobalState(false)]
final class ConvertHtmlConstructorTest extends TestCase
{
    protected function setUp(): void
    {
        require_once __DIR__ . '/support/WikiConversionFixture.php';
        WikiConversionFixture::load();
    }

    public function testElement(): void
    {
        $element = new Element();

        $this->assertInitializedElement(Element::class, $element);
        self::assertSame([], $element->elements);
        self::assertSame($element, $element->last);
    }

    public function testInline(): void
    {
        $element = new Inline('text');

        $this->assertInitializedElement(Inline::class, $element);
        self::assertCount(1, $element->elements);
    }

    public function testParagraph(): void
    {
        $element = new Paragraph('text');

        $this->assertInitializedElement(Paragraph::class, $element);
        self::assertSame('', $element->param);
        self::assertInstanceOf(Inline::class, $element->elements[0]);
    }

    public function testParagraphWithParam(): void
    {
        $element = new Paragraph('text', ' class="sample"');

        $this->assertInitializedElement(Paragraph::class, $element);
        self::assertSame(' class="sample"', $element->param);
        self::assertInstanceOf(Inline::class, $element->elements[0]);
    }

    public function testHeading(): void
    {
        $root = new Body(1);
        $element = new Heading($root, '*heading');

        $this->assertInitializedElement(Heading::class, $element);
        self::assertSame(2, $element->level);
        self::assertInstanceOf(Inline::class, $element->elements[0]);
        self::assertInstanceOf(Contents_UList::class, $root->contents->elements[0]);
    }

    public function testHRule(): void
    {
        $root = new Body(1);
        $element = new HRule($root, '----');

        $this->assertInitializedElement(HRule::class, $element);
        self::assertSame([], $element->elements);
        self::assertSame($element, $element->last);
    }

    public function testListContainer(): void
    {
        $element = new ListContainer('ul', 'li', '-', '-item');

        $this->assertInitializedElement(ListContainer::class, $element);
        self::assertSame('ul', $element->tag);
        self::assertSame('li', $element->tag2);
        self::assertSame(1, $element->level);
        self::assertInstanceOf(ListElement::class, $element->elements[0]);
    }

    public function testListElement(): void
    {
        $element = new ListElement(1, 'li');

        $this->assertInitializedElement(ListElement::class, $element);
        self::assertSame(1, $element->level);
        self::assertSame('li', $element->head);
    }

    public function testUList(): void
    {
        $root = new Body(1);
        $element = new UList($root, '-item');

        $this->assertInitializedElement(UList::class, $element);
        self::assertSame('ul', $element->tag);
        self::assertSame(1, $element->level);
        self::assertInstanceOf(ListElement::class, $element->elements[0]);
    }

    public function testOList(): void
    {
        $root = new Body(1);
        $element = new OList($root, '+item');

        $this->assertInitializedElement(OList::class, $element);
        self::assertSame('ol', $element->tag);
        self::assertSame(1, $element->level);
        self::assertInstanceOf(ListElement::class, $element->elements[0]);
    }

    public function testDList(): void
    {
        $element = new DList([':term', 'description']);

        $this->assertInitializedElement(DList::class, $element);
        self::assertSame('dl', $element->tag);
        self::assertCount(2, $element->elements);
        self::assertInstanceOf(ListElement::class, $element->elements[1]);
        self::assertSame('dd', $element->elements[1]->head);
    }

    public function testBQuote(): void
    {
        $root = new Body(1);
        $element = new BQuote($root, '>quote');

        $this->assertInitializedElement(BQuote::class, $element);
        self::assertSame(1, $element->level);
        self::assertInstanceOf(Paragraph::class, $element->elements[0]);
    }

    public function testTableCell(): void
    {
        $element = new TableCell('cell');

        $this->assertInitializedElement(TableCell::class, $element);
        self::assertSame([], $element->style);
        self::assertInstanceOf(Inline::class, $element->elements[0]);
    }

    public function testTableCellWithTemplate(): void
    {
        $element = new TableCell('cell', true);

        $this->assertInitializedElement(TableCell::class, $element);
        self::assertSame([], $element->style);
        self::assertInstanceOf(Inline::class, $element->elements[0]);
    }

    public function testTable(): void
    {
        $element = new Table(['|cell|', 'cell', '']);

        $this->assertInitializedElement(Table::class, $element);
        self::assertSame(1, $element->col);
        self::assertSame('', $element->type);
        self::assertInstanceOf(TableCell::class, $element->elements[0][0]);
    }

    public function testYTable(): void
    {
        $element = new YTable(['cell1', 'cell2']);

        $this->assertInitializedElement(YTable::class, $element);
        self::assertSame(2, $element->col);
        self::assertCount(1, $element->elements);
    }

    public function testYTableWithDefaultRow(): void
    {
        $element = new YTable();

        $this->assertInitializedElement(YTable::class, $element);
        self::assertSame(3, $element->col);
        self::assertCount(1, $element->elements);
    }

    public function testPre(): void
    {
        $root = new Body(1);
        $element = new Pre($root, ' text');

        $this->assertInitializedElement(Pre::class, $element);
        self::assertCount(1, $element->elements);
    }

    public function testDiv(): void
    {
        $element = new Div(['#test(arg)', 'test', 'arg']);

        $this->assertInitializedElement(Div::class, $element);
        self::assertSame('test', $element->name);
        self::assertSame('arg', $element->param);
    }

    public function testAlign(): void
    {
        $element = new Align('left');

        $this->assertInitializedElement(Align::class, $element);
        self::assertSame('left', $element->align);
    }

    public function testBody(): void
    {
        $element = new Body(7);

        $this->assertInitializedElement(Body::class, $element);
        self::assertSame(7, $element->id);
        self::assertInstanceOf(Element::class, $element->contents);
        self::assertSame($element->contents, $element->contents_last);
    }

    public function testContentsUList(): void
    {
        $element = new Contents_UList('heading', 1, 'anchor');

        $this->assertInitializedElement(Contents_UList::class, $element);
        self::assertSame('ul', $element->tag);
        self::assertSame(1, $element->level);
        self::assertInstanceOf(ListElement::class, $element->elements[0]);
    }

    /** @param class-string<Element> $className */
    private function assertInitializedElement(string $className, Element $element): void
    {
        self::assertInstanceOf($className, $element);
        self::assertIsArray($element->elements);
        self::assertInstanceOf(Element::class, $element->last);
    }
}
