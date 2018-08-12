// Render Multiple URLs to file

"use strict";

var sites = [
    { title: 'Ameronix', url: 'https://ameronix.com' },
    { title: 'OccasionGenius', url: 'https://occasiongenius.com' },
    { title: 'Leprix', url: 'https://leprix.com' },
    { title: 'Bagboy', url: 'https://bagboycompany.com/' },
    { title: 'MCLA', url: 'http://mcla.us/' },
    { title: 'CUKUSA', url: 'https://cukusa.com/' },
    { title: 'Ameronix', url: 'https://ticketstobuy.com/' },
    { title: 'Datrek', url: 'https://datrek.com/' },
    { title: 'ElementsBeauty', url: 'https://elementsbeautyshop.com/' },
    { title: 'BuildABasket', url: 'https://buildabasket.com/' },
    { title: 'USASSC', url: 'http://usa-ssc.com/' },
    { title: 'Devant', url: 'https://devantsporttowels.com/' },
    { title: 'STSS', url: 'http://www.gostss.com/' },
    { title: 'GiftBasketExperts', url: 'https://giftbasketexperts.com/' },
    { title: 'CaturraOnGrove', url: 'http://caturraongrove.com/' }
];

var viewports = [
    // in pixels
    { width: 1920, height: 800 },
    { width: 320, height: 650 }
];

// use '/' for this script's directory
// use '/location' for absolute path
// use 'location' for path relative to script directory
var saveLocation = 'screenshots/';

var RenderUrlsToFile, system;

system = require("system");

/*
Render given urls
@param array of URLs to render
@param callbackPerUrl Function called after finishing each URL, including the last URL
@param callbackFinal Function called after finishing everything
*/
RenderUrlsToFile = function (sites, viewports, callbackPerUrl, callbackFinal) {
    console.log('Starting');
    var getFilename, next, page, retrieve, urlIndex, viewportIndex, webpage, site, url;
    urlIndex = 0;
    viewportIndex = 0;
    webpage = require("webpage");
    page = null;
    getFilename = function () {
        return sites[urlIndex]['title'] + '_' + viewports[viewportIndex]['width'] + 'x' + viewports[ viewportIndex ][ 'height'] + ".png";
    };
    next = function (status, url, file) {
        page.close();
        callbackPerUrl(status, url, file);
        if ( viewportIndex < viewports.length-1 ) {
            viewportIndex++;
        } else {
            viewportIndex = 0;
            urlIndex++;
        }
        return retrieve();
    };
    retrieve = function () {
        if ( urlIndex < sites.length ) {
            site = sites[urlIndex];
            url = site[ 'url' ];
            console.log(url);
            page = webpage.create();
            page.viewportSize = viewports[viewportIndex];
            page.settings.userAgent = "Phantom.js screenshot bot";
            return page.open(url, function (status) {
                var file;
                file = getFilename();
                if ( status === "success" ) {
                    return window.setTimeout((function () {
                        page.render(saveLocation + file);
                        return next(status, url, file);
                    }), 200);
                } else {
                    return next(status, url, file);
                }
            });
        } else {
            return callbackFinal();
        }
    };
    return retrieve();
};

RenderUrlsToFile(sites, viewports, (function (status, url, file) {
    if ( status !== "success" ) {
        return console.log("Unable to render '" + url + "'");
    } else {
        return console.log("Rendered '" + url + "' at '" + file + "'");
    }
}), function () {
    return phantom.exit();
});