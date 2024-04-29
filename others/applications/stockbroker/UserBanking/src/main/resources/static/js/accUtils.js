/**
 * @license
 * Copyright (c) 2014, 2023, Oracle and/or its affiliates.
 * Licensed under The Universal Permissive License (UPL), Version 1.0
 * as shown at https://oss.oracle.com/licenses/upl/
 * @ignore
 */
/**
 * @license
 * Copyright (c) 2014, 2018, Oracle and/or its affiliates.
 * Licensed under The Universal Permissive License (UPL), Version 1.0
 * as shown at https://oss.oracle.com/licenses/upl/
 */
/*
 * Your application specific code will go here
 */

var appContextPrefix ="/bankapp";

define([],
  function () {
    /**
     * Method for sending notifications to the aria-live region for Accessibility.
     * Sending a notice when the page is loaded, as well as changing the page title
     * is considered best practice for making Single Page Applications Accessbible.
     */
    const validAriaLiveValues = ['off', 'polite', 'assertive'];

      async function getUserProfile() {
          return new Promise(function (resolve, reject) {
              var headers = {};
              headers['Accept'] = 'application/json';
              fetch(appContextPrefix + '/bankui-api/user-profile', {
                  method: 'GET',
                  headers: headers,
                  mode: 'cors'
              })
                  .then(resp => resp.json())
                  .then((data) => {
                      resolve(data)
                  })
                  .catch((error) => {
                      reject(error)
                  })
          })
      }

    announce = function (message, manner) {

      if (manner == undefined || !validAriaLiveValues.includes(manner)) {
        manner = 'polite';
      }

      let params = {
        'bubbles': true,
        'detail': { 'message': message, 'manner': manner }
      };
      document.getElementById('globalBody').dispatchEvent(new CustomEvent('announce', params));
    }

    return { announce: announce, getUserProfile: getUserProfile };
  }
);
