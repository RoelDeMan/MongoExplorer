import React from 'react';
import * as ReactRedux from 'react-redux';
import { Modal, Switch, Icon, InputNumber, Form, Select, Button } from 'antd';
import { setNewSettingsAction, setTempSettingsAction, resetTempSettingsAction } from '../actions'

class SettingsUI extends React.Component {
    /**
     * Is called when the cancel button is clicked.
     * Calls the action to reset every temporary settings to the old settings.
     */
    onCancel() {
        this.props.resetTempSettings();
    }

    /**
     * Is called when the form is submitted.
     * Replaces the old settings with the temporary settings.
     * @param e
     */
    onSubmit(e) {
        e.preventDefault();
        let reload = false;
        if(this.props.tempSettings.theme != this.props.currentSettings.theme) reload = true;
        this.props.setNewSettings();
        if(reload) location.reload();
    }

    /**
     * Saves the changes made to each setting with a new value to the temporary settings.
     * @param value
     */
    onChangeDefaultView(value) {this.props.setTempSettings("defaultView", value)};
    onChangeDefaultPageSize(value) {this.props.setTempSettings("defaultPageSize", value)};
    onChangeShowEmptyArr(value) {this.props.setTempSettings("showEmptyArr", value)};
    onChangeShowEmptyObj(value) {this.props.setTempSettings("showEmptyObj", value)};
    onChangeShowBreadcrumbs(value) {this.props.setTempSettings("showBreadcrumbs", value)};
    onChangetheme(value) {this.props.setTempSettings("theme", value)};

    /**
     * Renders the component.
     * @returns {XML}
     */
    render() {
        const formItemLayout = {
            labelCol: { span: 6 },
            wrapperCol: { span: 14 },
        };
        return (
            <Modal
                visible={this.props.showSettingsModal}
                title="Settings"
                okText="Save"
                maskClosable={true}
                onCancel={this.onCancel.bind(this)}
                footer={<div></div>}
            >
                <Form
                    vertical={true}
                    onSubmit={this.onSubmit.bind(this)}
                    id="myForm"
                >
                    <Form.Item
                        {...formItemLayout}
                        label="Default view"
                    >
                        <Select
                            name="defaultView"
                            id="defaultView"
                            size="small"
                            value={this.props.tempSettings.defaultView}
                            onChange={this.onChangeDefaultView.bind(this)}
                        >
                            <Select.Option value="Tree">Tree view</Select.Option>
                            <Select.Option value="Finder">Finder view</Select.Option>
                        </Select>
                    </Form.Item>
                    <Form.Item
                        {...formItemLayout}
                        label="Default page size"
                    >
                        <InputNumber
                            id="defaultPageSize"
                            size="small"
                            min={1}
                            max={500}
                            value={this.props.tempSettings.defaultPageSize}
                            onChange={this.onChangeDefaultPageSize.bind(this)}
                        />
                    </Form.Item>
                    <Form.Item
                        {...formItemLayout}
                        label="Show empty arrays"
                    >
                        <Switch
                            id="showEmptyArr"
                            checked={this.props.tempSettings.showEmptyArr}
                            checkedChildren={<Icon type="check" />}
                            unCheckedChildren={<Icon type="cross" />}
                            onChange={this.onChangeShowEmptyArr.bind(this)}
                        />
                    </Form.Item>
                    <Form.Item
                        {...formItemLayout}
                        label="Show empty objects"
                    >
                        <Switch
                            id="showEmptyObj"
                            checked={this.props.tempSettings.showEmptyObj}
                            checkedChildren={<Icon type="check" />}
                            unCheckedChildren={<Icon type="cross" />}
                            onChange={this.onChangeShowEmptyObj.bind(this)}
                        />
                    </Form.Item>
                    <Form.Item
                        {...formItemLayout}
                        label="Show breadcrumbs"
                    >
                        <Switch
                            id="showBreadcrumbs"
                            checked={this.props.tempSettings.showBreadcrumbs}
                            checkedChildren={<Icon type="check" />}
                            unCheckedChildren={<Icon type="cross" />}
                            onChange={this.onChangeShowBreadcrumbs.bind(this)}
                        />
                    </Form.Item>
                    <Form.Item
                        {...formItemLayout}
                        label="Color theme"
                    >
                        <Select
                            id="theme"
                            size="small"
                            value={this.props.tempSettings.theme}
                            onChange={this.onChangetheme.bind(this)}
                        >
                            <Select.Option value="Black">Black</Select.Option>
                            <Select.Option value="CornflowerBlue">Cornflower Blue</Select.Option>
                            <Select.Option value="Crimson">Crimson</Select.Option>
                            <Select.Option value="Cyan">Cyan</Select.Option>
                            <Select.Option value="DeepPink">Deep Pink</Select.Option>
                            <Select.Option value="Green">Green</Select.Option>
                            <Select.Option value="Orange">Orange</Select.Option>
                            <Select.Option value="SlateGray">Slate Gray</Select.Option>
                        </Select>
                    </Form.Item>
                    <Form.Item
                        {...formItemLayout}
                        label=" "
                    >
                        <Button type="ghost" onClick={this.onCancel.bind(this)}>
                            Cancel
                        </Button>
                        <Button type="primary" htmlType="submit">
                            Save
                        </Button>
                    </Form.Item>
                </Form>
            </Modal>
        )
    }
}
/**
 * Maps the state  from the state to props of the component
 * @param state
 * @returns {{showSettingsModal: (*|boolean|showSettingsModal|{$set}), tempSettings: (*|tempSettings|{$set}|{$merge}|settingsInitialState.tempSettings|{defaultView, defaultPageSize, theme, showEmptyArr, showEmptyObj, showBreadcrumbs}), currentSettings: (*|currentSettings|{defaultView, defaultPageSize, theme, showEmptyArr, showEmptyObj, showBreadcrumbs}|settingsInitialState.currentSettings)}}
 */
function mapStateToProps(state) {
    return {
        showSettingsModal: state.settings.showSettingsModal,
        tempSettings: state.settings.tempSettings,
        currentSettings: state.settings.currentSettings
    }
}
/**
 * Maps the action callers to props of the component
 * @param dispatch
 * @returns {{setNewSettings: (function(): *), setTempSettings: (function(*=, *=): *), resetTempSettings: (function(): *)}}
 */
function mapDispatchToProps(dispatch) {
    return {
        setNewSettings: ()=> dispatch(setNewSettingsAction()),
        setTempSettings: (key, value)=> dispatch(setTempSettingsAction(key, value)),
        resetTempSettings: ()=> dispatch(resetTempSettingsAction())
    }
}
export const SettingsModalComponent = ReactRedux.connect(mapStateToProps, mapDispatchToProps)(SettingsUI);