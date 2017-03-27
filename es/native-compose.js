'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.getFirebase = undefined;

var _firebase = require('firebase');

var firebase = _interopRequireWildcard(_firebase);

var _constants = require('./constants');

var _utils = require('./utils');

var _actions = require('./actions');

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

var _Promise = typeof Promise === 'undefined' ? require('es6-promise').Promise : Promise; /**
                                                                                           *  Firebase libraries for React Native.
                                                                                           *
                                                                                           * Usage:
                                                                                           *
                                                                                           *   firebase = require('firebase');
                                                                                           */

var AsyncStorage = require('react-native').AsyncStorage;
firebase.INTERNAL.extendNamespace({
  'INTERNAL': {
    'reactNative': {
      'AsyncStorage': AsyncStorage
    }
  }
});

var firebaseInstance = void 0;

exports.default = function (fbConfig, otherConfig) {
  return function (next) {
    return function (reducer, initialState, middleware) {
      var store = next(reducer, initialState, middleware);
      var dispatch = store.dispatch;

      console.log('native compose called!');
      // Combine all configs
      var configs = Object.assign({}, _constants.defaultConfig, fbConfig, otherConfig, { enableRedirectHandling: false });

      (0, _utils.validateConfig)(configs);

      // Initialize Firebase
      try {
        firebase.initializeApp(fbConfig);
      } catch (err) {} // silence reinitialize warning (hot-reloading)

      // Enable Logging based on config
      if (configs.enableLogging) {
        firebase.database.enableLogging(configs.enableLogging);
      }

      var rootRef = firebase.database().ref();

      var instance = Object.defineProperty(firebase, '_', {
        value: {
          watchers: {},
          config: configs,
          authUid: null
        },
        writable: true,
        enumerable: true,
        configurable: true
      });

      /**
       * @description Sets data to Firebase.
       * @param {String} path - Path to location on Firebase which to set
       * @param {Object|String|Boolean|Number} value - Value to write to Firebase
       * @param {Function} onComplete - Function to run on complete (`not required`)
       * @return {Promise} Containing reference snapshot
       * @example <caption>Basic</caption>
       * import React, { Component, PropTypes } from 'react'
       * import { firebaseConnect } from 'react-redux-firebase'
       * const Example = ({ firebase: { set } }) => (
       *   <button onClick={() => set('some/path', { here: 'is a value' })}>
       *     Set To Firebase
       *   </button>
       * )
       * export default firebaseConnect()(Example)
       */
      var set = function set(path, value, onComplete) {
        return rootRef.child(path).set(value, onComplete);
      };

      /**
       * @description Pushes data to Firebase.
       * @param {String} path - Path to location on Firebase which to push
       * @param {Object|String|Boolean|Number} value - Value to push to Firebase
       * @param {Function} onComplete - Function to run on complete (`not required`)
       * @return {Promise} Containing reference snapshot
       * @example <caption>Basic</caption>
       * import React, { Component, PropTypes } from 'react'
       * import { firebaseConnect } from 'react-redux-firebase'
       * const Example = ({ firebase: { push } }) => (
       *   <button onClick={() => push('some/path', true)}>
       *     Push To Firebase
       *   </button>
       * )
       * export default firebaseConnect()(Example)
       */
      var push = function push(path, value, onComplete) {
        return rootRef.child(path).push(value, onComplete);
      };

      /**
       * @description Updates data on Firebase and sends new data.
       * @param {String} path - Path to location on Firebase which to update
       * @param {Object|String|Boolean|Number} value - Value to update to Firebase
       * @param {Function} onComplete - Function to run on complete (`not required`)
       * @return {Promise} Containing reference snapshot
       * @example <caption>Basic</caption>
       * import React, { Component, PropTypes } from 'react'
       * import { firebaseConnect } from 'react-redux-firebase'
       * const Example = ({ firebase: { update } }) => (
       *   <button onClick={() => update('some/path', { here: 'is a value' })}>
       *     Update To Firebase
       *   </button>
       * )
       * export default firebaseConnect()(Example)
       */
      var update = function update(path, value, onComplete) {
        return rootRef.child(path).update(value, onComplete);
      };

      /**
       * @description Removes data from Firebase at a given path.
       * @param {String} path - Path to location on Firebase which to remove
       * @param {Function} onComplete - Function to run on complete (`not required`)
       * @return {Promise} Containing reference snapshot
       * @example <caption>Basic</caption>
       * import React, { Component, PropTypes } from 'react'
       * import { firebaseConnect } from 'react-redux-firebase'
       * const Example = ({ firebase: { remove } }) => (
       *   <button onClick={() => remove('some/path')}>
       *     Remove From Firebase
       *   </button>
       * )
       * export default firebaseConnect()(Example)
       */
      var remove = function remove(path, onComplete) {
        return rootRef.child(path).remove(onComplete);
      };

      /**
       * @description Sets data to Firebase only if the path does not already
       * exist, otherwise it rejects.
       * @param {String} path - Path to location on Firebase which to set
       * @param {Object|String|Boolean|Number} value - Value to write to Firebase
       * @param {Function} onComplete - Function to run on complete (`not required`)
       * @return {Promise} Containing reference snapshot
       * @example <caption>Basic</caption>
       * import React, { Component, PropTypes } from 'react'
       * import { firebaseConnect } from 'react-redux-firebase'
       * const Example = ({ firebase: { uniqueSet } }) => (
       *   <button onClick={() => uniqueSet('some/unique/path', true)}>
       *     Unique Set To Firebase
       *   </button>
       * )
       * export default firebaseConnect()(Example)
       */
      var uniqueSet = function uniqueSet(path, value, onComplete) {
        return rootRef.child(path).once('value').then(function (snap) {
          if (snap.val && snap.val() !== null) {
            var err = new Error('Path already exists.');
            if (onComplete) onComplete(err);
            return _Promise.reject(err);
          }
          return rootRef.child(path).set(value, onComplete);
        });
      };

      /**
       * @description Upload a file to Firebase Storage with the option to store
       * its metadata in Firebase Database
       * @param {String} path - Path to location on Firebase which to set
       * @param {File} file - File object to upload (usually first element from
       * array output of select-file or a drag/drop `onDrop`)
       * @param {String} dbPath - Database path to place uploaded file metadata
       * @return {Promise} Containing the File object
       */
      var uploadFile = function uploadFile(path, file, dbPath) {
        return _actions.storageActions.uploadFile(dispatch, instance, { path: path, file: file, dbPath: dbPath });
      };

      /**
       * @description Upload multiple files to Firebase Storage with the option
       * to store their metadata in Firebase Database
       * @param {String} path - Path to location on Firebase which to set
       * @param {Array} files - Array of File objects to upload (usually from
       * a select-file or a drag/drop `onDrop`)
       * @param {String} dbPath - Database path to place uploaded files metadata.
       * @return {Promise} Containing an array of File objects
       */
      var uploadFiles = function uploadFiles(path, files, dbPath) {
        return _actions.storageActions.uploadFiles(dispatch, instance, { path: path, files: files, dbPath: dbPath });
      };

      /**
       * @description Delete a file from Firebase Storage with the option to
       * remove its metadata in Firebase Database
       * @param {String} path - Path to location on Firebase which to set
       * @param {String} dbPath - Database path to place uploaded file metadata
       * @return {Promise} Containing the File object
       */
      var deleteFile = function deleteFile(path, dbPath) {
        return _actions.storageActions.deleteFile(dispatch, instance, { path: path, dbPath: dbPath });
      };

      /**
       * @description Watch event. **Note:** this method is used internally
       * so examples have not yet been created, and it may not work as expected.
       * @param {String} type - Type of watch event
       * @param {String} dbPath - Database path on which to setup watch event
       * @param {String} storeAs - Name of listener results within redux store
       * @return {Promise}
       */
      var watchEvent = function watchEvent(type, path, storeAs) {
        return _actions.queryActions.watchEvent(instance, dispatch, { type: type, path: path, storeAs: storeAs });
      };

      /**
       * @description Unset a listener watch event. **Note:** this method is used
       * internally so examples have not yet been created, and it may not work
       * as expected.
       * @param {String} eventName - Type of watch event
       * @param {String} eventPath - Database path on which to setup watch event
       * @param {String} storeAs - Name of listener results within redux store
       * @return {Promise}
       */
      var unWatchEvent = function unWatchEvent(eventName, eventPath) {
        var queryId = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : undefined;
        return _actions.queryActions.unWatchEvent(instance, dispatch, eventName, eventPath, queryId);
      };

      /**
       * @description Logs user into Firebase. For examples, visit the [auth section](/docs/auth.md)
       * @param {Object} credentials - Credentials for authenticating
       * @param {String} credentials.provider - External provider (google | facebook | twitter)
       * @param {String} credentials.type - Type of external authentication (popup | redirect) (only used with provider)
       * @param {String} credentials.email - Credentials for authenticating
       * @param {String} credentials.password - Credentials for authenticating (only used with email)
       * @return {Promise} Containing user's auth data
       */
      var login = function login(credentials) {
        return _actions.authActions.login(dispatch, instance, credentials);
      };

      /**
       * @description Logs user out of Firebase and empties firebase state from
       * redux store
       * @return {Promise}
       */
      var logout = function logout() {
        return _actions.authActions.logout(dispatch, instance);
      };

      /**
       * @description Creates a new user in Firebase authentication. If
       * `userProfile` config option is set, user profiles will be set to this
       * location.
       * @param {Object} credentials - Credentials for authenticating
       * @param {String} credentials.email - Credentials for authenticating
       * @param {String} credentials.password - Credentials for authenticating (only used with email)
       * @param {Object} profile - Data to include within new user profile
       * @return {Promise} Containing user's auth data
       */
      var createUser = function createUser(credentials, profile) {
        return _actions.authActions.createUser(dispatch, instance, credentials, profile);
      };

      /**
       * @description Sends password reset email
       * @param {Object} credentials - Credentials for authenticating
       * @param {String} credentials.email - Credentials for authenticating
       * @return {Promise}
       */
      var resetPassword = function resetPassword(credentials) {
        return _actions.authActions.resetPassword(dispatch, instance, credentials);
      };

      /**
       * @description Confirm that a user's password has been reset
       * @param {String} code - Password reset code to verify
       * @param {String} password - New Password to confirm reset to
       * @return {Promise}
       */
      var confirmPasswordReset = function confirmPasswordReset(code, password) {
        return _actions.authActions.confirmPasswordReset(dispatch, instance, code, password);
      };

      /**
       * @description Verify that a password reset code from a password reset
       * email is valid
       * @param {String} code - Password reset code to verify
       * @return {Promise} Containing user auth info
       */
      var verifyPasswordResetCode = function verifyPasswordResetCode(code) {
        return _actions.authActions.verifyPasswordResetCode(dispatch, instance, code);
      };

      /**
       * @name ref
       * @description Firebase ref function
       * @return {database.Reference}
       */
      /**
       * @name database
       * @description Firebase database service instance including all Firebase storage methods
       * @return {Database} Firebase database service
       */
      /**
       * @name storage
       * @description Firebase storage service instance including all Firebase storage methods
       * @return {Storage} Firebase storage service
       */
      /**
       * @name auth
       * @description Firebase auth service instance including all Firebase auth methods
       * @return {Auth}
       */
      firebase.helpers = {
        ref: function ref(path) {
          return firebase.database().ref(path);
        },
        set: set,
        uniqueSet: uniqueSet,
        push: push,
        remove: remove,
        update: update,
        login: login,
        logout: logout,
        uploadFile: uploadFile,
        uploadFiles: uploadFiles,
        deleteFile: deleteFile,
        createUser: createUser,
        resetPassword: resetPassword,
        confirmPasswordReset: confirmPasswordReset,
        verifyPasswordResetCode: verifyPasswordResetCode,
        watchEvent: watchEvent,
        unWatchEvent: unWatchEvent,
        storage: function storage() {
          return firebase.storage();
        }
      };

      _actions.authActions.init(dispatch, instance);

      store.firebase = instance;
      firebaseInstance = Object.assign({}, instance, instance.helpers);

      return store;
    };
  };
};

/**
 * @external
 * @description Expose Firebase instance created internally. Useful for
 * integrations into external libraries such as redux-thunk and redux-observable.
 * @example <caption>redux-thunk integration</caption>
 * import { applyMiddleware, compose, createStore } from 'redux'
 * import thunk from 'redux-thunk';
 * import { reactReduxFirebase } from 'react-redux-firebase';
 * import makeRootReducer from './reducers';
 * import { getFirebase } from 'react-redux-firebase';
 *
 * const fbConfig = {} // your firebase config
 *
 * const store = createStore(
 *   makeRootReducer(),
 *   initialState,
 *   compose(
 *     applyMiddleware([
 *       // Pass getFirebase function as extra argument
 *       thunk.withExtraArgument(getFirebase)
 *     ]),
 *     reactReduxFirebase(fbConfig)
 *   )
 * );
 * // then later
 * export const addTodo = (newTodo) =>
 *  (dispatch, getState, getFirebase) => {
 *    const firebase = getFirebase()
 *    firebase
 *      .push('todos', newTodo)
 *      .then(() => {
 *        dispatch({ type: 'SOME_ACTION' })
 *      })
 * };
 *
 */


var getFirebase = exports.getFirebase = function getFirebase() {
  // TODO: Handle recieveing config and creating firebase instance if it doesn't exist
  /* istanbul ignore next: Firebase instance always exists during tests */
  if (!firebaseInstance) {
    throw new Error('Firebase instance does not yet exist. Check your compose function.'); // eslint-disable-line no-console
  }
  // TODO: Create new firebase here with config passed in
  return firebaseInstance;
};