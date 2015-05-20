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
        document.cookie = 'communityId =' + $(this).attr('data-communityId') + ' ; path=/';

        $.ajax({
            url: URL,
            method: 'GET',
            dataType: 'json',
            success: function (data) {
                $(e.target).addClass('hidden').siblings().removeClass('hidden');
                if ($(e.target).hasClass('join')) {
                    $(e.target).parents('.item').find('.members').append('<img class="join" title="' + data.user.facebook.name + '" src="' + data.user.facebook.avatar + '">');
                    $(e.target).parents('.item').find('.members >  span').remove();
                } else {
                    $(e.target).parents('.item').find('.members').find('img[src ="' + data.user.facebook.avatar + '"]').remove();
                }
                $container.isotope('layout');
            },
            error: function (jqXHR, status) {
                console.log(jqXHR.status);
                if (jqXHR.status == 401) {
                    $('#myModal').modal('show');
                } else if (jqXHR.status == 500) {
                    alert(jqXHR.responseJSON.message);
                } else {
                    alert("Something fucked up");
                }
            }
        });
    });
});