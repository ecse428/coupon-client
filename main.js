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
  
  register: function(username, password, email, firstname, lastname, address, phonenumber, 
  					 creditnumber, expirymonth, expiryyear, paypal, accounttype, cb) {
    var data = { username: username,
    			 password: password,
    			 email: email,
    			 firstname: firstname,
    			 lastname: lastname,
    			 address: address,
    			 phonenumber: phonenumber,
    			 expirymonth: expirymonth,
    			 expiryyear: expiryyear,
    			 paypal: paypal,
    			 accounttype: accounttype};
    app.api('/users', 'POST', data, function(result) {
      if (result.error) {
        alert(JSON.stringify(result.error.responseText));
        return;
      }
      
      cb({ username: result.username });
    });
  },
  
  
  register_number_only: function() {
    $('.creditnumber').numeric();
    $('.phonenumber').numeric();
  },
  
  setAddress: function() {
	var address = "";
    $("#address1, #address2, #city, #province, #postalcode").each(function(){
    	address += $.trim($(this).val()) + " ";
    });

    document.getElementById("address").value=address;
  },
  
  register_validation: function() {
    $("#register").validate({
      rules: {
        username: "required",
        password: "required",
        email: {
          required: true,
          email: true
        }
      }      
    });
  },
  
  date_pick: function() {
    $("#datepicker").datepicker();
  },
  
  create_coupon: function(name, description, logo_url, amount, price, coupontype, expirydate, cb) {
    var data = { name: name,
    			 description: description,
    			 logo_url: logo_url,
    			 amount: amount,
    			 price: price,
    			 coupontype: coupontype,
    			 expirydate: expirydate };
    app.api('/coupons', 'POST', data, function(result) {
      if (result.error) {
        alert(JSON.stringify(result.error.responseText));
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
    handlers.create_coupon();    
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
      app.setAddress();
      
      var username = $('#register .username').val(),
          password = $('#register .password').val(),
          email = $('#register .email').val(),
          firstname = $('#register .firstname').val(),
          lastname = $('#register .lastname').val(),
          address = $('#register #address').val(),
          phonenumber = $('#register .phonenumber').val(),
          creditnumber = $('#register .creditnumber').val(),
          expirymonth = $('#register .expirymonth').val(),
          expiryyear = $('#register .expiryyear').val(),
          paypal = $('#register .paypal').val(),
          accounttype = $('form input[type=radio]:checked').val();                    
          
      app.register(username, password, email, firstname, lastname, address, phonenumber,
      			   creditnumber, expirymonth, expiryyear, paypal, accounttype, function(result) {
        alert('Registration Successful');
        document.location.href = 'index.html';
      });
    });
  },
  
  view_profile: function() {
  
  },
  
  create_coupon: function() {
    $('#create-coupon').submit(function(ev) {
      ev.preventDefault();
      
      var name = $('#create-coupon .couponname').val(),
      	  description = $('#create-coupon .description').val(),
      	  logo_url = $('#create-coupon .image_url').val(),
      	  amount = $('#create-coupon .amoung').val(),
      	  price = $('#create-coupon .price').val(),
      	  coupontype = $('#create-coupon .coupontype').val(),
      	  expirydate = $("#datepicker").val();
      
      app.create_coupon(name, description, logo_url, amount, price, coupontype, expirydate, function(result) {
        alert('Coupon Created');
        document.location.href = 'index.html';
      });
      
    });
  }  
};

jQuery(function() {
  handlers.setup();
  app.init();
  app.register_number_only();
  app.register_validation();
});
