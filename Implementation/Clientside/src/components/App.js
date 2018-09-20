import React from 'react';
import { Spin } from 'antd';
import { MainMenuComponent } from './MainMenuComponent'
import { TabsBar } from './TabsBar';
import { BackgroundLogo } from './Logos-Icons'
import * as ReactRedux from 'react-redux';
import { ImportModalWindow } from './ImportModalWindow';
import { JsonViewComponent } from './JsonViewComponent'

export class AppUI extends React.Component {
    /**
     * Renders component
     * @returns {XML}
     */
    render() {
        let style = require(`../../dist/themes/${this.props.settings.theme}.less`);
        let content;
        if(this.props.panes.length == 0) content = <div><MainMenuComponent/><BackgroundLogo/></div>;
        else content = <div><MainMenuComponent/><TabsBar/></div>;

        const index = this.props.panes.findIndex(pane => pane.key == this.props.activeKey);
        const paneInfo = this.props.panes[index];

        return (
            <Spin tip={<p id="loadingText">Connecting to the database...</p>} spinning={this.props.connecting} size="large">
                {content}
                <ImportModalWindow paneInfo={paneInfo}/>
                <JsonViewComponent paneInfo={paneInfo}/>
            </Spin>
        );
    }
}

/**
 * Maps the state  from the state to props of the component
 * @param state
 * @returns {{connecting: (*|boolean), theme: (currentSettings|{defaultView, defaultPageSize, theme, showEmptyArr, showEmptyObj, showBreadcrumbs}|settingsInitialState.currentSettings|*), panes: (*|panes|{$splice}|{}|{$push}|Array), settings: (currentSettings|{defaultView, defaultPageSize, theme, showEmptyArr, showEmptyObj, showBreadcrumbs}|settingsInitialState.currentSettings|*), connections: (*|connections|{$splice}|connectionReducer|Array|{$push}), activeKey: *}}
 */
function mapStateToProps(state) {
    return {
        connecting: state.modal.connecting,
        theme: state.settings.currentSettings,
        panes: state.tabs.panes,
        settings: state.settings.currentSettings,
        connections: state.connections.connections,
        activeKey: state.tabs.activeKey
    }
}
export const App = ReactRedux.connect(mapStateToProps)(AppUI);
