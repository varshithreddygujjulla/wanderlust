class ExpressError extends Error {
  constructor(statusCode, message) {
    super(message);     // passes message to the built-in Error class
    this.statusCode = statusCode;
  }
}

module.exports = ExpressError;