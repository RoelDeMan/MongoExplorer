import React from 'react';
import * as ReactRedux from 'react-redux';
import { Modal, Select, Input} from 'antd';
import {Notification} from './NotificationComponent'
import { closeModalAction, connectToDatabaseAction } from '../actions';

class ConWindowUI extends React.Component {

    /**
     * Prevent event e
     * If address and port are not undefined, try to connect to address
     *
     * @param e {Object}
     */
    handleConnect(e) {
        if(e) e.preventDefault();
        let address = document.getElementById("addressInput").value;
        let port = document.getElementById("portInput").value;
        if (address != "" && port != "") {
            this.props.connectToDatabase(address, port);
        } else Notification("warning", "Oops!", "You can not leave a field empty!", 10);
    }

    /**
     * Prevent event e and close the modal
     *
     * @param e {Object}
     */
    handleCancel(e) {
        e.preventDefault();
        this.props.closeModal();
    }

    /**
     * Renders component
     * @returns {XML}
     */
    render() {
        return (
            <div className="conModal centerText">
                <Modal
                   title="Add connection"
                   visible={this.props.showModal}
                   onOk={this.handleConnect.bind(this)}
                   onCancel={this.handleCancel.bind(this)}
                >
                    <form
                        onSubmit={this.handleConnect.bind(this)}
                    >
                        <table>
                            <tbody>
                            <tr>
                                <td><label htmlFor="addressInput">Address:</label></td>
                                <td><Input size="small" type="text" id="addressInput" placeholder="Localhost"/></td>
                                <td><label htmlFor="portInput">Port:</label></td>
                                <td><Input size="small" type="text" id="portInput" placeholder="1234"/></td>
                                <td><input onClick={this.handleConnect.bind(this)} type="submit" style={{display: "none"}}/></td>
                            </tr>
                            </tbody>
                        </table>
                    </form>
                </Modal>
            </div>
        )
    }
}
/**
 * Maps the state  from the state to props of the component
 * @param state
 * @returns {{showModal: (*|boolean|showModal|{$set}), connecting: (*|boolean), conError: *}}
 */
function mapStateToProps(state) {
    return {
        showModal: state.modal.showModal,
        connecting: state.modal.connecting,
        conError: state.modal.conError
    }
}
/**
 * Maps the action callers to props of the component
 * @param dispatch
 * @returns {{closeModal: (function(*=): *), connectToDatabase: (function(*=, *=): *)}}
 */
function mapDispatchToProps(dispatch) {
    return {
        closeModal: (bool)=> dispatch(closeModalAction(bool)),
        connectToDatabase: (address, port)=> dispatch(connectToDatabaseAction(address, port)),
    }
}

export const ConWindow = ReactRedux.connect(mapStateToProps, mapDispatchToProps)(ConWindowUI);