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
