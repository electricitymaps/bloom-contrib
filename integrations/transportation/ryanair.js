import moment from 'moment';
import request from 'superagent';
import { ACTIVITY_TYPE_TRANSPORTATION, TRANSPORTATION_MODE_PLANE } from '../../definitions';

const agent = request.agent();
const BASE_URL = 'https://api.ryanair.com/userprofile/rest/api/v1/';
const LOGIN_URL = `${BASE_URL}login`;
const PROFILE_URL = `${BASE_URL}secure/users/`;
const BOOKINGAPI_URL = 'https://nativeapps.ryanair.com/';
// user info available at `${PROFILE_URL}${customerId}/profile/full/`

async function logIn(username, password) {

  const res = await agent
    .post(LOGIN_URL)
    .type('application/x-www-form-urlencoded')
    .set('Authorization', 'Basic ')
    .send({
      password,
      username,
    }).catch(err => console.log(err));

  if (!res.ok) {
    console.error('--------RESPONSE---------', res);
    throw Error('Error while logging in.');
  }

  return {
    token: res.body.token,
    customerId: res.body.customerId,
  };
}

async function connect(requestLogin, requestWebView) {
  // Here we can request credentials etc..

  // Here we can use two functions to invoke screens
  // requestLogin() or requestWebView()
  const { username, password } = await requestLogin();

  if (!(password || '').length) {
    throw Error('Password cannot be empty');
  }

  return logIn(username, password);
}

function disconnect() {
  // Here we should do any cleanup (deleting tokens etc..)
  return {};
}

async function getAllFlights(entries, customerId, token) {
  const allFlights = [];

  await entries.map(async (entry) => {
    await agent
      .put(`${PROFILE_URL}${customerId}/bookings/booking`)
      .set('Accept', 'application/json')
      .set('X-Auth-Token', token)
      .send({
        bookingId: entry.bookingId,
        pnr: entry.pnr,
      })
      .then((res) => {
        if (res.ok) {
          res.body.Flights.forEach((singleFlight) => {
            allFlights.push({ 
              bookingId: res.body.BookingId,
              flightInfo: singleFlight,
              pnr: res.body.RecordLocator,
            });
            console.log('length inside IN', allFlights.length);
          });
        }
      });
  });
  console.log('length inside', allFlights.length);
  return allFlights;
}

async function collect(state) {
  const { token, customerId } = state;

  console.log('DATA', customerId, token)

  const pastBookings = await agent
    .get(`${PROFILE_URL}${customerId}/bookings/past`)
    .set('Accept', 'application/json')
    .set('X-Auth-Token', token);

  if (!pastBookings.ok) {
    console.error('--------RESPONSE---------', pastBookings);
    throw Error('Error while fetching past bookings.');
  }
  // console.log('url', `${PROFILE_URL}${customerId}/bookings/past`)
  // console.log('get booking', pastBookings.body);

  const entries = pastBookings.body.bookings.filter(entry => entry.status === 'Confirmed');
  // entries.map(lol => console.log('lol', lol));

  // there can be multiple flights in one booking
  (async () => {
    await getAllFlights(entries, customerId, token)
      .then((res) => {
        console.log('');
        console.log('-------------------F L I G H T-----------------');
        console.log('length outside', res.length);
      });
  })();
  
  // pastBookings = I take the pastbookings response from bookings
  // entries = filtered direct bookings
  // allFlights = array
  // entries.map, take bookingId and find corresponding flights
  // add flights to allFlights array
  // map activities from the allFlights array


  // const bookingDetails = await agent
  //   .post(`${BOOKINGAPI_URL}v4/Booking`)
  //   .set('Accept', 'application/json')
  //   .send({
  //     surrogateId: customerId,
  //     bookingId: entries[0].bookingId,
  //   });


    // console.log('det', bookingDetails.body);
  
  // const activities = Object.assign(...Object.entries(entries)
  //   .map(k => ({
  //     booking: k.bookingId,
  //   })));
  // entries.map(lol => console.log('lol', lol));

  // const activities = entries
  //   .map(k => ({
  //     id: k.bookingId,
  //     activityType: ACTIVITY_TYPE_TRANSPORTATION,
  //     transportationMode: TRANSPORTATION_MODE_PLANE,
  //     carrier: 'Ryanair',
  //     locationLon: 0,
  //     locationLat: 0,
  //   }));
  // activities.map(lol => console.log('lol', lol));

 


  // const b = (data.history || []).map(d => ({
  //   id: d.request_id, // unique id that will be used in case of de-duplication
  //   activityType: ACTIVITY_TYPE_TRANSPORTATION,
  //   carrier: 'Uber',
  //   datetime: new Date(d.start_time * 1000.0),
  //   distanceKilometers: d.distance * MILES_TO_KM, // the origin in given in miles
  //   durationHours: (new Date(d.end_time * 1000.0) - new Date(d.start_time * 1000.0)) / 1000.0 / 3600.0,
  //   transportationMode: TRANSPORTATION_MODE_CAR,
  //   locationLon: d.start_city.longitude,
  //   locationLat: d.start_city.latitude,
  // }));

  // const a = Object.entries(groupBy(response, d => moment(d.date).startOf('day').toISOString()))
  //   .map(([k, values]) => ({
  //     id: `barry${k}`,
  //     datetime: moment(k).toDate(),
  //     activityType: ACTIVITY_TYPE_ELECTRICITY,
  //     energyWattHours: values
  //       .map(x => x.value * 1000.0) // kWh -> Wh
  //       .reduce((a, b) => a + b, 0),
  //     durationHours: values.length,
  //     hourlyEnergyWattHours: values.map(x => x.value * 1000.0),
  //     locationLon,
  //     locationLat,
  //   }));


  return {};
}

const config = {
  label: 'Ryanair',
  description: 'collects [...]',
  type: ACTIVITY_TYPE_TRANSPORTATION,
  isPrivate: true,
  contributors: ['lauvrenn'],
};

export default {
  connect,
  disconnect,
  collect,
  config,
};


// ------------ WIZZAIR ------------ //


// import moment from 'moment';
// import request from 'superagent';
// import { ACTIVITY_TYPE_TRANSPORTATION, TRANSPORTATION_MODE_PLANE } from '../../definitions';

// // https://wizzair.com/static/metadata.json
// const agent = request.agent();
// const LOGIN_URL = 'https://be.wizzair.com/9.13.1/Api/customer/login';


// // const PROFILE_URL = `${BASE_URL}secure/users/`;

// async function logIn(username, password) {

//   const res = await agent
//     .post(LOGIN_URL)
//     .set('languageCode', 'en-gb')
//     .type('application/json')
//     .set('Accept', '*/*')
//     .send({
//       password,
//       username,
//     }).catch(err => console.log(err));


//   if (!res.ok) {
//     console.error('--------RESPONSE---------', res);
//     throw Error('Error while logging in.');
//   }

//   console.log('res', res);

//   // return {
//   //   token: res.body.token,
//   //   customerId: res.body.customerId,
//   // };
// }

// async function connect(requestLogin, requestWebView) {
//   // Here we can request credentials etc..

//   // Here we can use two functions to invoke screens
//   // requestLogin() or requestWebView()
//   const { username, password } = await requestLogin();

//   if (!(password || '').length) {
//     throw Error('Password cannot be empty');
//   }

//   return logIn(username, password);
// }

// function disconnect() {
//   // Here we should do any cleanup (deleting tokens etc..)
//   return {};
// }

// async function collect(state) {
//   // const { token, customerId } = state;

//   // const profile = await agent
//   //   .get(`${PROFILE_URL}${customerId}/profile/full/`)
//   //   .set('X-Auth-Token', token);

//   // if (!profile.ok) {
//   //   console.error('--------RESPONSE---------', profile);
//   //   throw Error('Error while fetching profile.');
//   // }
//   // console.log('data', customerId, token)
//   // console.log('get', profile.body);

//   // const bookings = await agent
//   //   .get(`${PROFILE_URL}${customerId}/bookings/upcoming/all/`)
//   //   .set('X-Auth-Token', token);

//   // console.log('get booking', bookings.body);

//   return {};
// }

// const config = {
//   label: 'Ryanair',
//   description: 'collects [...]',
//   type: ACTIVITY_TYPE_TRANSPORTATION,
//   isPrivate: true,
//   contributors: ['lauvrenn'],
// };

// export default {
//   connect,
//   disconnect,
//   collect,
//   config,
// };
