# Northapp-Contribution [![Slack Status](http://slack.tmrow.com/badge.svg)](http://slack.tmrow.com) [![CircleCI](https://circleci.com/gh/tmrowco/northapp-contrib.svg?style=shield)](https://circleci.com/gh/tmrowco/northapp-contrib)

Welcome to the open-source repository for the carbon models and integrations used at Tomorrow! 👋

## Bloom

[Bloom](https://www.bloomclimate.com) is a SaaS that allow companies to become climate leaders, from calculating their climate impact to communicating about their climate efforts. It connects to as many data sources as possible to assess your carbon footprint and find mitigation opportunities.

## Tomorrow is hiring!
Tomorrow, the organisation behind Bloom builds tech to empower organisations and individuals to understand and reduce their carbon footprint.

We're often hiring great people to join our team in Copenhagen. Head over to [our jobs page](https://www.tmrow.com/jobs) if you want to help out!

## Structure of this repository

- `./co2eq`: carbon models
- `./integrations`: contains all integrations
- `./integrations/img`: contains all integration logos
- `./playground`: source code of the playground for integrations
- `./definitions.js`: constant definitions

## How can I help?
You can help by helping us find, add and improve our Life Cycle Assessment (LCA) data as well as our carbon models.

### Adding or updating Life Cycle Assessment / carbon footprint of purchases and activities

Our current models and Life Cycle Assessments (LCAs) that we use are accessible [here](https://github.com/tmrowco/northapp-contrib/tree/master/co2eq). Feel free to suggest new sources or add your own LCAs.

If you want to add individual items or ingredients, this is done [here](https://github.com/tmrowco/northapp-contrib/blob/master/co2eq/purchase/footprints.yml). Ideally, the studies used should be as global as possible and it's even better if they're systemic reviews (multiple studies in one!).

We also have open-sourced how we calculate the monetary emission factors used to compute the carbon footprint of a transactions.
This can be found [here](https://github.com/tmrowco/northapp-contrib/tree/master/co2eq/purchase). 

#### Structure of a carbon model

Currently, carbon models must expose the following variables:

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

#### Updating a carbon model

When a carbon model is updated, its version, controlled by the variable

```javascript
export const modelVersion = '0';
```

must be incremented.



### Integrations

Our community has built integrations, that gather activities from a 3rd party datasource. 
All of them are used in the North app. Some of them may be used in Bloom.

Here is the list of current 3rd party integrations:
Official integrations:
- ✈️ Tripit
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
- 📧 Outlook (contributor:[baywet](https://github.com/baywet))
- 🚗 Renault Zoé
- 🚗 Uber (contributor:[willtonkin](https://github.com/willtonkin))
- 🚗 Automatic (contributor:[lauvrenn](https://github.com/lauvrenn))
- 🚗 MinVolkswagen (contributor:[folkev0gn](https://github.com/folkev0gn))


#### Coding or debugging an integration

If you want to work on or debug an integration, you may be able to find integration suggestions and bugs in [the issues](https://github.com/tmrowco/northapp-contrib/issues).

To make it easy for anyone to help out, a development playground is available:

First, run `yarn` to install dependencies at the root of the repository.
Next from the `playground` folder, run  `yarn serve` to start the playground and point your browser to [localhost:3000](http://localhost:3000) to get started.

#### How to make an integration work

To this end, 3 async methods need to be exported:

```javascript
async function connect({ requestLogin, requestToken, requestWebView }, logger) {
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

#### Email parsers

Because a number of apps/sites do not provide an API to access data but send emails instead (eg: e-commerce), you can also implement email parsers that will be run on each email imported by email integrations.

To do so add a new parser in `integrations\digital\parsers` and implement the following method:

```JS
export function evaluateEmail(subject, from, bodyAsHtml, sendDate) {
  // whatever code needed for the detection
  return { // return the activity parsing the email discovered
    id: `IKEA-${orderMatches.length > 1 && orderMatches[1]}`,
    datetime: sendDate,
    label: `IKEA order ${orderMatches.length > 1 && orderMatches[1]}`,
    activityType: ACTIVITY_TYPE_PURCHASE,
    merchantDisplayName: 'IKEA',
    lineItems: [
      {
        id: PURCHASE_CATEGORY_STORE_FURNISHING,
        value: parseFloat(priceMatches[1]),
        countryCodeISO2: currencyAndCode.code,
        unit: currencyAndCode.cur,
      },
    ],
  };
}
```

> Note: if you are implementing an email integration don't forget to run `getActivitiesFromEmail` from `integration/digital/parsers/index` for each email discovered and return the activities found by the parser in addition to your email activities.
> Note: if you are implementing an email integration you don't add any email activites for each email (digital footprint), only activities generated by the parsers will be added from the content found in emails. This is because it'd impact the performance of the application and it's been decided to disbale adding email activities at the moment. [More information](https://github.com/tmrowco/northapp-contrib/pull/401), the email emission factor is available [here](https://gist.github.com/baywet/38f21c202db5baf22a630ccbb7bae2ef).

### Giving ideas, features requests or bugs

Please [add an issue here](https://github.com/tmrowco/northapp-contrib/issues/new).
