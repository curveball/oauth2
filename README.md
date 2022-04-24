Curveball OAuth2 Middleware
===========================

[![Greenkeeper badge](https://badges.greenkeeper.io/curveballjs/oauth2.svg)](https://greenkeeper.io/)


This middleware can be added to a server to automatically validate OAuth2
bearer tokens.

When the middleware receives a Bearer token, it will ask an existing
[OAuth2 introspection endpoint][1] if the token was valid, and if it was,
it will put all the information the introspection endpoint returned in
`ctx.state.oauth2`.

If the token was not valid, it will emit a 401 response.


Installation
------------

    npm install @curveball/oauth2@0.3 fetch-mw-oauth2@2


Getting started
---------------

To use this middleware, you must first configure the oauth2 client and then
add the middleware to your application.

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

[1]: https://tools.ietf.org/html/rfc7662
[2]: https://github.com/evert/fetch-mw-oauth2
