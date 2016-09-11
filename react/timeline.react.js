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

const Swimlane = ({swimlane}) => (
	<div className="swimlane">
		<h2>{swimlane.title}</h2>
	</div>
);

const SwimlaneList = ({swimlanes}) => (
	<div className="swimlaneList">
		{swimlanes.map(swimlane =>  <Swimlane swimlane={swimlane} key={swimlane.title}/>)}
	</div>
);

const Timeline = ({timeline}) => (
	<div className="timeline">
		<h1>{timeline.title}</h1>
		<SwimlaneList swimlanes={timeline.swimlanes} />
	</div>
);

getJSON('timeline.json', function(data) {
	ReactDOM.render(
		<Timeline timeline={data} />, document.getElementById('content')
	);
});
	
