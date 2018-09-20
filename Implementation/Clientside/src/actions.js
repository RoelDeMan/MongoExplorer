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
    SET_IMPORTING,
} from './constants';
    
import superagent from 'superagent';
import {Notification} from './components/NotificationComponent'

//=====================================================================
//    Action creators
//---------------------------------------------------------------------

/**
 * Returns CLOSE_MODAL constant
 *
 * @return {{type}}
 */
export function closeModalAction(){
    return { type: CLOSE_MODAL};
}
/**
 * Returns OPEN_MODAL constant
 *
 * @return {{type}}
 */
export function openModalAction(){
    return { type: OPEN_MODAL};
}

/**
 * Returns OPEN_IMPORT_MODAL constant
 *
 * @return {{type}}
 */
export function openImportModalAction() {
    return {type: OPEN_IMPORT_MODAL}
}

/**
 * Returns CLOSE_IMPORT_MODAL constant
 *
 * @return {{type}}
 */
export function closeImportModalAction() {
    return {type: CLOSE_IMPORT_MODAL}
}

/**
 *  Returns CHANGE_TAB constant and given activeKey
 *
 * @param activeKey {String}
 * @return {{type, activeKey: *}}
 */
export function changeTabAction(activeKey) {
    return {type: CHANGE_TAB, activeKey}
}

/**
 * Returns CLOSE_TAB constant and given target
 *
 * @param target {String}
 * @return {{type, target: *}}
 */
export function closeTabAction(target) {
    return {type: CLOSE_TAB, target}
}

/**
 * Returns EDIT_TAB_CONTENT constant and given target and content
 *
 * @param target {String}
 * @param content {React}
 * @return {{type, target: *, content: *}}
 */
export function editTabContentAction(target, data, pageSize) {
    return {type: EDIT_TAB_CONTENT, target, data, pageSize}
}

/**
 * Returns EDIT_TAB_TITLE constant and given target and title
 *
 * @param target
 * @param title
 * @return {{type, target: *, title: *}}
 */
export function editTabTitleAction(target, title) {
    return {type: EDIT_TAB_TITLE, target, title}
}

/**
 * Returns OPEN_JSONVIEW constant and given selected
 *
 * @param selected
 * @return {{type, selected: *}}
 */
export function openJsonViewAction(selected) {
    return {type: OPEN_JSONVIEW, selected}

}

/**
 * Returns CLOSE_JSONVIEW constant
 *
 * @return {{type}}
 */
export function closeJsonViewAction() {
    return {type: CLOSE_JSONVIEW}
}

/**
 * Returns CHANGE_TAB_VIEW constant and target given
 *
 * @param target
 * @return {{type, target: *}}
 */
export function changeTabViewAction(target) {
    return {type: CHANGE_TAB_VIEW, target}
}

/**
 * Returns ADD_FINDER_PANE constant and given target, newPane and index
 *
 * @param target
 * @param newPane
 * @param index
 * @return {{type, target: *, newPane: *, index: *}}
 */
export function setNewFinderPaneAction(target, newPane, index) {
    return {type: ADD_FINDER_PANE, target, newPane, index}
}

/**
 * Returns SELECT_NODE constant and given target, selectedNodes and halfSelectedNodes
 *
 * @param target
 * @param selectedNodes
 * @param halfSelectedNodes
 * @return {{type, target: *, selectedNodes: *, halfSelectedNodes: *}}
 */
export function selectNodeAction(target, selectedNodes, halfSelectedNodes) {
    return {type: SELECT_NODE, target, selectedNodes, halfSelectedNodes}
}

/**
 * Returns SET_SETTINGS constant
 *
 * @return {{type}}
 */
export function setNewSettingsAction() {
    return { type: SET_SETTINGS}
}

/**
 * Returns CHANGE_TEMP_SETTINGS constant and given key and value
 *
 * @param key
 * @param value
 * @return {{type, key: *, value: *}}
 */
export function setTempSettingsAction(key, value) {
    return { type: CHANGE_TEMP_SETTINGS, key, value }
}

/**
 * Returns RESET_TEMP_SETTINGS constant
 *
 * @return {{type}}
 */
export function resetTempSettingsAction() {
    return { type: RESET_TEMP_SETTINGS }
}

/**
 * Returns OPEN_SETTINGS_MODAL constant
 *
 * @return {{type}}
 */
export function openSettingsModalAction() {
    return { type: OPEN_SETTINGS_MODAL }
}

/**
 * Returns DELETE_CONNECTION constant and given address
 *
 * @param address
 * @return {{type, address: *}}
 */
export function deleteConnectionAction(address) {
    return { type: DELETE_CONNECTION, address }
}
//=====================================================================
//    Thunk action creators
//---------------------------------------------------------------------

/**
 * Thunk action to get all Databases and collections from an address
 * Dispatches CLOSE_MODAL constant and CREATE_CONNECTION constant if successful
 * Also dispatches the given parameters and returned data if successful
 *
 * @param address {String}
 * @param port {String}
 * @param refresh {boolean}
 * @return {function(*)}
 */
export function connectToDatabaseAction(address, port, refresh = false) {
    return (dispatch) => {
        dispatch({ type: SET_CONNECTING, bool: true });
        dispatch({ type: CLOSE_MODAL});
        superagent
            .get(`http://localhost:3000/${address}/${port}/connect`)
            .end((err, response) => {
                dispatch({ type: SET_CONNECTING, bool:false });
                if (err) {
                    if(!refresh) {
                        dispatch({ type: OPEN_MODAL});
                        Notification("error", "Connection error", `Failed to connect to ${address}:${port}`, 10);
                    } else Notification("warning", "Connection error", `Connection lost to ${address}:${port}`, 10);
                } else {
                    const data = JSON.parse(response.text);
                    dispatch({ type: CREATE_CONNECTION, address, port, data, refresh })
                }
            });
    }
}

/**
 * Thunk action to get contents of specific page in a collection
 * Dispatches SET_CONNECTING constant to false when request finishes
 * Dispatches ADD_TAB constant if correctFind == true
 * Dispatches CLOSE_TAB and CLOSE_IMPORT_MODAL if refresh == true
 * Also dispatches the given parameters and returned data if successful
 *
 * @param address
 * @param database
 * @param collection
 * @param page
 * @param pageSize
 * @param defaultView
 * @param target
 * @param refresh
 * @param query
 * @returns {function(*)}
 */
export function getPageAction(address, database, collection, page, pageSize, defaultView, target, refresh = false, query) {
    return (dispatch) => {
        dispatch({ type: SET_CONNECTING, bool: true });
        if(refresh) {
            dispatch({ type: CLOSE_TAB, target });
            dispatch({ type: CLOSE_IMPORT_MODAL });
        }
        superagent
            .post(`http://localhost:3000/${address}/${database}/${collection}/${pageSize}/${page}/${query}`)
            .set('Content-Type', 'application/json')
            .send()
            .end((err, response) => {
                dispatch({ type: SET_CONNECTING, bool:false });
                if (err) {
                    dispatch({ type: DELETE_CONNECTION, address});
                    Notification("error", "Connection error", "Failed to connect to the database, reconnect and try again", 10);
                } else {
                    let res = JSON.parse(response.text);
                    let data = res.results;
                    if(query.includes('ObjectId(')) {
                        query = query.split('ObjectId(')[0] + query.split('ObjectId(')[1].split(')')[0] + query.split(')')[1];
                    }
                    const addressData = [address, database, collection];
                    if(res.correctFind == true) {
                        dispatch({ type: ADD_TAB, collection, data, addressData, pageSize, defaultView, target, query, page});
                    }
                    else {
                        Notification("warning", "find error", "Unable to apply find query, check you query and try again", 10);
                        dispatch({ type: ADD_TAB, collection, data, addressData, pageSize, defaultView, target, query: "{}", page});
                    }
                }
            });
    }
}

/**
 * Thunk action to get delete documents in a specific collection
 * Dispatches CLOSE_TAB for a refresh
 * Dispatches ADD_TAB if request = success
 * Also dispatches the given parameters and returned data if successful
 *
 * @param address
 * @param database
 * @param collection
 * @param arrayIds
 * @param pageSize
 * @param defaultView
 * @param target
 * @param query
 * @returns {function(*)}
 */
export function deleteDocumentsThunkAction( address, database, collection, arrayIds, pageSize, target, defaultView, query){
    return (dispatch) => {
        dispatch({ type: CLOSE_TAB, target});
        let json = {ids: arrayIds, query};
        superagent
            .post(`http://localhost:3000/${address}/${database}/${collection}/${pageSize}/1/delete`)
            .send(json)
            .end((err, response) => {
                const res = JSON.parse(response.text);
                if (res.error === 'connectionError') {
                    dispatch({type: DELETE_CONNECTION, address});
                    Notification("error", "Connection error", "Failed to connect to the database, reconnect and try again", 10);
                }
                else if (res.error === 'deleteError') {
                    const addressData = [address, database, collection];
                    const data = res.content;
                    Notification("error", "Delete error", "Something went wrong while trying to delete the document(s), nothing was deleted", 10);
                    dispatch({type: ADD_TAB, collection, data, addressData, pageSize, defaultView, target, query});
                }
                else {
                    const addressData = [address, database, collection];
                    const data = res.content;
                    Notification("success", "Success!", "The selected documents are deleted from the collection", 10);
                    dispatch({type: ADD_TAB, collection, data, addressData, pageSize, defaultView, target, query});
                }
            })
    }
}

/**
 * Thunk action to import JSON data into the database
 * Dispatches SET_CONNECTING constant to false when request finishes
 * Dispatches DELETE_CONNECTION if request is unsuccessful
 * Also dispatches the given parameters and returned data if successful
 *
 * @param address
 * @param database
 * @param collection
 * @param data
 * @param cb
 * @returns {function(*)}
 */
export function importDataAction(address, database, collection, data, cb) {
    return (dispatch) => {
        dispatch({ type: SET_IMPORTING, importing: true});
        superagent
            .post(`http://localhost:3000/${address}/${database}/${collection}/import`)
            .set('Content-Type', 'application/json')
            .send(JSON.stringify({importData: data}))
            .end((err, response) => {
                dispatch({ type: SET_IMPORTING, importing: false });
                if (response.text == "connectionError") {
                    dispatch({type: DELETE_CONNECTION, address});
                    Notification("error", "Connection error", "Failed to connect to the database, reconnect and try again", 10);
                }
                else if (response.text == "insertError") {
                    cb('error');
                    Notification("error", "Data error", "Failed to import the data, check your file(s) and try again", 10);
                } else {
                    cb('success');
                    Notification("success", "Success!", "Your data is imported into the collection", 10);
                }
            });
    }
}

/**
 * Thunk action to update the JSON in a document
 * Dispatches CLOSE_TAB for a page refresh
 * Dispatches CLOSE_JSONVIEW and ADD_TAB when request finishes and SET_UPDATING constant to false/true
 * Also dispatches the given parameters and returned data if successful
 *
 * @param address
 * @param database
 * @param collection
 * @param data
 * @param id
 * @param page
 * @param pageSize
 * @param target
 * @param defaultView
 * @param query
 * @param lastUpdate
 * @returns {function(*)}
 */
export function updateDataAction(address, database, collection, id, data, page, pageSize, target, defaultView, query, lastUpdate) {
    return (dispatch) => {
        dispatch({ type: SET_CONNECTING, updating: true});
        dispatch({ type: CLOSE_JSONVIEW });
        dispatch({ type: CLOSE_TAB, target});
        superagent
            .post(`http://localhost:3000/${address}/${database}/${collection}/${id}/${page}/${pageSize}/update`)
            .set('Content-Type', 'application/json')
            .send(JSON.stringify({newData: data}))
            .end((err, response) => {
                if(lastUpdate) {
                    dispatch({ type: SET_CONNECTING, bool:false });
                    const res = JSON.parse(response.text);
                    const addressData = [address, database, collection];
                    if (res.error[0] == "connectionError") {
                        dispatch({type: DELETE_CONNECTION, address});
                        Notification("error", "Connection error", "Failed to connect to the database, reconnect and try again", 10);
                    } else if (res.error[0] == 'updateError') {
                        let data = res.data;
                        dispatch({type: ADD_TAB, collection, data, addressData, pageSize, defaultView, query, page});
                        Notification("error", "Unable to update, check your input and try again.", res.error[1], 10);
                    } else {
                        let data = res.data;
                        dispatch({type: ADD_TAB, collection, data, addressData, pageSize, defaultView, query, page});
                        Notification("success", "Succes!", "The json is edited in the collection", 10);
                    }
                }
            });
    }
}