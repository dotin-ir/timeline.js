var persianDigits = ['۰', '۱', '۲',  '۳',  '۴',  '۵',  '۶',  '۷',  '۸', '۹'];
var dowNames = ['شنبه', 'یک‌شنبه', 'دوشنبه',  'سه‌شنبه',  'چهارشنبه',  'پنج‌شنبه',  'جمعه'];

function ready(fn) {
	if (document.readyState != 'loading') {
		fn();
	} else {
		document.addEventListener('DOMContentLoaded', fn);
	}
};

function getJSON(url, fn) {
	var request = new XMLHttpRequest();
	request.open('GET', url, true);

	request.onload = function() {
	  if (request.status >= 200 && request.status < 400) {
		var data = JSON.parse(request.responseText);
		fn(data);
	  } else {
		// We reached our target server, but it returned an error

	  }
	};

	request.onerror = function() {
	  // There was a connection error of some sort
	};

	request.send();
}

ready(function() {
	getJSON('timeline.json', function( config ) {

		addTitle(config.title);

		addTimeline(config);

	});
});

function addTitle(title) {
	if (title != 'disabled') {
		var titleElement = document.createElement('h1');
		titleElement.textContent = title;
		document.querySelector('#title').appendChild(titleElement);
	}
}

function addTimeline(config) {
	var timeline = document.createElement('table');
	timeline.setAttribute('cellspacing', 0);

	appendHeadersToTimeline(timeline, config.season);
	appendSwimlanesToTimeline(timeline, config.swimlanes, config.season.months);
	appendFootersToTimeline(timeline, config.season);

	document.querySelector('#timeline').appendChild(timeline);
}

function appendHeadersToTimeline(timeline, season) {
	timeline.appendChild(createHeaderColumns(season.months, season.startsOnDayOfWeek, season.weekend));
	timeline.appendChild(createMonthsHeader(season.months));
	timeline.appendChild(createDaysHeader(season.months));
}

function createHeaderColumns(months, startsOnDayOfWeek, weekend) {
	var colHeader = document.createElement('colgroup');
	colHeader.appendChild(createTitleRowColumn());

	var dayOfWeek = startsOnDayOfWeek;
	for (var i=0; i<months.length; i++) {
		var month = months[i];
		appendMonthToColHeader(colHeader, month.id, month.numOfDays, dayOfWeek, weekend, month.holidays);
		dayOfWeek = advanceDayOfWeek(dayOfWeek, month.numOfDays);
	}
	return colHeader;
}

function createTitleRowColumn() {
	return document.createElement('col');
}

function appendMonthToColHeader(colHeader, month, numOfDays, firstDayOfWeek, weekend, holidays) {
	dayOfWeek = firstDayOfWeek;
	for (var dayOfMonth=1; dayOfMonth<=numOfDays; dayOfMonth++) {
		colHeader.appendChild(createColumnForDay(month, dayOfMonth, dayOfWeek, weekend, holidays));
		dayOfWeek++;
		dayOfWeek %= 7;
	}
}

function createColumnForDay(month, dayOfMonth, dayOfWeek, weekend, holidays) {
	var col = document.createElement('col');
	col.textContent = dayOfMonth;
	if (isWeekend(dayOfWeek, weekend) || isHolliday(dayOfMonth, holidays)) {
		addClass(col, 'offDay');
	}
	if (isToday(month, dayOfMonth)) {
		addClass(col, 'today');
	}
	return col;
}

function addClass(el, newClass) {
	if (el.classList) {
		el.classList.add(newClass);
	} else {
		el.className += ' ' + newClass;
	}
}

function isWeekend (dayOfWeek, weekend) {
	return dayOfWeek == weekend;
}

function isHolliday(dayOfMonth, holidays) {
	return holidays.indexOf(dayOfMonth) != -1;
}

function isToday(month, day) {
	var gregorian = new Date();
	var jalaliDate = toJalaali(gregorian.getFullYear(), gregorian.getMonth()+1, gregorian.getDate());
	return month == jalaliDate.jm && day == jalaliDate.jd;
}

function createMonthsHeader(months) {
	var monthNamesHeader = document.createElement('tr');
	addClass(monthNamesHeader, 'monthNames');

	var monthNameHeaderTitleColumn = document.createElement('th');
	monthNameHeaderTitleColumn.textContent = 'ماه';
	monthNamesHeader.appendChild(monthNameHeaderTitleColumn);

	for (var i=0; i<months.length; i++) {
		monthNamesHeader.appendChild(createMonthName(months[i]));
	}
	return monthNamesHeader;
}

function createMonthName(month) {
	var monthName = document.createElement('th');
	monthName.textContent = month.name;
	monthName.setAttribute('colspan', month.numOfDays);
	if (month.id != 1) {
		addClass(monthName, 'monthSeparator');
	}
	return monthName;
}

function createDaysHeader(months) {
	var daysHeader = document.createElement('tr');
	addClass(daysHeader, 'dayNumbers');

	var daysHeaderTitleColumn = document.createElement('td');
	daysHeaderTitleColumn.textContent = 'روز';
	daysHeader.appendChild(daysHeaderTitleColumn);
	for (var i=0; i<months.length; i++) {
		appendDaysHeaderForMonth(daysHeader, months[i]);
	}

	return daysHeader;
}

function appendDaysHeaderForMonth(daysHeader, month) {
	for (var dayOfMonth=1; dayOfMonth<=month.numOfDays; dayOfMonth++) {
		daysHeader.appendChild(createDayHeader(month.id, dayOfMonth));
	}
}

function createDayHeader(month, dayOfMonth) {
	var day = document.createElement('td');
	day.textContent = convert(dayOfMonth);
	addClass(day, 'vertical-text');
	if (month != 1 && dayOfMonth == 1) {
		addClass(day, 'monthSeparator');
	}
	return day;
}

function convert(number) {
	number = "" + number;
	var result = "";
	for (var i = 0; i < number.length; i++) {
		result = result + convertDigit(eval(number[i]));
	}
	return result;
}

function convertDigit(number) {
	return persianDigits[number];
}

function appendSwimlanesToTimeline(timeline, swimlanes, months) {
	for (var i=0; i<swimlanes.length; i++) {
		appendSwimlaneToTimeline(timeline, swimlanes[i], months);
	}
}

function appendSwimlaneToTimeline(timeline, swimlane, months) {
	for (var intervalId=0; intervalId<swimlane.intervals.length; intervalId++) {
		timeline.appendChild(createIntervalRow(swimlane, intervalId, months));
	}
}

function createIntervalRow(swimlane, intervalId, months) {
	var intervalRow = document.createElement('tr');
	if (intervalId == 0) {
		intervalRow.appendChild(createTitleCell(swimlane));
	}

	for (m = 0; m < months.length; m++) {
		appendMonthForInterval(intervalRow, months[m], swimlane.intervals[intervalId], swimlane.color);
	}
	return intervalRow;
}

function createTitleCell(swimlane) {
	var titleCell = document.createElement('td');
	titleCell.textContent = swimlane.title;
	addClass(titleCell, 'vertical-text');
	titleCell.setAttribute('rowspan', Math.max(1, swimlane.intervals.length));
	titleCell.setAttribute('style', 'background-color: ' + swimlane.color + ';');
	return titleCell;
}

function appendMonthForInterval(intervalRow, month, interval, swimlaneColor) {
	for (day = 1; day <= month.numOfDays; day++) {
		intervalRow.appendChild(createDayCell(month.id, day, interval.from, interval.to, swimlaneColor));
	}
}

function createDayCell(month, day, from, to, swimlaneColor) {
	var dayCell = document.createElement('td');
	if (month != 1 && day == 1) {
		addClass(dayCell, 'monthSeparator');
	}
	
	if (isDayInInterval(month, day, from, to)) {
		dayCell.setAttribute('style', 'background-color: ' + swimlaneColor + ';');
		applyDayIcons(dayCell, month, day, from, to);
	}
	return dayCell;
}

function applyDayIcons(dayCell, month, day, from, to) {
	if (isBeginningDay(month, day, from)) {
		var icon = document.createElement('i');
		addClass(icon, 'fa');
		addClass(icon, 'fa-check-square-o');
		dayCell.appendChild(icon);
	}
	if (isEndingDay(month, day, to)) {
		var icon = document.createElement('i');
		addClass(icon, 'fa');
		addClass(icon, 'fa-user-md');
		dayCell.appendChild(icon);
	}
}

function isBeginningDay(month, day, from) {
	return from.date.month == month && from.date.day == day;
}

function isEndingDay(month, day, to) {
	if (to == "eternity") {
		return false;
	}
	return to.date.month == month && to.date.day == day;
}

function isDayInInterval(month, day, from, to) {
	if (from.date.month == month && from.date.day <= day || from.date.month < month) {
		if (to == "eternity") {
	   		return true;
		}
		return to.date.month == month && to.date.day >= day || to.date.month > month;
	}
	return false;
}

function appendFootersToTimeline(timeline, season) {
	timeline.appendChild(createDaysOfWeekRow(season.months, season.startsOnDayOfWeek));
}

function createDaysOfWeekRow(months, startsOnDayOfWeek) {
	var daysOfWeek = document.createElement('tr');
	daysOfWeek.appendChild(document.createElement('td'));

	var dayOfWeek = startsOnDayOfWeek;
	for (var i=0; i<months.length; i++) {
		var month = months[i];
		for (var j=1; j<month.numOfDays+1; j++) {
			var dayOfWeekCell = document.createElement('td');
			dayOfWeekCell.textContent = dowNames[dayOfWeek];
			addClass(dayOfWeekCell, 'vertical-text');
			addClass(dayOfWeekCell, 'dayOfWeek');
			daysOfWeek.appendChild(dayOfWeekCell);
			dayOfWeek = advanceDayOfWeek(dayOfWeek, 1);
		}
	}
	return daysOfWeek;
}

function advanceDayOfWeek(dayOfWeek, amount) {
	return (dayOfWeek + amount) % 7;
}
