# Change Log

All notable changes to this project will be documented in this file.
See [Conventional Commits](https://conventionalcommits.org) for commit guidelines.

# 2.0.0-next.31 (2020-07-23)


### Bug Fixes

* filter out empty elements in the `sortFields` array ([06919fa](https://github.com/webiny/commodo/commit/06919faa39a46a640c71fd7c6bc24cf4297a3a43))





# 2.0.0-next.30 (2020-07-23)

**Note:** Version bump only for package @commodo/fields-storage





# 2.0.0-next.29 (2020-06-10)

**Note:** Version bump only for package @commodo/fields-storage





# 2.0.0-next.28 (2020-06-10)

**Note:** Version bump only for package @commodo/fields-storage





# 2.0.0-next.27 (2020-06-04)


### Bug Fixes

* use withStorageName, fallback to withName ([12f7ebe](https://github.com/webiny/commodo/commit/12f7ebe19f0c0301cf792295228be47896b1efae))





# 2.0.0-next.26 (2020-06-03)

**Note:** Version bump only for package @commodo/fields-storage





# 2.0.0-next.25 (2020-06-02)

**Note:** Version bump only for package @commodo/fields-storage





# 2.0.0-next.24 (2020-06-02)

**Note:** Version bump only for package @commodo/fields-storage





# 2.0.0-next.23 (2020-05-31)

**Note:** Version bump only for package @commodo/fields-storage





# 2.0.0-next.22 (2020-05-31)


### Bug Fixes

* remove unused dependencies ([2baac91](https://github.com/webiny/commodo/commit/2baac9175a21cd05dc071efc54593cf6ca0e0648))





# 2.0.0-next.21 (2020-05-31)

**Note:** Version bump only for package @commodo/fields-storage





# 2.0.0-next.20 (2020-05-31)

**Note:** Version bump only for package @commodo/fields-storage





# 2.0.0-next.19 (2020-05-31)

**Note:** Version bump only for package @commodo/fields-storage





# 2.0.0-next.18 (2020-05-31)

**Note:** Version bump only for package @commodo/fields-storage





# 2.0.0-next.17 (2020-05-31)

**Note:** Version bump only for package @commodo/fields-storage





# 2.0.0-next.16 (2020-05-25)


### Bug Fixes

* add missing "nedb-promises" dependency ([36a3172](https://github.com/webiny/commodo/commit/36a317222d49b860f09512fbc48f56a977a0245e))





# 2.0.0-next.15 (2020-05-25)

**Note:** Version bump only for package @commodo/fields-storage





# 2.0.0-next.14 (2020-05-22)

**Note:** Version bump only for package @commodo/fields-storage





# 2.0.0-next.13 (2020-05-22)


### Features

* add support for custom id structure ([2a8aa49](https://github.com/webiny/commodo/commit/2a8aa49a6ddc8ff830d1771b662da3dd48bcfd1c))





# 2.0.0-next.12 (2020-05-22)


### Bug Fixes

* add missing dependency ([d9fdb96](https://github.com/webiny/commodo/commit/d9fdb96d96358f50c280566d5da71fd5079cf212))





# 2.0.0-next.11 (2020-05-20)


### Bug Fixes

* improve "isId" regex and fix tests ([7ddaaf5](https://github.com/webiny/commodo/commit/7ddaaf5e6062a1306f2c574bdd34f7cb073441f0))





# 2.0.0-next.10 (2020-05-19)

**Note:** Version bump only for package @commodo/fields-storage





# 2.0.0-next.9 (2020-05-14)

**Note:** Version bump only for package @commodo/fields-storage





# 2.0.0-next.8 (2020-05-14)


### Bug Fixes

* update to work with the new driver interface ([588beb1](https://github.com/webiny/commodo/commit/588beb1b5c01e14b5eb49ed3cbb5aaa020c29724))





# 2.0.0-next.7 (2020-05-11)

**Note:** Version bump only for package @commodo/fields-storage





# 2.0.0-canary.6 (2020-05-10)

**Note:** Version bump only for package @commodo/fields-storage





# 2.0.0-canary.5 (2020-05-10)

**Note:** Version bump only for package @commodo/fields-storage





# 2.0.0-canary.4 (2020-05-10)

**Note:** Version bump only for package @commodo/fields-storage





# 2.0.0-canary.3 (2020-05-10)

**Note:** Version bump only for package @commodo/fields-storage





# 2.0.0-canary.2 (2020-05-10)

**Note:** Version bump only for package @commodo/fields-storage





# 2.0.0-canary.1 (2020-05-10)

**Note:** Version bump only for package @commodo/fields-storage





# 2.0.0-canary.0 (2020-05-10)

**Note:** Version bump only for package @commodo/fields-storage





# [2.0.0-next.0](https://github.com/webiny/commodo/compare/@commodo/fields-storage@1.0.2...@commodo/fields-storage@2.0.0-next.0) (2020-05-05)


### Bug Fixes

* add id sorter only if it's not already set ([af08a87](https://github.com/webiny/commodo/commit/af08a874c36926585c686aff88ae2f9f81fbe365))
* avoid calling hasOwnProperty ([ead8369](https://github.com/webiny/commodo/commit/ead8369de6bbf07ade18c55edeeb54a23a50cfd8))
* bring back findByIds ([87c96be](https://github.com/webiny/commodo/commit/87c96be1ee3eadf7323d8c16ee055d7f5d0132dc))
* handle non-object sort value ([7c06ac8](https://github.com/webiny/commodo/commit/7c06ac8613cff3153f9867d7786fd7669d5ab33f))
* remove deprecated findByIds method ([bfcbd84](https://github.com/webiny/commodo/commit/bfcbd84f23eda7b7691f2d981c1e0fa21766e9a9))


### Features

* implement cursor pagination ([6354c66](https://github.com/webiny/commodo/commit/6354c664fb6c5d55de46be67de9f5c614f6e6bee))
* use raw data instead of model instances in storage drivers ([7b9e15b](https://github.com/webiny/commodo/commit/7b9e15b6a4883c8d5f28269a3daf97aa2563098d))


### BREAKING CHANGES

* Storage drivers no longer accept a model instance. They now work with raw data passed from fields-storage layer.





## [1.0.3](https://github.com/webiny/commodo/compare/@commodo/fields-storage@1.0.2...@commodo/fields-storage@1.0.3) (2020-01-21)


### Bug Fixes

* bring back findByIds ([87c96be](https://github.com/webiny/commodo/commit/87c96be))





## [1.0.2](https://github.com/webiny/commodo/compare/@commodo/fields-storage@1.0.3...@commodo/fields-storage@1.0.2) (2020-01-19)


### Bug Fixes

* update package versions ([aa1831e](https://github.com/webiny/commodo/commit/aa1831e))





## [1.0.1](https://github.com/webiny/commodo/compare/@commodo/fields-storage@1.0.3...@commodo/fields-storage@1.0.1) (2020-01-19)


### Bug Fixes

* update package versions ([aa1831e](https://github.com/webiny/commodo/commit/aa1831e))





## [1.0.3](https://github.com/webiny/commodo/compare/@commodo/fields-storage@1.0.1...@commodo/fields-storage@1.0.3) (2020-01-17)


### Bug Fixes

* update versions ([e5b4c61](https://github.com/webiny/commodo/commit/e5b4c61))
* update versions ([95852d7](https://github.com/webiny/commodo/commit/95852d7))





## [1.0.1](https://github.com/webiny/commodo/compare/@commodo/fields-storage@1.0.1...@commodo/fields-storage@1.0.1) (2020-01-17)


### Bug Fixes

* update versions ([95852d7](https://github.com/webiny/commodo/commit/95852d7))





## [1.0.1](https://github.com/webiny/commodo/compare/@commodo/fields-storage@0.4.1...@commodo/fields-storage@1.0.1) (2020-01-17)

**Note:** Version bump only for package @commodo/fields-storage





## [0.4.1](https://github.com/webiny/commodo/compare/@commodo/fields-storage@0.4.1-next.0...@commodo/fields-storage@0.4.1) (2020-01-10)

**Note:** Version bump only for package @commodo/fields-storage





## [0.4.1-next.0](https://github.com/webiny/commodo/compare/@commodo/fields-storage@0.4.0...@commodo/fields-storage@0.4.1-next.0) (2020-01-07)

**Note:** Version bump only for package @commodo/fields-storage





# [0.4.0](https://github.com/webiny/commodo/compare/@commodo/fields-storage@0.3.2...@commodo/fields-storage@0.4.0) (2019-12-17)


### Features

* remove findByIds ([4c3e7df](https://github.com/webiny/commodo/commit/4c3e7df))





## [0.3.2](https://github.com/webiny/commodo/compare/@commodo/fields-storage@0.3.1...@commodo/fields-storage@0.3.2) (2019-10-20)


### Bug Fixes

* apply rest to field (enables setting custom values for diff purposes) ([c46ad46](https://github.com/webiny/commodo/commit/c46ad46))





## [0.3.1](https://github.com/webiny/commodo/compare/@commodo/fields-storage@0.3.0...@commodo/fields-storage@0.3.1) (2019-09-26)


### Bug Fixes

* error message ([0e0e226](https://github.com/webiny/commodo/commit/0e0e226))
* remove ramda ([11f445f](https://github.com/webiny/commodo/commit/11f445f))
* update dependency versions ([2a30863](https://github.com/webiny/commodo/commit/2a30863))





# [0.3.0](https://github.com/webiny/commodo/compare/@commodo/fields-storage@0.2.5...@commodo/fields-storage@0.3.0) (2019-09-25)


### Features

* add hasWithStorage helper function ([c23325c](https://github.com/webiny/commodo/commit/c23325c))





## [0.2.5](https://github.com/webiny/commodo/compare/@commodo/fields-storage@0.2.4...@commodo/fields-storage@0.2.5) (2019-09-23)


### Bug Fixes

* **fields-storage-adapter:** fields must always return all fields' values ([6a94731](https://github.com/webiny/commodo/commit/6a94731))





## [0.2.4](https://github.com/webiny/commodo/compare/@commodo/fields-storage@0.2.3...@commodo/fields-storage@0.2.4) (2019-09-23)


### Bug Fixes

* handle "fromStorage" on "fields" field correctly ([e47caf7](https://github.com/webiny/commodo/commit/e47caf7))





## [0.2.3](https://github.com/webiny/commodo/compare/@commodo/fields-storage@0.2.1...@commodo/fields-storage@0.2.3) (2019-09-11)


### Bug Fixes

* rename internal __storage prop to __withStorage ([de3589f](https://github.com/webiny/commodo/commit/de3589f))
* upgrade to work with new version of repropose ([0c4c983](https://github.com/webiny/commodo/commit/0c4c983))





## [0.2.1](https://github.com/webiny/commodo/compare/@commodo/fields-storage@0.2.0...@commodo/fields-storage@0.2.1) (2019-05-24)


### Bug Fixes

* storage data is set directly into "current", without calling setValue ([03d5419](https://github.com/webiny/commodo/commit/03d5419))





# [0.2.0](https://github.com/webiny/commodo/compare/@commodo/fields-storage@0.1.1...@commodo/fields-storage@0.2.0) (2019-05-09)


### Features

* removed readOnly option in fields and HOF ([dac1969](https://github.com/webiny/commodo/commit/dac1969))





## [0.1.1](https://github.com/webiny/commodo/compare/@commodo/fields-storage@0.1.0...@commodo/fields-storage@0.1.1) (2019-05-05)


### Bug Fixes

* pagination data must be set correctly (must be spread) ([d8d05d0](https://github.com/webiny/commodo/commit/d8d05d0))





# [0.1.0](https://github.com/webiny/commodo/compare/@commodo/fields-storage@0.0.11...@commodo/fields-storage@0.1.0) (2019-04-28)


### Features

* rename "object" field to "fields" ([3f17ceb](https://github.com/webiny/commodo/commit/3f17ceb))





## [0.0.11](https://github.com/webiny/commodo/compare/@commodo/fields-storage@0.0.10...@commodo/fields-storage@0.0.11) (2019-04-28)


### Bug Fixes

* rename "triggerHook" method to just "hook" ([c350add](https://github.com/webiny/commodo/commit/c350add))





## [0.0.10](https://github.com/webiny/commodo/compare/@commodo/fields-storage@0.0.9...@commodo/fields-storage@0.0.10) (2019-04-28)

**Note:** Version bump only for package @commodo/fields-storage





## [0.0.9](https://github.com/webiny/commodo/compare/@commodo/fields-storage@0.0.8...@commodo/fields-storage@0.0.9) (2019-04-27)


### Bug Fixes

* await "populateFromStorage" method calls ([d558645](https://github.com/webiny/commodo/commit/d558645))





## [0.0.8](https://github.com/webiny/commodo/compare/@commodo/fields-storage@0.0.7...@commodo/fields-storage@0.0.8) (2019-04-24)

**Note:** Version bump only for package @commodo/fields-storage





## [0.0.7](https://github.com/webiny/commodo/compare/@commodo/fields-storage@0.0.6...@commodo/fields-storage@0.0.7) (2019-04-24)

**Note:** Version bump only for package @commodo/fields-storage





## [0.0.6](https://github.com/webiny/commodo/compare/@commodo/fields-storage@0.0.5...@commodo/fields-storage@0.0.6) (2019-04-24)

**Note:** Version bump only for package @commodo/fields-storage





## [0.0.5](https://github.com/webiny/commodo/compare/@commodo/fields-storage@0.0.4...@commodo/fields-storage@0.0.5) (2019-04-24)


### Bug Fixes

* remove old files ([c21c48d](https://github.com/webiny/commodo/commit/c21c48d))





## [0.0.4](https://github.com/webiny/commodo/compare/@commodo/fields-storage@0.0.3...@commodo/fields-storage@0.0.4) (2019-04-23)


### Bug Fixes

* add missing README.md files ([7228d9c](https://github.com/webiny/commodo/commit/7228d9c))





## [0.0.3](https://github.com/webiny/commodo/compare/@commodo/fields-storage@0.0.2...@commodo/fields-storage@0.0.3) (2019-04-23)


### Bug Fixes

* update keywords in package.json ([cc544ea](https://github.com/webiny/commodo/commit/cc544ea))





## [0.0.2](https://github.com/webiny/commodo/compare/@commodo/fields-storage@0.0.1...@commodo/fields-storage@0.0.2) (2019-04-23)

**Note:** Version bump only for package @commodo/fields-storage





## [0.0.1](https://github.com/webiny/commodo/compare/@commodo/fields-storage@0.0.0...@commodo/fields-storage@0.0.1) (2019-04-23)

**Note:** Version bump only for package @commodo/fields-storage





# 0.0.0 (2019-04-23)

**Note:** Version bump only for package @commodo/fields-storage
