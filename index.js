// ==UserScript==
// @name         Binoculars
// @namespace    https://theki.club/
// @version      1.1
// @description  Paste a list of the online users in a neatly-formatted way.
// @author       Theki / Hoylecake
// @match        https://twocansandstring.com/forum/sandbox/3382/reply
// @icon         https://www.google.com/s2/favicons?sz=64&domain=twocansandstring.com
// @license      GNU GPLv3
// @grant        none
// ==/UserScript==

const buttonDiv = document.querySelector("#content_host > form > div[style]");
const lowerDiv = document.querySelector("#content_host > div"); // This is the area below the textarea
const textBox = document.getElementById("post_textbox");
let str = "";

const config = {
    disableMarkov: {
        desc: "Exclude Markov",
        default: true,
        value: true
    }
};

(async function () {
    'use strict';

    createTable("Binoculars configuration",config);
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
function createTable(title,tableContent) {
    const container = document.createElement("div");
    container.innerHTML = `<h3>${title}</h3>`;
    const table = document.createElement("table");
    table.style = "font-size:9pt; width:50%";
    table.cellPadding = 8;
    const tbody = document.createElement("tbody");
    for (let [key,value] of Object.entries(tableContent)) {
        const tr = document.createElement("tr");
        tr.innerHTML = `<td>${value.desc}</td>`
        const inp = document.createElement("input");
        switch (typeof value.default) {
            case "boolean":
                inp.type = "checkbox";
                inp.checked = value.default;
                break;
            // Add more type considerations as you add more configuration options
        }
        inp.addEventListener("change",() => {
            value.value = inp.checked;
        });
        tr.appendChild(inp);
        tbody.appendChild(tr);
    }
    table.appendChild(tbody);
    container.appendChild(table);
    lowerDiv.prepend(container);
}

function generateList(html) {
    str = "";
    let userLinks = Array.from(html.querySelectorAll("#forum_main_usersonline a"));
    userLinks = userLinks.filter(userLink => {
        // filter out Markov if we should hide him
        if (config.disableMarkov.value && userLink.textContent == "Markov") {
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
