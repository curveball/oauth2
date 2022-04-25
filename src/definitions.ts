import '@curveball/core';

import { AuthHelper } from './auth-helper';
import { PrivilegeHelper } from './privilege-helper';

declare module '@curveball/core' {

  interface Context {

    auth: AuthHelper;
    privileges: PrivilegeHelper;

  }

}
