import * as Redux from 'redux';
import update from 'immutability-helper';
import React from 'react';
import {
    OPEN_SETTINGS_MODAL,
    RESET_TEMP_SETTINGS,
    CHANGE_TEMP_SETTINGS,
    SET_SETTINGS,
    SELECT_NODE,
    CHANGE_TAB_VIEW,
    ADD_FINDER_PANE,
    OPEN_JSONVIEW,
    CLOSE_JSONVIEW,
    ADD_TAB,
    CHANGE_TAB,
    CLOSE_TAB,
    EDIT_TAB_TITLE,
    EDIT_TAB_CONTENT,
    CREATE_CONNECTION,
    DELETE_CONNECTION,
    CLOSE_MODAL,
    OPEN_MODAL,
    SET_CONNECTING,
    OPEN_IMPORT_MODAL,
    CLOSE_IMPORT_MODAL,
    SET_IMPORTING
} from './constants.js';
import {Notification} from './components/NotificationComponent';

//=====================================================================
//    Reducers
//---------------------------------------------------------------------

const modalInitialState = {
    showModal: false,
    connecting: false,
    showImportModal: false,
    importing: false,
};

const tabsInitialState = {
    newTabIndex: 1,
    activeKey: '1',
    panes: [],
    breadcrumbs: [],
    activeBreadcrumb: []
};

const connectionsInitialState = {
    connections: [],
    addresses: []
};

const settingsInitialState = {
    showSettingsModal: false,
    currentSettings: {
        defaultView: "Tree",
        defaultPageSize: 20,
        theme: "Crimson",
        showEmptyArr: true,
        showEmptyObj: true,
        showBreadcrumbs: true
    },
    tempSettings: {
        defaultView: "Tree",
        defaultPageSize: 20,
        theme: "Crimson",
        showEmptyArr: true,
        showEmptyObj: true,
        showBreadcrumbs: true
    }
};

const jsonViewInitialState = {
    showModal: false,
    jsonData: 0,
};

function modalReducer(state = modalInitialState, action) {
    switch (action.type) {
        /**
         * Show the connection modal
         *
         * @param data {Array}
         */
        case OPEN_MODAL: {
            let newState = {showModal: true};
            return update(state, {
                $merge: newState
            });
        }
        /**
         * opens import modal
         *
         * @param showImportModal {boolean}
         */
        case OPEN_IMPORT_MODAL: {
            return update(state, {
                showImportModal: {
                    $set: true
                }
            })
        }

        /**
         * Close the connection modal
         */
        case CLOSE_MODAL: {
            let newState = {showModal: false};
            return update(state, {
                $merge: newState
            });
        }
        /**
         * closes the import modal
         *
         * @param showImportModal {boolean}
         */
        case CLOSE_IMPORT_MODAL: {
            return update(state, {
                showImportModal: {
                    $set: false
                }
            })
        }

        /**
         * Set the state of the modal to connecting
         * @param bool {Boolean}
         */
        case SET_CONNECTING: {
            let newState = {connecting: action.bool};
            return update(state, {
                $merge: newState
            });
        }
        /**
         * set the state of the modal to importing
         *
         * @param importing {boolean}
         */
        case SET_IMPORTING: {
            return update(state, {
                importing: {
                    $set: action.importing
                }
            })
        }

        default:
            return state;
    }
}

function tabReducer(state = tabsInitialState, action ) {
    let index;

    switch(action.type) {
        /**
         * Add a new tab and set the content, automatically set indexes and breadcrumbs
         *
         * @param data {Object}
         * @param addressData {Array}
         */
        case ADD_TAB:
            let newKey = state.newTabIndex;
            if(action.target) newKey = action.target;
            if(!action.page) action.page = 1;
            return update(state, {
                newTabIndex: {
                    $apply: (index) => {
                        return index +1;
                    }
                },
                panes: {
                    $push: [{
                        title: action.collection,
                        key: state.newTabIndex,
                        view: action.defaultView,
                        data: action.data.documents,
                        finderPanes: [action.data.documents],
                        selectedKeys: [],
                        halfSelectedKeys: [],
                        address: action.addressData,
                        paginationInfo: {
                            totalDocsInCollection: Number(action.data.totalDocs),
                            pageSize: action.pageSize,
                            currentPage: action.page
                        },
                        selectAll: false,
                        query: action.query
                    }]
                },
                breadcrumbs: {
                    $push: [{
                        tabIndex: state.newTabIndex,
                        address: action.addressData
                    }]
                },
                activeBreadcrumb: {
                    $set: action.addressData
                },
                activeKey: {
                    $set: String(state.newTabIndex)
                },
            });

        /**
         * Change the active tab and breadcrumb where the tabKey == the given target
         *
         * @param activeKey {String}
         */
        case CHANGE_TAB:
            index = state.breadcrumbs.findIndex(breadcrumb => breadcrumb.tabIndex == action.activeKey);
            const breadcrumb = state.breadcrumbs[index].address;
            return update(state, {
                activeKey: {
                    $set: action.activeKey
                },
                activeBreadcrumb: {
                    $set: breadcrumb
                },
            });

        /**
         * Close the tab where the tabKey == the given target
         *
         * @param target {String}
         */
        case CLOSE_TAB:
            index = state.panes.findIndex(pane => pane.key == action.target);
            const breadcrumbIndex = state.breadcrumbs.findIndex(breadcrumb => breadcrumb.tabIndex == action.target);

            if (index !== -1) {
                let newActiveKey;
                if(state.panes[index].key == state.activeKey) {
                    if(state.panes.length > 1 && index != 0) newActiveKey = state.panes[0].key;
                    else if(state.panes.length > 1 && index == 0) newActiveKey = state.panes[1].key;
                    else newActiveKey = 1;
                } else newActiveKey = state.activeKey;
                return update(state, {
                    panes: {
                        $splice: [[index, 1]]
                    },
                    breadcrumbs: {
                        $splice: [[breadcrumbIndex, 1]]
                    },
                    activeKey: {
                        $set: String(newActiveKey)
                    },
                })
            }
            return state;

        /**
         * Edit the title of the tab where the tabKey == the given target
         *
         * @param target {String}
         * @param title {String}
         */
        case EDIT_TAB_TITLE:
            index = state.panes.findIndex(pane => pane.key == action.target);
            if (index !== -1) {
                const updatedTab = update(state.panes[index], {
                    title: {
                        $set: action.title
                    }
                });
                return update(state, {
                    panes: {
                        $splice: [[index, 1, updatedTab]]
                    }
                })
            }
            return state;

        /**
         * Edit the content of the tab where the tabKey == the given activeKey
         *
         * @param pageSize {String}
         * @param data {Object}
         */
        case EDIT_TAB_CONTENT:
            index = state.panes.findIndex(pane => pane.key == action.target);
            if (index !== -1) {
                return update(state, {
                    panes: {
                        [index]: {
                            $merge: {
                                finderPanes: [action.data.documents],
                                data: action.data.documents,
                                paginationInfo: {
                                    totalDocsInCollection: Number(action.data.totalDocs),
                                    pageSize: action.pageSize,
                                    currentPage: action.page
                                }
                            }
                        }
                    }
                });
            }
            return state;

        /**
         * Set the view of the tab where the tabKey == the given target
         *
         * @param target {String}
         * @param view {String}
         */
        case CHANGE_TAB_VIEW:
            index = state.panes.findIndex(pane => pane.key == action.target);
            if (index !== -1) {
                let updatedTab;
                if(state.panes[index].view == 'Tree') {
                    updatedTab = update(state.panes[index], {
                        view: {
                            $set: 'Finder'
                        }
                    });
                } else {
                    updatedTab = update(state.panes[index], {
                        view: {
                            $set: 'Tree'
                        }
                    });
                }
                return update(state, {
                    panes: {
                        $splice: [[index, 1, updatedTab]]
                    }
                })
            }
            return state;
        /**
         * Adds a finder pane where pane.key is the given target
         */
        case ADD_FINDER_PANE:
            index = state.panes.findIndex(pane => pane.key == action.target);
            if (index !== -1) {
                let updatedTab;
                const panes = state.panes[index].finderPanes;

                if(action.index >= panes.length - 1) {
                    return update(state, {
                        panes: {
                            [index]: {
                                finderPanes: {
                                    $push: [action.newPane]
                                }
                            }
                        }
                    });
                } else {
                    let toRemove = [];
                    for(let i = 0; i < panes.length; i++) {
                        if (i > action.index) {
                            toRemove.push(i);
                        }
                    }
                    toRemove.sort((a, b) => a - b);

                    return update(state, {
                        panes: {
                            [index]: {
                                finderPanes: {
                                    $splice: [[toRemove[0], toRemove.length, action.newPane]]
                                }
                            }
                        }
                    });
                }
            }
            return state;
        /**
         * Saves the selectedKeys in the state
         *
         * @param selectedKeys {array}
         * @param halfSelectedKeys {array}
         */
        case SELECT_NODE:
            index = state.panes.findIndex(pane => pane.key == action.target);
            if (index !== -1) {
                const updatedTab = update(state.panes[index], {
                    selectedKeys: {
                        $set: action.selectedNodes
                    },
                    halfSelectedKeys: {
                        $set: action.halfSelectedNodes
                    }
                });

                return update(state, {
                    panes: {
                        $splice: [[index, 1, updatedTab]]
                    }
                })
            }
            return state;

        default:
            return state;
    }
}

function connectionReducer(state = connectionsInitialState, action) {
    switch (action.type) {
        /**
         * Add a new connection to the connections to chose from
         *
         * @param address {String}
         * @param port {String}
         * @param data {Object}
         */
        case CREATE_CONNECTION:
            const address = `${action.address}:${action.port}`;
            const newConnection = {
                [address]: 'MongoDB',
                data: action.data
            };
            if (state.addresses.indexOf(address) === -1) {
                if(!action.refresh) Notification("success", "Success!", "You are now connected to the database, use the top menu to browse the collections.", 10);
                return update(state, {
                    connections: {
                        $push: [newConnection]
                    },
                    addresses: {
                        $push: [address]
                    }
                });
            } else {
                if(!action.refresh) Notification("warning", "Connection warning", "You already are connected to this database.", 10);
                else Notification("warning", "Connection error", `Connection lost to ${action.address}:${action.port}`, 10);
                return state;
            }

        /**
         *Delete a connection from connections to chose from
         *
         *@param address {String}
         */
        case DELETE_CONNECTION:
            let conIndex;
            state.connections.forEach((connection, i) => {if(connection.data[action.address]) conIndex = i});
            let addressIndex = state.addresses.indexOf(action.address);
            return update(state, {
                connections: {
                    $splice: [[conIndex, 1]]
                },
                addresses: {
                    $splice: [[addressIndex, 1]]
                }
            });

        default:
            return state;
    }
}

function settingsReducer(state = settingsInitialState, action) {
    switch (action.type) {
        /**
         * Save the settings which can be altered in the settings window
         *
         * @param showSettingsModal {boolean}
         * @param defaultView {String}
         * @param defaultPageSize {Number}
         * @param theme {String}
         * @param showEmptyArr {boolean}
         * @param showEmptyObj {boolean}
         * @param showBreadcrumbs {boolean}
         */
        case SET_SETTINGS:
            return update(state, {
                showSettingsModal: {$set: false},
                currentSettings: {
                    defaultView: {$set: state.tempSettings.defaultView},
                    defaultPageSize: {$set: state.tempSettings.defaultPageSize},
                    theme: {$set: state.tempSettings.theme},
                    showEmptyArr: {$set: state.tempSettings.showEmptyArr},
                    showEmptyObj: {$set: state.tempSettings.showEmptyObj},
                    showBreadcrumbs: {$set: state.tempSettings.showBreadcrumbs}
                }
            });
         /**
          * Change the temporary settings which will overwrite the currentSettings
          *
          * @param key
          * @param value
          *
          * Merge value at param key.
          */
        case CHANGE_TEMP_SETTINGS:
            return update(state, {
                tempSettings: {$merge: {[action.key]: action.value}
            }});
        /**
         * Reset the temporary settings
         *
         * @param showSettingsModal {boolean}
         * @param tempSettings {object}
         */
        case RESET_TEMP_SETTINGS:
            return update(state, {
                showSettingsModal: {$set: false},
                tempSettings: {$set: state.currentSettings}
                });
        /**
         * Sets boolean to true which opens the settings modal
         *
         * @param showSettingsModal {boolean}
         */
        case OPEN_SETTINGS_MODAL:
            return update(state, {
                showSettingsModal: {$set: true}
            });
        default:
            return state;
    }
}

function jsonViewReducer(state = jsonViewInitialState, action) {
    switch(action.type) {
        /**
         * sets boolean to true which opens the JSON updateModal and sets jsonData with the selected keys.
         *
         * @param showModal {boolean}
         * @param jsonData {String}
         */
        case OPEN_JSONVIEW:
            return update(state, {
                showModal: {
                    $set: true
                },
                jsonData: {
                    $set: action.selected
                }
            });
        /**
         * sets boolean to false which closes the JSON modal
         *
         * @param showModal {boolean}
         */
        case CLOSE_JSONVIEW:
            return update(state, {
               showModal:{
                   $set: false
               }
            });
        default:
            return state;
    }
}

//=====================================================================
//    Combine reducers
//---------------------------------------------------------------------
export const mainReducer = Redux.combineReducers({
    tabs:  tabReducer,
    modal: modalReducer,
    connections: connectionReducer,
    settings: settingsReducer,
    jsonView: jsonViewReducer
});
