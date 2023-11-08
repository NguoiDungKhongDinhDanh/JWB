/**
 * TODO:
 * * list=random [Done]
 * * #pagelistStop [Partially done]
 * * Convert #inputsBox to flexbox [Done]
 * * Multiline inputs [Done]
 * * Automatic move/delete/protect [Ongoing]
 * * Ignore alert mode [Ongoing]
 * * Log errored pages [Ongoing]
**/

/***** Global object/variables *****/
window.JWB = {}; //The main global object for the script.

(function() {
	// Easier way to change import location for local debugging etc.
	JWB.imports = {
		'JWB.css'	:	'//dev.fandom.com/wiki/User:NguoiDungKhongDinhDanh/JWB.css?action=raw&ctype=text/css',
		'i18n.js'	:	'//dev.fandom.com/wiki/User:NguoiDungKhongDinhDanh/JWB.js/i18n.js?action=raw&ctype=text/javascript',
		'i18n'		:	{},
		'RETF.js'	:	'//dev.fandom.com/wiki/User:NguoiDungKhongDinhDanh/JWB.js/RETF.js?action=raw&ctype=text/javascript',
		'worker.js'	:	'//dev.fandom.com/wiki/User:NguoiDungKhongDinhDanh/JWB.js/worker.js?action=raw&ctype=text/javascript',
	};
	
	let objs = ['page', 'api', 'worker', 'fn', 'pl', 'messages', 'setup', 'settings', 'limit', 'ns', 'protection', 'test'];
	for (let i=0;i<objs.length;i++) {
		JWB[objs[i]] = {};
	}
	// <s>Set null as value instead of completely removing it. I may need it in the future.</s> [[:wikipedia:vi:Special:Diff/68297434]].
	JWB.summarySuffix = ' (via JWB)';
	// if (document.location.hostname == 'en.wikipedia.org') JWB.summarySuffix = ' (via [[WP:JWB]])';
	JWB.lang = mw.config.get('wgUserLanguage').replace('-', '_');
	JWB.contentLang = mw.config.get('wgContentLanguage').replace('-', '_');
	JWB.index_php = mw.config.get('wgScript');
	JWB.slashw = mw.config.get('wgScriptPath');
	JWB.slashwiki = mw.config.get('wgArticlePath');
	JWB.isStopped = true;
	JWB.tooltip = window.tooltipAccessKeyPrefix || '';
	let configext = 'js';
	if (document.location.hostname.split('.').slice(-2).join('.') == 'wikia.com' ||
		document.location.hostname.split('.').slice(-2).join('.') == 'fandom.com') {
		//LEGACY: fallback to settings on css for Wikia; uses JSON now.
		configext = 'css';
	}
	JWB.settingspage = 'JWB-settings.'+configext;
	if (window.hasOwnProperty('JWBSETTINGS')) {
		JWB.settingspage = JWBSETTINGS+'-settings.'+configext;
		delete window.JWBSETTINGS; //clean up the global variable
	}
	// .floodFlag should be null and string while .hasFlood should go after .flood and before .floodFlag, but forgive my OCD.
	JWB.test.changeable = false; // Whether or not the user can add & remove it from self.
	JWB.test.floodFlag = false; // Whether or not the flood user group has a name.
	JWB.test.hasFlood = false; // Whether or not the wiki has flood user group.
	JWB.test.hasJSON = false; // whether or not the wiki supports JSON userpages (mw 1.31+).
	JWB.test.hasSMW = false; // whether or not the wiki has SMW installed.
	JWB.test.flood = false; // Whether or not the user is holding JWB.test.floodFlag.
	JWB.test.flag = false; // Whether or not the user can remove JWB.test.floodFlag from self.
	JWB.test.hid = false; // Whether or not the user can hide their edits from RC.
})();

/***** User verification *****/

(function() {
	if (mw.config.get('wgCanonicalNamespace')+':'+mw.config.get('wgTitle') !== 'Project:AutoWikiBrowser/Script' ||
		JWB.allowed === false || mw.config.get('wgUserName') === null) {
		JWB.allowed = false;
		return;
	}
	$('body').html( // Loading screen
		'<div style="'+
			'display: flex; flex-direction: column; '+
			'align-items: center; justify-content: center; '+
			'height: 100%; '+
			'background-image: url(//upload.wikimedia.org/wikipedia/commons/5/58/AWB_logo_draft.svg); '+
			'background-position: center; '+
			'background-size: 80%; '+
			'background-repeat: no-repeat; '+
			'line-height: normal; text-shadow: 0px 0px 10px #fff; '+
			'color: black;'+
		'">'+
			'<h2 style="'+
				'margin: 1.5em auto; border: none; '+
				'overflow: visible; padding: 0; '+
				'text-align: center; font-size: 60px; font-weight: normal; '+
				'font-family: \'Roboto\', \'Helvetica\', \'Calibri\', sans-serif;'+
			'">'+
				'Javascript Wiki Browser'+
			'</h2>'+
			'<div style="'+
				'margin: 1.5em auto; '+
				'text-align: center; '+
				'font-size: 30px;'+
			'">'+
				'<span>Loading...</span>'+
			'<div>'+
		'</div>'
	);
	mw.loader.load(JWB.imports['JWB.css'], 'text/css');
	mw.loader.load(['mediawiki.diff', 'mediawiki.diff.styles']);
	(new mw.Api()).loadMessagesIfMissing(['pagecategorieslink', 'pagecategorieslink']);
	
	$.getScript(JWB.imports['i18n.js'], function() {
		if (JWB.allowed === false) {
			alert(JWB.msg('not-on-list'));
			return;
		}
		let langs = [];
		if (JWB.lang !== 'en' && JWB.imports.i18n.hasOwnProperty(JWB.lang)) {
			langs.push(JWB.imports.i18n[JWB.lang]);
			JWB.messages[JWB.lang] = JWB.messages[JWB.lang] || null;
		} else if (JWB.lang !== 'en' && JWB.lang !== 'qqx') {
			// this only happens if the language file does not exist.
			JWB.lang = 'en';
		}
		if (JWB.contentLang !== 'en' && JWB.contentLang !== JWB.lang && JWB.imports.i18n.hasOwnProperty(JWB.contentLang)) {
			langs.push(JWB.imports.i18n[JWB.contentLang]);
			JWB.messages[JWB.contentLang] = JWB.messages[JWB.contentLang] || null;
		}
		if (langs.length) {
			$.when.apply($, langs.map(url => $.getScript(url))).done(function() {
				/* if (JWB.allowed === true && JWB.messages.length == langs + 1) { // if there are two languages to load, wait for them both.
					console.log('langs loaded');
					JWB.init(); //init if verification has already returned true
				} else */
				if (JWB.allowed === false) {
					alert(JWB.msg('not-on-list'));
				} else {
					JWB.init();
				}
			});
		} else if (JWB.allowed === true) { // no more languages to load.
			console.log('no langs loaded');
			JWB.init();
		}
	});
	
	//RegEx Typo Fixing
	$.getScript(JWB.imports['RETF.js'], function() {
		$('#refreshRETF').click(RETF.load);
	});

	if (!window.Worker) {
		// https://caniuse.com/webworkers - this should not happen for any sensible human being.
		// Either you're on IE<10, or you're just testing my patience.
		alert('Web Workers are not supported in this browser. Please use a more modern browser to use JWB. '+
				'Most matching and replacing features are not supported in this browser.');
	}
		
	(new mw.Api()).get({
		action: 'paraminfo',
		modules: 'query+random',
		format: 'json',
		formatversion: 2
	}).done(function(response) {
		if (response.error) {
			console.log('API error: ' + response.error.info);
			JWB.limit.err = true;
			return;
		}
		var p = response.paraminfo.modules[0].parameters;
		for (let i in p) {
			if (p[i].name === 'limit') {
				for (let j of ['min', 'max', 'highmax']) {
					JWB.limit[j] = p[i][j];
				}
				break;
			}
		}
	}).fail(function(xhr, error) {
		console.log(xhr, error);
		JWB.limit.err = true;
		return;
	});

	(new mw.Api()).get({
		action: 'query',
		meta: 'siteinfo|userinfo',
		prop: 'info|revisions',
		titles: 'Project:AutoWikiBrowser/CheckPageJSON',
		indexpageids: true,
		rvprop: 'content',
		rvslots: '*',
		rvlimit: 1,
		siprop: 'extensions|general|namespaces|restrictions|usergroups',
		uiprop: 'changeablegroups|groups|rights',
		format: 'json',
		formatversion: 2
	}).done(function(response) {
		if (response.error) {
			alert('API error: ' + response.error.info);
			JWB = false; //preventing further access. No verification => no access.
			return;
		}
		JWB.ns = response.query.namespaces; //saving for later
		
		JWB.protection.other = {};
		JWB.protection.other.fn = {};
		// JWB.protection.other.levels = [];
		JWB.protection.types = response.query.restrictions.types; // Idem.
		JWB.protection.levels = response.query.restrictions.levels; // Idem.
		JWB.protection.casc = response.query.restrictions.cascadinglevels; // Idem.
		
		JWB.protection.other.types = JWB.protection.types; // Saving original ones.
		JWB.protection.types.splice(JWB.protection.types.indexOf('create'), 1); // Splicing "create" out as it will be determined in JWB.api.protect.
		
		// This will execute before JWB.init() and therefore before JWB.setup.load() loading the user's settings.
		// Check if there is another group with "bot" right and user can add and remove it from themself.
		let wikigroups = response.query.usergroups;
		var groups = response.query.userinfo.groups;
		let cagroups = response.query.userinfo.changeablegroups;
		let cagarray = ['add', 'remove', 'add-self', 'remove-self'];
		let changeable = function(g) {
				return ((cagroups[cagarray[0]].includes(g) && cagroups[cagarray[1]].includes(g)) ||
						(cagroups[cagarray[2]].includes(g) && cagroups[cagarray[3]].includes(g)));
			};
		let revocable = function(g) {
				return cagroups[cagarray[2]].includes(g) && cagroups[cagarray[3]].includes(g);
			};
		for (var u of wikigroups) {
			if (u.rights.includes('editmyuserjson') || u.rights.includes('edituserjson')) {
				JWB.test.hasJSON = true;
			}
			if (u.rights.includes('bot') && u !== 'bot' && changeable(u)) {
				JWB.test.hasFlood = true;
				JWB.test.floodFlag = u;
			}
			if (JWB.test.hasJSON && JWB.test.hasFlood) {
				break;
			}
		}
		if (JWB.test.floodFlag === false && changeable('bot')) {
			JWB.test.hasFlood = true;
			JWB.test.floodFlag = 'bot';
		}
		if (groups.includes(JWB.test.floodFlag)) {
			JWB.test.flood = true;
			if (changeable(JWB.test.floodFlag)) {
				JWB.test.changeable = true;
			} else if (revocable(JWB.test.floodFlag)) {
				JWB.test.flag = true;
			}
		}
		
		// Check if we've got SMW on this wiki
		let extensions = response.query.extensions;
		for (var e of extensions) {
			if (e.name == 'SemanticMediaWiki') {
				JWB.test.hasSMW = true;
				break;
			}
		}
		
		// Check if user already has "apihighlimits" or "bot" right.
		let rights = response.query.userinfo.rights;
		if (rights.includes('apihighlimits') && !JWB.limit.err) JWB.limit.value = JWB.limit.highmax;
		if (rights.includes('bot')) JWB.test.hid = true;
		
		if (typeof (JWB.limit.value) === 'undefined' && !JWB.limit.err) JWB.limit.value = JWB.limit.max;
		
		JWB.username = response.query.userinfo.name; //preventing any "hacks" that change wgUserName or mw.config.wgUserName
		JWB.userid = response.query.userinfo.id; // For use in JWB.api.right (line 670+).
		var page = response.query.pages[0];
		var server = response.query.general.servername;
		var users = [];
		var bots = [];
		var exempt = {
				all: ['NguoiDungKhongDinhDanh', 'NDKDDBot', 'NDKDD (COI)'],
				unlimited: {
					'vi.wikipedia.org' : ['NhacNy2412Bot']
				},
				local: {
					'vi.wikipedia.org' : ['Hộp cát', 'NhacNy2412', 'Không hề giả trân']
				}
			};
		JWB.test.dev = exempt.all.includes(JWB.username);
		JWB.test.unlimited = (typeof exempt.unlimited[server] !== 'undefined' ? exempt.unlimited[server].includes(JWB.username) : false);
		JWB.test.main = JWB.test.dev || JWB.test.unlimited;
		JWB.test.sysop = groups.includes('sysop') || groups.includes('eliminator') || JWB.test.dev;
		if (response.query.pageids[0] !== '-1') {
			var checkPageData = JSON.parse(page.revisions[0].slots.main.content);
			users = checkPageData.enabledusers;
			if ('enabledbots' in checkPageData) {
				bots = checkPageData.enabledbots;
			}
		} else {
			users = false; //fallback when page doesn't exist
			if (JWB.test.sysop) { // Check and inform admins if their checkpage is the unsupported format.
				(new mw.Api()).get({
					action: 'query',
					titles: 'Project:AutoWikiBrowser/CheckPage',
					prop: 'info',
					indexpageids: true,
				}).done(function(oldpage){
					var q = oldpage.query;
					if (q.pageids[0] != '-1' && !q.pages[q.pageids[0]].hasOwnProperty('redirect')) {
						// CheckPageJSON does not exist, and CheckPage does exist, and is not a redirect.
						// This indicates the checkpage needs to be ported to JSON. Notify admins.
						prompt(
							'Warning: The AWB checkpage found at Project:AutoWikiBrowser/CheckPage is no longer supported.\n'+
							'Please convert this checkpage to a JSON checkpage. See the URL below for more information.\n'+
							'After creating the JSON checkpage, you can use "Special:ChangeContentModel" to change the content model to JSON.',
							'https://en.wikipedia.org/wiki/Wikipedia:AutoWikiBrowser/CheckPage_format'
						);
					}
				});
			}
		}
		JWB.test.bot = (groups.includes('bot') && (users === false || bots.includes(JWB.username)) || JWB.test.main || JWB.test.hid);
		if (typeof exempt.local[server] !== 'undefined' ? exempt.local[server].includes(JWB.username) : false) {
			users.push(JWB.username);
		}
		var allLoaded = true;
		for (var m in JWB.messages) if (JWB.messages[m] === null) allLoaded = false;
		if (JWB.test.sysop || response.query.pageids[0] === '-1' || users === false ||
			users.includes(JWB.username) || bots.includes(JWB.username) || JWB.test.main) {
			JWB.allowed = true;
			if (allLoaded) JWB.init(); //init if messages have already loaded
		} else {
			if (allLoaded) {
				//run this after messages have loaded, so the message that shows is in the user's language
				alert(JWB.msg('not-on-list'));
			}
			JWB = false; //prevent further access
		}
	}).fail(function(xhr, error) {
		alert(JWB.msg('verify-error') + '\n' + error);
		JWB = false; //preventing further access. No verification => no access.
	});
})();

/***** API functions *****/

//Main template for API calls
JWB.api.call = function(data, callback, onerror) {
	data.format = 'json';
	if (data.action !== 'query' && data.action !== 'compare' && data.action !== 'ask') {
		data.bot = true; // mark edits as bot
	}
	$.ajax({
		data: data,
		dataType: 'json',
		url: JWB.slashw + '/api.php',
		type: 'POST',
		success: function(response) {
			if (response.error) {
				if (onerror && onerror(response, 'API') === false) return;
				alert('API error: ' + response.error.info);
				JWB.stop();
			} else {
				callback(response);
			}
		},
		// onerror: if it exists and returns false, do not show error alert. Otherwise, do show alert.
		error: function(xhr, error) {
			if (onerror && onerror(error, 'AJAX') === false) return;
			alert('AJAX error: ' + error);
			JWB.stop();
		}
	});
};

//Get page diff, and process it for more interactivity
JWB.api.diff = function(callback) {
	if (JWB.isStopped) return; // prevent new API calls when stopped
	JWB.status('diff');
	var editBoxInput = $('#editBoxArea').val();
	var redirect = $('input.redirects:checked').val();
	var data = {
		action: 'compare',
		indexpageids: true,
		fromtitle: JWB.page.name,
		//toslots: 'main', // TODO: Once this gets supported more widely, convert to the non-deprecated toslots system.
		//'totext-main': editBoxInput,
		totext: editBoxInput,
		topst: true,
	};
	if (redirect=='follow') data.redirects = true;
	JWB.api.call(data, function(response) {
		var diff;
		diff = response.compare['*'];
		if (diff === '') {
			diff = '<h2 id="noChangesMade">'+JWB.msg('no-changes-made')+'</h2>';
		} else {
			diff = '<table class="diff">'+
				'<colgroup>'+
					'<col class="diff-marker">'+
					'<col class="diff-content">'+
					'<col class="diff-marker">'+
					'<col class="diff-content">'+
				'</colgroup>'+
				'<tbody>'+
					diff+
				'</tbody>'+
			'</table>';
		}
		$('#resultWindow').html(diff);
		$('.diff-lineno').each(function() {
			var lineNumMatch = $(this).html().match(/\d+/);
			if (lineNumMatch) {
				$(this).parent().attr('data-line', parseInt(lineNumMatch[0])-1).addClass('lineheader');
			}
		});
		$('table.diff tr').each(function() { //add data-line attribute to every line, relative to the previous one. Used for click event.
			if (!$(this).next().is('[data-line]') && !$(this).next().has('td.diff-deletedline + td.diff-empty')) {
				$(this).next().attr('data-line', parseInt($(this).data('line'))+1);
			} else if ($(this).next().has('td.diff-deletedline + td.diff-empty')) { //copy over current data-line for deleted lines
				$(this).next().attr('data-line', $(this).data('line')); // to prevent them from messing up counting.
			}
		});
		JWB.status('done', true);
		if (typeof(callback) === 'function') {
			callback();
		}
	}, function(err, type) {
		if (type == 'API' && err.error.code == 'missingtitle') {
			// missingtitle is to be expected when editing a page that doesn't exist; just show a message and move on.
			$('#resultWindow').html('<span style="font-weight:bold;color:red;">'+JWB.msg('page-not-exists')+'</span>');
			JWB.status('done', true);
			if (typeof(callback) === 'function') {
				callback();
			}
			return false; // stop propagation of error; do not show alerts.
		}
	});
};

//Retrieve page contents/info, process them, and store information in JWB.page object.
JWB.api.get = function(pagename) {
	if (JWB.isStopped) return; // prevent new API calls when stopped
	JWB.pageCount();
	if (!JWB.list[0] || JWB.isStopped) {
		return JWB.stop();
	}
	if (pagename === '#PRE-PARSE-STOP') {
		var curval = $('#articleList').val();
		$('#articleList').val(curval.substr(curval.indexOf('\n') + 1));
		$('#preparse').prop('checked', false);
		JWB.stop();
		return;
	}
	let cgns = JWB.ns[14].name;
	let skipcg = $('#skipCategories').val();
	// prepend Category: before all categories and turn CSV(,) into CSV(|).
	skipcg = skipcg.replace(new RegExp('(^|,|\\|)('+cgns+':)?', 'gi'), '|'+cgns+':').substr(1);
	var redirect = $('input.redirects:checked').val();
	var data = {
		action: 'query',
		prop: 'info|revisions|categories',
		inprop: 'watched|protection',
		type: 'csrf|watch',
		titles: pagename,
		rvprop: 'content|timestamp|ids',
		rvlimit: '1',
		cllimit: 'max',
		clcategories: skipcg,
		indexpageids: true,
		meta: 'userinfo|tokens',
		uiprop: 'hasmsg'
	};
	if (redirect=='follow'||redirect=='skip') data.redirects = true;
	if (JWB.test.sysop && !JWB.test.dev) { // (Non-sysop) Dev cannot query deleted revs.
		data.list = 'deletedrevs';
	}
	JWB.status('load-page');
	JWB.api.call(data, function(response) {
		if (response.query.userinfo.hasOwnProperty('messages')) {
			var view = mw.config.get('wgScriptPath') + '?title=Special:MyTalk';
			var viewNew = view + '&diff=cur';
			JWB.status(
				'<span style="color:red;font-weight:bold;">'+
					JWB.msg('status-newmsg', 
						'<a href="'+view+'" target="_blank">'+JWB.msg('status-talklink')+'</a>',
						'<a href="'+viewNew+'" target="_blank">'+JWB.msg('status-difflink')+'</a>')+
				'</span>', true);
			alert(JWB.msg('new-message'));
			JWB.stop();
			return;
		}
		JWB.page = response.query.pages[response.query.pageids[0]];
		JWB.page.token = response.query.tokens.csrftoken;
		JWB.page.watchtoken = response.query.tokens.watchtoken;
		JWB.page.name = JWB.list[0].split('|')[0];
		var varOffset = JWB.list[0].includes('|') ? JWB.list[0].indexOf('|') + 1 : 0;
		JWB.page.pagevar = JWB.list[0].substr(varOffset);
		JWB.page.content = JWB.page.revisions ? JWB.page.revisions[0]['*'] : '';
		JWB.page.exists = !response.query.pages['-1'];
		JWB.page.deletedrevs = response.query.deletedrevs;
		JWB.page.watched = JWB.page.hasOwnProperty('watched');
		JWB.page.protections = JWB.page.restrictiontypes;

		if (response.query.redirects) {
			JWB.page.name = response.query.redirects[0].to;
		}
		// check for skips that can be determined before replacing
		if (!JWB.fn.allowBots(JWB.page.content, JWB.username) || !JWB.fn.allowBots(JWB.page.content)) {
			// skip if {{bots}} template forbids editing on this page by user OR by JWB in general
			JWB.log('nobots', JWB.page.name);
			return JWB.next();
		} else if (JWB.page.categories !== undefined || // skip because of a matching category as passed via clcategories.
				($('#exists-no').prop('checked') && !JWB.page.exists) ||
				($('#exists-yes').prop('checked') && JWB.page.exists) ||
				(redirect==='skip' && response.query.redirects) // variable  redirect  is defined outside this callback function.
		) {
			// simple skip rules
			JWB.log('skip', JWB.page.name);
			return JWB.next();
		}
		// Check skip contains rules.
		var containRegex = $('#containRegex').prop('checked'),
			containFlags = $('#containFlags').val();
		var skipContains, skipNotContains;
		if (containRegex) {
			JWB.status('check-skips');
			var skipping = false; // for tracking if match is found in synchronous calls.
			if ($('#skipContains').val().length) {
				JWB.worker.match(JWB.page.content, $('#skipContains').val(), containFlags, function(result, err) {
					console.log('Contains', result, err);
					if (result !== null && err === undefined) {
						JWB.log('skip', JWB.page.name);
						JWB.next(); // next() also cancels the skipNotContains.
						skipping = true;
						return;
					} // else continue with the queued worker job that checks skipNotContains
				});
			}
			if (skipping) {
				JWB.log('skip', JWB.page.name);
				console.log('skipped page before replaces');
				return;
			}
			if ($('#skipNotContains').val().length) {
				JWB.worker.match(JWB.page.content, $('#skipNotContains').val(), containFlags, function(result, err) {
					console.log('Not contains', result, err);
					if (result === null && err === undefined) {
						JWB.log('skip', JWB.page.name);
						JWB.next(); // also cancels the replace
						skipping = true;
						return;
					} // else move on to replacing
				});
			}
			if (skipping) {
				JWB.log('skip', JWB.page.name);
				console.log('skipped page before replaces');
				return;
			}
		} else {
			skipContains = $('#skipContains').val();
			skipNotContains = $('#skipNotContains').val();
			if ((skipContains && JWB.page.content.includes(skipContains)) ||
				(skipNotContains && !JWB.page.content.includes(skipNotContains))) {
				console.log('skipped page before replaces');
				return JWB.next();
			}
			JWB.status('done', true);
		}
		JWB.replace(JWB.page.content, function(newContent) {
			if (JWB.isStopped === true) return;
			if ($('#skipNoChange').prop('checked') && JWB.page.content === newContent) { //skip if no changes are made
				JWB.log('skip', JWB.page.name);
				return JWB.next();
			} else {
				JWB.editPage(newContent);
			}
			JWB.updateButtons();
		});
	});
};

//Some functions with self-explanatory names:
JWB.api.submit = function(page) {
	if (JWB.isStopped) return; // prevent new API calls when stopped
	JWB.status('submit');
	var summary = $('#summary').val();
	if ($('#summary').parent('label').hasClass('viaJWB')) summary += JWB.summarySuffix;
	if ((typeof page === 'string' && page !== JWB.page.name) || $('#currentpage a').html().replace(/&amp;/g, '&') !== JWB.page.name) {
		console.log(page, JWB.page.name, $('#currentpage a').html());
		JWB.stop();
		alert(JWB.msg('autosave-error', JWB.msg('tab-log')));
		$('#currentpage').html(JWB.msg('editbox-currentpage', ' ', ' '));
		return;
	}
	var newval = $('#editBoxArea').val();
	var diffsize = newval.length - JWB.page.content.length;
	if ($('#sizelimit').val() != 0 && Math.abs(diffsize) > parseInt($('#sizelimit').val())){
		alert(JWB.msg('size-limit-exceeded', diffsize > 0 ? '+'+diffsize : diffsize));
		JWB.status('done', true);
		return;
	}
	var data = {
		title: JWB.page.name,
		summary: summary,
		action: 'edit',
		//tags: 'JWB',
		basetimestamp: JWB.page.revisions ? JWB.page.revisions[0].timestamp : '',
		token: JWB.page.token,
		text: newval,
		watchlist: $('#watchPage').val()
	};
	if ($('#minorEdit').prop('checked')) data.minor = true;
	JWB.api.call(data, function(response) {
		JWB.log('edit', response.edit.title, response.edit.newrevid);
	}, function(error, errtype) {
		var cont = false;
		if (errtype == 'API') {
			cont = confirm('API error: ' + error.error.info + '\n' + JWB.msg('confirm-continue'));
		} else {
			cont = confirm('AJAX error: ' + error + '\n' + JWB.msg('confirm-continue'));
		}
		// JWB.log('skip', response.edit.title); // TODO: Readd err page
		if (!cont) {
			JWB.stop();
		}
		return false; // do not fall back on default error handling
	});
	// While the edit is submitting, continue to the next page to edit.
	JWB.status('done', true);
	JWB.next();
};
JWB.api.preview = function() {
	if (JWB.isStopped) return; // prevent new API calls when stopped
	JWB.status('preview');
	JWB.api.call({
		title: JWB.page.name,
		action: 'parse',
		pst: true,
		text: $('#editBoxArea').val()
	}, function(response) {
		$('#resultWindow').html(response.parse.text['*']);
		$('#resultWindow div.previewnote').remove();
		
		var cglist = response.parse.categories;
		if (cglist.length > 0) {
			var cgtext = mw.message('pagecategories', cglist.length).text();
			var cglink = mw.message('pagecategorieslink').text();
			// set defaults if MediaWiki:Pagecategories(link) have not loaded correctly:
			if (cgtext[0] == '\u29FC') cgtext = 'Categories';
			if (cglink[0] == '\u29FC') cglink = 'Special:Categories';
			var $footer = $(
				'<footer class="catlinks">'+
					'<a href="'+JWB.relLink(cglink)+'" title="'+cglink+'">'+
						cgtext+
					'</a>: <ul></ul>'+
				'</footer>'
			);
			var $ul = $footer.children('ul');
			for (var i=0;i<cglist.length;i++) {
				var redlink = cglist[i].missing === undefined ? '' : ' class="new"';
				var cg = cglist[i]['*'].replace(/_/g, ' ');
				$ul.append(
					'<li>'+
						'<a href="' + JWB.relLink('Category:' + cg) + '" title="' + cg + '"' + redlink + '>' + cg + '</a>'+
					'</li>'
				);
			}
			$footer.appendTo('#resultWindow');
		}
		JWB.status('done', true);
	});
};
JWB.api.move = function() {
	if (JWB.isStopped) return; // prevent new API calls when stopped
	JWB.status('move');
	var topage = $('#moveTo').val().replace(/\$x/gi, JWB.page.pagevar);
	var summary = $('#summary').val();
	if ($('#summary').parent('label').hasClass('viaJWB')) summary += JWB.summarySuffix;
	var data = {
		action: 'move',
		from: JWB.page.name,
		to: topage,
		token: JWB.page.token,
		reason: summary,
		ignorewarnings: 'yes'
	};
	if ($('#moveTalk').prop('checked')) data.movetalk = true;
	if ($('#moveSubpage').prop('checked')) data.movesubpages = true;
	if ($('#suppressRedir').prop('checked')) data.noredirect = true;
	JWB.api.call(data, function(response) {
		JWB.log('move', response.move.from, response.move.to);
		JWB.status('done', true);
		if (!$('#moveTo').val().match(/\$x/i)) $('#moveTo').val('')[0].focus(); //clear entered move-to pagename if it's not based on the pagevar
		JWB.next(topage);
	});
};
JWB.api.del = function() {
	if (JWB.isStopped) return; // prevent new API calls when stopped
	JWB.status(($('#deletePage').is('.undelete') ? 'un' : '') + 'delete');
	var summary = $('#summary').val();
	if ($('#summary').parent('label').hasClass('viaJWB')) summary += JWB.summarySuffix;
	JWB.api.call({
		action: (!JWB.page.exists ? 'un' : '') + 'delete',
		title: JWB.page.name,
		token: JWB.page.token,
		reason: summary
	}, function(response) {
		JWB.log((!JWB.page.exists ? 'un' : '') + 'delete', (response['delete']||response.undelete).title);
		JWB.status('done', true);
		JWB.next(response.undelete && response.undelete.title);
	});
};
JWB.api.protect = function() {
	if (JWB.isStopped) return; // prevent new API calls when stopped
	JWB.status('protect');
	var summary = $('#summary').val();
	var prot = [];
	var cascade = $('#cascadingProtection').prop('checked');
	
	if ($('#summary').parent('label').hasClass('viaJWB')) summary += JWB.summarySuffix;
	
	for (let i = 0; i < JWB.protection.types.length; i++) {
		prot.push(JWB.protection.types[i] + '=' + $('#' + JWB.protection.types[i] + 'Prot').val() || $('#editProt').val());
	}
	for (let i = 0; i < prot.length; i++) {
		if (!JWB.page.exists) {
			if (prot[i].match(/(?:move|delete|upload)=/)) {
				prot[i] = '';
			} else if (prot[i].match(/edit=/)) {
				prot[i] = prot[i].replace(/^edit/, 'create');
			}
		} else {
			if (prot[i].match(/create=/)) {
				prot[i] = '';
			}
		}
		if (!JWB.page.protections.includes('upload')) {
			if (prot[i].match(/upload=/)) {
				prot[i] = '';
			}
		}
	}
	
	prot = prot.filter(function(e) {
		return e != '';
	});
	
	JWB.api.call({
		action: 'protect',
		title: JWB.page.name,
		token: JWB.page.token,
		reason: summary,
		expiry: $('#protectExpiry').val() !== '' ? $('#protectExpiry').val() : 'indefinite',
		cascade: cascade,
		protections: prot.join('|')
	}, function(response) {
		var protactions = [];
		var prots = response.protect.protections;
		var casc = (response.protect.hasOwnProperty('cascade') ? true : false);
		for (var i = 0; i < prots.length; i++) {
			for (var j = 0; j < JWB.protection.other.types.length; j++) {
				if (typeof prots[i][JWB.protection.other.types[j]] === 'string') {
					protactions.push(
						JWB.protection.other.types[j] + ': ' +
						(prots[i][JWB.protection.other.types[j]] || JWB.msg('protect-none'))
					);
				} else {
					continue;
				}
			}
		}
		if (casc) protactions.push(JWB.msg('log-protect-cascading') + ' ' + JWB.msg('log-protect-casctrue'));
		protactions.push(JWB.msg('log-protect-expiry') + ' ' + (prots[0].expiry !== 'infinite' ? prots[0].expiry : JWB.msg('log-protect-indef')));
		JWB.log('protect', response.protect.title, protactions.join('\n'));
		JWB.status('done', false);
		JWB.next(response.protect.title);
	});
};
JWB.api.watch = function() {
	$('#watchNow').prop('disabled', true);
	JWB.status('watch');
	var data = {
		action: 'watch',
		title: JWB.page.name,
		token: JWB.page.watchtoken
	};
	if (JWB.page.watched) data.unwatch = true;
	JWB.api.call(data, function() {
		JWB.status('watch-'+(JWB.page.watched ? 'removed' : 'added'), true);
		JWB.page.watched = !JWB.page.watched;
		$('#watchNow').prop('disabled', false).html(JWB.msg('watch-' + (JWB.page.watched ? 'remove' : 'add')));
	});
};
JWB.api.right = function(b) {
	JWB.status('right');
	JWB.api.call({
		action: 'query',
		meta: 'tokens',
		type: 'userrights',
		format: 'json',
		formatversion: 2
	}, function(response) {
		var token = response.query.tokens.userrightstoken;
		var type = (b ? 'add' : 'remove');
		var data = {
				action: 'userrights',
				user: '#' + JWB.userid,
				reason: $('#rightSummary').val(),
				token: token,
				format: 'json',
				formatversion: 2
			};
		data[type] = JWB.test.floodFlag;
		JWB.api.call(data, function(response) {
			var change = response.userrights[type + (type.endsWith('e') ? 'd' : 'ed')],
				info = (b ? true : false);
			if (change.length === 0) info = null;
			JWB.log('flag', JWB.ns[2].name + ':' + JWB.username, info);
			JWB.status('done', true);
		});
	});
};

// For attribution: //loading.io/css (CC0)
JWB.loader = function(s, c, i) {
	var f = function(n) {
		return Math.round(n * 10) / 10;
	};
	var e = function() {
		var r = '';
		for (let j = 0; j < 12; j++) {
			r += '<div class="loader-items" style="animation: loader 1.2s linear infinite;' +
				' transform: rotate(' + (j * 30) + 'deg); animation-delay: ' + f((-1.1 + (j * 0.1))) + 's;"></div>';
		}
		return r;
	};
	var l = '<div class="loader-wrapper"' + (i ? ' id="' + i + '"' : '') + ' data-size="' + s + '"' +
			(c ? ' style="' + c + '"' : '') + '>' +
				'<div class="loader" style="transform: scale(' + (s / 80) + '); ' +
				'width: ' + (s * 2) + 'px; height: ' + s + 'px;">' +
					e() +
				'</div>' +
			'</div>';
	
	return l;
};

/***** Pagelist functions *****/

JWB.pl.iterations = 0;
JWB.pl.done = true;
JWB.pl.stopped = true; // TODO: Find out how JWB.pl.done works and merge them into one.

JWB.pl.stop = function() {
	if (JWB.pl.done) {
		JWB.pl.iterations = 0;
		$('#pagelistPopup [disabled]:not(fieldset [disabled]), #pagelistPopup legend input, #pagelistPopup button').prop('disabled', false);
		$('#pagelistPopup legend input').trigger('change');
		$('#pagelistPopup #pagelistLoader').remove();
		$('#pagelistPopup #pagelistStop').prop('disabled', true);
		JWB.pl.stopped = true;
	}
};

JWB.pl.getNamespaces = function() {
	return $('#pagelistPopup [name="namespace"]').val().join('|'); //.val() returns an array of selected options.
};

JWB.pl.getList = function(abbrs, lists, data) {
	$('#pagelistGenerate, #pagelistPopup input, #pagelistPopup select').prop('disabled', true);
	JWB.pl.iterations++;
	if (data.ask !== undefined) {
		JWB.pl.SMW(data.ask); // execute SMW call in parallel
		JWB.pl.done = false;
		data.ask = undefined;
	}
	if (!abbrs.length) {
		JWB.pl.done = true;
		return; // don't execute the rest; only a SMW query was entered.
	}
	data.action = 'query';
	var nspaces = JWB.pl.getNamespaces();
	for (var i=0;i<abbrs.length;i++) { // if namespaces are already set, use that instead (for apnamespace)
		if (nspaces) data[abbrs[i]+'namespace'] = data[abbrs[i]+'namespace'] || nspaces;
		if (abbrs[i] !== 'rn') data[abbrs[i]+'limit'] = 'max';
	}
	let linksList = lists.indexOf('links');
	if (linksList !== -1) {
		data.prop = 'links';
		lists.splice(linksList, 1);
	}
	data.list = lists.join('|');
	console.log('generating:', data);
	JWB.api.call(data, function(response) {
		var maxiterate = 100; //allow up to 100 consecutive requests at a time to avoid overloading the server.
		if (!response.query) response.query = {};
		if (response.watchlistraw) response.query.watchlistraw = response.watchlistraw; //adding some consistency
		var plist = [];
		if (response.query.pages) {
			var links;
			for (var id in response.query.pages) {
				links = response.query.pages[id].links;
				for (var link=0;link<links.length;link++) {
					plist.push(links[link].title);
				}
			}
		}
		for (var l in response.query) {
			if (l === 'pages') continue;
			for (var i=0;i<response.query[l].length;i++) {
				plist.push(response.query[l][i].title);
			}
		}
		
		if (JWB.pl.stopped) {
			JWB.pl.stop(); // Allow user to stop this function.
			return;
		}
		
		//add the result to the pagelist immediately, as opposed to saving it all up and adding in 1 go like AWB does
		$('#articleList').val(JWB.fn.trim($('#articleList').val()) + '\n' + plist.join('\n'));
		JWB.pageCount();
		
		var cont = response.continue;
		if (cont) delete cont.continue; // Unnecessary one.
		if (cont && cont.hasOwnProperty('rncontinue')) delete cont.rncontinue; // Delete random continue token, if any.
		if (cont && Object.keys(cont).length == 0) cont = undefined; // If nothing left, delete the object.
		console.log('Continue', JWB.pl.iterations, cont);
		
		if (cont && JWB.pl.iterations <= maxiterate) {
			var lists = [];
			if (response.query) { //compatibility with the code I wrote for the old query-continue. TODO: make this unnecessary?
				for (var list in response.query) {
					if (list !== 'random') lists.push(list); //add to the new array of &list= values // Excluding random.
				}
			}
			var abbrs = [];
			for (var abbr in cont) {
				data[abbr] = cont[abbr]; //add the &xxcontinue= value to the data
				if (abbr !== 'continue') {
					abbrs.push(abbr.replace('continue', '')); //find out what xx is and add it to the list of abbrs
				}
			}
			JWB.pl.getList(abbrs, lists, data); //recursive function to get every page of a list
		} else {
			if (JWB.pl.iterations > maxiterate) {
				JWB.status('pl-over-lim', true);
			} else {
				JWB.status('done', true);
			}
			JWB.pl.stop(); // if JWB.pl.done == true show stopped interface. Otherwise mark as done.
			JWB.pl.done = true;
		}
	}, function() { //on error, simply reset and let the user work with what he has
		JWB.status('done', true);
		JWB.pl.stop();
		JWB.pl.done = true;
	});
};

JWB.pl.SMW = function(query) {
	var data = {
		action: 'ask',
		query: query
	};
	JWB.api.call(data, function(response) {
		console.log(response);
		let list = response.query.results;
		let pagevar = response.query.printrequests[1];
		let pagevar_type = pagevar && pagevar.typeid;
		if (pagevar) {
			// either pagevar === undefined, or it's the first printrequest.
			pagevar = pagevar.label;
		}
		let plist = [];
		for (let l in list) {
			let page = list[l];
			let name = page.fulltext;
			let suff;
			if (pagevar) try {
				let val = page.printouts[pagevar][0];
				if (!val) continue; // this page does not contain this property.
				switch (pagevar_type) {
					case '_boo':
						suff = val == 't'; // true if 't' else false;
						break;
					case '_wpg':
						suff = val.fulltext;
						break;
					case '_dat':
						// val.raw is also available but the unconventional format makes it a lot less convenient.
						suff = val.timestamp;
						break;
					case '_qty':
						suff = val.value + ' ' + val.unit;
						break;
					case '_mlt_rec':
						// I doubt this is used anywhere, but it's not too hard to support.
						suff = val.Text.item[0];
						break;
					case '_ref_rec':
						// not supported; references contain too many properties.
						break;
					default:
						suff = val;
				}
			} catch(e) {
				console.error(e); // show error but ignore. Something is wrong in SMW query/api.
			}
			if (suff) {
				plist.push(name + '|' + suff);
			} else {
				plist.push(name);
			}
		}
		$('#articleList').val(JWB.fn.trim($('#articleList').val()) + '\n' + plist.join('\n'));
		JWB.pageCount();
		JWB.pl.stop(); // if JWB.pl.done == true show stopped interface. Otherwise mark as done.
		JWB.pl.done = true;
	});
};

//JWB.pl.getList(['wr'], ['watchlistraw'], {}) for watchlists
JWB.pl.generate = function() {
	$('#pagelistStop').after(JWB.loader(15, '', 'pagelistLoader'));
	$('#pagelistStop').prop('disabled', false);
	JWB.pl.stopped = false;
	var abbrs = [],
		lists = [],
		data = {
			continue: ''
		};
	$('#pagelistPopup fieldset').not('.disabled').each(function() {
		var list = $(this).find('legend input').attr('name');
		var abbr;
		if (list === 'linksto') { //Special case since this fieldset features 3 merged lists in 1 fieldset
			if (!$('[name="title"]').val()) return;
			$('[name="backlinks"], [name="embeddedin"], [name="imageusage"]').filter(':checked').each(function() {
				var val = this.value;
				abbrs.push(val);
				lists.push(this.name);
				data[val+'title'] = $('[name="title"]').val();
				data[val+'filterredir'] = $('[name="ltfilterredir"]:checked').val();
				if ($('[name="redirect"]').prop('checked')) data[val+'redirect'] = true;
			});
		} else if (list === 'smwask') {
			data.ask = $(this).find('#smwquery').val();
		} else if (list === 'random') {
			lists.push(list);
			abbrs.push('rn');
			data.rnlimit = $('#rnlimit').val();
			data.rnfilterredir = $('[name="rnfilterredir"]:checked').val();
		} else { //default input system
			if ($(this).find('#psstrict').prop('checked')) {
				// different list if prefixsearch is strict
				let $input = $(this).find('#psstrict');
				list = $input.attr('name');
				abbr = $input.val();
			} else {
				abbr = $(this).find('legend input').val();
			}
			lists.push(list);
			abbrs.push(abbr);
			$(this).find('input').not('legend input').each(function() {
				if ((this.type === 'checkbox' || this.type === 'radio') && this.checked === false) return;
				if (this.id == 'psstrict') return; // ignore psstrict; it only affects how pssearch is handled
				var name, val;
				if (this.id == 'cmtitle') {
					// making sure the page has a Category: prefix, in case the user left it out
					let cgns = JWB.ns[14].name; // name for Category: namespace
					if (!mw.Title) {
						if (!this.value.startsWith(cgns+':')) {
							this.value = cgns+':'+this.value;
						}
					} else {
						if (mw.Title.newFromText(this.value).namespace !== 14) {
							this.value = cgns+':'+this.value;
						}
					}
				}
				if (this.id == 'pssearch' && this.name == 'apprefix') {
					// apprefix needs namespace separate from pagename
					name = this.name;
					let nsid = 0;
					let split = this.value.split(':');
					// Not sure if val is needed, so I'm leaving it here instead of inside the if block.
					val = split[1] || split[0];
					if (!mw.Title) {
						if (split[1]) { // if a namespace is given
							for (let ns in JWB.ns) {
								if (JWB.ns[ns].name.toLowerCase() == split[0].toLowerCase()) {
									nsid = JWB.ns[ns].id;
									break;
								}
							}
						}
					} else if (this.value != '') {
						nsid = mw.Title.newFromText(this.value).namespace;
					}
					data.apnamespace = nsid;
				} else {
					name = this.name;
					val = this.value;
				}
				if (data.hasOwnProperty(name)) {
					data[name] += '|'+val;
				} else {
					data[name] = val;
				}
			});
			console.log(abbrs, lists, data);
		}
	});
	if (abbrs.length || data.ask) JWB.pl.getList(abbrs, lists, data);
	else JWB.pl.stop();
};

/***** Setup functions *****/

JWB.setup.save = function(name) {
	name = name || prompt(JWB.msg('setup-prompt', JWB.msg('setup-prompt-store')), $('#loadSettings').val());
	if (name === null) return;
	var self = JWB.settings[name] = {
		string: {},
		bool: {},
		replaces: []
	};
	//inputs with a text value
	$('textarea, input[type="text"], input[type="number"], select')
	.not('.replaces input, .replaces textarea, #editBoxArea, #settings *').each(function() {
		if (typeof $(this).val() == 'string') { 
			self.string[this.id] = this.value.replace(/\n{2,}/g, '\n');
		} else {
			self.string[this.id] = $(this).val();
		}
	});
	self.replaces = [];
	$('#replacesPopup .replaces').each(function() {
		if ($(this).find('.replaceText').val() || $(this).find('.replaceWith').val()) {
			self.replaces.push({
				replaceText: $(this).find('.replaceText').val(),
				replaceWith: $(this).find('.replaceWith').val(),
				useRegex: $(this).find('.useRegex').prop('checked'),
				regexFlags: $(this).find('.regexFlags').val(),
				ignoreNowiki: $(this).find('.ignoreNowiki').prop('checked')
			});
		}
	});
	$('input[type="radio"], input[type="checkbox"]').not('.replaces input').each(function() {
		self.bool[this.id] = this.checked;
	});
	if (!$('#loadSettings option[value="'+name+'"]').length) {
		$('#loadSettings').append('<option value="'+name+'">'+name+'</option>');
	}
	$('#loadSettings').val(name);
	console.log(self);
};

JWB.setup.apply = function(name) {
	name = name && JWB.settings[name] ? name : 'default';
	var self = JWB.settings[name];
	console.log(name, self);
	
	$('#loadSettings').val(name);
	$('.replaces + .replaces').remove(); //reset find&replace inputs
	$('.replaces .replaceText, .replaces .replaceWith').val('');
	$('.useRegex').prop('checked', false);
	$('.popupForm legend input').trigger('change'); //fix checked state of pagelist generating inputs
	
	for (let a in self.string) {
		$('#' + a).val(self.string[a]);
	}
	for (let b in self.bool) {
		$('#' + b).prop('checked', self.bool[b]);
	}
	
	for (let c = 0; c < self.replaces.length; c++) {
		if ($('.replaces').length <= c) {
			$('#moreReplaces').click();
		}
		let cur = self.replaces[c];
		let $replace = $('.replaces').eq(c);
		for (let d in cur) {
			if (typeof cur[d] === 'boolean') {
				$replace.find('.' + d).prop('checked', cur[d]);
			} else {
				$replace.find('.' + d).val(cur[d]).trigger('input');
			}
		}
	}
	
	$('.regexswitch input[type="checkbox"], .popupForm legend input, #viaJWB, #enableRETF').trigger('change'); //reset disabled inputs
};

JWB.setup.getObj = function() {
	var settings = [];
	for (var i in JWB.settings) {
		if (i != '_blank') {
			settings.push('"' + i + '": ' + JSON.stringify(JWB.settings[i]));
		}
	}
	return '{\n\t' + settings.join(',\n\t') + '\n}';
};

JWB.setup.submit = function() {
	var name = prompt(JWB.msg('setup-prompt', JWB.msg('setup-prompt-save')), $('#loadSettings').val());
	if (name === null) return;
	if (JWB.fn.trim(name) === '') name = 'default';
	JWB.setup.save(name);
	JWB.status('setup-submit');
	JWB.api.call({
		action: 'query',
		meta: 'tokens',
	}, function(response) {
		let edittoken = response.query.tokens.csrftoken;
		JWB.api.call({
			title: 'User:'+JWB.username+'/'+JWB.settingspage,
			summary: JWB.msg('setup-summary', JWB.contentLang),
			action: 'edit',
			token: edittoken,
			text: JWB.setup.getObj(),
			minor: true
		}, function(response) {
			JWB.status('done', true);
			JWB.log('edit', response.edit.title, response.edit.newrevid);
		});
	});
};

//TODO: use blob uri
JWB.setup.download = function() {
	var name = prompt(JWB.msg('setup-prompt', JWB.msg('setup-prompt-save')), $('#loadSettings').val());
	if (name === null) return;
	if (JWB.fn.trim(name) === '') name = 'default';
	JWB.setup.save(name);
	JWB.status('setup-dload');
	var url = 'data:application/json;base64,' + btoa(window.unescape(encodeURIComponent(JWB.setup.getObj())));
	var elem = $('#download-anchor')[0];
	if (HTMLAnchorElement.prototype.hasOwnProperty('download')) { //use download attribute when possible, for its ability to specify a filename
		elem.href = url;
		elem.click();
		setTimeout(function() {elem.removeAttribute('href');}, 2000);
	} else { //fallback to iframes for browsers with no support for download="" attributes
		elem = $('#download-iframe')[0];
		elem.src = url.replace('application/json', 'application/octet-stream');
		setTimeout(function() {elem.removeAttribute('src');}, 2000);
	}
	JWB.status('done', true);
};

JWB.setup.import = function(e) {
	e.preventDefault();
	var file = (e.dataTransfer||this).files[0];
	if ($(this).is('#import')) { //reset input
		this.outerHTML = this.outerHTML;
		$('#import').change(JWB.setup.import);
	}
	if (!window.hasOwnProperty('FileReader')) {
		alert(JWB.msg('old-browser'));
		JWB.status(
			'old-browser',
			'<a target="_blank" href="'+JWB.relLink('Special:MyPage/'+JWB.settingspage)+'">/'+JWB.settingspage+'</a>'
		);
		return;
	}
	if (file.name.split('.').pop().toLowerCase() !== 'json') {
		alert(JWB.msg('not-json'));
		return;
	}
	JWB.status('Processing file');
	var reader = new FileReader();
	reader.readAsText(file);
	reader.onload = function(e) {
		JWB.status('done', true);
		var data = {};
		try {
			//Exclusion regex based on http://stackoverflow.com/a/23589204/1256925
			//Removes all JS comments from the file, except when they're between quotes.
			var c = reader.result;
			data = JSON.parse(c.replace(/("[^"]*")|(\/\*[\w\W]*\*\/|\/\/[^\n]*)/g, function(match, g1) {
				if (g1) return g1;
			}));
		} catch(e) {
			alert(JWB.msg('json-err', e.message, JWB.msg('json-err-upload')));
			console.log(e); //also log the error for further info
			return;
		}
		JWB.setup.extend(data);
	};
	
	JWB.status('Processing file');
};

JWB.setup.load = function() {
	JWB.status('setup-load');
	var user = JWB.username||mw.config.get('wgUserName');
	var oldtitle = 'User:' + user + '/'+JWB.settingspage; // page title for what was used before version 4.0
	var newtitle = 'User:' + user + '/JWB-settings.json'; // new page title for all settings pages.
	var titles = oldtitle;
	// if the old title isn't JWB-settings.json, also query the new title.
	if (oldtitle !== newtitle && JWB.test.hasJSON) {
		titles += '|' + newtitle;
	}
	JWB.api.call({
		action: 'query',
		titles: titles,
		prop: 'info|revisions',
		meta: 'tokens',
		rvprop: 'content',
		indexpageids: true
	}, function(response) {
		if (JWB === false) return; //user is not allowed to use JWB
		var firstrun = !JWB.setup.initialised;
		JWB.setup.initialised = true;
		var edittoken = response.query.tokens.csrftoken;

		// determine correct page to get settings from
		var pages = response.query.pages,
			ids = response.query.pageids;
		var page, exists = true;
		if (ids.length == 2) {
			var page0 = pages[ids[0]],
				page1 = pages[ids[1]];
			var oldpage, newpage;
			if (page0.title == oldtitle) {
				oldpage = page0;
				newpage = page1;
			} else {
				oldpage = page1;
				newpage = page0;
			}
			if (oldpage.missing === undefined && oldpage.redirect === undefined) {
				// old page exists and is not a redirect
				if (newpage.missing === undefined) {
					// both old AND new page exist; throw error and load neither page.
					let jsredir = '//www.mediawiki.org/wiki/Help:Redirects#JavaScript_page_redirect';
					prompt(JWB.msg('duplicate-settings', oldtitle, newtitle, jsredir), jsredir);
					exists = false;
				} else {
					// old page exists but new page doesn't; move the page to the new location.
					JWB.setup.moveNew(oldtitle, newtitle, edittoken);
					JWB.settingspage = 'JWB-settings.json';
					return;
				}
			} else {
				// Old page either doesn't exist or is a redirect. Don't bother with it.
				page = newpage;
				exists = (page.missing === undefined);
				JWB.settingspage = 'JWB-settings.json';
			}
		} else {
			page = pages[ids[0]];
			exists = (page.missing === undefined);
		}
		if (!exists) {
			// settings page does not exist; don't load anything
			if (JWB.allowed && firstrun) JWB.setup.save('default'); //this runs when this callback returns after the init has loaded.
			JWB.status('done', true);
			return;
		}
		var data = page.revisions[0]['*'];
		if (!data) {
			// settings page is empty; don't load anything.
			if (JWB.allowed && firstrun) JWB.setup.save('default'); //this runs when this callback returns after the init has loaded.
			JWB.status('done', true);
			return;
		}
		try {
			data = JSON.parse(data);
		} catch(e) {
			alert(JWB.msg('json-err', e.message, JWB.msg('json-err-page', JWB.settingspage)) || 'JSON error:\n'+e.message);
			JWB.setup.save('default');
			JWB.status('done', true);
			return;
		}
		JWB.setup.extend(data);
		JWB.status('done', true);
	});
};

JWB.setup.moveNew = function(from, to, token) {
	(new mw.Api()).post({
		action: 'move',
		from: from,
		to: to,
		reason: JWB.msg('setup-move-summary', JWB.contentLang),
		noredirect: true, // if possible, suppress redirects; the old page will no longer be needed if the new page exists.
		movesubpages: true, // if any
		movetalk: true, // if any
		ignorewarnings: true,
		token: token,
		format: 'json'
	}).done(function(response) {
		if (response.error === undefined) {
			JWB.log('move', from, to);
			JWB.settingspage = to.split('/')[1];
			alert(JWB.msg('moved-settings', from, to, JWB.msg('tab-log')));
			JWB.setup.load(); // load settings from newly moved page.
		}
	});
};

JWB.setup.extend = function(obj) {
	$.extend(JWB.settings, obj);
	if (!JWB.settings.hasOwnProperty('default')) {
		JWB.setup.save('default');
	}
	for (var i in JWB.settings) {
		if ($('#loadSettings').find('option[value="'+i+'"]').length) continue;
		$('#loadSettings').append('<option value="'+i+'">'+i+'</option>');
	}
	JWB.setup.apply($('#loadSettings').val());
};

JWB.setup.del = function() {
	var name = $('#loadSettings').val();
	if (name === '_blank') return alert(JWB.msg('setup-delete-blank'));
	var temp = {};
	temp[name] = JWB.settings[name];
	JWB.setup.temp = $.extend({}, temp);
	delete JWB.settings[name];
	$('#loadSettings').val('default');
	if (name === 'default') {
		JWB.setup.apply('_blank');
		JWB.setup.save('default');
		JWB.status(['del-default', '<a href="javascript:JWB.setup.undelete();">'+JWB.msg('status-del-undo')+'</a>'], true);
	} else {
		$('#loadSettings').find('[value="'+name+'"]').remove();
		JWB.setup.apply();
		JWB.status(['del-setup', name, '<a href="javascript:JWB.setup.undelete();">'+JWB.msg('status-del-undo')+'</a>'], true);
	}
};

JWB.setup.undelete = function() {
	JWB.setup.extend(JWB.setup.temp);
	JWB.status('done', true);
};

/***** Main other functions *****/

//Show status message status-`action`, or status-`action[0]` with arguments `action[1:]`
JWB.status = function(action, done) {
	if (JWB.test.bot && $('#autosave').prop('checked') && !JWB.isStopped) { // Disable summary when auto-saving
		$('#summary, .editbutton, #otherButtons button:not(.starts, .stops), #rightGrant, #rightRevoke, #editBoxArea').prop('disabled', true);
	} else { // Disable box when not done (so busy loading). re-enable when done loading.
		$('#summary, #rightSummary, #rightGrant, #rightRevoke').prop('disabled', !done);
	}
	var status;
	if (action instanceof Array) {
		action[0] = 'status-'+action[0];
		status = JWB.msg.apply(this, action);
	} else {
		status = JWB.msg('status-'+action);
	}
	if (status === false) return;
	if (status) {
		if (!done) { //spinner if not done
			status += JWB.loader(10, '', 'statusLoader');
		}
	} else {
		status = action;
	}
	$('#status').html(status);
	JWB.pageCount();
	return action=='done';
};

JWB.pageCount = function() {
	if (JWB.allowed === false||!$('#articleList').length) return;
	$('#articleList').val(($('#articleList').val()||'')
		.replace(/(?<!\|.*)[ \t_]+/gm, ' ') // Duplicated spaces, underscores and tabs in names.
		.replace(/^ +| +(?=\|)|(?<!\|.*) +$/gm, '') // Leading and trailing spaces in names.
		.replace(/^\|.*$/gm, '') // Vars without corresponding names.
		.replace(/\n{2,}/gm, '\n').replace(/(?<=^.+$)\n(?!.)|(?<!.)\n(?!.)|(?<!.)\n(?=^.+$)/gm, '') // Blank lines.
	);
	JWB.list = $('#articleList').val().split('\n');
	var count = JWB.list.length;
	if (count === 1 && JWB.list[0] === '') count = 0;
	$('#totPages').html(count);
};

//Generate list of replaces to be performed
JWB.listReplaces = function() {
	JWB.replaces = [];
	$('section[data-tab="2"] .replaces, #replacesPopup .replaces').each(function() {
		var $this = $(this);
		var replace = {
			text: $this.find('.replaceText').val()
				.replace(/\$x/gi, JWB.page.pagevar) // fill in pagevar
				.replace(/\\{2}/g, '\\').replace(/\\n/g, '\n'), // handle \n -> newline
			with: $this.find('.replaceWith').val(),
			flags: $this.find('.regexFlags').val(),
			$this: $this
		};
		if (replace.text.length == 0 && replace.with.length == 0) return; // don't bother replacing 2 empty strings.
		JWB.replaces.push(replace);
	});
};

//Perform all specified find&replace actions
JWB.replace = function(input, callback) {
	if (JWB.isStopped) return;
	JWB.status('replacing');
	if (!JWB.worker.isWorking() && JWB.worker.supported) {
		// if the worker is not already working, then re-init to make sure we've not got any broken leftovers from the previous page
		JWB.worker.init();
	}
	JWB.newContent = input;
	JWB.pageCount();
	var varOffset = JWB.list[0].includes('|') ? JWB.list[0].indexOf('|') + 1 : 0;
	JWB.page.pagevar = JWB.list[0].substr(varOffset);
	JWB.replaces.forEach(function(r) {
		var replaceText = r.text;
		var replaceWith = r.with;
		var regexFlags = r.flags;
		var $this = r.$this;
		var useRegex = replaceText.length == 0 || $this.find('.useRegex').prop('checked');
		var rText = replaceText || '$'; // empty string => append (replace /$/ with text)
		if (useRegex && regexFlags.includes('_')) {
			rText = rText.replace(/[ _]/g, '[ _]'); //replaces any of [Space OR underscore] with a match for spaces or underscores.
			rText = rText.replace(/(\[[^\]]*)\[ _\]/g, '$1 _'); //in case a [ _] was placed inside another [] match, remove the [].
			regexFlags = regexFlags.replace('_', '');
		}
		//apply replaces where \n and \\ work in both regular text and regex mode.
		var rWith = replaceWith.replace(/\$x/gi, JWB.page.pagevar).replace(/\\{2}/g, '\\');
		if ($this.find('.replaceWith').is('input')) rWith = rWith.replace(/\\n/g, '\n');
		if (rWith.length === 0 && rText === '$') return;
		try {
			let replaceDone = function(result, err) {
				console.log('done replacing', result, err);
				if (err === undefined) {
					JWB.newContent = result;
					if (JWB.worker.queue.length == 0 && JWB.worker.supported) {
						// all workers are done
						JWB.status('done', true);
						callback(JWB.newContent);
					}
				} else if (err == 'Timeout exceeded') {
					if (JWB.worker.queue.length == 0 && JWB.worker.supported) {
						// all workers have exceeded their time and/or have finished
						JWB.status('done', true);
						callback(JWB.newContent); // newContent remains unmodified due to timeout.
					}
				}
			};
			if ($this.find('.ignoreNowiki').prop('checked')) {
				if (!useRegex) {
					rText = rText.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&');
					regexFlags = 'g';
				}
				JWB.worker.unparsedReplace('~'+'~~JWB.newContent', rText, regexFlags, rWith, replaceDone);
			} else if (useRegex) {
				JWB.worker.replace('~'+'~~JWB.newContent', rText, regexFlags, rWith, replaceDone);
			} else {
				JWB.newContent = JWB.newContent.split(rText).join(rWith); //global replacement without having to escape all special chars.
			}
		} catch(e) {
			console.log('Regex error:', e);
			JWB.stop();
			return JWB.status('regex-err', false);
		}
	});
	if ($('#enableRETF').prop('checked')) {
		JWB.newContent = RETF.replace(JWB.newContent);
	}
	if (!JWB.worker.isWorking()) {
		// no workers were called
		JWB.status('done', true);
		callback(JWB.newContent);
	}
};

JWB.skipRETF = function() {
	if (!$('#enableRETF').prop('checked')) return; // RETF is not enabled to begin with
	if (JWB.isStopped === true) return; // don't mess with the edit box when stopped
	$('#enableRETF').prop('checked', false);
	JWB.replace(JWB.page.content, function(newContent) {
		JWB.editPage(newContent);
		JWB.updateButtons();
		$('#enableRETF').prop('checked', true);
	});
};

// Edit the current page and pre-fill the newContent.
JWB.editPage = function(newContent) {
	$('#editBoxArea').val(newContent);
	$('#currentpage').html(JWB.msg('editbox-currentpage', JWB.page.name, encodeURIComponent(JWB.page.name)));
	if ($('#preparse').prop('checked')) {
		$('#articleList').val(JWB.fn.trim($('#articleList').val()) + '\n' + JWB.list[0]); //move current page to the bottom
		JWB.next();
		return;
	} else if (JWB.test.bot && $('#autosave').prop('checked')) {
		JWB.api.diff(function() {
			//timeout will take #throttle's value * 1000, if it's a number above 0. Currently defaults to 0.
			setTimeout(JWB.api.submit, Math.max(+$('#throttle').val() || 0, 0) * 1000, JWB.page.name);
		});
	} else {
		JWB.api.diff();
	}
};

//Adds a line to the logs tab.
JWB.log = function(action, page, info) {
	if (page === '') return; // Skipping force logging a null title.
	var d = (new Date()).toISOString().match(
		/(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2}):(\d{2})\.\d{3}Z/
	).slice(1).map(function(e) {
		return JWB.fn.timeformat(e);
	});
	d = {
		date: [d[0], d[1], d[2]].join('-'),
		time: [d[3], d[4], d[5]].join(':')
	};
	var extraInfo = '', actionStat = '';
	switch (action) {
		case 'edit':
			if (typeof info === 'undefined') {
				action = 'null';
				actionStat = 'nullEdits';
			} else {
				extraInfo = '(<a target="_blank" href="'+JWB.relLink(page, {
					diff: info
				})+'">'+JWB.msg('log-diff')+'</a>)';
				actionStat = 'pagesSaved';
			}
			break;
		case 'nobots':
			action = 'bots';
			extraInfo = '(<a target="_blank" href="//en.wikipedia.org/wiki/Template:Bots">'+JWB.msg('log-bots')+'</a>)';
			// no break;
		case 'skip':
			actionStat = 'pagesSkipped';
			break;
		case 'move':
			extraInfo = '(<a target="_blank" href="'+JWB.relLink(info)+'" title="'+info+'">'+JWB.msg('log-movedto')+'</a>)';
			break;
		case 'delete':
			action = 'delt';
			break;
		case 'undelete':
			action = 'udel';
			break;
		case 'protect':
			action = 'prot';
			extraInfo = '(<a title="'+info+'">'+JWB.msg('log-protect')+'</a>)';
			break;
		case 'flag':
			if (info === true) {
				extraInfo = '(<a title="'+JWB.msg('log-right-granted', JWB.test.floodFlag)+'">+</a>)';
			}
			if (info === false) {
				extraInfo = '(<a title="'+JWB.msg('log-right-revoked', JWB.test.floodFlag)+'">–</a>)';
			}
			if (info === null) {
				action = 'skip';
				extraInfo = '(<a title="'+JWB.msg('log-right-nochange')+'">=</a>)';
			}
			break;
	}
	actionStat = '#' + (actionStat || 'otherActions');
	$(actionStat).html(+$(actionStat).html() + 1);
	$('#actionlog tbody').append(
		'<tr class="tableRow readd-'+action+'">'+
			'<td class="timestampCell" data-time="'+[d.date, d.time].join('T')+'">'+
				'<div>'+d.date+'</div>'+
				'<div>'+d.time+'</div>'+
			'</td>'+
			'<th scope="row" class="actionCell" data-action="'+action+'">'+
				action+
			'</th>'+
			'<td class="pageNameCell">'+
				'<a target="_blank" href="'+JWB.relLink(page)+'" title="'+page+'">'+page+'</a>'+
			'</td>'+
			'<td class="extraInfoCell">'+
				extraInfo+
			'</td>'+
			'<td class="readdButtonCell">'+
				'<button class="readdButton" data-readd="'+ encodeURIComponent(page)+ '">+</button>'+
			'</td>'+
		'</tr>'
	).parents('.JWBtabc').scrollTop($('#actionlog tbody').parents('.JWBtabc')[0].scrollHeight);
	if ($('#startLog').prop('disabled')) { // Turn "readd" buttons off while editing. See also JWB.start (line ~1430).
		$('.readdButton:not(disabled)').prop('disabled', true);
	}
};

//Move to the next page in the list
JWB.next = function(nextPage) {
	// cancel any still ongoing regex match/replace functions, since we're moving on to another page.
	JWB.worker.cancelAll();
	if (JWB.fn.trim(nextPage) && !$('#skipAfterAction').prop('checked')) {
		nextPage = JWB.fn.trim(nextPage) + '\n';
	} else {
		nextPage = '';
	}
	$('#articleList').val($('#articleList').val().replace(/^.*\n?/, nextPage));
	JWB.list.splice(0, 1);
	JWB.pageCount();
	JWB.api.get(JWB.list[0].split('|')[0]);
	// JWB.highlight(); // See line 614.
};

//Stop everything, reset inputs and editor
JWB.stop = function() {
	console.trace('stopped');
	
	// Things to turn off.
	$('#stopbutton, #stopOther, #stopLog, '+ // Stop buttons.
	  '.JWBtabc[data-tab="2"] .editbutton, #watchNow, #skipRETF, '+ // Edit Save, Skip, Prev, Diff, Watch, RETF.
	  '.JWBtabc[data-tab="4"] button:not(.starts, .stops), '+ // Other Move, Del, Prot, Skip.
	  '.JWBtabc[data-tab="-2"] button').prop('disabled', true); // Readd Readd.
	
	// Things to turn on.
	$('#startbutton, #startOther, #startLog, '+ // Start buttons.
	  '#articleList, .JWBtabc[data-tab="1"] button, #import, '+ // Setup things + list.
	  '#rightGrant, #rightRevoke, .JWBtabc[data-tab="-2"] input, '+ // Edit Summary, Other RightG/R, Readd inputs.
	  '.JWBtabc[data-tab="-2"] button, .readdButton, '+ // Readd buttons, Log Readds.
	  '#replacesPopup button:not(#re101), #replacesPopup textarea, #replacesPopup input, '+ // Popup things.
	  '.JWBtabc input, .JWBtabc select').prop('disabled', false); // All inputs and selects.
	$('#autosave').change(); // Deal with #throttle.
	
	$('#importLabel').removeClass('disabled'); // This need a line for its own as it is <label class="button"> (line 1830+).
	if ($('#replacesPopup .replaces.sortable').length) $('#replacesPopup').sortable('enable');
	$('#replacesPopup .replaces').removeClass('disabled');
	
	$('#resultWindow').html('');
	$('#editBoxArea').val('');
	$('#currentpage').html(JWB.msg('editbox-currentpage', ' ', ' '));
	
	$('#readd-after, #readd-before').attr({
		max: $($('.timestampCell')[$('.timestampCell').length - 1]).attr('data-time'),
		min: $($('.timestampCell')[0]).attr('data-time')
	}).trigger('change');
	
	JWB.pl.done = true;
	JWB.pl.stop();
	JWB.status('done', true);
	JWB.isStopped = true;
};

//Start AutoWikiBrowsing
JWB.start = function() {
	JWB.pageCount();
	JWB.listReplaces(); // generate list of replacements to make
	if (JWB.list.length === 0 || (JWB.list.length === 1 && !JWB.list[0])) {
		alert(JWB.msg('no-pages-listed'));	
	} else if ($('#skipNoChange').prop('checked') && JWB.replaces.length === 0 && !$('#enableRETF').prop('checked')) {
		alert(JWB.msg('infinite-skip-notice'));
	} else {
		JWB.isStopped = false;
		if ($('#preparse').prop('checked')) {
			if (!$('#articleList').val().match('#PRE-PARSE-STOP')) {
				$('#articleList').val(JWB.fn.trim($('#articleList').val()) + '\n#PRE-PARSE-STOP'); //mark where to stop pre-parsing
			}
		} else {
			$('#preparse-reset').click();
		}
		
		// Things to turn on.
		$('#stopbutton, #stopOther, #stopLog, '+ // Stop buttons
		  '.JWBtabc[data-tab="2"] .editbutton, #watchNow, #skipRETF, '+ // Edit Save, Skip, Prev, Diff, Watch, RETF.
		  '.JWBtabc[data-tab="4"] button:not(.starts, .stops), '+ // Other Move, Del, Prot, Skip.
		  '.JWBtabc[data-tab="-2"] button').prop('disabled', false); // Readd Readd.
		
		// Things to turn off.
		$('#startbutton, #startOther, #startLog, '+ // Start buttons
		  '#articleList, .JWBtabc[data-tab="1"] button:not(#articleListTop, #articleListBot), #import, '+ // Setup things + list apart from TopBot.
		  '#rightGrant, #rightRevoke, .JWBtabc[data-tab="-2"] input, '+ // Edit Summary, Other RightG/R, Readd inputs.
		  '.JWBtabc[data-tab="-2"] button, .readdButton, '+ // Readd buttons, Log Readds.
		  '#replacesPopup button:not(#re101), #replacesPopup textarea, #replacesPopup input, '+ // Popup things.
		  '.JWBtabc input, .JWBtabc select').prop('disabled', true); // All inputs and selects.
		// $('#autosave').change(); // Deal with #throttle.
		
		$('#importLabel').addClass('disabled'); // This need a line for its own as it is <label class="button"> (line 1830+).
		if ($('#replacesPopup .replaces.sortable').length) $('#replacesPopup').sortable('disable'); // No drag'n'drop when editing.
		$('#replacesPopup .replaces').addClass('disabled');
		
		if (!JWB.test.bot || !$('#autosave').prop('checked')) {
			// keep summary / watchlist options enabled when not in autosave mode
			$('#minorEdit, #summary, #viaJWB, #watchPage, #rightGrant, #rightRevoke, '+
			  '.JWBtabc[data-tab="4"] select, .JWBtabc[data-tab="4"] input, '+
			  '.JWBtabc[data-tab="4"] checkbox, #editBoxArea').prop('disabled', false);
		}
		
		JWB.api.get(JWB.list[0].split('|')[0]);
	}
};

JWB.updateButtons = function() {
	if (!JWB.page.exists && $('#deletePage').is('.delete')) {
		$('#deletePage').removeClass('delete').addClass('undelete').html(JWB.msg('editbutton-undelete'));
		JWB.fn.blink('#deletePage'); //Indicate the button has changed
	} else if (JWB.page.exists && $('#deletePage').is('.undelete')) {
		$('#deletePage').removeClass('undelete').addClass('delete').html(JWB.msg('editbutton-delete'));
		JWB.fn.blink('#deletePage'); //Indicate the button has changed
	}
	if (!JWB.test.bot || !$('#autosave').prop('checked')) {
		if (!JWB.page.exists) {
			$('#movePage').prop('disabled', true);
		} else {
			$('#movePage').prop('disabled', false);
		}
	}
	$('#watchNow').html(JWB.msg('watch-' + (JWB.page.watched ? 'remove' : 'add')));
};

/***** Web Worker functions *****/
JWB.worker.supported = !!window.Worker; // if window.Worker exists, we can use workers. Unless CSP blocks us.
JWB.worker.queue = [];

// Load function required to properly load the worker, since directly using `new Worker(url)`
// for cross-origin URLs does not work even with CORS/CSP rules all allowing it.
// See https://stackoverflow.com/q/66188950/1256925 for this exact question
JWB.worker.load = function(callback) {
	if (JWB.worker.blob) return callback(); // already successfully built
	$.getScript(JWB.imports['worker.js'], function() {
		// Firefox does not understand try..catch for content security policy violations, so define the worker functions regardless of the blob support.
		JWB.worker.functions = JWB.worker.function();
		// the loaded script just defined JWB.worker.function; convert it to a blob url
		// Based on https://stackoverflow.com/a/33432215/1256925
		if (JWB.worker.supported) try {
			let blob = new Blob(['('+JWB.worker.function.toString()+')()'], {type: 'text/javascript'});
			JWB.worker.blob = URL.createObjectURL(blob);
			callback();
		} catch(e) {
			if (e.code == 18) {
				JWB.worker.supported = false;
			}
		}
	});
};

// Create a worker to be able to preform regex operations without hanging the current process.
// Based on https://stackoverflow.com/q/66153487/1256925
JWB.worker.init = function() {
	JWB.worker.load(function() {
		JWB.worker.worker = new Worker(JWB.worker.blob);
		JWB.worker.callback = undefined; // explicitly set to the implicit value of undefined.
		JWB.worker.timeout = 0;
		JWB.worker.queue = [];
		JWB.worker.worker.onmessage = function(e) {
			clearTimeout(JWB.worker.timeout);
			JWB.worker.timeout = 0;
			if (JWB.isStopped) {
				// we're stopped; clear the queue and stop.
				JWB.worker.queue = [];
			} else if (JWB.worker.callback !== undefined) {
				JWB.worker.callback(e.data.result, e.data.err);
			} else {
				console.error('Worker finished without callback set:', e.data, e);
			}
			JWB.worker.next(true);
		};
	});
};

// Boolean; check if the worker is currently occupied. 
JWB.worker.isWorking = function() {
	return JWB.worker.callback !== undefined;
};

// Cancel current worker's task (e.g. due to timeout)
JWB.worker.terminate = function() {
	console.log('terminating');
	let w = JWB.worker;
	w.worker.terminate();
	w.callback(undefined, 'Timeout exceeded');
	let queue = w.queue; // save old queue
	w.init(); // re-init this worker, since the previous one is presumed dead (and terminated).
	w.queue = queue; // restore queue
};

// Cancel all workers (e.g. due to no longer needing the worker's queued services)
JWB.worker.cancelAll = function() {
	JWB.worker.queue = [];
	if (JWB.worker.worker) JWB.worker.worker.terminate(); // do not call the callback.
};

// Set worker to work, or queue the worker task.
JWB.worker.do = function(msg, callback) {
	if (JWB.worker.isWorking()) {
		JWB.worker.queue.push({msg: msg, callback: callback});
	} else {
		var timelimit = parseInt($('#timelimit').val()) || 3000;
		JWB.worker.callback = callback;
		// Expand "JWB.string" into JWB['string']; to allow the string to be loaded at execution time instead of queue time.
		// Start with 3x ~ because that cannot exist as the start of an actual page
		if (msg.str && msg.str.indexOf('~'+'~~JWB.') === 0) msg.str = JWB[msg.str.substr(7)]; // For now, 1-deep expansion is sufficient.
		JWB.worker.worker.postMessage(msg);
		JWB.worker.timeout = setTimeout(function() {
			if (!JWB.worker.isWorking()) {
				console.error('Worker error');
				JWB.worker.next(true);
				return;
			}
			JWB.worker.terminate();
			JWB.worker.next(true);
		}, timelimit);
	}
};

// Execute the next task in the queue
JWB.worker.next = function(force = false) {
	if (force) {
		// force means the function that's calling next() has handled the previous worker task. Clean up after it.
		JWB.worker.callback = undefined;
	} else if (JWB.worker.isWorking()) {
		// still working and the calling function did not specify proper exit of the previous task yet.
		return false;
	}
	if (JWB.worker.queue.length === 0) return true;
	var q = JWB.worker.queue.shift();
	JWB.worker.do(q.msg, q.callback);
};

/***** Functions using workers *****/
JWB.worker.match = function(str, pattern, flags, callback) {
	if (JWB.worker.supported) {
		JWB.worker.do({cmd: 'match', str, pattern, flags}, callback);
	} else {
		if (str && str.indexOf('~'+'~~JWB.') === 0) str = JWB[str.substr(7)]; // For now, 1-deep expansion is sufficient.
		JWB.worker.functions.match(str, pattern, flags, callback);
	}
};

JWB.worker.replace = function(str, pattern, flags, rWith, callback) {
	if (JWB.worker.supported) {
		JWB.worker.do({cmd: 'replace', str, pattern, flags, rWith}, callback);
	} else {
		if (str && str.indexOf('~'+'~~JWB.') === 0) str = JWB[str.substr(7)]; // For now, 1-deep expansion is sufficient.
		JWB.worker.functions.replace(str, pattern, flags, rWith, callback);
	}
};

JWB.worker.unparsedReplace = function(str, pattern, flags, rWith, callback) {
	if (JWB.worker.supported) {
		JWB.worker.do({cmd: 'unparsedreplace', str, pattern, flags, rWith}, callback);
	} else {
		if (str && str.indexOf('~'+'~~JWB.') === 0) str = JWB[str.substr(7)]; // For now, 1-deep expansion is sufficient.
		JWB.worker.functions.unparsedreplace(str, pattern, flags, rWith, callback);
	}
};

/***** General functions *****/
//Clear all existing timers to prevent them from getting errors
JWB.fn.clearAllTimeouts = function() {
	var i = setTimeout(function() {
		return void(0);
	}, 1000);
	for (var n=0;n<=i;n++) {
		clearTimeout(n);
		clearInterval(n);
	}
	console.log('Cleared all running intervals up to index', i);
};

//Filter an array to only contain unique values.
JWB.fn.uniques = function(arr) {
	var a = [];
	for (var i=0, l=arr.length; i<l; i++) {
		if (!a.includes(arr[i]) && arr[i] !== '') {
			a.push(arr[i]);
		}
	}
	return a;
};

// Filter an array to remove non-duplicated values and uniquify the rest.
JWB.fn.duplicates = function(arr) {
	var a = [];
	var b = [];
	for (let i = 0; i < arr.length; i++) {
		if (!a.includes(arr[i])) {
			a.push(arr[i]);
		} else if (!b.includes(arr[i])) {
			b.push(arr[i]);
		}
	}
	return b;
};

// code taken directly from [[Template:Bots]] and changed structurally (not functionally) for readability.
// The user in this case is "JWB" to deny this script.
// the user parameter is still kept as an optional parameter to maintain functionality as given on that template page.
JWB.fn.allowBots = function(text, user = 'JWB') {
	var usr = user.replace(/([\(\)\*\+\?\.\-\:\!\=\/\^\$])/g, '\\$1');
	if (!new RegExp('\\{\\{\\s*(nobots|bots[^}]*)\\s*\\}\\}', 'i').test(text))
		return true;
	if (new RegExp('\\{\\{\\s*bots\\s*\\|\\s*deny\\s*=\\s*([^}]*,\\s*)*' + usr + '\\s*(?=[,\\}])[^}]*\\s*\\}\\}', 'i').test(text))
		return false;
	else
		return new RegExp('\\{\\{\\s*((?!nobots)|bots(\\s*\\|\\s*allow\\s*=\\s*((?!none)|([^}]*,\\s*)*' + usr +
			'\\s*(?=[,\\}])[^}]*|all))?|bots\\s*\\|\\s*deny\\s*=\\s*(?!all)[^}]*|bots\\s*\\|\\s*optout=(?!all)[^}]*)\\s*\\}\\}', 'i').test(text);
};

//Prepends zeroes until the number has the desired length of len (default 2)
JWB.fn.timeformat = function(n, len = 2) {
	n = n.toString();
	return n.length < len ? Array(len-n.length+1).join('0')+n : n;
};

JWB.fn.blink = function(el, t) {
	t=t?t:500;
	$(el).prop('disabled', true)
		.children().animate({opacity:'0.1'}, t-100)
		.animate({opacity:'1'}, t)
		.animate({opacity:'0.1'}, t-100)
		.animate({opacity:'1'}, t);
	setTimeout(function() {
		$(el).prop('disabled', false);
	}, t*4-400);
};

JWB.fn.setSelection = function(el, start, end, dir) {
	dir = dir||'none'; //Default value
	end = end||start; //If no end is specified, assume the caret is placed without creating text selection.
	if (el.setSelectionRange) {
		el.focus();
		el.setSelectionRange(start, end, dir);
	} else if (el.createTextRange) {
		var rng = el.createTextRange();
		rng.collapse(true);
		rng.moveStart('character', start);
		rng.moveEnd('character', end);
		rng.select();
	}
};

JWB.fn.scrollSelection = function(el, index) { //function to fix scrolling to selection - doesn't do that automatically.
	var newEl = document.createElement('textarea'); //create a new textarea to simulate the same conditions
	var elStyle = getComputedStyle(el);
	newEl.style.height = elStyle.height; //copy over size-influencing styles
	newEl.style.width = elStyle.width;
	newEl.style.lineHeight = elStyle.lineHeight;
	newEl.style.fontSize = elStyle.fontSize;
	newEl.value = el.value.substr(0, index);
	document.body.appendChild(newEl); //needs to be added to the HTML for the scrollHeight and clientHeight to work.
	if (newEl.scrollHeight != newEl.clientHeight) {
		el.scrollTop = newEl.scrollHeight - 2;
	} else {
		el.scrollTop = 0;
	}
	newEl.remove(); //clean up the mess I've made
};

// $.trim() is deprecated as of jQuery 3.5.
JWB.fn.trim = function(s) {
	return (s === null ? '' : (s + '').trim());
};

// Return an URL to a local page.
JWB.relLink = function(page, param) {
	return JWB.slashwiki.replace(
		'$1',
		encodeURIComponent(page.replace(/ /g, '_'))
	) + ($.param(param) ? '?' + $.param(param) : '');
};
// Override default function if both mw.Title and mw.Uri are found.
if (mw.Title && mw.Uri) JWB.relLink = function(page, param) {
	var ppage = mw.Title.newFromText(page).toText();
	if (!ppage) return null;
	return (new mw.Uri(JWB.index_php)).extend({
		title: page
	}).extend(param).getRelativePath();
};

//i18n function
JWB.msg = function(message) {
	var args = arguments;
	var lang = JWB.lang;
	if (message instanceof Array) {
		lang = message[1];
		message = message[0];
	}
	if (lang == 'qqx') return '(' + message + ')';
	if (!JWB.messages || !JWB.messages.en) return '\u29FC'+message+'\u29FD'; // same surrounding <> as used in mw.msg();
	var msg;
	if (JWB.messages.hasOwnProperty(lang) && JWB.messages[lang].hasOwnProperty(message)) {
		msg = JWB.messages[lang][message];
	} else {
		msg = (JWB.messages.en.hasOwnProperty(message)) ? JWB.messages.en[message] : '\u29FC'+message+'\u29FD';
	}
	msg = msg.replace(/\$(\d+)/g, function(match, num) {
		return args[+num] || match;
	});
	return msg;
};

/***** Init *****/

JWB.init = function() {
	console.log(JWB.messages.en, !!JWB.messages.en);
	JWB.setup.load();
	JWB.worker.init();
	JWB.fn.clearAllTimeouts();

	var findreplace = function(a) {
		return '<div class="replaces'+(JWB.test.sortable ? ' sortable' : '')+'"'+(a === false ? ' style="display: none;"' : '')+'>'+
				'<label class="replaceTextLabel inputFlex">'+
					'<span class="flexCenter">'+JWB.msg('label-rtext')+'</span>'+
					(typeof a === 'undefined' ?
						'<input type="text" class="replaceText">'
					:
						'<textarea class="replaceText"></textarea>'
					)+
				'</label>'+
				'<label class="replaceWithLabel inputFlex">'+
					'<span class="flexCenter">'+JWB.msg('label-rwith')+'</span>'+
					(typeof a === 'undefined' ?
						'<input type="text" class="replaceWith">'
					:
						'<textarea class="replaceWith"></textarea>'
					)+
				'</label>'+
				'<div class="switches">'+
					(typeof a === 'undefined' ? '' :
						'<button class="removeThis">'+JWB.msg('button-remove-this')+'</button>'
					)+
					'<div class="regexswitch">'+
						'<label data-label="checkbox">'+
							'<input type="checkbox" class="useRegex">'+
							'<span class="flexCenter checkboxLabel">'+JWB.msg('label-useregex')+'</span>'+
						'</label>'+
						'<div class="divisorWrapper" style="display: none;"><span class="divisor"></span></div>'+
						'<label class="regexFlagsLabel" title="'+JWB.msg('tip-regex-flags')+'" style="display: none;">'+
							'<span class="flexCenter">'+JWB.msg('label-regex-flags')+'</span>'+
							'<input type="text" class="regexFlags" value="g">'+ //default: global replacement
						'</label>'+
					'</div>'+
					'<div class="ignoreswitch">'+
						'<label data-label="checkbox" title="'+JWB.msg('tip-ignore-comment')+'">'+
							'<input type="checkbox" class="ignoreNowiki">'+
							'<span class="flexCenter checkboxLabel">'+JWB.msg('label-ignore-comment')+'</span>'+
						'</label>'+
					'</div>'+
				'</div>'+
			'</div>';
	};
	
	JWB.protection.other.fn.levels = function(type) {
		var list = (
			type === 'edit' ? '' :
			'<option value="" selected>('+JWB.msg('protect-like-edit')+')</option>'
		);
		for (let i = 0; i < JWB.protection.levels.length; i++) {
			list += (
				'<option value="'+
					(JWB.protection.levels[i] == '' ? 'all' : JWB.protection.levels[i]) + '"' +
					(JWB.protection.levels[i] == '' && type === 'edit' ? ' selected' : '') +
				'>' + // JWB.msg('protect-' + JWB.protection.levels[i]) as output for false? See JWB.protection.other.levels.
					(JWB.protection.levels[i].length === 0 ? JWB.msg('protect-none') : JWB.protection.levels[i]) +
				'</option>'
			);
		}
		return list;
	};
	JWB.protection.other.fn.types = function() {
		var list = [];
		for (let i = 0; i < JWB.protection.types.length; i++) {
			if (JWB.protection.types[i] == 'create') continue;
			list.push(
				'<div class="otherOptionLabels">'+
					'<label class="flexCenter" for="'+JWB.protection.types[i]+'Prot">'+
						JWB.msg('protect-' + JWB.protection.types[i])+
					'</label>'+
					'<select class="protectSelect" id="'+JWB.protection.types[i]+'Prot">'+
						JWB.protection.other.fn.levels(JWB.protection.types[i])+
					'</select>'+
				'</div>'
			);
		}
		return list.join('');
	};
	
	JWB.time = (new Date()).toISOString().match(/(\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2})\.\d{3}Z/)[1];
	
	var nslist = (function() {
		var list = [];
		for (let i in JWB.ns) {
			if (parseInt(i) < 0) continue; //No Special: or Media: in the list
			list.push(
				'<option value="'+JWB.ns[i].id+'" selected>'+
					(JWB.ns[i].name || '('+JWB.msg('namespace-main')+')')+
				'</option>'
			);
		}
		return list.join('');
	})();
	
	JWB.limit.function = function(b) {
		if (b) return (JWB.limit.value ? JWB.limit.value : 500);
		else return (JWB.limit.min ? JWB.limit.min : 1);
	};
	
	/***** Interface *****/
	
	document.title = 'Javascript Wiki Browser – ' + mw.config.get('wgSiteName');
	
	$('body').html(
		'<article id="resultWindow"></article>'+
		'<main id="inputsWindow">'+
			'<div id="inputsBox">'+
				'<aside id="articleBox">'+
					'<label for="articleList" class="boxLabel">'+JWB.msg('pagelist-caption')+'</label>'+
					'<textarea id="articleList"></textarea>'+
				'</aside>'+
				'<section id="tabs">'+
					'<nav id="tabholder">'+
						'<div id="positive">'+
							// '<div class="active" data-nav="1">'+
								'<span class="JWBtab" data-tab="1">'+JWB.msg('tab-setup')+'</span>'+
								'<span class="JWBtab active" data-tab="2">'+JWB.msg('tab-editing')+'</span>'+
								'<span class="JWBtab" data-tab="3">'+JWB.msg('tab-skip')+'</span>'+
								'<span class="JWBtab" data-tab="4">'+JWB.msg('tab-other')+'</span>'+
							// '</div>'+
							// '<div data-nav="2">'+
							// 	'<span class="JWBtab" data-tab="5">'+JWB.msg('tab-')+'</span>'+
							// 	'<span class="JWBtab" data-tab="6">'+JWB.msg('tab-')+'</span>'+
							// 	'<span class="JWBtab" data-tab="7">'+JWB.msg('tab-')+'</span>'+
							// 	'<span class="JWBtab" data-tab="8">'+JWB.msg('tab-')+'</span>'+
							// '</div>'+
						'</div>'+
						// '<div id="zero">'+
						// 	'<span class="JWBtab">'+
						// 		'<img src="//upload.wikimedia.org/wikipedia/commons/0/0e/Feather-arrows-arrow-right-circle.svg" '+
						// 		'title="' + JWB.msg('tab-switch') + '">'+
						// 	'</span>'+
						// '</div>'+
						'<div id="negative">'+
							'<span class="JWBtab" data-tab="-2">'+JWB.msg('tab-readd')+'</span>'+
							'<span class="JWBtab log" data-tab="-1">'+JWB.msg('tab-log')+'</span> '+
						'</div>'+
					'</nav>'+
					'<section class="JWBtabc" data-tab="1"></section>'+
					'<section class="JWBtabc active" data-tab="2"></section>'+
					'<section class="JWBtabc" data-tab="3"></section>'+
					'<section class="JWBtabc" data-tab="4"></section>'+
					// '<section class="JWBtabc" data-tab="5"></section>'+
					// '<section class="JWBtabc" data-tab="6"></section>'+
					// '<section class="JWBtabc" data-tab="7"></section>'+
					// '<section class="JWBtabc" data-tab="8"></section>'+
					'<section class="JWBtabc" data-tab="-2"></section>'+
					'<section class="JWBtabc log" data-tab="-1"></section>'+
					'<footer id="statusBar"><div id="status">'+JWB.msg('status-done')+'</div></footer>'+
				'</section>'+
				'<aside id="editBox">'+
					'<label for="editBoxArea" class="boxLabel">'+
						JWB.msg('editbox-caption')+' - '+
						'<span id="currentpage">'+JWB.msg('editbox-currentpage', ' ', ' ')+'</span>'+
					'</label>'+
					'<textarea id="editBoxArea" disabled></textarea>'+
				'</aside>'+
			'</div>'+
		'</main>'+
		'<footer id="stats">'+
			'<label class="statsLabel" for="totPages">'+
				'<span>'+JWB.msg('stat-pages')+'</span>'+
				'<span class="statsNumber" id="totPages">'+ 0 +'</span>'+
			'</label>'+
			'<label class="statsLabel" for="pagesSaved">'+
				'<span>'+JWB.msg('stat-save')+'</span>'+
				'<span class="statsNumber" id="pagesSaved">'+ 0 +'</span>'+
			'</label>'+
			'<label class="statsLabel" for="nullEdits">'+
				'<span>'+JWB.msg('stat-null')+'</span>'+
				'<span class="statsNumber" id="nullEdits">'+ 0 +'</span>'+
			'</label>'+
			'<label class="statsLabel" for="pagesSkipped">'+
				'<span>'+JWB.msg('stat-skip')+'</span>'+
				'<span class="statsNumber" id="pagesSkipped">'+ 0 +'</span>'+
			'</label>'+
			'<label class="statsLabel" for="otherActions">'+
				'<span>'+JWB.msg('stat-other')+'</span>'+
				'<span class="statsNumber" id="otherActions">'+ 0 +'</span>'+
			'</label>'+
		'</footer>'+
		'<div id="overlay" style="display: none;"></div>'+
		'<section class="JWBpopup" id="replacesPopup" style="display: none;">'+
			'<div class="sticky">'+
				'<button id="moreReplaces">'+JWB.msg('button-more-fields')+'</button>'+
				'<button id="re101">'+JWB.msg('button-re101')+'</button>'+
			'</div>'+
			'<hr id="moreReplacesBorder">'+
			findreplace(true)+
		'</section>'+
		'<section class="JWBpopup" id="pagelistPopup" style="display: none;">'+
			'<form action="#" class="popupForm" id="pagelistForm"></form>'+
		'</section>'+
		'<section class="JWBpopup" id="filterPopup" style="display: none;">'+
			'<form action="#" class="popupForm" id="filterForm"></form>'+
		'</section>'
	);
	
	$('.JWBtabc[data-tab="1"]').html(
		'<fieldset id="pagelist">'+
			'<legend>'+JWB.msg('label-pagelist')+'</legend>'+
			'<div class="collapsibleFieldset">'+
				'<div id="removeDupesUniqs">'+
					'<label for="removeDupesUniqsButtons" class="flexCenter">'+JWB.msg('label-remove')+'</label>'+
					'<span id="removeDupesUniqsButtons">'+
						'<button id="removeDupes" title="'+JWB.msg('tip-remove-dupes')+'">'+JWB.msg('button-remove-dupes')+'</button>'+
						'<button id="removeUniqs" title="'+JWB.msg('tip-remove-uniqs')+'">'+JWB.msg('button-remove-uniqs')+'</button>'+
						'<div class="divisorWrapper"><span class="divisor"></span></div>'+
						'<button id="removeUndo" title="'+JWB.msg('tip-remove-undo')+'">'+JWB.msg('button-remove-undo')+'</button>'+
					'</span>'+
				'</div>'+
				'<div id="preparseSettings">'+
					'<label data-label="checkbox" title="'+JWB.msg('tip-preparse')+'">'+
						'<input type="checkbox" id="preparse">'+
						'<span class="flexCenter checkboxLabel">'+JWB.msg('preparse')+'</span>'+
					'</label>'+
					'<div class="divisorWrapper"><span class="divisor"></span></div>'+
					'<button id="preparse-reset" title="'+JWB.msg('tip-preparse-reset')+'">'+JWB.msg('preparse-reset')+'</button>'+
				'</div>'+
				'<div id="articleListButtons">'+
					'<button class="popupButton" id="pagelistButton">'+JWB.msg('button-pagelist-generate')+'</button>'+
					'<div class="divisorWrapper"><span class="divisor"></span></div>'+
					'<span id="articleListTopBot">'+
						'<button id="articleListTop">'+JWB.msg('button-pagelist-top')+'</button>'+
						'<button id="articleListBot">'+JWB.msg('button-pagelist-bot')+'</button>'+
					'</span>'+
					'<div class="divisorWrapper"><span class="divisor"></span></div>'+
					'<span id="articleListSortFilter">'+
						'<button id="sortArticles">'+JWB.msg('button-sort')+'</button>'+
						'<button class="popupButton" id="filterButton">'+JWB.msg('button-filter')+'</button>'+
					'</span>'+
				'</div>'+
			'</div>'+
		'</fieldset>'+
		'<fieldset id="settings">'+
			'<legend>'+JWB.msg('label-settings')+'</legend>'+
			'<div class="collapsibleFieldset">'+
				'<div>'+
					'<button class="withImage" id="saveAs" title="'+JWB.msg('setup-store-tip')+'">'+JWB.msg('setup-store')+'</button>'+
					'<div class="divisorWrapper"><span class="divisor"></span></div>'+
					'<button class="withImage" id="updateSetups" title="'+JWB.msg('setup-update-tip', JWB.settingspage)+'">'+JWB.msg('setup-update')+'</button>'+
					'<div class="divisorWrapper"><span class="divisor"></span></div>'+
					'<label class="button withImage" id="importLabel" title="'+JWB.msg('setup-import-tip')+'">'+
						'<input type="file" id="import" accept=".json">'+
						JWB.msg('setup-import')+
					'</label>'+
				'</div>'+
				'<hr>'+
				'<div>'+
					'<label id="loadSettingsLabel">'+
						'<span class="flexCenter">'+JWB.msg('load-settings')+'</span>'+
						'<select id="loadSettings">'+
							'<option value="default" selected>'+JWB.msg('setup-default')+'</option>'+
							'<option value="_blank">'+JWB.msg('setup-blank')+'</option>'+
						'</select>'+
					'</label>'+
					'<div class="divisorWrapper"><span class="divisor"></span></div>'+
					'<button class="withImage" id="deleteSetup" title="'+JWB.msg('setup-delete-tip')+'">'+JWB.msg('setup-delete')+'</button>'+
				'</div>'+
				'<hr>'+
				'<div>'+
					'<button class="withImage" id="saveToWiki">'+JWB.msg('setup-save')+'</button>'+
					'<div class="divisorWrapper"><span class="divisor"></span></div>'+
					'<button class="withImage" id="download">'+JWB.msg('setup-download')+'</button>'+
					'<div id="downloads">'+
						'<a download="JWB-settings.json" target="_blank" id="download-anchor"></a>'+
						'<iframe id="download-iframe"></iframe>'+
					'</div>'+
				'</div>'+
			'</div>'+
		'</fieldset>'+
		'<fieldset id="limits">'+
			'<legend>'+JWB.msg('label-limits')+'</legend>'+
			'<div class="collapsibleFieldset">'+
				'<label id="timelimitLabel" title="'+JWB.msg('tip-time-limit')+'">'+
					'<span class="flexCenter">'+JWB.msg('time-limit')+'</span>'+
					'<input type="number" id="timelimit" value="3000" min="0">'+
				'</label>'+
				'<label id="sizelimitLabel" title="'+JWB.msg('tip-diff-size-limit')+'">'+
					'<span class="flexCenter">'+JWB.msg('diff-size-limit')+'</span>'+
					'<input type="number" id="sizelimit" value="0" min="0">'+
				'</label>'+
			'</div>'+
		'</fieldset>'
	);
	$('.JWBtabc[data-tab="2"]').html(
		'<label data-label="checkbox" class="floatLabel" id="minorEditLabel">'+
			'<input type="checkbox" id="minorEdit" checked>'+
			'<span class="flexCenter checkboxLabel">'+JWB.msg('minor-edit')+'</span>'+
		'</label>'+
		'<label class="fullwidthFlex' + (JWB.test.dev ? '' : ' viaJWB') + '" id="summaryLabel">'+
			'<span class="flexStart">'+JWB.msg('edit-summary')+'</span>'+
			'<input type="text" class="fullwidth" id="summary" maxlength="' + (JWB.test.dev ? 500 : 490) + '">'+
		'</label>'+
		// ' <input type="checkbox" id="viaJWB" title="'+JWB.msg('tip-via-JWB')+'">'+ // Commenting this out. See line 45.
		'<div id="watchOption">'+
			'<select id="watchPage">'+
				'<option value="watch">'+JWB.msg('watch-watch')+'</option>'+
				'<option value="unwatch">'+JWB.msg('watch-unwatch')+'</option>'+
				'<option value="nochange" selected>'+JWB.msg('watch-nochange')+'</option>'+
				'<option value="preferences">'+JWB.msg('watch-preferences')+'</option>'+
			'</select>'+
			'<div class="divisorWrapper"><span class="divisor"></span></div>'+
			'<button id="watchNow" disabled accesskey="w">'+
				JWB.msg('watch-add')+
			'</button>'+
		'</div>'+
		(!JWB.test.bot ? '' :
			'<div id="throttleOption">'+
				'<label data-label="checkbox">'+
					'<input type="checkbox" id="autosave">'+
					'<span class="flexCenter checkboxLabel">'+JWB.msg('auto-save')+'</span> '+
				'</label>'+
				'<div class="divisorWrapper"><span class="divisor"></span></div>'+
				'<label id="throttleLabel" title="'+JWB.msg('tip-save-interval')+'">'+
					JWB.msg('save-interval', '<input type="number" min="0" value="0" id="throttle" disabled>')+
				'</label>'+
			'</div>'
		)+
		'<div id="buttonsArea">'+
			'<div id="mainButtons">'+
				'<div>'+
					'<button class="editbutton" id="skipButton" disabled accesskey="n">'+JWB.msg('editbutton-skip')+'</button>'+
					'<button class="editbutton" id="submitButton" disabled accesskey="s">'+JWB.msg('editbutton-save')+'</button>'+
				'</div>'+
				'<div>'+
					'<button class="editbutton" id="previewButton" disabled accesskey="p">'+JWB.msg('editbutton-preview')+'</button>'+
					'<button class="editbutton" id="diffButton" disabled accesskey="d">'+JWB.msg('editbutton-diff')+'</button>'+
				'</div>'+
			'</div>'+
			'<div>'+
				'<span class="startstops" id="startstop">'+
					'<button class="starts" id="startbutton" accesskey="a">'+JWB.msg('editbutton-start')+'</button>'+
					'<button class="stops" id="stopbutton" disabled accesskey="q">'+JWB.msg('editbutton-stop')+'</button> '+
				'</span>'+
				'<button class="popupButton" id="replacesButton">'+JWB.msg('button-open-popup')+'</button>'+
			'</div>'+
		'</div>'+
		findreplace()+
		'<hr>'+
		'<div id="RETF">'+
			'<label data-label="checkbox">'+
				'<input type="checkbox" id="enableRETF">'+
				'<span class="flexCenter checkboxLabel">'+JWB.msg(
					'label-enable-RETF', 
					'<a href="/wiki/Project:AutoWikiBrowser/Typos" target="_blank">'+
						JWB.msg('label-RETF')+
					'</a>'
				)+'</span>'+
			'</label>'+
			'<img src="//upload.wikimedia.org/wikipedia/commons/3/39/Feather-core-refresh-cw.svg" '+
			'id="refreshRETF" title="'+JWB.msg('tip-refresh-RETF')+'">'+
		'</div>'+
		'<button id="skipRETF" title="'+JWB.msg('tip-skip-RETF')+'" disabled>'+JWB.msg('skip-RETF')+'</button>'
	);
	$('.JWBtabc[data-tab="3"]').html(
		'<fieldset>'+
			'<legend>'+JWB.msg('label-redirects')+'</legend>'+
			'<div class="collapsibleFieldset">'+
				'<div class="tripleRadio">'+
					'<label data-label="radio" title="'+JWB.msg('tip-redirects-follow')+'">'+
						'<input type="radio" class="redirects" value="follow" name="redir" id="redir-follow">'+
						'<span class="flexCenter radioLabel">'+JWB.msg('redirects-follow')+'</span>'+
					'</label>'+
					'<label data-label="radio" title="'+JWB.msg('tip-redirects-skip')+'">'+
						'<input type="radio" class="redirects" value="skip" name="redir" id="redir-skip">'+
						'<span class="flexCenter radioLabel">'+JWB.msg('redirects-skip')+'</span>'+
					'</label>'+
					'<label data-label="radio" title="'+JWB.msg('tip-redirects-edit')+'">'+
						'<input type="radio" class="redirects" value="edit" name="redir" id="redir-edit" checked>'+
						'<span class="flexCenter radioLabel">'+JWB.msg('redirects-edit')+'</span>'+
					'</label>'+
				'</div>'+
			'</div>'+
		'</fieldset>'+
		'<fieldset>'+
			'<legend>'+JWB.msg('label-skip-when')+'</legend>'+
			'<div class="collapsibleFieldset">'+
				'<label data-label="checkbox">'+
					'<input type="checkbox" id="skipNoChange">'+
					'<span class="flexCenter checkboxLabel">'+JWB.msg('skip-no-change')+'</span>'+
				'</label>'+
				'<div class="tripleRadio">'+
					'<label data-label="radio">'+
						'<input type="radio" id="exists-yes" name="exists" value="yes">'+
						'<span class="flexCenter radioLabel">'+JWB.msg('skip-exists-yes')+'</span>'+
					'</label> '+
					'<label data-label="radio">'+
						'<input type="radio" id="exists-neither" name="exists" value="neither">'+
						'<span class="flexCenter radioLabel">'+JWB.msg('skip-exists-neither')+'</span>'+
					'</label>'+
					'<label data-label="radio">'+
						'<input type="radio" id="exists-no" name="exists" value="no" checked>'+
						'<span class="flexCenter radioLabel">'+JWB.msg('skip-exists-no')+'</span>'+
					'</label> '+
				'</div>'+
				(JWB.test.sysop?
					'<label data-label="checkbox">'+
						'<input type="checkbox" id="skipAfterAction" checked>'+
						'<span class="flexCenter checkboxLabel">'+JWB.msg('skip-after-action')+'</span>'+
					'</label>'
				:'')+
				'<hr>'+
				'<label class="fullwidthFlex">'+
					'<span class="flexStart">'+JWB.msg('skip-contains')+'</span>'+
					'<input type="text" class="fullwidth" id="skipContains">'+
				'</label>'+
				'<label class="fullwidthFlex">'+
					'<span class="flexStart">'+JWB.msg('skip-not-contains')+'</span>'+
					'<input type="text" class="fullwidth" id="skipNotContains">'+
				'</label>'+
				'<div class="regexswitch">'+
					'<label data-label="checkbox">'+
						'<input type="checkbox" id="containRegex">'+
						'<span class="flexCenter checkboxLabel">'+JWB.msg('label-useregex')+'</span>'+
					'</label>'+
					// '<a class="re101" href="http://regex101.com/#javascript" target="_blank">?</a>'+
					'<div class="divisorWrapper" style="display: none;"><span class="divisor"></span></div>'+
					'<label class="regexFlagsLabel" title="'+JWB.msg('tip-regex-flags')+'" style="display: none;">'+
						'<span class="flexCenter">'+JWB.msg('label-regex-flags')+'</span>'+
						'<input type="text" id="containFlags">'+
					'</label>'+
				'</div>'+
				'<hr>'+
				'<label class="fullwidthFlex" title="'+JWB.msg('skip-cg-prefix')+'">'+
					'<span class="flexStart">'+JWB.msg('skip-category')+'</span>'+
					'<input type="text" class="fullwidth" id="skipCategories">'+
				'</label>'+
			'</div>'+
		'</fieldset>'
	);
	if (JWB.test.sysop || (JWB.test.hasFlood || JWB.test.flag || JWB.test.dev)) $('.JWBtabc[data-tab="4"]').html(
		'<fieldset>'+
			'<legend>'+JWB.msg('move-header')+'</legend>'+
			'<div class="collapsibleFieldset">'+
				'<div class="otherOptionLabels">'+
					'<label for="movealsoOptions">'+JWB.msg('move-also')+'</label>'+
					'<div id="movealsoOptions">'+
						'<label data-label="checkbox">'+
							'<input type="checkbox" id="movetalk" checked>'+
							'<span class="flexCenter checkboxLabel">'+JWB.msg('move-talk-page')+'</span>'+
						'</label> '+
						'<label data-label="checkbox">'+
							'<input type="checkbox" id="movesubpage">'+
							'<span class="flexCenter checkboxLabel">'+JWB.msg('move-subpage')+'</span>'+
						'</label>'+
					'</div>'+
				'</div>'+
				'<div class="otherOptionLabels">'+
					'<label for="moveTo">'+JWB.msg('move-new-name')+'</label>'+
					'<input type="text" id="moveTo">'+
				'</div>'+
				'<label data-label="checkbox">'+
					'<input type="checkbox" id="suppressRedir">'+
					'<span class="flexCenter checkboxLabel">'+JWB.msg('move-redir-suppress')+'</span>'+
				'</label>'+
			'</div>'+
		'</fieldset>'+
		'<fieldset>'+
		'<legend>'+JWB.msg('protect-header')+'</legend>'+
			'<div class="collapsibleFieldset">'+
				JWB.protection.other.fn.types()+
				'<div class="otherOptionLabels">'+
					'<label class="flexCenter" for="protectExpiry">'+JWB.msg('protect-expiry')+'</label>'+
					'<input type="text" id="protectExpiry">'+
				'</div>'+
				'<label data-label="checkbox">'+
					'<input type="checkbox" id="cascadingProtection">'+
					'<span class="flexCenter checkboxLabel">'+JWB.msg('protect-cascading')+'</span>'+
				'</label>'+
			'</div>'+
		'</fieldset>'+
		(JWB.test.hasFlood || JWB.test.flag || JWB.test.dev ?
		'<fieldset>'+
		'<legend>'+JWB.msg('right-header')+'</legend>'+
			'<div class="collapsibleFieldset">'+
				'<div class="otherOptionLabels">'+
					'<label for="rightSummary">'+JWB.msg('edit-summary')+'</label>'+
					'<span id="rightGrantRevoke">'+
						'<input type="text" id="rightSummary">'+
						'<button id="rightGrant" title="'+JWB.msg('right-grant', JWB.test.floodFlag)+'">+</button>'+
						'<button id="rightRevoke" title="'+JWB.msg('right-revoke', JWB.test.floodFlag)+'">–</button>'+
					'</span>'+
				'</div>'+
			'</div>'+
		'</fieldset>'
		: '' ) +
		'<div id="otherButtons">'+
			'<button id="movePage" disabled accesskey="m">'+JWB.msg('editbutton-move')+'</button> '+
			'<button class="delete" id="deletePage" disabled accesskey="x">'+JWB.msg('editbutton-delete')+'</button> '+
			'<button id="protectPage" disabled accesskey="z">'+JWB.msg('editbutton-protect')+'</button> '+
			'<button id="skipPage" disabled title="['+JWB.tooltip+'n]">'+JWB.msg('editbutton-skip')+'</button>'+
			'<button class="starts" id="startOther">'+JWB.msg('editbutton-start')+'</button> '+
			'<button class="stops" id="stopOther" disabled>'+JWB.msg('editbutton-stop')+'</button> '+
		'</div>'
	);
	$('.JWBtabc[data-tab="-2"]').html(
		'<fieldset>'+
			'<legend>'+JWB.msg('readd-header')+'</legend>'+
			'<div class="collapsibleFieldset">'+
				'<div>'+
					'<div class="readdLine">'+
						'<label data-label="checkbox">'+
							'<input type="checkbox" class="readdCheckboxes" id="readd-edit">'+
							'<span class="flexCenter checkboxLabel">'+JWB.msg('readd-edit')+'</span>'+
						'</label>'+
						'<label data-label="checkbox">'+
							'<input type="checkbox" class="readdCheckboxes" id="readd-null">'+
							'<span class="flexCenter checkboxLabel">'+JWB.msg('readd-null')+'</span>'+
						'</label>'+
						'<label data-label="checkbox">'+
							'<input type="checkbox" class="readdCheckboxes" id="readd-move">'+
							'<span class="flexCenter checkboxLabel">'+JWB.msg('readd-move')+'</span>'+
						'</label>'+
					'</div>'+
					'<div class="readdLine">'+
						'<label data-label="checkbox">'+
							'<input type="checkbox" class="readdCheckboxes" id="readd-skip">'+
							'<span class="flexCenter checkboxLabel">'+JWB.msg('readd-skip')+'</span>'+
						'</label>'+
						'<label data-label="checkbox">'+
							'<input type="checkbox" class="readdCheckboxes" id="readd-bots">'+
							'<span class="flexCenter checkboxLabel">'+JWB.msg('readd-bots')+'</span>'+
						'</label>'+
						'<label data-label="checkbox">'+
							'<input type="checkbox" class="readdCheckboxes" id="readd-flag">'+
							'<span class="flexCenter checkboxLabel">'+JWB.msg('readd-flag')+'</span>'+
						'</label>'+
					'</div>'+
					'<div class="readdLine">'+
						'<label data-label="checkbox">'+
							'<input type="checkbox" class="readdCheckboxes" id="readd-delt">'+
							'<span class="flexCenter checkboxLabel">'+JWB.msg('readd-delete')+'</span>'+
						'</label>'+
						'<label data-label="checkbox">'+
							'<input type="checkbox" class="readdCheckboxes" id="readd-udel">'+
							'<span class="flexCenter checkboxLabel">'+JWB.msg('readd-undelete')+'</span>'+
						'</label>'+
						'<label data-label="checkbox">'+
							'<input type="checkbox" class="readdCheckboxes" id="readd-prot">'+
							'<span class="flexCenter checkboxLabel">'+JWB.msg('readd-protect')+'</span>'+
						'</label>'+
					'</div>'+
					'<hr>'+
					'<div class="readdLine">'+
						'<label data-label="checkbox">'+
							'<input type="checkbox" class="readdCheckboxes readdMulti" id="readd-changed" data-check="edit|move|delt|udel|prot">'+
							'<span class="flexCenter checkboxLabel">'+JWB.msg('readd-changed')+'</span>'+
						'</label>'+
						'<label data-label="checkbox">'+
							'<input type="checkbox" class="readdCheckboxes readdMulti" id="readd-nochanges" data-check="null|skip|bots">'+
							'<span class="flexCenter checkboxLabel">'+JWB.msg('readd-nochanges')+'</span>'+
						'</label>'+
						'<label data-label="checkbox">'+
							'<input type="checkbox" class="readdCheckboxes readdMulti" id="readd-all" data-check="all">'+
							'<span class="flexCenter checkboxLabel">'+JWB.msg('readd-all')+'</span>'+
						'</label>'+
					'</div>'+
				'</div>'+
				'<hr>'+
				'<div>'+
					'<label class="fullwidthFlex">'+
						'<span class="flexStart">'+JWB.msg('readd-search')+'</span>'+
						'<input type="text" class="fullwidth" id="readd-search">'+
					'</label>'+
					'<div class="regexswitch">'+
						'<label data-label="checkbox">'+
							'<input type="checkbox" id="readd-searchRegex">'+
							'<span class="flexCenter checkboxLabel">'+JWB.msg('label-useregex')+'</span>'+
						'</label>'+
						'<div class="divisorWrapper" style="display: none;"><span class="divisor"></span></div>'+
						'<label class="regexFlagsLabel" title="'+JWB.msg('tip-regex-flags')+'" style="display: none;">'+
							'<span class="flexCenter">'+JWB.msg('label-regex-flags')+'</span>'+
							'<input type="text" id="readd-searchFlags">'+
						'</label>'+
					'</div>'+
				'</div>'+
				'<hr>'+
				'<div>'+
					'<label class="fullwidthFlex" for="readd-after">'+
						'<div class="readd-ab">'+
							'<span class="flexCenter">'+JWB.msg('readd-after')+'</span>'+
							'<label data-label="checkbox">'+
								'<input type="checkbox" id="readd-after-enable" checked>'+
								'<span class="flexCenter checkboxLabel">'+JWB.msg('readd-ab-enable')+'</span>'+
							'</label>'+
						'</div>'+
						'<input type="datetime-local" value="'+JWB.time+'" step="1" class="fullwidth" id="readd-after">'+
					'</label>'+
					'<label class="fullwidthFlex" for="readd-before">'+
						'<div class="readd-ab">'+
							'<span class="flexCenter">'+JWB.msg('readd-before')+'</span>'+
							'<label data-label="checkbox">'+
								'<input type="checkbox" id="readd-before-enable" checked>'+
								'<span class="flexCenter checkboxLabel">'+JWB.msg('readd-ab-enable')+'</span>'+
							'</label>'+
						'</div>'+
						'<input type="datetime-local" value="'+JWB.time+'" step="1" class="fullwidth" id="readd-before">'+
					'</label>'+
				'</div>'+
			'</div>'+
		'</fieldset>'+
		'<div class="sticky" id="readdButtons">'+
			'<div>'+
				'<button id="readdAdd">'+JWB.msg('readd-button')+'</button>'+
				'<button id="readdPreview">'+JWB.msg('readd-preview')+'</button>'+
				'<button id="readdClear">'+JWB.msg('readd-clear')+'</button>'+
			'</div>'+
			'<div>'+
				'<button id="readdScrollTop">'+JWB.msg('readd-top')+'</button>'+
			'</div>'+
		'</div>'+
		'<div id="readdPreviewArea">'+
			'<ul></ul>'+
		'</div>'
	);
	$('.JWBtabc[data-tab="-1"]').html(
		'<div class="sticky" id="logButtons">'+
			'<span id="clearLog">'+
				'<button class="clearLogButton" id="clearLogButton">'+JWB.msg('log-clear')+'</button>'+
				'<button class="clearLogButton" id="clearLogButtonYes">'+JWB.msg('log-clear-yes')+'</button>'+
				'<button class="clearLogButton" id="clearLogButtonNo">'+JWB.msg('log-clear-no')+'</button>'+
			'</span>'+
			'<span class="startstops" id="startstopLog">'+
				'<button class="starts" id="startLog">'+JWB.msg('editbutton-start')+'</button>'+
				'<button class="stops" id="stopLog" disabled>'+JWB.msg('editbutton-stop')+'</button> '+
			'</span>'+
		'</div>'+
		'<table id="actionlog">'+
			'<tbody></tbody>'+
		'</table>'
	);
	$('#pagelistForm').html(
		'<div class="namespaceFilter" title="'+JWB.msg('tip-ns-select')+'">'+
			'<label for="plNamespaceList">'+JWB.msg('label-ns-select')+'</label>'+
			'<select multiple name="namespace" class="namespaceList" id="plNamespaceList">'+
				nslist+
			'</select>'+
		'</div>'+
		'<div class="popupFieldsets">'+
			'<fieldset class="popupFieldset">'+
				'<legend>'+
					'<label data-label="checkbox">'+
						'<input type="checkbox" id="categorymembers" name="categorymembers" value="cm">'+
						'<span class="flexCenter checkboxLabel">'+JWB.msg('legend-cm')+'</span>'+
					'</label>'+
				'</legend>'+
				'<label class="inputFlex" title="'+JWB.msg('tip-cm')+'">'+
					'<span class="flexCenter">'+JWB.msg('label-cm')+'</span>'+
					'<input type="text" name="cmtitle" id="cmtitle">'+
				'</label>'+
				'<div class="tripleCheckbox">'+
					'<label for="cmtype" class="flexCenter">'+JWB.msg('cm-include')+'</label>'+
					'<div class="tripleCheckboxCheckboxes" id="cmtype">'+
						'<label data-label="checkbox">'+
							'<input type="checkbox" id="cmtype-page" name="cmtype" value="page" checked>'+
							'<span class="flexCenter checkboxLabel">'+JWB.msg('cm-include-pages')+'</span>'+
						'</label>'+
						'<label data-label="checkbox">'+
							'<input type="checkbox" id="cmtype-subcg" name="cmtype" value="subcat" checked>'+
							'<span class="flexCenter checkboxLabel">'+JWB.msg('cm-include-subcgs')+'</span>'+
						'</label>'+
						'<label data-label="checkbox">'+
							'<input type="checkbox" id="cmtype-file" name="cmtype" value="file" checked>'+
							'<span class="flexCenter checkboxLabel">'+JWB.msg('cm-include-files')+'</span>'+
						'</label>'+
					'</div>'+
				'</div>'+
			'</fieldset>'+
			'<fieldset class="popupFieldset">'+
				'<legend>'+
					'<label data-label="checkbox">'+
						'<input type="checkbox" name="linksto" id="linksto">'+
						'<span class="flexCenter checkboxLabel">'+JWB.msg('legend-linksto')+'</span>'+
					'</label>'+
				'</legend>'+
				'<label class="inputFlex">'+
					'<span class="flexCenter">'+JWB.msg('label-linksto')+'</span>'+
					'<input type="text" name="title" id="linksto-title">'+
				'</label>'+
				'<div class="tripleCheckbox">'+
					'<label for="include" class="flexCenter">'+JWB.msg('links-include')+'</label>'+
					'<div class="tripleCheckboxCheckboxes" id="include">'+
						'<label data-label="checkbox">'+
							'<input type="checkbox" id="backlinks" name="backlinks" value="bl" checked>'+
							'<span class="flexCenter checkboxLabel">'+JWB.msg('links-include-links')+'</span>'+
						'</label>'+
						'<label data-label="checkbox">'+
							'<input type="checkbox" id="embeddedin" name="embeddedin" value="ei">'+
							'<span class="flexCenter checkboxLabel">'+JWB.msg('links-include-templ')+'</span>'+
						'</label>'+
						'<label data-label="checkbox">'+
							'<input type="checkbox" id="imageusage" name="imageusage" value="iu">'+
							'<span class="flexCenter checkboxLabel">'+JWB.msg('links-include-files')+'</span>'+
						'</label>'+
					'</div>'+
				'</div>'+
				'<div class="tripleRadio">'+
					'<label for="linksto-rfilter" class="flexCenter">'+JWB.msg('redir-label')+'</label>'+
					'<div class="tripleRadioRadios" id="linksto-rfilter">'+
						'<label data-label="radio">'+
							'<input type="radio" id="linksto-rfilter-redir" name="ltfilterredir" value="redirects">'+
							'<span class="flexCenter radioLabel">'+JWB.msg('redir-redirs')+'</span>'+
						'</label>'+
						'<label data-label="radio">'+
							'<input type="radio" id="linksto-rfilter-nonredir" name="ltfilterredir" value="nonredirects">'+
							'<span class="flexCenter radioLabel">'+JWB.msg('redir-noredirs')+'</span>'+
						'</label>'+
						'<label data-label="radio">'+
							'<input type="radio" id="linksto-rfilter-all" name="ltfilterredir" value="all" checked>'+
							'<span class="flexCenter radioLabel">'+JWB.msg('redir-all')+'</span>'+
						'</label>'+
					'</div>'+
				'</div>'+
				'<label data-label="checkbox" title="'+JWB.msg('tip-link-redir')+'">'+
					'<input type="checkbox" name="redirect" value="true" checked id="linksto-redir">'+
					'<span class="flexCenter checkboxLabel">'+JWB.msg('label-link-redir')+'</span>'+
				'</label>'+
			'</fieldset>'+
			'<fieldset class="popupFieldset">'+
				'<legend>'+
					'<label data-label="checkbox">'+
						'<input type="checkbox" id="prefixsearch" name="prefixsearch" value="ps">'+
						'<span class="flexCenter checkboxLabel">'+JWB.msg('legend-ps')+'</span>'+
					'</label>'+
				'</legend>'+
				'<label class="inputFlex">'+
					'<span class="flexCenter">'+JWB.msg('label-ps')+'</span>'+
					'<input type="text" name="pssearch" id="pssearch">'+
				'</label>'+
				'<label data-label="checkbox" title="'+JWB.msg('tip-ps-strict')+'">'+
					'<input type="checkbox" name="allpages" value="ap" id="psstrict">'+
					'<span class="flexCenter checkboxLabel">'+JWB.msg('label-ps-strict')+'</span>'+
				'</label>'+
			'</fieldset>'+
			'<fieldset class="popupFieldset">'+
				'<legend>'+
					'<label data-label="checkbox">'+
						'<input type="checkbox" id="watchlistraw" name="watchlistraw" value="wr">'+
						'<span class="flexCenter checkboxLabel">'+JWB.msg('legend-wr')+'</span>'+
					'</label>'+
				'</legend>'+
				JWB.msg('label-wr')+
			'</fieldset>'+
			'<fieldset class="popupFieldset">'+
				'<legend>'+
					'<label data-label="checkbox">'+
						'<input type="checkbox" id="random" name="random" value="rn">'+
						'<span class="flexCenter checkboxLabel">'+JWB.msg('legend-rn')+'</span>'+
					'</label>'+
				'</legend>'+
				'<label class="inputFlex">'+
					'<span class="flexCenter">'+JWB.msg('label-rn-limit')+'</span>'+
					'<input type="text" name="rnlimit" id="rnlimit" value="'+JWB.limit.function(false)+'">'+
				'</label>'+
				'<div class="tripleRadio">'+
					'<label for="random-rfilter" class="flexCenter">'+JWB.msg('redir-label')+'</label>'+
					'<div class="tripleRadioRadios" id="random-rfilter">'+
						'<label data-label="radio">'+
							'<input type="radio" id="random-rfilter-redir" name="rnfilterredir" value="redirects">'+
							'<span class="flexCenter radioLabel">'+JWB.msg('redir-redirs')+'</span>'+
						'</label>'+
						'<label data-label="radio">'+
							'<input type="radio" id="random-rfilter-nonredir" name="rnfilterredir" value="nonredirects">'+
							'<span class="flexCenter radioLabel">'+JWB.msg('redir-noredirs')+'</span>'+
						'</label>'+
						'<label data-label="radio">'+
							'<input type="radio" id="random-rfilter-all" name="rnfilterredir" value="all" checked>'+
							'<span class="flexCenter radioLabel">'+JWB.msg('redir-all')+'</span>'+
						'</label>'+
					'</div>'+
				'</div>'+
			'</fieldset>'+
			'<fieldset class="popupFieldset">'+
				'<legend>'+
					'<label data-label="checkbox">'+
						'<input type="checkbox" id="links" name="links" value="pl">'+
						'<span class="flexCenter checkboxLabel">'+JWB.msg('legend-pl')+'</span>'+
					'</label>'+
				'</legend>'+
				'<labe class="inputFlex" title="'+JWB.msg('tip-pl')+'">'+
					'<span class="flexCenter">'+JWB.msg('label-pl')+'</span>'+
					'<input type="text" id="titles" name="titles">'+
				'</label>'+
			'</fieldset>'+
			'<fieldset class="popupFieldset">'+
				'<legend>'+
					'<label data-label="checkbox">'+
						'<input type="checkbox" id="search" name="search" value="sr">'+
						'<span class="flexCenter checkboxLabel">'+JWB.msg('legend-sr')+'</span>'+
					'</label>'+
				'</legend>'+
				'<label class="inputFlex" title="'+JWB.msg('tip-sr')+'\n'+JWB.msg('placeholder-sr', 'insource:', 'intitle:')+'">'+
					'<span class="flexCenter">'+JWB.msg('label-sr')+'</span>'+
					'<input type="text" id="srsearch" name="srsearch" placeholder="'+JWB.msg('placeholder-sr', 'insource:', 'intitle:')+'">'+
				'</label>'+
			'</fieldset>'+
			'<fieldset class="popupFieldset listSMW">'+
				'<legend>'+
					'<label data-label="checkbox">'+
						'<input type="checkbox" id="smwask" name="smwask" value="smw">'+
						'<span class="flexCenter checkboxLabel">'+JWB.msg('legend-smw', JWB.msg('smw-slow'))+'</span>'+
					'</label>'+
				'</legend>'+
				'<label class="inputFlex">'+
					'<span class="flexCenter">'+JWB.msg('label-smw')+'</span>'+
					'<textarea id="smwquery" name="smwquery" placeholder="'+JWB.msg('tip-smw', '\n|limit=500')+'"></textarea>'+
				'</label>'+
			'</fieldset>'+
			'<div>'+
				'<button type="submit" id="pagelistGenerate">'+JWB.msg('button-pagelist-generate')+'</button>'+
				'<button type="button" id="pagelistStop" disabled>'+JWB.msg('button-pagelist-stop')+'</button>'+
			'</div>'+
		'</div>'
	);
	$('#filterForm').html(
		'<div class="namespaceFilter" title="'+JWB.msg('tip-ns-select')+'">'+
			'<label for="ftNamespaceList">'+JWB.msg('label-ns-select')+'</label>'+
			'<select multiple name="namespace" class="namespaceList" id="ftNamespaceList">'+
				nslist+
			'</select>'+
		'</div>'+
		'<div class="popupFieldsets">'+
			'<fieldset class="popupFieldset">'+
				'<legend>'+
					'<label data-label="checkbox">'+
						'<input type="checkbox" id="ft-keep">'+
						'<span class="flexCenter checkboxLabel">'+JWB.msg('legend-filter-keep')+'</span>'+
					'</label>'+
				'</legend>'+
				'<label class="inputFlex">'+
					'<span class="flexCenter">'+JWB.msg('label-filter-search')+'</span>'+
					'<input type="text" name="keep" id="ft-search-keep">'+
				'</label>'+
				'<div class="regexswitch">'+
					'<label data-label="checkbox">'+
						'<input type="checkbox" id="ft-keepRegex">'+
						'<span class="flexCenter checkboxLabel">'+JWB.msg('label-useregex')+'</span>'+
					'</label>'+
					'<div class="divisorWrapper" style="display: none;"><span class="divisor"></span></div>'+
					'<label class="regexFlagsLabel" title="'+JWB.msg('tip-regex-flags')+'" style="display: none;">'+
						'<span class="flexCenter">'+JWB.msg('label-regex-flags')+'</span>'+
						'<input type="text" id="ft-keepFlags">'+
					'</label>'+
				'</div>'+
			'</fieldset>'+
			'<fieldset class="popupFieldset">'+
				'<legend>'+
					'<label data-label="checkbox">'+
						'<input type="checkbox" id="ft-remove">'+
						'<span class="flexCenter checkboxLabel">'+JWB.msg('legend-filter-remove')+'</span>'+
					'</label>'+
				'</legend>'+
				'<label class="inputFlex">'+
					'<span class="flexCenter">'+JWB.msg('label-filter-search')+'</span>'+
					'<input type="text" name="remove" id="ft-search-remove">'+
				'</label>'+
				'<div class="regexswitch">'+
					'<label data-label="checkbox">'+
						'<input type="checkbox" id="ft-removeRegex">'+
						'<span class="flexCenter checkboxLabel">'+JWB.msg('label-useregex')+'</span>'+
					'</label>'+
					'<div class="divisorWrapper" style="display: none;"><span class="divisor"></span></div>'+
					'<label class="regexFlagsLabel" title="'+JWB.msg('tip-regex-flags')+'" style="display: none;">'+
						'<span class="flexCenter">'+JWB.msg('label-regex-flags')+'</span>'+
						'<input type="text" id="ft-removeFlags">'+
					'</label>'+
				'</div>'+
			'</fieldset>'+
			'<fieldset class="popupFieldset">'+
				'<legend>'+
					'<label data-label="checkbox">'+
						'<input type="checkbox" id="ft-convert">'+
						'<span class="flexCenter checkboxLabel">'+JWB.msg('legend-filter-convert')+'</span>'+
					'</label>'+
				'</legend>'+
				'<div class="doubleRadio">'+
					'<label for="ft-convert" class="flexCenter">'+JWB.msg('label-filter-convert')+'</label>'+
					'<div class="doubleRadioRadios" id="ft-convert">'+
						'<label data-label="radio">'+
							'<input type="radio" id="ft-convert-subj" name="ft-convert" value="0" checked>'+
							'<span class="flexCenter radioLabel">'+JWB.msg('filter-convert-subject')+'</span>'+
						'</label>'+
						'<label data-label="radio">'+
							'<input type="radio" id="ft-convert-talk" name="ft-convert" value="1">'+
							'<span class="flexCenter radioLabel">'+JWB.msg('filter-convert-talk')+'</span>'+
						'</label>'+
					'</div>'+
				'</div>'+
			'</fieldset>'+
			'<fieldset class="popupFieldset">'+
				'<legend>'+
					'<label data-label="checkbox">'+
						'<input type="checkbox" id="ft-matrep">'+
						'<span class="flexCenter checkboxLabel">'+JWB.msg('legend-filter-matrep')+'</span>'+
					'</label>'+
				'</legend>'+
				'<div>'+
					'<label class="replaceTextLabel inputFlex">'+
						'<span class="flexCenter">'+JWB.msg('label-rtext')+'</span>'+
						'<textarea name="match" class="replaceText" id="ft-convert-match"></textarea>'+
					'</label>'+
					'<label class="replaceWithLabel inputFlex">'+
						'<span class="flexCenter">'+JWB.msg('label-rwith')+'</span>'+
						'<textarea name="replace" class="replaceWith" id="ft-convert-replace"></textarea>'+
					'</label>'+
					'<div class="switches">'+
						'<div class="regexswitch">'+
							'<label data-label="checkbox">'+
								'<input type="checkbox" class="useRegex" id="ft-matchRegex">'+
								'<span class="flexCenter checkboxLabel">'+JWB.msg('label-useregex')+'</span>'+
							'</label>'+
							'<div class="divisorWrapper" style="display: none;"><span class="divisor"></span></div>'+
							'<label class="regexFlagsLabel" title="'+JWB.msg('tip-regex-flags')+'" style="display: none;">'+
								'<span class="flexCenter">'+JWB.msg('label-regex-flags')+'</span>'+
								'<input type="text" class="regexFlags" id="ft-matchFlags" value="gm">'+
							'</label>'+
						'</div>'+
					'</div>'+
				'</div>'+
			'</fieldset>'+
			'<div>'+
				'<button type="submit" id="filterFilter">'+JWB.msg('button-filter')+'</button>'+
			'</div>'+
		'</div>'
	);
	if (JWB.test.hasSMW) {
		$('#pagelistPopup').addClass('hasSMW');
	}
	/* else {
		$('.listSMW').remove();
	} */
	$('body').addClass('JWB'); //allow easier custom styling of JWB.
	$('[accesskey]').each(function() {
		let lbl = this.accessKeyLabel || this.accessKey; // few browsers support accessKeyLabel, so fallback to accessKey.
		$(this).attr('title', '['+lbl+']');
	});
	
	/***** Setup *****/
	JWB.setup.save('_blank'); //default setup
	if (JWB.settings.hasOwnProperty('default')) {
		JWB.setup.apply();
	} else if (JWB.setup.initialised) {
		// If we already initialised, create the default settings profile.
		JWB.setup.save('default');
	}
	JWB.setup.extend({});

	/***** Event handlers *****/
	
	//Alert user when leaving the tab, to prevent accidental closing.
	window.onbeforeunload = function() {
		return 'Closing this tab will cause you to lose all progress.';
	};
	window.ondragover = function(e) {
		e.preventDefault();
	};
	document.addEventListener('securitypolicyviolation', function(e) {
		console.log('violated CSP:', e);
		if (e.blockedURI == 'blob') {
			JWB.worker.supported = false; // tell the next JWB.worker.init() that it shouldn't even try.
		} else if (JWB && JWB.msg) {
			console.warn(JWB.msg('csp-error', e.violatedDirective)); // Disabling this annoying thing. No alerts, logging only.
		}
	});
	
	var navs = [];
	$('#tabholder div[data-nav]').each(function() {
		navs.push(parseInt($(this).attr('data-nav')));
	});
	$('#zero > span').click(function() {
		var nav = parseInt($('#tabholder div[data-nav].active').attr('data-nav'));
		if (navs.includes(nav + 1)) nav = nav + 1;
		else nav = 1;
		$('#tabholder div[data-nav].active').removeClass('active');
		$('#tabholder div[data-nav="'+nav+'"]').addClass('active');
	});
	$('.JWBtab[data-tab]').click(function() {
		$('.active').not('div[data-nav]').removeClass('active');
		$(this).addClass('active');
		$('.JWBtabc[data-tab="'+$(this).attr('data-tab')+'"]').addClass('active');
	});
	
	$('fieldset > legend').not('.popupFieldset > legend').click(function() {
		$(this).parent().toggleClass('collapsedFieldset');
		$(this).parent().children('.collapsibleFieldset').slideToggle();
	});
	
	$('body').on('change', '.regexswitch label input[type="checkbox"]', function() {
		// >>this<< is the element that's triggered
		$(this).parent().nextAll('.divisorWrapper, .regexFlagsLabel').toggle(this.checked);
	});
	
	$('#resultWindow').on('click', 'tr[data-line]:not(.lineheader) *', function(e) {
		var line = +$(e.target).closest('tr[data-line]').data('line');
		var index = $('#editBoxArea').val().split('\n').slice(0, line-1).join('\n').length;
		$('#editBoxArea')[0].focus();
		JWB.fn.setSelection($('#editBoxArea')[0], index+1);
		JWB.fn.scrollSelection($('#editBoxArea')[0], index);
	});
	
	$('#articleList').focusout(JWB.pageCount);
	
	if (window.RETF) {
		$('#refreshRETF').click(function() {
			RETF.load();
			$('#refreshRETF').hide().after(JWB.loader(12, 'display: none;', 'loadingRETF'));
			$('#loadingRETF').fadeIn('fast');
			setTimeout(function() {
				$('#loadingRETF').fadeOut('fast', function() {
					$('#loadingRETF').remove();
					$('#refreshRETF').fadeIn('fast');
				});
			}, 2000);
		});
		$('#skipRETF').click(JWB.skipRETF);
		$('#enableRETF').change(function() {
			$('#skipRETF').toggle(this.checked);
		});
	}
	
	$('.popupButton').click(function() {
		var popup = this.id.slice(0, -6); //omits the 'Button' in the id by cutting off the last 6 characters
		$('#'+popup+'Popup, #overlay').fadeIn('fast');
	});
	$('#overlay').click(function() {
		$('.JWBpopup, #overlay').fadeOut('fast');
		JWB.pl.done = true;
		JWB.pl.stop();
	});
	try { // Drag'n'drop list of .replaces.
		mw.loader.using(['jquery.ui'], function() {
			$('#replacesPopup').sortable({
				delay: 100,
				distance: 10,
				items: '> .replaces',
				// placeholder: 'fieldsetPlaceholder',
				revert: true,
				scroll: false,
				zIndex: 999
			});
			$('#replacesPopup .replaces').addClass('sortable');
			JWB.test.sortable = true;
		});
	} catch (e) { // Should not throw errors.
		console.warn(e);
		JWB.test.sortable = false;
	}
	$('#moreReplaces').click(function() {
		$('#replacesPopup').append(findreplace(false));
		$('.replaces[style*="display: none;"]').slideDown(400);
	});
	$('#re101').click(function() {
		window.open('//regex101.com', '_blank');
	});
	/* $('#replacesPopup').on('keydown', '.replaces:last', function(e) { // Should no longer be needed as the button is now sticky.
		if (e.which === 9) $('#moreReplaces')[0].click();
	}); */
	$('#replacesPopup').on('click', '.removeThis', function() {
		var replace = $(this).parentsUntil('.JWBpopup');
		var boolify = function(b) {
				try {
					var c = b.val();
					return c && true;
				} catch (e) {
					return false;
				}
			};
		var input = function(b, r = replace) {
				var $element;
				if (r.find('.replaceText')[0] && r.find('.replaceText').val()) $element = r.find('.replaceText');
				else if (r.find('.replaceWith')[0] && r.find('.replaceWith').val()) $element = r.find('.replaceWith');
				if (boolify($element)) {
					if (!b) return $element;
					else return $element.val();
				} else {
					return false;
				}
			};
		if (input(true)) {
			input(false).focus().select();
		} else {
			replace.slideUp(400, function() {
				replace.remove();
			});
		}
	});
	
	// For attribution: //jsfiddle.net/Znarkus/Z99mK
	var insert = function(field, value) {
		if (document.selection) {
			field.focus();
			var sel = document.selection.createRange();
			sel.text = value;
		} else if (field.selectionStart || field.selectionStart == '0') {
			var startPos = field.selectionStart;
			var endPos = field.selectionEnd;
			field.value = field.value.substring(0, startPos) + value +
				field.value.substring(endPos, field.value.length);
			field.selectionStart = startPos + value.length;
			field.selectionEnd = startPos + value.length;
		} else {
			field.value += value;
		}
		$(field).trigger('input');
	};
	
	$('body').on('keydown', '.replaceText, input.replaceWith', function(e) {
		if (e.which === 9) {
			e.preventDefault();
			insert(this, '\\t');
		} else if (e.which === 13) {
			e.preventDefault();
			insert(this, '\\n');
		} else return;
	});
	
	var events = ['input', 'keydown', 'keyup', 'mousedown', 'mouseup', 'select', 'contextmenu', 'drop', 'focusout'];
	
	// For attribution: //stackoverflow.com/a/8522283
	$('body').on(events.join(' '), 'textarea.replaceText, textarea.replaceWith, #smwquery', function() {
		$('#replacesPopup').css('display', 'block');
	    $(this).height(0);
	    $(this).height(this.scrollHeight - 4); // - 4px padding.
		$('#replacesPopup').css('display', 'none');
	});
	
	$('.namespaceList').each(function(index, element) {
		$(element).attr('size', $(element).children('option').length);
	});
	
	// For attribution: //stackoverflow.com/a/469362
	var filter = function(v) {
		return /^\d*$/.test(v) && (v === '' || (JWB.limit.function(false) <= parseInt(v) && parseInt(v) <= JWB.limit.function(true)));
	};
	events.forEach(function(event) {
		$('#rnlimit').on(event, function(e) {
			if (filter(this.value)) {
				if (['keydown', 'mousedown', 'focusout'].includes(e.type)) {
					this.setCustomValidity('');
				}
				this.oldValue = this.value;
				this.oldSelectionStart = this.selectionStart;
				this.oldSelectionEnd = this.selectionEnd;
			} else if (this.hasOwnProperty('oldValue')) {
				this.setCustomValidity(JWB.msg('rn-limit-invalid', JWB.limit.function(false), JWB.limit.function(true)));
				this.reportValidity();
				this.value = this.oldValue;
				this.setSelectionRange(this.oldSelectionStart, this.oldSelectionEnd);
			} else {
				this.value = '';
			}
		});
	});
	
	$('#pagelistGenerate').click(function(e) {
		e.preventDefault();
		JWB.pl.generate();
	});
	$('#pagelistStop').click(function(e) {
		e.preventDefault();
		JWB.pl.done = true;
		JWB.pl.stop();
	});
	$('.popupForm legend input[type="checkbox"]').change(function() {
		//remove disabled attr when checked, add when not.
		$(this).parents('fieldset').find('input, textarea').not('legend input').prop('disabled', !this.checked);
		$(this).parents('fieldset').toggleClass('disabled', !this.checked);
	}).trigger('change');
	$('#psstrict').change(function() {
		if (this.checked) {
			$('#pssearch').attr('name', 'apprefix');
		} else {
			$('#pssearch').attr('name', 'pssearch');
		}
	}).trigger('change');
	
	$('#filterFilter').click(function(e) {
		e.preventDefault();
		
		var ns = $('#ftNamespaceList').val();
		if (!ns.length) {
			alert(JWB.msg('filter-no-namespace'));
			return;
		}
		
		var patterns = {};
		for (let i of [
			['keep', 'ft-search-keep'],
			['remove', 'ft-search-remove'],
			['match', 'ft-convert-match', 'matrep']
		]) {
			if ($('#ft-' + (i[2] || i[0])).prop('checked')) {
				if ($('#ft-' + i[0] + 'Regex').prop('checked')) {
					patterns[i[0]] = new RegExp($('#' + i[1]).val(), $('#ft-' + i[0] + 'Flags').val());
				} else {
					patterns[i[0]] = $('#' + i[1]).val();
				}
			}
		}
		console.log(patterns);
		
		$('#articleList').val(function() {
			var content = $('#articleList').val().split('\n').map(function(e) {
				var line = e.split('|');
				if (line[0] === '#PRE-PARSE-STOP') return line;
				
				var page = mw.Title.newFromText(line[0]);
				
				if (!ns.includes(page.namespace + '')) {
					return '';
				}
				
				if (patterns.keep && !page.getMainText().match(patterns.keep)) {
					return '';
				}
				if (patterns.remove && page.getMainText().match(patterns.remove)) {
					return '';
				}
				
				if ($('#ft-convert').prop('checked')) {
					if (+$('[name="ft-convert"]:checked').val()) {
						page = page.getTalkPage();
					} else {
						page = page.getSubjectPage();
					}
				}
				
				line[0] = page.toText();
				
				return line.join('|');
			}).filter(function(e) {
				return e;
			}).join('\n');
			try {
				content = content.replace(patterns.match, $('#ft-convert-replace').val());
			} catch (e) {
				console.warn(e);
			}
			return content;
		});
		JWB.pageCount();
	});
	
	$('#removeDupes').click(function() {
		JWB.temp = $('#articleList').val();
		$('#articleList').val(JWB.fn.uniques($('#articleList').val().split('\n')).join('\n'));
		JWB.pageCount();
	});
	$('#removeUniqs').click(function() {
		JWB.temp = $('#articleList').val();
		$('#articleList').val(JWB.fn.duplicates($('#articleList').val().split('\n')).join('\n'));
		JWB.pageCount();
	});
	$('#removeUndo').click(function() {
		$('#articleList').val(JWB.temp);
		JWB.pageCount();
	});
	$('#preparse-reset').click(function() {
		$('#articleList').val($('#articleList').val().replace(/#PRE-PARSE-STOP/g, '').replace(/\n\n/g, '\n'));
	});
	$('#articleListTop').click(function() {
		$('#articleList').scrollTop(0);
	});
	$('#articleListBot').click(function() {
		$('#articleList').scrollTop($('#articleList').prop('scrollHeight') - $('#articleList').height());
	});
	$('#sortArticles').click(function() {
		$('#articleList').val($('#articleList').val().split('\n').sort().join('\n'));
		JWB.pageCount();
	});
	if (!mw.Title) {
		$('#filterButton, #filterPopup').remove();
	}
	$('#saveAs').click(function() {
		JWB.setup.save();
	});
	$('#updateSetups').click(JWB.setup.load);
	$('#import').change(JWB.setup.import);
	// window.ondrop = JWB.setup.import;
	$('#loadSettings').change(function() {
		JWB.setup.apply(this.value);
		JWB.pageCount();
		$('.replaces textarea').trigger('input');
		$('#throttle').prop('disabled', !$('#autosave').prop('checked'));
		$('#cascadingProtection').prop('disabled', !JWB.protection.casc.includes($('#editProt').val()));
	});
	$('#deleteSetup').click(JWB.setup.del);
	$('#saveToWiki').click(JWB.setup.submit);
	$('#download').click(JWB.setup.download);
	
	$('#watchNow').click(JWB.api.watch);
	$('#autosave').change(function() {
		$('#throttle').prop('disabled', !this.checked);
	});
	
	/* $('#viaJWB').change(function() { // Change the max size of the allowed summary according to having a suffix or not.
		$('#summary').parent('label')
			.toggleClass('viaJWB', this.checked)
			.attr('maxlength', 500 - this.checked*JWB.summarySuffix.length);
	}); */
	$('.starts').click(JWB.start);
	$('.stops').click(JWB.stop);
	$('#submitButton').click(JWB.api.submit);
	$('#previewButton').click(JWB.api.preview);
	$('#diffButton').click(JWB.api.diff);
	
	$('#skipButton, #skipPage').click(function() {
		JWB.log('skip', JWB.list[0].split('|')[0]);
		JWB.next();
	});
	
	if (JWB.test.sysop) {
		$('#movePage').click(function() {
			if (!JWB.isStopped && $('#moveTo').val().length === 0) {
				return alert(JWB.msg('alert-no-move'));
			} else if (!JWB.isStopped) {
				JWB.api.move();
			}
		});
		
		$('#protectPage').click(JWB.api.protect);
		if (!JWB.protection.casc.includes($('#editProt').val())) $('#cascadingProtection').prop('disabled', true);
		$('#editProt').on('change', function() {
			if (JWB.protection.casc.includes($('#editProt').val())) $('#cascadingProtection').prop('disabled', false);
			else $('#cascadingProtection').prop('checked', false).prop('disabled', true);
		});
		
		$('#deletePage').click(JWB.api.del);
	}
	if (JWB.test.hasFlood || JWB.test.flag || JWB.test.dev) {
		var righttype = // Flagged with JWB.test.floodFlag/not flagged yet, grantable&revocable/revocable only.
				(JWB.test.flood && JWB.test.changeable ? // Flagged and g&r-able.
					'Grant'
				: // Not flagged or revocable only.
					(JWB.test.flag ? // Flagged, revocable.
						'Grant'
					: // Not flagged but g&r-able or vice versa.
						(JWB.test.changeable ? // Not flagged, g&r-able.
							'Revoke'
						: // Not flagged but revocable only!?
							'Revoke'
						)
					)
				);
		
		$('#right' + righttype).hide();
		$('#rightGrant, #rightRevoke').click(function() {
			$('#rightGrant, #rightRevoke').toggle();
		});
		$('#rightGrant').click(function() {
			JWB.api.right(true);
		});
		$('#rightRevoke').click(function() {
			var confirmation;
			if (!JWB.test.dev) {
				confirmation = confirm(JWB.msg('right-revoke-confirm'));
				if (!confirmation) return;
			}
			
			JWB.api.right(false);
			
			if (JWB.test.flag && confirmation && !JWB.test.dev) {
				if (confirmation) $('#rightRevoke').parents('fieldset').slideUp('slow', function() {
					$('#rightRevoke').parents('fieldset').remove();
					if (!JWB.test.sysop) {
						$('[data-tab="4"]').remove();
						$('span[data-tab="2"]').click();
					}
				});
			}
		});
	}
	if (!JWB.test.sysop && (JWB.test.hasFlood || JWB.test.flag || JWB.test.dev)) {
		$('section[data-tab="4"] fieldset:nth-child(1), section[data-tab="4"] fieldset:nth-child(2), '+
		  '#otherButtons').remove();
	} else if (!JWB.test.sysop) {
		$('[data-tab="4"]').remove();
	}
	
	// Tab -2 checkboxes.
	if (!JWB.test.sysop)
		$('.readdLine:nth-child(1) > label:nth-child(3), .readdLine:nth-child(3)').remove();
	if (!(JWB.test.hasFlood || JWB.test.flag || JWB.test.dev))
		$('.readdLine:nth-child(2) > label:nth-child(3)').remove();
	
	$('.readdMulti').change(function() {
		var a = $(this).attr('data-check').split('|');
		a = a.map(function(e) {
			return '#readd-' + e;
		});
		$(a.join(', ') !== '#readd-all' ? a.join(', ') : '.readdCheckboxes').not('.readdMulti').prop('checked', this.checked);
	});
	$('#readd-after-enable, #readd-before-enable').change(function() {
		$(this).parents('div > .fullwidthFlex').find('input[type="datetime-local"]').prop('disabled', !this.checked);
	}).trigger('change');
	$('#readd-after, #readd-before').change(function() {
		var omax = new Date($(this).val() + 'Z') > new Date($(this).attr('max') + 'Z');
		var omin = new Date($(this).val() + 'Z') < new Date($(this).attr('min') + 'Z');
		if (omax || omin) {
			$(this).val(
				omax ? $(this).attr('max') : $(this).attr('min')
			).trigger('change');
		}
		
		var $af = $('#readd-after').val();
		var $bf = $('#readd-before').val();
		if ($af > $bf) {
			$('#readd-after').val($bf);
		}
	});
	$('#readdAdd, #readdPreview').click(function() {
		var types = ['edit', 'null', 'move', 'skip', 'bots', 'flag', 'delt', 'udel', 'prot'];
		var readd = [];
		var pages = [];
		var pattern;
		for (let i = 0; i < types.length; i++) {
			if ($('#readd-' + types[i]).prop('checked')) readd.push('.readd-' + types[i]);
		}
		$(readd.join(', ')).each(function() {
			pages.push({
				timestamp: $(this).find('.timestampCell').attr('data-time') + 'Z',
				action: $(this).find('.actionCell').attr('data-action'),
				title: $(this).find('.pageNameCell').text()
			});
		});
		if ($('#readd-search').val()) {
			if ($('#readd-searchRegex').prop('checked')) {
				pattern = new RegExp($('#readd-search').val(), $('#readd-searchFlags').val());
			} else {
				pattern = $('#readd-search').val();
			}
			pages = pages.filter(function(e) {
				return e.title.match(pattern);
			});
		}
		if ($('#readd-after-enable').prop('checked')) {
			pages = pages.filter(function(e) {
				return new Date(e.timestamp) >= new Date($('#readd-after').val() + 'Z');
			});
		}
		if ($('#readd-before-enable').prop('checked')) {
			pages = pages.filter(function(e) {
				return new Date(e.timestamp) <= new Date($('#readd-before').val() + 'Z');
			});
		}
		pages = JWB.fn.uniques(pages);
		if ($(this).is('#readdPreview')) {
			$('#readdPreviewArea > ul').empty();
			for (let i of pages) {
				$('#readdPreviewArea > ul').append(
					'<li>' +
						'<a target="_blank" href="'+JWB.relLink(i.title)+'" title="'+i.title+'">'+
							i.title+
						'</a>'+
					'</li>'
				);
			}
		} else {
			$('#articleList').val(pages.map(function(e) {
				return e.title;
			}).join('\n') + '\n' + $('#articleList').val());
			JWB.pageCount();
		}
	});
	$('#readdClear').click(function() {
		$('#readdPreviewArea > ul').empty();
	});
	$('#readdScrollTop').click(function() {
		$('section[data-tab="-2"]').scrollTop(0);
	});
	
	$('#clearLogButtonYes').click(function() {
		$('#actionlog tbody').empty();
	});
	$('.clearLogButton').click(function() {
		$('#clearLogButton, #clearLogButtonYes, #clearLogButtonNo').toggle();
	});
	$('#actionlog').on('click', '.readdButton', function() {
		$('#articleList').val(decodeURIComponent($(this).attr('data-readd')) + '\n' + $('#articleList').val());
		JWB.pageCount();
	});
};

// Disable JWB altogether when it's loaded on a page other than Project:AutoWikiBrowser/Script.
// This script shouldn't be loaded on any other page in the first place.
if (JWB.allowed === false) JWB = false;
