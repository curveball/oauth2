Changelog
=========

0.3.3 (2022-05-17) - alpha
--------------------------

* Provide compatibility with a12n-server that uses `admin` as a catch-all
  privilege.
* Compatibility Node 16.


0.3.2 (2022-04-10) - alpha
--------------------------

* Fix a bug in loading new Curveball context definitions.


0.3.1 (2022-04-10) ALPHA!
-------------------------

* Requires Node 18.
* Renamed the `whitelist` setting to `publicPrefixes`.
* Added `ctx.auth.isLoggedIn()`, `ctx.auth.principal`.
* Can now provide information about the privileges a user has, either by
  using the data from @curveball/a12n-server, or by providing your own.
  Using this is optional, but it's there if you need it.
* Added `ctx.privileges.has()`, `ctx.privileges.require()`,
  `ctx.privileges.get()`.



0.3.0 (2022-04-10) ALPHA!
-------------------------

* Switched to the new `fetch-mw-oauth2` library for all oauth2 handling.
  the setup for this middleware has changed slightly, but all features
  remain the same. Take a look at the readme to see the new setup
  instructions.


0.2.1 (2022-03-24)
------------------

* Bring package fully up to date with coding standards and dependencies.


0.2.0 (2021-04-01)
------------------

* Update everything to the latest Curveball standards.
* No functional changes.


0.1.3 (2020-01-05)
------------------

*  Allow installation on Curveball 0.10.
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
