var join = function(communityId) {
    $.ajax({
        method : 'GET',
        url: '/community/join/' + communityId,
        success: function(response) {
            window.location.reload();
        },
        error: function(err) {
        }
    });
};

var leave = function(communityId) {
    $.ajax({
        method : 'GET',
        url: '/community/leave/' + communityId,
        success: function(response) {
            window.location.reload();
        },
        error: function(err) {
        }
    });
};

var serializeJSON = function(form) {
    var a = $(form).serializeArray();
    var o = {};
    $.each(a, function() {
        if (o[this.name] !== undefined) {
            if (!o[this.name].push) {
                o[this.name] = [o[this.name]];
            }
            o[this.name].push(this.value || '');
        } else {
            o[this.name] = this.value || '';
        }
    });
    return o;
};

var fileUpload = function(file, callback) {
    var myFormData = new FormData();
    myFormData.append('file', file);

    $.ajax({
        method: 'POST',
        processData: false,
        contentType: false,
        url: '/api/communities/add-file',
        dataType : 'json',
        data: myFormData,
        success: function(response) {
            callback(response);
        },
        error: function(err) {
        }
    });
};

var unsetField = function(field) {
    var communityId = $('#communityId').val();

    $.ajax({
        method: 'POST',
        url: '/api/communities/unset-field',
        dataType : 'json',
        data: {
            id: communityId,
            field: field
        },
        success: function(response) {
            window.location.reload();
        },
        error: function(err) {
        }
    });
};

var deleteFile = function(URL, field) {
    var key = URL.split('images/')[1];
    var communityId = $('#communityId').val();

    $.ajax({
        method: 'POST',
        url: '/api/communities/delete-file',
        dataType : 'json',
        data: {
            id: communityId,
            key: key
        },
        success: function(response) {
            unsetField(field);
        },
        error: function(err) {
        }
    });
};

var saveIdsToLocalStorage = function() {
    var ids = [];
    var iso = $('.isotope > .row').data('isotope');
    if (iso && typeof(localStorage) !== undefined) {
        iso.filteredItems.forEach(function (item) {
            ids.push($(item.element).find('input.communityId').val());
        });
        localStorage['communities-order'] = JSON.stringify(ids);
    }
};

var initIsotope = function() {
    var qsRegex, buttonFilter;

    var $container = $('.isotope > .row');
    if (!$container.length) return;

    $container.imagesLoaded(function() {
        $container.isotope({
            itemSelector: '.community',
            layoutMode: 'masonry',
            getSortData: {
                interest: '[data-interest]',
                members: function(item) {
                    return parseInt($(item).data('members'));
                },
                alphabetical: 'h3'
            },
            filter: function() {
                var $this = $(this);
                var searchResult = qsRegex ? $this.text().match( qsRegex ) : true;
                var buttonResult = buttonFilter ? $this.is( buttonFilter ) : true;
                return searchResult && buttonResult;
            }
        });

        saveIdsToLocalStorage();

        var $quicksearch = $('#quicksearch').keyup(debounce(function() {
            qsRegex = new RegExp($quicksearch.val(), 'gi');
            $container.isotope();
            saveIdsToLocalStorage();
        }));

        // debounce so filtering doesn't happen every millisecond
        function debounce(fn, threshold) {
            var timeout;
            return function debounced() {
                if (timeout) {
                    clearTimeout(timeout);
                }
                function delayed() {
                    fn();
                    timeout = null;
                }
                setTimeout(delayed, threshold || 100);
            };
        }

        $('.filters').on('click', 'a', function() {
            buttonFilter = $(this).attr('data-filter');
            $container.isotope();
            saveIdsToLocalStorage();
        });

        $('.sorts').on('click', 'a', function() {
            var sortValue = $(this).attr('data-sort');
            sortValue = sortValue.split(',');
            $container.isotope({sortBy: sortValue, sortAscending: sortValue != 'members' });
            saveIdsToLocalStorage();
        });

        $('.filters').each(function(i, buttonGroup) {
            var $buttonGroup = $(buttonGroup);
            $buttonGroup.on('click', 'a', function () {
                $buttonGroup.find('.active').removeClass('active');
                $(this).addClass('active');
            });
        });

        $('.sorts').each(function(i, buttonGroup) {
            var $buttonGroup = $(buttonGroup);
            $buttonGroup.on('click', 'a', function() {
                $buttonGroup.find('.active').removeClass('active');
                $(this).addClass('active');
            });
        });
    });
};

$(document).ready(function() {
    initIsotope();
    $('#select-category').multiselect();

    $('#saveCommunity').on('click', function(e) {
        e.preventDefault();
        var communityJSON = serializeJSON('#editCommunity');
        var file1 = ($('#photoURL').length ? $('#photoURL').prop('files')[0] : '');
        var file2 = ($('#logoURL').length ? $('#logoURL').prop('files')[0] : '');
        var save = function() {
            $.ajax({
                method: 'POST',
                url: '/api/communities/save',
                data: {
                    communityJSON: communityJSON
                },
                success: function (response) {
                    if (response.success) {
                        window.location.href = '/';
                    }
                }
            });
        };

        if (file1) {
            fileUpload(file1, function(URL) {
                communityJSON.photoURL = URL;
                if (file2) {
                    fileUpload(file2, function(URL) {
                        communityJSON.logoURL = URL;
                        save();
                    });
                } else {
                    save();
                }
            });
        } else if (file2) {
            fileUpload(file2, function(URL) {
                communityJSON.logoURL = URL;
                save();
            });
        } else {
            save();
        }
    });

    $('#updateCommunity').on('click', function(e) {
        e.preventDefault();
        var communityJSON = serializeJSON('#editCommunity');
        var communityId = $('#communityId').val();
        var file1 = ($('#photoURL').length ? $('#photoURL').prop('files')[0] : '');
        var file2 = ($('#logoURL').length ? $('#logoURL').prop('files')[0] : '');
        var update = function() {
            $.ajax({
                method: 'POST',
                url: '/api/communities/update',
                data: {
                    id: communityId,
                    communityJSON: communityJSON
                },
                success: function (response) {
                    if (response.success) {
                        window.location.href = '/';
                    }
                }
            });
        };

        if (file1) {
            fileUpload(file1, function(URL) {
                communityJSON.photoURL = URL;
                if (file2) {
                    fileUpload(file2, function(URL) {
                        communityJSON.logoURL = URL;
                        update();
                    });
                } else {
                    update();
                }
            });
        } else if (file2) {
            fileUpload(file2, function(URL) {
                communityJSON.logoURL = URL;
                update();
            });
        } else {
            update();
        }
    });

    $('#submitComment').on('click', function(e) {
        e.preventDefault();
        var messageJSON = {
            _id: $('#communityId').val(),
            message: $('#message').val()
        };
        var communityId = $('#communityId').val();

        $.ajax({
            method: 'POST',
            url: '/api/communities/add-message',
            data: {
                id: communityId,
                messageJSON: messageJSON
            },
            success: function(response) {
                if (response.success) {
                    window.location.reload();
                }
            }
        });
    });

    $('#prev').on('click', function(e) {
        e.preventDefault();
        var communitiesOrder = JSON.parse(localStorage['communities-order']);
        var id = $('#communityId').val();
        var index = communitiesOrder.indexOf(id) > 0 ?  communitiesOrder.indexOf(id) - 1 : communitiesOrder.length - 1;
        window.location.href = '/communities/' + communitiesOrder[index];
    });

    $('#next').on('click', function(e) {
        e.preventDefault();
        var communitiesOrder = JSON.parse(localStorage['communities-order']);
        var id = $('#communityId').val();
        var index = communitiesOrder.indexOf(id) < communitiesOrder.length - 1 ?  communitiesOrder.indexOf(id) + 1 : 0;
        window.location.href = '/communities/' + communitiesOrder[index];
    });
});
