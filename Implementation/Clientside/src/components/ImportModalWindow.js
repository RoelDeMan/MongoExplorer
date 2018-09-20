import React from 'react';
import * as ReactRedux from 'react-redux';
import { closeImportModalAction, getPageAction, importDataAction } from '../actions';
import { Modal, Icon } from 'antd';
import Dropzone from 'react-dropzone';
import {Notification} from './NotificationComponent'

class ImportModalWindowUI extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            uploadedFiles: []
        }
    }

    /**
     * Prevent event e and close the modal
     *
     * @param e {Object}
     */
    handleCancel(e) {
        e.preventDefault();
        this.props.closeModal();
    };

    /**
     * Is called when a file is dropped within the dropzone.
     * This function checks if the file is json and does not contain anything else but text data.
     * @param acceptedFiles
     */
    onDrop (acceptedFiles) {
        let newUploadedFiles = this.state.uploadedFiles.slice();
        acceptedFiles.forEach(file => {
            if (file && file.name.split('.').pop().toLowerCase() == 'json') {
                newUploadedFiles.push({file: file, status: 'added'});
            } else Notification("error", "File error", `File '${file.name}' removed because it is not viable json`, 10);
        });
        this.setState({
            uploadedFiles: newUploadedFiles
        });
    }

    /**
     * Sends the data within the file to the server which will try to add it to the selected collection.
     */
    handleImport () {
        const index = this.props.panes.findIndex(pane => this.props.paneInfo.key == pane.key);
        const address = this.props.panes[index].address;
        const data = [];
        this.state.uploadedFiles.forEach((file) => {
            data.push(
                new Promise((resolve) => {
                    const fileReader = new FileReader();
                    fileReader.onload = () => resolve(fileReader.result);
                    fileReader.readAsText(file.file);
                })
            )
        });

        Promise.all(data).then(fileData => {
            const dataToImportLength = data.length - 1;

            fileData.forEach((data, newIndex) => {
                data = data.replace(/(\r\n|\n|\r)/gm,"");

                let newFileStatuses = this.state.uploadedFiles.slice();
                let updatedFile = newFileStatuses[newIndex];
                updatedFile.status = 'pending';

                newFileStatuses.splice(newIndex, 1, updatedFile);

                this.setState({
                    uploadedFiles: newFileStatuses
                });

              
                const callback = function (result) {
                    if (result == 'error') {
                        updatedFile.status = 'error';
                        newFileStatuses.splice(newIndex, 1, updatedFile);
                    } else if (result == 'completed') {
                        updatedFile.status = 'completed';
                        newFileStatuses.splice(newIndex, 1, updatedFile);
                    }

                    newFileStatuses.forEach((file, index) => {
                        if (file.status = 'completed')
                            newFileStatuses.splice(index, 1)
                    });

                    this.setState({
                        uploadedFiles: newFileStatuses
                    });

                    if (dataToImportLength == newIndex) {
                        const paginationInfo = this.props.panes[index].paginationInfo;
                        this.props.getPage(address[0], address[1], address[2], paginationInfo.currentPage, paginationInfo.pageSize, this.props.paneInfo.view, this.props.paneInfo.key, true, this.props.paneInfo.query)
                    }
                }.bind(this);

                this.props.importData(address[0], address[1], address[2], data, callback);
            })
        });
    }

    /**
     * Is called when the delete button is clicked.
     * Deletes the selected file form the file-array.
     * @param index
     */
    deleteFileFromArray (index) {
        let newUploadedFiles = this.state.uploadedFiles.slice();
        newUploadedFiles.splice(index, 1);

        this.setState({
            uploadedFiles: newUploadedFiles
        });
    }

    /**
     * Renders the component
     * @returns {XML}
     */
    render() {
        return (
            <div>
                <Modal
                    title="Import JSON"
                    visible={this.props.showModal}
                    confirmLoading={this.props.importing}
                    onCancel={this.handleCancel.bind(this)}
                    onOk={this.handleImport.bind(this)}
                >

                    <Dropzone
                        className='file-dropzone'
                        activeClassName='active-file-dropzone'
                        onDrop={this.onDrop.bind(this)}
                        multiple={true}
                    >
                        <div className="text-center">Click to upload or drop your JSON files here</div>
                    </Dropzone>

                    {this.state.uploadedFiles.map((file, index) => {
                        let icon;

                        if (file.status == 'added') {
                            icon = <Icon className="pull-right" type="close" onClick={() => this.deleteFileFromArray(index)}/>;
                        } else if (file.status == 'pending') {
                            icon = <Icon className="pull-right" type="loading"/>;
                        } else if (file.status == 'completed') {
                            icon = (
                                <div className="pull-right">
                                    <Icon type="check"/>
                                    <Icon type="close" onClick={() => this.deleteFileFromArray(index)}/>
                                </div>);
                        } else if (file.status == 'error') {
                            icon = (
                                <div className="pull-right">
                                    <Icon type="close-circle-o"/>
                                    <Icon type="close" onClick={() => this.deleteFileFromArray(index)}/>
                                </div>);
                        }

                        return (
                            <div key={index} className="h5">
                                {file.file.name}
                                {icon}
                            </div>)
                        })
                    }
                </Modal>
            </div>
        );
    }
}

/**
 * Maps the state  from the state to props of the component
 * @param state
 * @returns {{showModal: (showImportModal|{$set}|boolean), importing: (*|boolean|importing|{$set}), panes: (*|panes|{$splice}|{}|{$push}|Array), paginationInfo: (*|paginationInfo|{totalDocsInCollection, pageSize, currentPage}|$merge.paginationInfo), settings: (currentSettings|{defaultView, defaultPageSize, theme, showEmptyArr, showEmptyObj, showBreadcrumbs}|*|settingsInitialState.currentSettings)}}
 */
function mapStateToProps(state) {
    return {
        showModal: state.modal.showImportModal,
        importing: state.modal.importing,
        panes: state.tabs.panes,
        paginationInfo: state.tabs.paginationInfo,
        settings: state.settings.currentSettings,
    }
}

/**
 * Maps the action callers to props of the component
 * @param dispatch
 * @returns {{closeModal: (function(): *), importData: (function(*=, *=, *=, *=, *=): *), getPage: (function(*=, *=, *=, *=, *=, *=, *=, *=, *=, *=): *)}}
 */
function mapDispatchToProps(dispatch) {
    return {
        closeModal: () => dispatch(closeImportModalAction()),
        importData: (address, database, collection, data, cb) => dispatch(importDataAction(address, database, collection, data, cb)),
        getPage: (address, database, collection, page, pageSize, defaultView, target, refresh, query) => dispatch(getPageAction(address, database, collection, page, pageSize, defaultView, target, refresh, query))
    }
}
export const ImportModalWindow = ReactRedux.connect(mapStateToProps, mapDispatchToProps)(ImportModalWindowUI);