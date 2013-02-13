var app = {
  localStatus: {
	authenticated: false,
	user: {
		type: 'visitor', // visitor or logged
		id: 0,
		name: 'Visitor'
	},
	controllerView: 'index' // index, profile, register, createcoupon
  },
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
        var r = jQuery.parseJSON(result.error.responseText);
        alert("Error: " + r.error);
        return;
      }

      $.cookie('user_key', result.user_key);
      $.cookie('key', result.key);
      
      cb({id: result.id, name: result.username});
    });
  },
  register: function(data, cb){
	  app.api('/users', 'POST', data, function(result){
			
			if (result.error) {
				//var r = jQuery.parseJSON(result.error.responseText);
				alert("Error: "/* + r.error*/);
				return;
			}
			
			cb({ username: result.username });
		  
	  });
	  
  },
 /*
  register: function(username, password, email, firstname, lastname, address, phonenumber, 
  					 creditcardnumber, creditcardexpirydate, paypalaccountname, accounttype, cb) {
    var data = { username: username,
    			 password: password,
    			 email: email,
    			 firstname: firstname,
    			 lastname: lastname,
    			 address: address,
    			 phonenumber: phonenumber,
    			 creditcardnumber: creditcardnumber,
    			 creditcardexpirydate: creditcardexpirydate,
    			 paypalaccountname: paypalaccountname,
    			 accounttype: accounttype};
    app.api('/users', 'POST', data, function(result) {
      if (result.error) {
        var r = jQuery.parseJSON(result.error.responseText);
        alert("Error: " + r.error);
        return;
      }
      
      cb({ username: result.username });
    });
  },
  
   */
  register_number_only: function() {
    $('.creditnumber').numeric();
    $('.phonenumber').numeric();
  },
  getUITemplate: function(cb){
	  if (app.localStatus.controllerView == undefined){
		  app.localStatus.controllerView = 'index';
	  }
	  
	  app.api('/ui/' + app.localStatus.controllerView, 'POST', function(result){
		  
		  if (result.error) {
			alert("Error: " + jQuery.parseJSON(result.error.responseText).error);
			return;
		  }
		  
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
		  if (result.error) {
				var r = jQuery.parseJSON(result.error.responseText);
				alert("Error: " + r.error);
				return;
		  }
		  
		  cb({status: result.status});
	  });
  }
  /*
  createCoupon: function(name, description, logo_url, useramountlimit, price, coupontype, expirydate, cb) {
    var data = { name: name,
    			 description: description,
    			 logo_url: logo_url,
    			 useramountlimit: useramountlimit,
    			 price: price,
    			 coupontype: coupontype,
    			 expirydate: expirydate };
    app.api('/coupons', 'POST', data, function(result) {
      if (result.error) {
        var r = jQuery.parseJSON(result.error.responseText);
        alert("Error: " + r.error);
        return;
      }
      
      cb({ username: result.username });
    });
  }
  * */
};

var handlers = {
  setup: function() {
    handlers.loadRegisterView();
    handlers.loadIndexView();
    handlers.loadCreateCouponView();
    handlers.loadProfileView();
    handlers.register();
    handlers.login(); 
    handlers.createCoupon();
    handlers.renderPage();
  },

  login: function() {
    $('#login').submit(function(ev) {
      ev.preventDefault();
      var username = $('#login .username').val(),
          password = $('#login .password').val();

      app.login(username, password, function(result) {
		  
		  app.localStatus.authenticated = true;
		  app.localStatus.user = {
			  type:'logged',
			  id: result.id,
			  name: result.name
		  };
		  
		  app.localStatus.controllerView = 'profile';
		  $('#login').parent().html('<p>Welcome ' + app.localStatus.user.name + '</p>');
		  
		  handlers.renderPage();
      });
    });
  },
  renderPage: function(){
	  app.getUITemplate(function(result){
		  // load register form into right hand side #contentStack
		  $('#contentStack .contentHolder').html(result.tmpl.content);
		  // load navigation panel into left hand side #navContainer
		  $('#navContainer .contentHolder').html(result.tmpl.nav);
	  });
  }, 
  loadRegisterView : function(){
    $('#navContainer').on('click','#registerTrigger', function(e){
      e.preventDefault();
      
      if (app.localStatus.controllerView != 'register'){
		  app.localStatus.controllerView = 'register';
		  handlers.renderPage();
	  }
      
    });
  },
  loadProfileView : function(){
    $('#navContainer').on('click','#profileTrigger', function(e){
      e.preventDefault();
      
      if (app.localStatus.controllerView != 'profile'){
		  app.localStatus.controllerView = 'profile';
		  handlers.renderPage();
	  }
    });
  },
  loadIndexView : function(){
    $('#indexTrigger').click(function(e){
      e.preventDefault();
      
      if (app.localStatus.controllerView != 'index'){
		  app.localStatus.controllerView = 'index';
		  handlers.renderPage();
	  }
    });
  },
  loadCreateCouponView: function(){
	  $('#navContainer').on('click','#couponCreateTrigger', function(e){
		  e.preventDefault();
		  
		  if (app.localStatus.controllerView != 'createcoupon'){
			  app.localStatus.controllerView = 'createcoupon';
			  handlers.renderPage();
			  
		  }
	  });
  },
  register: function() {
    $('#contentStack').on('click', '#submitRegistration', function(e){
      e.preventDefault();
      
      var $form = $("#contentStack #register");
      
      $form.validate({      
	    rules: {
		  username: { required: true },
		  password: { required: true },
		  email: { required: true, email:true }
	    },
	    messages: {
		  username : { required: 'User name is required' },
		  password: { required: 'Password is required' },
		  email: { required: 'Email is required', email: 'A valid email is required' }
	    }
      });
      
      if ($form.valid()) {		
			app.register($form.serializeObject(), function(result){
				alert('Registration Successful');
				window.location = '/';
			});
		/*
          app.setAddress();          
          var username = $form.find('.username').val(),
              password = $form.find('.password').val(),
          	  email = $form.find('.email').val(),
          	  firstname = $$form.find('.firstname').val(),
          	  lastname = $form.find('.lastname').val(),
          	  address = $$form.find('#address').val(),
          	  phonenumber = $form.find('.phonenumber').val(),
          	  creditcardnumber = $form.find('.creditnumber').val(),
              creditcardexpirydate = $form.find('.expiryyear').val() + '-' + $('#register .expirymonth').val() + '-01', //Default and quick fix
              paypalaccountname = $('#register .paypal').val(),
              accounttype = $('form input[type=radio]:checked').val();                    
          
          app.register(username, password, email, firstname, lastname, address, phonenumber,
      			   creditcardnumber, creditcardexpirydate, paypalaccountname, accounttype, function(result) {
            alert('Registration Successful');
			window.location = '/profile';
          });
         */
      }
    }); 
  },
  view_profile: function() {
  
  },
  
  createCoupon: function() {
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
				  handlers.renderPage();
			  });
		  }
	  });
       /*
     $('#create-coupon').submit(function(ev) {
       ev.preventDefault();
       
       if ($("#create-coupon").valid()) {
       
           var name = $('#create-coupon .couponname').val(),
       	      description = $('#create-coupon .description').val(),
               logo_url = $('#create-coupon .image_url').val(),
       	      useramountlimit = $('#create-coupon .amount').val(),
      	      price = $('#create-coupon .price').val(),
       	      coupontype = $('#create-coupon .coupontype').val(),
       	      expirydate = $("#datepicker").val();
       
           app.create_coupon(name, description, logo_url, useramountlimit, price, coupontype, expirydate, function(result) {
             alert('Coupon Created');
             document.location.href = 'index.html';
          });
       } else {
         return false;
       }
     });
     */ 
  }  
};

jQuery(function() {
  handlers.setup();
  app.init();
  app.register_number_only();
});
