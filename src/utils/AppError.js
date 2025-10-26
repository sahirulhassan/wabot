export default class AppError extends Error {
  constructor(statusCode, userFriendlyError, realError) {
    super(realError);
    this.userFriendlyError = userFriendlyError;
    this.statusCode = statusCode;
    Error.captureStackTrace(this, this.constructor);
  }
}
