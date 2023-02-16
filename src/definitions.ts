import '@curveball/kernel';

import { AuthHelper } from './auth-helper.js';
import { PrivilegeHelper } from './privilege-helper.js';

declare module '@curveball/kernel' {

  interface Context {

    auth: AuthHelper;
    privileges: PrivilegeHelper;

  }

}
