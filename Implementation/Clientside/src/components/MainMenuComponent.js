import React from 'react';
import * as ReactRedux from 'react-redux';
import { Menu, Icon } from 'antd';
import { HeaderLogo } from './Logos-Icons';
import { ConWindow } from './ConModalWindow';
import { SettingsModalComponent } from './SettingsModalComponent';
import { openModalAction, openSettingsModalAction, getPageAction, deleteConnectionAction, connectToDatabaseAction } from '../actions';

class MainMenuUI extends React.Component {
    /**
     * Is called when the refresh button is clicked.
     * Deletes every known connection from the state en will try to reconnect to all of them.
     * @param connections
     */
    refreshConnections(connections) {
        connections.forEach((connection)=>{
            this.props.deleteConnection(Object.keys(connection.data)[0]);
            this.props.connectToDatabase(Object.keys(connection.data)[0].split(":")[0], Object.keys(connection.data)[0].split(":")[1], connection[Object.keys(connection.data)[0]], true);
        });
    }

    /**
     * Is called when the refresh button is clicked.
     * Closes every tab and tries to get the content from the closed collections from the server again.
     * @param tabs
     */
    refreshTabs(tabs) {
        tabs.forEach((tab)=>{
            this.props.getPage(tab.address[0], tab.address[1], tab.address[2], tab.paginationInfo.currentPage, tab.paginationInfo.pageSize, this.props.settings.defaultView, tab.key, true, "{}");
        });
    }

    /**
     * This creates the menu in wich the connections, databases and
     * collections are shown which are saved in the store.
     * @param data
     * @returns {*}
     */
    createCascaderStructure(data) {
        if(data.length == 0) return <Menu.Item disabled={true}>No connections found</Menu.Item>;
        else return data.map(connection => {
            /**
             *  Name of the Connection is always first element in Array
             */
            const connectionName = Object.keys(connection.data)[0];
            const databases = connection.data[connectionName].databases;
            let connectionChildren;

            if(databases.length == 0) {
                connectionChildren = <Menu.Item disabled={true}>No databases found</Menu.Item>
            }
            else {
                /**
                 * For each database create underlying data
                 */
                connectionChildren = Object.keys(databases).map((databaseName) => {
                    /**
                     * For each key in database object (collection) create data
                     */
                    const collections = databases[databaseName].collections.map(collection => {
                        if(databases.length == 0) {
                            return <Menu.Item disabled={true}>No collections found</Menu.Item>
                        } else {
                            return <Menu.Item key={"collection|"+collection.name}>{collection.name}</Menu.Item>
                        }
                    });
                    return<Menu.SubMenu key={"database|"+databaseName} title={databaseName}>
                        <Menu.ItemGroup title="Collections">
                            {collections}
                        </Menu.ItemGroup>
                    </Menu.SubMenu>

                });
            }
            return<Menu.SubMenu key={"connection|"+connectionName} title={connectionName}>
                <Menu.ItemGroup title="Databases">
                    {connectionChildren}
                </Menu.ItemGroup>
            </Menu.SubMenu>
        })
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
        switch(e.keyPath[0].split('|')[0]){
            case 'connection':
                this.props.openModal();
                break;
            case 'collection':
                let addressArray = [e.keyPath[2].split("|")[1], e.keyPath[1].split("|")[1], e.keyPath[0].split("|")[1]];
                this.props.getPage(addressArray[0], addressArray[1], addressArray[2], 1, this.props.settings.defaultPageSize, this.props.settings.defaultView, undefined, false, '{}');
                break;
            case 'settings':
                this.props.openSettingsModal();
                break;
            case 'reload':
                this.refreshConnections(this.props.connections);
                this.refreshTabs(this.props.panes);
                break;
        }
    }

    /**
     * Renders the component.
     * @returns {XML}
     */
    render() {
        return (
            <Menu
                mode="horizontal"
                onClick={this.handleMenuClick.bind(this)}
                style={{fontSize: "18px"}}
            >
                <Menu.Item key="connection" ><Icon type="plus" />New connection</Menu.Item>
                <Menu.SubMenu key="openCollection" title={<div><Icon type="addfolder" />Open collection</div>}>
                    <Menu.ItemGroup title="Connections">
                        {this.createCascaderStructure(this.props.connections)}
                    </Menu.ItemGroup>
                </Menu.SubMenu>
                <Menu.Item key="settings"><Icon type="setting" />Settings</Menu.Item>
                <Menu.Item key="reload"><Icon type="reload" />Refresh</Menu.Item>
                <HeaderLogo/>
                <ConWindow />
                <SettingsModalComponent/>
            </Menu>
        )
    }
}
/**
 * Maps the state  from the state to props of the component
 * @param state
 * @returns {{newTabIndex: (*|number|newTabIndex|{$apply}), panes: (*|panes|{}|{$splice}|{$push}|Array), settings: (currentSettings|{defaultView, defaultPageSize, theme, showEmptyArr, showEmptyObj, showBreadcrumbs}|*|settingsInitialState.currentSettings), connections: (*|Array|connections|{$push}|connectionReducer|{$splice})}}
 */
function mapStateToProps(state) {
    return {
        newTabIndex: state.tabs.newTabIndex,
        panes: state.tabs.panes,
        settings: state.settings.currentSettings,
        connections: state.connections.connections
    }
}
/**
 * Maps the action callers to props of the component
 * @param dispatch
 * @returns {{connectToDatabase: (function(*=, *=, *=, *=): *), deleteConnection: (function(*=): *), openSettingsModal: (function(): *), getPage: (function(*=, *=, *=, *=, *=, *=, *=, *=, *=, *=): *)}}
 */
function mapDispatchToProps(dispatch) {
    return {
        openModal: () => dispatch(openModalAction()),
        connectToDatabase: (address, port, refresh) => dispatch(connectToDatabaseAction(address, port, refresh)),
        deleteConnection: (address) => dispatch(deleteConnectionAction(address)),
        openSettingsModal: ()=> dispatch(openSettingsModalAction()),
        getPage: (address, database, collection, page, pageSize, defaultView, target, refresh, query) => dispatch(getPageAction(address, database, collection, page, pageSize, defaultView, target, refresh, query))
    }
}
export const MainMenuComponent = ReactRedux.connect(mapStateToProps, mapDispatchToProps)(MainMenuUI);
