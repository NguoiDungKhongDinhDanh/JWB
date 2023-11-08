$(function() {
	mw.loader.using(['mediawiki.util'], function() {
		var a = mw.config.get('wgAction');
		var n = mw.config.get('wgNamespaceNumber');
		var t = mw.config.get('wgTitle');
		if (!location.href.match(/[?&]noJWB=[^ _&]/) && a == 'view' && n === 4 && t === 'AutoWikiBrowser/Script') {
			mw.loader.load('//dev.fandom.com/wiki/User:NguoiDungKhongDinhDanh/JWB.js?action=raw&ctype=text/javascript');
		} else {
			mw.util.addPortletLink(
				'p-tb', mw.config.get('wgArticlePath').replace('$1', 'Project:AutoWikiBrowser/Script'),
				'JS Wiki Browser', 'tb-jwb', 'Run Javascript Wiki Browser'
			);
		}
	});
});
