/*
 * thrown on authority issued authentication errors only
 */
class AuthenticationError extends Error {
  constructor(...params) {
    super(...params);

    /*
      Maintains proper stack trace for where our error was thrown (only available on V8)
      ref: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Error#Handling_a_specific_error
    */
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, AuthenticationError);
    }

    this.name = 'AuthenticationError';
  }
}

export default AuthenticationError;
