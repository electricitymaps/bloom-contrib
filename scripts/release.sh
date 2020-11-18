#!/usr/bin/env bash

set -euo pipefail

echo "//registry.npmjs.org/:_authToken=$NPM_TOKEN" > ~/.npmrc

# Bump the patch version number
npm version patch

# Publish from dist folder to get cleaner imports
cp package.json LICENSE.txt README.md dist/
cd dist

echo "Deploying"
npm publish --access public

# Push new version commit and tags
git push origin --tags
