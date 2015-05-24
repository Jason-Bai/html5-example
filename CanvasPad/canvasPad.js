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


	$(window).resize(function () {
		pageOffset = $canvas.offset();
	});
}

function CanvasPadApp() {
	var version = '4.1',
			canvas2d = new Canvas2D($('#main > canvas')),
			drawing = false,
			points = [],
			actions = [];


	function onMouseMove(e) {
		penMoved(e.pageX, e.pageY);
	}

	function penMoved(pageX, pageY) {
		var canvasPoint = canvas2d.getCanvasPoint(pageX, pageY);
		showCoordinates(canvasPoint);

		if (drawing) {
			points.push(canvasPoint);
			redraw();
		}
	} 

	function redraw() {
		canvas2d.clear();
		for (var i in actions){
			canvas2d.drawPoints(actions[i]);				
		}
	}

	function showCoordinates(point) {
		$('#coords').text(point.x + ', ' + point.y);
	}

	function onMouseDown(e) {
		e.preventDefault();
		penDown(e.pageX, e.pageY);
	}

	function penDown(x, y) {
		drawing = true;
		points = [];
		points.push(canvas2d.getCanvasPoint(x, y));
		actions.push(points);
	}


	function onMouseUp(e) {
		penUp();
	}

	function penUp() {
		drawing = false;
	}

	this.start = function () {
		$('#app header').append(version);
		$('#main > canvas')
			.mousemove(onMouseMove)
			.mousedown(onMouseDown)
			.mouseup(onMouseUp)
			.mouseout(onMouseUp);
	};
}

$(function () {
	var canvasPadApp = new CanvasPadApp();
	canvasPadApp.start();
});
