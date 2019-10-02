import { AuthenticationError, HTTPError } from '../utils/errors';
import objectToURLParams from './objectToURLParams';
import { getCallbackUrl } from '../utils/oauth';

export default class {
  constructor({
    accessTokenUrl,
    apiUrl,
    authorizeUrl,
    baseUrl,
    clientId,
    clientSecret,
    scope,
  }) {
    this.accessTokenUrl = accessTokenUrl;
    this.apiUrl = apiUrl;
    this.authorizeUrl = authorizeUrl;
    this.baseUrl = baseUrl;
    this.clientId = clientId;
    this.clientSecret = clientSecret;
    this.state = {};
    this.scope = scope;
  }

  async _authorizeWithRefreshToken() {
    const formData = {
      client_secret: this.clientSecret,
      client_id: this.clientId,
      refresh_token: this.state.refreshToken,
      grant_type: 'refresh_token',
    };

    const response = await fetch(this.accessTokenUrl, {
      method: 'POST',
      body: objectToURLParams(formData),
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
    });

    if (response.status === 401 || response.status === 403) {
      throw new AuthenticationError('OAuth authority unable to re-authenticate user with refresh token, suggest re-authorizing.');
    }

    if (!response.ok) {
      throw new HTTPError('unable to re-authenticate user with refresh token, suggest retrying later', response.status);
    }

    const responseJson = await response.json();

    this.state.accessToken = responseJson.access_token;
    this.state.refreshToken = responseJson.refresh_token;
    this.state.tokenExpiresAt = responseJson.expires_in * 1000 + Date.now();
  }

  async authorize(openUrlAndWaitForCallback) {
    // Step 1 - user authorizes app
    const requestURLParams = objectToURLParams({
      client_id: this.clientId,
      redirect_uri: getCallbackUrl(),
      response_type: 'code',
    }) + (this.scope || '');

    const authorizationCodeRequestUrl = `${this.authorizeUrl}?${requestURLParams}`;
    const authorizationResponseQuery = await openUrlAndWaitForCallback(
      authorizationCodeRequestUrl,
      getCallbackUrl()
    );
    // Redirect response from authorization dialog contains auth code
    const { code: authorizationCode } = authorizationResponseQuery;

    // Step 2 - Obtain an access token
    const formData = {
      client_secret: this.clientSecret,
      client_id: this.clientId,
      code: authorizationCode,
      grant_type: 'authorization_code',
      redirect_uri: getCallbackUrl(),
      scope: 'history offline_access',
    };

    const response = await fetch(this.accessTokenUrl, {
      method: 'POST',
      body: objectToURLParams(formData),
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
    });

    if (response.status === 401 || response.status === 403) {
      throw new AuthenticationError('OAuth authority unable to authenticate user with fresh auth code, suggest re-authorizing.');
    }

    if (!response.ok) {
      throw new HTTPError('unable to authenticate user with fresh auth code, suggest retrying', response.status);
    }

    const responseJson = await response.json();

    this.state.accessToken = responseJson.access_token;
    this.state.refreshToken = responseJson.refresh_token;
    this.state.tokenExpiresAt = responseJson.expires_in * 1000 + Date.now();

    return this.state;
  }

  async deauthorize() {
    this.state = {};
  }

  setState(state) {
    this.state = state;
  }

  getState() {
    return this.state;
  }

  async fetch(route, init, logger) {
    if (typeof this.state.accessToken === 'undefined') {
      throw new AuthenticationError('not currently logged in, suggest re-authorizing.');
    }

    if (this.state.tokenExpiresAt < Date.now()) {
      if (logger) {
        logger.logDebug('token expired, refreshing');
      }

      await this._authorizeWithRefreshToken();
    }

    const resource = `${this.baseUrl}${route}`;

    return fetch(resource, {
      ...init,
      headers: {
        ...init.headers,
        Authorization: `Bearer ${this.state.accessToken}`,
      },
    });
  }
}
