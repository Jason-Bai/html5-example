"use strict"

function TaskAtHand() {
	var version = 'v1.0',
			appStorage = new AppStorage('taskAtHand');

	function setStatus (message) {
		$('#app > footer').text(message);
	}

	function addTask() {
		var taskName = $('#new-task-name').val();
		if (taskName) {
			addTaskElement(taskName);
			$('#new-task-name').val('').focus();
		}
	}

	function addTaskElement(taskName) {
		var $task = $('#task-template .task').clone();
		$('span.task-name', $task).text(taskName);

		$('#task-list').append($task);

		$('button.delete', $task).click(function () {
			removeTask($task);
		});
		
		$('button.move-up', $task).click(function () {
			moveTask($task, true);
		});

		$('button.move-down', $task).click(function () {
			moveTask($task, false);
		});

		$('span.task-name', $task).click(function () {
			onEditTaskName($(this));
		});

		$('input.task-name', $task).change(function () {
			onChangeTaskName($(this));
		}).blur(function () {
			$(this).hide().siblings('span.task-name').show();
		});

		saveTaskList();
	}

	function loadTaskList() {
		var tasks = appStorage.getValue('taskList');
		if (tasks) {
			for (var i in tasks) {
				addTaskElement(tasks[i]);
			}
		}
	}

	function removeTask($task) {
		$task.remove();
		saveTaskList();
	}

	function moveTask($task, moveUp) {
		if (moveUp) {
			$task.insertBefore($task.prev());
		} else {
			$task.insertAfter($task.next());
		}
		saveTaskList();
	}

	function onChangeTaskName($input) {
		$input.hide();
		var $span = $input.siblings('span.task-name');
		if ($input.val()) {
			$span.text($input.val());
		}
		$span.show();
	}

	function onEditTaskName($span) {
		$span.hide()
				 .siblings('input.task-name')
				 .val($span.text())
				 .show()
				 .focus();
	}

	function saveTaskList() {
		var tasks = [];
		$('#task-list .task span.task-name').each(function () {
			tasks.push($(this).text());
		});
		appStorage.setValue('taskList', tasks);
	}

	this.start = function () {

		$('#new-task-name').keypress(function (e) {
			if (e.which == 13) {
				addTask();
				return false;
			}
		}).focus();

		$('#app > header').append(version);
		setStatus('ready');
		loadTaskList();
	};
}
$(function () {
	window.app = new TaskAtHand();
	window.app.start();
});
