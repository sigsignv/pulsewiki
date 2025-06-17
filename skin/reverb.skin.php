<?php
// PukiWiki - Yet another WikiWikiWeb clone.
// reverb.skin.php
// Copyright
//   2002-2021 PukiWiki Development Team
//   2001-2002 Originally written by yu-ji
// License: GPL v2 or (at your option) any later version
//
// Reverb skin

// ------------------------------------------------------------
// Settings (define before here, if you want)

// Set site identities
$_IMAGE['skin']['logo']     = 'pukiwiki.png';
$_IMAGE['skin']['favicon']  = ''; // Sample: 'image/favicon.ico';

// SKIN_DEFAULT_DISABLE_TOPICPATH
//   1 = Show reload URL
//   0 = Show topicpath
if (! defined('SKIN_DEFAULT_DISABLE_TOPICPATH'))
	define('SKIN_DEFAULT_DISABLE_TOPICPATH', 1); // 1, 0

// ------------------------------------------------------------
// Code start

// Prohibit direct access
if (! defined('UI_LANG')) die('UI_LANG is not set');
if (! isset($_LANG)) die('$_LANG is not set');
if (! defined('PKWK_READONLY')) die('PKWK_READONLY is not set');

$lang  = & $_LANG['skin'];
$link  = & $_LINK;
$image = & $_IMAGE['skin'];
$rw    = ! PKWK_READONLY;

// MenuBar
$menu = arg_check('read') && exist_plugin_convert('menu') ? do_plugin_convert('menu') : FALSE;
// RightBar
$rightbar = FALSE;
if (arg_check('read') && exist_plugin_convert('rightbar')) {
	$rightbar = do_plugin_convert('rightbar');
}

function h($str) {
	return htmlspecialchars($str, ENT_QUOTES | ENT_SUBSTITUTE | ENT_HTML5, "UTF-8");
}

function print_robots_meta_tag($cond) {
	return $cond ? '<meta name="robots" content="noindex, nofollow" />' . "\n" : '';
}

function print_referrer_policy_meta_tag($policy) {
	return $policy ? '<meta name="referrer" content="' . h($policy) . '" />' . "\n" : '';
}

function print_favicon_link_tag($favicon) {
	return $favicon ? '<link rel="icon" href="' . h($favicon) . '" />' . "\n" : '';
}

$_IMAGE['skin']['edit']     = 'edit.png';
$_IMAGE['skin']['freeze']   = 'freeze.png';
$_IMAGE['skin']['unfreeze'] = 'unfreeze.png';
$_IMAGE['skin']['diff']     = 'diff.png';
$_IMAGE['skin']['backup']   = 'backup.png';
$_IMAGE['skin']['upload']   = 'file.png';
$_IMAGE['skin']['copy']     = 'copy.png';
$_IMAGE['skin']['rename']   = 'rename.png';
$_IMAGE['skin']['reload']   = 'reload.png';

$_IMAGE['skin']['new']      = 'new.png';
$_IMAGE['skin']['list']     = 'list.png';
$_IMAGE['skin']['search']   = 'search.png';
$_IMAGE['skin']['recent']   = 'recentchanges.png';
$_IMAGE['skin']['help']     = 'help.png';

function print_navlink($cond, $key) {
	if (!$cond) {
		return "";
	}

	// link icon
	$i = $GLOBALS['_IMAGE']['skin'];
	$img = isset($i[$key]) ? '<img src="' . h(IMAGE_DIR . $i[$key]) . '" />' : '';

	// link url
	$u = $GLOBALS['_LINK'];
	$url = isset($u[$key]) ? $u[$key] : '';

	// link text
	$m = $GLOBALS['_LANG']['skin'];
	$text = isset($m[$key]) ? $m[$key] : $key;

	$template = <<<EOS
<div class="nav-item">
	<a href="{$url}">{$img}{$text}</a>
</div>
EOS;

	return $template;
}

// ------------------------------------------------------------
// Output

// HTTP headers
pkwk_common_headers();
header('Cache-control: no-cache');
header('Pragma: no-cache');
header('Content-Type: text/html; charset=' . CONTENT_CHARSET);

?>
<!DOCTYPE html>
<html lang="<?= h(LANG) ?>">
<head>
  <meta charset="<?= h(CONTENT_CHARSET) ?>" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <?= print_robots_meta_tag($nofollow || ! $is_read) ?>
  <?= print_referrer_policy_meta_tag($html_meta_referrer_policy) ?>

  <?php /* $title is already escaped in html.php */ ?>
  <title><?= $title ?> - <?= h($page_title) ?></title>

  <?= print_favicon_link_tag($image['favicon']) ?>
  <link rel="stylesheet" href="skin/reverb.css" />
  <link rel="alternate" type="application/rss+xml" title="RSS" href="<?= h($link['rss']) ?>" />

  <script src="skin/main.js" defer></script>
  <script src="skin/search2.js" defer></script>

<?php echo $head_tag ?>
</head>
<body>
<?php echo $html_scripting_data ?>
<div id="header">
 <a href="<?php echo $link['top'] ?>"><img id="logo" src="<?php echo IMAGE_DIR . $image['logo'] ?>" width="80" height="80" alt="[PukiWiki]" title="[PukiWiki]" /></a>

 <h1 class="title"><?php echo $page ?></h1>

<?php if ($is_page) { ?>
 <?php if(SKIN_DEFAULT_DISABLE_TOPICPATH) { ?>
   <a href="<?php echo $link['canonical_url'] ?>"><span class="small"><?php echo $link['canonical_url'] ?></span></a>
 <?php } else { ?>
   <span class="small">
   <?php require_once(PLUGIN_DIR . 'topicpath.inc.php'); echo plugin_topicpath_inline(); ?>
   </span>
 <?php } ?>
<?php } ?>

</div>

<div class="clear">
</div>

<?php echo $hr ?>

<div id="contents">
 <div id="body"><?php echo $body ?></div>
 <div id="sidebar">
<?php if ($is_page) { ?>
  <nav id="sidebar-nav">
   <?= print_navlink($rw, 'edit') ?>
   <?= print_navlink($rw && $is_read && $function_freeze, $is_freeze ? 'unfreeze' : 'freeze') ?>
   <?= print_navlink(true, 'diff'); ?>
   <?= print_navlink($do_backup, 'backup') ?>
   <?= print_navlink($rw && (bool)ini_get('file_uploads'), 'upload') ?>
   <?= print_navlink($rw, 'copy') ?>
   <?= print_navlink($rw, 'rename') ?>
   <?= print_navlink(true, 'reload') ?>
  </nav>
<?php } ?>
<?php if ($menu) { ?>
 <div id="menubar"><?php echo $menu ?></div>
<?php } ?>
<?php if ($rightbar) { ?>
 <div id="rightbar"><?php echo $rightbar ?></div>
<?php } ?>
 </div>
</div>

<?php if ($notes != '') { ?>
<div id="note"><?php echo $notes ?></div>
<?php } ?>

<?php if ($attaches != '') { ?>
<div id="attach">
<?php echo $hr ?>
<?php echo $attaches ?>
</div>
<?php } ?>

<?php echo $hr ?>

<nav id="footer-nav">
	<?= print_navlink($rw, 'new') ?>
	<?= print_navlink(true, 'list') ?>
	<?= print_navlink(arg_check('list'), 'filelist') ?>
	<?= print_navlink(true, 'search') ?>
	<?= print_navlink(true, 'recent') ?>
	<?= print_navlink(true, 'rss') ?>
	<?= print_navlink(true, 'help') ?>
	<?= print_navlink($enable_login, 'login') ?>
	<?= print_navlink($enable_logout, 'logout') ?>
</nav>

<div class="clear">
</div>

<?php if ($lastmodified != '') { ?>
<div id="lastmodified">Last-modified: <?php echo $lastmodified ?></div>
<?php } ?>

<?php if ($related != '') { ?>
<div id="related">Link: <?php echo $related ?></div>
<?php } ?>

<div id="footer">
 Site admin: <a href="<?php echo $modifierlink ?>"><?php echo $modifier ?></a>
 <p>
 <?php echo S_COPYRIGHT ?>.
 Powered by PHP <?php echo PHP_VERSION ?>. HTML convert time: <?php echo elapsedtime() ?> sec.
 </p>
</div>
</body>
</html>
