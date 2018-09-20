import React from 'react';
import * as ReactRedux from 'react-redux'
import {setNewFinderPaneAction, selectNodeAction} from '../actions'
import { ArrowIcon, ArrayIcon, DocumentIcon, IdIcon, StringIcon, NumberIcon, BooleanIcon, DateIcon, ObjectIcon, NullIcon } from './Logos-Icons';
import type from 'type-of';
import { Tree } from 'antd';
const TreeNode = Tree.TreeNode;

class FinderUI extends React.Component {
    /**
     * Saves the checked nodes in the store
     * @param checkedNodes
     * @param halfCheck
     */
    selectNodes(checkedNodes, halfCheck) {
        this.props.selectNode(this.props.tabKey, checkedNodes, halfCheck)
    }

    /**
     * Replaces the string if a value is the top first of the json tree, else return the given index
     * @param top
     * @param value
     * @param index
     * @returns {*}
     */
    setKey(top, value, index) {
        if(top) {
            if(typeof value == 'number') return `documentKey:${value}:int`;
            else if (value.split('(')[0] === 'ObjectID') return `documentKey:${value}:obj`;
            else return `documentKey:${value}:str`;
        }
        else return index;
    }

    /**
     * When an array is selected, this will save a new panel to the store
     * @param value
     * @param index
     */
    openArray(value, index) {
        if (type(value) === 'object' || type(value) === 'array') {
            this.props.setNewFinderPane(this.props.tabKey, value, index);
        }
    }

    /**
     * Draws a new panel when clicked on an object or array
     * @param pane
     * @param index
     * @param keys
     * @returns {XML}
     */
    drawPane(pane, index, keys) {
        let columnSize = 12/this.props.finderPanes.length;
        if (columnSize < 3) columnSize = 3;

        let paneContent = [];

        if (type(pane) === 'object') {
            Object.keys(pane).forEach(key => {
                if (type(pane[key]) === 'object') {
                    if (Object.keys(pane[key]).length > 0 || Object.keys(pane[key]).length === 0 && this.props.settings.showEmptyObj)
                        paneContent.push(this.drawNode(key, pane[key], () => this.openArray(pane[key], index, index === 0)))
                }
                else if (type(pane[key]) === 'array') {
                    if (pane[key].length > 0 || pane[key].length === 0 && this.props.settings.showEmptyArr)
                        paneContent.push(this.drawNode(key, pane[key], () => this.openArray(pane[key], index, index === 0)));
                }
                else {
                    paneContent.push(this.drawNode(key, pane[key], undefined, index === 0));
                }
            });
        } else if (type(pane) === 'array'){
            pane.forEach((value, newIndex) => {
                if (type(value) === 'object') {
                    if (Object.keys(value).length > 0 || Object.keys(value).length === 0 && this.props.settings.showEmptyObj)
                        paneContent.push(this.drawNode(newIndex, value, () => this.openArray(value, index), index === 0));
                }
                else if (type(value) === 'array') {
                    if (value.length > 0 || value.length === 0 && this.props.settings.showEmptyArr)
                        paneContent.push(this.drawNode(newIndex, value, () => this.openArray(value, index), index === 0));
                }
                else {
                    paneContent.push(this.drawNode(newIndex, value, undefined, index === 0));
                }
            });
        }

        return (
            <div className={"outerCol col-xs-" + columnSize} key={index}>
                <div className={"col-xs-12"} id={"finderColumn" + index}>
                    <Tree
                        checkable={(index === 0 && paneContent.length)}
                        onCheck={(checkedKeys, event) => this.selectNodes(checkedKeys, event.halfCheckedKeys)}
                        defaultCheckedKeys={keys}
                        defaultExpandedKeys={['selectAllKey']}
                    >
                        {index === 0 ? (
                            <TreeNode
                                title={<span className="branchKey">{paneContent.length ? 'Select all' : 'Nothing found'}</span>}
                                key={paneContent.length ? 'selectAllKey' : 'nothingFoundKey'}
                            >
                                {paneContent}
                            </TreeNode>) :
                            paneContent}
                    </Tree>
                </div>
            </div>);

    }

    /**
     * This draws a row within the newly drawn panel
     * @param key
     * @param value
     * @param onClick
     * @param topLvl
     * @returns {XML}
     */
    drawNode(key, value, onClick, topLvl) {
        let arrowIcon = <ArrowIcon/>;
        let iconEl;
        if (topLvl == true) {
            iconEl = <DocumentIcon/>;
            key = Object.values(value)[0]
        }
        else if(key == "_id" || key == "id") iconEl = <IdIcon/>;
        else if(type(value) == 'string') iconEl = <StringIcon/>;
        else if(type(value) == 'array') iconEl = <ArrayIcon/>;
        else if(type(value) == 'number') iconEl = <NumberIcon/>;
        else if(type(value) == 'boolean') iconEl = <BooleanIcon/>;
        else if(type(value) == 'date') iconEl = <DateIcon/>;
        else if(type(value) == 'object') iconEl = <ObjectIcon/>;
        else if(type(value) == 'null') iconEl = <NullIcon/>;

        if (onClick) {
            return (<TreeNode
                title={
                    <div onClick={onClick}>
                        {iconEl}
                        <span className="branchKey">{key + ':\u00a0\u00a0\u00a0'}</span>
                        {arrowIcon}
                    </div>}
                key={this.setKey(topLvl, Object.values(value)[0], key)}
            />)
        } else {
            value = String(value);
            return (<TreeNode
                title={
                    <div>
                        {iconEl}
                        <span className="branchKey">{key + ':\u00a0\u00a0\u00a0'}</span>
                        <span className="branchValue">{value}</span>
                    </div>}
                key={this.setKey(topLvl, Object.values(value)[0], key)}
            />)
        }
    }

    /**
     * Is called when react is done rendering a new panel
     * this wil let the screen scroll to the left if the new panel is draw outside the view
     */
    componentDidUpdate() {
        const finderRowEl = document.getElementById('FinderRow');
        finderRowEl.scrollLeft = finderRowEl.scrollLeft + window.innerWidth;
    };

    /**
     * Renders the component
     * @returns {XML}
     */
    render() {
        const index = this.props.panes.findIndex(pane => pane.key == this.props.tabKey);
        const tab = this.props.panes[index];
        const keys = tab.selectedKeys;

        return (
            <div className="container-fluid">
                <div className="row view-row" id="FinderRow">
                    {this.props.finderPanes.map((pane, index) => this.drawPane(pane, index, keys))}
                </div>
            </div>
        )
    }
}

/**
 * Maps the state  from the state to props of the component
 * @param state
 * @returns {{settings: (currentSettings|{defaultView, defaultPageSize, theme, showEmptyArr, showEmptyObj, showBreadcrumbs}|*|settingsInitialState.currentSettings), panes: (*|panes|{$splice}|{}|{$push}|Array)}}
 */
function mapStateToProps(state) {
    return {
        settings: state.settings.currentSettings,
        panes: state.tabs.panes
    }
}

/**
 * Maps the action callers to props of the component
 * @param dispatch
 * @returns {{setNewFinderPane: (function(*=, *=, *=): *), selectNode: (function(*=, *=, *=): *)}}
 */
function mapDispatchToProps(dispatch) {
    return {
        setNewFinderPane: (target, newPane, index) => dispatch(setNewFinderPaneAction(target, newPane, index)),
        selectNode: (target, selectedNodes, halfSelectedNodes) => dispatch(selectNodeAction(target, selectedNodes, halfSelectedNodes))
    }
}
export const FinderComponent = ReactRedux.connect(mapStateToProps, mapDispatchToProps)(FinderUI);