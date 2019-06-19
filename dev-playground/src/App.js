import React, { Component } from 'react';
import './App.css';
import MonacoEditor from 'react-monaco-editor';
import { Button } from 'react-bootstrap';
import Form from "react-bootstrap/Form";
import { evaluateCode } from "./RequestManager";
import Cookies from 'universal-cookie';
import io from "socket.io-client";
import uuidv1 from 'uuid/v1';
import { Documentation } from "./DocumentationPanel";
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { processActivities } from './ActivityProcessor';
import INITIAL_CODE from './Constants';
import { ExecutionResults } from './ExecutionResultsPanel';
import { IntegrationSelect } from './IntegrationSelectPanel';
import { library } from '@fortawesome/fontawesome-svg-core';
import {
	faCog, faPlus, faPlay, faQuestionCircle, faTree, faLock, faCodeBranch, faPoll,
	faTerminal
} from '@fortawesome/free-solid-svg-icons';
import { faGithub } from '@fortawesome/free-brands-svg-icons';
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { LogPanel } from './LogPanel';

library.add(faCog, faPlus, faPlay, faQuestionCircle, faTree, faLock, faCodeBranch, faPoll,
	faTerminal, faGithub);

const editorOptions = {
	selectOnLineNumbers: true,
	autoIndent: true,
	colorDecorators: true,
	copyWithSyntaxHighlighting: true,
	fontSize: 14
};

const cookies = new Cookies();

const id = cookies.get('id') !== undefined ? cookies.get('id') : uuidv1();

const NODE_PORT = 3001;

class App extends Component {
	state = {
		results: {},
		code: null,
		envRefList: [],
		username: "",
		password: "",
		stateInjection: {},
		integrations: null,
		logs: []
	};

	constructor(props) {
		super(props);
		if (cookies.get('id') === undefined) cookies.set('id', id);

		const setCode = (code) => this.setState({ code });
		this.setCode = setCode.bind(this);

		const setStateInjection = (stateInjection) => {
			this.setState({ stateInjection });
			console.log(stateInjection)
		}
		this.setStateInjection = setStateInjection.bind(this);

		this.interpretJS = this.interpretJS.bind(this);
		this.setupSocket();
	}

	//Used as MonacoEditor's size is not based on CSS, so render must be called in order
	//for the element to scale.
	resize = () => this.forceUpdate()

	componentDidMount() {
		window.addEventListener('resize', this.resize)
	}

	componentWillUnmount() {
		window.removeEventListener('resize', this.resize)
	}

	setupSocket() {
		const socket = io('http://' + window.location.hostname + ':' + NODE_PORT,
			{ query: 'name=' + id });
		socket.on('setIntegrations',
			(integrations) => this.setState({
				integrations: {
					all: integrations,
					selected: null
				}
			}));
		socket.on('openUrl',
			(url) => window.open(url));
		socket.on('setResults',
			(results) => {
				toast.success('Results Updated', { autoClose: 2000 });
				console.log(results)
				results.activities = processActivities(results.collect.activities);
				this.setState({ results, logs: (results.logs.length > 0) ? results.logs : [] });
			});
		socket.on('setCode',
			(code) => this.setState({ code: code !== null ? code : INITIAL_CODE }));
		socket.on('evaluation-error',
			(error) => {
				toast.error(Object.keys(error).length > 0 ? JSON.stringify(error) :
					'An Error occurred, but no error message could be retrieved')
			});
		socket.on('setLogs', (logs) => console.log(logs))
	}

	render() {
		return (
			<div>
				<div>
					<img style={{
						marginTop: '10px',
						flex: 1
					}} src="tmrow-light.png"
						alt="logo" />
					<h1 style={{ float: 'right', marginRight: '70%' }}>
						Developer Playground </h1>
				</div>
				{this.authForm()}
				{this.environmentPanel()}

				{this.state.integrations !== null &&
					<IntegrationSelect integrations={this.state.integrations.all}
						setCode={this.setCode} />}
				<ExecutionResults results={this.state.results}
					interpretJS={this.interpretJS}
					integrations={this.state.integrations}
					authDetails={{
						username: this.state.username,
						password: this.state.password
					}}
					setStateInjection={this.setStateInjection}
				/>
				<LogPanel logs={this.state.logs} />
				<Documentation />
				<ToastContainer style={{ width: '40%', fontSize: '25pt' }} />

				{this.state.code === null ? <h1>Fetching Code</h1> :
					<MonacoEditor
						height={window.innerHeight * 0.65}
						width={window.innerWidth * 0.6}
						language="javascript"
						theme="vs-light"
						value={this.state.code}
						options={editorOptions}
						onChange={v => this.setState({ code: v })}
					/>}
			</div>
		);
	}

	interpretJS() {
		this.setState({ results: {} });
		let previousRuns = cookies.get('previous-runs');

		if (cookies.get('code') !== undefined) {
			if (previousRuns === undefined) previousRuns = {};

			previousRuns['Run at: ' + new Date().toLocaleString()] = this.state.code;
			this.setState({ previousRuns });
		}

		let authDetails = {
			username: this.state.username,
			password: this.state.password
		};

		cookies.set('username', this.state.username);
		cookies.set('password', this.state.password);

		evaluateCode(this.state.code, authDetails, getEnvAsObject(this.state.envRefList),
			id, this.state.stateInjection);

		function getEnvAsObject(refs) {
			let obj = {};
			refs.forEach(r => obj[r.key.current.value] = r.value.current.value);
			return obj;
		}
	}

	//TODO move to component
	authForm() {
		return <div className="auth-input panel panel-default">
			<div className="panel-header">
				<h3 style={{ marginLeft: '10px' }}>
					<FontAwesomeIcon icon="lock" />&nbsp;Auth Input </h3>
			</div>
			<div className="panel-body">
				<Form style={{ fontSize: 14 }}>
					<Form.Group>
						<Form.Label>Username</Form.Label>
						<Form.Control placeholder="Username"
							onChange={(v) => this.setState({ username: v.target.value })} />
					</Form.Group>
					<Form.Group>
						<Form.Label>Password</Form.Label>
						<Form.Control type="password" placeholder="Password"
							onChange={(v) => this.setState({ password: v.target.value })} />
					</Form.Group>
				</Form>
			</div>
		</div>
	}

	environmentPanel() {
		return <div className="panel panel-default env-input" style={{ overflowY: 'scroll' }}>
			<div className="panel-header">
				<label className="title"><FontAwesomeIcon icon="tree" />&nbsp; Environment Variables &nbsp;
					<Button onClick={() => this.addEnvInput()} variant="secondary">
						<FontAwesomeIcon icon="plus" /></Button></label>
			</div>
			<div className="panel-body">
				{this.state.envRefList.map(e => <Form>
					<Form.Group className="col-xs-6">
						<Form.Control placeholder="Key" ref={e.key} />
					</Form.Group>

					<Form.Group className="col-xs-6">
						<Form.Control placeholder="Value" ref={e.value} />
					</Form.Group>
				</Form>)}
			</div>
		</div>
	}

	addEnvInput() {
		let envRefList = this.state.envRefList;
		envRefList.push({
			key: React.createRef(),
			value: React.createRef()
		});
		this.setState({ envRefList });
	}
}

export default App;