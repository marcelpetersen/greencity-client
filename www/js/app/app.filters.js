/// <reference path="../../typings/tsd.d.ts" />
angular.module('greencity.app.filters', [])
    .filter('cleanUrl', function () {
    return function (url) {
        if (url) {
            return url.replace('www.', '').replace('https://', '').replace('http://', '');
        }
    };
});
