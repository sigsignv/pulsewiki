<?php
/**
 * PukiWiki - Yet another WikiWikiWeb clone.
 *
 * Copyright (C) 2003-2005  PukiWiki Developers Team
 * Copyright (C) 2026  Sigsign
 *
 * License: GPL v2 or (at your option) any later version
 */

/*
 * This file originally provided a partial polyfill for the mbstring
 * extension. PulseWiki does not provide a polyfill.
 */
if (!extension_loaded('mbstring')) {
    http_response_code(500);
    exit('PulseWiki requires the mbstring extension.');
}
