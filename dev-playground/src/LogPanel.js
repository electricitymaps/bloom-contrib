import React, { Component } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

export class LogPanel extends Component {

    state = {
        logs: ["Clearing logs"]
    };

    constructor(props) {
        super(props)
    }

    componentWillReceiveProps(nextProps) {
        this.setState({
            logs: nextProps.logs
                .map(l => <p className={'log-' + l.level}>
                    {typeof l.message === 'object' ? JSON.stringify(l.message) : l.message}</p>)
        })
        console.log(this.state.logs)
    }

    render() {
        return <div className="panel panel-default log">
            <div className="panel-header">
                <h3 className="title"><FontAwesomeIcon icon="terminal" />
                    &nbsp;Execution Logs</h3>
            </div>
            <div className="panel-body">
                <div style={{
                    backgroundColor: 'black',
                    position: 'absolute', height: '67%', width: '95%',
                    fontFamily: 'Ubuntu', color: 'white', fontWeight: 'bold',
                    overflowX: 'scroll', fontSize: 12
                }}>
                    <div style={{ margin: 10, marginBottom: 0 }}>
                        {this.state.logs}
                    </div>
                </div>
            </div>
        </div>
    }
}