import React from 'react';
import * as ReactRedux from 'react-redux';
import { Tabs } from 'antd';
import { closeTabAction, changeTabAction, editTabTitleAction } from '../actions';
import InlineEdit from './InlineEdit';
import { TabMenuComponent } from './TabMenuComponent';
import { BreadCrumbComponent } from './BreadCrumb';
import { PaginationComponent } from './PaginationComponent';
import { ViewComponent } from './ViewComponent';
const TabPane = Tabs.TabPane;

class TabsBarUI extends React.Component {
    render() {
        // First create an array of tab components to show in the tabsbar
        // Fill each tab with an InlineEdit component so that the name can be edited
        const tabs = this.props.panes.map(pane => {
            let breadcrumbs;
            if(this.props.settings.showBreadcrumbs == true) breadcrumbs = <BreadCrumbComponent paneInfo={pane}/>;
            return (
            <TabPane
                tab={
                    <InlineEdit
                        className="singleTab"
                        text={pane.title}
                        paramName={'title'}
                        change={change => this.props.changeTabTitle(pane.key, change.title)}
                    />
                }
                key={pane.key}
            >
                <TabMenuComponent paneInfo={pane}/>
                {breadcrumbs}
                <PaginationComponent paneInfo={pane}/>
                <ViewComponent
                    data={pane.data}
                    tabKey = {pane.key}
                />
            </TabPane>
        )});

        // Return the Tabs component filled with all tabs
        return(
            <div>
                <Tabs
                    hideAdd
                    onChange={this.props.changeTab}
                    activeKey={this.props.activeKey}
                    type="editable-card"
                    onEdit={this.props.closeTab}
                    animated={false}
                >
                    {tabs}
                </Tabs>
            </div>
        )
    }
}

function mapStateToProps(state) {
    return {
        panes: state.tabs.panes,
        newTabsIndex: state.tabs.newTabIndex,
        activeKey: state.tabs.activeKey,
        settings: state.settings.currentSettings
    }
}

function mapDispatchToProps(dispatch) {
    return {
        closeTab: (target, action) => dispatch(closeTabAction(target, action)),
        changeTab: (activeKey) => dispatch(changeTabAction(activeKey)),
        changeTabTitle: (target, title) => dispatch(editTabTitleAction(target, title))
    }
}

export const TabsBar = ReactRedux.connect(mapStateToProps, mapDispatchToProps)(TabsBarUI);
