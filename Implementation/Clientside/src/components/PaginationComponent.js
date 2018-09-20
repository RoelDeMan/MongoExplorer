import { Pagination, Input, Button } from 'antd';
import {Notification} from './NotificationComponent'
import React from 'react';
import * as ReactRedux from 'react-redux';
import { getPageAction } from '../actions';

class PaginationUI extends React.Component {
    /**
     * Get contents of page based on given pageNr
     *
     * @param pageNr {Number}
     */
    changePage(pageNr) {
        const index = this.props.panes.findIndex(pane => pane.key == this.props.paneInfo.key);
        const paginationInfo = this.props.panes[index].paginationInfo;
        this.props.getPage(this.props.activeBreadcrumb[0], this.props.activeBreadcrumb[1], this.props.activeBreadcrumb[2], pageNr, paginationInfo.pageSize, this.props.paneInfo.view, this.props.paneInfo.key, true, this.props.paneInfo.query);
    }

    /**
     * Prevent event e and set the number of documents in the page to value of pageSizeInput element
     *
     * @param e {Number}
     */
    changePageSize(e) {
        if(e) e.preventDefault();
        let sizeValue = Number(document.getElementById('inputForm'+this.props.paneInfo.key).value);
        if(sizeValue == "") Notification("warning", "No value", 'You must type in a value before pressing the update button.', 10);
        else if(sizeValue < 1) Notification("error", "Value error", 'The value can only consist numbers and can not be smaller than 1', 10);
        else this.props.getPage(this.props.activeBreadcrumb[0], this.props.activeBreadcrumb[1], this.props.activeBreadcrumb[2], 1, sizeValue, this.props.paneInfo.view, this.props.paneInfo.key, true, this.props.paneInfo.query);
    }

    /**
     * Renders the component.
     * @returns {XML}
     */
    render() {
        const index = this.props.panes.findIndex(pane => pane.key == this.props.paneInfo.key);
        const paginationInfo = this.props.panes[index].paginationInfo;

        return (
            <div id="paginationDiv">
                <Pagination
                    current={paginationInfo.currentPage}
                    pageSize={Number(paginationInfo.pageSize)}
                    total={paginationInfo.totalDocsInCollection}
                    onChange={this.changePage.bind(this)}
                    onShowSizeChange={this.changePageSize.bind(this)}
                />
                <form
                    onSubmit={this.changePageSize.bind(this)}
                    id="pageSizeForm"
                >
                    <Input
                        size="small"
                        type="number"
                        id={'inputForm'+this.props.paneInfo.key}
                        className="sizeValue"
                        placeholder={"Items: "+paginationInfo.pageSize}
                    />
                    <Button
                        onClick={this.changePageSize.bind(this)}
                        size="small"
                        type="ghost"
                        htmlType="submit"
                    >
                        Update
                    </Button>
                </form>
            </div>
        )
    }
}
/**
 * Maps the state  from the state to props of the component
 * @param state
 * @returns {{totalDocs: *, activeBreadcrumb: (*|activeBreadcrumb|{$set}|Array), connections: (*|Array|connections|{$push}|connectionReducer|{$splice}), connecting: (*|boolean), panes: (*|panes|{}|{$splice}|{$push}|Array), settings: (currentSettings|{defaultView, defaultPageSize, theme, showEmptyArr, showEmptyObj, showBreadcrumbs}|*|settingsInitialState.currentSettings)}}
 */
function mapStateToProps(state) {
    return {
        totalDocs: state.tabs.totalDocs,
        activeBreadcrumb: state.tabs.activeBreadcrumb,
        connections: state.connections.connections,
        connecting: state.modal.connecting,
        panes: state.tabs.panes,
        settings: state.settings.currentSettings
    }
}
/**
 * Maps the action callers to props of the component
 * @param dispatch
 * @returns {{getPage: (function(*=, *=, *=, *=, *=, *=, *=, *=, *=, *=): *)}}
 */
function mapDispatchToProps(dispatch) {
    return {
        getPage: (address, database, collection, page, pageSize, defaultView, target, refresh, query)=> dispatch(getPageAction(address, database, collection, page, pageSize, defaultView, target, refresh, query)),
    }
}
export const PaginationComponent = ReactRedux.connect(mapStateToProps, mapDispatchToProps)(PaginationUI);