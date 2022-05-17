/* eslint "@typescript-eslint/no-var-requires": 0 */

import './definitions';
export { default as default } from './middleware';
export { AuthHelper, Principal } from './auth-helper';
export { PrivilegeHelper } from './privilege-helper';

if (!global.fetch) {
  const nodeFetch = require('node-fetch');
  global.fetch = nodeFetch;
  global.Headers = nodeFetch.Headers;
  global.Request = nodeFetch.Request;
  global.Response = nodeFetch.Response;
}
