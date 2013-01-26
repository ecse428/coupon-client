var app = {
  init: function() {
    $.getJSON('/api', function(res) {
      if (res && res.status == 'OK') {
        $('.container').text('CONNECTED TO THE API');
      }
    });
  }
};

jQuery(function() {
  app.init();
});
