import React, { Component } from "react";
import { Modal, Button, Dropdown } from "react-bootstrap";
import INITIAL_CODE from "./Constants";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

export class IntegrationSelect extends Component {
	constructor(props) {
		super(props);
		this.setCode = props.setCode;
		this.state = {
			integrations: {
				all: props.integrations.all,
				selected: null
			},
			showIntegrationModal: false,
			showDocsModal: false
		};
	}

	render() {
		return (
			<div
				style={{
					backgroundColor: "#1e1e1e",
					padding: 10,
					color: "white"
				}}
			>
				{this.viewIntegrationModal()}
				{this.viewDocsModal()}
				<div className="col-xs-4">
					<h4>
						<FontAwesomeIcon icon="code-branch" />
						&nbsp;Integrations{" "}
					</h4>
				</div>
				<div className="col-xs-2">
					<Dropdown>
						<Dropdown.Toggle variant="secondary">Load</Dropdown.Toggle>

						<Dropdown.Menu>
							{Object.keys(this.state.integrations.all).map(selected => (
								<Dropdown.Item
									onClick={() =>
										this.setCode(this.state.integrations.all[selected])
									}
								>
									{selected}
								</Dropdown.Item>
							))}
						</Dropdown.Menu>
					</Dropdown>
				</div>
				<div className="col-xs-2">
					<Dropdown>
						<Dropdown.Toggle variant="secondary">View</Dropdown.Toggle>

						<Dropdown.Menu>
							{Object.keys(this.state.integrations.all).map(i => (
								<Dropdown.Item
									onClick={() => {
										let integrations = this.state.integrations;
										integrations.selected = i;
										this.setState({
											integrations,
											showIntegrationModal: true
										});
									}}
								>
									{i}
								</Dropdown.Item>
							))}
						</Dropdown.Menu>
					</Dropdown>
				</div>
				<div className="col-xs-2">
					<Button
						variant="secondary"
						onClick={() => this.setCode(INITIAL_CODE)}
					>
						Reset
					</Button>
				</div>

				<Button
					variant="secondary"
					onClick={() => this.setState({ showDocsModal: true })}
				>
					Docs
				</Button>
			</div>
		);
	}

	viewIntegrationModal() {
		return (
			<Modal animation={false} show={this.state.showIntegrationModal} size="lg">
				<Modal.Header>
					<Modal.Title>Code for {this.state.integrations.selected}</Modal.Title>
				</Modal.Header>
				<Modal.Body>
					<pre>
						<code>
							{this.state.integrations.all[this.state.integrations.selected]}
						</code>
					</pre>
				</Modal.Body>
				<Modal.Footer>
					<Button
						variant="secondary"
						onClick={() => this.setState({ showIntegrationModal: false })}
					>
						{" "}
						Close{" "}
					</Button>
				</Modal.Footer>
			</Modal>
		);
	}

	viewDocsModal() {
		return (
			<Modal animation={false} show={this.state.showDocsModal} size="lg">
				<Modal.Header>
					<Modal.Title>Using the Playground</Modal.Title>
				</Modal.Header>
				<Modal.Body>
					<div>
						<label>How to Code an Integration?</label>
						<p>
							Checkout the readme to understand how an integration works and how
							you can get started
						</p>
						<Button
							variant="secondary"
							onClick={() =>
								window.open("https://github.com/tmrowco/tmrowapp-contrib")
							}
						>
							<FontAwesomeIcon icon={["fab", "github"]} size="lg" />{" "}
						</Button>
						<br />
						<label>Playground Basics</label>
						<p>
							Either paste or write your code in the above editor, your code
							must implement the methods <code>connect</code>,{" "}
							<code>collect</code> and <code>disconnect</code> (note that the{" "}
							<code>state</code> passed into collect is the outcome of the
							connect method. Additionally you will need to implement an object
							called <code>config</code>. If you do not see these already hit
							the Reset button. When you're ready hit the run button and wait
							for results to come back. It it recommended you browse some
							currently working integrations (using the drop down) before
							writing your own.
						</p>
						<label>Logging</label>
						<p>
							In order to log to the Execution logs panel seen in the bottom
							left you'll need to add this import
							<code>import logger from '../../Logger'</code>. You can then use{" "}
							<code>logger.log('level', 'message')</code>
							to log your code. Levels are{" "}
							<b className="log-demo log-info">info</b>,
							<b className="log-demo log-debug">debug</b>,{" "}
							<b className="log-demo log-warning">warning</b>
							and <b className="log-demo log-error">error</b>. You can also
							parse objects into here and they'll be stringified
						</p>
						<label>Importing Externally</label>
						<p>
							We have a number of libraries pre-installed and you can import
							them as normal. Some of these libraries include:{" "}
							<code>superagent</code>,<code>node-fetch</code> and{" "}
							<code>flatten</code>. Please let us know if you require additional
							libraries and we'll look into adding them if the demand is high
							enough.
						</p>
						<label>Importing from the Project</label>
						<p>
							In order to import type enums for configs please use the following
							code
							<code>`import {"{CHOSEN_TYPE}"} from './definitions';`</code> a
							list of types can be found{" "}
							<Button
								variant="secondary"
								onClick={() => this.setState({ showTypesModal: true })}
							>
								here
							</Button>
						</p>
						<p>
							In order to import environment variables you've added on the
							Environment variable panel use{" "}
							<code> import env from './env'</code> and access items with{" "}
							<code>env.key</code>
						</p>
						<label>OAuth</label>
						<p>
							In order to use OAuth you must use the following code{" "}
							<code>
								import {"{OAuthManager}"}
								from '../integrations/utils/oauth';
							</code>{" "}
							and initialise appropriately.
						</p>
					</div>
					{this.viewTypesModal()}
				</Modal.Body>
				<Modal.Footer>
					<Button
						variant="secondary"
						onClick={() => this.setState({ showDocsModal: false })}
					>
						{" "}
						Close{" "}
					</Button>
				</Modal.Footer>
			</Modal>
		);
	}

	viewTypesModal() {
		return (
			<Modal animation={false} show={this.state.showTypesModal} size="lg">
				<Modal.Header closeButton>
					<Modal.Title>
						<h1>Type Definitions</h1>
					</Modal.Title>
				</Modal.Header>
				<Modal.Body>
					<pre style={{ fontSize: 30 }}>
						<code>
							ACTIVITY_TYPE_ELECTRICITY,
							ACTIVITY_TYPE_ELECTRIC_VEHICLE_CHARGING,
							ACTIVITY_TYPE_TRANSPORTATION, ACTIVITY_TYPE_MEAL,
							TRANSPORTATION_MODE_PLANE, TRANSPORTATION_MODE_CAR,
							TRANSPORTATION_MODE_BUS, TRANSPORTATION_MODE_PUBLIC_TRANSPORT,
							TRANSPORTATION_MODE_TRAIN, TRANSPORTATION_MODE_FERRY
						</code>
					</pre>
				</Modal.Body>
				<Modal.Footer>
					<Button onClick={() => this.setState({ showTypesModal: false })}>
						{" "}
						Close{" "}
					</Button>
				</Modal.Footer>
			</Modal>
		);
	}
}
