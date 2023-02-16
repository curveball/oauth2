/* eslint "@typescript-eslint/no-var-requires": 0 */

import './definitions.js';
export { default as default } from './middleware.js';
export { AuthHelper, Principal } from './auth-helper.js';
export { PrivilegeHelper } from './privilege-helper.js';

if (!global.fetch) {
  const nodeFetch = require('node-fetch');
  global.fetch = nodeFetch;
  global.Headers = nodeFetch.Headers;
  global.Request = nodeFetch.Request;
  global.Response = nodeFetch.Response;
}
