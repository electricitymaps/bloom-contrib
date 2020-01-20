import { HTTPError, NetworkConnectivityError } from './errors';

/**
 *  A wrapper around fetch which handles errors and JSON nicely
 * @param {String} url    The url to fetch data from
 * @param {Object} data   Object to convert to JSON and put in body
 * @param {Object} headers  Fetch headers object
 * @return {Object}       response object
 */
export default async function request({
  url, method, data, headers,
}) {
  try {
    const response = await fetch(url, {
      headers: {
        'Content-type': 'application/json',
        ...headers,
      },
      method: method || 'GET',
      body: data ? JSON.stringify(data) : undefined,
    });

    if (!response.ok) {
      throw new HTTPError(response.statusText, response.status);
    }
    response.data = await response.json();

    return response;
  } catch (err) {
    if (err.name !== 'HTTPError') {
      // Usually connection issue when fetch throws an error.
      throw new NetworkConnectivityError(err.message);
    } else {
      // Rethrow errors from response.status !== 200
      throw err;
    }
  }
}
