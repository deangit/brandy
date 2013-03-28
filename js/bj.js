/**
* Basic JavaScript Helpers
* bj.js 20130130 dchiang 20130201
*/
function $(id) {
    return document.getElementById(id);
}
//--Attach event handler to UI
function addEventHandler(target, evtype, listener) {
    if (window.attachEvent) {
        target.attachEvent("on" + evtype, listener); // can return boolean
    } else {
        target.addEventListener(evtype, listener, false); // returns void
    }
}
function addkid(id, obj) { $(id).appendChild(obj); }
//--Browser window visible area dimension
//=OK for ALL browsers ***BUT body/window/page has to have loaded already
function clientHeightWidth() {
    if (window.attachEvent) { // for IE
        return [document.body.clientHeight, document.body.clientWidth];
    } else {
        return [window.innerHeight, window.innerWidth];
    }
}
function getTarget(ev) {
    if (window.event) {
        return window.event.srcElement;
    } else if (ev.target) {
        return ev.target;
    }
}
/*
* --- Dynamic Script Tag Hack (DSTH) to call remote scripts in runtime, 
* to query REST service and GET back http data, domain unrestricted.
* Append new script element to head section or re-use existing tag.
* @param {String} urid: unique tag/elem id
* @param {String} url: full URL to REST resource including all params,
*   like format (f=json), token, and callback to handle reponse.
*/
function jsTag(urid, url) {
    if ($(urid + "-script") == undefined) {
        var script = document.createElement("script");
        script.type = "text/javascript";
        script.id = urid + "-script";
        script.src = url;
        document.getElementsByTagName("head")[0].appendChild(script);
    } else {
        var script = $(urid + "-script");
        script.src = url;
        //TODO: DOES THIS EXECUTE?
    }
}
function hidden(id) {
    if ($(id).style.display == "none") {
        return true;
    } else {
        return false;
    }
}
function hide(id) { $(id).style.display = "none"; }
function release(obj, t) {
    if (t == undefined) {t=15000}
    setTimeout("delete " + obj, t);
}
function show(id) { $(id).style.display = ""; }
function targetId(e) {
    if (window.event) {
        return window.event.srcElement.id;
    } else {
        return e.target.id;
    }
}
function toggle(id) {
    $(id).style.display = ($(id).style.display != "none" ? "none" : "");
}
//--Trim white spaces --REF=http://www.somacon.com/p355.php
function trim(stringToTrim) {
    return stringToTrim.replace(/^\s+|\s+$/g, "");
}

function arrayRemoveItem(arr, item) {
	arr.splice(arr.indexOf(item), 1);
}
