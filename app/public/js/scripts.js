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

    $('.actions > .btn').on('click', function (e) {
        e.preventDefault();
        var URL = $(this).attr('href');
        var communityId = $(this).attr('data-communityId');
        console.log(communityId);
        var URL_FB = '/auth/facebook';
        var URL_TW = '/auth/twitter';

        document.cookie = 'communityId = communityId; path=/';

        $( "#dialog-confirm").dialog({
            resizable: false,
            height: 400,
            modal: true,
            buttons: {
                "Facebook Login": function () {
                    location.href = URL_FB;
                },
                "Twitter Login": function () {
                    location.href = URL_TW;
                },
                "Cancel": function () {
                    $( this ).dialog( "close" );
                }
            }
        });
    });
});