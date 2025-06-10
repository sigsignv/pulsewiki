<?php
// PukiWiki - Yet another WikiWikiWeb clone.
// skin.php
// Copyright
//   2002-2022 PukiWiki Development Team
//   2001-2002 Originally written by yu-ji
// License: GPL v2 or (at your option) any later version
//

function render($title, $page, $body)
{
	global $vars, $arg, $defaultpage, $whatsnew, $help_page, $hr;
	global $attach_link, $related_link, $cantedit, $function_freeze;
	global $search_word_color, $_msg_word, $foot_explain, $note_hr, $head_tags;
	global $javascript, $nofollow;
	global $_LANG, $_LINK, $_IMAGE;
	global $auth_type, $auth_user;
	global $html_meta_referrer_policy;

	global $pkwk_dtd;     // XHTML 1.1, XHTML1.0, HTML 4.01 Transitional...
	global $page_title;   // Title of this site
	global $do_backup;    // Do backup or not
	global $modifier;     // Site administrator's  web page
	global $modifierlink; // Site administrator's name

	$script = get_base_uri();
	$enable_login = false;
	$enable_logout = false;
	if (AUTH_TYPE_FORM === $auth_type || AUTH_TYPE_EXTERNAL === $auth_type ||
		AUTH_TYPE_SAML === $auth_type) {
		if ($auth_user) {
			$enable_logout = true;
		} else {
			$enable_login = true;
		}
	} else if (AUTH_TYPE_BASIC === $auth_type) {
		if ($auth_user) {
			$enable_logout = true;
		}
	}
	if (! file_exists(SKIN_FILE) || ! is_readable(SKIN_FILE))
		die_message('SKIN_FILE is not found');

	$_LINK = $_IMAGE = array();

	$_page  = isset($vars['page']) ? $vars['page'] : '';
	$r_page = pagename_urlencode($_page);
	$is_edit_preview = isset($vars['preview']);
	// Canonical URL
	$canonical_url = get_page_uri($_page, PKWK_URI_ABSOLUTE);

	// Set $_LINK for skin
	$_LINK['add']      = "$script?cmd=add&amp;page=$r_page";
	$_LINK['backup']   = "$script?cmd=backup&amp;page=$r_page";
	$_LINK['copy']     = "$script?plugin=template&amp;refer=$r_page";
	$_LINK['diff']     = "$script?cmd=diff&amp;page=$r_page";
	$_LINK['edit']     = "$script?cmd=edit&amp;page=$r_page";
	$_LINK['filelist'] = "$script?cmd=filelist";
	$_LINK['freeze']   = "$script?cmd=freeze&amp;page=$r_page";
	$_LINK['help']     = get_page_uri($help_page);
	$_LINK['list']     = "$script?cmd=list";
	$_LINK['new']      = "$script?plugin=newpage&amp;refer=$r_page";
	$_LINK['rdf']      = "$script?cmd=rss&amp;ver=1.0";
	$_LINK['recent']   = get_page_uri($whatsnew);
	$_LINK['reload']   = get_page_uri($_page);
	$_LINK['rename']   = "$script?plugin=rename&amp;refer=$r_page";
	$_LINK['rss']      = "$script?cmd=rss";
	$_LINK['rss10']    = "$script?cmd=rss&amp;ver=1.0"; // Same as 'rdf'
	$_LINK['rss20']    = "$script?cmd=rss&amp;ver=2.0";
	$_LINK['search']   = "$script?cmd=search";
	$_LINK['top']      = get_base_uri();
	$_LINK['unfreeze'] = "$script?cmd=unfreeze&amp;page=$r_page";
	$_LINK['upload']   = "$script?plugin=attach&amp;pcmd=upload&amp;page=$r_page";
	$_LINK['canonical_url'] = $canonical_url;
	$login_link = "#LOGIN_ERROR"; // dummy link that is not used
	switch ($auth_type) {
		case AUTH_TYPE_FORM:
			$login_link = "$script?plugin=loginform&pcmd=login&page=$r_page";
			break;
		case AUTH_TYPE_EXTERNAL:
		case AUTH_TYPE_SAML:
			$login_link = get_auth_external_login_url($_page,
				get_page_uri($_page, PKWK_URI_ROOT));
			break;
	}
	$_LINK['login']    = htmlsc($login_link);
	$_LINK['logout']   = "$script?plugin=loginform&amp;pcmd=logout&amp;page=$r_page";

	// Init flags
	$is_page = (is_pagename($_page) && ! arg_check('backup') && $_page != $whatsnew);
	$is_read = (arg_check('read') && is_page($_page));
	$is_freeze = is_freeze($_page);

	// Last modification date (string) of the page
	$lastmodified = $is_read ?  format_date(get_filetime($_page)) .
		get_passage_html_span($_page) : '';

	// List of attached files to the page
	$show_attaches = $is_read || arg_check('edit');
	$attaches = ($attach_link && $show_attaches && exist_plugin_action('attach')) ?
		attach_filelist() : '';

	// List of related pages
	$related  = ($related_link && $is_read) ? make_related($_page) : '';

	// List of footnotes
	ksort($foot_explain, SORT_NUMERIC);
	$notes = ! empty($foot_explain) ? $note_hr . join("\n", $foot_explain) : '';

	// Tags will be inserted into <head></head>
	$head_tag = ! empty($head_tags) ? join("\n", $head_tags) ."\n" : '';

	// Output nofollow / noindex regardless os skin file
	if (!$is_read || $nofollow) {
		if (!headers_sent()) {
			header("X-Robots-Tag: noindex,nofollow");
		}
	}

	// Send Canonical URL for Search Engine Optimization
	if ($is_read && !headers_sent()) {
		header("Link: <$canonical_url>; rel=\"canonical\"");
	}

	// Search words
	if ($search_word_color && isset($vars['word'])) {
		$body = '<div class="small">' . $_msg_word . htmlsc($vars['word']) .
			'</div>' . $hr . "\n" . $body;

		// BugTrack2/106: Only variables can be passed by reference from PHP 5.0.5
		// with array_splice(), array_flip()
		$words = preg_split('/\s+/', $vars['word'], -1, PREG_SPLIT_NO_EMPTY);
		$words = array_splice($words, 0, 10); // Max: 10 words
		$words = array_flip($words);

		$keys = array();
		foreach ($words as $word=>$id) $keys[$word] = strlen($word);
		arsort($keys, SORT_NUMERIC);
		$keys = get_search_words(array_keys($keys), TRUE);
		$id = 0;
		$patterns = '';
		foreach ($keys as $key=>$pattern) {
			if (strlen($patterns) > 0) {
				$patterns .= '|';
			}
			$patterns .= '(' . $pattern . ')';
		}
		if ($pattern) {
			$whole_pattern  = '/' .
				'<textarea[^>]*>.*?<\/textarea>' .	// Ignore textareas
				'|' . '<[^>]*>' .			// Ignore tags
				'|' . '&[^;]+;' .			// Ignore entities
				'|' . '(' . $patterns . ')' .		// $matches[1]: Regex for a search word
				'/sS';
			$body  = preg_replace_callback($whole_pattern, '_decorate_Nth_word', $body);
			$notes = preg_replace_callback($whole_pattern, '_decorate_Nth_word', $notes);
		}
	}
	// Embed Scripting data
	$html_scripting_data = get_html_scripting_data($_page, $is_edit_preview);

	// Compat: 'HTML convert time' without time about MenuBar and skin
	$taketime = elapsedtime();

	require(SKIN_FILE);
}
