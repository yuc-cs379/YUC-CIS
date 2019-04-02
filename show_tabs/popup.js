// Copyright (c) 2011 The Chromium Authors. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.

// Show a list of all tabs in the same process as this one.
function init() {
    chrome.windows.getCurrent({
        populate: true
    }, function(currentWindow) {
        chrome.tabs.query({
            currentWindow: true,
            active: false
        }, function(tabs) {
            var outputDiv = document.getElementById("tab-list");
            var titleDiv = document.getElementById("title");
            titleDiv.innerHTML = "<b>Tabs in Process :</b>";
            displayTabInfo(tabs, outputDiv);
        });
    });
}


// Print a link to a given tab
function displayTabInfo(tabs, outputDiv) {
    tabs.forEach(tab => {
        if (tab.favIconUrl != undefined) {
            outputDiv.innerHTML += "<img src='chrome://favicon/" + tab.url + "'>\n";
        }
        outputDiv.innerHTML +=
            `
            <div class='link'>
                <b>
                    <a href='#'>${tab.title}</a>
                </b>

                </br>

                <i>${tab.url}</i>

                <br>
            </div>
        `
    })
}

setTimeout(function() {
    const links = document.getElementsByClassName("link");
    Array.from(links).forEach(function(element) {
            element.addEventListener('click', (event) => {
                console.log('clicked');
                document.targetElement = event
                document.execCommand("copy");
            });
    });

    window.addEventListener("copy", function(event) {
        event.preventDefault();
        event.clipboardData.setData("text/plain", document.targetElement.target.parentElement.parentElement.children[2].textContent);
        console.log(document.targetElement.target.parentElement.parentElement.children[2].textContent)
        document.targetElement = null
    });
}, 200);


// Kick things off.
document.addEventListener('DOMContentLoaded', init);
