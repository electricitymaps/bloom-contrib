
// Class to represent all of our errors
export class CustomError extends Error {
  constructor(message) {
    super(message);

    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, CustomError);
    }

    this.name = 'CustomError';
  }
}

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
    this.name = 'HTTPError';
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
    this.name = 'NetworkConnectivityError';
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
    this.name = 'ValidationError';
  }
}

export class AuthenticationError extends CustomError {
  constructor(message) {
    super(message);
    this.userMessage = 'Access denied';
    this.name = 'AuthenticationError';
  }
}
