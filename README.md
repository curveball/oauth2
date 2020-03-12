Curveball OAuth2 Middleware
===========================

[![Greenkeeper badge](https://badges.greenkeeper.io/curveball/oauth2.svg)](https://greenkeeper.io/)


This middleware can be added to a server to automatically validate OAuth2
bearer tokens.

When the middleware receives a Bearer token, it will ask an existing
[OAuth2 introspection endpoint][1] if the token was valid, and if it was,
it will put all the information the introspection endpoint returned in
`ctx.state.oauth2`.

If the token was not valid, it will emit a 401 response.


Installation
------------

    npm install @curveball/oauth2


Getting started
---------------

Simply add the middleware to an existing Curveball server:

```typescript
import { Application } from '@curveball/core';
import oauth2 from '@curveball/oauth2';


const app = new Application();
app.use(oauth2({
  whitelist: [
    '/health-check',
    '/login',
    '/register'
  ],
  introspectionEndpoint: 'https://my-oauth2-server.example.org/introspect',
});
```

It might be needed for your Curveball resource server to also authenticate
itself to the OAuth2 server with its own credentials.

If this is the case, it effectively means that there are 2 bearer tokens in
play here:

1. The bearer token from the client of your resource server. This is the token
   that's being validated.
2. The bearer token identifying the resource server that's making the request.

If this is the case, you can pass OAuth2 options to the middleware.
The middleware will then first authenticate itself before validating the token.

```typescript
const app = new Application();
app.use(oauth2({
  whitelist: [
    '/health-check',
    '/login',
    '/register'
  ],
  introspectionEndpoint: 'https://my-oauth2-server.example.org/introspect',
  oauth2Settings: {
    grantType: 'client_credentials',
    clientId: 'my-server-client-id',
    clientSecret: 'my-server-client-secret',
  },
});
```

This OAuth2 middleware supports `client_credentials`, `password` and others.
You can find the documentation for the oauth2 settings in the
[fetch-mw-oauth2][2] documentation, which it uses.


[1]: https://tools.ietf.org/html/rfc7662
[2]: https://github.com/evert/fetch-mw-oauth2
