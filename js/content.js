'use strict';

// provide custom implementation of String.format()
String.prototype.format = function() {
    let s = this;
    let i = arguments.length;

    while (i--) {
        s = s.replace(new RegExp('\\{' + i + '\\}', 'gm'), arguments[i]);
    }
    return s;
};

function getRandom(limit) {
    return Math.floor(Math.random()*10) % limit;
}

function parseResponse(data) {
    // https://www.flickr.com/services/api/misc.urls.html
    let URLtemplate = "https://farm{0}.staticflickr.com/{1}/{2}_{3}_b.jpg";
    let TagTemplate = "https://www.flickr.com/photos/tags/{0}/";

	if (data.stat != 'ok') {
		showAlert(data, data.stat, data.message);
		return;
	}

	if (data.photos.photo.length == 0) {
		showAlert(data, "No photos found -- too strict criteria?", "");
		return;
	}

    let photo = data.photos.photo[getRandom(data.photos.photo.length)];

    let url = URLtemplate.format(photo.farm,
        photo.server,
        photo.id,
        photo.secret);

    let colors = ["badge-primary", "badge-success", "badge-info", "badge-warning", "badge-danger"];

    let tags = photo.tags.split(' ');
    tags.forEach(function(tag) {
        let link = $("<a>")
            
        link.attr('href', TagTemplate.format(tag));
        link.text('#' + tag);

        let badge = $("<span>");
        badge.addClass("badge");
        badge.addClass("badge-pill");
        badge.addClass(colors[getRandom(colors.length)]);
        badge.append(link);

        $("#badges").append(badge);
    });

    let desc = DOMPurify.sanitize(photo.description._content, {
        SAFE_FOR_JQUERY: true,
        ALLOWED_TAGS: ['a']
    });

    $("#description").html(desc);
    $("#title").text(photo.title);
    $("#author").text(photo.ownername);
    $("#source").attr('href', photo.url_o);

    $("#image").attr("src", url);
    $("#image").attr("alt", photo.title);
    $("#image").addClass("mx-auto");
    $("#image").addClass("d-block");

    $("#image").bind('load', function() {
        $("#loader-animation").delay(200).fadeOut(400, function() {
            $("#content").show().fadeIn(400);
        });
    });
}

function showAlert(req, status, ex) {
    let box = $('<div class="alert alert-danger" role="alert">');
    box.html(
        "Status: " + DOMPurify.sanitize(status, {SAFE_FOR_JQUERY: true}) + 
        "<br>" +
        "Exception: " + DOMPurify.sanitize(ex, {SAFE_FOR_JQUERY: true})
    );
    $("body").prepend(box);
}

$(function() {
	chrome.storage.local.get(
	{
		api_key: '',
		tags: 'cosmos,space',
		logic: 'all'
	},
		function(settings) {
			$.ajax({
				url: "https://api.flickr.com/services/rest/",
				data: { 
					api_key: settings.api_key,
					method: "flickr.photos.search",
					tags: settings.tags,
					tag_mode: settings.logic,
					privacy_filter: 1, // public photos only
					content_type: 1, // photos only
					media: "photos", // photos only
					per_page: 50,
					page: getRandom(100),
					extras: "description, date_taken, owner_name, geo, tags, url_o",
					format: "json",
					nojsoncallback: 1
				},
				dataType: "json",
				success: parseResponse,
				timeout: showAlert,
				fail: showAlert,
				error: showAlert
			});
		});
});

