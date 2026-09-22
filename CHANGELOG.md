# Changelog

## [2.1.0-alpha.35](https://github.com/openfoodfacts/openfoodfacts-js/compare/v2.0.0-alpha.35...v2.1.0-alpha.35) (2026-09-22)


### Features

* **v3:** add support for tag knowledge panels ([#955](https://github.com/openfoodfacts/openfoodfacts-js/issues/955)) ([fdd19df](https://github.com/openfoodfacts/openfoodfacts-js/commit/fdd19dfb952a7ef02c35f3c6975a894f629a5c4c))

## [2.0.0-alpha.35](https://github.com/openfoodfacts/openfoodfacts-js/compare/v2.0.0-alpha.34...v2.0.0-alpha.35) (2026-09-03)


### Bug Fixes

* **deps:** resolve recursive audit vulnerabilities ([de14ff5](https://github.com/openfoodfacts/openfoodfacts-js/commit/de14ff54fe13a4e51d38f3c20a3e0a6eb0964ccb))
* **KnowledgePanel:** add missing icon_url field in KnowledgePanelTableRow type ([#948](https://github.com/openfoodfacts/openfoodfacts-js/issues/948)) ([ac9baa0](https://github.com/openfoodfacts/openfoodfacts-js/commit/ac9baa07de2329e64f3a68e15219f4448baff76a))


### Miscellaneous Chores

* Prepare release 2.0.0-alpha.35 ([93f6992](https://github.com/openfoodfacts/openfoodfacts-js/commit/93f6992a2c127d315df08337f028344c768baa27))

## [2.0.0-alpha.34](https://github.com/openfoodfacts/openfoodfacts-js/compare/v2.0.0-alpha.33...v2.0.0-alpha.34) (2026-08-22)


### Bug Fixes

* Revert "chore(deps): bump brace-expansion from 5.0.6 to 5.0.9" ([263f83b](https://github.com/openfoodfacts/openfoodfacts-js/commit/263f83b9565250ec9c3911a49459a02ede5a5c7f))
* temporary workaround for cjs users ([e0506f6](https://github.com/openfoodfacts/openfoodfacts-js/commit/e0506f6c085b877cdffabcee134464039346d46f))


### Miscellaneous Chores

* Prepare release 2.0.0-alpha.34 ([06d71ea](https://github.com/openfoodfacts/openfoodfacts-js/commit/06d71ea08fc0f9a06d4c9f1c8fb6d057e61e4017))

## [2.0.0-alpha.33](https://github.com/openfoodfacts/openfoodfacts-js/compare/v2.0.0-alpha.32...v2.0.0-alpha.33) (2026-07-20)


### Features

* add generic name and official website URL fields to product ([1380e54](https://github.com/openfoodfacts/openfoodfacts-js/commit/1380e5403a5c2a2cbd79aa6a1a5d387030083e08))
* **v2:** Add deleteProduct method ([#890](https://github.com/openfoodfacts/openfoodfacts-js/issues/890)) ([9ebba7c](https://github.com/openfoodfacts/openfoodfacts-js/commit/9ebba7c0bf902cbe1f9faaf394aaf33dcde83ab8))
* **v2:** Add moveImages and deleteImages API method ([#889](https://github.com/openfoodfacts/openfoodfacts-js/issues/889)) ([136554b](https://github.com/openfoodfacts/openfoodfacts-js/commit/136554bb4a56f71df3e315dbad8cbf13d35f3fe7))


### Bug Fixes

* **deps:** resolve audit vulnerabilities in transitive dependencies ([399b730](https://github.com/openfoodfacts/openfoodfacts-js/commit/399b730f4e0b0a7e533a55fa3c834f3948d73c4a))


### Miscellaneous Chores

* Bump version to 2.0.0-alpha.33 ([6599b40](https://github.com/openfoodfacts/openfoodfacts-js/commit/6599b40fd5e3172f79f48416c5bbf4131697dc16))

## [2.0.0-alpha.32](https://github.com/openfoodfacts/openfoodfacts-js/compare/v2.0.0-alpha.31...v2.0.0-alpha.32) (2026-06-11)


### Features

* add allergens and traces fields ([c031772](https://github.com/openfoodfacts/openfoodfacts-js/commit/c03177261fa21ad44466462aebcd700f9baa030b))
* Add data quality tags to V3 product type ([#885](https://github.com/openfoodfacts/openfoodfacts-js/issues/885)) ([5b216d6](https://github.com/openfoodfacts/openfoodfacts-js/commit/5b216d6252da77c30cb38f77a0d57df8ea0243d1))
* Complete the robotoff functions to match hunger games usage ([3278cfc](https://github.com/openfoodfacts/openfoodfacts-js/commit/3278cfc6db91f60be26e81628dd6ab0fafa99447))
* **productopener:** Support editing nutrition information ([#875](https://github.com/openfoodfacts/openfoodfacts-js/issues/875)) ([8cc741c](https://github.com/openfoodfacts/openfoodfacts-js/commit/8cc741c683f9d7b1d0e89621fc89794406dcb7af))


### Bug Fixes

* Make isTokenExpired work on browser ([12505c6](https://github.com/openfoodfacts/openfoodfacts-js/commit/12505c6f510fc65b95cfd846a962b30a44c4f951))
* remove duplicate 'last_modified_t' from FACETS_SORT_OPTIONS ([00b8665](https://github.com/openfoodfacts/openfoodfacts-js/commit/00b86659003208654d6cd91e873f5c71361161c4))
* Update isTokenExpired test to reflect correct behavior for tokens without exp claim ([77dcace](https://github.com/openfoodfacts/openfoodfacts-js/commit/77dcacedf22904007392918ab193acd58ed079f9))
* **v2:** Send `no_nutrition_data` field in addOrEditProductV2 ([#867](https://github.com/openfoodfacts/openfoodfacts-js/issues/867)) ([0af44aa](https://github.com/openfoodfacts/openfoodfacts-js/commit/0af44aae5a655a3baf36fda8669a02e09711908b))


### Miscellaneous Chores

* Bump version to 2.0.0-alpha.32 ([0badae8](https://github.com/openfoodfacts/openfoodfacts-js/commit/0badae86930b6931cd09feaafae7fb033dc1ae9f))

## [2.0.0-alpha.31](https://github.com/openfoodfacts/openfoodfacts-js/compare/v2.0.0-alpha.30...v2.0.0-alpha.31) (2026-04-15)


### Features

* **nutripatrol:** add barcode filter to getTickets and fix type parameter ([#843](https://github.com/openfoodfacts/openfoodfacts-js/issues/843)) ([08c5d0d](https://github.com/openfoodfacts/openfoodfacts-js/commit/08c5d0dfbec1a34a4a143ef8c1ed12b8c72677b7))


### Bug Fixes

* add /api/v1 to Robotoff baseUrl ([#846](https://github.com/openfoodfacts/openfoodfacts-js/issues/846)) ([423c635](https://github.com/openfoodfacts/openfoodfacts-js/commit/423c6356b60dc2e8a704cfea483fd117c222af10))


### Miscellaneous Chores

* Prepare 2.0.0-alpha.31 release ([5c1a1ce](https://github.com/openfoodfacts/openfoodfacts-js/commit/5c1a1ceb6622c8cdc24f383026669dbb51e72202))

## [2.0.0-alpha.30](https://github.com/openfoodfacts/openfoodfacts-js/compare/v2.0.0-alpha.29...v2.0.0-alpha.30) (2026-04-06)


### Features

* add `nutriscore_score` to `FACETS_SORT_OPTIONS` ([#779](https://github.com/openfoodfacts/openfoodfacts-js/issues/779)) ([bab4485](https://github.com/openfoodfacts/openfoodfacts-js/commit/bab44857e9a7bb739b77e9e676e866a76da1e78c))
* Add and export KnowledgePanels type ([#801](https://github.com/openfoodfacts/openfoodfacts-js/issues/801)) ([fe9f77b](https://github.com/openfoodfacts/openfoodfacts-js/commit/fe9f77b624ebfb1f44c6ef323a134d35e7b21092))
* Add changeBarcode to ProductOpenerApiV2 ([#782](https://github.com/openfoodfacts/openfoodfacts-js/issues/782)) ([2b48d52](https://github.com/openfoodfacts/openfoodfacts-js/commit/2b48d525808198dd7a5690fe81121b365a4fb5e4))
* Add fields to KPs types ([#804](https://github.com/openfoodfacts/openfoodfacts-js/issues/804)) ([66c7f62](https://github.com/openfoodfacts/openfoodfacts-js/commit/66c7f625ee5330ea8c04632d1ac704054c6e65ae))
* Add getAttributeGroups method to v3 ([d81ebcf](https://github.com/openfoodfacts/openfoodfacts-js/commit/d81ebcf9071e24c1ab8e4dabbe50f00d329b0fbc))
* Add getStats method to nutripatrol ([#780](https://github.com/openfoodfacts/openfoodfacts-js/issues/780)) ([f49e749](https://github.com/openfoodfacts/openfoodfacts-js/commit/f49e749f11872a4a46c82f3444660c447703d918))
* add support for /api/v3/current-user/permissions endpoint ([#814](https://github.com/openfoodfacts/openfoodfacts-js/issues/814)) ([6a4e5cc](https://github.com/openfoodfacts/openfoodfacts-js/commit/6a4e5ccfc62336bc22a3c84d261bbc63b77f649c))
* add support for structured packaging data (V3) ([#785](https://github.com/openfoodfacts/openfoodfacts-js/issues/785)) ([70f93f2](https://github.com/openfoodfacts/openfoodfacts-js/commit/70f93f255362e17ba62835e11a07e8b99537b666))
* expose NutriPatrol in main client ([bbe7022](https://github.com/openfoodfacts/openfoodfacts-js/commit/bbe7022ef08c50efaa3590f9c083cbd4a1267d14))
* Expose open prices API endpoints ([#811](https://github.com/openfoodfacts/openfoodfacts-js/issues/811)) ([f8c2cf3](https://github.com/openfoodfacts/openfoodfacts-js/commit/f8c2cf382ceebc608605a0a60aee423969149839))
* **off:** Add individual getter methods for all taxonomy types ([#822](https://github.com/openfoodfacts/openfoodfacts-js/issues/822)) ([a967246](https://github.com/openfoodfacts/openfoodfacts-js/commit/a967246653cacdc1cfa0297a48fc56e79ca4f93b))
* taxonomy based on product type ([45b8d56](https://github.com/openfoodfacts/openfoodfacts-js/commit/45b8d5678d5d0ce28ce2a4685779169509940e6d))
* Update robotoff API ([#837](https://github.com/openfoodfacts/openfoodfacts-js/issues/837)) ([8b540e9](https://github.com/openfoodfacts/openfoodfacts-js/commit/8b540e964d4753b326f0ee2337d9a3ef3892542e))


### Bug Fixes

* **auth:** Handle OIDC token having no exp field and improve typing ([#842](https://github.com/openfoodfacts/openfoodfacts-js/issues/842)) ([29074a6](https://github.com/openfoodfacts/openfoodfacts-js/commit/29074a6b4c62075570380347e7245ed5407279ce))
* **off:** Wrong return type for getPackagings ([#844](https://github.com/openfoodfacts/openfoodfacts-js/issues/844)) ([e06a8bc](https://github.com/openfoodfacts/openfoodfacts-js/commit/e06a8bc88ee39c96a01e4970f8b1fbbb23f15811))
* Update return type of getProductAttributes to ProductAttributeGroup[] ([6f1ba74](https://github.com/openfoodfacts/openfoodfacts-js/commit/6f1ba744899898f6ffe725e3ccab5e2baa6b7413))
* **v3:** Mark packaging field as optional ([#786](https://github.com/openfoodfacts/openfoodfacts-js/issues/786)) ([26c3bfe](https://github.com/openfoodfacts/openfoodfacts-js/commit/26c3bfe0d076d7f5b69fab6e957f904c5508b19d))


### Miscellaneous Chores

* Trigger 2.0.0-alpha.30 release ([be50538](https://github.com/openfoodfacts/openfoodfacts-js/commit/be50538a824fa3bee3dd78e37379e62342a34da0))

## [2.0.0-alpha.29](https://github.com/openfoodfacts/openfoodfacts-js/compare/v2.0.0-alpha.28...v2.0.0-alpha.29) (2026-02-09)


### Features

* **nutripatrol:** Export type `FlagCreate` ([08da5ea](https://github.com/openfoodfacts/openfoodfacts-js/commit/08da5eafd707dce8f9e63552fd69290e51c7e022))
* **robotoff:** Implement logos & labels crops fetch and annotate routes [#528](https://github.com/openfoodfacts/openfoodfacts-js/issues/528) ([#762](https://github.com/openfoodfacts/openfoodfacts-js/issues/762)) ([810e057](https://github.com/openfoodfacts/openfoodfacts-js/commit/810e0575c8018d1e934b2cc4c578049c462d07d4))


### Bug Fixes

* robotoff logo_id path parameter ([745d30e](https://github.com/openfoodfacts/openfoodfacts-js/commit/745d30e8b8fee3423fb229345159236258328124))


### Miscellaneous Chores

* Trigger 2.0.0-alpha.29 release ([4bb3db4](https://github.com/openfoodfacts/openfoodfacts-js/commit/4bb3db42eefeb23c61d14c40864ca61168eb74ce))

## [2.0.0-alpha.28](https://github.com/openfoodfacts/openfoodfacts-js/compare/v2.0.0-alpha.27...v2.0.0-alpha.28) (2026-02-04)


### Features

* update OpenPrices schema ([bbc90ec](https://github.com/openfoodfacts/openfoodfacts-js/commit/bbc90ec7cddb648c0c7a66ac6f1f83e61774227d))


### Miscellaneous Chores

* Trigger 2.0.0-alpha.28 release ([58ff532](https://github.com/openfoodfacts/openfoodfacts-js/commit/58ff532a30b985c288c1c46ad56428762f45672a))

## [2.0.0-alpha.27](https://github.com/openfoodfacts/openfoodfacts-js/compare/v2.0.0-alpha.26...v2.0.0-alpha.27) (2026-02-04)


### Bug Fixes

* Simplify condition for release-publish job execution ([f7ac365](https://github.com/openfoodfacts/openfoodfacts-js/commit/f7ac36505cb15b8df728e74243767f3e0a5becc0))

## [2.0.0-alpha.26](https://github.com/openfoodfacts/openfoodfacts-js/compare/v2.0.0-alpha.25...v2.0.0-alpha.26) (2026-02-04)


### Bug Fixes

* Update release workflow to include outputs and streamline npm publish process ([6369bc6](https://github.com/openfoodfacts/openfoodfacts-js/commit/6369bc68a45c460caf4eb80a92db5cc7f6401184))

## [2.0.0-alpha.25](https://github.com/openfoodfacts/openfoodfacts-js/compare/v2.0.0-alpha.24...v2.0.0-alpha.25) (2026-02-04)


### Continuous Integration

* Include prebuild in prepack script ([616007c](https://github.com/openfoodfacts/openfoodfacts-js/commit/616007cc0cea4f46d3bad90f3379a6561e1963ad))

## [2.0.0-alpha.24](https://github.com/openfoodfacts/openfoodfacts-js/compare/v2.0.0-alpha.23...v2.0.0-alpha.24) (2026-02-04)


### Bug Fixes

* Update package URLs to openfoodfacts-js ([32892c5](https://github.com/openfoodfacts/openfoodfacts-js/commit/32892c526f999f037200f70e2d981baf42cc5a49))


### Continuous Integration

* Remove build step in package.yml ([32892c5](https://github.com/openfoodfacts/openfoodfacts-js/commit/32892c526f999f037200f70e2d981baf42cc5a49))

## [2.0.0-alpha.23](https://github.com/openfoodfacts/openfoodfacts-js/compare/v2.0.0-alpha.22...v2.0.0-alpha.23) (2026-02-04)


### Bug Fixes

* Fix package workflow triggers and publishing ([2ecdcb7](https://github.com/openfoodfacts/openfoodfacts-js/commit/2ecdcb748ecef9f3e6fe4da435fcd9f4ed953978))
* Remove git+ prefix from repository URL ([9e47031](https://github.com/openfoodfacts/openfoodfacts-js/commit/9e470319b1e3fe4cfccce8d2a0f6a6d35908c2f2))


### Miscellaneous Chores

* trigger 2.0.0-alpha.23 release ([fa44d36](https://github.com/openfoodfacts/openfoodfacts-js/commit/fa44d361965309a31e6247e16e7513a3ac1d7da7))

## [2.0.0-alpha.22](https://github.com/openfoodfacts/openfoodfacts-js/compare/v2.0.0-alpha.21...v2.0.0-alpha.22) (2026-02-04)


### Bug Fixes

* Change trigger condition for NPM publish workflow, add permissions ([814233a](https://github.com/openfoodfacts/openfoodfacts-js/commit/814233a63690d5eaac4ac363378bde6c5829bfa5))


### Miscellaneous Chores

* trigger 2.0.0-alpha.22 release ([f931df2](https://github.com/openfoodfacts/openfoodfacts-js/commit/f931df2cab420c4e7a8055697b7e8ce3214d8605))

## [2.0.0-alpha.21](https://github.com/openfoodfacts/openfoodfacts-js/compare/v2.0.0-alpha.20...v2.0.0-alpha.21) (2026-02-04)


### Features

* **images:** add selectAndCropImagesV3 method ([e23ef4f](https://github.com/openfoodfacts/openfoodfacts-js/commit/e23ef4fca3814183031be14fe693ab1a3e3b1eec))


### Bug Fixes

* Require product metadata fields in PO schemas ([837f031](https://github.com/openfoodfacts/openfoodfacts-js/commit/837f031c0461bc893dac43d40a726ec78e62f52f))
* Update GitHub workflow to publish via Yarn ([36bf328](https://github.com/openfoodfacts/openfoodfacts-js/commit/36bf328a04723283578a6c989e3dc7ef0c7379ee))


### Miscellaneous Chores

* trigger 2.0.0-alpha.21 release ([94f9e63](https://github.com/openfoodfacts/openfoodfacts-js/commit/94f9e63298e8e491c92356454c4652799f258585))

## [2.0.0-alpha.20](https://github.com/openfoodfacts/openfoodfacts-js/compare/v2.0.0-alpha.19...v2.0.0-alpha.20) (2026-01-12)


### Bug Fixes

* **auth:** enhance getLoginStatus to return error details on failure ([0a84b34](https://github.com/openfoodfacts/openfoodfacts-js/commit/0a84b34b97c5268501a0dd22885d0d9d7b825565))
* Potential fix for code scanning alert no. 10: Workflow does not contain permissions ([fd6e1c2](https://github.com/openfoodfacts/openfoodfacts-js/commit/fd6e1c240ba4aae197de1d7082a9c0aaa8ea0a19))
* Potential fix for code scanning alert no. 11: Workflow does not contain permissions ([416c7ef](https://github.com/openfoodfacts/openfoodfacts-js/commit/416c7ef32305510334193a8a0b48f0fa77231d63))
* Potential fix for code scanning alert no. 20: Workflow does not contain permissions ([35c5e43](https://github.com/openfoodfacts/openfoodfacts-js/commit/35c5e43b44023ea13f64f2996dc442dba8561eda))
* Potential fix for code scanning alert no. 9: Workflow does not contain permissions ([c9ba350](https://github.com/openfoodfacts/openfoodfacts-js/commit/c9ba3509c106e95a4f6f0975f10bcfb0fd408735))
* **search:** improve typing for charts parameter in POST /search ([a21b9f1](https://github.com/openfoodfacts/openfoodfacts-js/commit/a21b9f1843a079aed481f77cf74ead5c1d00316f))


### Miscellaneous Chores

* trigger 2.0.0-alpha.20 release ([04950ad](https://github.com/openfoodfacts/openfoodfacts-js/commit/04950ad6b60b7125740c8d6808330ae34acd308b))

## [2.0.0-alpha.19](https://github.com/openfoodfacts/openfoodfacts-js/compare/v2.0.0-alpha.18...v2.0.0-alpha.19) (2025-09-20)


### Features

* add getLoginStatus method ([e14b8fe](https://github.com/openfoodfacts/openfoodfacts-js/commit/e14b8fe57f1eb9c0abd85d1dc219d81c35b4a6fb))


### Miscellaneous Chores

* trigger 2.0.0-alpha.19 release ([d659b53](https://github.com/openfoodfacts/openfoodfacts-js/commit/d659b53285fc05dc06f7d2db5b456b7e3a447a25))

## [2.0.0-alpha.18](https://github.com/openfoodfacts/openfoodfacts-js/compare/v2.0.0-alpha.17...v2.0.0-alpha.18) (2025-09-17)


### Features

* unify TS target for CJS and ESM to ES2017 ([1352669](https://github.com/openfoodfacts/openfoodfacts-js/commit/13526695537530f834a2d5e57a192312b42bdf17))


### Bug Fixes

* make 'code' and 'schema_version' required field, add imgid ([7ebfe26](https://github.com/openfoodfacts/openfoodfacts-js/commit/7ebfe26e125b42c727127f82447dec5a260a5071))
* replace window.fetch with globalThis.fetch ([92ef159](https://github.com/openfoodfacts/openfoodfacts-js/commit/92ef159edba119cee9ee7e6db69ae50f21209665))
* send nested objects as json serialized in robotoff.annotate ([a6a9194](https://github.com/openfoodfacts/openfoodfacts-js/commit/a6a91945d0dc32e2b5fb2b18d1e20f33fdfd8393))


### Miscellaneous Chores

* trigger 2.0.0-alpha.18 release ([983d454](https://github.com/openfoodfacts/openfoodfacts-js/commit/983d45457aab48bf431553b4da3499fea05bf611))

## [2.0.0-alpha.17](https://github.com/openfoodfacts/openfoodfacts-js/compare/v2.0.0-alpha.16...v2.0.0-alpha.17) (2025-09-07)


### Features

* export ProductDataType and recorder imports ([d15d14d](https://github.com/openfoodfacts/openfoodfacts-js/commit/d15d14d42a1093a55b7ddf020a75db75f3ffa885))
* update API generation process and remove obsolete script ([0588baa](https://github.com/openfoodfacts/openfoodfacts-js/commit/0588baa6b278b55390cada13a9c0f507a06aa8d4))


### Miscellaneous Chores

* trigger 2.0.0-alpha.17 release ([bc04b46](https://github.com/openfoodfacts/openfoodfacts-js/commit/bc04b465c76a055043957ac50153f43575f92b1d))

## [2.0.0-alpha.16](https://github.com/openfoodfacts/openfoodfacts-js/compare/v2.0.0-alpha.15...v2.0.0-alpha.16) (2025-09-01)


### Features

* add getNutrients method and update type definitions for nutrient-related entities ([842689a](https://github.com/openfoodfacts/openfoodfacts-js/commit/842689acad469f94cbe6e8de0c7249bb83b9ba8d))
* export PriceFull type ([c401940](https://github.com/openfoodfacts/openfoodfacts-js/commit/c40194065234d9cfad92d9c0bc5e760a028a9b53))


### Bug Fixes

* add missing types and main entry points in package.json ([de6cc4c](https://github.com/openfoodfacts/openfoodfacts-js/commit/de6cc4cbc1a1de91234b9ce20b9eaee9e5ec22cd))


### Miscellaneous Chores

* trigger 2.0.0-alpha.16 release ([dacdfe9](https://github.com/openfoodfacts/openfoodfacts-js/commit/dacdfe9aad9f8b1ba89cc6d30d6da2296b300e39))

## [2.0.0-alpha.15](https://github.com/openfoodfacts/openfoodfacts-js/compare/v2.0.0-alpha.14...v2.0.0-alpha.15) (2025-08-24)


### Features

* add getValues method to Folksonomy class ([68a4567](https://github.com/openfoodfacts/openfoodfacts-js/commit/68a4567599f65d72d5b051d486e48c32b9e1f7e1))


### Bug Fixes

* add build step to Node.js workflow, fix tests setup ([1cd9d71](https://github.com/openfoodfacts/openfoodfacts-js/commit/1cd9d710d4755c96f7f5f3494ba3cf3ced89578b))
* refactor ProductState type inference in ProductOpenerApiV3 ([4379908](https://github.com/openfoodfacts/openfoodfacts-js/commit/43799086a307272b9b26038d5caf8e920e405c01))
* try to fix getProductV3 return type pt.2 ([946c825](https://github.com/openfoodfacts/openfoodfacts-js/commit/946c825c3b050c862ce4abe0d64acb07fd189451))
* try to fix getProductV3 return type pt.3 ([5a8c1b1](https://github.com/openfoodfacts/openfoodfacts-js/commit/5a8c1b19750c747fdf2b70f6f780eeed0f9121e6))
* Use VERSION constant for User-Agent string ([11341c9](https://github.com/openfoodfacts/openfoodfacts-js/commit/11341c9406a628e24d261131b308f0b970f8cb70))

## [2.0.0-alpha.14](https://github.com/openfoodfacts/openfoodfacts-js/compare/v2.0.0-alpha.13...v2.0.0-alpha.14) (2025-08-24)


### Bug Fixes

* auto-generate version.ts and update build process ([66ae03a](https://github.com/openfoodfacts/openfoodfacts-js/commit/66ae03abfa12b1c984569f3774b4afb4e0a1e13a))
* point export fields to the right paths ([056349c](https://github.com/openfoodfacts/openfoodfacts-js/commit/056349c6ad403c06b3db9d7e80d93dcc04c752dc))
* replace export with export type to make bundlers work ([4b57979](https://github.com/openfoodfacts/openfoodfacts-js/commit/4b57979e80a361f939bf12c8e17beeda6a51baa7))
* switch import paths to ES modules ([3bed3ac](https://github.com/openfoodfacts/openfoodfacts-js/commit/3bed3ac1d21c41a60c623f7cff0e7405ff1e0304))


### Miscellaneous Chores

* trigger 2.0.0-alpha.14 release ([ac1f117](https://github.com/openfoodfacts/openfoodfacts-js/commit/ac1f11765f9169ea5cde6c1824a572bacc08cece))

## [2.0.0-alpha.13](https://github.com/openfoodfacts/openfoodfacts-js/compare/v2.0.0-alpha.12...v2.0.0-alpha.13) (2025-08-24)


### ⚠ BREAKING CHANGES

* split v2 and v3, reorganize exports, use multiple returns ([#690](https://github.com/openfoodfacts/openfoodfacts-js/issues/690))

### Code Refactoring

* split v2 and v3, reorganize exports, use multiple returns ([#690](https://github.com/openfoodfacts/openfoodfacts-js/issues/690)) ([9c3b1d4](https://github.com/openfoodfacts/openfoodfacts-js/commit/9c3b1d4d5639256f1b2f1fc051349e06dc0b54b1))

## [2.0.0-alpha.12](https://github.com/openfoodfacts/openfoodfacts-js/compare/v2.0.0-alpha.11...v2.0.0-alpha.12) (2025-08-20)


### Features

* **api:** add Facets Knowledge Panel API and Facets types ([db99d62](https://github.com/openfoodfacts/openfoodfacts-js/commit/db99d620391361884008d1e3548326c64a0471c4))
* **api:** add KnowledgePanel types and elements structure ([04b9199](https://github.com/openfoodfacts/openfoodfacts-js/commit/04b9199f649c73e8b8df6c911e8e6e95b4fbf447))
* **api:** add methods to fetch facet and facet values ([f35ed4d](https://github.com/openfoodfacts/openfoodfacts-js/commit/f35ed4da422f064f742fa489dfaec26c9301aad4))
* implement facet api ([402cf24](https://github.com/openfoodfacts/openfoodfacts-js/commit/402cf24fa3af848ea325411bf40f106fcfbcb366))


### Bug Fixes

* add language option to OpenFoodFactsOptions and constructor defaults ([a8d9c15](https://github.com/openfoodfacts/openfoodfacts-js/commit/a8d9c15a0114e16d5e3c8abf3d8c511b7e0b6f97))
* **test:** do not specify return type if not needed ([d28c691](https://github.com/openfoodfacts/openfoodfacts-js/commit/d28c691d27c134b6688072ba72df642eadab34b1))


### Miscellaneous Chores

* bump version to 2.0.0-alpha.12 ([3d64d4e](https://github.com/openfoodfacts/openfoodfacts-js/commit/3d64d4e65bb66727dafa5fd8fede73edc3292d9f))

## [2.0.0-alpha.11](https://github.com/openfoodfacts/openfoodfacts-js/compare/v2.0.0-alpha.10...v2.0.0-alpha.11) (2025-08-12)


### Features

* implement image edit api ([#675](https://github.com/openfoodfacts/openfoodfacts-js/issues/675)) ([f86e0c8](https://github.com/openfoodfacts/openfoodfacts-js/commit/f86e0c88f1aa22dd32ce623c09db4ac04bb19f23))


### Miscellaneous Chores

* bump version to 2.0.0-alpha.11 ([0fe67be](https://github.com/openfoodfacts/openfoodfacts-js/commit/0fe67beab1527842e00a5537da088088fee9d973))

## [2.0.0-alpha.10](https://github.com/openfoodfacts/openfoodfacts-nodejs/compare/v2.0.0-alpha.9...v2.0.0-alpha.10) (2025-08-02)


### Features

* add getAttributeGroups method ([9c0f72b](https://github.com/openfoodfacts/openfoodfacts-nodejs/commit/9c0f72b6647d3673ef0aa85a5523bd1e01ee3b51))
* api to get attribute-groups ([#669](https://github.com/openfoodfacts/openfoodfacts-nodejs/issues/669)) ([934030f](https://github.com/openfoodfacts/openfoodfacts-nodejs/commit/934030fb6031ec920958eeba57a5a37e67ecf616))
* moved products api to off.ts and added functions used in explorer ([#660](https://github.com/openfoodfacts/openfoodfacts-nodejs/issues/660)) ([1f654c6](https://github.com/openfoodfacts/openfoodfacts-nodejs/commit/1f654c60d1d0e4259979216cd88d04de75fde092))
* streamline api typing generation ([ffafc0a](https://github.com/openfoodfacts/openfoodfacts-nodejs/commit/ffafc0a270910788359d3e9aad4b97bb8f5bd5fd))


### Miscellaneous Chores

* bump version to 2.0.0-alpha.10 ([fef12ca](https://github.com/openfoodfacts/openfoodfacts-nodejs/commit/fef12cab2922e18d320de6cb4bb81ff518fa590b))

## [2.0.0-alpha.9](https://github.com/openfoodfacts/openfoodfacts-nodejs/compare/v2.0.0-alpha.8...v2.0.0-alpha.9) (2025-07-18)


### Features

* add v3 API support and deprecate getProduct in favor of ([fb439f4](https://github.com/openfoodfacts/openfoodfacts-nodejs/commit/fb439f43464fed00c3366445738e6163031435a0))
* Added API for fetching currencies list ([#653](https://github.com/openfoodfacts/openfoodfacts-nodejs/issues/653)) ([32e014c](https://github.com/openfoodfacts/openfoodfacts-nodejs/commit/32e014c14dda90a6f3f753fd4f9fa26342910ba1))


### Miscellaneous Chores

* release 2.0.0-alpha.9 ([a7826c8](https://github.com/openfoodfacts/openfoodfacts-nodejs/commit/a7826c8ed3f84b77637313c4309c43c48732c309))

## [2.0.0-alpha.8](https://github.com/openfoodfacts/openfoodfacts-nodejs/compare/v2.0.0-alpha.7...v2.0.0-alpha.8) (2025-07-12)


### Features

* add getProductImageFolder method to return product image base URL ([#646](https://github.com/openfoodfacts/openfoodfacts-nodejs/issues/646)) ([7aa9da4](https://github.com/openfoodfacts/openfoodfacts-nodejs/commit/7aa9da4ae0bc1e513ccfd991b407f6cb1e151c0f))
* refresh schemas to latest version & adapt (test) code ([7a52aa4](https://github.com/openfoodfacts/openfoodfacts-nodejs/commit/7a52aa44a71459381b58e22eba78444d900e935d))


### Bug Fixes

* remove $schemas path alias and update imports accordingly ([c7c7f9c](https://github.com/openfoodfacts/openfoodfacts-nodejs/commit/c7c7f9cad8e521dbb807ca361489af7f4c0c264d))
* remove externalv2 import from v2 schema ([5fce7e9](https://github.com/openfoodfacts/openfoodfacts-nodejs/commit/5fce7e9011812305aa13f5491e788218d466560e))


### Miscellaneous Chores

* bump version to 2.0.0-alpha.8 ([c342334](https://github.com/openfoodfacts/openfoodfacts-nodejs/commit/c34233447f8eac0faab0685b05b6dfb3c0deb847))

## 1.0.0 (2022-04-27)

### Features

- **additives:** add getAdditives function ([f8abf40](https://github.com/openfoodfacts/openfoodfacts-nodejs/commit/f8abf40e0f083a81624fcd4f875bb77c157071fe))
- **country:** OFF is now set to be immutable ([604edc3](https://github.com/openfoodfacts/openfoodfacts-nodejs/commit/604edc34a26ced68032687e21f8f0d05be6d6ade))
- **facets:** add functions for the rest of the OFF facets ([64c17f4](https://github.com/openfoodfacts/openfoodfacts-nodejs/commit/64c17f43e942bbc3eaa70c5aac15003ac67354e3))
- **feature added:** more functions added in the package ([fd44462](https://github.com/openfoodfacts/openfoodfacts-nodejs/commit/fd44462d6d58d8e497eb3b031a63f5be6355b39d))

### Bug Fixes

- **additives:** remove useless line ([7944550](https://github.com/openfoodfacts/openfoodfacts-nodejs/commit/7944550e45ab50603c5e6db9e08ec88642f0fb6f))
- dependabot.yml syntax ([56c015d](https://github.com/openfoodfacts/openfoodfacts-nodejs/commit/56c015d61b6067f082072bbe9f021414b26d1b37))
- skip CodeQL for Dependabot on push events ([56fae76](https://github.com/openfoodfacts/openfoodfacts-nodejs/commit/56fae76222ef1d0f11b6013f147819910aae367d))
- tests for ci (npm ci) ([cf08b37](https://github.com/openfoodfacts/openfoodfacts-nodejs/commit/cf08b37beea9d7823c02e8b468b9c0308b17ebf9))
