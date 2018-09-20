import React from 'react';
import * as ReactRedux from 'react-redux';
import { Breadcrumb, Popover } from 'antd';
import { ObjectIcon, CollectionIcon, ConnectionIcon, DatabaseIcon } from './Logos-Icons'

export class BreadCrumb extends React.Component {
    /**
     * Renders component
     * @returns {XML}
     */
    render() {
        let query = this.props.paneInfo.query;
        let BCquery;
        let POquery = [];
        let queryBreadcrumb = [];
        if(query.length > 2) {
            if (query.length > 40) {
                BCquery = this.props.paneInfo.query.substr(0, 40) + "\u2026";

                for (let i = 0; i < query.length / 100; i++) {
                    let string = query.slice(i * 100, i * 100 + 100);
                    POquery.push(<div key={i}>{string}<br/></div>);
                }
                queryBreadcrumb.push(<Breadcrumb.Item key={1}><ObjectIcon/><Popover title="Find query" content={POquery} placement="bottomRight">{BCquery}</Popover></Breadcrumb.Item>);
            } else queryBreadcrumb.push(<Breadcrumb.Item key={1}><ObjectIcon/>{query}</Breadcrumb.Item>);
        }

        const breadCrumbs = <Breadcrumb>
            <Breadcrumb.Item key={0}><ConnectionIcon/>{this.props.paneInfo.address[0]}</Breadcrumb.Item>
            <Breadcrumb.Item key={1}><DatabaseIcon/>{this.props.paneInfo.address[1]}</Breadcrumb.Item>
            <Breadcrumb.Item key={2}><CollectionIcon/>{this.props.paneInfo.address[2]}</Breadcrumb.Item>
            {queryBreadcrumb}
        </Breadcrumb>;

        return (
            <div>
                <Breadcrumb>
                    {breadCrumbs}
                </Breadcrumb>
            </div>
        )
    }
}

/**
 * Maps the state  from the state to props of the component
 * @param state
 * @returns {{breadcrumbs: (*|activeBreadcrumb|{$set}|Array)}}
 */
function mapStateToProps(state) {
    return {
        breadcrumbs: state.tabs.activeBreadcrumb
    }
}
export const BreadCrumbComponent = ReactRedux.connect(mapStateToProps)(BreadCrumb);