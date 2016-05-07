var persian = ['۰', '۱', '۲',  '۳',  '۴',  '۵',  '۶',  '۷',  '۸', '۹'];
function convertDigit(number) {
	return persian[number];
}

function convert(number) {
	number = "" + number;
	var result = "";
	for (var i = 0; i < number.length; i++) {
		result = result + convertDigit(eval(number[i]));
	}
	return result;
}

$( document ).ready(function() {
	$.getJSON('data.json', function( data ) {
		$('#title').append($('<h1></h1>').text(data.title));
		var sprints = $('<table></table>').attr('cellspacing', 0);

		var colHeader = $('<colgroup></colgroup>');

		var months = data.season.months;
		var dayOfWeek = data.season.startsOnDayOfWeek;
		var weekend = data.season.weekend;

		colHeader.append($('<col/>'));
		for (var i=0; i<months.length; i++) {
			var month = months[i];
			for (var j=1; j<month.numOfDays+1; j++) {
				var col = $('<col/>').text(j);
				if (dayOfWeek % 7 == weekend || $.inArray(j, month.holidays) != -1) {
					col.addClass('offDay');
				}
				colHeader.append(col);

				dayOfWeek++;
			}
		}
		sprints.append(colHeader);

		var monthNames = $('<tr></tr>').addClass('monthNames');
		var days = $('<tr></tr>');

		monthNames.append($('<th></th>').text('ماه'));
		days.append($('<th></th>').text('روز'));

		for (var i=0; i<months.length; i++) {
			var month = months[i];
			monthNames.append($('<th></th>').text(month.name).attr('colspan', month.numOfDays));
			for (var j=1; j<=month.numOfDays; j++) {
				var day = $('<td></td>').text(convert(j));
				days.append(day);
			}
		}

		sprints.append(monthNames);
		sprints.append(days);

		for (var i=0; i<data.teams.length; i++) {
			var team = data.teams[i];

			var sprintRow = $('<tr></tr>');
			var nameCell = $('<td></td>').text(team.name);
			nameCell.attr('rowspan', Math.max(1, team.sprints.length));
			sprintRow.append(nameCell);
			//sprints.append(teamRow);

			for (var j=0; j<team.sprints.length; j++) {
				var planning = team.sprints[j].planning;
				var retrospective = team.sprints[j].retrospective;
				for (m = 0; m < months.length; m++) {
					monthId = months[m].id;
					for (day = 1; day <= months[m].numOfDays; day++) {
						var dayCol = $('<td></td>');
						
						if ((planning.monthId == monthId && planning.day <= day
														|| planning.monthId < monthId)
								&& (retrospective == "infinity"
												|| retrospective.monthId == monthId
																&& retrospective.day >= day
												|| retrospective.monthId > monthId))
						{
							dayCol.addClass('sprint');
							if (planning.monthId == monthId && planning.day == day) {
								dayCol.append($('<i></i>').addClass('fa fa-check-square-o'));
							}
							if (retrospective.monthId == monthId && retrospective.day == day) {
								dayCol.append($('<i></i>').addClass('fa fa-user-md'));
							}
						}
						sprintRow.append(dayCol);
					}
				}
				sprints.append(sprintRow);
				sprintRow = $('<tr></tr>');
			}
		}

		$('#sprints').append(sprints);
	});
});
