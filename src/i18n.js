if (!window.JWB || JWB === false) {
	//Make JWB an object again to prevent errors later on. The onload function will re-delete this again.
	window.JWB = {
		messages: {},
		imports: {
			i18n: {}
		},
		allowed: false
	};
} else if (!JWB.imports || !JWB.imports.i18n) {
	JWB.imports = JWB.imports || {};
	JWB.imports.i18n = {};
}

/*** Register i18n languages ***/
(function(langs) {
	for (let lang of langs) {
		let file = lang.split('=')[1] || lang; // for multiple languages using the same files; useful for cases like Chinese (e.g. 'zh=zh_hans')
		lang = lang.split('=')[0];
		if (lang == 'vi') {
			JWB.imports.i18n[lang] = '//dev.fandom.com/wiki/User:NguoiDungKhongDinhDanh/JWB.js/i18n-vi.js?action=raw&ctype=text/javascript';
		} else {
			JWB.imports.i18n[lang] = '//en.wikipedia.org/w/index.php?title=User:Joeytje50/JWB.js/i18n-'+file+'.js&action=raw&ctype=text/javascript';
		}
	}
})([ // List all languages here:
	'nl', 'gl', 'ru', 'uk', 'be', 'he', 'it', 'fa', 'vi', 'zh_hans', 'zh_hant',
	'zh=zh_hans', 'zh_cn=zh_hans', 'zh_my=zh_hans', 'zh_sg=zh_hans', // zh_hans redirects
	'zh_hk=zh_hant', 'zh_mo=zh_hant', 'zh_tw=zh_hant', // zh_hant redirects
]);

// English messages will *always* be loaded as a fallback (messages are guaranteed to exist in English). Other languages are loaded from other i18n pages.

/** English
 * Original author: [[:wikipedia:User:Joeytje50]]
 */

JWB.messages.en = {
	// General interface
	'tab-setup':				'Setup',
	'tab-editing':				'Editing',
	'tab-skip':					'Skip',
	'tab-other':				'Other',
	'tab-readd':				'Readd',
	'tab-log':					'Log',
	'pagelist-caption':			'Enter list of pages:',
	'editbox-caption':			'Editing area',
	'editbox-currentpage':		'You are editing: <a href="' +
								mw.config.get('wgArticlePath').replace(/\$1/, '$2') +
								'" target="_blank" title="$1">$1</a>',
	'no-changes-made':			'No changes made. Press skip to go to the next page in the list.',
	'page-not-exists':			'Page doesn\'t exist, diff can not be made.',
	
	// Stats
	'stat-pages':				'Pages listed:',
	'stat-save':				'Pages saved:',
	'stat-null':				'Null-edits:',
	'stat-skip':				'Pages skipped:',
	'stat-other':				'Other:',
	
	// Tab 1
	'label-pagelist':			'Page list',
	'label-remove':				'Remove:',
	'button-remove-dupes':		'duplicates',
	'tip-remove-dupes':			'Filter page list to only contain unique pages.',
	'button-remove-uniqs':		'uniques',
	'tip-remove-uniqs':			'Filter page list to remove non-duplicated pages and uniquify the rest.',
	'button-remove-undo':		'undo',
	'tip-remove-undo':			'Undo last remove action.',
	'preparse':					'Use pre-parse mode',
	'tip-preparse':				'Go through listed pages, filtering it down to just the ones that would not be skipped by the current Skip rules.',
	'preparse-reset':			'reset',
	'tip-preparse-reset':		'Clear the #PRE-PARSE-STOP tag in the pagelist, to pre-parse the whole page list again',
	'button-pagelist-generate':	'Generate',
	'button-pagelist-stop':		'Stop',
	'button-pagelist-top':		'Top',
	'button-pagelist-bot':		'Bot',
	'button-sort':				'Sort',
	'button-filter':			'Filter',
	'button-filter-tip':		'Filter the pagelist and standardize/localise the rest.',
	'label-settings':			'Settings',
	'setup-store':				'Store',
	'setup-store-tip':			'Store the current settings in the dropdown menu, for later access.\n'+
								'To be able to access this in a later session, you need to save it to the wiki, or download it.',
	'load-settings':			'Load:',
	'setup-default':			'default',
	'setup-blank':				'blank',
	'setup-delete':				'Delete',
	'setup-delete-tip':			'Delete the setup that is currently selected.',
	'setup-save':				'Save to wiki',
	'setup-download':			'Download',
	'setup-import':				'Import',
	'setup-import-tip':			'Upload settings files (JSON file format) from your computer.',
	'setup-update':				'Refresh',
	'setup-update-tip':			'Refresh the settings stored on your /$1 page',
	'label-limits':				'Limits',
	'time-limit':				'RegEx time limit',
	'tip-time-limit':			'The time limit for any given (RegEx) match rule is allowed to run; applies to both replacing AND skip rules.',
	'diff-size-limit':			'Diff size limit',
	'tip-diff-size-limit':		'The maximum amount of characters added and/or removed. Set to 0 for no limit. '+
								'This can be used as a sanity check to prevent unexpectedly large additions or removals in a bot task.',
	'size-limit-exceeded':		'The size difference of your change ($1 characters) exceeds the limit set in the "setup" tab. Set the limit to 0 to ignore this.',

	// Tab 2
	'edit-summary':				'Summary:',
	'bot-edit':					'Bot edit',
	'minor-edit':				'Minor edit',
	'tip-via-JWB':				'Add (via JWB script) to the end of your summary',
	'watch-add':				'add now',
	'watch-remove':				'remove now',
	'watch-nochange':			'Don\'t modify watchlist',
	'watch-preferences':		'Watch based on preferences',
	'watch-watch':				'Add pages to watchlist',
	'watch-unwatch':			'Remove pages from watchlist',
	'auto-save':				'Save automatically',
	'save-interval':			'every $1 sec', //$1 represents the throttle/interval input element
	'tip-save-interval':		'Amount of seconds to pause between each edit',
	'editbutton-stop':			'Stop',
	'editbutton-start':			'Start',
	'editbutton-save':			'Save',
	'editbutton-preview':		'Preview',
	'editbutton-skip':			'Skip', // This message is also used in tab 4
	'editbutton-diff':			'Diff',
	'button-open-popup':		'More replace fields',
	'button-more-fields':		'Add more fields',
	'button-re101':				'Go to regex101.com',
	'button-remove-this':		'Remove',
	'label-rtext':				'Replace:',
	'label-rwith':				'With:',
	'label-useregex':			'Regular Expression',
	'label-regex-flags':		'flags:',
	'tip-regex-flags':			'Any flags for regular expressions, for example i for ignorecase or g for global replace.\n'+
								'In this JWB script, the _ flag treats underscores and spaces as the same entity. Use with caution.',
	'label-ignore-comment':		'Ignore unparsed content',
	'tip-ignore-comment':		'Ignore comments and text within nowiki, source, math, or pre tags.',
	'label-enable-RETF':		'Enable $1',
	'label-RETF':				'RegEx Typo Fixing',
	'tip-refresh-RETF':			'Refresh the typos list for new modifications.',
	'skip-RETF':				'Disable RETF',
	'tip-skip-RETF':			'Reload the page content without RegEx Typo Fixing enabled for just this page.',
	
	// Tab 3
	'label-redirects':			'Redirects:',
	'redirects-follow':			'Follow',
	'tip-redirects-follow':		'Edit the page the redirect leads to',
	'redirects-skip':			'Skip',
	'tip-redirects-skip':		'Skip redirects',
	'redirects-edit':			'Edit',
	'tip-redirects-edit':		'Edit the redirect itself instead of the page it redirects to',
	'label-skip-when':			'Skip when:',
	'skip-no-change':			'No changes were made',
	'skip-exists-yes':			'exists',
	'skip-exists-no':			'doesn\'t exist',
	'skip-exists-neither':		'neither',
	'skip-after-action':		'Skip editing after move/protect',
	'skip-contains':			'When page contains:',
	'skip-not-contains':		'When page doesn\'t contain:',
	'skip-category':			'When member of any category:',
	'skip-cg-prefix':			'Namespace prefix not required; separate entries with vertical bar `|` or a comma.',
	
	// Tab 4
	'editbutton-move':			'Move',
	'editbutton-delete':		'Delete',
	'editbutton-undelete':		'Undelete',
	'editbutton-protect':		'Protect',
	'move-header':				'Move options',
	'move-redir-suppress':		'Suppress redirects',
	'move-also':				'Also move:',
	'move-talk-page':			'talk page',
	'move-subpage':				'subpages',
	'move-new-name':			'New pagename:',
	'protect-header':			'Protect options',
	'protect-edit':				'Edit:',
	'protect-move':				'Move:',
	'protect-upload':			'Upload:',
	'protect-delete':			'Delete:',
	'protect-protect':			'Protect:',
	'protect-like-edit':		'same as Edit',
	'protect-none':				'no protection', // This is the default label. It should indicate that the dropdown menu is used for selecting protection levels
	'protect-expiry':			'Expiry:',
	'protect-cascading':		'Enable cascading protection',
	'right-header':				'Change user groups',
	'right-grant':				'Assign $1 user group to yourself',
	'right-revoke':				'Revoke $1 user group from yourself',
	
	// Tab -2
	'readd-header':				'Readd options',
	'readd-edit':				'Edit',
	'readd-null':				'Null-edit',
	'readd-move':				'Move',
	'readd-skip':				'Skip',
	'readd-bots':				'Botskip',
	'readd-flag':				'Flag',
	'readd-delete':				'Delete',
	'readd-undelete':			'Undelete',
	'readd-protect':			'Protect',
	'readd-changed':			'Changed',
	'readd-nochanges':			'No changes',
	'readd-all':				'Check all',
	'readd-search':				'Search:',
	'readd-after':				'After:',
	'readd-before':				'Before:',
	'readd-ab-enable':			'Enable',
	'readd-button':				'Readd',
	'readd-preview':			'Preview',
	'readd-clear':				'Clear',
	'readd-top':				'top',
	
	// Tab -1
	'log-clear':				'Clear',
	'log-clear-yes':			'Confirm',
	'log-clear-no':				'Abort',
	'log-diff':					'diff',
	'log-bots':					'bot',
	'log-info':					'info',
	'log-movedto':				'to',
	'log-protect':				'prot',
	'log-protect-cascading':	'cascading:',
	'log-protect-casctrue':		'yes',
	'log-protect-expiry':		'expiry:',
	'log-protect-indef':		'indefinite',
	'log-right-granted':		'Granted $1 to yourself',
	'log-right-revoked':		'Revoked $1 from yourself',
	'log-right-nochange':		'No change',
	
	//Dialog boxes
	'confirm-leave':			'Closing this tab will cause you to lose all progress.',
	'alert-no-move':			'Please enter the new pagename before clicking move.',
	'not-on-list':				'Your username was not found on the JWB checklist. Please request access by contacting an administrator.',
	'verify-error':				'An error occurred while loading the AutoWikiBrowser checkpage:',
	'new-message':				'You have new messages. See the status bar for links to view them.',
	'no-pages-listed':			'Please enter some articles to browse before clicking start.',
	'infinite-skip-notice':		'No replacement rules were specified, with JWB set to automatically skip when no changes are made.\n'+
								'Please review these settings in the "Content" and "Skip" tabs.',
	'autosave-error':			'There was a problem while submitting the previous page. '+
								'Please check the "$1" tab and verify if the previous edits went through correctly.',
	'csp-error':				'Unable to perform previous action: violated Content Security Policy "$1".',
	'confirm-continue':			'Continue?',
	'right-revoke-confirm':		'You are about to revoke $1 user group from yourself, which you cannot undo. Continue?',
	'filter-no-namespace':		'You did not choose any namespace to keep.',
	
	//Statuses
	'status-alt':				'loading...',
	'status-done':				'Done.',
	'status-newmsg':			'You have $1 ($2)',
	'status-talklink':			'new messages',
	'status-difflink':			'last change',
	'status-load-page':			'Getting page contents...',
	'status-replacing':			'Applying replace rules...',
	'status-check-skips':		'Testing skip rules...',
	'status-submit':			'Submitting edit...',
	'status-preview':			'Getting preview...',
	'status-diff':				'Getting edit diff...',
	'status-move':				'Moving page...',
	'status-delete':			'Deleting page...',
	'status-undelete':			'Undeleting page...',
	'status-protect':			'Protecting page...',
	'status-watch':				'Modifying watchlist...',
	'status-watch-added':		'Added to watchlist.',
	'status-watch-removed':		'Removed from watchlist.',
	'status-right': 			'Changing user group...',
	'status-regex-err':			'Regex error. Please change the entered <i>replace</i> regular expression',
	'status-setup-load':		'Loading JWB settings...',
	'status-setup-submit':		'Submitting settings to wiki...',
	'status-setup-dload':		'Downloading settings...',
	'status-old-browser':		'Please use $1 for importing.',
	'status-del-setup':			'\'$1\' has been deleted. $2?',
	'status-del-default':		'Your default settings have been reset. $1?',
	'status-del-undo':			'Undo',
	'status-pl-over-lim':		'Server request limit reached.',
	'status-unexpected':		'Unexpected error. See the developers console for technical details.',

	//Setup
	'setup-prompt':				'Under what name do you want to $1 your current setup?',
	'setup-prompt-store':		'store',
	'setup-prompt-save':		'save',
	'setup-summary':			'Updating JWB settings /*semi-automatic*/', //this is based on wgContentLanguage, not wgUserLanguage.
	'old-browser':				'Your browser does not support importing files. Please upgrade to a newer browser, '+
								'or upload the contents of the file to the wiki. See the status bar for links.',
	'not-json':					'Only JSON files can be imported. Please ensure your file uses the extension .json, '+
								'or modify the file extension if necessary.',
	'json-err':					'An error was found in your JWB settings:\n$1\nPlease review your settings $2.',
	'json-err-upload':			'file',
	'json-err-page':			'by going to "Special:MyPage/$1"',
	'setup-delete-blank':		'You can\'t delete the blank setup.',
	'duplicate-settings':		'Conflicting settings pages exist. Please move all settings from "$1" to "$2" and turn it into a redirect '+
								'(see $3 for more information on JavaScript redirects).',
	'setup-move-summary':		'Moving JWB settings page to new location /*automatic on JWB startup*/', // this is based on wgContentLanguage, not wgUserLanguage.
	'moved-settings':			'Your settings page has been automatically moved from "$1" to the more appropriate "$2" as a new JWB feature. '+
								'This action has been logged in the "$3" tab.\n'+ // receives JWB message 'tab-log' as $3.
								'Please request the page\'s content model to be updated to JSON by an administrator.',
	
	//Pagelist generating
	'namespace-main':			'main',
	'label-ns-select':			'Namespace:',
	'tip-ns-select':			'Ctrl+click to select multiple namespaces.',
	'redir-label':				'Redirects:',
	'redir-redirs':				'redirects',
	'redir-noredirs':			'non-redirects',
	'redir-all':				'both',
	'legend-cm':				'Category',
	'label-cm':					'Category:',
	'tip-cm':					'Namespace prefix not required; list one category name.',
	'cm-include':				'Include:',
	'cm-include-pages':			'pages',
	'cm-include-subcgs':		'subcategories',
	'cm-include-files':			'files',
	'legend-linksto':			'Links to page',
	'label-linksto':			'Links to:',
	'links-include':			'Include:',
	'links-include-links':		'wikilinks',
	'links-include-templ':		'transclusions',
	'links-include-files':		'file usage',
	'label-link-redir':			'Include links to redirects',
	'tip-link-redir':			'Include links directed towards one of this page\'s redirects',
	'legend-ps':				'Pages with prefix',
	'label-ps':					'Prefix:',
	'label-ps-strict':			'Strict prefix search',
	'tip-ps-strict':			'Enable to perform strict prefix search; disable to perform fuzzy prefix search.',
	'legend-wr':				'Watchlist',
	'label-wr':					'Include watchlist contents',
	'legend-rn':				'Random',
	'label-rn':					'List random pages',
	'label-rn-limit':			'Limit:',
	'rn-limit-invalid':			'Invalid input. Limit must be a number between $1 and $2.',
	'legend-pl':				'Links on page',
	'label-pl':					'On page:',
	'tip-pl':					'Fetch a list of links on the page(s).\nSeperate values with vertical bar `|`.',
	'legend-sr':				'Wiki search',
	'tip-sr':					'Search using the standard search function.',
	'label-sr':					'Search term:',
	'placeholder-sr':			'Recommended: $1/example/ or $2/example/',
	'legend-smw':				'Semantic MediaWiki query (<i>$1</i>)', // $1 == 'smw-slow'
	'smw-slow':					'slow',
	'label-smw':				'Query:',
	'tip-smw':					'Enter Semantic MediaWiki query here. Don\'t forget to specify a query limit, e.g.:$1', // $1 == "\n|limit=500"
	
	// Pagelist filtering
	'legend-filter-keep':		'Keep',
	'legend-filter-remove':		'Remove',
	'legend-filter-matrep':		'Match and replace',
	'label-filter-search':		'Search:',
	'legend-filter-convert':	'Convert',
	'label-filter-convert':		'Convert to:',
	'filter-convert-subject':	'Subject pages',
	'filter-convert-talk':		'Talk pages'
};
