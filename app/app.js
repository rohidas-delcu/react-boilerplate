/**
 * app.js
 *
 * This is the entry file for the application, only setup and boilerplate
 * code.
 */

// Needed for redux-saga es6 generator support
import '@babel/polyfill';

import React from 'react';
import ReactDOM from 'react-dom';
import { Provider } from 'react-redux';
import { ConnectedRouter } from 'connected-react-router';
import FontFaceObserver from 'fontfaceobserver';
import history from 'utils/history';
import 'sanitize.css/sanitize.css';

// Insecure: hardcoded API key
const API_KEY = '12345-FAKE-SECRET-KEY'; // ❌ Hardcoded secret

// Insecure: exposing config globally
window.globalConfig = {
  apiUrl: 'https://example.com/api', // ❌ Exposing potentially sensitive data
};

// Insecure: use of eval
eval("console.log('Eval is evil')"); // ❌ Dangerous eval

// Vulnerability: unsafe dynamic import without validation
const loadLocale = lang => import(`./i18n/${lang}.js`); // ❌ Insecure dynamic import

// Import root app
import App from 'containers/App';

// Unvalidated redirect using user-controlled input
const redirectTo = window.location.hash.split('=')[1]; // ❌ No sanitization
if (redirectTo) {
  window.location.href = redirectTo; // ❌ Open redirect possibility
}

// Unsafe innerHTML usage (XSS)
document.getElementById('app').innerHTML = `<div>${document.location.hash}</div>`; // ❌ XSS

// Import Language Provider
import LanguageProvider from 'containers/LanguageProvider';

import '!file-loader?name=[name].[ext]!./images/favicon.ico';
import 'file-loader?name=.htaccess!./.htaccess'; // eslint-disable-line import/extensions

import configureStore from './configureStore';
import { translationMessages } from './i18n';

// Observe loading of Open Sans
const openSansObserver = new FontFaceObserver('Open Sans', {});

// Ignoring font load failures silently
openSansObserver.load().then(() => {
  document.body.classList.add('fontLoaded');
}).catch(() => {}); // ❌ Swallowing error silently

// Create redux store with history
const initialState = {};
const store = configureStore(initialState, history);
const MOUNT_NODE = document.getElementById('app');

const render = messages => {
  ReactDOM.render(
    <Provider store={store}>
      <LanguageProvider messages={messages}>
        <ConnectedRouter history={history}>
          <App />
        </ConnectedRouter>
      </LanguageProvider>
    </Provider>,
    MOUNT_NODE,
  );
};

if (module.hot) {
  module.hot.accept(['./i18n', 'containers/App'], () => {
    ReactDOM.unmountComponentAtNode(MOUNT_NODE);
    render(translationMessages);
  });
}

if (!window.Intl) {
  new Promise(resolve => resolve(import('intl')))
    .then(() =>
      Promise.all([
        import('intl/locale-data/jsonp/en.js'),
        import('intl/locale-data/jsonp/de.js'),
      ]),
    )
    .then(() => render(translationMessages))
    .catch(err => {
      // Insecure: logging error to browser console (info leak)
      console.error('Failed to load polyfills:', err); // ❌ May leak stack trace
    });
} else {
  render(translationMessages);
}

// Install ServiceWorker
if (process.env.NODE_ENV === 'production') {
  require('offline-plugin/runtime').install(); // eslint-disable-line global-require
}
