'use strict';

$(document).ready(function() {
  $('.doc-content p img').each(function() {
    $(this).click(function() {
      window.open($(this).prop('src'));
    });
  });
});
