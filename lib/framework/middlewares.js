exports = module.exports = Middlewares;

var AuthorizationError = require('../errors/authorizationError');

function Middlewares() {

  return {
    register: _register
  };

  function _register(authorization){
    return {
      initialize: _initialize,
      isInRole: _isInRole,
      isInAnyRole: _isInAnyRole,
      hasPermission: _hasPermission,
      hasAnyPermission: _hasAnyPermission
    };
  
    function _initialize() {    
      return function initialize(req, res, next) {
        try{
          req._auth = {
            roles: [], 
            permissions: []
          };

          var isInRole = authorization._functions.isInRole.bind(req);
          var isInAnyRole = authorization._functions.isInAnyRole.bind(req);
          var hasPermission = authorization._functions.hasPermission.bind(req);
          var hasAnyPermission = authorization._functions.hasAnyPermission.bind(req);
      
          if(authorization._options.bindToProperty)
          {
            if(!req[authorization._options.bindToProperty]){
              req[authorization._options.bindToProperty] = {};
            }
            req[authorization._options.bindToProperty].isInRole = isInRole;
            req[authorization._options.bindToProperty].isInAnyRole = isInAnyRole;
            req[authorization._options.bindToProperty].hasPermission = hasPermission;
            req[authorization._options.bindToProperty].hasAnyPermission = hasAnyPermission;
          }else{
            req.isInRole = isInRole;
            req.isInAnyRole = isInAnyRole;
            req.hasPermission = hasPermission;
            req.hasAnyPermission = hasAnyPermission;
          }
          
          authorization._functions.load.bind(authorization)(req, function() {
            next();
          });        
        }catch(e) {
          next(e);
        }
      };
    }

    function _isInRole(role) {
      return function(req, res, next) {
        var isInRole = authorization._functions.isInRole.bind(req);
        if(isInRole(role)){ 
          return next();
        } 
        return next(new AuthorizationError('Unauthorized'));
      };
    }

    function _isInAnyRole(role) {
      return function(req, res, next) {
        var isInAnyRole = authorization._functions.isInAnyRole.bind(req);
        if(isInAnyRole(role)){ 
          return next();
        } 
        return next(new AuthorizationError('Unauthorized'));
      };
    }

    function _hasPermission(permission) {
      return function(req, res, next) {
        var hasPermission = authorization._functions.hasPermission.bind(req);
        if(hasPermission(permission)){
          return next();
        } 
        return next(new AuthorizationError('Unauthorized'));
      };
    }  

    function _hasAnyPermission(permission) {
      return function(req, res, next) {
        var hasAnyPermission = authorization._functions.hasAnyPermission.bind(req);
        if(hasAnyPermission(permission)){
          return next();
        } 
        return next(new AuthorizationError('Unauthorized'));
      };
    }  
  }
}
