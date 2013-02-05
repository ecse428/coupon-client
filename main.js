var app = {
  init: function() {
    $.getJSON('/api', function(res) {
      if (res && res.status == 'OK') {
        $('.container').text('CONNECTED TO THE API');
      }
    });
  },

  api: function() {
    var self = this,
        args = Array.prototype.slice.call(arguments),
        cb = args.pop(),
        uri = args.shift(),
        method = args.shift() || 'GET',
        data = args.shift() || {};

    var req = $.ajax({
      url: '/api' + uri,
      type: method,
      dataType: 'json',
      data: JSON.stringify(data)
    });

    req.done(cb);
    req.fail(function(err) {
      cb({ error: err.error() });
    });
  },

  login: function(username, password, cb) {
    var data = { username: username, password: password };

    app.api('/login', 'POST', data, function(result) {
      if (result.error) {
        alert('Error logging in');
        return;
      }

      $.cookie('user_key', result.user_key);
      $.cookie('key', result.key);
      cb({ username: result.username });
    });
  }
};

var handlers = {
  setup: function() {
    handlers.login();
  },

  login: function() {
    $('#login').submit(function(ev) {
      ev.preventDefault();
      var username = $('#login .username').val(),
          password = $('#login .password').val();

      app.login(username, password, function(result) {
        $('#login').parent().html('<p>Welcome ' + result.username + '</p>');
      });
    });
  }
};

jQuery(function() {
  handlers.setup();
  app.init();
});
