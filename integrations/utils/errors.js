
// Class to represent all of our errors
export class CustomError extends Error {}

/*
  A HTTPError is an error that should be used to represent HTTP responses.
*/
export class HTTPError extends CustomError {
  constructor(message, status) {
    super(message);
    this.status = status;
    if (status === 401) {
      this.userMessage = 'Access was denied';
    }
  }
}

/*
  A NetworkConnectivityError is an error that
  should be used to represent network availability problems.
*/
export class NetworkConnectivityError extends CustomError {
  constructor(message) {
    super(message);
    this.userMessage = 'Could not connect to server.';
  }
}

/*
  A ValidationError is an error that should be
  used to represent wrong user input or forbidden UI paths.
*/
export class ValidationError extends CustomError {
  constructor(message) {
    super(message);
    this.userMessage = message;
  }
}
