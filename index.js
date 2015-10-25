'use strict';

var config = require('./config');
var Rdio = require('rdio')({
  rdio: config
});
var rdio = new Rdio();

function handler(event, context) {
  var username = event.username;

  if (!username) {
    var error = new Error('Username needs to be passed in.');
    return context.fail(error)
  }

  rdio.getClientToken(function (err) {
    if (err) return context.fail(err);
    rdio.request({ method: 'findUser', vanityName: username }, false, function (err, res) {
      if (err) return context.fail(err);
      rdio.request({ method: 'getHeavyRotation', user: res.result.key }, false, function (err, res) {
        if (err) return context.fail(err);
        context.succeed(res.result);
      });
    });
  });
};

exports.handler = handler;
