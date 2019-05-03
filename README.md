# tmrowapp-contrib [![Slack Status](http://slack.tmrow.com/badge.svg)](http://slack.tmrow.com) [![CircleCI](https://circleci.com/gh/tmrowco/tmrowapp-contrib.svg?style=shield)](https://circleci.com/gh/tmrowco/tmrowapp-contrib)

This repository contains the open-source integrations that allows the [Tomorrow](https://www.tmrow.com) app to automatically calculate your carbon impact.
It also contains the CO2 models used by the app.
This code is maintained by [Tomorrow](https://www.tmrow.com).

To get started, browse existing [suggestions](https://github.com/tmrowco/tmrowapp-contrib/issues).

You can [contribute](#contribute) by
- [suggesting](https://github.com/tmrowco/tmrowapp-contrib/issues/new) a new integration
- **coding a new [integration](https://github.com/tmrowco/tmrowapp-contrib/tree/master/integrations)**
- **updating our [carbon models](https://github.com/tmrowco/tmrowapp-contrib/tree/master/co2eq)**
- correcting a [bug](https://github.com/tmrowco/tmrowapp-contrib/issues) in an existing integration.
- submitting ideas, feature requests, or bugs in the [issues](https://github.com/tmrowco/tmrowapp-contrib/issues/new) section.

Join us on [Slack](https://slack.tmrow.com) if you wish to discuss development, need help to get started and want to get access to a developer preview of the app.

## Playground
To ease development, we've created a development playground.
First run `yarn` to install dependencies, then run `yarn serve` to start the playground and point your browser to [localhost:3000](http://localhost:3000) to get started.

## Folder structure
- `./co2eq`: carbon models
- `./integrations`: contains all integrations
- `./integrations/img`: contains all integration logos
- `./playground`: source code of the playground
- `./definitions.js`: constant definitions
