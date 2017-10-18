module.exports = Functions;
var AuthorizationError = require("../errors/authorizationError");

function Functions() {

  return {
    register: _register
  };

  function _register() {
    return {
      load: _load,
      isInRole: _isInRole,
      isInAnyRole: _isInAnyRole,
      hasPermission: _hasPermission,
      hasAnyPermission: _hasAnyPermission
    };

    function _load(req, done) {
      this._loadCallback(req, function(authData) {
        if(authData === false){
          return done(false);
        } 
        if(!Array.isArray(authData.roles) && !Array.isArray(authData.permissions)) {
          throw new Error("Authorization: Roles or permissions should be returned from the callback.");
        }
        Object.assign(req._auth, authData);
        return done(true);
      });
    }
      
    function _isInRole(role) {
      var self = this;
      var ary = Array.isArray(role) ? role : [role];
      return ary.every(function(r) {
        return (self._auth ? self._auth.roles||[]:[]).some(function(ar) {
          return ar === r;
        });
      });    
    }

    function _isInAnyRole(role) {
      var self = this;
      var ary = Array.isArray(role) ? role : [role];
      return ary.some(function(r) {
        return  (self._auth ? self._auth.roles||[]:[]).some(function(ar) {
          return ar === r;
        });
      });    
    }

    function _hasPermission(permission) {
      var self = this;
      var ary = Array.isArray(permission) ? permission : [permission];
      return ary.every(function(p) {
        return (self._auth ? self._auth.permissions||[]:[]).some(function(ap) {
          return ap === p;
        });
      });    
    }

    function _hasAnyPermission(permission) {
      var self = this;
      var ary = Array.isArray(permission) ? permission : [permission];
      return ary.some(function(p) {
        return (self._auth ? self._auth.permissions||[]:[]).some(function(ap) {
          return ap === p;
        });
      });    
    }
  }
}