# Change Log

All notable changes to this project will be documented in this file.
See [Conventional Commits](https://conventionalcommits.org) for commit guidelines.

## 2.0.2-next.2 (2020-08-21)

**Note:** Version bump only for package @commodo/fields-storage-mongodb





## 2.0.2-next.1 (2020-08-21)

**Note:** Version bump only for package @commodo/fields-storage-mongodb





## 2.0.2-next.0 (2020-08-21)

**Note:** Version bump only for package @commodo/fields-storage-mongodb





## [2.0.1](https://github.com/webiny/commodo/compare/@commodo/fields-storage-mongodb@2.0.1-next.0...@commodo/fields-storage-mongodb@2.0.1) (2020-07-29)

**Note:** Version bump only for package @commodo/fields-storage-mongodb





## 2.0.1-next.0 (2020-07-28)

**Note:** Version bump only for package @commodo/fields-storage-mongodb





# 2.0.0 (2020-06-10)

**Note:** Version bump only for package @commodo/fields-storage-mongodb





# 2.0.0-next.28 (2020-06-10)

**Note:** Version bump only for package @commodo/fields-storage-mongodb





# 2.0.0-next.27 (2020-06-04)


### Bug Fixes

* use withStorageName, fallback to withName ([12f7ebe](https://github.com/webiny/commodo/commit/12f7ebe19f0c0301cf792295228be47896b1efae))





# 2.0.0-next.26 (2020-06-03)

**Note:** Version bump only for package @commodo/fields-storage-mongodb





# 2.0.0-next.25 (2020-06-02)

**Note:** Version bump only for package @commodo/fields-storage-mongodb





# 2.0.0-next.24 (2020-06-02)

**Note:** Version bump only for package @commodo/fields-storage-mongodb





# 2.0.0-next.23 (2020-05-31)

**Note:** Version bump only for package @commodo/fields-storage-mongodb





# 2.0.0-next.22 (2020-05-31)


### Bug Fixes

* remove unused dependencies ([2baac91](https://github.com/webiny/commodo/commit/2baac9175a21cd05dc071efc54593cf6ca0e0648))





# 2.0.0-next.21 (2020-05-31)

**Note:** Version bump only for package @commodo/fields-storage-mongodb





# 2.0.0-next.20 (2020-05-31)

**Note:** Version bump only for package @commodo/fields-storage-mongodb





# 2.0.0-next.19 (2020-05-31)

**Note:** Version bump only for package @commodo/fields-storage-mongodb





# 2.0.0-next.18 (2020-05-31)

**Note:** Version bump only for package @commodo/fields-storage-mongodb





# 2.0.0-next.17 (2020-05-31)

**Note:** Version bump only for package @commodo/fields-storage-mongodb





# 2.0.0-next.16 (2020-05-25)


### Bug Fixes

* add missing "nedb-promises" dependency ([36a3172](https://github.com/webiny/commodo/commit/36a317222d49b860f09512fbc48f56a977a0245e))





# 2.0.0-next.15 (2020-05-25)

**Note:** Version bump only for package @commodo/fields-storage-mongodb





# 2.0.0-next.14 (2020-05-22)

**Note:** Version bump only for package @commodo/fields-storage-mongodb





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

**Note:** Version bump only for package @commodo/fields-storage-mongodb





# 2.0.0-next.9 (2020-05-14)

**Note:** Version bump only for package @commodo/fields-storage-mongodb





# 2.0.0-next.8 (2020-05-14)


### Bug Fixes

* update to work with the new driver interface ([588beb1](https://github.com/webiny/commodo/commit/588beb1b5c01e14b5eb49ed3cbb5aaa020c29724))





# 2.0.0-next.7 (2020-05-11)

**Note:** Version bump only for package @commodo/fields-storage-mongodb





# 2.0.0-canary.6 (2020-05-10)

**Note:** Version bump only for package @commodo/fields-storage-mongodb





# 2.0.0-canary.5 (2020-05-10)

**Note:** Version bump only for package @commodo/fields-storage-mongodb





# 2.0.0-canary.4 (2020-05-10)

**Note:** Version bump only for package @commodo/fields-storage-mongodb





# 2.0.0-canary.3 (2020-05-10)

**Note:** Version bump only for package @commodo/fields-storage-mongodb





# 2.0.0-canary.2 (2020-05-10)

**Note:** Version bump only for package @commodo/fields-storage-mongodb





# 2.0.0-canary.1 (2020-05-10)

**Note:** Version bump only for package @commodo/fields-storage-mongodb





# 2.0.0-canary.0 (2020-05-10)

**Note:** Version bump only for package @commodo/fields-storage-mongodb





# [2.0.0-next.0](https://github.com/webiny/commodo/compare/@commodo/fields-storage-mongodb@1.0.2...@commodo/fields-storage-mongodb@2.0.0-next.0) (2020-05-05)


### Bug Fixes

* do not pass sort/match into aggregation pipeline if not needed ([e619fc9](https://github.com/webiny/commodo/commit/e619fc9282845ea2d0f98779891b8703c853b7b9))


### Features

* remove page/perPage handling ([b845316](https://github.com/webiny/commodo/commit/b845316ef0c5670b32fba857cbf318dfe730cc5c))
* use raw data instead of model instances in storage drivers ([7b9e15b](https://github.com/webiny/commodo/commit/7b9e15b6a4883c8d5f28269a3daf97aa2563098d))


### BREAKING CHANGES

* Storage drivers no longer accept a model instance. They now work with raw data passed from fields-storage layer.
* Handling of page/perPage was removed to make driver more generic. Developers who need this, need to handle parameters before calling the driver, and calculate proper limit/offset themselves.





## [1.0.3](https://github.com/webiny/commodo/compare/@commodo/fields-storage-mongodb@1.0.2...@commodo/fields-storage-mongodb@1.0.3) (2020-01-21)

**Note:** Version bump only for package @commodo/fields-storage-mongodb





## [1.0.2](https://github.com/webiny/commodo/compare/@commodo/fields-storage-mongodb@1.0.3...@commodo/fields-storage-mongodb@1.0.2) (2020-01-19)


### Bug Fixes

* update package versions ([aa1831e](https://github.com/webiny/commodo/commit/aa1831e))





## [1.0.1](https://github.com/webiny/commodo/compare/@commodo/fields-storage-mongodb@1.0.3...@commodo/fields-storage-mongodb@1.0.1) (2020-01-19)


### Bug Fixes

* update package versions ([aa1831e](https://github.com/webiny/commodo/commit/aa1831e))





## [1.0.3](https://github.com/webiny/commodo/compare/@commodo/fields-storage-mongodb@1.0.1...@commodo/fields-storage-mongodb@1.0.3) (2020-01-17)


### Bug Fixes

* update versions ([e5b4c61](https://github.com/webiny/commodo/commit/e5b4c61))
* update versions ([95852d7](https://github.com/webiny/commodo/commit/95852d7))





## [1.0.1](https://github.com/webiny/commodo/compare/@commodo/fields-storage-mongodb@1.0.1...@commodo/fields-storage-mongodb@1.0.1) (2020-01-17)


### Bug Fixes

* update versions ([95852d7](https://github.com/webiny/commodo/commit/95852d7))





## [1.0.1](https://github.com/webiny/commodo/compare/@commodo/fields-storage-mongodb@0.4.0...@commodo/fields-storage-mongodb@1.0.1) (2020-01-17)

**Note:** Version bump only for package @commodo/fields-storage-mongodb





# [0.4.0](https://github.com/webiny/commodo/compare/@commodo/fields-storage-mongodb@0.4.0-next.0...@commodo/fields-storage-mongodb@0.4.0) (2020-01-10)

**Note:** Version bump only for package @commodo/fields-storage-mongodb





# [0.4.0-next.0](https://github.com/webiny/commodo/compare/@commodo/fields-storage-mongodb@0.3.0...@commodo/fields-storage-mongodb@0.4.0-next.0) (2020-01-07)


### Bug Fixes

* check results received from aggregate ([d1a5313](https://github.com/webiny/commodo/commit/d1a5313))


### Features

* use $facet to count totalCount, allow old approach too (optional) ([2e81f19](https://github.com/webiny/commodo/commit/2e81f19))





# [0.3.0](https://github.com/webiny/commodo/compare/@commodo/fields-storage-mongodb@0.2.15...@commodo/fields-storage-mongodb@0.3.0) (2019-12-17)


### Features

* add option to skip totalCount query ([e257dab](https://github.com/webiny/commodo/commit/e257dab))
* remove findByIds ([4c3e7df](https://github.com/webiny/commodo/commit/4c3e7df))





## [0.2.15](https://github.com/webiny/commodo/compare/@commodo/fields-storage-mongodb@0.2.14...@commodo/fields-storage-mongodb@0.2.15) (2019-10-26)


### Bug Fixes

* replace getAttribute with getField ([b0c3aec](https://github.com/webiny/commodo/commit/b0c3aec))





## [0.2.14](https://github.com/webiny/commodo/compare/@commodo/fields-storage-mongodb@0.2.13...@commodo/fields-storage-mongodb@0.2.14) (2019-10-20)

**Note:** Version bump only for package @commodo/fields-storage-mongodb





## [0.2.13](https://github.com/webiny/commodo/compare/@commodo/fields-storage-mongodb@0.2.12...@commodo/fields-storage-mongodb@0.2.13) (2019-10-14)

**Note:** Version bump only for package @commodo/fields-storage-mongodb





## [0.2.12](https://github.com/webiny/commodo/compare/@commodo/fields-storage-mongodb@0.2.11...@commodo/fields-storage-mongodb@0.2.12) (2019-09-26)


### Bug Fixes

* update dependency versions ([2a30863](https://github.com/webiny/commodo/commit/2a30863))





## [0.2.11](https://github.com/webiny/commodo/compare/@commodo/fields-storage-mongodb@0.2.10...@commodo/fields-storage-mongodb@0.2.11) (2019-09-25)

**Note:** Version bump only for package @commodo/fields-storage-mongodb





## [0.2.10](https://github.com/webiny/commodo/compare/@commodo/fields-storage-mongodb@0.2.9...@commodo/fields-storage-mongodb@0.2.10) (2019-09-23)

**Note:** Version bump only for package @commodo/fields-storage-mongodb





## [0.2.9](https://github.com/webiny/commodo/compare/@commodo/fields-storage-mongodb@0.2.8...@commodo/fields-storage-mongodb@0.2.9) (2019-09-23)

**Note:** Version bump only for package @commodo/fields-storage-mongodb





## [0.2.8](https://github.com/webiny/commodo/compare/@commodo/fields-storage-mongodb@0.2.7...@commodo/fields-storage-mongodb@0.2.8) (2019-09-23)

**Note:** Version bump only for package @commodo/fields-storage-mongodb





## [0.2.7](https://github.com/webiny/commodo/compare/@commodo/fields-storage-mongodb@0.2.5...@commodo/fields-storage-mongodb@0.2.7) (2019-09-11)


### Bug Fixes

* upgrade to work with new version of repropose ([0c4c983](https://github.com/webiny/commodo/commit/0c4c983))





## [0.2.5](https://github.com/webiny/commodo/compare/@commodo/fields-storage-mongodb@0.2.4...@commodo/fields-storage-mongodb@0.2.5) (2019-05-24)

**Note:** Version bump only for package @commodo/fields-storage-mongodb





## [0.2.4](https://github.com/webiny/commodo/compare/@commodo/fields-storage-mongodb@0.2.3...@commodo/fields-storage-mongodb@0.2.4) (2019-05-23)

**Note:** Version bump only for package @commodo/fields-storage-mongodb





## [0.2.3](https://github.com/webiny/commodo/compare/@commodo/fields-storage-mongodb@0.2.2...@commodo/fields-storage-mongodb@0.2.3) (2019-05-09)

**Note:** Version bump only for package @commodo/fields-storage-mongodb





## [0.2.2](https://github.com/webiny/commodo/compare/@commodo/fields-storage-mongodb@0.2.1...@commodo/fields-storage-mongodb@0.2.2) (2019-05-07)

**Note:** Version bump only for package @commodo/fields-storage-mongodb





## [0.2.1](https://github.com/webiny/commodo/compare/@commodo/fields-storage-mongodb@0.2.0...@commodo/fields-storage-mongodb@0.2.1) (2019-05-05)

**Note:** Version bump only for package @commodo/fields-storage-mongodb





# [0.2.0](https://github.com/webiny/commodo/compare/@commodo/fields-storage-mongodb@0.1.2...@commodo/fields-storage-mongodb@0.2.0) (2019-04-28)


### Features

* rename "object" field to "fields" ([3f17ceb](https://github.com/webiny/commodo/commit/3f17ceb))





## [0.1.2](https://github.com/webiny/commodo/compare/@commodo/fields-storage-mongodb@0.1.1...@commodo/fields-storage-mongodb@0.1.2) (2019-04-28)

**Note:** Version bump only for package @commodo/fields-storage-mongodb





## [0.1.1](https://github.com/webiny/commodo/compare/@commodo/fields-storage-mongodb@0.1.0...@commodo/fields-storage-mongodb@0.1.1) (2019-04-28)

**Note:** Version bump only for package @commodo/fields-storage-mongodb





# [0.1.0](https://github.com/webiny/commodo/compare/@commodo/fields-storage-mongodb@0.0.9...@commodo/fields-storage-mongodb@0.1.0) (2019-04-27)


### Features

* add "aggregate" function (specific to MongoDB) ([466f4fa](https://github.com/webiny/commodo/commit/466f4fa))





## [0.0.9](https://github.com/webiny/commodo/compare/@commodo/fields-storage-mongodb@0.0.8...@commodo/fields-storage-mongodb@0.0.9) (2019-04-24)

**Note:** Version bump only for package @commodo/fields-storage-mongodb





## [0.0.8](https://github.com/webiny/commodo/compare/@commodo/fields-storage-mongodb@0.0.7...@commodo/fields-storage-mongodb@0.0.8) (2019-04-24)

**Note:** Version bump only for package @commodo/fields-storage-mongodb





## [0.0.7](https://github.com/webiny/commodo/compare/@commodo/fields-storage-mongodb@0.0.6...@commodo/fields-storage-mongodb@0.0.7) (2019-04-24)

**Note:** Version bump only for package @commodo/fields-storage-mongodb





## [0.0.6](https://github.com/webiny/commodo/compare/@commodo/fields-storage-mongodb@0.0.5...@commodo/fields-storage-mongodb@0.0.6) (2019-04-24)

**Note:** Version bump only for package @commodo/fields-storage-mongodb





## [0.0.5](https://github.com/webiny/commodo/compare/@commodo/fields-storage-mongodb@0.0.4...@commodo/fields-storage-mongodb@0.0.5) (2019-04-24)

**Note:** Version bump only for package @commodo/fields-storage-mongodb





## [0.0.4](https://github.com/webiny/commodo/compare/@commodo/fields-storage-mongodb@0.0.3...@commodo/fields-storage-mongodb@0.0.4) (2019-04-23)


### Bug Fixes

* add missing README.md files ([7228d9c](https://github.com/webiny/commodo/commit/7228d9c))





## [0.0.3](https://github.com/webiny/commodo/compare/@commodo/fields-storage-mongodb@0.0.2...@commodo/fields-storage-mongodb@0.0.3) (2019-04-23)


### Bug Fixes

* update keywords in package.json ([cc544ea](https://github.com/webiny/commodo/commit/cc544ea))





## [0.0.2](https://github.com/webiny/commodo/compare/@commodo/fields-storage-mongodb@0.0.1...@commodo/fields-storage-mongodb@0.0.2) (2019-04-23)

**Note:** Version bump only for package @commodo/fields-storage-mongodb





## [0.0.1](https://github.com/webiny/commodo/compare/@commodo/fields-storage-mongodb@0.0.0...@commodo/fields-storage-mongodb@0.0.1) (2019-04-23)

**Note:** Version bump only for package @commodo/fields-storage-mongodb





# 0.0.0 (2019-04-23)

**Note:** Version bump only for package @commodo/fields-storage-mongodb
