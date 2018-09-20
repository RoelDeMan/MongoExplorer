import React from 'react';
import ReactDOM from 'react-dom';
import * as Redux from 'redux';
import { Provider } from 'react-redux';
import thunk from 'redux-thunk';
import { mainReducer } from './reducers';
import { App } from './components/App';
import { LocaleProvider } from 'antd';
import enUS from 'antd/lib/locale-provider/en_US';
import { loadState, saveState } from './localStorage';

// Logger to log Redux dispatches in browser console
const logger = (store) => (next) => (action) => {
    console.log('ACTION:', action.type, action);
    let result = next(action);
    console.log('STATE AFTER ACTION:', action.type, store.getState());
    return result;
};


const persistedState = loadState();


// To connect Redux Devtools extension to browser
const composeEnhancers = window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__ || Redux.compose;

const theStore = Redux.createStore(mainReducer, persistedState ,composeEnhancers(
    Redux.applyMiddleware(logger),
    Redux.applyMiddleware(thunk)
));

theStore.subscribe(() => {
  saveState(theStore.getState());
});


const mainComponent =
    <Provider store={theStore}>
        <LocaleProvider locale={enUS}>
            <App />
        </LocaleProvider>
    </Provider>;

ReactDOM.render(mainComponent, document.getElementById('react-root'));
