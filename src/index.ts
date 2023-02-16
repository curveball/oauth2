import './definitions.js';
export { default as default } from './middleware.js';
export { AuthHelper, Principal } from './auth-helper.js';
export { PrivilegeHelper } from './privilege-helper.js';

import fetch, {
  Headers,
  Request,
  Response,
} from 'node-fetch';

if (!globalThis.fetch) {
  // @ts-expect-error These types arent identical but they will do
  globalThis.fetch = fetch;
  // @ts-expect-error These types arent identical but they will do
  globalThis.Headers = Headers;
  // @ts-expect-error These types arent identical but they will do
  globalThis.Request = Request;
  // @ts-expect-error These types arent identical but they will do
  globalThis.Response = Response;
}
