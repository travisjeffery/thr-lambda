'use strict';

var debug = require('debug')('thr');
var koa = require('koa');
var config = require('./config');
var Rdio = require('rdio')({
  rdio: config
});
var cors = require('kcors');
var Promise = require('bluebird');
var route = require('koa-route');

var rdio = new Rdio();
Promise.promisifyAll(rdio);

var app = koa();
app.use(cors());
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

  var res = null;
  res = yield rdio.requestAsync({ method: 'findUser', vanityName: username }, false);
  res = yield rdio.requestAsync({ method: 'getHeavyRotation', user: res.result.key }, false);
  this.body = res.result;
};

rdio.getClientToken(function (err) {
  if (err) throw err;

  app.listen(3000, function () {
    console.log('listening at 3000');
  });
})
