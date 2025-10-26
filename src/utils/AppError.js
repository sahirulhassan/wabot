export default class AppError extends Error {
  constructor(message, statusCode) {
    super(typeof message === "string" ? message : undefined);
    this.statusCode = statusCode;
    this.messages = Array.isArray(message) ? message : [message]; // always store as array
    Error.captureStackTrace(this, this.constructor);
  }
}
