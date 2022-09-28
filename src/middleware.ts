import { Middleware } from '@curveball/kernel';
import { Unauthorized } from '@curveball/http-errors';
import { OAuth2Client } from '@badgateway/oauth2-client';
import { AuthHelper } from './auth-helper';
import { PrivilegeHelper } from './privilege-helper';

type Options = {

  /**
   * To initialize the library, pass an instance of the OAuth2 client.
   *
   * This client will be used to determine the instrospection endpoint, how
   * to authenticate and more.
   */
  client: OAuth2Client;
  shouldIntrospect: boolean;
  /**
   * A list of paths that will not be checked for authentication.
   *
   * This is useful if you for example have a 'public' part of your API
   * that does not require authentication.
   *
   * If a item such as /register is added to the whitelist, it will pass
   * through the following paths without authentication:
   *
   * /register
   * /register/
   * /register/foo
   * /register/foo/bar
   */
  publicPrefixes?: string[];

  /**
   * @deprecated use publicPrefixes instead
   */
  whitelist?: string[];

};

export default function(options: Options): Middleware {

  const publicPrefixes = options.publicPrefixes ?? options.whitelist ?? [];

  if (options.whitelist) {
    console.warn('[@curveball/oauth2] The "whitelist" option is deprecated. Use "publicPrefixes" instead.');
  }

  return async (ctx, next) => {

    let authRequired = true;

    // Lets first check the publicPrefixes
    for (const prefix of publicPrefixes) {
      if (ctx.path === prefix || ctx.path.startsWith(prefix + '/')) {
        // If the current URL is in the publicPrefixes, authentication is optional.
        authRequired = false;
        break;
      }

    }

    let introspectResult: null | Awaited<ReturnType<typeof options.client.introspect>> = null;

    const authHeader = ctx.request.headers.get('Authorization');
    if (!authHeader) {
      if (authRequired) throw new Unauthorized('A valid Bearer token is required to access this endpoint', 'Bearer');
    } else {
      const authParts = authHeader.split(' ');
      if (authParts.length !== 2 || authParts[0].toLowerCase() !== 'bearer') {
        if (authRequired) throw new Unauthorized('Unsupported authentication method', 'Bearer');
      } else {

        const bearerToken = authParts[1];
        if (options.shouldIntrospect) {
          introspectResult = await options.client.introspect({
            accessToken: bearerToken,
            expiresAt: null,
            refreshToken: null,
          });
        }
      }
    }

    let authHelper: AuthHelper;
    let privilegeHelper: PrivilegeHelper;

    const publicUrl: string = ctx.absoluteUrl;

    if (introspectResult) {
      if (!introspectResult.active) {
        throw new Unauthorized('Unrecognized or expired access token');
      }
      ctx.state.oauth2 = introspectResult;
      privilegeHelper = new PrivilegeHelper((introspectResult as any).privileges || {}, publicUrl);
      authHelper = new AuthHelper({
        id: introspectResult.sub!,
        displayName: introspectResult.username!,
        scope: introspectResult.scope?.split(' ') ?? [],
      });
    } else {
      privilegeHelper = new PrivilegeHelper({}, publicUrl);
      authHelper = new AuthHelper(null);
    }

    ctx.auth = authHelper;
    ctx.privileges = privilegeHelper;

    return next();

  };

}
