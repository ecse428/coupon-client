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
        var r = jQuery.parseJSON(result.error.responseText);
        alert("Error: " + r.error);
        return;
      }

      $.cookie('user_key', result.user_key);
      $.cookie('key', result.key);
      cb({ username: result.username });
    });
  },
  
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
  
  date_pick: function() {
    $("#datepicker").datepicker();
  },
  
  create_coupon: function(name, description, logo_url, useramountlimit, price, coupontype, expirydate, cb) {
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
    
    $("#register").validate({      
      rules: {
        username: "required",
        password: "required",
        email: {
          required: true,
          email: true
        }
      },
      onfocusout: false,
      onkeyup: false
    });
      
    $("#register").submit(function(ev) {          
      ev.preventDefault();
      if ($("#register").valid()) {     
          app.setAddress();          
          var username = $('#register .username').val(),
              password = $('#register .password').val(),
          	  email = $('#register .email').val(),
          	  firstname = $('#register .firstname').val(),
          	  lastname = $('#register .lastname').val(),
          	  address = $('#register #address').val(),
          	  phonenumber = $('#register .phonenumber').val(),
          	  creditcardnumber = $('#register .creditnumber').val(),
              creditcardexpirydate = $('#register .expiryyear').val() + '-' + $('#register .expirymonth').val() + '-01', //Default and quick fix
              paypalaccountname = $('#register .paypal').val(),
              accounttype = $('form input[type=radio]:checked').val();                    
          
          app.register(username, password, email, firstname, lastname, address, phonenumber,
      			   creditcardnumber, creditcardexpirydate, paypalaccountname, accounttype, function(result) {
            alert('Registration Successful');
            document.location.href = 'index.html';
          });
      } else {
        return false;
      }
    });    
  },
  
  view_profile: function() {
  
  },
  
  create_coupon: function() {
    $("#create-coupon").validate({
      rules: {
        couponname: "required",
        description: "required",
		couponimage: "required",
		image_url: "required"
      },
      onfocusout: false,
      onkeyup: false
    });   
       
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
  }  
};

jQuery(function() {
  handlers.setup();
  app.init();
  app.register_number_only();
});
