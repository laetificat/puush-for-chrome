getUserData(function(e) {
    var string = objToString(e);
    var arr = string.split("\n");
    $("ul").append("<li>Email/Username: " + arr[1] + "</li>");
    $("ul").append("<li>Api key: " + arr[0] + "</li>");
console.log(arr[1]);
    if(arr[1] = "undefined") {
        $("#authordeauth").append("<button id=\"auth\">Authorize</button>");
    }
    else {
        $("#authordeauth").append("<button id=\"deauth\">Deauthorize</button>");
    }

    $("#deauth").click(function() {
        alert("hello?");
        chrome.storage.local.clear(function(callback) {
            $("button").insertAfter("Deauthorized successfully, this app can no longer upload images.<br/>Log in to use this app again.");
        });
    });

    $("#auth").click(function() {
        chrome.tabs.create({url: chrome.extension.getURL('html/firstrun.html')});
    });
});

function getUserData(callback) {
    chrome.storage.local.get(['APIKEY', 'email'], callback);
}

function objToString (obj) {
    var str = '';
    for (var p in obj) {
        if (obj.hasOwnProperty(p)) {
            str += obj[p] + '\n';
        }
    }
    return str;
}


