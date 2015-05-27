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

    $('#myModal').modal({ show: false});

    $('#login').on('click', function () {
        $('#myModal').modal('show');
    });

    $('#logout').on('click', function () {
       document.cookie = 'communityId=;';
       document.cookie = 'userMethod=;';
    });

    $('.actions > .btn').on('click', function (e) {
        e.preventDefault();
        var URL = $(this).attr('href');
        var communityId = $(this).attr('data-communityId');
        if ($(e.target).hasClass('join')) {
            document.cookie = 'userMethod = join';
            document.cookie = 'communityId =' + $(this).attr('data-communityId') + '; path =/';
        } else if ($(e.target).hasClass('leave')) {
            document.cookie = 'userMethod = leave';
            document.cookie = 'communityId =' + $(this).attr('data-communityId') + '; path =/';
        }

        $.ajax({
            url: URL,
            method: 'GET',
            dataType: 'json',
            success: function (data) {
                $(e.target).addClass('hidden').siblings().removeClass('hidden');
                if ($(e.target).hasClass('join')) {
                    $(e.target).parents('.item').find('.members').append('<a target="_blank" href= "' + data.user.profileUrl + '"><img class="join" title="' + data.user.name + '" src="' + data.user.avatar + '" data-id = "' + data.user._id + '"><\/a>');
                    $(e.target).parents('.item').find('.members >  span').remove();
                } else {
                    $(e.target).parents('.item').find('.members').find('img[data-id ="' + data.user._id + '"]').remove();
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
                    alert("Something didn't work! :(");
                }
            }
        });
    });
});