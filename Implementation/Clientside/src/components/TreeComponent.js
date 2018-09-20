import { Tree } from 'antd';
import React from 'react';
import * as ReactRedux from 'react-redux'
import type from 'type-of';
import { selectNodeAction } from '../actions';
import { ArrayIcon, DocumentIcon, IdIcon, StringIcon, NumberIcon, BooleanIcon, DateIcon, ObjectIcon, NullIcon } from './Logos-Icons';
const TreeNode = Tree.TreeNode;

class TreeComp extends React.Component {
    constructor(props) {
        super(props);
    }
    /**
     * Return an array of TreeNodes.
     * TreeNodes contain React components
     *
     * @param data {Object}
     * @returns {Array}
     */
    createTreeStructure(data) {
        let keys = Object.keys(data);
        let treeNodes = [];
        if(keys.length === 0) {
            treeNodes = <TreeNode title="0 results or empty collection" key={1}/>;
            return treeNodes;
        }
        else {
            keys.forEach((key, index) => {
                const treeNode = this.createTreeNode(key, data[key], index, true);
                if (treeNode) treeNodes.push(treeNode)
            });

            return treeNodes;
        }
    }

    /**
     * Replaces the string if a value is the top first of the tree, else return the given index
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
     * Create a single treeNode based on key and value. If the value is an Array or Object this function will be called for each value in the Array/Object.
     * The index parameter is needed for the React key that will be given to the node.
     * If top level is true a documentIcon will be used instead of an objectIcon
     *
     * @param key {String}
     * @param value {(Object|Array|Number|String|Date|null|Boolean)}
     * @param index {String}
     * @param topLvl {Boolean}
     * @returns {(React|undefined)}
     */
    createTreeNode(key, value, index, topLvl = true) {
        let iconEl;
        // Set image icon src based on datatype
        if (topLvl == true) iconEl = <DocumentIcon/>;
        else if(key == "_id" || key == "id") iconEl = <IdIcon/>;
        else if(type(value) == 'string') iconEl = <StringIcon/>;
        else if(type(value) == 'array') iconEl = <ArrayIcon/>;
        else if(type(value) == 'number') iconEl = <NumberIcon/>;
        else if(type(value) == 'boolean') iconEl = <BooleanIcon/>;
        else if(type(value) == 'date') iconEl = <DateIcon/>;
        else if(type(value) == 'object') iconEl = <ObjectIcon/>;
        else if(type(value) == 'null') iconEl = <NullIcon/>;

        // If the value is an Array or Object, call this function for each element/key and insert result into TreeNode
        if (type(value) === 'object' || type(value) === 'array') {
            let treeNodes = [];

            // For each element/key, create TreeNodes
            Object.keys(value).forEach((key, newIndex) => {
                const val = value[key];
                const treeNode = this.createTreeNode(key, val, `${index}${newIndex}.`, false);
                if (treeNode) treeNodes.push(treeNode);
            });

            // If toplvl (document level) set the key to the id of the Array/Object
            if (type(value) === 'object' && topLvl) key = Object.values(value)[0];

            // If TreeNode Array is filled (It won't be if the search didn't find anything) return TreeNode filled with underlying TreeNodes
            if (treeNodes.length) {
                return (
                    <TreeNode
                        disableCheckbox={!topLvl}
                        title={
                            <div>
                                {iconEl}
                                <span className="branchKey" >
                                {key + ':\u00a0\u00a0\u00a0'}</span>
                                <span className="branchValue">{type(value) === 'array' ? value.length : value[key]}</span>
                            </div>}
                        key={this.setKey(topLvl, Object.values(value)[0], index)}
                    >
                        {treeNodes}
                    </TreeNode>
                );
            } else if(type(value) === 'object' && this.props.settings.showEmptyObj || type(value) === 'array' && this.props.settings.showEmptyArr) {
                return (
                    <TreeNode
                        disableCheckbox={!topLvl}
                        title={
                            <div>
                                {iconEl}
                                <span className="branchKey">
                                {key + ':\u00a0\u00a0\u00a0'}</span>
                                <span className="branchValue">{type(value) === 'array' ? value.length : value[key]}</span>
                            </div>}
                        key={index}
                    >
                        <TreeNode
                            title={type(value) === 'array' ? 'Empty array' : 'Empty object'}
                            key={index}
                            disabled={true}
                        />
                    </TreeNode>
                );
            }

        } else {
            value = String(value);

            return (
                <TreeNode
                    disableCheckbox={true}
                    title={
                        <div>
                            {iconEl}
                            <span className="leafKey">
                                {key + ':\u00a0\u00a0\u00a0'}</span>
                            <span className="leafValue">{value}</span>

                        </div>}
                    key={index}
                />
            );
        }
    }

    /**
     * Saves the selected nodes to the store.
     * @param checkedNodes
     * @param halfCheck
     */
    selectNodes(checkedNodes, halfCheck) {
        this.props.selectNode(this.props.tabKey, checkedNodes, halfCheck)
    }

    /**
     * Renders the component.
     * @returns {XML}
     */
    render() {
        const index = this.props.panes.findIndex(pane => pane.key == this.props.tabKey);
        const tab = this.props.panes[index];
        let tree = this.createTreeStructure(this.props.data);
        return (
            <div>
                <Tree
                    checkable={this.props.data.length !== 0}
                    onCheck={(checkedKeys, event) => this.selectNodes(checkedKeys, event.halfCheckedKeys)}
                    checkedKeys={tab.selectedKeys}
                    defaultExpandedKeys={['selectAllKey']}
                >
                    {
                        this.props.data.length ? (
                            <TreeNode title={<span className="branchKey">{'Select all'}</span>} key={'selectAllKey'}>
                                {tree}
                            </TreeNode>) :
                            <TreeNode title={<span className="branchKey">{'Nothing found'}</span>} key={'nothingFoundKey'}/>
                    }
                </Tree>
            </div>
        )
    }
}
/**
 * Maps the state  from the state to props of the component.
 * @param state
 * @returns {{panes: (*|panes|{}|{$splice}|{$push}|Array), settings: (currentSettings|{defaultView, defaultPageSize, theme, showEmptyArr, showEmptyObj, showBreadcrumbs}|*|settingsInitialState.currentSettings)}}
 */
function mapStateToProps(state) {
    return {
        panes: state.tabs.panes,
        settings: state.settings.currentSettings
    }
}
/**
 * Maps the action callers to props of the component.
 * @param dispatch
 * @returns {{selectNode: (function(*=, *=, *=): *)}}
 */
function mapDispatchToProps(dispatch) {
    return {
        selectNode: (target, selectedNodes, halfSelectedNodes) => dispatch(selectNodeAction(target, selectedNodes, halfSelectedNodes))
    }
}
export const TreeComponent = ReactRedux.connect(mapStateToProps, mapDispatchToProps)(TreeComp);
