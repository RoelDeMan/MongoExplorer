import React from 'react';
import * as ReactRedux from 'react-redux';
import { Menu, Modal, Icon, Tooltip, Popover, Input, Button, Form } from 'antd';
import {Notification} from './NotificationComponent'
import { deleteDocumentsThunkAction, openJsonViewAction, openImportModalAction, changeTabViewAction, getPageAction } from '../actions';
import { saveAs } from 'file-saver'
const confirm = Modal.confirm;

class TabMenuUI extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            refineInput: this.props.paneInfo.query
        };
    }

    handleRefine(e) {
        /**
         * Refines the results based on the search query
         * Calls action with given query
         *
         * @param query {object} || {string}
         * @param e
         */
        if(e) e.preventDefault();
        this.props.getPage(
            this.props.paneInfo.address[0],
            this.props.paneInfo.address[1],
            this.props.paneInfo.address[2],
            1,
            this.props.paneInfo.paginationInfo.pageSize,
            this.props.settings.defaultView,
            this.props.paneInfo.key,
            true,
            this.state.refineInput);
    }
    openJsonModal(selected){
        /**
         * Opens JSON updateModal with selected Data
         * Selected data is pushed in array dataToShow
         *
         * @currentTab {object}
         * @index {number}
         * @type {number}
         */
        const index = this.props.panes.findIndex(pane => this.props.paneInfo.key == pane.key);
        const currentTab = this.props.panes[index];

        let dataToShow = [];
        let currentSelectedDocuments = [];

        selected.forEach(nodeKey => {
            if (nodeKey.includes('documentKey:')){
                currentSelectedDocuments.push(nodeKey.split(':')[1])
            }
        });

        currentTab.data.forEach(document => {
            // this only works if id of the document == ._id
            if (currentSelectedDocuments.indexOf(document._id) !== -1) {
                dataToShow.push(document);
            }
        });
        this.props.openJsonView(JSON.stringify(dataToShow));
    }

    handleExportDownload(currentTab) {
        /**
         * Gets the selected and half selected keys and pushes them in array keys
         *
         * @param keys
         * @type {Array}
         */
        let keys = [];

        if (currentTab.halfSelectedKeys) {
            keys = currentTab.selectedKeys.concat(currentTab.halfSelectedKeys);
        } else {
            keys = currentTab.selectedKeys;
        }

        if (!keys) Notification("warning", "selection", 'You need to select documents before being able to export.', 10);
        else {
            /**
             * pushes each selected key in array dataToExport based on it's param
             * @type {Array}
             */
            let dataToExport = [];
            let currentSelectedDocuments = [];
            keys.forEach(nodeKey => {
                if (nodeKey.includes('documentKey:')){

                    if (nodeKey.split(':')[2] == 'int') currentSelectedDocuments.push(Number(nodeKey.split(':')[1]));
                    else currentSelectedDocuments.push(nodeKey.split(':')[1]);
                }
            });
            currentTab.data.forEach(document => {
                // this only works if id of the document == ._id
                if (currentSelectedDocuments.indexOf(document._id) !== -1) {
                    let mirrorDocument = JSON.parse(JSON.stringify(document));
                    if(typeof mirrorDocument._id === "string" && mirrorDocument._id.includes('ObjectID(')) {
                        mirrorDocument._id = mirrorDocument._id.split('ObjectID(')[1].split(')')[0];
                    }
                    dataToExport.push(mirrorDocument);
                }
            });
            try {
                //makes a file from dataToExport
                const exportBlob = new Blob([JSON.stringify(dataToExport, undefined, 2)], {type: "text/plain;charset=utf-8"});
                saveAs(exportBlob, "export.json");
            } catch (e) {
                Notification("error", "Export error", 'Unable to export the file by unknown reasons', 10);
            }
        }
    }

    handleDelete(currentTab, props){
        /** Pushes the selectedKeys in an array and calls an action to delete them
         *  First it confirms if you really want to delete the items.
         *
         *  @param arrayIds {array} pushes the id's of the documents in this array
         */
        confirm({
            title: 'Are you sure you want to delete these items?',
            content: `The items will be deleted forever if you don't have a backup`,
            onOk() {
                if (!currentTab.selectedKeys) Notification("warning", "selection", 'You need to select documents before being able to delete.', 10);
                else {
                    let arrayIds = [];
                    /**
                     * loops through each selectedKey and gets the id and splits them
                     */
                    currentTab.selectedKeys.forEach(nodeKey => {
                        if (nodeKey.includes('documentKey:')) {
                            if (nodeKey.split(':')[2] == 'obj') {
                                arrayIds.push(nodeKey.split('documentKey:ObjectID(')[1].split(')')[0]);
                            } else if(nodeKey.split(':')[2] == "int") {
                                arrayIds.push(Number(nodeKey.split(':')[1]));
                            } else {
                                arrayIds.push(nodeKey.split(':')[1]);
                            }
                        }
                    });
                    props.deleteDocuments(props.activeBreadcrumb[0], props.activeBreadcrumb[1], props.activeBreadcrumb[2], arrayIds, 20, props.paneInfo.key, props.paneInfo.view, props.paneInfo.query);
                }
            },
            onCancel(){
            }
        });
    }

    /**
     * Depending on what item in the menu got clicked, do one of the following:
     * - request available API's
     * - get first page of chosen collection
     * - set the view
     * - export/import data
     *
     * @param e {Object}
     */
    handleMenuClick(e) {
        switch(e.keyPath[0]) {
            case 'view':
                this.props.changeTabView(this.props.paneInfo.key);
                break;
            case 'export':
                if(this.props.paneInfo.selectedKeys.length == 0) Notification("warning", "selection", 'You need to select documents before being able to export.', 10);
                else this.handleExportDownload(this.props.paneInfo);
                break;
            case 'delete':
                if(this.props.paneInfo.selectedKeys.length == 0) Notification("warning", "selection", 'You need to select documents before being able to delete.', 10);
                else this.handleDelete(this.props.paneInfo, this.props);
                break;
            case 'edit':
                if(this.props.paneInfo.selectedKeys.length == 0) Notification("warning", "selection", 'You need to select documents before being able to edit.', 10);
                else this.openJsonModal(this.props.paneInfo.selectedKeys.concat(this.props.paneInfo.halfSelectedKeys));
                break;
            case 'import':
                this.props.openImportModal();
                break;
        }
    }

    /**
     * Renders the menu items
     * @returns {XML}
     */
    render() {
        return (
            <Menu
                mode="inline"
                onClick={this.handleMenuClick.bind(this)}
                style={{ width: "auto", backgroundColor: "#", float: "left" }}
            >

                <Menu.Item key="edit" >
                    <Tooltip placement="right" title={"Edit selected rows"}>
                        <Icon type="edit" />
                    </Tooltip>
                </Menu.Item>
                <Menu.Item key="delete" >
                    <Tooltip placement="right" title={"Delete selected rows"}>
                        <Icon type="delete" />
                    </Tooltip>
                </Menu.Item>
                <Menu.Item key="export" >
                    <Tooltip placement="right" title={"Download JSON"}>
                        <Icon type="download" />
                    </Tooltip>
                </Menu.Item>
                <Menu.Item key="import" >
                    <Tooltip placement="right" title={"Import JSON"}>
                        <Icon type="upload" />
                    </Tooltip>
                </Menu.Item>
                <Menu.Item key="view" >
                    <Tooltip placement="right" title={"Change view"}>
                        <Icon type="bars" />
                    </Tooltip>
                </Menu.Item>
                <Menu.Item key="find" >
                    <Popover placement="bottomLeft"
                             title="Refine your results"
                             content={
                                 <Form
                                     inline
                                     onSubmit={this.handleRefine.bind(this)}
                                 >
                                     <Form.Item>
                                         <Input
                                             id={"refineInput"+this.props.paneInfo.key}
                                             addonBefore={"db.getCollection('"+this.props.paneInfo.address[2]+"').find("}
                                             addonAfter=")"
                                             value={this.state.refineInput}
                                             onChange={()=>{this.setState({refineInput: document.getElementById("refineInput"+this.props.paneInfo.key).value})}}
                                         />
                                     </Form.Item>
                                     <Form.Item>
                                         <Button size="small"
                                                 type="primary"
                                                 htmlType="submit"
                                                 shape="circle"
                                                 onClick={this.handleRefine.bind(this)}
                                         >
                                             <Icon type="logout" />
                                         </Button>
                                     </Form.Item>
                                 </Form>}
                             trigger="click">
                        <Tooltip placement="right" title={"Refine your results"}>
                            <Icon type="filter" />
                        </Tooltip>
                    </Popover>
                </Menu.Item>
            </Menu>
        )
    }
}

function mapStateToProps(state) {
    return {
        panes: state.tabs.panes,
        activeBreadcrumb: state.tabs.activeBreadcrumb,
        settings: state.settings.currentSettings
    }
}

function mapDispatchToProps(dispatch) {
    return {
        deleteDocuments: ( address, database, collection, arrayIds, pageSize, target, defaultView, query) => dispatch(deleteDocumentsThunkAction(address, database, collection, arrayIds, pageSize, target, defaultView, query)),
        openJsonView: (selected)=> dispatch(openJsonViewAction(selected)),
        openImportModal: () => dispatch(openImportModalAction()),
        changeTabView: (target) => dispatch(changeTabViewAction(target)),
        getPage: (address, database, collection, page, pageSize, defaultView, target, refresh, query) => dispatch(getPageAction(address, database, collection, page, pageSize, defaultView, target, refresh, query))
    }
}

export const TabMenuComponent = ReactRedux.connect(mapStateToProps, mapDispatchToProps)(TabMenuUI);
