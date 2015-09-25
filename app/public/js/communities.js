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
