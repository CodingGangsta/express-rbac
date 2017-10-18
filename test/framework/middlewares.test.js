/* global describe, it, expect, before */
/* jshint expr: true */

var chai = require('chai');
var Middlewares = require('../../lib/framework/middlewares');

describe('framework/middlewares', function() {
  var middlewares;
  
  before(function(done) {
    middlewares = new Middlewares();
    done();
  });

  describe('Class Interface', function() {
    var methods;
    var testAuthorization = {};

    it('should have the correct methods', function() {
      expect(middlewares.register).to.be.an('function');
      methods = middlewares.register(testAuthorization);
      expect(methods.initialize).to.be.an('function');
      expect(methods.isInRole).to.be.an('function');
      expect(methods.isInAnyRole).to.be.an('function');
      expect(methods.hasPermission).to.be.an('function');
      expect(methods.hasAnyPermission).to.be.an('function');
    });
  });
  
  describe('with initialize middleware', function() {
    var request;
    var error;
    var functionCalls;
    var testAuthData;
    var methods;
    
    before(function(done) {
      functionCalls = {
        isInRole: false,
        isInAnyRole: false,
        hasPermission: false,
        hasAnyPermission: false,
        done : false
      };
      testAuthData = {
        roles: ["Admin", "User"],
        permissions: [1,2,3]
      };
      testAuthorization = {
        _options: {},
        _functions: {
          isInRole: function(role) {
            functionCalls.isInRole = true;
            return testAuthData.roles.indexOf(role) > -1;
          },
          isInAnyRole: function(role) {
            functionCalls.isInAnyRole = true;
            return testAuthData.roles.indexOf(role) > -1;
          },
          hasPermission: function(permission) {
            functionCalls.hasPermission = true;
            return testAuthData.permissions.indexOf(permission) > -1;
          },
          hasAnyPermission: function(permission) {
            functionCalls.hasAnyPermission = true;
            return testAuthData.permissions.indexOf(permission) > -1;
          },
          load: function(req, done) {
            functionCalls.load = true;
            done(testAuthData);
          }
        }
      };

      methods = middlewares.register(testAuthorization);
      chai.connect.use(methods.initialize())
        .req(function(req) {
          request = req;
        })
        .next(function(err) {
          error = err;
          done();
        })
        .dispatch();
    });

    it('should call loadCallback method to populate roles & permissions', function() {
      expect(functionCalls.load).to.be.true;
    });

    it('should add auth data to the request', function() {
      expect(request._auth).to.deep.equal({roles: [], permissions: []});
    });

    it('should bind the auth methods to the request', function() {
      expect(request).to.not.be.undefined;
      expect(error).to.be.undefined;
      expect(request.isInRole).to.be.an('function');
      expect(request.isInAnyRole).to.be.an('function');
      expect(request.hasPermission).to.be.an('function');
      expect(request.hasAnyPermission).to.be.an('function');
    });
  
    describe('with isInRole middleware', function() {
      it('should correctly authorize', function() {
        chai.connect.use(methods.isInRole('Admin'))
        .next(function(err) {
          expect(err).to.be.undefined;
          expect(functionCalls.isInRole).to.be.true;
        })
        .dispatch();
      });

      it('should not authorize', function() {
        chai.connect.use(methods.isInRole('Super User'))
        .next(function(err) {
          expect(err.message).to.equal('Unauthorized');
          expect(functionCalls.isInRole).to.be.true;
        })
        .dispatch();
      });
    });

    describe('with isInAnyRole middleware', function() {
      it('should correctly authorize', function() {
        chai.connect.use(methods.isInAnyRole('Admin'))
        .next(function(err) {
          expect(err).to.be.undefined;
          expect(functionCalls.isInAnyRole).to.be.true;
        })
        .dispatch();
      });

      it('should not authorize', function() {
        chai.connect.use(methods.isInAnyRole('Super User'))
        .next(function(err) {
          expect(err.message).to.equal('Unauthorized');
          expect(functionCalls.isInAnyRole).to.be.true;
        })
        .dispatch();
      });
    });

    describe('with hasPermission middleware', function() {
      it('should correctly authorize', function() {
        chai.connect.use(methods.hasPermission(1))
        .next(function(err) {
          expect(err).to.be.undefined;
          expect(functionCalls.hasPermission).to.be.true;
        })
        .dispatch();
      });

      it('should not authorize', function() {
        chai.connect.use(methods.hasPermission(0))
        .next(function(err) {
          expect(err.message).to.equal('Unauthorized');
          expect(functionCalls.hasPermission).to.be.true;
        })
        .dispatch();
      });
    });

    describe('with hasAnyPermission middleware', function() {
      it('should correctly authorize', function() {
        chai.connect.use(methods.hasAnyPermission(1))
        .next(function(err) {
          expect(err).to.be.undefined;
          expect(functionCalls.hasAnyPermission).to.be.true;
        })
        .dispatch();
      });

      it('should not authorize', function() {
        chai.connect.use(methods.hasAnyPermission(0))
        .next(function(err) {
          expect(err.message).to.equal('Unauthorized');
          expect(functionCalls.hasAnyPermission).to.be.true;
        })
        .dispatch();
      });
    });
  });
});
