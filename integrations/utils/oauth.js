import HmacSHA1 from 'crypto-js/hmac-sha1';
import Base64 from 'crypto-js/enc-base64';
import OAuth from 'oauth-1.0a';
import { URLSearchParams } from 'whatwg-url';

function objectToFormData(obj) {
  const body = new URLSearchParams();
  Object.keys(obj).forEach((k) => { body.append(k, obj[k]); });
  return body.toString();
}

// eslint-disable-next-line no-undef
const isPlayground = !(typeof navigator !== 'undefined' && navigator.product === 'ReactNative');

export class OAuthManager {
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
      body: objectToFormData(this.oauth.authorize({ url: this.requestTokenUrl, method, data: {} })),
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
    };
    let res = await fetch(this.requestTokenUrl, req);
    // console.warn(req.body.toString())
    if (!res.ok) {
      const text = await res.text();
      // throw new HTTPError(text, res.status);
      throw new Error(`HTTP error ${res.status}: ${text}`);
    }
    let resultParams = new URLSearchParams(await res.text());
    const oauthToken = resultParams.get('oauth_token');
    const oauthTokenSecret = resultParams.get('oauth_token_secret');

    // Step 2 - open window to get autorization credentials
    const callbackUrl = isPlayground
      ? 'http://localhost:3000/oauth_callback'
      : 'com.tmrow.greenbit://oauth_callback';
    await openUrlAndWaitForCallback(
      `${this.authorizeUrl}?oauth_token=${oauthToken}&oauth_callback=${callbackUrl}`,
      callbackUrl
    );

    // Step 3 - Obtain an access token
    req = {
      method,
      body: objectToFormData(this.oauth.authorize(
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
      // throw new HTTPError(text, res.status);
      throw new Error(`HTTP error ${res.status}: ${text}`);
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
