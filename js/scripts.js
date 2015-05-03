$(function(){

  var $container = $('.isotope > .row');

  $container.isotope({
    itemSelector: '.item',
    layoutMode: 'masonry',
    getSortData: {
      interest: '[data-interest]',
      alpha: 'h3'
    },
  });

  $('.filters').on( 'click', 'button', function() {
    var filterValue = $(this).attr('data-filter');
    $container.isotope({ filter: filterValue });
  });

  $('.sorts').on( 'click', 'button', function() {
    var sortValue = $(this).attr('data-sort');
    sortValue = sortValue.split(',');
    $container.isotope({ sortBy: sortValue });
  });

  $('.filters, .sorts').each( function( i, buttonGroup ) {
    var $buttonGroup = $( buttonGroup );
    $buttonGroup.on( 'click', 'button', function() {
      $buttonGroup.find('.active').removeClass('active');
      $( this ).addClass('active');
    });
  });

});