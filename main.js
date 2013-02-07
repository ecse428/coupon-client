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
  },
  
  register: function(username, password, email, firstname, lastname, cb) {
    var data = { username: username,
    			 password: password,
    			 email: email,
    			 firstname: firstname,
    			 lastname: lastname };
    app.api('/users', 'POST', data, function(result) {
      if (result.error) {
        alert('Error registering');
        return;
      }
      
      cb({ username: result.username });
    });
  }
  
};

var handlers = {
  setup: function() {
    handlers.register();
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
  },
  
  register: function() {
    $('#register').submit(function(ev) {
      ev.preventDefault();
      var username = $('#register .username').val(),
          password = $('#register .password').val(),
          email = $('#register .email').val(),
          firstname = $('#register .firstname').val(),
          lastname = $('#register .lastname').val();
          
      app.register(username, password, email, firstname, lastname, function(result) {
        alert(result.username);
      });
    });
  }
};

jQuery(function() {
  handlers.setup();
  app.init();
});
