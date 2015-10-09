var join = function(communityId) {
    $.ajax({
        method : 'GET',
        url: '/community/join/' + communityId,
        success: function(response) {
            setTimeout(function(){
                window.location.reload();
            }, 2000);
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
            setTimeout(function(){
                window.location.reload();
            }, 2000);
        },
        error: function(err) {
        }
    });
};

var edit = function(communityId) {
    window.location.href = '/communities/edit/' + communityId;
};

var deleteMessage = function(messageId) {
    var communityId = $('#communityId').val();

    $.ajax({
        method: 'POST',
        url: '/api/communities/delete-message',
        data: {
            communityId: communityId,
            messageId: messageId
        },
        success: function(response) {
            if (response.success) {
                window.location.reload();
            }
        }
    });
};

var getLatestMessages = function() {
    $.ajax({
        method: 'GET',
        url: '/api/user/latestMessages',
        dataType : 'json',
        success: function(messages) {
            var index = 0,
                timeFadeIn = 1000,
                timeFadeOut = 1000,
                timeToNextMessage = 5000;
            var nextMessage = function() {
                if (index === messages.length) index = 0;
                var msg = (messages[index].message.length > 80 ? messages[index].message.substring(0, 80) + '...' : messages[index].message);
                var html = '<div class="messages"><span>' + messages[index].communityTitle + '</span>' +
                    '<div class="inline" onclick="window.location.href=\'/communities/' +
                    messages[index].communityId + '\'">' + msg + '</div>' +
                    '</div>';

                $('.messages-container > .messages').fadeOut(timeFadeOut, function() {
                    this.remove();
                    $(html).hide().appendTo('.messages-container').fadeIn(timeFadeIn, function() {
                        index++;
                        setTimeout(function () {
                            nextMessage();
                        }, timeToNextMessage);
                    });
                });
            };

            var msg = (messages[index].message.length > 80 ? messages[index].message.substring(0, 80) + '...' : messages[index].message);
            var html = '<div class="messages-container">Ultimele mesaje:' +
                '<div class="messages"><span>' + messages[index].communityTitle + '</span>' +
                '<div class="inline" onclick="window.location.href=\'/communities/' +
                messages[index].communityId + '\'">' + msg + '</div>' +
                '</div>' +
                '</div>';
            $(html).hide().appendTo('#latest-messages').fadeIn(timeFadeIn, function() {
                index++;
                setTimeout(function () {
                    nextMessage();
                }, timeToNextMessage);
            });
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

var sendEmail = function(emailJSON, template, callback) {
    $.ajax({
        method: 'POST',
        url: '/send-email',
        dataType : 'json',
        data: {
            emailJSON: emailJSON,
            template: template
        },
        success: function(response) {
            if (callback) callback();
        },
        error: function(err) {
        }
    });
};

var getCommunity = function(id, callback) {
    $.ajax({
        method: 'GET',
        url: '/api/communities/findById',
        dataType : 'json',
        data: {
            id: id
        },
        success: function(response) {
            if (callback) callback(response);
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
            var visibleItemsCount = $('.isotope > .row').data('isotope').filteredItems.length;
            if (visibleItemsCount) {
                $('.no-results').hide();
            } else {
                $('.no-results').show();
            }
            saveIdsToLocalStorage();
        }));

        if ($container.data('isotope').filteredItems.length) {
            $('.no-results').hide();
        } else {
            $('.no-results').show();
        }

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

    if ($('#latest-messages').length) getLatestMessages();

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
                        var community = response.community;
                        var emailJSON = {
                            to: 'petrica_horlescu@yahoo.com',
                            subject: 'New community',
                            content: 'Title: ' + community.title + ', Id: ' + community._id
                        };
                        sendEmail(emailJSON, 'start_community_email', function() {
                            $('.modal').modal('show');
                            $('.modal').on('hidden.bs.modal', function(e) {
                                window.location.href = '/';
                            });
                        });
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
                    getCommunity(communityId, function(result) {
                        if (!result.success) return;
                        var community = result.community,
                            to = [];
                        community.leaders.forEach(function(leader) {
                            if (leader.email) to.push(leader.email);
                        });
                        community.members.forEach(function(member) {
                            if (member.email) to.push(member.email);
                        });
                        var emailJSON = {
                            to: to,
                            subject: 'Mesaj nou | Comunitatea: ' + community.title,
                            title: community.title,
                            message: messageJSON.message
                        };
                        sendEmail(emailJSON, 'post_message_email');
                        window.location.reload();
                    });
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

    $('.community-counter.expand').on('click', function(e) {
        e.preventDefault();
        var lis = $(e.target).parents('ul').find('li');
        $(lis).each(function(i, li) {
            $(li).show();
        });
        $(e.target).parent().hide();
    });

    var link = $("meta[property='og:url']").attr('content');
    var title = $("meta[property='og:title']").attr('content');
    var media =  $("meta[property='og:image']").attr('content');

    $(".share-links").hideshare({
        link: link,
        title: title,
        media: media,
        twitter: true,
        linkedin: false ,
        pinterest: false,
        googleplus: false
    });

    $("button.join").on('click', function() {
        $('.support').modal('show');
        $('.support').on('show.bs.modal', function(e) {

        });
    });

    $("button.leave").on('click', function() {
        $('.resume').modal('show');
        $('.resume').on('hide.bs.modal', function(e) {
        });
    });
});
