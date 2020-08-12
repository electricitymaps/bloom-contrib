/* eslint-disable no-plusplus */
/* eslint-disable no-use-before-define */
/**
 * NOTE: to run against the real API instead of mocking it:
 * 1) comment out the https mock
 * 2) add a  top level `jest.setTimeout(900000);`
 * 3) fill in a real username and password in the `AUTH` object
 */
import assert from 'assert';
import rejsekort from '../rejsekort';
import { ValidationError } from '../../utils/errors';

const FORM_HEADERS = { 'content-type': 'application/x-www-form-urlencoded' };

const RESOURCES = {
  LOGIN_PAGE: 'GET:/CWS/Home/UserNameLogin',
  LOGIN_FORM: 'POST:/CWS/Home/Index',
  TRAVEL_PAGE: 'GET:/CWS/TransactionServices/TravelCardHistory',
  TRAVEL_FORM: 'POST:/CWS/TransactionServices/TravelCardHistory',
  CHANGE_CARD_FORM: 'POST:/CWS/Home/ChangeCard',
};

const mockPathToHeaders = {
  [RESOURCES.LOGIN_PAGE]: FORM_HEADERS,
  [RESOURCES.LOGIN_FORM]: FORM_HEADERS,
  [RESOURCES.TRAVEL_PAGE]: FORM_HEADERS,
  [RESOURCES.TRAVEL_FORM]: FORM_HEADERS,
  [RESOURCES.CHANGE_CARD_FORM]: FORM_HEADERS,
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

/**
 * Mock a successful html HTTP response
 * @param {string} content body of the response
 */
const mockSuccessHtmlResponse = body => ({
  error: undefined,
  response: {
    aborted: false,
    complete: true,
    headers: {
      'content-type': 'text/html',
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

const AUTH = {
  username: 'bob',
  password: 'pass',
};

const logger = {
  logDebug: jest.fn(),
  logWarning: jest.fn(),
  logError: jest.fn(),
};

describe('connect', () => {
  it('logs the user in if the credentials are correct', async () => {
    mockPathToResult = {
      [RESOURCES.LOGIN_PAGE]: [RESPONSE.REQUEST_TOKEN_RESPONSE],
      [RESOURCES.LOGIN_FORM]: [RESPONSE.POST_HOME_INDEX_RESPONSE],
    };

    const requestLogin = jest.fn(() => Promise.resolve(AUTH));
    const requestToken = jest.fn();
    const requestWebView = jest.fn();

    const connectResult = await rejsekort.connect(
      { requestLogin, requestToken, requestWebView },
      logger
    );

    // returns authentication details after logging in
    expect(connectResult).toEqual(AUTH);

    expect(requestLogin).toHaveBeenCalledTimes(1);
    expect(requestToken).toHaveBeenCalledTimes(0);
    expect(requestWebView).toHaveBeenCalledTimes(0);
  });

  it('throws if credentials are not correct', async () => {
    mockPathToResult = {
      [RESOURCES.LOGIN_PAGE]: [RESPONSE.REQUEST_TOKEN_RESPONSE],
      [RESOURCES.LOGIN_FORM]: [RESPONSE.LOGIN_FAILED_RESPONSE],
    };

    const requestLogin = jest.fn(() => Promise.resolve(AUTH));
    const requestToken = jest.fn();
    const requestWebView = jest.fn();

    await expect(
      rejsekort.connect({ requestLogin, requestToken, requestWebView }, logger)
    ).rejects.toThrowError(
      new ValidationError('Dit brugernavn eller din adgangskode er indtastet forkert.')
    );
  });
});

describe('collect', () => {
  it('returns empty activities when the user has no card history (one card)', async () => {
    mockPathToResult = {
      [RESOURCES.LOGIN_PAGE]: [RESPONSE.REQUEST_TOKEN_RESPONSE],
      [RESOURCES.LOGIN_FORM]: [RESPONSE.POST_HOME_INDEX_RESPONSE],
      [RESOURCES.TRAVEL_PAGE]: [RESPONSE.REQUEST_TOKEN_RESPONSE],
      [RESOURCES.TRAVEL_FORM]: [
        RESPONSE.TRAVEL_FORM_ONE_CARD_EMPTY_RESPONSE,
        RESPONSE.TRAVEL_FORM_END_RESPONSE,
      ],
    };

    const collectResult = await rejsekort.collect(AUTH, logger);
    expect(collectResult).toEqual({ activities: [], state: AUTH });
  });

  it('returns empty activities when the user has no card history (two cards)', async () => {
    mockPathToResult = {
      [RESOURCES.LOGIN_PAGE]: [RESPONSE.REQUEST_TOKEN_RESPONSE],
      [RESOURCES.LOGIN_FORM]: [RESPONSE.POST_HOME_INDEX_RESPONSE],
      [RESOURCES.TRAVEL_PAGE]: [RESPONSE.REQUEST_TOKEN_RESPONSE],
      [RESOURCES.TRAVEL_FORM]: [
        RESPONSE.TRAVEL_FORM_TWO_CARDS_EMPTY_RESPONSE,
        RESPONSE.TRAVEL_FORM_END_RESPONSE,
      ],
    };

    const collectResult = await rejsekort.collect(AUTH, logger);
    expect(collectResult).toEqual({ activities: [], state: AUTH });
  });

  it('returns activities if some are registered to the card', async () => {
    mockPathToResult = {
      [RESOURCES.LOGIN_PAGE]: [RESPONSE.REQUEST_TOKEN_RESPONSE],
      [RESOURCES.LOGIN_FORM]: [RESPONSE.POST_HOME_INDEX_RESPONSE],
      [RESOURCES.TRAVEL_PAGE]: [
        mockTravelPageResponse({
          cards: 1,
          hasActivities: true,
        }),
      ],
      [RESOURCES.TRAVEL_FORM]: [
        mockTravelPageResponse({
          cards: 1,
          hasActivities: true,
        }),
        RESPONSE.TRAVEL_FORM_END_RESPONSE,
      ],
    };

    const collectResult = await rejsekort.collect(AUTH, logger);
    expect(collectResult.activities).toMatchInlineSnapshot(`
      Array [
        Object {
          "activityType": "ACTIVITY_TYPE_TRANSPORTATION",
          "datetime": 2020-04-29T15:25:00.000Z,
          "departureStation": "København H",
          "destinationStation": "Dybbølsbro St.",
          "endDatetime": 2020-04-29T15:56:00.000Z,
          "id": "rejsekort1",
          "transportationMode": "public_transport",
        },
        Object {
          "activityType": "ACTIVITY_TYPE_TRANSPORTATION",
          "datetime": 2020-04-02T13:05:00.000Z,
          "departureStation": "Dybbølsbro St.",
          "destinationStation": "Birkerød St.",
          "endDatetime": 2020-04-02T14:00:00.000Z,
          "id": "rejsekort3",
          "transportationMode": "public_transport",
        },
        Object {
          "activityType": "ACTIVITY_TYPE_TRANSPORTATION",
          "datetime": 2020-02-26T11:56:00.000Z,
          "departureStation": "Linje : 2A Refshaleøen",
          "destinationStation": "Linje : 2A København H",
          "endDatetime": 2020-02-26T12:14:00.000Z,
          "id": "rejsekort6",
          "transportationMode": "public_transport",
        },
        Object {
          "activityType": "ACTIVITY_TYPE_TRANSPORTATION",
          "datetime": 2020-02-20T14:59:00.000Z,
          "departureStation": "Linje : 12 Park Allé/Rådhuset (Aarhus Kom)",
          "destinationStation": "Linje : 12 Engdalskolen/Hovedgaden (Aarhus Kom)",
          "endDatetime": 2020-02-20T15:28:00.000Z,
          "id": "rejsekort7",
          "transportationMode": "public_transport",
        },
        Object {
          "activityType": "ACTIVITY_TYPE_TRANSPORTATION",
          "datetime": 2020-02-18T15:00:00.000Z,
          "departureStation": "Dybbølsbro St.",
          "destinationStation": "Nørreport St.",
          "endDatetime": 2020-02-18T15:08:00.000Z,
          "id": "rejsekort10",
          "transportationMode": "public_transport",
        },
        Object {
          "activityType": "ACTIVITY_TYPE_TRANSPORTATION",
          "datetime": 2020-02-15T12:42:00.000Z,
          "departureStation": "Frederiksberg Allé St.",
          "destinationStation": "Gammel Strand St., Christiansborg",
          "endDatetime": 2020-02-15T12:51:00.000Z,
          "id": "rejsekort12",
          "transportationMode": "public_transport",
        },
        Object {
          "activityType": "ACTIVITY_TYPE_TRANSPORTATION",
          "datetime": 2020-02-13T12:37:00.000Z,
          "departureStation": "Dybbølsbro St.",
          "destinationStation": "Valby St.",
          "endDatetime": 2020-02-13T12:48:00.000Z,
          "id": "rejsekort13",
          "transportationMode": "public_transport",
        },
        Object {
          "activityType": "ACTIVITY_TYPE_TRANSPORTATION",
          "datetime": 2020-02-11T08:49:00.000Z,
          "departureStation": "Trianglen St.",
          "destinationStation": "Enghave Plads St.",
          "endDatetime": 2020-02-11T09:03:00.000Z,
          "id": "rejsekort14",
          "transportationMode": "public_transport",
        },
        Object {
          "activityType": "ACTIVITY_TYPE_TRANSPORTATION",
          "datetime": 2020-02-11T07:08:00.000Z,
          "departureStation": "København H",
          "destinationStation": "Trianglen St.",
          "endDatetime": 2020-02-11T07:19:00.000Z,
          "id": "rejsekort15",
          "transportationMode": "public_transport",
        },
        Object {
          "activityType": "ACTIVITY_TYPE_TRANSPORTATION",
          "datetime": 2020-02-08T13:19:00.000Z,
          "departureStation": "Nuuks Plads St.",
          "destinationStation": "Enghave Plads St.",
          "endDatetime": 2020-02-08T13:27:00.000Z,
          "id": "rejsekort16",
          "transportationMode": "public_transport",
        },
      ]
    `);
  });

  it('returns activities for all cards and does pagination', async () => {
    mockPathToResult = {
      [RESOURCES.LOGIN_PAGE]: [RESPONSE.REQUEST_TOKEN_RESPONSE],
      [RESOURCES.LOGIN_FORM]: [RESPONSE.POST_HOME_INDEX_RESPONSE],
      [RESOURCES.TRAVEL_PAGE]: [
        mockTravelPageResponse({
          cards: 2,
          hasActivities: true,
        }),
      ],
      [RESOURCES.CHANGE_CARD_FORM]: [
        RESPONSE.REQUEST_TOKEN_RESPONSE,
        RESPONSE.REQUEST_TOKEN_RESPONSE,
      ],
      [RESOURCES.TRAVEL_FORM]: [
        mockTravelPageResponse({
          cards: 2,
          hasActivities: true,
          sequenceNumberStartIndex: 1,
        }),
        mockTravelPageResponse({
          cards: 2,
          hasActivities: true,
          sequenceNumberStartIndex: 100,
        }),
        RESPONSE.TRAVEL_FORM_END_RESPONSE,
        mockTravelPageResponse({
          cards: 2,
          hasActivities: true,
          sequenceNumberStartIndex: 200,
        }),
        mockTravelPageResponse({
          cards: 2,
          hasActivities: true,
          sequenceNumberStartIndex: 300,
        }),
        RESPONSE.TRAVEL_FORM_END_RESPONSE,
      ],
    };

    const { activities } = await rejsekort.collect(AUTH, logger);
    const activityIds = new Set(activities.map(activity => activity.id));

    expect(activities.length).toBe(4 * 10);
    expect(activityIds.size).toBe(4 * 10);
  });
});

/**
 *
 * @param {{cards: number, token?: string, hasActivities: boolean, sequenceNumberStartIndex?: number}} options
 */
function mockTravelPageResponse({
  cards = 1,
  token = 'someToken',
  hasActivities,
  sequenceNumberStartIndex = 1,
}) {
  assert.ok([1, 2].includes(cards));
  assert.ok(typeof token === 'string');
  assert.ok(typeof hasActivities === 'boolean');

  const TRAVEL_FORM_CARDS = {
    1: `
    <form action="/CWS/Home/ChangeCard" id="changeCardForm" method="post">
      <div class="cardListSelectedCard">
        <span class="highlight">Valgt rejsekort:</span>
        <span>Alice - Rejsekort personligt uden foto - 35 1</span>
      </div>
    </form>`,
    2: `
    <form action="/CWS/Home/ChangeCard" id="changeCardForm" method="post">
      <div class="cardListSwitchCard">
        <fieldset>
          <select id="cardSelectedId" name="cardSelected">
            <option value="73">Bob - Rejsekort personligt med foto -
                73 0</option>
            <option selected="selected" value="09">Bob - Rejsekort flex
                - 09 0</option>
          </select>
          <input id="controller" name="controller" type="hidden" value="TransactionServices" />
          <input id="action" name="action" type="hidden" value="TravelCardHistory" />
        </fieldset>
      </div>
      <div class="cardListSelectedCard">
        <span class="highlight">Valgt rejsekort:</span>
        <span>Bob - Rejsekort flex - 09 0</span>
      </div>
    </form>`,
  };

  const entriesPage1 = [
    `<tr id="tr11" class="trJL1">
      <td>
        <img
          class="lev2selector"
          id="Img11"
          td="detail11"
          rowid="11"
          transactionscreentype=""
          operationdatetime=""
          transactionids="7203,7056,8604,8975"
          transactionmsgreportdates="29-04-2020 16:54:12,29-04-2020 16:57:06,29-04-2020 17:18:46,29-04-2020 17:25:49"
          journeystatusid="2"
          journeysequencenumber="SEQUENCE_NUMBER"
          warninglevelto="0"
          warninglevelfrom="0"
          journeylineamountvalue="-1760"
          src="/CWS/App_Themes/CWS/images/MyJourneyPlusPicto.png"
        />
      </td>
      <td style="text-align: center;">SEQUENCE_NUMBER</td>
      <td nowrap >29-04-20</td>
      <td nowrap>16:54</td>
      <td class=>København H</td>
      <td>17:25</td>
      <td class=>Dybbølsbro St.</td>
      <td class=>
        -17,60
      </td>
      <td>295,26</td>
    </tr>
    <tr>
      <td align="center" colspan="9" class="detail1">
        <div id="detail11" class="detailJL2"></div>
      </td>
    </tr>`,
    `<tr class="even" id="tr12">
      <td>
        <img
          class="lev2selector"
          id="Img12"
          td="detail12"
          rowid="12"
          transactionscreentype="AUTORELOAD"
          operationdatetime="02-04-2020 15:05:52"
          transactionids="8760"
          transactionmsgreportdates="02-04-2020 15:05:52"
          journeysequencenumber=""
          src="/CWS/App_Themes/CWS/images/MyJourneyPlusPicto.png"
        />
      </td>
      <td style="text-align: center;"></td>
      <td nowrap>02-04-20</td>
      <td nowrap>15:05</td>
      <td>Tank-op-aftale</td>
      <td></td>
      <td>Birkerød St.</td>
      <td>300,00</td>
      <td>312,86</td>
    </tr>
    <tr>
      <td align="center" colspan="9" class="detail2">
        <div id="detail12" class="detailJL2"></div>
      </td>
    </tr>`,
    `<tr id="tr13" class="trJL1">
      <td>
        <img
          class="lev2selector"
          id="Img13"
          td="detail13"
          rowid="13"
          transactionscreentype=""
          operationdatetime=""
          transactionids="7652,8763"
          transactionmsgreportdates="02-04-2020 14:10:34,02-04-2020 15:05:52"
          journeystatusid="2"
          journeysequencenumber="SEQUENCE_NUMBER"
          warninglevelto="0"
          warninglevelfrom="0"
          journeylineamountvalue="-8800"
          src="/CWS/App_Themes/CWS/images/MyJourneyPlusPicto.png"
        />
      </td>
      <td style="text-align: center;">SEQUENCE_NUMBER</td>
      <td nowrap >02-04-20</td>
      <td nowrap>14:10</td>
      <td class=>Dybbølsbro St.</td>
      <td>15:05</td>
      <td class=>Birkerød St.</td>
      <td class=>
        -88,00
      </td>
      <td></td>
    </tr>
    <tr>
      <td align="center" colspan="9" class="detail3">
        <div id="detail13" class="detailJL2"></div>
      </td>
    </tr>`,
    `<tr class="even" id="tr14">
      <td>
        <img
          class="lev2selector"
          id="Img14"
          td="detail14"
          rowid="14"
          transactionscreentype=""
          operationdatetime=""
          transactionids="7631"
          transactionmsgreportdates="02-04-2020 14:10:27"
          journeystatusid="34"
          journeysequencenumber="SEQUENCE_NUMBER"
          warninglevelto="0"
          warninglevelfrom="1"
          journeylineamountvalue="0"
          src="/CWS/App_Themes/CWS/images/MyJourneyPlusPicto.png"
        />
      </td>
      <td style="text-align: center;">SEQUENCE_NUMBER</td>
      <td nowrap ></td>
      <td nowrap></td>
      <td class="bg-yellow">Ukendt sted</td>
      <td>14:10</td>
      <td class=>Dybbølsbro St.</td>
      <td class=></td>
      <td>100,86</td>
    </tr>
    <tr>
      <td align="center" colspan="9" class="detail4">
        <div id="detail14" class="detailJL2"></div>
      </td>
    </tr>`,
    `<tr id="tr15" class="trJL1">
      <td>
        <img
          class="lev2selector"
          id="Img15"
          td="detail15"
          rowid="15"
          transactionscreentype="PURSE_CORRECTION"
          operationdatetime="02-04-2020 14:10:11"
          transactionids="7633"
          transactionmsgreportdates="02-04-2020 14:10:11"
          journeysequencenumber=""
          src="/CWS/App_Themes/CWS/images/MyJourneyPlusPicto.png"
        />
      </td>
      <td style="text-align: center;"></td>
      <td nowrap>02-04-20</td>
      <td nowrap>14:10</td>
      <td>Saldokorrektion</td>
      <td></td>
      <td>Dybbølsbro St.</td>
      <td>25,00</td>
      <td>100,86</td>
    </tr>
    <tr>
      <td align="center" colspan="9" class="detail5">
        <div id="detail15" class="detailJL2"></div>
      </td>
    </tr>`,
    `<tr class="even" id="tr16">
      <td>
        <img
          class="lev2selector"
          id="Img16"
          td="detail16"
          rowid="16"
          transactionscreentype=""
          operationdatetime=""
          transactionids="0812,0836"
          transactionmsgreportdates="26-02-2020 12:38:00,26-02-2020 12:56:34"
          journeystatusid="2"
          journeysequencenumber="SEQUENCE_NUMBER"
          warninglevelto="0"
          warninglevelfrom="0"
          journeylineamountvalue="-1280"
          src="/CWS/App_Themes/CWS/images/MyJourneyPlusPicto.png"
        />
      </td>
      <td style="text-align: center;">SEQUENCE_NUMBER</td>
      <td nowrap >26-02-20</td>
      <td nowrap>12:38</td>
      <td class=>Linje : 2A Refshaleøen</td>
      <td>12:56</td>
      <td class=>Linje : 2A København H</td>
      <td class=>
        -12,80
      </td>
      <td>75,86</td>
    </tr>
    <tr>
      <td align="center" colspan="9" class="detail6">
        <div id="detail16" class="detailJL2"></div>
      </td>
    </tr>`,
    `<tr id="tr17" class="trJL1">
      <td>
        <img
          class="lev2selector"
          id="Img17"
          td="detail17"
          rowid="17"
          transactionscreentype=""
          operationdatetime=""
          transactionids="4905,5120"
          transactionmsgreportdates="20-02-2020 15:30:34,20-02-2020 15:59:52"
          journeystatusid="2"
          journeysequencenumber="SEQUENCE_NUMBER"
          warninglevelto="0"
          warninglevelfrom="0"
          journeylineamountvalue="-3520"
          src="/CWS/App_Themes/CWS/images/MyJourneyPlusPicto.png"
        />
      </td>
      <td style="text-align: center;">SEQUENCE_NUMBER</td>
      <td nowrap >20-02-20</td>
      <td nowrap>15:30</td>
      <td class=>Linje : 12 Park Allé/Rådhuset (Aarhus Kom)</td>
      <td>15:59</td>
      <td class=>Linje : 12 Engdalskolen/Hovedgaden (Aarhus Kom)</td>
      <td class=>
        -35,20
      </td>
      <td>88,66</td>
    </tr>
    <tr>
      <td align="center" colspan="9" class="detail7">
        <div id="detail17" class="detailJL2"></div>
      </td>
    </tr>`,
    `<tr class="even" id="tr18">
      <td>
        <img
          class="lev2selector"
          id="Img18"
          td="detail18"
          rowid="18"
          transactionscreentype="AUTORELOAD_MODIFY"
          operationdatetime="20-02-2020 15:30:31"
          transactionids="4902"
          transactionmsgreportdates="20-02-2020 15:30:31"
          journeysequencenumber=""
          src="/CWS/App_Themes/CWS/images/MyJourneyPlusPicto.png"
        />
      </td>
      <td style="text-align: center;"></td>
      <td nowrap>20-02-20</td>
      <td nowrap>15:30</td>
      <td>Ændre tank-op-aftale</td>
      <td></td>
      <td>Linje : 12 Park Allé/Rådhuset (Aarhus Kom)</td>
      <td></td>
      <td>123,86</td>
    </tr>
    <tr>
      <td align="center" colspan="9" class="detail8">
        <div id="detail18" class="detailJL2"></div>
      </td>
    </tr>`,
    `<tr id="tr19" class="trJL1">
      <td>
        <img
          class="lev2selector"
          id="Img19"
          td="detail19"
          rowid="19"
          transactionscreentype=""
          operationdatetime=""
          transactionids="5305,4903,4909"
          transactionmsgreportdates="18-02-2020 16:26:12,20-02-2020 15:30:34,20-02-2020 15:30:34"
          journeystatusid="72"
          journeysequencenumber="SEQUENCE_NUMBER"
          warninglevelto="2"
          warninglevelfrom="0"
          journeylineamountvalue="-2500"
          src="/CWS/App_Themes/CWS/images/MyJourneyPlusPicto.png"
        />
      </td>
      <td style="text-align: center;">SEQUENCE_NUMBER</td>
      <td nowrap >18-02-20</td>
      <td nowrap>16:26</td>
      <td class=>Vesterport St.</td>
      <td></td>
      <td class="bgRedTextWhite">Ukendt sted</td>
      <td class=>
        -25,00
      </td>
      <td>123,86</td>
    </tr>
    <tr>
      <td align="center" colspan="9" class="detail9">
        <div id="detail19" class="detailJL2"></div>
      </td>
    </tr>`,
    `<tr class="even" id="tr110">
      <td>
        <img
          class="lev2selector"
          id="Img110"
          td="detail110"
          rowid="110"
          transactionscreentype=""
          operationdatetime=""
          transactionids="7398,4655"
          transactionmsgreportdates="18-02-2020 15:52:04,18-02-2020 16:00:10"
          journeystatusid="2"
          journeysequencenumber="SEQUENCE_NUMBER"
          warninglevelto="0"
          warninglevelfrom="0"
          journeylineamountvalue="-1600"
          src="/CWS/App_Themes/CWS/images/MyJourneyPlusPicto.png"
        />
      </td>
      <td style="text-align: center;">SEQUENCE_NUMBER</td>
      <td nowrap >18-02-20</td>
      <td nowrap>15:52</td>
      <td class=>Dybbølsbro St.</td>
      <td>16:00</td>
      <td class=>Nørreport St.</td>
      <td class=>
        -16,00
      </td>
      <td>148,86</td>
    </tr>
    <tr>
      <td align="center" colspan="9" class="detail10">
        <div id="detail110" class="detailJL2"></div>
      </td>
    </tr>`,
  ];

  const entriesPage2 = [
    `<tr id="tr21" class="trJL1">
      <td>
        <img
          class="lev2selector"
          id="Img21"
          td="detail21"
          rowid="21"
          transactionscreentype="PURSE_CORRECTION"
          operationdatetime="18-02-2020 15:52:04"
          transactionids="7383"
          transactionmsgreportdates="18-02-2020 15:52:04"
          journeysequencenumber=""
          src="/CWS/App_Themes/CWS/images/MyJourneyPlusPicto.png"
        />
      </td>
      <td style="text-align: center;"></td>
      <td nowrap>18-02-20</td>
      <td nowrap>15:52</td>
      <td>Saldokorrektion</td>
      <td></td>
      <td>Dybbølsbro St.</td>
      <td>-20,00</td>
      <td>164,86</td>
    </tr>
    <tr>
      <td align="center" colspan="9" class="detail1">
        <div id="detail21" class="detailJL2"></div>
      </td>
    </tr>`,
    `<tr class="even" id="tr22">
      <td>
        <img
          class="lev2selector"
          id="Img22"
          td="detail22"
          rowid="22"
          transactionscreentype=""
          operationdatetime=""
          transactionids="9230,8690"
          transactionmsgreportdates="15-02-2020 13:33:03,15-02-2020 13:42:30"
          journeystatusid="2"
          journeysequencenumber="SEQUENCE_NUMBER"
          warninglevelto="0"
          warninglevelfrom="0"
          journeylineamountvalue="-1408"
          src="/CWS/App_Themes/CWS/images/MyJourneyPlusPicto.png"
        />
      </td>
      <td style="text-align: center;">SEQUENCE_NUMBER</td>
      <td nowrap >15-02-20</td>
      <td nowrap>13:33</td>
      <td class=>Frederiksberg Allé St.</td>
      <td>13:42</td>
      <td class=>Gammel Strand St., Christiansborg</td>
      <td class=>
        -14,08
      </td>
      <td>184,86</td>
    </tr>
    <tr>
      <td align="center" colspan="9" class="detail2">
        <div id="detail22" class="detailJL2"></div>
      </td>
    </tr>`,
    `<tr id="tr23" class="trJL1">
      <td>
        <img
          class="lev2selector"
          id="Img23"
          td="detail23"
          rowid="23"
          transactionscreentype=""
          operationdatetime=""
          transactionids="5949,1502"
          transactionmsgreportdates="13-02-2020 13:26:53,13-02-2020 13:37:00"
          journeystatusid="2"
          journeysequencenumber="SEQUENCE_NUMBER"
          warninglevelto="0"
          warninglevelfrom="0"
          journeylineamountvalue="-1600"
          src="/CWS/App_Themes/CWS/images/MyJourneyPlusPicto.png"
        />
      </td>
      <td style="text-align: center;">SEQUENCE_NUMBER</td>
      <td nowrap >13-02-20</td>
      <td nowrap>13:26</td>
      <td class=>Dybbølsbro St.</td>
      <td>13:37</td>
      <td class=>Valby St.</td>
      <td class=>
        -16,00
      </td>
      <td>198,94</td>
    </tr>
    <tr>
      <td align="center" colspan="9" class="detail3">
        <div id="detail23" class="detailJL2"></div>
      </td>
    </tr>`,
    `<tr class="even" id="tr24">
      <td>
        <img
          class="lev2selector"
          id="Img24"
          td="detail24"
          rowid="24"
          transactionscreentype=""
          operationdatetime=""
          transactionids="5389,1511"
          transactionmsgreportdates="11-02-2020 09:35:53,11-02-2020 09:49:23"
          journeystatusid="2"
          journeysequencenumber="SEQUENCE_NUMBER"
          warninglevelto="0"
          warninglevelfrom="0"
          journeylineamountvalue="-1760"
          src="/CWS/App_Themes/CWS/images/MyJourneyPlusPicto.png"
        />
      </td>
      <td style="text-align: center;">SEQUENCE_NUMBER</td>
      <td nowrap >11-02-20</td>
      <td nowrap>09:35</td>
      <td class=>Trianglen St.</td>
      <td>09:49</td>
      <td class=>Enghave Plads St.</td>
      <td class=>
        -17,60
      </td>
      <td>214,94</td>
    </tr>
    <tr>
      <td align="center" colspan="9" class="detail4">
        <div id="detail24" class="detailJL2"></div>
      </td>
    </tr>`,
    `<tr id="tr25" class="trJL1">
      <td>
        <img
          class="lev2selector"
          id="Img25"
          td="detail25"
          rowid="25"
          transactionscreentype=""
          operationdatetime=""
          transactionids="4150,2022"
          transactionmsgreportdates="11-02-2020 07:57:32,11-02-2020 08:08:54"
          journeystatusid="2"
          journeysequencenumber="SEQUENCE_NUMBER"
          warninglevelto="0"
          warninglevelfrom="0"
          journeylineamountvalue="-1760"
          src="/CWS/App_Themes/CWS/images/MyJourneyPlusPicto.png"
        />
      </td>
      <td style="text-align: center;">SEQUENCE_NUMBER</td>
      <td nowrap >11-02-20</td>
      <td nowrap>07:57</td>
      <td class=>København H</td>
      <td>08:08</td>
      <td class=>Trianglen St.</td>
      <td class=>
        -17,60
      </td>
      <td>232,54</td>
    </tr>
    <tr>
      <td align="center" colspan="9" class="detail5">
        <div id="detail25" class="detailJL2"></div>
      </td>
    </tr>`,
    `<tr class="even" id="tr26">
      <td>
        <img
          class="lev2selector"
          id="Img26"
          td="detail26"
          rowid="26"
          transactionscreentype=""
          operationdatetime=""
          transactionids="7244,2948"
          transactionmsgreportdates="08-02-2020 14:11:56,08-02-2020 14:19:25"
          journeystatusid="2"
          journeysequencenumber="SEQUENCE_NUMBER"
          warninglevelto="0"
          warninglevelfrom="0"
          journeylineamountvalue="-1408"
          src="/CWS/App_Themes/CWS/images/MyJourneyPlusPicto.png"
        />
      </td>
      <td style="text-align: center;">SEQUENCE_NUMBER</td>
      <td nowrap >08-02-20</td>
      <td nowrap>14:11</td>
      <td class=>Nuuks Plads St.</td>
      <td>14:19</td>
      <td class=>Enghave Plads St.</td>
      <td class=>
        -14,08
      </td>
      <td>250,14</td>
    </tr>
    <tr>
      <td align="center" colspan="9" class="detail6">
        <div id="detail26" class="detailJL2"></div>
      </td>
    </tr>`,
  ];

  let sequenceNumber = sequenceNumberStartIndex;

  const history = hasActivities
    ? `
    <div class="historyPage historyPageNumber1" style="display: Block;">
      <table class="tblJM" id="historyTravels" cellpadding="0" cellspacing="0" style="padding-top: 0.5em;">
        <tbody>
          <tr>
            <th></th>
            <th>Rejsenr.</th>
            <th nowrap>Dato</th>
            <th nowrap>Tid</th>
            <th>Fra</th>
            <th>Tid</th>
            <th>Til</th>
            <th>Beløb kr.</th>
            <th>Saldo kr.</th>
          </tr>
          ${entriesPage1
            .map(entry => entry.replace(/SEQUENCE_NUMBER/g, sequenceNumber++))
            .join('\n')}
        </tbody>
      </table>

      <br />

      <div class="DivPaginationBar">
        <span class="paginationButton paginationButtonInactive" data-pagenumber="1" name="submitPage">&lt;&lt; Forrige</span><span class="paginationButton selectedPaginationButton" data-pagenumber="1" name="goToPage">1</span>
        <span class="paginationButton" data-pagenumber="2" name="goToPage">2</span><span class="paginationButton" data-pagenumber="2" name="goToPage">Næste &gt;&gt;</span>
      </div>
    </div>
    <div class="historyPage historyPageNumber2" style="display: None;">
      <table class="tblJM" id="historyTravels" cellpadding="0" cellspacing="0" style="padding-top: 0.5em;">
        <tbody>
          <tr>
            <th></th>
            <th>Rejsenr.</th>
            <th nowrap>Dato</th>
            <th nowrap>Tid</th>
            <th>Fra</th>
            <th>Tid</th>
            <th>Til</th>
            <th>Beløb kr.</th>
            <th>Saldo kr.</th>
          </tr>
          ${entriesPage2
            .map(entry => entry.replace(/SEQUENCE_NUMBER/g, sequenceNumber++))
            .join('\n')}
        </tbody>
      </table>
    </div>`
    : '';

  return mockSuccessHtmlResponse(`<!DOCTYPE html>
  <html>
    <head>
      <title>Rejsekort - Mine rejser</title>
    </head>
    <body>
      <div class="page">
        <div class="header">
          <ul class="settings">
            <li class="accessibility"><strong>Sprog og brugernavn</strong></li>
            <li><b>Bob</b> er logget ind | <a href="/CWS/Home/Logout" class="logout">Log ud</a></li>
          </ul>
        </div>

        <div class="main">
          <div class="content">
            <div class="pageTitleDiv">
              <img class="pageTitleImage" src="/CWS/App_Themes/CWS/images/icon_mytravels.png" />
              <h1 class="pageTitleText">Mine rejser</h1>
            </div>

            ${TRAVEL_FORM_CARDS[cards]}
            <hr class="grayUnderline" />

            <div id="DivJourneyFilters">
              <p>
                Her kan du se rejser, tank-op og andre bestillinger til dit rejsekort for den valgte periode. <br />
                <br />
                <strong>Bemærk</strong> <br />
                Mine rejser viser ikke nødvendigvis dine seneste rejser og din aktuelle saldo. Der er op til 24 timers forsinkelse fra du har foretaget en rejse, til du kan se den her på selvbetjeningen. Der kan i enkelte tilfælde gå længere
                tid. <br />
                <br />
                Du kan se op til 13 måneders rejsehistorik i oversigten.<br />
                <br />
                Du kan altid se din seneste rejse og den aktuelle saldo på en rejsekortautomat. <br />
                <br />
              </p>
              Periode
              <form action="/CWS/TransactionServices/TravelCardHistory" id="journeyTimeSpan" method="post" style="display: inline;">
                <input name="__RequestVerificationToken" type="hidden" value="cardToken" />
                <select class="formselect sizeD" id="travelSwitch" name="periodSelected" onchange="journeyTimeSpanSubmit()" tabindex="1">
                  <option value="OneWeek">1 uge</option>
                  <option value="TwoWeeks">2 uger</option>
                  <option value="OneMonth">1 måned</option>
                  <option selected="selected" value="ThreeMonths">3 måneder</option>
                  <option value="All">Se alle</option>
                </select>
              </form>
            </div>

            <div>
              <div class="travelCardRules"></div>
            </div>
            <div class="clear"></div>
            ${history}
          </div>
        </div>
      </div>
      <script>
        var antiForgeryToken = '<input name="__RequestVerificationToken" type="hidden" value="${token}" />';
        $("form").prepend(antiForgeryToken);
      </script>
    </body>
  </html>`);
}

const RESPONSE = {
  REQUEST_TOKEN_RESPONSE: mockSuccessHtmlResponse(`
    <!DOCTYPE html>
    <html>
    <body>
      <script>
        var antiForgeryToken = '<input name="__RequestVerificationToken" type="hidden" value="someToken" />';
        $("form").prepend(antiForgeryToken);
      </script>
    </body>
    </html>`),

  LOGIN_FAILED_RESPONSE: mockSuccessHtmlResponse(`
    <!DOCTYPE html>
    <html>
      <head>
        <title>Rejsekort - Log ind</title>
      </head>
      <body>
        <div class="page">
          <div class="pageTitleDiv"><h1 class="pageTitleText">Log ind</h1><hr class="titleUnderline"/></div>
          <div id="validation-summary-v5-container">
            <div class="validation-summary-errors-message"><p>Fejl:</p></div>
            <div class="validation-summary-errors"><ul><li>Dit brugernavn eller din adgangskode er indtastet forkert.</li></ul></div>
          </div>
        </div>
        <script>
          var antiForgeryToken = '<input name="__RequestVerificationToken" type="hidden" value="someToken" />';
          $("form").prepend(antiForgeryToken);
        </script>
      </body>
    </html>`),

  POST_HOME_INDEX_RESPONSE: mockSuccessHtmlResponse(`
    <!DOCTYPE html>
    <html>
    <body>
      <div class="page">
        <div class="header">
          <ul class="settings">
            <li>
              <b>Bob</b> er logget ind | <a href="/CWS/Home/Logout" class="logout">Log ud</a>
            </li>
          </ul>
        </div>
      </div>
      <script>
        var antiForgeryToken = '<input name="__RequestVerificationToken" type="hidden" value="anotherToken" />';
        $("form").prepend(antiForgeryToken);
      </script>
    </body>
    </html>`),

  TRAVEL_FORM_ONE_CARD_EMPTY_RESPONSE: mockTravelPageResponse({
    cards: 1,
    hasActivities: false,
  }),

  TRAVEL_FORM_TWO_CARDS_EMPTY_RESPONSE: mockTravelPageResponse({
    cards: 2,
    hasActivities: false,
  }),

  TRAVEL_FORM_END_RESPONSE: mockSuccessHtmlResponse(`
    <!DOCTYPE html>
    <html>
      <head>
        <title>Rejsekort - Mit rejsekort</title>
      </head>
      <body>
        <div class="page">
          <div>Mine rejser | Fejl</div>
          <b>Bob</b> er logget ind | <a href="/CWS/Home/Logout" class="logout">Log ud</a>
        </div>
        <script>
          var antiForgeryToken = '<input name="__RequestVerificationToken" type="hidden" value="anotherToken" />';
          $("form").prepend(antiForgeryToken);
        </script>
      </body>
    </html>`),
};
