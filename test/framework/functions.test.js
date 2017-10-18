/* global describe, it, expect, before */
/* jshint expr: true */

var chai = require('chai');
var Functions = require('../../lib/framework/functions');

describe('framework/functions', function() {
  var functions;
  
  before(function(done) {
    functions = new Functions();
    done();
  });

  describe('Class Interface', function() {
    var methods;
    
    it('should have the correct methods', function() {
      expect(functions.register).to.be.an('function');
      methods = functions.register();
      expect(methods.load).to.be.an('function');
      expect(methods.isInRole).to.be.an('function');
      expect(methods.isInAnyRole).to.be.an('function');
      expect(methods.hasPermission).to.be.an('function');
      expect(methods.hasAnyPermission).to.be.an('function');
    });
  });

  describe('Load Method', function() {
    var methods;
    var testRequest;
    var testAuthorization;
    var authData;
    var load;

    beforeEach(function(done) {
      testRequest = {
        _auth: {
          roles: [],
          permissions: []
        }
      };
      testAuthorization = {
        _loadCallback: function(req, done) {
          done(authData);
        }
      };
      methods = functions.register();
      load = methods.load.bind(testAuthorization);
      done();
    });
    
    it('should check for correct roles and permissions', function() {
      authData = {};
      try{
        load(testRequest, function(){
          // testRequest should have roles & permissions set here!.         
        });
      }catch(e){
        expect(e.message).to.equal("Authorization: Roles or permissions should be returned from the callback.")
      }
    });

    it('should load correctly only with roles', function() {
      authData = {roles: ["Content Editor", "Administrator"]};
      load(testRequest, function(){
        expect(testRequest._auth.roles).to.be.an('array');
        expect(testRequest._auth.roles.length).to.equal(2);
        expect(testRequest._auth.permissions).to.be.an('array');
        expect(testRequest._auth.permissions.length).to.equal(0);
      });
    });

    it('should load correctly only with roles', function() {
      authData = {permissions: [0,1,2]};
      load(testRequest, function(){
        expect(testRequest._auth.roles).to.be.an('array');
        expect(testRequest._auth.roles.length).to.equal(0);
        expect(testRequest._auth.permissions).to.be.an('array');
        expect(testRequest._auth.permissions.length).to.equal(3);
      });
    });
  });

  describe('Check Methods', function() {
    var methods;
    var testRequest;

    before(function(done) {
      testRequest = {
        _auth: {
          roles: ["Admin", "User"],
          permissions: [1, 2, 3]
        }
      };
      methods = functions.register();
      done();
    });
    
    it('Method isInRole should work correctly', function() {      
      var isInRole = methods.isInRole.bind(testRequest);
      expect(isInRole("Admin")).to.be.true;
      expect(isInRole(["Admin", "User"])).to.be.true;
      expect(isInRole(["Admin", "User", "Auditor"])).to.be.false;
      expect(isInRole("Auditor")).to.be.false;
    });

    it('Method isInAnyRole should work correctly', function() {      
      var isInAnyRole = methods.isInAnyRole.bind(testRequest);
      expect(isInAnyRole("Admin")).to.be.true;
      expect(isInAnyRole(["Admin", "Auditor"])).to.be.true;
      expect(isInAnyRole(["Content Manager", "Auditor"])).to.be.false;
      expect(isInAnyRole("Auditor")).to.be.false;
    });

    it('Method hasPermission should work correctly', function() {      
      var hasPermission = methods.hasPermission.bind(testRequest);
      expect(hasPermission(2)).to.be.true;
      expect(hasPermission([1, 3])).to.be.true;
      expect(hasPermission([2, 4])).to.be.false;
      expect(hasPermission("2")).to.be.false;
    });

    it('Method hasAnyPermission should work correctly', function() {      
      var hasAnyPermission = methods.hasAnyPermission.bind(testRequest);
      expect(hasAnyPermission(2)).to.be.true;
      expect(hasAnyPermission([1, 5])).to.be.true;
      expect(hasAnyPermission([0, 4])).to.be.false;
      expect(hasAnyPermission("2")).to.be.false;
    });
  });
});
