import moment from 'moment';
import energinet from '../energinet';

const fromMoment = moment()
  .subtract(3, 'days')
  .startOf('day');
const toMoment = moment().startOf('hour');

const RESOURCES = {
  ACCESS_TOKEN: 'GET:/CustomerApi/api/Token',
  METERING_POINT: 'GET:/CustomerApi/api/MeteringPoints/MeteringPoints?includeAll=false',
  TIME_SERIES: (fromDate, toDate) =>
    `POST:/CustomerApi/api/MeterData/GetTimeSeries/${fromDate}/${toDate}/Hour`,
};

const ACCESS_TOKEN = 'access token'; // used in answer of acces token request
const TOKEN = 'token';
const LOCATION_LON = '12.57369287';
const LOCATION_LAT = '55.71082372';
const METERING_POINT_ID = '57131317910012203822';
const FROM_DATE = '2020-10-11';

const AUTH = {
  authToken: TOKEN,
  locationLon: LOCATION_LON,
  locationLat: LOCATION_LAT,
};

const ACCESS_TOKEN_API_RESPONSE = JSON.stringify({
  result: ACCESS_TOKEN,
});

const METERING_POINT_API_RESPONSE = JSON.stringify({
  result: [
    {
      meteringPointId: METERING_POINT_ID,
      typeOfMP: 'E17',
      balanceSupplierName: 'Barro Danmark ApS',
      streetCode: '5212',
      streetName: 'Nørre Søgade',
      buildingNumber: '39A',
      floorId: '',
      roomId: '',
      postcode: '1370',
      cityName: 'København K',
      citySubDivisionName: '',
      municipalityCode: '101',
      locationDescription: 'i entré',
      settlementMethod: 'D01',
      meterReadingOccurrence: 'PT1H',
      firstConsumerPartyName: 'John Doe',
      secondConsumerPartyName: '',
      consumerCVR: '',
      dataAccessCVR: '',
      meterNumber: '21053678',
      consumerStartDate: '09/05/2019 22:00:00',
      hasRelation: true,
      childMeteringPoints: [],
    },
  ],
});

const TIME_SERIES_API_RESPONSE = JSON.stringify({
  result: [
    {
      MyEnergyData_MarketDocument: {
        mRID: 'f66b9e799eb74802a2976c9a1a9f5c81',
        createdDateTime: '2020-10-14T11:36:37Z',
        'sender_MarketParticipant.name': '',
        'sender_MarketParticipant.mRID': {
          codingScheme: null,
          name: null,
        },
        'period.timeInterval': {
          start: '2020-10-11T22:00:00Z',
          end: '2020-10-12T22:00:00Z',
        },
        TimeSeries: [
          {
            mRID: METERING_POINT_ID,
            businessType: 'A04',
            curveType: 'A01',
            'measurement_Unit.name': 'KWH',
            MarketEvaluationPoint: {},
            Period: [
              {
                resolution: 'PT1H',
                timeInterval: {
                  start: '2020-10-11T22:00:00Z',
                  end: '2020-10-12T22:00:00Z',
                },
                Point: [
                  {
                    position: '1',
                    'out_Quantity.quantity': '0.08',
                    'out_Quantity.quality': 'A04',
                  },
                  {
                    position: '2',
                    'out_Quantity.quantity': '0.06',
                    'out_Quantity.quality': 'A04',
                  },
                  {
                    position: '3',
                    'out_Quantity.quantity': '0.08',
                    'out_Quantity.quality': 'A04',
                  },
                  {
                    position: '4',
                    'out_Quantity.quantity': '0.06',
                    'out_Quantity.quality': 'A04',
                  },
                  {
                    position: '5',
                    'out_Quantity.quantity': '0.08',
                    'out_Quantity.quality': 'A04',
                  },
                  {
                    position: '6',
                    'out_Quantity.quantity': '0.06',
                    'out_Quantity.quality': 'A04',
                  },
                  {
                    position: '7',
                    'out_Quantity.quantity': '0.08',
                    'out_Quantity.quality': 'A04',
                  },
                  {
                    position: '8',
                    'out_Quantity.quantity': '0.07',
                    'out_Quantity.quality': 'A04',
                  },
                  {
                    position: '9',
                    'out_Quantity.quantity': '0.09',
                    'out_Quantity.quality': 'A04',
                  },
                  {
                    position: '10',
                    'out_Quantity.quantity': '0.07',
                    'out_Quantity.quality': 'A04',
                  },
                  {
                    position: '11',
                    'out_Quantity.quantity': '0.08',
                    'out_Quantity.quality': 'A04',
                  },
                  {
                    position: '12',
                    'out_Quantity.quantity': '0.07',
                    'out_Quantity.quality': 'A04',
                  },
                  {
                    position: '13',
                    'out_Quantity.quantity': '0.08',
                    'out_Quantity.quality': 'A04',
                  },
                  {
                    position: '14',
                    'out_Quantity.quantity': '0.08',
                    'out_Quantity.quality': 'A04',
                  },
                  {
                    position: '15',
                    'out_Quantity.quantity': '0.07',
                    'out_Quantity.quality': 'A04',
                  },
                  {
                    position: '16',
                    'out_Quantity.quantity': '0.08',
                    'out_Quantity.quality': 'A04',
                  },
                  {
                    position: '17',
                    'out_Quantity.quantity': '0.08',
                    'out_Quantity.quality': 'A04',
                  },
                  {
                    position: '18',
                    'out_Quantity.quantity': '0.07',
                    'out_Quantity.quality': 'A04',
                  },
                  {
                    position: '19',
                    'out_Quantity.quantity': '0.09',
                    'out_Quantity.quality': 'A04',
                  },
                  {
                    position: '20',
                    'out_Quantity.quantity': '0.07',
                    'out_Quantity.quality': 'A04',
                  },
                  {
                    position: '21',
                    'out_Quantity.quantity': '0.09',
                    'out_Quantity.quality': 'A04',
                  },
                  {
                    position: '22',
                    'out_Quantity.quantity': '0.07',
                    'out_Quantity.quality': 'A04',
                  },
                  {
                    position: '23',
                    'out_Quantity.quantity': '0.08',
                    'out_Quantity.quality': 'A04',
                  },
                  {
                    position: '24',
                    'out_Quantity.quantity': '0.07',
                    'out_Quantity.quality': 'A04',
                  },
                ],
              },
            ],
          },
        ],
        success: true,
        errorCode: '10000',
        errorText: 'NoError',
        id: METERING_POINT_ID,
        stackTrace: null,
      },
    },
  ],
});

const SAMPLE_ACTIVITY = {
  id: `energinet${METERING_POINT_ID}2020-10-11T22:00:00.000Z`,
  datetime: moment('2020-10-11T22:00:00.000Z').toDate(),
  endDatetime: moment('2020-10-12T22:00:00.000Z').toDate(),
  activityType: 'ACTIVITY_TYPE_ELECTRICITY',
  energyWattHours: 1810,
  hourlyEnergyWattHours: [
    80,
    60,
    80,
    60,
    80,
    60,
    80,
    70,
    90,
    70,
    80,
    70,
    80,
    80,
    70,
    80,
    80,
    70,
    90,
    70,
    90,
    70,
    80,
    70,
  ],
  locationLon: LOCATION_LON,
  locationLat: LOCATION_LAT,
};

const LAST_FULLY_COLLECTED_DAY = '2020-10-10T22:00:00.000Z';

const mockPathToHeaders = {
  [RESOURCES.ACCESS_TOKEN]: { Authorization: `Bearer ${TOKEN}` },
  [RESOURCES.METERING_POINT]: { Authorization: `Bearer ${ACCESS_TOKEN}` },
  [RESOURCES.TIME_SERIES]: {
    Authorization: `Bearer ${ACCESS_TOKEN}`,
    'Content-Type': 'application/json',
  },
};

let mockPathToResult = {};

/**
 * As we are using superagent, it is a bit more complicated to mock than using something
 * like fetch-mock. Here we mock the node https module used by Superagent internally.
 */
jest.mock('https', () => ({
  request: jest.fn(options => {
    const { path, method } = options;
    const mockPathKey = `${method}:${path}`;
    const results = mockPathToResult[mockPathKey];
    if (!results) {
      throw new Error(`Did not find any response for ${mockPathKey}`);
    }
    if (results.length === 0) {
      throw new Error(`Ran out of responses for ${mockPathKey}`);
    }

    const headers = mockPathToHeaders[mockPathKey] || {};

    let onResponseCallback;
    let onErrorCallback;

    const setupCallbacks = (event, callback) => {
      if (event === 'response') {
        onResponseCallback = callback;
      }

      if (event === 'error') {
        onErrorCallback = callback;
      }
    };

    return {
      setNoDelay: jest.fn(),
      setHeader: jest.fn(),
      once: jest.fn((event, callback) => {
        setupCallbacks(event, callback);
      }),
      on: jest.fn((event, callback) => {
        setupCallbacks(event, callback);
      }),
      getHeader: header => headers[header.toLowerCase()],
      end: jest.fn(() => {
        const { error, response } = results.shift();
        if (error) {
          onErrorCallback(error);
        } else {
          onResponseCallback(response);
        }
      }),
    };
  }),
}));

// Define fetch for lonLat fetch
global.fetch = jest.fn(() =>
  Promise.resolve({
    json: () => Promise.resolve({ visueltcenter: [LOCATION_LON, LOCATION_LAT] }),
  })
);

beforeEach(() => {
  mockPathToResult = {};
});

afterEach(() => {
  // Check for unmatched mocks
  Object.keys(mockPathToResult).forEach(mockPath => {
    const result = mockPathToResult[mockPath];
    if (result.length > 0) {
      throw new Error(`Found ${result.length} unmatched mock path result(s) for ${mockPath}`);
    }
  });
});

const mockSuccessJSONResponse = body => ({
  error: undefined,
  response: {
    aborted: false,
    complete: true,
    headers: {
      'content-type': 'application/json; charset=utf-8',
    },
    setTimeout: jest.fn(),
    statusCode: 200,
    destroy: jest.fn(),
    on: jest.fn((event, callback) => {
      if (event === 'data') {
        callback(body);
      }
      if (event === 'end') {
        callback();
      }
    }),
    once: jest.fn(),
    setEncoding: jest.fn(),
  },
});

const RESPONSE = {
  ACCESS_TOKEN_API_RESPONSE: mockSuccessJSONResponse(ACCESS_TOKEN_API_RESPONSE),
  METERING_POINT_API_RESPONSE: mockSuccessJSONResponse(METERING_POINT_API_RESPONSE),
  TIME_SERIES_API_RESPONSE: mockSuccessJSONResponse(TIME_SERIES_API_RESPONSE),
};

const logger = {
  logDebug: jest.fn(),
  logWarning: jest.fn(),
  logError: jest.fn(),
};

describe('connect', () => {
  test('with a valid token', async () => {
    mockPathToResult = {
      [RESOURCES.ACCESS_TOKEN]: [RESPONSE.ACCESS_TOKEN_API_RESPONSE],
      [RESOURCES.METERING_POINT]: [RESPONSE.METERING_POINT_API_RESPONSE],
      [RESOURCES.TIME_SERIES(fromMoment.format('YYYY-MM-DD'), toMoment.format('YYYY-MM-DD'))]: [
        RESPONSE.TIME_SERIES_API_RESPONSE,
      ],
    };

    const requestLogin = jest.fn();
    const requestToken = jest.fn(() => Promise.resolve({ token: TOKEN }));
    const requestWebView = jest.fn();

    const connectResult = await energinet.connect(
      { requestLogin, requestToken, requestWebView },
      logger
    );

    // returns authentication details after logging in
    expect(connectResult).toEqual(AUTH);
    expect(requestLogin).toHaveBeenCalledTimes(0);
    expect(requestToken).toHaveBeenCalledTimes(1);
    expect(requestWebView).toHaveBeenCalledTimes(0);
  });
});

describe('collect', () => {
  test('verify correct creation of sample activity', async () => {
    const toDate = moment.min(moment(FROM_DATE).add(14, 'days'), moment());
    mockPathToResult = {
      [RESOURCES.ACCESS_TOKEN]: [RESPONSE.ACCESS_TOKEN_API_RESPONSE],
      [RESOURCES.METERING_POINT]: [RESPONSE.METERING_POINT_API_RESPONSE],
      [RESOURCES.TIME_SERIES(FROM_DATE, toDate.format('YYYY-MM-DD'))]: [
        RESPONSE.TIME_SERIES_API_RESPONSE,
      ],
    };

    const oldState = {
      ...AUTH,
      lastFullyCollectedDay: LAST_FULLY_COLLECTED_DAY, // ensures that the toDate will be set to a desired date.
    };

    const { activities, state } = await energinet.collect(oldState, logger);

    expect(activities).toEqual([SAMPLE_ACTIVITY]);
    expect(state).toEqual({
      ...AUTH,
      lastFullyCollectedDay: moment(LAST_FULLY_COLLECTED_DAY)
        .add(1, 'days')
        .toISOString(),
    });
  });
});

describe('disconnect', () => {
  test('empties the state', async () => {
    const state = await energinet.disconnect();

    expect(state).toEqual({});
  });
});
