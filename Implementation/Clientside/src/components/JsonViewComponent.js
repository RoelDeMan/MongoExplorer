import React from 'react';
import * as ReactRedux from 'react-redux';
import 'react-json-pretty/JSONPretty.monikai.styl';
import { Modal, Icon } from 'antd';
import { closeJsonViewAction, updateDataAction } from '../actions';
import AceEditor from 'react-ace';
import { Button } from 'antd';
import {Notification} from './NotificationComponent'
import 'brace/mode/json';
import 'brace/theme/github';

class JsonViewUI extends React.Component {
    constructor(props) {
        super(props);

        let jsonData = this.props.jsonData;

        try {
            jsonData = JSON.stringify(JSON.parse(this.props.jsonData), undefined, 2);
        } catch (e) {

        }
        this.state = {
            jsonData: jsonData
        }
    }

    /**
     * Is called when cancel is clicked.
     * Closes the modal window.
     * @param e
     */
    handleCancel(e){
        e.preventDefault();
        this.props.closeJsonView();
    };

    /**
     * Is called when update is clicked.
     * Checks the edited lines for errors and sends it to the server to
     * update the collection, if no errors where given
     * @param e
     */
    handleUpdate(e) {
        e.preventDefault();
        try {
            // remove newlines
            const jsonData = this.state.jsonData.replace(/(\r\n|\n|\r)/gm,"");
            JSON.parse(jsonData).forEach((newDocument, i)=>{
                let oldDocument = JSON.parse(this.makeJson())[i]
                if(newDocument._id != oldDocument._id){
                    this.setState({jsonData: JSON.stringify(oldDocument, undefined, 2)});
                    throw("idError")
                }
            });
            const updateDocs = JSON.parse(jsonData);
            updateDocs.forEach((doc, i) => {
                const id = doc._id;
                if (id) {
                    const activeKey = this.props.activeKey;
                    const index = this.props.panes.findIndex(pane => pane.key == activeKey);
                    const tab = this.props.panes[index];
                    let lastUpdate = false;
                    console.log((i+1), updateDocs.length);
                    if((i+1) === updateDocs.length) lastUpdate = true;
                    this.props.updateData(this.props.activeBreadcrumb[0], this.props.activeBreadcrumb[1], this.props.activeBreadcrumb[2], id, JSON.stringify(doc), tab.paginationInfo.currentPage, tab.paginationInfo.pageSize, activeKey, tab.view, tab.query, lastUpdate);
                }
                else Notification("warning", "_id missing", "An document must always have an _id, you can not leave it empty or removed", 10);
            });
        } catch(e) {
            if(e == "idError") Notification("warning", "_id edited", 'It is prohibited to edit the _id of a document.', 10);
            else Notification("warning", "Invalid input", 'Your edited text is not in viable JSON format.', 10);
        }
    }
    makeJson() {
        if(this.props.jsonData != 0) {
            let dirtyJsonData = JSON.parse(this.props.jsonData);
            dirtyJsonData.forEach((document, index)=> {
                if (document._id.includes('ObjectID')) {
                    dirtyJsonData[index]._id = document._id.split('(')[1].split(')')[0];
                }
            });
            return JSON.stringify(dirtyJsonData, undefined, 2);
        }
    }

    /**
     * Renders the component
     * @returns {XML}
     */
    render() {

        return (
            <div className="Json_Modal_Window">
                <Modal
                    id="JSON_Modal"
                    title="JSON View"
                    visible={this.props.showModal}
                    onCancel={this.handleCancel.bind(this)}
                    width={720}
                    okText='Ok'
                    footer={<div>
                        <Button size='large' onClick={this.handleCancel.bind(this)}>Cancel</Button>
                        <Button size='large' type='primary' onClick={this.handleUpdate.bind(this)}> <Icon type="save" />Update</Button>
                    </div>}
                >
                    <AceEditor
                        mode="json"
                        theme="github"
                        name="jsonViewComponent"
                        editorProps={{$blockScrolling: true}}
                        value={this.makeJson()}
                        onChange={(newValue) => this.state.jsonData = newValue}
                        width='100%'
                    />
                </Modal>
            </div>
        )
    }
}
/**
 * Maps the state  from the state to props of the component
 * @param state
 * @returns {{showModal: (*|showModal|{$set}|boolean), jsonData: (*|number|jsonData|{$set}), loading: (boolean|updating|{$set}), activeBreadcrumb: (*|activeBreadcrumb|{$set}|Array), panes: (*|panes|{$splice}|{}|{$push}|Array), activeKey: *, defaultView: (currentSettings.defaultView|{$set}|string)}}
 */
function mapStateToProps(state) {
    return {
        showModal: state.jsonView.showModal,
        jsonData: state.jsonView.jsonData,
        loading: state.jsonView.updating,
        activeBreadcrumb: state.tabs.activeBreadcrumb,
        panes: state.tabs.panes,
        activeKey: state.tabs.activeKey,
        defaultView: state.settings.currentSettings.defaultView
    }
}

/**
 * Maps the action callers to props of the component
 * @param dispatch
 * @returns {{closeJsonView: (function(): *), updateData: (function(*=, *=, *=, *=, *=, *=, *=, *=, *=, *=, *=): *)}}
 */
function mapDispatchToProps(dispatch) {
    return {
        closeJsonView: ()=> dispatch(closeJsonViewAction()),
        updateData: (address, database, collection, id, data, page, pageSize, target, defaultView, query, lastUpdate) => dispatch(updateDataAction(address, database, collection, id, data, page, pageSize, target, defaultView, query, lastUpdate)),
    }
}

export const JsonViewComponent = ReactRedux.connect(mapStateToProps, mapDispatchToProps)(JsonViewUI);
