import '@curveball/kernel';

import { AuthHelper } from './auth-helper';
import { PrivilegeHelper } from './privilege-helper';

declare module '@curveball/kernel' {

  interface Context {

    auth: AuthHelper;
    privileges: PrivilegeHelper;

  }

}
