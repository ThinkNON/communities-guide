$(function(){

  var $container = $('.isotope > .row').imagesLoaded( function() {

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

   $('.item').each(function () {
      var hue = 'rgb(' + (Math.floor((256-199)*Math.random()) + 200) + ',' + (Math.floor((256-199)*Math.random()) + 200) + ',' + (Math.floor((256-199)*Math.random()) + 200) + ')';
      $(this).css("background-color", hue);
  });

   $('a.btn').click(function() {
       // var community = $(this).attr('h3');
        //console.log("community name", community);
        $.post('http://localhost:8085/login', {community: 'community'}, function(data, status) {
            alert("Data:" + data);
        });
    });
});