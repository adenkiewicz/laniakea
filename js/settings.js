function save_settings() {
    chrome.storage.local.set(
        { 
            api_key: $("#api_key").val(),
            tags: $("#tags").val(),
            logic: $("input[name=logic]:checked").val()
        },
        function() {
            $("#status").fadeIn(300);
            setTimeout(function() {
                $("#status").fadeOut(300);
            }, 1500);
        });
}

function load_settings() {
    chrome.storage.local.get(
        {
            api_key: '',
            tags: 'cosmos,space',
            logic: 'all'
        },
        function(settings) {
            $("#api_key").val(settings.api_key);
            $("#tags").val(settings.tags);
            $("input[name=logic]").filter('[value="' + settings.logic + '"]').attr('checked', true);
        });
}

$(document).ready(function() {
    $("#save").click(function() {
        save_settings(); return false; 
    });

    load_settings();
});
