var persianDigits = ['۰', '۱', '۲',  '۳',  '۴',  '۵',  '۶',  '۷',  '۸', '۹'];
var dowNames = ['شنبه', 'یک‌شنبه', 'دوشنبه',  'سه‌شنبه',  'چهارشنبه',  'پنج‌شنبه',  'جمعه'];

$( document ).ready(function() {
	$.getJSON('timeline.json', function( config ) {

		addTitle(config.title);

		addTimeline(config);

	});
});

function addTitle(title) {
	if (title != 'disabled') {
		$('#title').append($('<h1></h1>').text(title));
	}
}

function addTimeline(config) {
	var timeline = $('<table></table>').attr('cellspacing', 0);

	appendHeadersToTimeline(timeline, config.season);
	appendSwimlanesToTimeline(timeline, config.swimlanes, config.season.months);
	appendFootersToTimeline(timeline, config.season);

	$('#timeline').append(timeline);
}

function appendHeadersToTimeline(timeline, season) {
	timeline.append(createHeaderColumns(season.months, season.startsOnDayOfWeek, season.weekend));
	timeline.append(createMonthsHeader(season.months));
	timeline.append(createDaysHeader(season.months));
}

function createHeaderColumns(months, startsOnDayOfWeek, weekend) {
	var colHeader = $('<colgroup></colgroup>').append(createTitleRowColumn());

	var dayOfWeek = startsOnDayOfWeek;
	for (var i=0; i<months.length; i++) {
		var month = months[i];
		appendMonthToColHeader(colHeader, month.id, month.numOfDays, dayOfWeek, weekend, month.holidays);
		dayOfWeek = advanceDayOfWeek(dayOfWeek, month.numOfDays);
	}
	return colHeader;
}

function createTitleRowColumn() {
	return $('<col/>');
}

function appendMonthToColHeader(colHeader, month, numOfDays, firstDayOfWeek, weekend, holidays) {
	dayOfWeek = firstDayOfWeek;
	for (var dayOfMonth=1; dayOfMonth<=numOfDays; dayOfMonth++) {
		colHeader.append(createColumnForDay(month, dayOfMonth, dayOfWeek, weekend, holidays));
		dayOfWeek++;
		dayOfWeek %= 7;
	}
}

function createColumnForDay(month, dayOfMonth, dayOfWeek, weekend, holidays) {
	var col = $('<col/>').text(dayOfMonth);
	if (isWeekend(dayOfWeek, weekend) || isHolliday(dayOfMonth, holidays)) {
		col.addClass('offDay');
	}
	if (isToday(month, dayOfMonth)) {
		col.addClass('today');
	}
	return col;
}

function isWeekend (dayOfWeek, weekend) {
	return dayOfWeek == weekend;
}

function isHolliday(dayOfMonth, holidays) {
	return $.inArray(dayOfMonth, holidays) != -1;
}

function isToday(month, day) {
	var gregorian = new Date();
	var jalaliDate = toJalaali(gregorian.getFullYear(), gregorian.getMonth()+1, gregorian.getDate());
	return month == jalaliDate.jm && day == jalaliDate.jd;
}

function createMonthsHeader(months) {
	var monthNamesHeader = $('<tr></tr>').addClass('monthNames').append($('<th></th>').text('ماه'));

	for (var i=0; i<months.length; i++) {
		monthNamesHeader.append(createMonthName(months[i]));
	}
	return monthNamesHeader;
}

function createMonthName(month) {
	var monthName = $('<th></th>').text(month.name).attr('colspan', month.numOfDays);
	if (month.id != 1) {
		monthName.addClass('monthSeparator');
	}
	return monthName;
}

function createDaysHeader(months) {
	var daysHeader = $('<tr></tr>').addClass('dayNumbers');
	daysHeader.append($('<td></td>').text('روز'));
	for (var i=0; i<months.length; i++) {
		appendDaysHeaderForMonth(daysHeader, months[i]);
	}

	return daysHeader;
}

function appendDaysHeaderForMonth(daysHeader, month) {
	for (var dayOfMonth=1; dayOfMonth<=month.numOfDays; dayOfMonth++) {
		daysHeader.append(createDayHeader(month.id, dayOfMonth));
	}
}

function createDayHeader(month, dayOfMonth) {
	var day = $('<td></td>').text(convert(dayOfMonth)).addClass('vertical-text');
	if (month != 1 && dayOfMonth == 1) {
		day.addClass('monthSeparator');
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
		timeline.append(createIntervalRow(swimlane, intervalId, months));
	}
}

function createIntervalRow(swimlane, intervalId, months) {
	var intervalRow = $('<tr></tr>');
	if (intervalId == 0) {
		intervalRow.append(createTitleCell(swimlane));
	}

	for (m = 0; m < months.length; m++) {
		appendMonthForInterval(intervalRow, months[m], swimlane.intervals[intervalId], swimlane.color);
	}
	return intervalRow;
}

function createTitleCell(swimlane) {
	var titleCell = $('<td></td>').text(swimlane.title).addClass('vertical-text');
	titleCell.addClass('swimlane-title');
	titleCell.attr('rowspan', Math.max(1, swimlane.intervals.length));
	titleCell.attr('style', 'background-color: ' + swimlane.color + ';');
	return titleCell;
}

function appendMonthForInterval(intervalRow, month, interval, swimlaneColor) {
	for (day = 1; day <= month.numOfDays; day++) {
		intervalRow.append(createDayCell(month.id, day, interval.from, interval.to, swimlaneColor));
	}
}

function createDayCell(month, day, from, to, swimlaneColor) {
	var dayCell = $('<td></td>');
	if (month != 1 && day == 1) {
		dayCell.addClass('monthSeparator');
	}
	
	if (isDayInInterval(month, day, from, to)) {
		dayCell.attr('style', 'background-color: ' + swimlaneColor + ';');
		applyDayIcons(dayCell, month, day, from, to);
	}
	return dayCell;
}

function applyDayIcons(dayCell, month, day, from, to) {
	if (isBeginningDay(month, day, from)) {
		dayCell.append($('<i></i>').addClass('fa fa-check-square-o'));
	}
	if (isEndingDay(month, day, to)) {
		dayCell.append($('<i></i>').addClass('fa fa-user-md'));
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
	timeline.append(createDaysOfWeekRow(season.months, season.startsOnDayOfWeek));
}

function createDaysOfWeekRow(months, startsOnDayOfWeek) {
	var daysOfWeek = $('<tr></tr>').append('<td></td>');

	var dayOfWeek = startsOnDayOfWeek;
	for (var i=0; i<months.length; i++) {
		var month = months[i];
		for (var j=1; j<month.numOfDays+1; j++) {
			daysOfWeek.append($('<td></td>').addClass('vertical-text dayOfWeek').text(dowNames[dayOfWeek]));
			dayOfWeek = advanceDayOfWeek(dayOfWeek, 1);
		}
	}
	return daysOfWeek;
}

function advanceDayOfWeek(dayOfWeek, amount) {
	return (dayOfWeek + amount) % 7;
}
