#!/usr/bin/env bash

set -euo pipefail

if [ -z "$NPM_TOKEN" ]; then
  echo "Expected NPM_TOKEN to be defined"
  exit 1
fi

echo "//registry.npmjs.org/:_authToken=$NPM_TOKEN" > ~/.npmrc

# Bump the patch version number
npm version patch

echo "Deploying"
npm publish --access public

# Push new version commit and tags
git push origin --tags
