/* global describe, it, expect, before */
/* jshint expr: true, sub: true */

var Authorization = require('../lib/authorization');
var AuthorizationError = require('../lib/errors/authorizationError');

describe('Authorization', function() {
  
  describe('#initialize', function() {
    
    describe('with property and roles callback', function() {
      
      var authorization = new Authorization();
      var useFn = authorization.authorize({
        bindToProperty: 'user'
      }, function(req, done) {
          var auth = {
              roles: ["User", "Auditor"],
              permissions: ["CanAddUsers", "CanDeleteUsers"]
          };
          done(auth);
      });

      var error;
      var req = {};
      var res = {};
      var next = function(_error) {
        error = _error;
      };
      
      useFn(req, res, next);

      it('should have the correct properties', function() {
        expect(error).to.be.undefined;
        expect(authorization._options).to.be.an('object');
        expect(authorization._options.bindToProperty).to.be.defined;
        expect(authorization._options.bindToProperty).to.equal('user');
        expect(req.user).to.be.an('object');
        expect(req.user.isInRole).to.be.an('function');
        expect(req.user.isInAnyRole).to.be.an('function');
        expect(req.user.hasPermission).to.be.an('function');
        expect(req.user.hasAnyPermission).to.be.an('function');
      });

      it('should have the correct roles', function() {
        expect(req._auth.roles).to.be.an('array');
        expect(req._auth.roles).to.deep.equal(["User", "Auditor"]);
      });

      it('should have the correct permissions', function() {
        expect(req._auth).to.be.an('object');
        expect(req._auth.permissions).to.be.an('array');
        expect(req._auth.permissions).to.deep.equal(["CanAddUsers", "CanDeleteUsers"]);
      });

      it('should not have raised an error', function() {
        expect(error).to.be.undefined;
      });
    });
    
    describe('with roles callback only', function() {
      var authorization = new Authorization();
      var useFn = authorization.authorize(function(req, done) {
          var auth = {
              roles: ["User", "Auditor"],
              permissions: ["CanAddUsers", "CanDeleteUsers"]
          };
          done(auth);
      });

      var error = null;
      var req = {};
      var res = {};
      var next = function(_error) {
        error = _error;
      };
      
      useFn(req, res, next);

      it('should have the correct properties', function() {
        expect(authorization._options).to.be.an('object');
        expect(authorization._options.bindToProperty).to.be.undefined;
        expect(req.isInRole).to.be.an('function');
        expect(req.isInAnyRole).to.be.an('function');
        expect(req.hasPermission).to.be.an('function');
        expect(req.hasAnyPermission).to.be.an('function');
      });

      it('should have the correct roles', function() {
        expect(req._auth.roles).to.be.an('array');
        expect(req._auth.roles).to.deep.equal(["User", "Auditor"]);
      });

      it('should have the correct permissions', function() {
        expect(req._auth).to.be.an('object');
        expect(req._auth.permissions).to.be.an('array');
        expect(req._auth.permissions).to.deep.equal(["CanAddUsers", "CanDeleteUsers"]);
      });

      it('should not have raised an error', function() {
        expect(error).to.be.undefined;
      });
    });

    describe('with unauthorized callback only', function() {
      var authorization = new Authorization();
      var useFn = authorization.authorize(function(req, done) {
          done(false);
      });

      var error = null;
      var req = {};
      var res = {};
      var next = function(_error) {
        error = _error;
      };
      
      useFn(req, res, next);

      it('should have the correct properties, and no extensions', function() {
        expect(authorization._options).to.be.an('object');
        expect(authorization._options.bindToProperty).to.be.undefined;
        expect(req.isInRole).to.be.undefined;
        expect(req.isInAnyRole).to.be.undefined;
        expect(req.hasPermission).to.be.undefined;
        expect(req.hasAnyPermission).to.be.undefined;
      });

      it('should have the correct roles', function() {
        expect(req._auth.roles).to.be.an('array');
        expect(req._auth.roles).to.deep.equal([]);
      });

      it('should have the correct permissions', function() {
        expect(req._auth).to.be.an('object');
        expect(req._auth.permissions).to.be.an('array');
        expect(req._auth.permissions).to.deep.equal([]);
      });

      it('should not have set the Unauthorized error', function() {
        expect(error).to.be.undefined;
      });
    });

    describe('without callback and properties', function() {
      var authorization = new Authorization();
      var error;
      var useFn;
      var req = {};

      try {
        useFn = authorization.authorize();
      }catch(e){
        error = e;
      }
      
      it('should not have the correct properties', function() {
        expect(useFn).to.be.undefined;
        expect(authorization._options).to.be.an('object');
        expect(authorization._options.bindToProperty).to.be.undefined;
        expect(req.isInRole).to.be.undefined;
        expect(req.isInAnyRole).to.be.undefined;
        expect(req.hasPermission).to.be.undefined;
        expect(req.hasAnyPermission).to.be.undefined;
      });

      it('should not have no roles and no permissions', function() {
        expect(req._auth).to.be.undefined;
      });

      it('should raise an error', function() {
        expect(error).to.be.an.instanceOf(Error);
      });
    });
  });    
});
