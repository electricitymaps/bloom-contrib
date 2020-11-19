#!/usr/bin/env bash

set -euo pipefail

BABEL_CONFIG="--ignore=**/*.test.js"
DIST_FOLDER="dist"

rm -rf ${DIST_FOLDER}
yarn --silent babel co2eq          ${BABEL_CONFIG} --out-dir ${DIST_FOLDER}/co2eq
yarn --silent babel integrations   ${BABEL_CONFIG} --out-dir ${DIST_FOLDER}/integrations
yarn --silent babel definitions.js ${BABEL_CONFIG} --out-dir ${DIST_FOLDER}

yarn --silent copyfiles "co2eq/**/*.json" ${DIST_FOLDER}
yarn --silent copyfiles "integrations/**/*.json" ${DIST_FOLDER}
