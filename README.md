![Image description](https://north-app.com/appblogheader.png)

# northapp-contrib [![Slack Status](http://slack.tmrow.com/badge.svg)](http://slack.tmrow.com) [![DroneCI](https://drone.tmrow.com/api/badges/tmrowco/tmrow/status.svg)](https://circleci.com/gh/tmrowco/northapp-contrib)

Welcome to the open-source repository of the North app!👋

## What is the North app?
The [North](https://www.north-app.com) app automatically calculates your carbon footprint by connecting to other services and apps in your life and translating activities from these apps and activities to greenhouse gas emissions.

The app is private-by-design: data will stay on device, unless the user explicitly gives consent. This code is maintained by [Tomorrow](https://www.tmrow.com).

Feel free to watch [the presentation](https://www.youtube.com/watch?v=keOPXD-ojWY) our Founder Olivier gave to the CopenhagenJS meetup, explaining what a JavaScript developer can do to combat climate change. If you have any questions, want early access to the app or just want to hang out with people fighting climate change with code, join [our Slack community](https://slack.tmrow.com).

## Tomorrow is hiring!
The company behind the North app builds tech to empower organisations and individuals to understand and reduce their carbon footprint.

We're hiring great people to join our team in Copenhagen. Head over to [our jobs page](https://www.tmrow.com/jobs) if you want to help out!

## Structure of this repository

- `./co2eq`: carbon models
- `./integrations`: contains all integrations
- `./integrations/img`: contains all integration logos
- `./playground`: source code of the playground
- `./definitions.js`: constant definitions


## How can I help?
You can help by:

- Helping us find, add and improve integrations with 3rd party services
- Helping us find, add and improve our Life Cycle Assesment / Carbon footprint data
- Giving us ideas, feedback and reporting bugs

### Integrating purchases and activities
[We wrote a little article about what we believe makes a great integration](https://tmrow.slite.com/api/s/note/8LLSWazeBZZyS4BEQiLTnJ/What-makes-a-great-integration-for-Tomorrow).
However, that shouldn't stop you from doing an integration which is interesting and useful to you! Our only requirement is that it can be quantified in greenhouse gas emissions.

Integrations can rely on an API or even on scrapers if necessary.

#### Suggesting an integration
Here is the list of current 3rd party integrations:
Official integrations:
- ✈️ Tripit (tracks most airlines!)
- ⚡ Barry
- 🚗 Tesla Cockpit

Community-supported integrations:
- ✈️ Ryanair (contributor:[lauvrenn](https://github.com/lauvrenn))
- ✈️ Wizzair (contributor:[lauvrenn](https://github.com/lauvrenn))
- 🚂 Rejsekort
- 🚂 Trainline (contributor:[liamgarrison](https://github.com/liamgarrison))
- 🚂 Transport for London (contributor:[liamgarrison](https://github.com/liamgarrison))
- ⚡ Sense (contributor:[snarfed](https://github.com/snarfed))
- ⚡ Linky (contributor:[bokub](https://github.com/bokub))
- ⚡ Ørsted (contributor:[felixdq](https://github.com/felixdq))
- 🚗 Renault Zoé
- 🚗 Uber (contributor:[willtonkin](https://github.com/willtonkin))
- 🚗 Automatic (contributor:[lauvrenn](https://github.com/lauvrenn))
- 🚗 MinVolkswagen (contributor:[folkev0gn](https://github.com/folkev0gn))

You can [suggest a new integration here](https://github.com/tmrowco/northapp-contrib/issues/new).

#### Coding or debugging a new integration

If you don't have an idea on your own or prefer to debug an integration, you can find integration suggestions and bugs in [the issues](https://github.com/tmrowco/northapp-contrib/issues).

To make it easy for anyone to help out, a development playground is available:

First, run `yarn` to install dependencies at the root of the repository.
Next from the `playground` folder, run `yarn` to install dependencies, then run `yarn serve` to start the playground and point your browser to [localhost:3000](http://localhost:3000) to get started.

#### How to make an integration work
An integration gathers activities from a 3rd party datasource.
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

The `connect` method is used to ask for user credentials (OAuth flows are also supported).
The `collect` method is called periodically (typically every few hours) to fetch new activities.
As the methods are pure, and to avoid re-asking the user for credentials everytime the `collect` method is called, a `state` object can be used to persist information (such as password, tokens..) across `collect`s.

Activities require a certain formatting:

##### Transportation activity formatting
```javascript
{
  id, // a string that uniquely represents this activity
  datetime, // a javascript Date object that represents the start of the activity
  endDatetime, // a javascript Date object that represents the end of the activity. If the activity has no duration, set to "null"
  distanceKilometers, // a floating point that represents the amount of kilometers traveled
  activityType: ACTIVITY_TYPE_TRANSPORTATION,
  transportationMode, // a variable (from definitions.js) that represents the transportation mode
  carrier, // (optional) a string that represents the transportation company
  departureAirportCode, // (for plane travel) a string that represents the departure airport, IATA code
  destinationAirportCode, // (for plane travel) a string that represents the final destination airport, IATA code
  departureStation, // (for other travel types) a string that represents the original starting point
  destinationStation, // (for other travel types) a string that represents the final destination
  participants, // (optional) the number of passengers (for car and motorbike travels)
}
```

##### Lodging activity formatting
```javascript
{
  id, // a string that uniquely represents this activity
  datetime, // a javascript Date object that represents the start of the activity
  endDatetime, // a javascript Date object that represents the end of the activity. If the activity has no duration, set to "null"
  activityType: ACTIVITY_TYPE_LODGING,
  hotelClass, // a variable (from definitions.js) that represents the class of the hotel
  countryCodeISO2, // a string with the ISO2 country code that represents the country of the hotel
  participants, // (optional) the number of people sharing one hotel room
  hotelName, // (optional) a string that represents the name of the hotel
  locationLon, // (optional) the longitude of the location of the hotel
  locationLat, // (optional) the latitude of the location of the hotel
}
```

##### Electricity consumption activity formatting
```javascript
{
  id, // a string that uniquely represents this activity
  datetime, // a javascript Date object that represents the start of the activity
  endDatetime, // a javascript Date object that represents the end of the activity. If the activity has no duration, set to "null"
  activityType: ACTIVITY_TYPE_ELECTRICITY,
  energyWattHours, // a float that represents the total energy used
  hourlyEnergyWattHours, // (optional) an array of 24 floats that represent the hourly metering values
  locationLon, // (optional) the longitude of the location of the electricity usage
  locationLat, // (optional) the latitude of the location of the electricity usage
}
```

##### Transaction activity formatting
```javascript
{
  id, // a string that uniquely represents this activity
  datetime, // a javascript Date object that represents the start of the activity
  label, // a string that represents the transaction
  activityType: ACTIVITY_TYPE_PURCHASE,
  merchantDisplayName, // (optional) a string that represents the merchant where the purchase was made
  lineItems, // an array with specific items that can be either in monetary or amount-based form: [{ identifier: XX, value: 2.1, unit: XX}] where `identifier` is a key from footprints.yml and `unit` a valid unit from definitions.js. See purchase/index.test.js for examples.
  bankDisplayName, // (required for integrations with banks) a string that represents the banks' name
  bankIdentifier, // (required for integrations with banks) a string that uniquely represents the bank.
}
```
##### Meal activity formatting
```javascript
{
  id, // a string that uniquely represents this activity
  datetime, // a javascript Date object that represents the start of the activity
  label, // a string that represents the meal
  activityType: ACTIVITY_TYPE_MEAL,
  lineItems, // (required if the activity contains ingredients) an array with an object [{ identifier: xx, value: 2.1, unit: 'kg'}] where `identifier` is a key from footprints.yml and `unit` a valid unit from definitions.js
  mealType, // (required if the activity is a meal type) a string with the value being one of the meal type options in definitions.js
}
```


### Adding or updating Life Cycle Assessment / Carbon Footprint of purchases and activities

Our current models and Life Cycle assessments are accessible [here](https://github.com/tmrowco/northapp-contrib/tree/master/co2eq). If you know better sources, please contribute with your knowledge.

If you want to add individual items or ingredients, this is done [here](https://github.com/tmrowco/northapp-contrib/blob/master/co2eq/purchase/footprints.yml). Ideally, the studies used should be as global as possible and it's even better if they're systemic reviews (multiple studies in one!).

#### CO2 Model Structure

Currently, CO2 models must expose the following variables:

```javascript
export const modelName = 'model name'; // Specify name of the model
export const modelVersion = '0'; // Specify the current model version
export const explanation = {
  text: 'description of the model',
  links: [
    { label: 'Source Name (year)', href: 'link to source' }
  ],
}; // Description and sources of the model
export const modelCanRunVersion = 0; // Specify the current version of the can run function

export function modelCanRun(activity) {
  const {
    ...
  } = activity; // Deconstruction of activity for relevant fields
  if (fields are present) {
    return true;
  }
  return false;
} // Verifies that an activity trigger the model to compute CO2 footprint

export function carbonEmissions(activity) {
  // ...
  return co2eqEmission
  }
} // Computes the CO2 footprint of the activity
```

#### CO2 Model Update

After each update of a CO2 model, its version, controlled by variable

```javascript
export const modelVersion = '0';
```

must be incremented.



### Giving ideas, features requests or bugs

Please [add an issue here](https://github.com/tmrowco/northapp-contrib/issues/new) or directly in the app.
