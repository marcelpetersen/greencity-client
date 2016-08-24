/// <reference path="../../typings/tsd.d.ts" />
var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var ApiService = (function () {
    function ApiService($http, $q) {
        this.$q = $q;
        this.$http = $http;
    }
    return ApiService;
}());
var AuthService = (function (_super) {
    __extends(AuthService, _super);
    function AuthService($http, $q) {
        _super.call(this, $http, $q);
    }
    //Just for example purposes user with id=0 will represent our logged user
    AuthService.prototype.getLoggedUser = function () {
        var dfd = this.$q.defer();
        this.$http.get('database.json').success(function (database) {
            var user = _.find(database.users, function (user) {
                return user.id == 0;
            });
            dfd.resolve(user);
        });
        return dfd.promise;
    };
    ;
    return AuthService;
}(ApiService));
var ProfileService = (function (_super) {
    __extends(ProfileService, _super);
    function ProfileService($http, $q) {
        _super.call(this, $http, $q);
    }
    ProfileService.prototype.getUserData = function (userId) {
        var dfd = this.$q.defer();
        this.$http.get('database.json').success(function (database) {
            var user = _.find(database.users, function (user) { return user.id == userId; });
            dfd.resolve(user);
        });
        return dfd.promise;
    };
    ;
    ProfileService.prototype.getUserFollowers = function (userId) {
        var dfd = this.$q.defer();
        this.$http.get('database.json').success(function (database) {
            var followers_data = _.filter(database.following, function (follow) { return follow.followsId == userId; });
            //remove possible duplicates
            var followers_userId = _.uniq(_.pluck(followers_data, 'userId'));
            var followers = _.map(followers_userId, function (followerId) {
                return {
                    userId: followerId,
                    userData: _.find(database.users, function (user) { return user.id == followerId; }),
                    follow_back: !_.isUndefined(_.find(database.following, function (user) { return (user.userId === userId && user.followsId === followerId); }))
                };
            });
            dfd.resolve(followers);
        });
        return dfd.promise;
    };
    ;
    ProfileService.prototype.getUserFollowing = function (userId) {
        var dfd = this.$q.defer();
        this.$http.get('database.json').success(function (database) {
            var following_data = _.filter(database.following, function (follow) { return follow.userId == userId; });
            //remove possible duplicates
            var following_userId = _.uniq(_.pluck(following_data, 'followsId'));
            var following = _.map(following_userId, function (followingId) {
                return {
                    userId: followingId,
                    userData: _.find(database.users, function (user) { return user.id == followingId; })
                };
            });
            dfd.resolve(following);
        });
        return dfd.promise;
    };
    ;
    ProfileService.prototype.getUserPictures = function (userId) {
        var dfd = this.$q.defer();
        this.$http.get('database.json').success(function (database) {
            //get user related pictures
            var user_pictures = _.filter(database.users_pictures, function (picture) {
                return picture.userId == userId;
            });
            dfd.resolve(user_pictures);
        });
        return dfd.promise;
    };
    ;
    ProfileService.prototype.getUserPosts = function (userId) {
        var dfd = this.$q.defer();
        this.$http.get('database.json').success(function (database) {
            //get user related pictures
            var user_post = _.filter(database.posts, function (post) {
                return post.userId == userId;
            });
            dfd.resolve(user_post);
        });
        return dfd.promise;
    };
    ;
    return ProfileService;
}(ApiService));
var FeedService = (function (_super) {
    __extends(FeedService, _super);
    function FeedService($http, $q) {
        _super.call(this, $http, $q);
    }
    FeedService.prototype.getFeed = function (page) {
        var pageSize = 5, // set your page size, which is number of records per page
        skip = pageSize * (page - 1), totalPosts = 1, totalPages = 1, dfd = this.$q.defer();
        this.$http.get('database.json').success(function (database) {
            totalPosts = database.posts.length;
            totalPages = totalPosts / pageSize;
            var sortedPosts = _.sortBy(database.posts, function (post) { return new Date(post.date); });
            var postsToShow = sortedPosts.slice(skip, skip + pageSize);
            //add user data to posts
            var posts = _.each(postsToShow.reverse(), function (post) {
                post.user = _.find(database.users, function (user) { return user.id == post.userId; });
                return post;
            });
            dfd.resolve({
                posts: posts,
                totalPages: totalPages
            });
        });
        return dfd.promise;
    };
    ;
    FeedService.prototype.getFeedByCategory = function (page, categoryId) {
        var pageSize = 5, // set your page size, which is number of records per page
        skip = pageSize * (page - 1), totalPosts = 1, totalPages = 1, dfd = this.$q.defer();
        this.$http.get('database.json').success(function (database) {
            totalPosts = database.posts.length;
            totalPages = totalPosts / pageSize;
            var sortedPosts = _.sortBy(database.posts, function (post) {
                return new Date(post.date);
            });
            if (categoryId) {
                sortedPosts = _.filter(sortedPosts, function (post) {
                    return post.category.id == categoryId;
                });
            }
            var postsToShow = sortedPosts.slice(skip, skip + pageSize);
            //add user data to posts
            var posts = _.each(postsToShow.reverse(), function (post) {
                post.user = _.find(database.users, function (user) { return user.id == post.userId; });
                return post;
            });
            dfd.resolve({
                posts: posts,
                totalPages: totalPages
            });
        });
        return dfd.promise;
    };
    ;
    FeedService.prototype.getFeedByTrend = function (page, trendId) {
        var pageSize = 5, // set your page size, which is number of records per page
        skip = pageSize * (page - 1), totalPosts = 1, totalPages = 1, dfd = this.$q.defer();
        this.$http.get('database.json').success(function (database) {
            totalPosts = database.posts.length;
            totalPages = totalPosts / pageSize;
            var sortedPosts = _.sortBy(database.posts, function (post) { return new Date(post.date); });
            if (trendId) {
                sortedPosts = _.filter(sortedPosts, function (post) { return post.trend.id == trendId; });
            }
            var postsToShow = sortedPosts.slice(skip, skip + pageSize);
            //add user data to posts
            var posts = _.each(postsToShow.reverse(), function (post) {
                post.user = _.find(database.users, function (user) { return user.id == post.userId; });
                return post;
            });
            dfd.resolve({
                posts: posts,
                totalPages: totalPages
            });
        });
        return dfd.promise;
    };
    ;
    FeedService.prototype.getPostComments = function (post) {
        var dfd = this.$q.defer();
        this.$http.get('database.json').success(function (database) {
            var comments_users = database.users;
            // Randomize comments users array
            comments_users = window.knuthShuffle(comments_users.slice(0, post.comments));
            var comments_list = [];
            // Append comment text to comments list
            comments_list = _.map(comments_users, function (user) {
                var comment = {
                    user: user,
                    text: database.comments[Math.floor(Math.random() * database.comments.length)].comment
                };
                return comment;
            });
            dfd.resolve(comments_list);
        });
        return dfd.promise;
    };
    ;
    FeedService.prototype.getPost = function (postId) {
        var dfd = this.$q.defer();
        this.$http.get('database.json').success(function (database) {
            var post = _.find(database.posts, function (post) {
                return post.id == postId;
            });
            post.user = _.find(database.users, function (user) { return user.id == post.userId; });
            dfd.resolve(post);
        });
        return dfd.promise;
    };
    ;
    return FeedService;
}(ApiService));
var PeopleService = (function (_super) {
    __extends(PeopleService, _super);
    function PeopleService($http, $q) {
        _super.call(this, $http, $q);
    }
    PeopleService.prototype.getPeopleSuggestions = function () {
        var dfd = this.$q.defer();
        this.$http.get('database.json').success(function (database) {
            var people_suggestions = _.each(database.people_suggestions, function (suggestion) {
                suggestion.user = _.find(database.users, function (user) { return user.id == suggestion.userId; });
                //get user related pictures
                var user_pictures = _.filter(database.users_pictures, function (picture) {
                    return picture.userId == suggestion.userId;
                });
                suggestion.user.pictures = _.last(user_pictures, 3);
                return suggestion;
            });
            dfd.resolve(people_suggestions);
        });
        return dfd.promise;
    };
    ;
    PeopleService.prototype.getPeopleYouMayKnow = function () {
        var dfd = this.$q.defer();
        this.$http.get('database.json').success(function (database) {
            var people_you_may_know = _.each(database.people_you_may_know, function (person) {
                person.user = _.find(database.users, function (user) { return user.id == person.userId; });
                return person;
            });
            dfd.resolve(people_you_may_know);
        });
        return dfd.promise;
    };
    ;
    return PeopleService;
}(ApiService));
var TrendsService = (function (_super) {
    __extends(TrendsService, _super);
    function TrendsService($http, $q) {
        _super.call(this, $http, $q);
    }
    TrendsService.prototype.getTrends = function () {
        var dfd = this.$q.defer();
        this.$http.get('database.json').success(function (database) {
            dfd.resolve(database.trends);
        });
        return dfd.promise;
    };
    ;
    TrendsService.prototype.getTrend = function (trendId) {
        var dfd = this.$q.defer();
        this.$http.get('database.json').success(function (database) {
            var trend = _.find(database.trends, function (trend) { return trend.id == trendId; });
            dfd.resolve(trend);
        });
        return dfd.promise;
    };
    ;
    return TrendsService;
}(ApiService));
var CategoryService = (function (_super) {
    __extends(CategoryService, _super);
    function CategoryService($http, $q) {
        _super.call(this, $http, $q);
    }
    CategoryService.prototype.getCategories = function () {
        var dfd = this.$q.defer();
        this.$http.get('database.json').success(function (database) {
            dfd.resolve(database.categories);
        });
        return dfd.promise;
    };
    ;
    CategoryService.prototype.getCategory = function (categoryId) {
        var dfd = this.$q.defer();
        this.$http.get('database.json').success(function (database) {
            var category = _.find(database.categories, function (category) { return category.id == categoryId; });
            dfd.resolve(category);
        });
        return dfd.promise;
    };
    ;
    return CategoryService;
}(ApiService));
var GooglePlacesService = (function () {
    function GooglePlacesService($q) {
        this.$q = $q;
    }
    GooglePlacesService.prototype.getPlacePredictions = function (query) {
        var dfd = this.$q.defer();
        var service = new google.maps.places.AutocompleteService();
        service.getPlacePredictions({ input: query }, function (predictions, status) {
            if (status != google.maps.places.PlacesServiceStatus.OK) {
                dfd.resolve([]);
            }
            else {
                dfd.resolve(predictions);
            }
        });
        return dfd.promise;
    };
    return GooglePlacesService;
}());
var MapService = (function () {
    function MapService() {
        this.mapOptions = {
            zoom: 16,
            fullscreenControl: true,
            mapTypeControl: false,
            panControl: false,
            rotateControl: false,
            signInControl: false,
            scaleControl: false,
            scrollwheel: true,
            streetViewControl: false,
            styles: [{ "featureType": "administrative", "elementType": "all", "stylers": [{ "visibility": "off" }] }, { "featureType": "administrative", "elementType": "geometry.stroke", "stylers": [{ "visibility": "on" }] }, { "featureType": "administrative", "elementType": "labels", "stylers": [{ "visibility": "on" }, { "color": "#716464" }, { "weight": "0.01" }] }, { "featureType": "administrative.country", "elementType": "labels", "stylers": [{ "visibility": "on" }] }, { "featureType": "landscape", "elementType": "all", "stylers": [{ "visibility": "simplified" }] }, { "featureType": "landscape.natural", "elementType": "geometry", "stylers": [{ "visibility": "simplified" }] }, { "featureType": "landscape.natural.landcover", "elementType": "geometry", "stylers": [{ "visibility": "simplified" }] }, { "featureType": "poi", "elementType": "all", "stylers": [{ "visibility": "simplified" }] }, { "featureType": "poi", "elementType": "geometry.fill", "stylers": [{ "visibility": "simplified" }] }, { "featureType": "poi", "elementType": "geometry.stroke", "stylers": [{ "visibility": "simplified" }] }, { "featureType": "poi", "elementType": "labels.text", "stylers": [{ "visibility": "simplified" }] }, { "featureType": "poi", "elementType": "labels.text.fill", "stylers": [{ "visibility": "simplified" }] }, { "featureType": "poi", "elementType": "labels.text.stroke", "stylers": [{ "visibility": "simplified" }] }, { "featureType": "poi.attraction", "elementType": "geometry", "stylers": [{ "visibility": "on" }] }, { "featureType": "road", "elementType": "all", "stylers": [{ "visibility": "on" }] }, { "featureType": "road.highway", "elementType": "all", "stylers": [{ "visibility": "off" }] }, { "featureType": "road.highway", "elementType": "geometry", "stylers": [{ "visibility": "on" }] }, { "featureType": "road.highway", "elementType": "geometry.fill", "stylers": [{ "visibility": "on" }] }, { "featureType": "road.highway", "elementType": "geometry.stroke", "stylers": [{ "visibility": "simplified" }, { "color": "#a05519" }, { "saturation": "-13" }] }, { "featureType": "road.local", "elementType": "all", "stylers": [{ "visibility": "on" }] }, { "featureType": "transit", "elementType": "all", "stylers": [{ "visibility": "simplified" }] }, { "featureType": "transit", "elementType": "geometry", "stylers": [{ "visibility": "simplified" }] }, { "featureType": "transit.station", "elementType": "geometry", "stylers": [{ "visibility": "on" }] }, { "featureType": "water", "elementType": "all", "stylers": [{ "visibility": "simplified" }, { "color": "#84afa3" }, { "lightness": 52 }] }, { "featureType": "water", "elementType": "geometry", "stylers": [{ "visibility": "on" }] }, { "featureType": "water", "elementType": "geometry.fill", "stylers": [{ "visibility": "on" }] }]
        };
    }
    MapService.prototype.createMap = function (div, center, options) {
        if (!options) {
            options = this.mapOptions;
        }
        options.center = center;
        return new google.maps.Map(document.getElementById(div), options);
    };
    MapService.prototype.createMarker = function (position, map, title, draggable, icon) {
        if (!title) {
            title = '';
        }
        if (draggable == undefined) {
            draggable = false;
        }
        return new google.maps.Marker({
            map: map,
            position: position,
            draggable: draggable,
            title: title
        });
    };
    MapService.prototype.createLatLng = function (lat, lng) {
        return new google.maps.LatLng(lat, lng);
    };
    return MapService;
}());
var LocationService = (function () {
    function LocationService($q) {
        this.$q = $q;
        this.directionService = new google.maps.DirectionsService();
    }
    LocationService.prototype.getPosition = function () {
        var dfd = this.$q.defer();
        navigator.geolocation.getCurrentPosition(function (position) {
            dfd.resolve(position);
        }), (function (error) {
            dfd.reject(error);
        }, { timeout: 10000, enableHighAccuracy: true });
        return dfd.promise;
    };
    LocationService.prototype.getDirection = function (direction) {
        var dfd = this.$q.defer();
        var dsRequest = {
            destination: direction.goal.geometry.location,
            origin: direction.start.geometry.location,
            travelMode: direction.moving.travelMode
        };
        this.directionService.route(dsRequest, function (result, status) {
            if (status !== google.maps.DirectionsStatus.OK) {
                dfd.reject("Es konnte keine Route gefunden werden");
            }
            dfd.resolve(result);
        });
        return dfd.promise;
    };
    LocationService.$inject = ['$q'];
    return LocationService;
}());
angular.module('greencity.app.services', [])
    .service('AuthService', AuthService)
    .service('ProfileService', ProfileService)
    .service('FeedService', FeedService)
    .service('PeopleService', PeopleService)
    .service('TrendsService', TrendsService)
    .service('CategoryService', CategoryService)
    .service('GooglePlacesService', GooglePlacesService)
    .service('MapService', MapService)
    .service('LocationService', LocationService);
