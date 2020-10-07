import energinet from '../energinet';

const RESOURCES = {
  ACCESS_TOKEN: 'GET:/Token',
  METERING_POINT: 'GET:/MeteringPoints/MeteringPoints?includeAll=false',
  TIME_SERIES: `GET:/MeterData/GetTimeSeries/{dateFrom}/{dateTo}/${energinet.AGGREGATION}`,
}; // TODO Check that ${energinet.AGGREGATION} works
const mockPathToHeaders = {}; // TODO

let mockPathToResult = {};

const AUTH = {
  authToken: 'very complicated token',
  locationLon: '12.57369287',
  locationLat: '55.71082372',
};

const logger = {
  logDebug: jest.fn(),
  logWarning: jest.fn(),
  logError: jest.fn(),
};

describe('connect', () => {
  test('with a valid token', async () => {
    mockPathToResult = {}; // TODO

    const requestLogin = jest.fn();
    const requestToken = jest.fn(() => Promise.resolve(AUTH));
    const requestWebView = jest.fn();

    const connectResult = await energinet.connect(
      { requestLogin, requestToken, requestWebView },
      logger
    );

    // returns authentication details after logging in
    expect(connectResult).toEqual(AUTH);

    expect(requestLogin).toHaveBeenCalledTimes(1);
    expect(requestToken).toHaveBeenCalledTimes(0);
    expect(requestWebView).toHaveBeenCalledTimes(0);
  });
  test('with an invalid token', () => {
    // TODO
  });
});

describe('collect', () => {
  test('without a lastCollect, activities for the last year should be collected', () => {
    // TODO
    // Should also check that lastCollect is set set to -5 days from today at the end.
  });
});
