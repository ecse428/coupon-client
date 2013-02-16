var app = {
  localStatus: {
    authenticated: false,
    user: {
      type: 'visitor', // visitor or logged
      id: 0,
      name: 'Visitor'
    },

    controllerView: 'guest' // index, profile, register, createcoupon
  },

  init: function() {
    app.setUpNumerics();
    app.api('/login/test', function(result) {
      if (result.status) {
        app.setUpLoggedIn(result.username, result.user_id);
      }
    });
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
      cb({ error: err.error() });
    });
  },

  error: function(err) {
    alert('Error: ' + JSON.stringify(err));
    console.log('Error', err);
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
    app.localStatus.authenticated = true;
    app.localStatus.user = {
      type:'logged',
      id: id,
      name: username
    };

    app.localStatus.controllerView = 'index';
    $('#login').parent().html('<p class="goToProfile"><img src="/imgs/head.png"/> ' + app.localStatus.user.name + '</p>');

    app.renderPage();
  },

  register: function(data, cb){
    app.api('/users', 'POST', data, function(result){
      if (result.error) return app.error(result.error);
      cb({ username: result.username });
    });
  },

  setUpNumerics: function() {
    $('.creditnumber').numeric();
    $('.phonenumber').numeric();
  },

  getUITemplate: function(cb){
    if (!app.localStatus.controllerView) {
      app.localStatus.controllerView = 'index';
    }

    app.api('/ui/' + app.localStatus.controllerView, function(result){
      if (result.error) return app.error(result.error);
      cb({ tmpl: result.tmpl });
    });
  },

  setAddress: function() {
    var address = "";
    $("#address1, #address2, #city, #province, #postalcode").each(function(){
      address += $.trim($(this).val()) + " ";
    });

    document.getElementById("address").value=address;
  },

  date_pick: function() {
    $("#datepicker").datepicker();
  },

  createCoupon: function(data, cb){
    app.api('/coupons', 'POST', data, function(result){
      if (result.error) return app.error(result.error);
      cb({status: result.status});
    });
  },

  renderPage: function(data) {
    app.getUITemplate(function(result){
      var content = Mustache.render(result.tmpl.content, data),
          nav = Mustache.render(result.tmpl.nav, data);

      $('#contentStack .contentHolder').html(content);
      $('#navContainer .contentHolder').html(nav);
    });
  },
};

var handlers = {
  setup: function() {
    handlers.loadRegisterView();
    handlers.loadIndexView();
    handlers.loadGuestView();
    handlers.loadCreateCouponView();
    handlers.loadProfileView();
    handlers.loadEditProfileView();
    handlers.register();
    handlers.login();
    handlers.createCoupon();

    app.renderPage();
  },

  login: function() {
    $('#login').submit(function(ev) {
      ev.preventDefault();
      var username = $('#login .username').val(),
          password = $('#login .password').val();

      app.login(username, password, function(result) {
        app.setUpLoggedIn(result.name, result.id);
      });
    });
  },


  loadRegisterView : function(){
    $(document).on('click','.registerTrigger', function(e){
      e.preventDefault();

      if (app.localStatus.controllerView != 'register'){
        app.localStatus.controllerView = 'register';
        app.renderPage();
      }
    });
  },

  loadProfileView : function(){
    $(document).on('click','.profileTrigger', function(e) {
      e.preventDefault();

      app.api('/users/' + app.localStatus.user.id, function(data) {
        if (app.localStatus.controllerView != 'profile'){
          app.localStatus.controllerView = 'profile';
          app.renderPage(data);
        }
      });
    });
  },

  loadEditProfileView : function(){
    $(document).on('click','.editProfileTrigger', function(e){
      e.preventDefault();

      if (app.localStatus.controllerView != 'editprofile'){
        app.localStatus.controllerView = 'editprofile';
        app.renderPage();
      }
    });
  },

  loadIndexView : function(){
    $(document).on('click', '.indexTrigger', function(e) {
      e.preventDefault();

      if (app.localStatus.controllerView != 'index') {
        app.localStatus.controllerView = 'index';
        app.renderPage();
      }
    });
  },

  loadGuestView : function(){
    $(document).on('click', '.guestTrigger', function(e) {
      e.preventDefault();

      if (app.localStatus.controllerView != 'guest') {
        app.localStatus.controllerView = 'guest';
        app.renderPage();
      }
    });
  },

  loadCreateCouponView: function(){
    $(document).on('click','.couponCreateTrigger', function(e){
      e.preventDefault();

      if (app.localStatus.controllerView != 'createcoupon'){
        app.localStatus.controllerView = 'createcoupon';
        app.renderPage();
      }
    });
  },

  register: function() {
    $(document).on('click', '.submitRegistration', function(e){
      e.preventDefault();
      var $form = $("#contentStack #register");

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
            app.setUpLoggedIn(result.name, result.id);
          });
        });
      }
    });
  },

  createCoupon: function() {
    $('#contentStack').on('click', '#datepicker', function(e){
      $(this).datepicker();
    });

    $('#contentStack').on('click', '#submitCreateCoupon', function(e){
      e.preventDefault();
      var $form = $("#contentStack #createCoupon");

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

      if ($form.valid()){
        app.createCoupon($form.serializeObject(), function(result){
          alert(result.status);
          app.localStatus.controllerView = 'profile';
          app.renderPage();
        });
      }
    });
  }
};

jQuery(function() {
  handlers.setup();
  app.init();
});
