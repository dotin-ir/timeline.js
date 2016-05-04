$( document ).ready(function() {
	$.getJSON('data.json', function( data ) {
		$('#title').append($('<h1></h1>').text(data.title));
		var sprints = $('<table></table>');

		var monthNames = $('<tr></tr>');
		var days = $('<tr></tr>');

		monthNames.append($('<th></th>').text('ماه'));
		days.append($('<th></th>').text('روز'));

		var months = data.season.months;
		var dayOfWeek = data.season.startsOnDayOfWeek;
		var weekend = data.season.weekend;

		for (var i=0, m=months.length; i < m; i++) {
			var month = months[i];
			monthNames.append($('<th></th>').text(month.name).attr('colspan', month.numOfDays));
			for (var j=1, d=month.numOfDays+1; j<d; j++) {
				var day = $('<td></td>').text(j);
				if (dayOfWeek % 7 == weekend || $.inArray(j, month.holidays) != -1) {
					day.addClass('offDay');
				}
				days.append(day);

				dayOfWeek++;
			}
		}

		sprints.append(monthNames);
		sprints.append(days);

		for (var i=0, t=data.teams.length; i<t; i++) {
			var team = data.teams[i];

			var nameCell = $('<td></td>').text(team.name);

			var teamRow = $('<tr></tr>');
			teamRow.append(nameCell);

			sprints.append(teamRow);
		}

		$('#sprints').append(sprints);
	});
});
