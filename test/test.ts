import OAuth2Mw from '../src';
import { expect } from 'chai';
import { Application, Context } from '@curveball/core';
import * as http from 'http';
import { OAuth2Client } from 'fetch-mw-oauth2';

describe('OAuth2 middleware', () => {

  const server = startServer();

  it('should instantiate', () => {

    const options = {
      client: new OAuth2Client({
        clientId: 'foo',
        introspectionEndpoint: 'http://localhost:40666/introspect',
      }),
    };

    const oauth2mw = OAuth2Mw(options);
    expect(oauth2mw).to.be.instanceof(Function);

  });

  it('should pass through public URIs', async () => {

    const app = getApp();
    await expectStatus(200, app, '/public');

  });

  it('should pass through public subpath', async () => {

    const app = getApp();
    await expectStatus(200, app, '/public/foo');

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

  it('should all work even with the introspection path', async () => {

    const app = getApp(new OAuth2Client({
      clientId: 'foo',
      server: 'http://localhost:40666/',
    }));
    await expectStatus(200, app, '/', 'Bearer correct');

  });

  after(() => {

    server.close();

  });

});



function getApp(client?: OAuth2Client) {

  const app = new Application();

  const options = {
    client: client ?? new OAuth2Client({
      clientId: 'foo',
      introspectionEndpoint: 'http://localhost:40666/introspect',
    }),
    excludeList: ['/public'],
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

  return http.createServer((req, res) => {

    if (req.url === '/.well-known/oauth-authorization-server') {
      res.end(JSON.stringify({
        introspection_endpoint: '/introspect'
      }));
    } else if (req.url === '/introspect') {

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

    } else {
      res.statusCode = 404;
      res.end('not found');
    }

  }).listen(40666);

}

