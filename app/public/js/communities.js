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

$(document).ready(function() {

    $('#saveCommunity').on('click', function(e) {
        e.preventDefault();
        var communityJSON = serializeJSON('#editCommunity');
        $.ajax({
            method : 'POST',
            url: '/api/communities/save',
            data: {'communityJSON': communityJSON},
            success: function(response) {
                if (response.success) {
                    window.location.href = '/';
                }
            }
        });
    });

    $('#updateCommunity').on('click', function(e) {
        e.preventDefault();
        var communityJSON = serializeJSON('#editCommunity');
        $.ajax({
            method : 'POST',
            url: '/api/communities/update',
            data: {'communityJSON': communityJSON},
            success: function(response) {
                if (response.success) {
                    window.location.href = '/';
                }
            }
        });
    });
});
