/// <reference path="../../typings/tsd.d.ts" />
angular.module('your_app_name.app.filters', [])
    .filter('cleanUrl', function () {
    return function (url) {
        if (url) {
            return url.replace('www.', '').replace('https://', '').replace('http://', '');
        }
    };
});
