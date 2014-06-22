/*
    Title: Puush.me chrome extension
    Author: Kevin Heruer
    Website: http://puush.topkek.me/chrome
*/

chrome.runtime.onInstalled.addListener(function(details) {
    chrome.tabs.create({url: chrome.extension.getURL('html/firstrun.html')});
});

// Some static variables
var urlUp = "https://puush.me/api/up";
var urlDel = "https://puush.me/api/del";

// Create the right-click menu
chrome.contextMenus.create({title: "Puush", contexts:["image"], onclick: sendToPuush});

// onClick listener when there's a click on a non-button area,
// check the response code from puush.me and customise the
// actions on that.
// Case -1: Authentication error, clicking on notification
// will open a new tab to the settings page.
// Case -2: Connection error, clicking on notification only
// clears it.
// Case -3: Checksum error, again, do nothing.
// Case -4: Not enough storage, do nothing.
// Default: Everything went fine, clicking the notification
// will open the image in a new tab.
chrome.notifications.onClicked.addListener(function(notificationId){
    chrome.notifications.clear(notificationId, function(wasCleared){
        getImageData(function(e){
            switch(e.code) {
                case '-1':
                    chrome.tabs.create({url: chrome.extension.getURL('html/options.html')});
                break;

                case '-2':
                    // This fucking connection error cost
                    // me a lot of time, turns out the
                    // image wasn't sent correctly...
                break;

                case '-3':
                    // md5 checksum is wrong!
                break;

                case '-4':
                    // Not enough storage, should this open
                    // a new tab redirecting the user to
                    // their puush.me account?
                break;

                default:
                    chrome.tabs.create({url: e.imageUrl});
                break;
            }
        });
    });
});

// Create a notification onClick listener, there is only
// one button and that is the delete button.
// When clicked it will call the puush.me API to delete the
// image.
chrome.notifications.onButtonClicked.addListener(function(notificationId, buttonIndex){
    getUserData(function(user){
        getImageData(function(e){
            $.post(urlDel, {k: user.APIKEY, i: e.imageIndex, z: "poop"})
            .done(function(data) {
                // Deletes the image just uploaded.
            });
        });
        chrome.notifications.clear(notificationId, function(wasCleared){
            // Clears the notification.
        });
    });
});

// Function: send the image to puush.me, it makes a post
// to the API with the image URL. Then it fetches and
// saves the response for future use.
function sendToPuush(data)
{
    getUserData(function(user){
        var md5 = null;
        var image = data.srcUrl;
        var img = new Image;
        img.src = image;
        var canvas = document.createElement('canvas');
        var ctx = canvas.getContext('2d');
        canvas.width = img.width;
        canvas.height = img.height;
        ctx.drawImage(img, 0, 0);
        var dataUrl = canvas.toDataURL('image/png');
        var blob = dataUriToBlob(dataUrl);
        var canvas = null;

        var form = new FormData();
        var xhr = new XMLHttpRequest();
        xhr.open('POST', urlUp, true);
        xhr.onreadystatechange = function() {
            if (xhr.readyState == 4) {
                if (xhr.status == 200) {
                    var responseArray = xhr.responseText.split(",");
                    setImageData(responseArray[0], responseArray[1], responseArray[2]);
                    createNotification(xhr.responseText);
                } else {
                    var responseArray = xhr.responseText.split(",");
                    setImageData(responseArray[0], responseArray[1], responseArray[2]);
                    createNotification(xhr.responseText);
                }
            }
        };
        var md5 = hex_md5(blob);
        form.append('k', user.APIKEY);
        form.append('z', 'poop');
        form.append('c', md5);
        form.append('f', blob);
        xhr.send(form);
    });
}

// Function: create a notification, pretty straight forward.
// Based on the response codes it'll create the right content
// for the notification and if it needs a button or not.
function createNotification(data) {
    switch(data.substr(0,2)) {
        case '-1':
            var options = {
                type: 'basic',
                iconUrl: 'img/icon_128_background.png',
                title: 'Puu.sh',
                message: 'Authentication failure! Click here to go to the settings page.',
                priority: 0
            }
        break;
        case '-2':
            var options = {
                type: 'basic',
                iconUrl: 'img/icon_128_background.png',
                title: 'Puu.sh',
                message: 'Connection error',
                priority: 0
            }
        break;
        case '-3':
            var options = {
            type: 'basic',
                iconUrl: 'img/icon_128_background.png',
                title: 'Puu.sh',
                message: 'Checksum error!',
                priority: 0
            }
        break;
        case '-4':
            var options = {
                type: 'basic',
                iconUrl: 'img/icon_128_background.png',
                title: 'Puu.sh',
                message: 'Insufficient storage',
                priority: 0
            }
        break;
        default:
            var arr = data.split(",")
            copy(arr[1]);
            var options = {
                type: 'basic',
                iconUrl: 'img/icon_128_background.png',
                title: 'Puu.sh',
                message: 'Image uploaded successfully, click to view image',
                buttons: [{ title: 'Delete image', iconUrl: "img/delete_button.png"}],
                priority: 0
            }
        break;
    }
    chrome.notifications.create(
        'puushNotification', options, function(notificationId) {  }
    );
}

// Function: Save the response return code from puush.me.
function setImageData(code, url, index) {
    chrome.storage.local.set({'code': code, 'imageUrl': url, 'imageIndex': index}, function(callback){

    });
}

// Function: Obvious, get the data previously saved.
function getImageData(callback) {
    chrome.storage.local.get(['code', 'imageUrl', 'imageIndex'], callback);
}

// Function: Get the userdata.
function getUserData(callback) {
    chrome.storage.local.get(['APIKEY', 'email'], callback)
}

// Function: Create a textarea with id sandbox on the background
// page to fill it with the var and copy it to the clipboard.
function copy(str) {
    $('body').append("<textarea id=\"sandbox\"></textarea>");
    var sandbox = $('#sandbox').val(str).select();
    document.execCommand('copy');
    sandbox.val('');
    $('#sandbox').remove();
}

// Function: turn a data URI to a blob
// function dataUriToBlob(dataURI) {
//     // serialize the base64/URLEncoded data
//     var byteString;
//     if (dataURI.split(',')[0].indexOf('base64') >= 0) {
//         byteString = atob(dataURI.split(',')[1]);
//     }
//     else {
//         byteString = unescape(dataURI.split(',')[1]);
//     }

//     // parse the mime type
//     var mimeString = dataURI.split(',')[0].split(':')[1].split(';')[0]

//     // construct a Blob of the image data
//     var array = [];
//     for(var i = 0; i < byteString.length; i++) {
//         array.push(byteString.charCodeAt(i));
//     }
//     return new Blob(
//         [new Uint8Array(array)],
//         {type: mimeString}
//     );
// }

function dataUriToBlob(dataURI) {
    var binary = atob(dataURI.split(',')[1]);
    var array = [];
    for(var i = 0; i < binary.length; i++) {
        array.push(binary.charCodeAt(i));
    }
    return new Blob([new Uint8Array(array)], {type: 'image/png'});
}
