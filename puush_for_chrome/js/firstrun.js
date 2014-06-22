$("#submit").click(function() {
    var username = $("#username").val();
    var password = $("#password").val();

    $(".error").remove();
    $(".loginText").append("<div id=\"ajaxLoader\"><br/><img src=\"../img/ajax-loader.gif\" alt=\"Ajax Loader\"></div>");
    $(".loginForm").css("margin-top", "57px");
    $.post("https://puush.me/api/auth", {e: username, p: password, z: "poop"})
    .done(function(data) {
        var arr = data.split(",");
        var apikey = arr[1];
        if(arr[0] == '-1') {
            $("#ajaxLoader").remove();
            $(".loginText").append("<h5 class=\"error\">Authentication failure, try again.</h5>");
            $(".loginForm").css("margin-top", "62px");
        } else {
            setSettingsData(apikey, username);
        }

    });
});

function setSettingsData(apikey, username) {
    chrome.storage.local.set({'APIKEY': apikey, 'email': username}, function(callback){
        chrome.tabs.getCurrent(function(tab) {
            chrome.tabs.remove(tab.id);
        });
    });
}

