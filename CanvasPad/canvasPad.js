function Canvas2D($canvas) {

	var canvas = $canvas[0],
			context = canvas.getContext('2d'),
			width = canvas.width,
			height = canvas.height;

	context.lineWidth = 4;
	context.strokeStyle = 'black';
	context.fillStyle = 'black';
	context.globalAlpha = 1.0;
	context.lineJoin = 'round';
	context.lineCap = 'round';
	context.font = '24px Verdana, Geneva, sans-serif';
	context.textBaseline = 'top';

	var pageOffset = $canvas.offset();

	this.getCanvasPoint = function (pageX, pageY) {
		return {
			x: pageX - pageOffset.left,
			y: pageY - pageOffset.top
		};
	};

	this.penWidth = function (newWidth) {
		if (arguments.length) {
			context.lineWidth = newWidth;
			return this;
		}
		return context.lineWidth;
	};

	this.penColor = function (newColor) {
		if (arguments.length) {
			context.strokeStyle = newColor;
			return this;
		}
		return context.strokeStyle;
	};

	this.penOpacity = function (newOpacity) {
		if (arguments.length) {
			context.globalAlpha = newOpacity;
			return this;
		}
		return context;
	};

	this.font = function (newFont) {
		if (arguments.length) {
			context.font = newFont + ' Verdana, Geneva, sans-serif';
			return this;
		}
		return context.font;
	};

	this.clear = function () {
		context.clearRect(0, 0, width, height);
		return this;
	}

	this.drawPoints = function (points) {
		context.beginPath();
		context.moveTo(points[0].x, points[0].y);
		for (var i = 1, max = points.length; i < max; i++) {
			context.lineTo(points[i].x, points[i].y);
		}
		context.stroke();
		return this;
	};

	this.drawLine = function (point1, point2) {
		context.beginPath();
		context.moveTo(point1.x, point1.y);
		context.lineTo(point2.x, point2.y);
		context.stroke();
		return this;
	};

	this.drawRect = function (point1, point2, fill) {
		var w = point2.x - point1.x,
				h = point2.y - point1.y;
		if (fill) context.fillRect(point1.x, point1.y, w, h);
		else context.strokeRect(point1.x, point1.y, w, h);
		return this;
	};

	this.drawCircle = function (center, radius, fill) {
			context.beginPath();
			context.arc(center.x, center.y, radius, 0, 2 * Math.PI, true);
			if (fill) context.fill();
			else context.stroke();
			return this;
	};

	this.drawText = function (font, text, point, fill) {
		context.font = font;
		if (fill) {
			context.fillText(text, point.x, point.y);
		} else {
			context.strokeText(text, point.x, point.y);
		}
	};

	this.savePen = function () {
		context.save();
		return this;
	};

	this.restorePen = function () {
		context.restore();
		return this;
	};


	$(window).resize(function () {
		pageOffset = $canvas.offset();
	});
}

function CanvasPadApp() {
	var version = '4.1',
			canvas2d = new Canvas2D($('#main > canvas')),
			toolbar = new Toolbar($('#toolbar')),
			drawing = false,
			points = [],
			curTool = 'pen',
			curAction = newAction(curAction),
			actions = [],
			fillShapes = true;

	function newAction(tool) {
		return {
			tool: tool,
			color: canvas2d.penColor(),
			width: canvas2d.penWidth(),
			opacity: canvas2d.penOpacity(),
			fill: fillShapes,
			points: []
		};
	}

	function onMouseMove(e) {
		penMoved(e.pageX, e.pageY);
	}

	function penMoved(pageX, pageY) {
		var canvasPoint = canvas2d.getCanvasPoint(pageX, pageY);
		showCoordinates(canvasPoint);

		if (drawing) {
			if (curTool == 'pen') {
				curAction.points.push(canvasPoint);
			} else {
				curAction.points[1] = canvasPoint;
			}
			redraw();
		}
	} 

	function redraw() {
		canvas2d.clear();
		canvas2d.savePen();

		for (var i in actions){
			var action = actions[i];
			canvas2d.penColor(action.color)
							.penWidth(action.width)
							.penOpacity(action.opacity);
			switch (action.tool) {
				case 'pen':
					canvas2d.drawPoints(action.points);
					break;
				case 'line':
					canvas2d.drawLine(action.points[0], action.points[1]);
					break;
				case 'rect':
					canvas2d.drawRect(action.points[0], action.points[1], action.fill);
					break;
				case 'circle':
					var dx = Math.abs(action.points[1].x - action.points[0].x);
					var dy = Math.abs(action.points[1].y - action.points[0].y);;
					var radius = Math.min(dx, dy);
					canvas2d.drawCircle(action.points[0], radius, action.fill);
					break;
				case 'text':
					canvas2d.drawText(action.font, action.text, action.points[0], action.fill);
					break;
			}
		}

		canvas2d.restorePen();
	}

	function showCoordinates(point) {
		$('#coords').text(point.x + ', ' + point.y);
	}

	function onMouseDown(e) {
		e.preventDefault();
		penDown(e.pageX, e.pageY);
	}

	function penDown(x, y) {
		if (curTool == 'text') {
			if ($('#text-input').is(':visible')) return;
			showTextInput(x, y);
		} else {
			drawing = true;
		}
		curAction = newAction(curTool);
		curAction.points.push(canvas2d.getCanvasPoint(x, y));
		actions.push(curAction);
	}

	function showTextInput(pageX, pageY) {
		$('#text-input').css('top', pageY)
									  .css('left', pageX)
										.fadeIn('fast');
		$('#text-input input').val('').focus();
	}


	function onMouseUp(e) {
		penUp();
	}

	function penUp() {
		if (drawing) {
			drawing = false;
			if (curAction.points.length < 2) {
				actions.pop();
			}
		}
	}

	function toolbarButtonClicked(action) {
		switch (action) {
			case 'clear':
				if (confirm('Clear the canvas?')) {
					actions = [];
					redraw();
				}
				break;
			case 'undo':
				actions.pop();
				redraw();
				break;
		}
	}

	function menuItemClicked(option, value) {
		switch (option) {
			case 'drawingTool':
				curTool = value;
				break;
			case 'fillShapes':
				fillShapes = Boolean(value);
				break;
			default:
				canvas2d[option](value);
		}
	}

	function initColorMenu() {
		$('#color-menu li').each(function (i, e) {
			$(e).css('background-color', $(e).data('value'));
		});
	}

	function initWidthMenu() {
		$('#width-menu li').each(function (i, e) {
			$(e).css('border-bottom', $(e).data('value') + 'px solid black');
		});
	}

	function checkTextInput(key) {
		if (key == 13) {
			curAction.text = $('#text-input input').val();
			curAction.font = canvas2d.font();
			$('#text-input').hide();
			redraw();
		} else if (key == 27) {
			actions.pop();
			$('#text-input').hide();
		}
	}

	this.start = function () {
		$('#app header').append(version);
		$('#main > canvas')
			.mousemove(onMouseMove)
			.mousedown(onMouseDown)
			.mouseup(onMouseUp)
			.mouseout(onMouseUp);
		toolbar.toolbarButtonClicked = toolbarButtonClicked;
		toolbar.menuItemClicked = menuItemClicked;

		initColorMenu();
		initWidthMenu();

		$('#text-input input').keydown(function (e) {
			checkTextInput(e.which);
		});
	};
}

$(function () {
	var canvasPadApp = new CanvasPadApp();
	canvasPadApp.start();
});
