/**
 * Module dependencies.
 */
var Authorization = require('./authorization');

var auth = new Authorization();

exports = module.exports = auth;

exports.Authorization = Authorization;
