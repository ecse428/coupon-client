/*global test, asyncTest, ok, equal, expect, start */

module("Client Tests", {

  setup: function() {
    app.self = {
      authenticated: false,
      user: {
        type: 'visitor', // visitor or logged
        id: 0,
        name: 'Visitor'
      },
      controllerView: 'guest', // guest, index, profile, register, createcoupon, search, searchresult
      controllerData: {},
      nav: $('#navContainer .contentHolder'), // to hold navigation panel
      content: $('#contentStack .contentHolder') // to hold content
    };
  }

});

asyncTest('Can connect to the API', function() {
  expect(1);

  app.api('', function(data) {
    equal(data.status, 'OK');
    start();
  });
});

asyncTest('Can load coupons', function() {
  expect(1);

  app.api('/coupons', function(data) {
    equal(data.status, 'OK');
    start();
  });
});

asyncTest('Login test fails without cookies', function() {
  expect(1);

  $.cookie('user_key', null);
  $.cookie('key', null);
  app.api('/login/test', function(result) {
    ok(!result.status);
    start();
  });
});

asyncTest('Can login with test user', function() {
  expect(3);

  app.login('alex', '12345678', function(data) {
    equal(app.self.user.name, 'alex');
    ok($.cookie('user_key'));
    ok($.cookie('key'));
    start();
  });
});

asyncTest('Can load the index UI', function() {
  expect(1);

  app.ui(function(data) {
    ok(data.tmpl);
    start();
  });
});

asyncTest('Can load a different UI', function() {
  expect(3);

  app.ui(function(data) {
    var tmpl = data.tmpl;
    ok(tmpl);
    app.self.controllerView = 'profile';

    app.ui(function(data) {
      ok(data.tmpl);
      ok(tmpl != data.tmpl);
      start();
    });
  });
});

asyncTest('Can search for test user', function() {
  expect(3);

  app.api('/user_search', 'POST', {username: 'alex'}, function(result) {
    ok(!result.error);
    ok(result.status);
    ok(result.data.length > 0);
    start();
  });
});

asyncTest('Can fuzzy search for a user', function() {
  expect(3);

  app.api('/user_search', 'POST', {username: 'alex'}, function(result) {
    ok(!result.error);
    ok(result.status);
    ok(result.data.length > 0);
    start();
  });
});

asyncTest('Can search for coupons', function() {
  expect(3);

  app.api('/coupon_search', 'POST', {couponname: ''}, function(result) {
    ok(!result.error);
    ok(result.status);
    ok(result.data.length > 0);
    start();
  });
});
