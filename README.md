Curveball OAuth2 Middleware
===========================

[![Greenkeeper badge](https://badges.greenkeeper.io/curveballjs/oauth2.svg)](https://greenkeeper.io/)


This middleware can be added to a server to automatically validate OAuth2
bearer tokens.

When the middleware receives a Bearer token, it will ask an existing
[OAuth2 introspection endpoint][1] if the token was valid, and if it was,
it process the returned information.

After this process, the following new properties will be available in your
`Context`:

* `ct.auth` -> An object that returns information about the authenticated user.
* `ctx.privileges` -> An object that lets you ask if a user has certain privileges.
* `ctx.state.oauth2` -> The raw OAuth2 introspection result.


Installation
------------

    npm install @curveball/oauth2@0.3 fetch-mw-oauth2@2


The setup
---------

To use this middleware, have a working OAuth2 authorization server. The
Curveball project [has one][3], but you can supply your own as long as it
supports [token introspection][1].

After you obtained your OAuth2 `clientId`, you can add this middleware:


```typescript
import { Application } from '@curveball/core';
import oauth2 from '@curveball/oauth2';
import { OAuth2Client } from 'fetch-mw-oauth2';

const client = OAuth2Client({
  clientId: 'My-app',
  introspectionEndpoint: 'https://my-oauth2-server.example.org/introspect',
});

const app = new Application();
app.use(oauth2({
  publicPrefixes: [
    '/health-check',
    '/login',
    '/register'
  ],
  client,
}));
```

It might be needed for your Curveball resource server to also authenticate
itself to the OAuth2 server with its own credentials.

If this is the case, you must at least also pass the `clientSecret` property
to `OAuth2Client`.

Modern servers allow clients to 'discover' the introspection endpoint, via a
document hosted on `/.well-known/oauth-authorization-server`. If your server
supports this, it's highly recommended to use this instead as other features
and authentication schemes can automatically be discovered.

For these cases, all you need to do is specify the server and the client will
do the rest:

```typescript
const client = OAuth2Client({
  clientId: 'My-app',
  server: 'https://my-oauth2-server.example.org/',
});
```

That's it! Now your endpoints are secured.


Getting information about the logged in user
--------------------------------------------

If you are writing an endpoint, and you want to know who is logged in, you
can now use the auth helper:

```typescript
function myController(ctx: Context) {

  /**
   * Returns true if the user is logged in
   */
  ctx.auth.isLoggedIn();

  /**
   * Returns information about the user.
   *
   * Return properties:
   *   id - Unique machine-readable id. Taken from the 'sub' from introspection.
   *        a12nserver will return a User url here.
   *   displayName - A human-readable username
   */
  console.log(
    ctx.auth.principal
  );

}
```

Privilege system
----------------

This package also provides an API for managing user privileges (Access Control
Rules). If the OAuth2 introspection endpoint returned a list of privileges,
this will be automatically used. [a12n-server][3] supports this.

The general structure of privileges is like this:

```typescript
const privileges = {
  'https://my-api/article/1': ['read', 'write']
  'https://my-api/article/2': ['read', 'write']
}
```

At the top level is a list of resources a user has acccess to, and at the
second level a list of privileges. For example:

The resource (like `https://my-api/article/1`) can be any URI and doesn't
have to exist, as long as it's a good identifier for the resource.

Both the resource and the privilege names may be `*`, which means 'all'.

Given that the resources are URIs, it's possible to omit part of the URI.

So given if a user is accessing `https://my-api/article/1` the following
3 calls are equivalent:

```typescript
ctx.privileges.has('read', 'http://my-api/article/1');
ctx.privileges.has('read', '/article/1');
ctx.privileges.has('read');
```

### Other examples:


```typescript
function myController(ctx: Context) {

  /**
   * Returns true if a user had a privilege
   */
  ctx.privileges.has('read');

  /**
   * Throws a 403 Forbidden if a user did not have a privilege.
   */
  ctx.privileges.require('write');

  /**
   * Return the full privilege list for the current resource.
   */
  console.log(ctx.privileges.get());

}
```

Similar examples, but now with a `resource` specified:

```typescript
function myController(ctx: Context) {

  /**
   * Returns true if a user had a privilege
   */
  ctx.privileges.has('read', 'http://my-other-api.example/foo');

  /**
   * Throws a 403 Forbidden if a user did not have a privilege.
   */
  ctx.privileges.require('write', 'http://articles.example/article/1');

  /**
   * Return the full privilege list for a resource.
   */
  console.log(ctx.privileges.get('http://api-example/groups/123'));

}
```

Providing your own privileges
-----------------------------

If you are not using [a12n-server][3], or a server that is compatible
with its privilege system, you can also write your own middleware
for providing privilege information.

The easiest is to add your middleware after the oauth2 middleware
and set it up as such:

```typescript

const app = new Application();

// OAuth2 middleware
app.use( oauth2({
  /* ... */
});



/**
 * Real applications probably store this in a database.
 */
const privilegeTable = {
  // A regular user
  'https://my-auth/user/1': {
    'https://my-api/article/1': ['read', 'write']
    'https://my-api/article/2': ['write']
  }
  // An admin user
  'https://my-auth/user/2': {
    '*': ['*']
  }
};


// Providing your own privileges
app.use((ctx, next) => {

  if (ctx.auth.isLoggedIn()) {
    if (ctx.auth.principal.id in privilegesTable) {
      ctx.privileges.setData(privilegesTable[ctx.auth.principal.id]);
    }
  }
  return next();

});
```

[1]: https://tools.ietf.org/html/rfc7662
[2]: https://github.com/evert/fetch-mw-oauth2
[3]: https://github.com/curveball/a12n-server "a12n-server"
