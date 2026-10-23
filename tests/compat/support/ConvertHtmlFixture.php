<?php

declare(strict_types=1);

final class ConvertHtmlFixture
{
    public static function load(): void
    {
        define('CONTENT_CHARSET', 'UTF-8');

        $GLOBALS['vars'] = ['page' => 'ConstructorTest'];
        $GLOBALS['autolink'] = false;
        $GLOBALS['autoalias'] = false;
        $GLOBALS['aliaspage'] = 'AutoAliasName';
        $GLOBALS['nowikiname'] = false;
        // Copy only the name patterns from lib/init.php, without booting the application.
        $GLOBALS['WikiName'] = '(?:[A-Z][a-z]+){2,}(?!\w)';
        $GLOBALS['BracketName'] = '(?!\s):?[^\r\n\t\f\[\]<>#&":]+:?(?<!\s)';
        $GLOBALS['NotePattern'] = '/\(\(.*?\)\)/';
        $GLOBALS['line_rules'] = [];
        $GLOBALS['_symbol_noexists'] = '';
        $GLOBALS['_symbol_anchor'] = '';
        $GLOBALS['top'] = '';
        $GLOBALS['preformat_ltrim'] = false;

        require_once __DIR__ . '/../../../lib/func.php';
        require_once __DIR__ . '/../../../lib/html.php';
        require_once __DIR__ . '/../../../lib/make_link.php';
        require_once __DIR__ . '/../../../lib/convert_html.php';
    }
}
