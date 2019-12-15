import { HTTPError, NetworkConnectivityError } from './errors';

/**
 *  A wrapper around fetch which handles errors and JSON nicely
 * @param {String} url    The url to fetch data from
 * @param {Object} opts   Fetch options, including data
 * @return {Object}       response object
 */
export default async function request(url, opts = {}) {
  // opts.data is an object which is converted to JSON as the body of the request
  if (opts.data) {
    opts.body = JSON.stringify(opts.data);
  }

  try {
    const response = await fetch(url, {
      headers: {
        'Content-type': 'application/json',
      },
      ...opts,
    });

    if (!response.ok) {
      throw new HTTPError(response.statusText, response.status);
    }
    response.data = await response.json();

    return response;
  } catch (err) {
    if (err.name !== 'HTTPError') {
      // Usually connection issue when fetch throws an error.
      throw new NetworkConnectivityError('Failed to fetch');
    } else {
      // Rethrow errors from response.status !== 200
      throw err;
    }
  }
}
