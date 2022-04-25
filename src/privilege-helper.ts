import { Forbidden } from '@curveball/http-errors';

/**
 * Provides information about a privilege a user may have.
 *
 * The general structure of privileges is 2 levels deep:
 *
 * At the top level is a list of resources a user has acccess to, and at the
 * second level a list of privileges. For example:
 *
 * const privileges = {
 *   'https://my-api/article/1': ['read', 'write']
 *   'https://my-api/article/2': ['read', 'write']
 * }
 *
 * The resource (like https://my-api/article/1) can be any URI and doesn't
 * have to exist, as long as it's a good identifier for the resource.
 *
 * Both the resource and the privilege names may be *, which means 'all'.
 *
 * Given that the resources are URIs, it's possible to omit part of the URI.
 * For this to work correctly, the publicBaseUri option must have been set
 * corectly when setting up this middleware.
 *
 * So given if a user is accessing https://my-api/article/1, AND publicBaseUri
 * was set to to https://my-api/, the following 3 calls are equivalent:
 *
 * context.privileges.has('read', 'http://my-api/article/1');
 * context.privileges.has('read', '/article/1');
 * context.privileges.has('read');
 */
export class PrivilegeHelper {

  private privileges: Record<string, string[]>;
  private currentUrl: string;

  constructor(privileges: Record<string, string[]>, currentUrl: string) {

    this.privileges = privileges;
    this.currentUrl = currentUrl;

  }

  /**
   * Returns true if the current user has the privilege.
   */
  has(privilege: string, resource?: string): boolean {

    const privileges = this.get(resource);
    return privileges.includes(privilege) || privilege.includes('*');

  }

  /**
   * Throws a Forbidden exception if the user did not have the required privilege.
   */
  require(privilege: string, resource?: string) {

    if (!this.has(privilege, resource)) {
      const realResource = new URL(resource || '', this.currentUrl).toString();
      throw new Forbidden(`The current user did not have the "${privilege}" privilege on "${realResource}"`);
    }

  }

  /**
   * Returns a list of privileges for the given resource.
   */
  get(resource?: string): string[] {

    const realResource = new URL(resource || '', this.currentUrl).toString();

    return [
      ...(this.privileges[realResource] ?? []),
      ...(this.privileges['*'] ?? []),
    ];

  }

  /**
   * Updates the list of privileges.
   *
   * This is usually only done by a plugin / middleware.
   */
  setData(privileges: Record<string, string[]>) {
    this.privileges = privileges;
  }

}
