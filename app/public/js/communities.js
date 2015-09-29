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

    $.ajax({
        method: 'POST',
        url: '/api/communities/delete-file',
        dataType : 'json',
        data: {key: key},
        success: function(response) {
            unsetField(field);
        },
        error: function(err) {
        }
    });
};

$(document).ready(function() {

    $('#saveCommunity').on('click', function(e) {
        e.preventDefault();
        var communityJSON = serializeJSON('#editCommunity');
        var file1 = ($('#photoURL').length ? $('#photoURL').prop('files')[0] : '');
        var file2 = ($('#logoURL').length ? $('#logoURL').prop('files')[0] : '');
        var save = function() {
            $.ajax({
                method: 'POST',
                url: '/api/communities/save',
                data: {'communityJSON': communityJSON},
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
        var file1 = ($('#photoURL').length ? $('#photoURL').prop('files')[0] : '');
        var file2 = ($('#logoURL').length ? $('#logoURL').prop('files')[0] : '');
        var update = function() {
            $.ajax({
                method: 'POST',
                url: '/api/communities/update',
                data: {'communityJSON': communityJSON},
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
});
