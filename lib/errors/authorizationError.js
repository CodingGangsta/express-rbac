module.exports = AuthorizationError;

function AuthorizationError(message, status) {
  Error.call(this);
  Error.captureStackTrace(this, arguments.callee);
  this.name = 'AuthorizationError';
  this.message = message;
  this.status = status || 403;
}

AuthorizationError.prototype.__proto__ = Error.prototype;


