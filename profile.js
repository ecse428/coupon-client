jQuery(function() {
  alert('init jQuery');
  $.getJSON('/api/users/1', function(res) {
    alert('get');
  });
});