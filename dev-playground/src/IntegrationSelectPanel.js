import React, { Component } from "react";
import { Modal, Button, Dropdown } from "react-bootstrap";
import App from "./App";
import INITIAL_CODE from './Constants';
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";


export class IntegrationSelect extends Component {

    constructor(props) {
        super(props);
        this.setCode = props.setCode;
        this.state = {
            integrations: {
                all: props.integrations,
                selected: null
            },
            showIntegrationModal: false
        };
    }

    render() {
        return <div>
            {this.viewIntegrationModal()}
            <div className="panel panel-default integrations">
                <div className="panel-header"><label className="title">
                    <FontAwesomeIcon icon="code-branch" />&nbsp;Integrations</label>
                    <Dropdown style={{ float: "right" }}>
                        <Dropdown.Toggle variant="secondary">Select</Dropdown.Toggle>

                        <Dropdown.Menu>
                            {Object.keys(this.state.integrations.all).map(i => <Dropdown.Item
                                onClick={() => {
                                    let integrations = this.state.integrations;
                                    integrations.selected = i;
                                    this.setState({ integrations })
                                }}>{i}</Dropdown.Item>)}
                        </Dropdown.Menu>
                    </Dropdown>
                </div>
                <div className="panel-body">

                    Currently selected: <div style={{ color: 'red', fontWeight: 'bold' }}>
                        {this.state.integrations.selected ? this.state.integrations.selected : "None"}
                    </div>

                    <Button variant="secondary"
                        onClick={() =>
                            this.setCode(this.state.integrations.all[this.state.integrations.selected])}>
                        Load </Button> &nbsp;
                    <Button variant="secondary"
                        onClick={() => this.setState({ showIntegrationModal: true })}> View </Button>
                    &nbsp;
                    <Button variant="secondary"
                        onClick={() => {
                            console.log(App)
                            this.setCode(INITIAL_CODE)
                        }}>Reset </Button>
                    {/* <Button variant="secondary"
                        onClick={() => window.open('https://github.com/tmrowco/tmrowapp-contrib')}>
                        <FontAwesomeIcon icon={["fab", "github"]} size="lg" /> </Button> */}
                </div>
            </div>
        </div>
    }

    viewIntegrationModal() {
        return (<Modal animation={false} show={this.state.showIntegrationModal} size="lg">
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
                <Button onClick={() => this.setState({ showIntegrationModal: false })}> Close </Button>
            </Modal.Footer>
        </Modal>)
    }
}