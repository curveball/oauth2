Changelog
=========

0.3.0 (2022-??-??)
------------------

* Now uses the new `fetch-mw-oauth2` package.
* Requires Node 18, *unless* the user provides their own `fetch` polyfill.
* BC break. Take a look at the README to figure out how to set up this
  middleware.


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
