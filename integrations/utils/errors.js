
// Class to represent all of our errors
export class CustomError extends Error {}

/*
  A HTTPError is an error that can be reported depending on its status.
  It should be used to represent HTTP responses.
*/
export class HTTPError extends CustomError {
  constructor(message, status) {
    super(message);
    this.name = 'HTTPError';
    this.shouldReport = false;
    this.shouldLog = true;
    this.status = status;
    // Set a user message if we can
    if (status === 401) {
      this.userMessage = 'Access was denied';
    } else {
      this.shouldReport = true;
    }
  }
}

/*
  A NetworkConnectivityError is an error that won't be reported.
  It doesn't assume anything about being shown to the user.
  It should be used to represent network availability problems.
*/
export class NetworkConnectivityError extends CustomError {
  constructor(message) {
    super(message);
    this.name = 'NetworkConnectivityError';
    this.userMessage = 'Could not connect to server.';
    this.shouldReport = false;
    this.shouldLog = true;
  }
}

/*
  A ValidationError is an error that won't be reported but will be shown to the user.
  It should be used to represent wrong user input or forbidden UI paths.
*/
export class ValidationError extends CustomError {
  constructor(message) {
    super(message);
    this.name = 'ValidationError';
    this.userMessage = message;
    this.shouldReport = false;
    this.shouldLog = true;
    this.shouldShowToUser = true;
  }
}

/*
  A ForegroundError is an error that will be shown to the user.
  By default it will be reported.
  It should be used to catch exception in UI flow.
*/
export class ForegroundError extends CustomError {
  constructor(arg1, arg2) {
    if (arg1 instanceof Error) {
      super(arg1.message);
      // Copy all attributes
      this.name = arg1.name;
      Object.getOwnPropertyNames(arg1).forEach((k) => { this[k] = arg1[k]; });
      this.userMessage = arg2 || this.userMessage;
    } else {
      super(arg1);
      this.name = 'ForegroundError';
    }
    if (this.shouldReport == null) { this.shouldReport = true; }
    // Forced properties
    this.shouldLog = true;
    this.shouldShowToUser = true;
  }
}

/*
  A BackgroundError is an error that will not be shown to the user.
  By default it will be reported.
  It should be used for background processing that doesn't yield significant UI changes.
*/
export class BackgroundError extends CustomError {
  constructor(arg1) {
    if (arg1 instanceof Error) {
      super(arg1.message);
      // Copy all attributes
      this.name = arg1.name;
      Object.getOwnPropertyNames(arg1).forEach((k) => { this[k] = arg1[k]; });
    } else {
      super(arg1);
      this.name = 'BackgroundError';
    }
    if (this.shouldReport == null) { this.shouldReport = true; }
    // Forced properties
    this.shouldLog = true;
    this.shouldShowToUser = false;
  }
}
