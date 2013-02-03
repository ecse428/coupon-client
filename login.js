var req = $.ajax({
    url: '/api/coupons',
    type: 'GET'
});

req.done(function(result) {
    alert('Received ' + JSON.stringify(result));
})

req.fail(function(error) {
    alert('Error ' + error)
})



var app = {
  login_request: function (){
    $('form.login-form').submit(function(ev) {
    ev.preventDefault();

    var data = {};

    data.username = $('input.username').val(),
    data.password = $('input.password').val();

    var req = $.ajax({
        url: '/api/login',
        type: 'POST',
        data: JSON.stringify(data)
    });
  };
};

function init() {
  		$("form").submit(function(ev) {
    	ev.preventDefault();

		alert('Handler for .submit() called.');

    	var data = {};

    	data.username = $('#username').val(),
    	data.password = $('#password').val();

    	var req = $.ajax({
        	url: '/api/login',
        	type: 'POST',
        	data: JSON.stringify(data)
    	});

    	req.done(function(result) {
        	$.cookie('user_key', result.user_key);
        	$.cookie('key', result.key);
    	});
	  }

//jQuery(function() {
  //login.init();  
//});