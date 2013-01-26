# Coupon Client

All the client code which will build a view layer ontop of the [coupon-api](https://github.com/ecse428/coupon-api).

## Installation

See the installation instructions detailed in the coupon-api, they include the set up for this repo.

## Connection

There is currently an example connection in ```main.js``` to the API. Basically make an AJAX request to a ```/api``` route using jQuery's AJAX method.

```
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
```

## Authentication

If you attempt the previous AJAX call it will not work until the proper authentication cookies are set.

To do that, first get the user's username and password:

```
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
	
	req.done(function(result) {
		$.cookie('user_key', result.user_key);
		$.cookie('key', result.key);
	});
});
```

Once these cookies are set, any API call which requires authentication will work.