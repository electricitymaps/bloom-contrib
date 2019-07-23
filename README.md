# tmrowapp-contrib [![Slack Status](http://slack.tmrow.com/badge.svg)](http://slack.tmrow.com) [![CircleCI](https://circleci.com/gh/tmrowco/tmrowapp-contrib.svg?style=shield)](https://circleci.com/gh/tmrowco/tmrowapp-contrib)

This repository contains the open-source integrations that allows the [Tomorrow](https://www.tmrow.com) app to automatically calculate your carbon impact. The [Tomorrow](https://www.tmrow.com) app is private-by-design: data will stay on device, unless the user explicitly gives consent.
It also contains the CO2 models used by the app.
This code is maintained by [Tomorrow](https://www.tmrow.com).

To get started, browse existing [suggestions](https://github.com/tmrowco/tmrowapp-contrib/issues). Feel free to watch [the presentation](https://www.youtube.com/watch?v=keOPXD-ojWY) of our CEO & Founder Olivier gave to CopenhagenJS, explaining what a javascript developer can do to combat climate change.

You can [contribute](#contribute) by
- [suggesting](https://github.com/tmrowco/tmrowapp-contrib/issues/new) a new integration
- **coding a new [integration](https://github.com/tmrowco/tmrowapp-contrib/tree/master/integrations)**
- **updating our [carbon models](https://github.com/tmrowco/tmrowapp-contrib/tree/master/co2eq)**
- correcting a [bug](https://github.com/tmrowco/tmrowapp-contrib/issues) in an existing integration.
- submitting ideas, feature requests, or bugs in the [issues](https://github.com/tmrowco/tmrowapp-contrib/issues/new) section.

Join us on [Slack](https://slack.tmrow.com) if you wish to discuss development, need help to get started and want to get access to a developer preview of the app.

## Status on [integrations](https://github.com/tmrowco/tmrowapp-contrib/tree/master/integrations)

### Transportation

#### Manual
The app let's you input trips manually by distance or time and transportation mode, and amount of passengers for a car trip.

#### Automated
- Tripit
- Uber (contributor:[willtonkin](https://github.com/willtonkin))
- Rejsekort
Help us out with an integration and CO2 models. Check what [we think makes a great integration!](https://tmrow.slite.com/api/s/note/8LLSWazeBZZyS4BEQiLTnJ/What-makes-a-great-integration-for-Tomorrow)

### Utilities

#### Manual
Working on it.

#### Automated
- Sense (contributor:[snarfed](https://github.com/snarfed))
- Linky (contributor:[bokub](https://github.com/bokub))
- Barry
- Renault Zoé

Help us out with an integration and CO2 models. Check what [we think makes a great integration!](https://tmrow.slite.com/api/s/note/8LLSWazeBZZyS4BEQiLTnJ/What-makes-a-great-integration-for-Tomorrow)

### Groceries
#### Manual
The app let's you input meals manually by type of food. Help us out with more CO2 models!

#### Automated
Nothing yet! Help us out with an integration and CO2 models. Check what [we think makes a great integration!](https://tmrow.slite.com/api/s/note/8LLSWazeBZZyS4BEQiLTnJ/What-makes-a-great-integration-for-Tomorrow)

### Others
#### Manual
Working on it.

#### Automated
Nothing yet! Help us out with an integration and CO2 models. Check what [we think makes a great integration!](https://tmrow.slite.com/api/s/note/8LLSWazeBZZyS4BEQiLTnJ/What-makes-a-great-integration-for-Tomorrow)

## Status on [CO2 models](https://github.com/tmrowco/tmrowapp-contrib/tree/master/integrations)

Our CO2 models sources can be checked by anyone [here](https://github.com/tmrowco/tmrowapp-contrib/tree/master/integrations). Help us out with more and more precise models.

## Getting started
To ease development, we've created a development playground.

### Integrations
First, you will have to create a JSON file called `env.json` where to store integration credentials when needed.
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
#### electricity consumption
```javascript
{
  id, // a string that uniquely represents this activity
  datetime, // a javascript Date object that represents the start of the activity
  durationHours, // an integer that represents the duration of the activity
  activityType: ACTIVITY_TYPE_ELECTRICITY,
  energyWattHours, // a float that represents the total energy used
  hourlyEnergyWattHours, // (optional) an array of 24 floats that represent the hourly metering values
  locationLon, // the location of the electricity consumption
  locationLat, // the location of the electricity consumption
}
```
#### transportation
```javascript
{
  id, // a string that uniquely represents this activity
  datetime, // a javascript Date object that represents the start of the activity
  durationHours, // a floating point that represents the duration of the activity in decimal hours
  distanceKilometers, // a floating point that represents the amount of kilometers traveled
  activityType: ACTIVITY_TYPE_TRANSPORTATION,
  transportationMode, // a variable (from definitions.js) that represents the transportation mode
  carrier, // (optional) a string that represents the transportation company
  departureAirportCode, // (for plane travel) a string that represents the departure airport, IATA code
  destinationAirportCode, // (for plane travel) a string that represents the final destination airport, IATA code
  departureStation, // (for other travel types) a string that represents the original starting point
  destinationStation, // (for other travel types) a string that represents the final destination
}
```

## Folder structure
- `./co2eq`: carbon models
- `./integrations`: contains all integrations
- `./integrations/img`: contains all integration logos
- `./playground`: source code of the playground
- `./definitions.js`: constant definitions
