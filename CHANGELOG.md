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
