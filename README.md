# tmrowapp-contrib [![Slack Status](http://slack.tmrow.com/badge.svg)](http://slack.tmrow.com) [![CircleCI](https://circleci.com/gh/tmrowco/tmrowapp-contrib.svg?style=shield)](https://circleci.com/gh/tmrowco/tmrowapp-contrib)

This repository contains the open-source integrations that allows the [Tomorrow](https://www.tmrow.com) app to automatically calculate your carbon impact. The [Tomorrow](https://www.tmrow.com) app is private-by-design: data will stay on device, unless the user explicitly gives consent.
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

## Getting started
To ease development, we've created a development playground.

### Integrations
First, you will have to create a JSON file called `env.json` where to store integration credientials when needed.
You can start by creating an empty file.

Run `yarn` to install dependencies, then run `yarn serve` to start the playground and point your browser to [localhost:3000](http://localhost:3000) to get started.

### How an integration works
The job of an integration is to gather activities from a 3rd party datasource.
To this end, 3 async methods need to be exported:

```javascript
async function connect(requestLogin, requestWebView) {
  const { username, password } = await requestLogin();
  // ...
  return newState;
}
async function collect(state = {}, logger) {
  // ...
  return { activities, state: newState };
}
async function disconnect() {
  // ...
  return newState;
}
```

The `connect` method is used to ask for user credentials (we also support OAuth flows).
The `collect` method is called periodically (typically every few hours) to fetch new activities.
As the methods are pure, and to avoid re-asking the user for credentials everytime the `collect` method is called, a `state` object can be used to persist information (such as password, tokens..) across `collect`s.

### Activity formats
For now please check the examples.

## Folder structure
- `./co2eq`: carbon models
- `./integrations`: contains all integrations
- `./integrations/img`: contains all integration logos
- `./playground`: source code of the playground
- `./definitions.js`: constant definitions
