/* global describe, it, expect */

var authorization = require('..');

describe('express-authorization', function() {
  
  it('should expose singleton authorization', function() {
    expect(authorization).to.be.an('object');
    expect(authorization).to.be.an.instanceOf(authorization.Authorization);
  });
  
  it('should export constructors', function() {
    expect(authorization.Authorization).to.be.an('function');
  });
});
