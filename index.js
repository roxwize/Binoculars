// ==UserScript==
// @name         Binoculars
// @namespace    https://theki.club/
// @version      1.0.1
// @description  Paste a list of the online users in a neatly-formatted way.
// @author       Theki / Hoylecake
// @match        https://twocansandstring.com/forum/sandbox/3382/reply
// @icon         https://www.google.com/s2/favicons?sz=64&domain=twocansandstring.com
// @license      GNU GPLv3
// @grant        none
// ==/UserScript==

const buttonDiv = document.querySelector("#content_host > form > div[style]");
const textBox = document.getElementById("post_textbox");
let str = "";

const config = {
    disableMarkov: true
};

(async function () {
    'use strict';

    createButton("#7323c4", "#5023cc", "Paste users", () => {
        getUsers().then(value => {
            textBox.value += generateList(value);
        });
    });
})();

function createButton(gradientStart, gradientEnd, text, callbackFn) {
    const btn = document.createElement("button");
    btn.innerHTML = text;
    btn.type = "button";
    btn.style.background = `linear-gradient(${gradientStart}, ${gradientEnd})`;
    btn.addEventListener('click', callbackFn);
    buttonDiv.prepend(btn);
}

function generateList(html) {
    str = "";
    //getUsers(); does this make an unnecessary request?
    let userLinks = Array.from(html.querySelectorAll("#forum_main_usersonline a"));
    userLinks = userLinks.filter(userLink => {
        // filter out Markov if we should hide him
        if (config.disableMarkov && userLink.textContent == "Markov") {
            return false;
        }
        return true;
    });

    userLinks.forEach((element, index) => {
        const lin = userLinks.length;
        str += `<b><link url="//twocansandstring.com/users/${element.textContent.replace(/\W|_/ig, "")}">${element.textContent}</link></b>${index == lin - 2 ? ', and ' : (index == lin - 1 ? '' : ', ')}`;
    });

    return str;
}

function makeRequest(method, url) {
    return new Promise(function (resolve, reject) {
        let xhr = new XMLHttpRequest();
        xhr.responseType = "document";
        xhr.open(method, url);
        xhr.onload = function () {
            if (this.status >= 200 && this.status < 300) {
                resolve(xhr.response);
            } else {
                reject({
                    status: this.status,
                    statusText: xhr.statusText
                });
            }
        };
        xhr.onerror = function () {
            reject({
                status: this.status,
                statusText: xhr.statusText
            });
        };
        xhr.send();
    });
} // THX STACK OVERFLOW

async function getUsers() {
    const response = await makeRequest("GET", "https://twocansandstring.com/forum");
    return response;
}
