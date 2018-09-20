import {TreeComponent} from './TreeComponent';
import {FinderComponent} from './FinderComponent';
import React from 'react';
import * as ReactRedux from 'react-redux'
import { changeTabViewAction } from '../actions'

/**
 * Component which renders the finder component or the tree components based on the given view
 *
 * @param index {Number}
 * @param view {String}
 * @param data {array}
 * @param finderPanes {array}
 */
class ViewComponentUI extends React.Component {
    render() {
        const index = this.props.panes.findIndex(pane => pane.key == this.props.tabKey);
        const view = this.props.panes[index].view;
        const data = this.props.panes[index].data;
        const finderPanes = this.props.panes[index].finderPanes;

        switch (view) {
            case 'Tree':
                return <TreeComponent
                            data={data}
                            tabKey={this.props.tabKey}
                        />;
            case 'Finder':
                return <FinderComponent
                            data={data}
                            finderPanes={finderPanes}
                            tabKey={this.props.tabKey}
                        />;
            default:
                return <div>Error in choosing view</div>
        }
    }
}

function mapStateToProps(state) {
    return {
        panes: state.tabs.panes
    }
}

function mapDispatchToProps(dispatch) {
    return {
        changeTabView: (target, view) => dispatch(changeTabViewAction(target, view))
    }
}

export const ViewComponent = ReactRedux.connect(mapStateToProps, mapDispatchToProps)(ViewComponentUI);
