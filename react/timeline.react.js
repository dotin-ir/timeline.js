function getJSON(url, fn) {
	var request = new XMLHttpRequest();
	request.open('GET', url, true);

	request.onload = function() {
		if (request.status >= 200 && request.status < 400) {
			var data = JSON.parse(request.responseText);
			console.log(data);
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

var Swimlane = React.createClass({
	render: function() {
		return (
			<div className="swimlane">
				<h2>{this.props.config.title}</h2>
			</div>
		);
	}
});

var SwimlaneList = React.createClass({
	render: function() {
		var swimlanes = this.props.config.map(function(swimlane) {
			return (
				<Swimlane config={swimlane} />
			);
		});
		return (
			<div className="swimlaneList">
				{swimlanes}
			</div>
		);
	}
});

var Timeline = React.createClass({
	render: function() {
		return (
			<div className="timeline">
				<h1>{this.props.config.title}</h1>
				<SwimlaneList config={this.props.config.swimlanes} />
			</div>
		);
	}
});

getJSON('timeline.json', function(data) {
	ReactDOM.render(
		<Timeline config={data} />, document.getElementById('content')
	);
});
	
