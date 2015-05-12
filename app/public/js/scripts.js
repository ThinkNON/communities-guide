$(function () {

    var $container = $('.isotope > .row').imagesLoaded(function () {
        $container.isotope({
            itemSelector: '.item',
            layoutMode: 'masonry',
            getSortData: {
                interest: '[data-interest]',
                alpha: 'h3'
            }
        });

        $('.filters').on('click', 'button', function () {
            var filterValue = $(this).attr('data-filter');
            $container.isotope({ filter: filterValue });
        });

        $('.sorts').on('click', 'button', function () {
            var sortValue = $(this).attr('data-sort');
            sortValue = sortValue.split(',');
            $container.isotope({ sortBy: sortValue });
        });

        $('.filters, .sorts').each(function (i, buttonGroup) {
            var $buttonGroup = $(buttonGroup);
            $buttonGroup.on('click', 'button', function () {
                $buttonGroup.find('.active').removeClass('active');
                $(this).addClass('active');
            });
        });

    });

    $('.item').each(function () {
        var hue = 'rgb(' + (Math.floor((256 - 199) * Math.random()) + 200) + ',' + (Math.floor((256 - 199) * Math.random()) + 200) + ',' + (Math.floor((256 - 199) * Math.random()) + 200) + ')';
        $(this).css("background-color", hue);
    });

    $('#myModal').modal({ show: false});
    $('.actions > .btn').on('click', function (e) {
        e.preventDefault();
        var URL = $(this).attr('href');
        var communityId = $(this).attr('data-communityId');
        document.cookie = 'communityId =' + communityId + ' ; path=/';

        $.get(URL, function (data) {
           if (data.status === 300) {
               $('#myModal').modal('show');
           } else if (data.status === 200) {
                $(e.target).hide();
           }
        });
    });
});