import React, { Component } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

export class LogPanel extends Component {
	state = {
		logs: ["Clearing logs"]
	};

	componentWillReceiveProps(nextProps) {
		this.setState({
			logs: nextProps.logs.map(l => (
				<p className={"log-" + l.level}>
					{typeof l.message === "object"
						? JSON.stringify(l.message)
						: l.message}
				</p>
			))
		});
		console.log(this.state.logs);
	}

	render() {
		return (
			<div className="log">
				<h3 className="title">
					<FontAwesomeIcon icon="terminal" />
					&nbsp; Logs
				</h3>
				<div
					style={{
						backgroundColor: "black",
						fontFamily: "Ubuntu",
						color: "white",
						height: "150px",
						fontWeight: "bold",
						overflowX: "scroll",
						fontSize: 12
					}}
				>
					<div style={{ margin: 10, marginBottom: 0 }}>{this.state.logs}</div>
				</div>
			</div>
		);
	}
}
