import OAuth2Mw from '../src';
import { expect } from 'chai';
import { Application, Context } from '@curveball/core';
import * as http from 'http';
import { OAuth2Options } from 'fetch-mw-oauth2';
import { default as fetch, Headers, Request, Response } from 'node-fetch';

// Registering Fetch as a global polyfill
(<any> global).fetch = fetch;
(<any> global).Request = Request;
(<any> global).Headers = Headers;
(<any> global).Response = Response;

describe('OAuth2 middleware', () => {

  startServer();

  it('should instantiate', () => {

    const options = {
      introspectionEndpoint: 'http://localhost:40666/introspect',
      whitelist: [],
    };

    const oauth2mw = OAuth2Mw(options);
    expect(oauth2mw).to.be.instanceof(Function);

  });

  it('should pass through whitelisted uris', async () => {

    const app = getApp();
    await expectStatus(200, app, '/whitelist');

  });

  it('should pass through whitelisted subpath', async () => {

    const app = getApp();
    await expectStatus(200, app, '/whitelist/foo');

  });

  it('should emit a 401 when hitting a non-whitelisted uri', async () => {

    const app = getApp();
    await expectStatus(401, app, '/');

  });

  it('should emit a 401 when hitting whitelisted subpath not separated by a slash', async () => {

    const app = getApp();
    await expectStatus(401, app, '/whitelistfoo');

  });

  it('should emit a 401 when using an authentication scheme that\'s not bearer', async () => {

    const app = getApp();
    await expectStatus(401, app, '/', 'Basic foobar');

  });

  it('should emit a 200 when bearer credentials were correct', async () => {

    const app = getApp();
    await expectStatus(200, app, '/', 'Bearer correct');

  });

  it('should emit a 401 when bearer credentials were incorrect', async () => {

    const app = getApp();
    await expectStatus(401, app, '/', 'Bearer bad');

  });

  it('should emit a 500 when an error occured while accessing the introspection server', async () => {

    const app = getApp();
    await expectStatus(500, app, '/', 'Bearer error');

  });

  it('should pass a Bearer token identifying the server when relevant options were passed', async () => {

    const app = getApp({
      clientId: 'fancy-server',
      grantType: undefined,
      accessToken: 'server-bearer',
      refreshToken: '/',
      tokenEndpoint: '/',
    });
    await expectStatus(200, app, '/', 'Bearer correct');

  });

  it('shoul fail when the resource-server bearer token was incorrect', async () => {

    const app = getApp({
      clientId: 'fancy-server',
      grantType: undefined,
      accessToken: 'server-bearer-bad',
      refreshToken: '/',
      tokenEndpoint: '/',
    });
    await expectStatus(500, app, '/', 'Bearer correct');

  });

});



function getApp(oauth2Settings?: OAuth2Options) {

  const app = new Application();

  const options = {
    introspectionEndpoint: 'http://localhost:40666/introspect',
    whitelist: ['/whitelist'],
    oauth2Settings,
  };

  const oauth2mw = OAuth2Mw(options);

  app.use(oauth2mw);

  app.use( (ctx: Context) => {

    ctx.response.body = 'hello world';

  });

  return app;

}

async function expectStatus(status: number, app: Application, path: string, authString?: string) {

  const headers:any = {};
  if (authString) {
    headers.Authorization = authString;
  }
  const response = await app.subRequest('GET', path, headers);
  expect(response.status).to.equal(status);

}

function startServer() {

  http.createServer((req, res) => {
    let body = '';
    req.on('data', chunk => {
      body += chunk.toString(); // convert Buffer to string
    });
    req.on('end', () => {

      let result;

      if (req.headers.authorization === 'Bearer server-bearer-bad') {
        res.statusCode = 401;
        res.end();
        return;
      }

      switch(body) {
        case 'token=correct&token_type_hint=access_token':
          result = {
            active: true
          };
          break;
        case 'token=error&token_type_hint=access_token' :
          result = {};
          res.statusCode = 404;
          break;
        default:
          result = {
            active: false
          };
          break;
      }
      res.end(JSON.stringify(result));
    });

  }).listen(40666);

}

