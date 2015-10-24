'use strict';

var debug = require('debug')('thr');
var koa = require('koa');
var config = require('./config');
var Rdio = require('rdio')({
  rdio: config
});

var rdio = new Rdio();
var Promise = require('bluebird');
var authenticate = Promise.promisify(rdio.getClientToken);
var request = Promise.promisify(rdio.request);
var route = require('koa-route');
var app = koa();


app.use(function *(next) {
  try {
    yield next;
  } catch (e) {
    this.status = e.status || 500;
    this.body = e.message;
  }
});

app.use(route.get('/:name', get));

function *get(username) {
  if (!username) this.throw('Username needs to be passed in.', 403)

  this.body = yield function(done) {
    rdio.getClientToken(function(err) {
      if (err) return done(err);
      rdio.request({ method: 'findUser', vanityName: username }, false, function(err, res) {
        if (err) return done(err);
        rdio.request({ method: 'getHeavyRotation', user: res.result.user }, false, function(err, res) {
          done(err, res.result);
        })
      });
    });
  }
};

module.exports = app;
