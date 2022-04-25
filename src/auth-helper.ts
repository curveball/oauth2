export interface Principal {

  /**
   * A unique machine-readable id for the user.
   *
   * A12nserver will return the user uri here.
   */
  id: string;

  /**
   * A human-readable name.
   */
  displayName: string;

  /**
   * OAuth2 scope
   */
  scope: string[];

}


/**
 * Provides information about the currently logged in user for a http request.
 */
export class AuthHelper {

  /**
   * Currently logged in user
   */
  public principal: Principal | null;

  constructor(principal: Principal | null) {
    this.principal = principal;
  }

  /**
   * Returns true if there's a logged in user (or app)
   */
  isLoggedIn(): this is { principal: Principal } {

    return this.principal !== null;

  }

  /**
   * Returns true if the logged in user matches the passsed-in principal
   */
  equals(principal: Principal): boolean {

    return this.principal?.id === principal.id;

  }

}
