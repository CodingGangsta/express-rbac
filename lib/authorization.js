module.exports = Authorization;

var Middlewares = require('./framework/middlewares');
var middlewares = new Middlewares();

var Functions = require('./framework/functions');
var functions = new Functions();

function Authorization() {
  this._options = {};
  this._loadCallback = null;
  this._functions = null;
  this._middlewares = null; 
}

Authorization.prototype.authorize = function(options, loadCallback) {
  if(!loadCallback) {
    loadCallback = options;
    options = {};
  }
  if (typeof loadCallback !== 'function') {
    throw new Error("Authorization: Load callback should be a function");
  }
  this._options = options;
  this._loadCallback = loadCallback;  
  this._functions = functions.register();
  this._middlewares = middlewares.register(this);
  return this._middlewares.initialize();
};

Authorization.prototype.isInRole = function(role) {
  return this._middlewares.isInRole(role);
}

Authorization.prototype.isInAnyRole = function(role) {
  return this._middlewares.isInAnyRole(role);
}

Authorization.prototype.hasPermission = function(permission) {
  return this._middlewares.hasPermission(permission);
}

Authorization.prototype.hasAnyPermission = function(permission) {
  return this._middlewares.hasAnyPermission(permission);
}

