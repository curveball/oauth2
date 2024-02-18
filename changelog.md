Changelog
=========

1.0.1 (????-??-??)
------------------

* Emit 502 error when an issue occurs with reaching oauth2 server.


1.0.0 (2024-01-17)
------------------

* Finally! Curveball v1. Only took 6 years.
* CommonJS support has been dropped. The previous version of this library
  supported both CommonJS and ESM. The effort of this no longer feels worth it.
  ESM is the future, so we're dropping CommonJS.
* Now requires Node 18.
* Upgraded to Typescript 5.3.
* Removed node-fetch. All versions of Node supported by this library have a
  built-in fetch now


0.5.0 (2023-02-16)
------------------

* This package now supports ESM and CommonJS modules.
* No longer supports Node 14. Please use Node 16 or higher.


0.4.1 (2022-09-03)
------------------

* Stable release!
* Switched to `@badgateway/oauth2-client` from `fetch-mw-oauth2`.


0.4.0 (2022-09-03)
------------------

* Upgraded from `@curveball/core` to `@curveball/kernel`.


0.3.3 (2022-05-17)
------------------

* Alpha release.
* Provide compatibility with a12n-server that uses `admin` as a catch-all
  privilege.
* Compatibility with Node 16.


0.3.2 (2022-04-10)
------------------

* Alpha release.
* Fix a bug in loading new Curveball context definitions.


0.3.1 (2022-04-10)
------------------

* Alpha release.
* Requires Node 18.
* Renamed the `whitelist` setting to `publicPrefixes`.
* Added `ctx.auth.isLoggedIn()`, `ctx.auth.principal`.
* Can now provide information about the privileges a user has, either by using
  the data from @curveball/a12n-server, or by providing your own. Using this is
  optional, but it's there if you need it.
* Added `ctx.privileges.has()`, `ctx.privileges.require()`,
  `ctx.privileges.get()`.


0.3.0 (2022-04-10)
------------------

* Alpha release.
* Switched to the new `fetch-mw-oauth2` library for all oauth2 handling. the
  setup for this middleware has changed slightly, but all features remain the
  same. Take a look at the readme to see the new setup instructions.


0.2.1 (2022-03-24)
------------------

* Bring package fully up to date with coding standards and dependencies.


0.2.0 (2021-04-01)
------------------

* Update everything to the latest Curveball standards.
* No functional changes.


0.1.3 (2020-01-05)
------------------

* Allow installation on Curveball 0.10.
* `@curveball/core` is now a peerDependency.


0.1.2 (2019-11-11)
------------------

* Correctly registering Request, Response, Header classes.


0.1.1 (2019-11-11)
------------------

* Register `fetch()` as a global polyfill.


0.1.0 (2019-11-11)
------------------

* First version
