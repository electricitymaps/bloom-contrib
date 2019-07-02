import { URLSearchParams } from 'whatwg-url';
import { URL } from 'url';

import objectToFormData from './objectToFormData';
import isPlayground from '../../playground/isPlayground';

const callbackUrl = isPlayground
? 'http://localhost:3000/oauth_callback'
: 'com.tmrow.greenbit://oauth_callback';

function buildUrlWithParams(baseUrl, params) {
  const url = new URL(baseUrl)

  Object.keys(params).forEach(key =>
    url.searchParams.append(key, params[key])
  );

  return url;
}

export class OAuth2Manager {
  constructor({
    accessTokenUrl,
    apiUrl,
    authorizeUrl,
    baseUrl,
    clientId,
    clientSecret,
  }) {

    this.accessTokenUrl = accessTokenUrl;
    this.apiUrl = apiUrl;
    this.authorizeUrl = authorizeUrl;
    this.baseUrl = baseUrl;
    this.clientId = clientId;
    this.clientSecret = clientSecret;
    this.state = {};
  }

  async _authorizeWithRefreshToken() {
    const formData = {
      'client_secret': this.clientSecret,
      'client_id': this.clientId,
      'refresh_token': this.state.refreshToken,
      'grant_type': 'refresh_token',
    };

    const responseJson = await fetch(this.accessTokenUrl, {
      method: 'POST',
      body: objectToFormData(formData),
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
    })
    .then(response => response.json());

    this.state.accessToken = responseJson.access_token;
    this.state.refreshToken = responseJson.refresh_token;
    this.state.tokenExpiresAt = responseJson.expires_in * 1000 + Date.now();
  }

  async authorize(openUrlAndWaitForCallback) {
    // Step 1 - user authorizes app
    const authorizationCodeRequestUrl = buildUrlWithParams(this.authorizeUrl, {
      'client_id': this.clientId,
      'redirect_uri': callbackUrl,
      'response_type': 'code',
    });

    const authorizationResponse = await openUrlAndWaitForCallback(
      authorizationCodeRequestUrl,
      callbackUrl
    );
    // Redirect response from authorization dialog contains auth code
    const { code: authorizationCode } = authorizationResponse.query;

    // Step 2 - Obtain an access token
    const formData = {
      'client_secret': this.clientSecret,
      'client_id': this.clientId,
      'code': authorizationCode,
      'grant_type': 'authorization_code',
      'redirect_uri': callbackUrl,
      'scope': 'history offline_access',
    };

    const responseJson = await fetch(this.accessTokenUrl, {
      method: 'POST',
      body: objectToFormData(formData),
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
    })
    .then(response => response.json());

    this.state.accessToken = responseJson.access_token;
    this.state.refreshToken = responseJson.refresh_token;
    this.state.tokenExpiresAt = responseJson.expires_in * 1000 + Date.now();

    return this.state;
  }

  setState(state) {
    this.state = state;
  }

  getState() {
    return this.state;
  }

  async fetch(route, method = 'GET', data = undefined) {
    if (typeof this.state.accessToken === 'undefined') {
      throw new Error('not currently logged in');
    }

    if (this.state.tokenExpiresAt < Date.now()) {
      console.log('token expired, refreshing');
      await this._authorizeWithRefreshToken();
    }

    const url = `${this.baseUrl}${route}`;
    const req = {
      method,
      body: data,
      headers: {
        'Authorization': `Bearer ${this.state.accessToken}`
      }
    };

    return fetch(url, req);
  }
}
