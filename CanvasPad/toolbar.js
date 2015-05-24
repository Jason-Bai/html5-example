function Toolbar($toolbar) {
	var _this = this;

	this.toolbarButtonClicked = function (action) {
		return false;
	};

	this.menuItemClicked = function (option, value) {
		return false;
	};

	this.hideMenus = function () {
		$('.menu', $toolbar).hide();
	}

	$('button', $toolbar).click(function (e) {
		onToolbarButtonClicked($(this));
	});
}
