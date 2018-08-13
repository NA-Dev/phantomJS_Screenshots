// Render Multiple URLs to file

"use strict";

var sites = [
    { title: 'Google', url: 'https://google.com' },
    { title: 'Yahoo', url: 'https://yahoo.com' }
];

// Setting user agent helps when viewport size is ignored on render
var userAgents = [
    { name: 'iPhone_X', string: 'Mozilla/5.0 (Mozilla/5.0 (iPhone; CPU iPhone OS 11_0 like Mac OS X) AppleWebKit/604.1.38 (KHTML, like Gecko) Version/11.0 Mobile/15A372 Safari/604.1' },
    { name: 'Chrome_Mobile', string: 'Mozilla/5.0 (Linux; Android 7.0; SM-G930V Build/NRD90M) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/59.0.3071.125 Mobile Safari/537.36' },
    { name: 'Chrome_Desktop', string: 'Mozilla/5.0 (Windows NT 6.1; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/47.0.2526.111 Safari/537.36' },
    { name: 'Safari_Desktop', string: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_11_2) AppleWebKit/601.3.9 (KHTML, like Gecko) Version/9.0.2 Safari/601.3.9' }
];

var viewports = [
    // in pixels
    { width: 320, height: 650, userAgent: userAgents[ 0 ] },
    { width: 320, height: 650, userAgent: userAgents[ 1 ] },
    { width: 1920, height: 800, userAgent: userAgents[ 2 ] },
    { width: 1920, height: 800, userAgent: userAgents[ 3 ] }
];

// This clips the saved image to size
// 0 - no clip, 1 - clip to viewport height
var clipping = 0;

// use '' for this script's directory
// use '/' for root directory
// use '/location/' for absolute path
// use 'location/' for path relative to script directory
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
        return sites[ urlIndex ].title + '_' +
            viewports[ viewportIndex ].userAgent.name + '_' +
            viewports[ viewportIndex ].width + 'x' +
            viewports[ viewportIndex ].height +
            ".png";
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
            url = site.url;
            console.log('Opening ' + url);
            page = webpage.create();
            page.viewportSize = viewports[ viewportIndex ];
            page.zoomFactor = 1;
            page.settings.userAgent = viewports[ viewportIndex ].userAgent.string;
            return page.open(url, function (status) {
                var file, width, height;
                width = viewports[ viewportIndex ].width;
                height = viewports[ viewportIndex ].height;
                file = getFilename();
                if ( status === "success" ) {
                    page.evaluate(function (w, h) {
                        // evaluated in rendered browser context
                        var backgroundColor = window.getComputedStyle(document.body, null)
                            .getPropertyValue('background-color');
                        if ( backgroundColor === 'rgba(0, 0, 0, 0)' ) {
                            document.body.style.backgroundColor = 'rgba(255, 255, 255, 1)';
                        }
                    }, width, height);
                    return window.setTimeout((function () {
                        if ( clipping ) {
                            page.clipRect = {
                                top: 0, left: 0,
                                width: width,
                                height: height
                            };
                        }
                        page.render(saveLocation + file);
                        return next(status, url, saveLocation + file);
                    }), 3000);
                } else {
                    return next(status, url, saveLocation + file);
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
        return console.log("Saved '" + url + "' at '" + file + "'");
    }
}), function () {
    return phantom.exit();
});