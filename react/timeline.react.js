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

const Swimlane = props => (
	<div className="swimlane">
		<h2>{this.props.config.title}</h2>
	</div>
);

const SwimlaneList = props -> (
	<div className="swimlaneList">
		{props.config.map(swimlane =>  <Swimlane config={swimlane} key={swimlane.title}/>)}
	</div>
);

const Timeline = props => (
	<div className="timeline">
		<h1>{this.props.config.title}</h1>
		<SwimlaneList config={this.props.config.swimlanes} />
	</div>
);

getJSON('timeline.json', function(data) {
	ReactDOM.render(
		<Timeline config={data} />, document.getElementById('content')
	);
});
	
