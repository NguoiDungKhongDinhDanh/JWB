/**
 * Internationalisation file for AutoWikiBrowser script
 * See https://en.wikipedia.org/wiki/User:Joeytje50/JWB.js for the full script, as well as licensing.
 * Licensed under GNU GPL 2. http://www.gnu.org/copyleft/gpl.html
**/

JWB.messages.vi = {
	// General interface
	'tab-setup':				'DS',
	'tab-editing':				'Sửa',
	'tab-skip':					'Bỏ qua',
	'tab-other':				'Khác',
	'tab-readd':				'Thêm',
	'tab-log':					'NT',
	'pagelist-caption':			'Danh sách trang:',
	'editbox-caption':			'Khu vực sửa đổi',
	'editbox-currentpage':		'Đang sửa: <a href="/wiki/$2" target="_blank" title="$1">$1</a>',
	'no-changes-made':			'Không có sửa đổi. Nhấp bỏ qua để đến trang tiếp theo.',
	'page-not-exists':			'Trang không tồn tại, không thể xem khác biệt.',
	
	// Stats
	'stat-pages':				'Số trang:',
	'stat-save':				'Đã lưu:',
	'stat-null':				'Làm mới:',
	'stat-skip':				'Bỏ qua:',
	'stat-other':				'Khác:',
	
	// Tab 1
	'label-pagelist':			'Cài đặt',
	'label-remove':				'Xoá trang:',
	'button-remove-dupes':		'trùng',
	'tip-remove-dupes':			'Xoá các trang bị trùng lặp.',
	'button-remove-uniqs':		'không trùng',
	'tip-remove-uniqs':			'Xoá các trang chỉ được liệt kê một lần.',
	'button-remove-undo':		'phục hồi',
	'tip-remove-undo':			'Lùi lại tác vụ tác vụ xoá cuối cùng.',
	'preparse':					'Bật chế độ phân tích trước',
	'tip-preparse':				'Chạy dọc các trang, lọc ra trước những trang sẽ được bỏ qua.',
	'preparse-reset':			'đặt lại',
	'tip-preparse-reset':		'Xoá thẻ #PRE-PARSE-STOP để phân tích lại từ đầu.',
	'button-pagelist-generate':	'Tạo danh sách',
	'button-pagelist-stop':		'Dừng',
	'button-pagelist-top':		'Đầu',
	'button-pagelist-bot':		'Cuối',
	'button-sort':				'Xếp',
	'label-settings':			'Thiết lập',
	'setup-store':				'Lưu',
	'setup-store-tip':			'Lưu các thiết lập hiện có trong menu để truy cập lại sau.\n'+
								'Để sử dụng thiết lập trong các phiên khác, bạn cần lưu nó thành một trang wiki hoặc tải xuống.',
	'load-settings':			'Tải:',
	'setup-default':			'mặc định',
	'setup-blank':				'trống',
	'setup-delete':				'Xoá',
	'setup-delete-tip':			'Xoá thiết lập đang được chọn.',
	'setup-save':				'Lưu trang wiki',
	'setup-download':			'Tải xuống',
	'setup-import':				'Tải lên',
	'setup-import-tip':			'Tải tệp thiết lập (định dạng JSON) từ thiết bị của bạn.',
	'setup-update':				'Làm mới',
	'setup-update-tip':			'Làm mới thiết lập được lưu trong trang /$1 của bạn',
	'label-limits':				'Giới hạn',
	'time-limit':				'Giới hạn RegEx',
	'tip-time-limit':			'Giới hạn thời gian cho các biểu thức chính quy, áp dụng với cả tính năng thay thế và bỏ qua.',
	'diff-size-limit':			'Giới hạn khác biệt',
	'tip-diff-size-limit':		'Giới hạn tối đa số ký tự thêm hoặc bớt. Đặt về 0 để bỏ qua. Tính năng này giúp chặn những sửa đổi lớn ngoài ý muốn.',
	'size-limit-exceeded':		'Sửa đổi của bạn đã vượt ngưỡng giới hạn trong thẻ &quot;Cài đặt&quot;. Đặt giới hạn về 0 để bỏ qua cảnh báo.',

	// Tab 2
	'edit-summary':				'Tóm lược:',
	'bot-edit':					'Sửa đổi bot',
	'minor-edit':				'Sửa đổi nhỏ',
	'tip-via-JWB':				'Thêm &quot; (via JWB)&quot; vào cuối tóm lược sửa đổi',
	'watch-add':				'thêm',
	'watch-remove':				'gỡ',
	'watch-nochange':			'Không thay đổi',
	'watch-preferences':		'Theo tuỳ chọn',
	'watch-watch':				'Theo dõi',
	'watch-unwatch':			'Bỏ theo dõi',
	'auto-save':				'Tự động lưu',
	'save-interval':			'mỗi $1 giây', //$1 represents the throttle/interval input element
	'tip-save-interval':		'Khoảng thời gian giữa các sửa đổi (giây)',
	'editbutton-stop':			'Dừng',
	'editbutton-start':			'Chạy',
	'editbutton-save':			'Lưu',
	'editbutton-preview':		'Xem',
	'editbutton-skip':			'Bỏ qua', // This message is also used in tab 4
	'editbutton-diff':			'Khác',
	'button-open-popup':		'Thêm trường khác',
	'button-more-fields':		'Thêm trường mới',
	'button-remove-this':		'Xoá trường',
	'label-rtext':				'Thay:',
	'label-rwith':				'Bằng:',
	'label-useregex':			'Biểu thức chính quy',
	'label-regex-flags':		'<i>flag</i>:',
	'tip-regex-flags':			'Flag cho biểu thức chính quy; chẳng hạn như &quot;i&quot; hoặc &quot;g&quot;.\n'+
								'JWB cũng hỗ trợ flag &quot;_&quot;, khiến biểu thức chính quy coi dấu gạch dưới và dấu cách là như nhau. '+
								'Cẩn thận khi dùng.',
	'label-ignore-comment':		'Bỏ qua nội dung định dạng trước',
	'tip-ignore-comment':		'Bỏ qua nội dung trong các thẻ nowiki, source, math và pre.',
	'label-enable-RETF':		'Bật $1',
	'label-RETF':				'RegEx Typo Fix',
	'tip-refresh-RETF':			'Làm mới danh sách lỗi chính tả.',
	'skip-RETF':				'Tắt tạm thời',
	'tip-skip-RETF':			'Tải lại nội dung trang và bỏ qua RETF.',
	
	// Tab 3
	'label-redirects':			'Đổi hướng:',
	'redirects-follow':			'Đi theo',
	'tip-redirects-follow':		'Sửa trang được đổi hướng tới',
	'redirects-skip':			'Bỏ qua',
	'tip-redirects-skip':		'Bỏ qua các trang đổi hướng',
	'redirects-edit':			'Sửa đổi',
	'tip-redirects-edit':		'Sửa trực tiếp các trang đổi hướng',
	'label-skip-when':			'Bỏ qua khi:',
	'skip-no-change':			'Không có sửa đổi',
	'skip-exists-yes':			'tồn tại',
	'skip-exists-no':			'không tồn tại',
	'skip-exists-neither':		'không bỏ',
	'skip-after-action':		'Bỏ qua sửa đổi sau khi khoá hoặc di chuyển',
	'skip-contains':			'Khi trang có:',
	'skip-not-contains':		'Khi trang không có:',
	'skip-category':			'Khi trang nằm trong thể loại:',
	'skip-cg-prefix':			'Không cần tiền tố không gian tên; phân tách bằng dấu gạch đứng hoặc dấu phẩy.',
	
	// Tab 4
	'editbutton-move':			'DC',
	'editbutton-delete':		'Xoá',
	'editbutton-undelete':		'PH',
	'editbutton-protect':		'Khoá',
	'move-header':				'Di chuyển',
	'move-redir-suppress':		'Tắt đổi hướng',
	'move-also':				'Di chuyển cùng:',
	'move-talk-page':			'trang tl',
	'move-subpage':				'trang con',
	'move-new-name':			'Tên đích:',
	'protect-header':			'Khoá',
	'protect-edit':				'Sửa đổi:',
	'protect-move':				'Di chuyển:',
	'protect-upload':			'Tải lên:',
	'protect-delete':			'Xoá:',
	'protect-protect':			'Khoá:',
	'protect-like-edit':		'như Sửa đổi',
	'protect-none':				'không khoá',
	'protect-expiry':			'Thời hạn:',
	'protect-cascading':		'Khoá theo tầng',
	'right-header':				'Cấp gỡ quyền',
	'right-grant':				'Tự cấp quyền $1',
	'right-revoke':				'Tự gỡ quyền $1',
	
	// Tab -2
	'readd-header':				'Thêm lại',
	'readd-edit':				'Sửa đổi',
	'readd-null':				'Làm mới',
	'readd-move':				'Di chuyển',
	'readd-skip':				'Bỏ qua',
	'readd-bots':				'Bỏ qua (bot)',
	'readd-flag':				'Quyền',
	'readd-delete':				'Xoá',
	'readd-undelete':			'Phục hồi',
	'readd-protect':			'Khoá',
	'readd-button':				'Thêm',
	
	// Tab -1
	'log-clear':				'Dọn dẹp',
	'log-clear-yes':			'Xác nhận',
	'log-clear-no':				'Huỷ bỏ',
	'log-diff':					'kb',
	'log-bots':					'bot',
	'log-info':					'tt',
	'log-movedto':				'đến',
	'log-protect':				'kh',
	'log-protect-cascading':	'khoá theo tầng:',
	'log-protect-casctrue':		'có',
	'log-protect-expiry':		'thời hạn:',
	'log-protect-indef':		'vô hạn',
	'log-right-granted':		'Đã cấp quyền $1',
	'log-right-revoked':		'Đã gỡ quyền $1',
	'log-right-nochange':		'Không thay đổi',
	
	//Dialog boxes
	'confirm-leave':			'Nếu đóng thẻ này, mọi tiến trình bạn đã thực hiện sẽ bị mất.',
	'alert-no-move':			'Hãy nhập tên mới trước khi di chuyển.',
	'not-on-list':				'Bạn không có tên trong danh sách kiểm tra quyền truy cập. Vui lòng liên hệ một bảo quản viên.',
	'verify-error':				'Có lỗi khi tải nội dung trang danh sách kiểm tra:',
	'new-message':				'Bạn có tin nhắn mới. Xem liên kết ở thanh trạng thái.',
	'no-pages-listed':			'Vui lòng nhập trang trước khi chạy.',
	'infinite-skip-notice':		'Không trường thay thế nào có nội dung và bạn đã chọn bỏ qua khi không có sửa đổi.\n'+
								'Vui lòng kiểm tra lại cài đặt trong thẻ &quot;Sửa đổi&quot; và &quot;Bỏ qua&quot;',
	'autosave-error':			'Có lỗi xảy ra khi lưu trang trước. Hãy kiểm tra thẻ &quot;$1&quot; để biết sửa đổi trước có thành công hay không.',
	'csp-error':				'Không thể thực hiện tác vụ trước: Vi phạm Quy định Bảo mật Nội dung "$1".',
	'confirm-continue':			'Tiếp tục?',
	'right-revoke-confirm':		'Bạn sắp tự gỡ quyền $1 và không có khả năng hoàn tác tác vụ này. Xác nhận?',
	
	//Statuses
	'status-alt':				'đang tải...',
	'status-done':				'Xong.',
	'status-newmsg':			'Bạn có $1 ($2)',
	'status-talklink':			'tin nhắn mới',
	'status-difflink':			'sửa đổi cuối',
	'status-load-page':			'Đang lấy nội dung trang...',
	'status-replacing':			'Đang thay thế...',
	'status-check-skips':		'Đang kiểm tra quy tắc bỏ qua...',
	'status-submit':			'Đang lưu nội dung trang...',
	'status-preview':			'Đang tải bản xem trước...',
	'status-diff':				'Đang tải khác biệt sửa đổi...',
	'status-move':				'Đang di chuyển trang...',
	'status-delete':			'Đang xoá trang...',
	'status-undelete':			'Đang phục hồi trang...',
	'status-protect':			'Đang khoá trang...',
	'status-watch':				'Đang sửa danh sách theo dõi...',
	'status-watch-added':		'Đã theo dõi.',
	'status-watch-removed':		'Đã bỏ theo dõi.',
	'status-right': 			'Đang cấp/gỡ quyền...',
	'status-regex-err':			'Lỗi biểu thức chính quy. Hãy kiểm tra lại nội dung nhập trong các trường <i>Thay</i>.',
	'status-setup-load':		'Đang tải thiết lập JWB...',
	'status-setup-submit':		'Đang lưu trang wiki...',
	'status-setup-dload':		'Đang tải thiết lập xuống...',
	'status-old-browser':		'Hãy sử dụng $1 để tải lên.',
	'status-del-setup':			'Đã xoá "$1". $2?',
	'status-del-default':		'Đã đặt lại thiết lập mặc định. $1?',
	'status-del-undo':			'Phục hồi',
	'status-pl-over-lim':		'Đã đạt đến giới hạn yêu cầu máy chủ.',
	'status-unexpected':		'Lỗi không xác định. Xem bảng điều khiển để biết chi tiết kỹ thuật.',

	//Setup
	'setup-prompt':				'Bạn muốn $1 thiết lập hiện tại với tên nào?',
	'setup-prompt-store':		'tải',
	'setup-prompt-save':		'lưu',
	'setup-summary':			'Cập nhật thiết lập JWB /* bán tự động */',
	'old-browser':				'Trình duyệt của bạn không hỗ trợ tải lên tập tin. Vui lòng cập nhật trình duyệt, '+
								'hoặc lưu nội dung thành trang wiki. Xem thêm liên kết ở thanh trạng thái.',
	'not-json':					'Chỉ có thể tải lên tệp JSON. Vui lòng kiểm tra lại, hoặc sửa phần mở rộng của tập tin nếu cần.',
	'json-err':					'Thiết lập JWB có lỗi:\n$1\nHãy kiểm tra lại $2.',
	'json-err-upload':			'tập tin',
	'json-err-page':			'bằng cách đi đến trang con /$1',
	'setup-delete-blank':		'Bạn không thể xoá thiết lập trống.',
	'duplicate-settings':		'Có hai trang thiết lập tồn tại. Hãy di chuyển mọi thiết lập từ "$1" đến "$2" và tạo đổi hướng '+
								'(xem $3 để biết cách tạo đổi trang đổi hướng bằng Javascript).',
	'setup-move-summary':		'Di chuyển trang thiết lập JWB đến tên mới /* tự động */',
	'moved-settings':			'Trang thiết lập JWB của bạn đã được tự động di chuyển từ "$1" đến tên mới "$2". Tác vụ này đã được lưu lại ở thẻ "$3".\n'+
								'Hãy yêu cầu một bảo quản viên đổi kiểu nội dung trang thành JSON.',
	
	//Pagelist generating
	'namespace-main':			'chính',
	'label-ns-select':			'Không gian tên:',
	'tip-ns-select':			'Nhấn giữ Ctrl và kéo thả chuột đồng thời để chọn nhiều không gian tên cùng lúc.',
	'redir-label':				'Đổi hướng:',
	'redir-redirs':				'đổi hướng',
	'redir-noredirs':			'không phải đổi hướng',
	'redir-all':				'cả hai',
	'legend-cm':				'Thể loại',
	'label-cm':					'Thể loại:',
	'tip-cm':					'Không cần nhập không gian tên; chỉ nhập một tên mỗi lần.',
	'cm-include':				'Liệt kê:',
	'cm-include-pages':			'trang',
	'cm-include-subcgs':		'thể loại con',
	'cm-include-files':			'tập tin',
	'legend-linksto':			'Liên kết đến',
	'label-linksto':			'Liên kết đến trang:',
	'links-include':			'Liệt kê:',
	'links-include-links':		'liên kết wiki',
	'links-include-templ':		'liên kết nhúng',
	'links-include-files':		'liên kết tập tin',
	'label-link-redir':			'Liệt kê cả các liên kết đến trang đổi hướng',
	'tip-link-redir':			'Include links directed towards one of this page\'s redirects',
	'legend-ps':				'Tiền tố',
	'label-ps':					'Trang có tiền tố:',
	'label-ps-strict':			'Bật chế độ ngặt',
	'tip-ps-strict':			'Bật để kích hoạt tìm kiếm ngặt; tắt để tìm không ngặt.',
	'legend-wr':				'Danh sách theo dõi',
	'label-wr':					'Liệt kê các trang trong danh sách theo dõi',
	'legend-rn':				'Ngẫu nhiên',
	'label-rn':					'Liệt kê ngẫu nhiên các trang',
	'label-rn-limit':			'Giới hạn:',
	'rn-limit-invalid':			'Giá trị không hợp lệ. Giới hạn phải là một số nguyên từ $1 đến $2.',
	'legend-pl':				'Liên kết khỏi trang',
	'label-pl':					'Tên trang:',
	'tip-pl':					'Lấy danh sách liên kết trong trang.\nPhân tách giá trị bằng dấu gạch đứng.',
	'legend-sr':				'Tìm kiếm wiki',
	'tip-sr':					'Tìm kiếm bằng chức năng tìm kiếm thông thường.',
	'label-sr':					'Từ khoá:',
	'placeholder-sr':			'Khuyên dùng: $1/example/ hoặc $2/example/',
	'legend-smw':				'Truy vấn MediaWiki Ngữ nghĩa ($1)',
	'smw-slow':					'chậm',
	'label-smw':				'Nhập truy vấn MediaWiki Ngữ nghĩa. Đừng quên chỉ định giới hạn truy vấn, chẳng hạn như $1',
};
