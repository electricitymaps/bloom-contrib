import HmacSHA1 from 'crypto-js/hmac-sha1';
import Base64 from 'crypto-js/enc-base64';
import OAuth from 'oauth-1.0a';
import { URLSearchParams } from 'whatwg-url';

import objectToURLParams from './objectToURLParams';
import isReactNative from '../utils/isReactNative';
import { HTTPError } from '../utils/errors';
import { getCallbackUrl } from '../utils/oauth';

export default class {
  constructor({
    baseUrl,
    consumerKey,
    consumerSecret,
    requestTokenUrl,
    authorizeUrl,
    accessTokenUrl,
  }) {
    this.baseUrl = baseUrl;
    this.consumerKey = consumerKey;
    this.consumerSecret = consumerSecret;
    this.requestTokenUrl = requestTokenUrl;
    this.authorizeUrl = authorizeUrl;
    this.accessTokenUrl = accessTokenUrl;
    this.state = {};

    this.oauth = OAuth({
      consumer: { key: consumerKey, secret: consumerSecret },
      signature_method: 'HMAC-SHA1',
      hash_function(baseString, key) {
        return Base64.stringify(HmacSHA1(baseString, key));
      },
    });
  }

  async authorize(openUrlAndWaitForCallback) {
    // Step 1 - get request token
    const method = 'POST';
    let req = {
      method,
      body: objectToURLParams(this.oauth.authorize({ url: this.requestTokenUrl, method, data: {} })),
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
    };
    let res = await fetch(this.requestTokenUrl, req);
    if (!res.ok) {
      const text = await res.text();
      throw new HTTPError(text, res.status);
    }
    let resultParams = new URLSearchParams(await res.text());
    const oauthToken = resultParams.get('oauth_token');
    const oauthTokenSecret = resultParams.get('oauth_token_secret');

    // Step 2 - open window to get autorization credentials
    await openUrlAndWaitForCallback(
      `${this.authorizeUrl}?oauth_token=${oauthToken}&oauth_callback=${getCallbackUrl()}`,
      getCallbackUrl()
    );

    // Step 3 - Obtain an access token
    req = {
      method,
      body: objectToURLParams(this.oauth.authorize(
        { url: this.accessTokenUrl, method, data: {} },
        { key: oauthToken, secret: oauthTokenSecret },
      )),
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
    };
    res = await fetch(this.accessTokenUrl, req);
    if (!res.ok) {
      const text = await res.text();
      throw new HTTPError(text, res.status);
    }
    resultParams = new URLSearchParams(await res.text());
    this.state.oauthToken = resultParams.get('oauth_token');
    this.state.oauthTokenSecret = resultParams.get('oauth_token_secret');

    return this.state;
  }

  setState(state) {
    this.state = state;
  }

  getState() {
    return this.state;
  }

  async fetch(route, method = 'GET', data = undefined) {
    const url = this.baseUrl + route;
    const req = {
      method,
      body: data,
      headers: this.oauth.toHeader(this.oauth.authorize(
        { url, method, data },
        { key: this.state.oauthToken, secret: this.state.oauthTokenSecret }
      )),
    };
    return fetch(url, req);
  }
}
