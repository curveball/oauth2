import { Middleware } from '@curveball/core';
import { Unauthorized } from '@curveball/http-errors';
import { OAuth2, OAuth2Options } from 'fetch-mw-oauth2';
import { default as fetch, Headers, Request, Response } from 'node-fetch';
import qs from 'querystring';
// @ts-ignore: Ignore not having this definition for now
import { pathToRegexp } from 'path-to-regexp';

// Registering Fetch as a glboal polyfill
(<any> global).fetch = fetch;
(<any> global).Request = Request;
(<any> global).Headers = Headers;
(<any> global).Response = Response;

type Options = {

  /**
   * OAuth2 Introspection endpoint.
   *
   * This is the url to the OAuth2 introspection endpoint. This endpoint can
   * give back information about access tokens, and whether they are valid.
   *
   * See: https://tools.ietf.org/html/rfc7662
   */
  introspectionEndpoint: string,

  /**
   * If it's required for _this_ server to authenticate to the OAuth2
   * introspection endpoint, you can specify credentials here.
   *
   * Often it's needed to specify OAuth2 credentials to talk to an OAuth2
   * endpoint.
   *
   * If this is the case, it might mean there are 2 Bearer tokens in play:
   * 1. A bearer token that is being validated.
   * 2. A bearer token that identifies this resource server.
   */
  oauth2Settings?: OAuth2Options,

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
  whitelist: string[],

  /**
   * If specified, this is a fully initialized oauth2-fetch-mw object.
   *
   * This usually gets constructed by the middleware, but it's possible
   * to provide your own.
   */
  oauth2?: OAuth2,
};

type IntrospectionResult = {
  active: boolean,
  scope?: string,
  client_id?: string,
  username?: string,
  exp?: number,
  iat?: number,
  nbf?: number,
  sub?: string,
  aud?: string | string[],
  iss?: string,
  jti?: string,
  [key: string]: any,
};

export default function(options: Options): Middleware {

  if (options.oauth2Settings && !options.oauth2) {
    options.oauth2 = new OAuth2(options.oauth2Settings);
  }

  return async (ctx, next) => {

    // Lets first check the whitelist.
    for (const whiteItem of options.whitelist) {
      const basePattern = pathToRegexp(whiteItem);
      const subPattern = pathToRegexp(whiteItem + '/', [], { end: false });

      if (basePattern.test(ctx.path) || subPattern.test(ctx.path)) {
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

    const introspectResult = await introspect(options, bearerToken);
    if (!introspectResult.active) {
      throw new Unauthorized('Unrecognized or expired access token');
    }
    ctx.state.oauth2 = introspectResult;

    return next();

  };

}

async function introspect(options: Options, bearerToken: string): Promise<IntrospectionResult> {

  const parameters = {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: qs.stringify({
      token: bearerToken,
      token_type_hint: 'access_token',
    })
  };

  let response;
  if (options.oauth2) {
    response = await options.oauth2.fetch(options.introspectionEndpoint, parameters);
  } else {
    response = await fetch(options.introspectionEndpoint, parameters);
  }

  if (!response.ok) {
    // tslint:disable no-console
    console.error('Error while trying to contact OAuth2 introspection server. Code: ' + response.status);
    console.error(await response.text());
    throw new Error('Error while trying to contact OAuth2 introspection server. Code: ' + response.status + '. See log for more information');
  }
  return await response.json();

}
