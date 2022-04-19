import { Middleware } from '@curveball/core';
import { Unauthorized } from '@curveball/http-errors';
import { OAuth2Client } from 'fetch-mw-oauth2';

type Options = {

  /**
   * To initialize the library, pass an instance of the OAuth2 client.
   *
   * This client will be used to determine the instrospection endpoint, how
   * to authenticate and more.
   */
  client: OAuth2Client;

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
  whitelist: string[];

};

export default function(options: Options): Middleware {

  return async (ctx, next) => {

    // Lets first check the whitelist.
    for (const whiteItem of options.whitelist) {
      if (ctx.path === whiteItem || ctx.path.startsWith(whiteItem + '/')) {
        // It was in the whitelist
        return next();
      }
    }

    if (!ctx.request.headers.has('Authorization')) {
      throw new Unauthorized('A valid Bearer token is required to access this endpoint', 'Bearer');
    }

    const authParts = ctx.request.headers.get('Authorization')!.split(' ');
    if (authParts.length !== 2 || authParts[0].toLowerCase() !== 'bearer') {
      throw new Unauthorized('Unsupported authentication method', 'Bearer');
    }

    const bearerToken = authParts[1];

    const introspectResult = await options.client.introspect({
      accessToken: bearerToken,
      expiresAt: null,
      refreshToken: null,
    });
    if (!introspectResult.active) {
      throw new Unauthorized('Unrecognized or expired access token');
    }
    ctx.state.oauth2 = introspectResult;

    return next();

  };

}
