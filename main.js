var routes = {
  'index': function() {
    app.setView('index');
    app.api('/coupons', function(result) {
      if (result.error) return app.error(result.error);
      app.renderPage(result);
    });
  },

  'guest': function() {
    app.setView('guest');
    app.api('/coupons', function(result) {
      if (result.error) return app.error(result.error);
      app.renderPage(result);
    });
  },

  'profile': function() {
    app.setView('profile');
    app.api('/users/' + app.self.user.id, function(result) {
      if (result.error) return app.error(result.error);
      if (result.accounttype == 'admin') result.admin = true;
      app.renderPage(result);
    });
  },

  'editprofile': function() {
    app.setView('editprofile');
    app.api('/users/' + app.self.user.id, function(result) {
      if (result.error) return app.error(result.error);
      app.renderPage(result);
    });
  },

  'coupon': function() {
    var route = window.location.hash.split('/'),
        id = route.length == 2 ? route[1] : null;

    if (id === null) return app.error('Invalid URL');

    app.setView('coupondetail');
    app.api('/coupons/' + id, function(result) {
      if (result.error) return app.error(result.error);
      app.renderPage(result);
    });
  },

  'createcoupon': function() {
    app.setView('createcoupon');
    app.renderPage({}, function() {
      $('#contentStack .datepicker').datepicker();
    });
  },

  'register': function() {
    app.setView('register');
    app.renderPage();
  },

  'search': function() {
    app.setView('search');
    app.renderPage();
  },

  'settings': function() {
    app.setView('settings');
    app.renderPage();
  },

  'testpage': function() {
    app.setView('testpage');
    app.renderPage();
  },

  'purchased': function() {
    app.setView('purchasedcoupon');
    app.api('/coupons/purchased/' + app.self.user.id, function(result){
      if (result.error) return app.error(result.error);
      app.renderPage(result);
    });
  },

  'logout': function() {
    $.removeCookie('user_key');
    $.removeCookie('key');
    app.route('guest');
  },

  'searchusers': function() {
    var data = app.getQueryParams();

    app.api('/user_search', 'POST', data, function(result) {
      if (result.error) return app.error(result.error);
      app.setView('user_result');
      app.renderPage(result);
    });
  },

  'searchcoupons': function() {
    var data = app.getQueryParams();

    app.api('/coupon_search', 'POST', data, function(result) {
      if (result.error) return app.error(result.error);
      app.setView('coupon_result');
      app.renderPage(result);
    });
  }
};

var app = {
  self: {
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
  },

  route: function(uri, data) {
    if (window.location.hash.substr(1) == uri && !data) {
      return $(window).hashchange();
    }

    var query = '?';
    $.each(data || {}, function(key, val) {
      query += key + '=' + encodeURIComponent(val) + '&';
    });

    window.location.hash = uri + query.slice(0, -1);
  },

  getQueryParams: function() {
    if (window.location.hash.split('?').length != 2) return {};

    var result = {},
        queryStr = window.location.hash.split('?')[1],
        queries = queryStr.split('&');

    $.each(queries, function(ind, val) {
      var d = val.split('=');
      result[d[0]] = decodeURIComponent(d[1]);
    });

    return result;
  },

  routeHandler: function(ev) {
    ev.preventDefault();

    var route = $(ev.currentTarget).data('route');
    app.route(route.split('/')[0]);
  },

  init: function() {
    $(window).hashchange(function() {
      var hash = window.location.hash.substr(1).split('?')[0],
          handler = routes[hash] || routes.index;
      handler();
    });

    $(document).on('click', 'a[data-route]', app.routeHandler);

    app.api('/login/test', function(result) {
      if (result.status) {
        app.setUpLoggedIn(result.username, result.user_id);
        return $(window).hashchange();
      }

      app.route('guest');
    });
  },

  authenticated: function(){
    return app.self.authenticated;
  },

  setView: function(viewName){
    app.self.controllerView = viewName;
  },

  api: function() {
    var self = this,
        args = Array.prototype.slice.call(arguments),
        cb = args.pop(),
        uri = args.shift(),
        method = args.shift() || 'GET',
        data = args.shift();

    var req = $.ajax({
      url: '/api' + uri,
      type: method,
      dataType: 'json',
      data: JSON.stringify(data)
    });

    req.done(cb);
    req.fail(function(err) {
      try {
        var errObj = JSON.parse(err.responseText);
        if (!errObj.error) errObj = {error: errObj};
        cb(errObj);
      } catch (e) {
        cb({ error: err.responseText });
      }
    });
  },

  error: function(err) {
    if (err.error) err = err.error;
    alert('Error: ' + err);
  },

  login: function(username, password, cb) {
    var data = { username: username, password: password };

    app.api('/login', 'POST', data, function(result) {
      if (result.error) return app.error(result.error);

      $.cookie('user_key', result.user_key);
      $.cookie('key', result.key);

      cb({id: result.id, name: result.username});
    });
  },

  setUpLoggedIn: function(username, id) {
    app.self.authenticated = true;
    app.self.user = {
      type:'logged',
      id: id,
      name: username
    };

    $('#login').parent().html('<p class="goToProfile"><img src="/imgs/head.png"/> ' + app.self.user.name + '</p>');
  },

  register: function(data, cb){
    app.api('/users', 'POST', data, function(result){
      if (result.error) return app.error(result.error);
      cb({ username: result.username });
    });
  },

  createCoupon: function(data, cb){
    app.api('/coupons', 'POST', data, function(result){
      if (result.error) return app.error(result.error);
      cb({status: result.status});
    });
  },

  buyCoupon: function(data, user_id, id, cb){
    app.api('/coupons/buy/' + user_id + '/' + id, 'POST', data, function(result){
      if (result.error) return app.error(result.error);
      cb(result);
    });
  },

  ui: function(cb){
    if (!app.self.controllerView) {
      app.setView('index');
    }

    app.api('/ui/' + app.self.controllerView, function(result){
      if (result.error) return app.error(result.error);
      cb({ tmpl: result.tmpl });
    });
  },

  renderPage: function() {
    var args = Array.prototype.slice.call(arguments),
        data = args.shift() || app.self.controllerData || {},
        cb = args.shift() || function() {};

    app.ui(function(result){
      var content = Mustache.render(result.tmpl.content, data),
          nav = Mustache.render(result.tmpl.nav, data);

      app.self.content.html(content).hide().slideDown();
      app.self.nav.html(nav).hide().slideDown();
      cb();
    });
  }
};

var handlers = {
  setup: function() {
    handlers.login();
    handlers.register();
    handlers.createCoupon();
    handlers.editUserProfile();
    handlers.searchUser();
    handlers.searchCoupon();
    handlers.buyCoupon();
  },

  login: function() {
    $(document).on('submit', '#login', function(ev) {
      ev.preventDefault();
      var username = $('#login .username').val(),
          password = $('#login .password').val();

      app.login(username, password, function(result) {
        app.setUpLoggedIn(result.name, result.id);
        app.route('index');
      });
    });
  },

  register: function() {
    $(document).on('submit', '#register', function(ev){
      ev.preventDefault();
      var $form = $('#register');

      $form.validate({
        rules: {
          username: { required: true },
          password: { required: true },
          email: { required: true, email: true }
        },
        messages: {
          username : { required: 'User name is required' },
          password: { required: 'Password is required' },
          email: { required: 'Email is required', email: 'A valid email is required' }
        }
      });

      if ($form.valid()) {
        var formData = $form.serializeObject();

        app.register(formData, function(result) {
          app.login(formData.username, formData.password, function(data) {
            app.setUpLoggedIn(data.name, data.id);
            app.route('index');
          });
        });
      }
    });
  },

  createCoupon: function() {
    $('#contentStack').on('submit', '#createCoupon', function(e){
      e.preventDefault();
      var $form = $("#createCoupon");

      $form.validate({
        rules: {
          couponname: {required: true},
          description: {required: true},
          image_url: {required: true}
        },

        messages: {
          couponname: {required: 'Coupon\'s name is required'},
          description: {required: 'Description is required'},
          image_url: {required: 'URL cannot be empty'}
        }
      });

      if ($form.valid()) {
        app.createCoupon($form.serializeObject(), function(result) {
          app.route('index');
        });
      }
    });
  },

  editUserProfile: function(){
    $(document).on('submit', '#editUserProfile', function(ev) {
      ev.preventDefault();
      var $form = $("#editUserProfile");

      $form.validate({
        rules: {
          email: {email: true}
        },
        messages: {
          email: {required: 'Invalid empty'}
        }
      });

      if ($form.valid()) {
        app.api('/users/' + app.self.user.id, 'PUT', $form.serializeObject(), function(result) {
          app.route('profile');
        });
      }
    });
  },

  searchUser: function(){
    $(document).on('submit', '#searchUser', function(ev) {
      ev.preventDefault();
      var $form = $("#searchUser");

      app.route('searchusers', $form.serializeObject());
    });
  },

  searchCoupon: function(){
    $(document).on('submit', '#searchCoupon', function(e){
      e.preventDefault();
      var $form = $("#searchCoupon");

      app.route('searchcoupons', $form.serializeObject());
    });
  },

  buyCoupon: function(){
    $(document).on('submit', '#buyCoupon', function(e){
      e.preventDefault();
      var $form = $("#buyCoupon");
      var user_id = app.self.user.id;
      var id = $(this).attr('data-uri-id');
      app.buyCoupon($form.serializeObject(), user_id, id, function(data){
        if (app.self.controllerView != 'purchasedcoupon'){
          app.setView('purchasedcoupon');
          app.getPurchasedCoupons(user_id, function(result){
          app.renderPage(result);
        });
        }
      });
    });
  }
};
