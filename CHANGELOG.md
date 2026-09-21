## [1.4.2](https://github.com/danielheene/website/compare/v1.4.1...v1.4.2) (2026-09-21)


### Bug Fixes

* **ts:** resolve ButtonProps type errors from tailwind-variants v3.7 ([#79](https://github.com/danielheene/website/issues/79)) ([02c75cd](https://github.com/danielheene/website/commit/02c75cd3a7120095d264878d32bc72aed6b87aab))

## [1.4.1](https://github.com/danielheene/website/compare/v1.4.0...v1.4.1) (2026-09-21)


### Bug Fixes

* **env:** remove unused NEXT_PUBLIC_MAPBOX_API_KEY from env schema ([#78](https://github.com/danielheene/website/issues/78)) ([1d948b4](https://github.com/danielheene/website/commit/1d948b4c81c082381313a8aad14c525d1c31f64a))

# [1.4.0](https://github.com/danielheene/website/compare/v1.3.0...v1.4.0) (2026-09-21)


### Features

* hero single variant, OG fallback bg, address sync, skill sort fixes ([#77](https://github.com/danielheene/website/issues/77)) ([20e9487](https://github.com/danielheene/website/commit/20e94873211f104446fdd325abcc9292938d03bb))

# [1.3.0](https://github.com/danielheene/website/compare/v1.2.7...v1.3.0) (2026-09-20)


### Features

* **admin:** link group row labels, meta SERP progress bar, own-tracking hook ([#76](https://github.com/danielheene/website/issues/76)) ([c27175b](https://github.com/danielheene/website/commit/c27175b57799f1cc0e440c036aaabfeaa365dd0c)), closes [#e8eaf2](https://github.com/danielheene/website/issues/e8eaf2) [#9e9e9e](https://github.com/danielheene/website/issues/9e9e9e)

## [1.2.7](https://github.com/danielheene/website/compare/v1.2.6...v1.2.7) (2026-09-20)


### Bug Fixes

* **storybook:** suppress noisy "use client" Rollup warnings on build ([#75](https://github.com/danielheene/website/issues/75)) ([4c53529](https://github.com/danielheene/website/commit/4c535296e5a1cc65a757d11335e277d3f66c3124))

## [1.2.6](https://github.com/danielheene/website/compare/v1.2.5...v1.2.6) (2026-09-19)


### Bug Fixes

* **bilingual:** require a signed-in user in enqueueBilingualTranslation ([#74](https://github.com/danielheene/website/issues/74)) ([b06aba0](https://github.com/danielheene/website/commit/b06aba0642791c30e1064a4ac2039939b30a91c5))

## [1.2.5](https://github.com/danielheene/website/compare/v1.2.4...v1.2.5) (2026-09-19)


### Bug Fixes

* **storybook:** drop serve's SPA rewrite mode, breaking iframe routing ([#71](https://github.com/danielheene/website/issues/71)) ([363dafe](https://github.com/danielheene/website/commit/363dafedcef23040a1069ba2de0f33b517ad12ad))

## [1.2.4](https://github.com/danielheene/website/compare/v1.2.3...v1.2.4) (2026-09-06)


### Bug Fixes

* **docker:** pin builder stage to NODE_ENV=production ([#67](https://github.com/danielheene/website/issues/67)) ([2f43050](https://github.com/danielheene/website/commit/2f430508a7004894e86c394cf9e0bfc5609e8532))

## [1.2.3](https://github.com/danielheene/website/compare/v1.2.2...v1.2.3) (2026-09-06)


### Bug Fixes

* **docker:** mount build secrets to .env instead of .env.production ([#66](https://github.com/danielheene/website/issues/66)) ([c6266a2](https://github.com/danielheene/website/commit/c6266a25ec5567a14888436f28ef733898b06432))

## [1.2.2](https://github.com/danielheene/website/compare/v1.2.1...v1.2.2) (2026-09-05)


### Bug Fixes

* **deps:** resolve 13 of 23 open Dependabot alerts ([#61](https://github.com/danielheene/website/issues/61)) ([f61a732](https://github.com/danielheene/website/commit/f61a732a7ff2b8ef85cb6e99e4f427aa26d58401))

## [1.2.1](https://github.com/danielheene/website/compare/v1.2.0...v1.2.1) (2026-09-02)


### Bug Fixes

* **ci:** wait for ci.yml's images before promoting on push/PR-merge ([#60](https://github.com/danielheene/website/issues/60)) ([397c08f](https://github.com/danielheene/website/commit/397c08fa7ea325d1694d1cf73c91093cccd9c784)), closes [#57](https://github.com/danielheene/website/issues/57)

# [1.2.0](https://github.com/danielheene/website/compare/v1.1.0...v1.2.0) (2026-09-01)


### Features

* **docker:** add OCI version/revision labels to app/worker/storybook images ([#57](https://github.com/danielheene/website/issues/57)) ([c5743f9](https://github.com/danielheene/website/commit/c5743f9bf794d54b9a8a186f7878d10efde77c0d))

# [1.1.0](https://github.com/danielheene/website/compare/v1.0.1...v1.1.0) (2026-09-01)


### Features

* **ci:** build docker images for amd64 and arm64 ([#59](https://github.com/danielheene/website/issues/59)) ([f3e5317](https://github.com/danielheene/website/commit/f3e5317baffbe542eb14660c70ca08aa3f95b725))

## [1.0.1](https://github.com/danielheene/website/compare/v1.0.0...v1.0.1) (2026-09-01)


### Bug Fixes

* **docker:** point worker's HEALTHCHECK at its own health server ([#56](https://github.com/danielheene/website/issues/56)) ([7a64734](https://github.com/danielheene/website/commit/7a647340a433c64fca1828be62bb5149be4cdcba))
* **husky:** pass syncpack a real subcommand + --source in the pre-commit hook ([#58](https://github.com/danielheene/website/issues/58)) ([b9ae018](https://github.com/danielheene/website/commit/b9ae018cd3752ce5790d554cafd5e331deb0d6e1))

# 1.0.0 (2026-08-31)


### Bug Fixes

* **ci:** stop skipped test/commitlint jobs from cascading into build skips ([#50](https://github.com/danielheene/website/issues/50)) ([358439b](https://github.com/danielheene/website/commit/358439bebcf91e3b03638436ea33d7a355f16cf0))
* **ci:** use a GitHub App token to push release's version-bump commit ([#55](https://github.com/danielheene/website/issues/55)) ([52ad39e](https://github.com/danielheene/website/commit/52ad39ed25c687234ef9f02060efb0d86ba2a942))


### Features

* initial commit ([81e3a68](https://github.com/danielheene/website/commit/81e3a682f2eb196ced820c0816d0d869e286f5ae))
