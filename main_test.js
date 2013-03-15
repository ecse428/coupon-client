/*global test, asyncTest, ok, equal, expect, start */

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
    equal(data.name, 'alex');
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
  expect(2);

  app.searchUser({username: 'alex'}, function(results) {
    ok(results.status);
    ok(results.data.length > 0);
    start();
  });
});

asyncTest('Can fuzzy search for a user', function() {
  expect(2);

  app.searchUser({username: 'ale'}, function(results) {
    ok(results.status);
    ok(results.data.length > 0);
    start();
  });
});

asyncTest('Can search for coupons', function() {
  expect(2);

  app.searchCoupon({couponname: ''}, function(results) {
    ok(results.status);
    ok(results.data.length > 0);
    start();
  });
});
