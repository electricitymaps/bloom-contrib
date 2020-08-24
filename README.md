![Image description](https://north-app.com/appblogheader.png)

# northapp-contrib [![Slack Status](http://slack.tmrow.com/badge.svg)](http://slack.tmrow.com) [![CircleCI](https://circleci.com/gh/tmrowco/northapp-contrib.svg?style=shield)](https://circleci.com/gh/tmrowco/northapp-contrib)

Welcome to the open-source repository for the carbon footprint behind Bloom and North!👋

## What is Bloom?

[Bloom](https://www.bloomclimate.com) is a SaaS that allow companies to become climate leaders, from calculating their climate impact to communicating about their climate efforts. It connects to as many data sources as possible to assess your carbon footprint and find mitigation opportunities.


## What is the North app?
The [North](https://www.north-app.com) app automatically calculates your carbon footprint by connecting to other services and apps in your life and translating activities from these apps and activities to greenhouse gas emissions.

The app is private-by-design: data will stay on device, unless the user explicitly gives consent. This code is maintained by [Tomorrow](https://www.tmrow.com).

Feel free to watch [the presentation](https://www.youtube.com/watch?v=keOPXD-ojWY) our Founder Olivier gave to the CopenhagenJS meetup, explaining what a JavaScript developer can do to combat climate change. If you have any questions, want early access to the app or just want to hang out with people fighting climate change with code, join [our Slack community](https://slack.tmrow.com).

## Tomorrow is hiring!
The company behind Bloom and the North app builds tech to empower organisations and individuals to understand and reduce their carbon footprint.

We're hiring great people to join our team in Copenhagen. Head over to [our jobs page](https://www.tmrow.com/jobs) if you want to help out!

## Structure of this repository

- `./co2eq`: carbon models
- `./integrations`: contains all integrations
- `./integrations/img`: contains all integration logos
- `./playground`: source code of the playground
- `./definitions.js`: constant definitions

## How can I help?
You can help by helping us find, add and improve our Life Cycle Assesment / Carbon footprint data.

### Adding or updating Life Cycle Assessment / carbon footprint of purchases and activities

Our current models and Life Cycle Assessments that we use are accessible [here](https://github.com/tmrowco/northapp-contrib/tree/master/co2eq). Feel free to suggest new sources or add your own LCAs.

If you want to add individual items or ingredients, this is done [here](https://github.com/tmrowco/northapp-contrib/blob/master/co2eq/purchase/footprints.yml). Ideally, the studies used should be as global as possible and it's even better if they're systemic reviews (multiple studies in one!).

We also have open-sourced how we calculate the carbon footprint of transactions. This can be found [here](https://github.com/tmrowco/northapp-contrib/tree/master/co2eq/purchase). 

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




### Integrating purchases and activities
Previously, we allowed people to add and suggest their own integrations. We've removed this ability as it did not scale very well and often resulted in suboptimal results.

#### Thank you to the kind contributers!
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
- 📧 Outlook (contributor:[baywet](https://github.com/baywet))
- 🚗 Renault Zoé
- 🚗 Uber (contributor:[willtonkin](https://github.com/willtonkin))
- 🚗 Automatic (contributor:[lauvrenn](https://github.com/lauvrenn))
- 🚗 MinVolkswagen (contributor:[folkev0gn](https://github.com/folkev0gn))



### Giving ideas, features requests or bugs

Please [add an issue here](https://github.com/tmrowco/northapp-contrib/issues/new) or directly in the app.
