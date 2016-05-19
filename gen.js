var persianDigits = ['۰', '۱', '۲',  '۳',  '۴',  '۵',  '۶',  '۷',  '۸', '۹'];
var daysOfWeek = ['شنبه', 'یک‌شنبه', 'دوشنبه',  'سه‌شنبه',  'چهارشنبه',  'پنج‌شنبه',  'جمعه'];

$( document ).ready(function() {
	$.getJSON('data.json', function( data ) {

		addTitle(data.title);

		addSprints(data);

	});
});

function addTitle(title) {
	if (title != 'disabled') {
		$('#title').append($('<h1></h1>').text(title));
	}
}

function addSprints(data) {
	var sprints = $('<table></table>').attr('cellspacing', 0);

	appendHeadersToSprints(sprints, data.season);
	appendTeamsToSprints(sprints, data.teams, data.season.months);
	appendFootersToSprints(sprints, data.season);

	$('#sprints').append(sprints);
}

function appendHeadersToSprints(sprints, season) {
	sprints.append(createHeaderColumns(season.months, season.startsOnDayOfWeek, season.weekend));
	sprints.append(createMonthsHeader(season.months));
	sprints.append(createDaysHeader(season.months));
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

function appendMonthToColHeader(colHeader, monthId, numOfDays, firstDayOfWeek, weekend, holidays) {
	dayOfWeek = firstDayOfWeek;
	for (var dayOfMonth=1; dayOfMonth<=numOfDays; dayOfMonth++) {
		colHeader.append(createColumnForDay(monthId, dayOfMonth, dayOfWeek, weekend, holidays));
		dayOfWeek++;
		dayOfWeek %= 7;
	}
}

function createColumnForDay(monthId, dayOfMonth, dayOfWeek, weekend, holidays) {
	var col = $('<col/>').text(dayOfMonth);
	if (isWeekend(dayOfWeek, weekend) || isHolliday(dayOfMonth, holidays)) {
		col.addClass('offDay');
	}
	if (isToday(monthId, dayOfMonth)) {
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

function createDayHeader(monthId, dayOfMonth) {
	var day = $('<td></td>').text(convert(dayOfMonth)).addClass('vertical-text');
	if (monthId != 1 && dayOfMonth == 1) {
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

function appendTeamsToSprints(sprints, teams, months) {
	for (var i=0; i<teams.length; i++) {
		appendTeamSprints(sprints, teams[i], months);
	}
}

function appendTeamSprints(sprints, team, months) {

	for (var sprintId=0; sprintId<team.sprints.length; sprintId++) {
		sprints.append(createSprintRow(team, sprintId, months));
	}
}

function createSprintRow(team, sprintId, months) {
	var sprintRow = $('<tr></tr>');
	if (sprintId == 0) {
		sprintRow.append(createNameCell(team));
	}

	for (m = 0; m < months.length; m++) {
		appendMonthForSprint(sprintRow, months[m], team.sprints[sprintId], team.color);
	}
	return sprintRow;
}

function createNameCell(team) {
	var nameCell = $('<td></td>').text(team.name).addClass('vertical-text');
	nameCell.addClass('team-name');
	nameCell.attr('rowspan', Math.max(1, team.sprints.length));
	nameCell.attr('style', 'background-color: ' + team.color + ';');
	return nameCell;
}

function appendMonthForSprint(sprintRow, month, sprint, teamColor) {
	for (day = 1; day <= month.numOfDays; day++) {
		sprintRow.append(createDayCell(month.id, day, sprint.planning, sprint.retrospective, teamColor));
	}
}

function createDayCell(monthId, day, planning, retrospective, teamColor) {
	var dayCell = $('<td></td>');
	if (monthId != 1 && day == 1) {
		dayCell.addClass('monthSeparator');
	}
	
	if (isDayInSprint(monthId, day, planning, retrospective)) {
		dayCell.attr('style', 'background-color: ' + teamColor + ';');
		applyDayIcons(dayCell, monthId, day, planning, retrospective);
	}
	return dayCell;
}

function applyDayIcons(dayCell, monthId, day, planning, retrospective) {
	if (isPlanningDay(monthId, day, planning)) {
		dayCell.append($('<i></i>').addClass('fa fa-check-square-o'));
	}
	if (isRetrospectiveDay(monthId, day, retrospective)) {
		dayCell.append($('<i></i>').addClass('fa fa-user-md'));
	}
}

function isPlanningDay(monthId, day, planning) {
	return planning.monthId == monthId && planning.day == day;
}

function isRetrospectiveDay(monthId, day, retrospective) {
	return retrospective.monthId == monthId && retrospective.day == day;
}

function isDayInSprint(monthId, day, planning, retrospective) {
	if (planning.monthId == monthId && planning.day <= day || planning.monthId < monthId) {
		if (retrospective == "infinity") {
	   		return true;
		}
		return retrospective.monthId == monthId && retrospective.day >= day || retrospective.monthId > monthId;
	}
	return false;
}

function appendFootersToSprints(sprints, season) {
	sprints.append(createDaysOfWeekRow(season.months, season.startsOnDayOfWeek));
}

function createDaysOfWeekRow(months, startsOnDayOfWeek) {
	var daysOfWeek = $('<tr></tr>').append('<td></td>');

	var dayOfWeek = startsOnDayOfWeek;
	for (var i=0; i<months.length; i++) {
		var month = months[i];
		for (var j=1; j<month.numOfDays+1; j++) {
			daysOfWeek.append($('<td></td>').addClass('vertical-text dayOfWeek').text(daysOfWeek[dayOfWeek]));
			dayOfWeek = advanceDayOfWeek(dayOfWeek, 1);
		}
	}
	return daysOfWeek;
}

function advanceDayOfWeek(dayOfWeek, amount) {
	return (dayOfWeek + amount) % 7;
}
