/// <reference path="../../typings/tsd.d.ts" />
/// <reference path="./app.services.ts" />
var ProfileCtrl = (function () {
    function ProfileCtrl($scope, $ionicHistory, $state, $ionicScrollDelegate, loggedUser, user, followers, following, posts, pictures) {
        this.$scope = $scope;
        this.$ionicHistory = $ionicHistory;
        this.$state = $state;
        this.$ionicScrollDelegate = $ionicScrollDelegate;
        this.$inject = ['$scope', '$ionicHistory', '$state', '$ionicScrollDelegate'];
        $scope.$on('$ionicView.afterEnter', function () {
            $ionicScrollDelegate.$getByHandle('profile-scroll').resize();
        });
        $scope.currentUserId = user.id;
        $scope.user = user;
        this.user = user;
        //is this the profile of the logged user?
        $scope.myProfile = loggedUser.id == user.id;
        $scope.user.followers = followers;
        $scope.user.following = following;
        $scope.user.posts = posts;
        $scope.user.pictures = pictures;
    }
    ProfileCtrl.prototype.getUserPics = function () {
        //we need to do this in order to prevent the back to change
        this.$ionicHistory.currentView(this.$ionicHistory.backView());
        this.$ionicHistory.nextViewOptions({ disableAnimate: true });
        this.$state.go('app.profile.pics', { userId: this.user.id });
    };
    ;
    ProfileCtrl.prototype.getUserPosts = function () {
        //we need to do this in order to prevent the back to change
        this.$ionicHistory.currentView(this.$ionicHistory.backView());
        this.$ionicHistory.nextViewOptions({ disableAnimate: true });
        this.$state.go('app.profile.posts', { userId: this.user.id });
    };
    ;
    return ProfileCtrl;
}());
var ProfileConnectionsCtrl = (function () {
    function ProfileConnectionsCtrl($scope) {
        this.$scope = $scope;
        this.$inject = ['$scope'];
    }
    return ProfileConnectionsCtrl;
}());
var CommentsCtrl = (function () {
    function CommentsCtrl($scope, $state, $ionicPopup, FeedService) {
        this.$scope = $scope;
        this.$state = $state;
        this.$ionicPopup = $ionicPopup;
        this.FeedService = FeedService;
        var commentsPopup = {};
        $scope.vm = this;
    }
    CommentsCtrl.prototype.showComments = function (post) {
        this.FeedService.getPostComments(post)
            .then(function (data) {
            post.comments_list = data;
            this.commentsPopup = this.$ionicPopup.show({
                cssClass: 'popup-outer comments-view',
                templateUrl: 'views/app/partials/comments.html',
                scope: angular.extend(this.$scope, { current_post: post }),
                title: post.comments + ' Comments',
                buttons: [
                    { text: '', type: 'close-popup ion-ios-close-outline' }
                ]
            });
        });
    };
    //CLICK IN USER NAME
    CommentsCtrl.prototype.navigateToUserProfile = function (user) {
        this.commentsPopup.close();
        this.$state.go('app.profile.posts', { userId: user.id });
    };
    ;
    return CommentsCtrl;
}());
var NewPostCtrl = (function () {
    function NewPostCtrl($scope, $ionicModal, $ionicLoading, $timeout, $cordovaImagePicker, $ionicPlatform, GooglePlacesService) {
        this.$scope = $scope;
        this.$ionicModal = $ionicModal;
        this.$ionicLoading = $ionicLoading;
        this.$timeout = $timeout;
        this.$cordovaImagePicker = $cordovaImagePicker;
        this.$ionicPlatform = $ionicPlatform;
        this.GooglePlacesService = GooglePlacesService;
        $scope.status_post = {
            audience: 'public',
            text: '',
            images: [],
            location: ''
        };
        $ionicModal.fromTemplateUrl('views/app/partials/new_status_post.html', {
            scope: $scope,
            animation: 'slide-in-up'
        }).then(function (modal) {
            $scope.new_status_post_modal = modal;
        });
        $ionicModal.fromTemplateUrl('views/app/partials/checkin_status_post.html', {
            scope: $scope,
            animation: 'slide-in-up'
        }).then(function (modal) {
            $scope.checkin_status_post_modal = modal;
        });
        $scope.newStatusPost = function () {
            $scope.new_status_post_modal.show();
        };
        $scope.newImageStatusPost = function () {
            $scope.new_status_post_modal.show();
            $scope.openImagePicker();
        };
        $scope.openImagePicker = function () {
            //We use image picker plugin: http://ngcordova.com/docs/plugins/imagePicker/
            //implemented for iOS and Android 4.0 and above.
            $ionicPlatform.ready(function () {
                $cordovaImagePicker.getPictures()
                    .then(function (results) {
                    for (var i = 0; i < results.length; i++) {
                        console.log('Image URI: ' + results[i]);
                        $scope.status_post.images.push(results[i]);
                    }
                }, function (error) {
                    // error getting photos
                });
            });
        };
        $scope.removeImage = function (image) {
            $scope.status_post.images = _.without($scope.status_post.images, image);
        };
        $scope.closeStatusPost = function () {
            $scope.new_status_post_modal.hide();
        };
        $scope.closeCheckInModal = function () {
            $scope.predictions = [];
            $scope.checkin_status_post_modal.hide();
        };
        $scope.checkinStatusPost = function () {
            $scope.new_status_post_modal.hide();
            $scope.checkin_status_post_modal.show();
            $scope.search = { input: '' };
        };
        $scope.getPlacePredictions = function (query) {
            if (query !== "") {
                GooglePlacesService.getPlacePredictions(query)
                    .then(function (predictions) {
                    $scope.predictions = predictions;
                });
            }
            else {
                $scope.predictions = [];
            }
        };
        $scope.selectSearchResult = function (result) {
            $scope.search.input = result.description;
            $scope.predictions = [];
            $scope.closeCheckInModal();
            $scope.new_status_post_modal.show();
            $scope.status_post.location = result.terms[0].value;
        };
        //Cleanup the modal when we're done with it!
        $scope.$on('$destroy', function () {
            $scope.new_status_post_modal.remove();
        });
        $scope.postStatus = function () {
            $ionicLoading.show({
                template: 'Posting ...'
            });
            console.log('Posting status', $scope.status_post);
            // Simulate a posting delay. Remove this and replace with your posting code
            $timeout(function () {
                $ionicLoading.hide();
                $scope.closeStatusPost();
            }, 1000);
        };
    }
    return NewPostCtrl;
}());
var CategoryFeedCtrl = (function () {
    function CategoryFeedCtrl($scope, _, FeedService, $stateParams, loggedUser, feed, category) {
        this.$scope = $scope;
        this.FeedService = FeedService;
        this.$inject = ['FeedService', '$scope'];
        this.loggedUser = loggedUser;
        this.cards = feed.posts;
        this.current_category = category;
        this.page = 1; // Default page is 1
        this.totalPages = feed.totalPages;
        // Check if we are loading posts from one category or trend
        this.categoryId = $stateParams.categoryId;
        this.is_category_feed = true;
        $scope.vm = this;
    }
    CategoryFeedCtrl.prototype.getNewData = function () {
        // Do something to load your new data here
        this.$scope.$broadcast('scroll.refreshComplete');
    };
    ;
    CategoryFeedCtrl.prototype.loadMoreData = function () {
        this.page += 1;
        console.log("Get categories feed");
        // get category feed
        this.FeedService.getFeedByCategory(this.page, this.categoryId)
            .then(function (data) {
            //We will update this value in every request because new posts can be created
            this.totalPages = data.totalPages;
            this.cards = this.cards.concat(data.posts);
            this.$scope.$broadcast('scroll.infiniteScrollComplete');
        });
    };
    ;
    CategoryFeedCtrl.prototype.moreDataCanBeLoaded = function () {
        return this.totalPages > this.page;
    };
    ;
    return CategoryFeedCtrl;
}());
var TrendFeedCtrl = (function () {
    function TrendFeedCtrl($scope, _, FeedService, $stateParams, loggedUser, feed, trend) {
        this.$scope = $scope;
        this.FeedService = FeedService;
        this.$inject = ['$scope', 'FeedService'];
        this.loggedUser = loggedUser;
        this.cards = feed.posts;
        this.current_trend = trend;
        this.page = 1; // Default page is 1
        this.totalPages = feed.totalPages;
        // Check if we are loading posts from one category or trend
        this.trendId = $stateParams.trendId;
        this.is_trend_feed = true;
        $scope.vm = this;
    }
    TrendFeedCtrl.prototype.getNewData = function () {
        // Do something to load your new data here
        this.$scope.$broadcast('scroll.refreshComplete');
    };
    ;
    TrendFeedCtrl.prototype.loadMoreData = function () {
        this.$scope.page += 1;
        console.log("Get trends feed");
        // get trend feed
        this.FeedService.getFeedByTrend(this.$scope.page, this.trendId)
            .then(function (data) {
            //We will update this value in every request because new posts can be created
            this.$scope.totalPages = data.totalPages;
            this.$scope.cards = this.$scope.cards.concat(data.posts);
            this.$scope.$broadcast('scroll.infiniteScrollComplete');
        });
    };
    ;
    TrendFeedCtrl.prototype.moreDataCanBeLoaded = function () {
        return this.$scope.totalPages > this.$scope.page;
    };
    ;
    return TrendFeedCtrl;
}());
var FeedCtrl = (function () {
    function FeedCtrl($scope, _, FeedService, $stateParams, loggedUser, feed) {
        this.$scope = $scope;
        this.FeedService = FeedService;
        this.$inject = ['$scope', '_', 'FeedService', '$stateParams'];
        this.loggedUser = loggedUser;
        this.cards = feed.posts;
        this.page = 1; // Default page is 1
        this.totalPages = feed.totalPages;
        this.is_category_feed = false;
        this.is_trend_feed = false;
        $scope.vm = this;
    }
    FeedCtrl.prototype.getNewData = function () {
        // Do something to load your new data here
        this.$scope.$broadcast('scroll.refreshComplete');
    };
    ;
    FeedCtrl.prototype.loadMoreData = function () {
        var _this = this;
        this.page += 1;
        // get generic feed
        this.FeedService.getFeed(this.page)
            .then(function (data) {
            //We will update this value in every request because new posts can be created
            _this.totalPages = data.totalPages;
            _this.cards = _this.cards.concat(data.posts);
            _this.$scope.$broadcast('scroll.infiniteScrollComplete');
        });
    };
    ;
    FeedCtrl.prototype.moreDataCanBeLoaded = function () {
        return this.totalPages > this.page;
    };
    ;
    return FeedCtrl;
}());
var PeopleCtrl = (function () {
    function PeopleCtrl($scope, people_suggestions, people_you_may_know) {
        this.$inject = ['$scope'];
        this.people_suggestions = people_suggestions;
        this.people_you_may_know = people_you_may_know;
        $scope.vm = this;
    }
    return PeopleCtrl;
}());
var BrowseCtrl = (function () {
    function BrowseCtrl($scope, trends, categories) {
        this.$scope = $scope;
        this.$inject = ['$scope'];
        this.trends = trends;
        this.categories = categories;
        $scope.vm = this;
    }
    return BrowseCtrl;
}());
var AppCtrl = (function () {
    function AppCtrl($scope, $ionicModal, $timeout, AuthService) {
        var _this = this;
        this.$scope = $scope;
        this.$timeout = $timeout;
        this.$inject = ['$scope', '$ionicModal', '$timeout', 'AuthService'];
        // Form data for the login modal
        $scope.vm = this;
        // Create the login modal that we will use later
        $ionicModal.fromTemplateUrl('views/login.html', {
            scope: $scope
        }).then(function (modal) {
            _this.modal = modal;
        });
    }
    // Close the login modal
    AppCtrl.prototype.closeLogin = function () {
        this.modal.hide();
    };
    ;
    // Open the login modal
    AppCtrl.prototype.login = function () {
        this.modal.show();
    };
    ;
    // Perform the login action when the user submits the login form
    AppCtrl.prototype.doLogin = function () {
        var _this = this;
        console.log('Doing login', this.loginData);
        // Simulate a login delay. Remove this and replace with your login
        // code if using a login system
        this.$timeout(function () {
            _this.closeLogin();
        }, 1000);
    };
    ;
    return AppCtrl;
}());
var EmailComposerCtrl = (function () {
    function EmailComposerCtrl($scope, $cordovaEmailComposer, $ionicPlatform) {
        this.$scope = $scope;
        this.$cordovaEmailComposer = $cordovaEmailComposer;
        this.$ionicPlatform = $ionicPlatform;
        //we use email composer cordova plugin, see the documentation for mor options: http://ngcordova.com/docs/plugins/emailComposer/
        $scope.vm = this;
    }
    EmailComposerCtrl.prototype.sendMail = function () {
        this.$ionicPlatform.ready(function () {
            this.$cordovaEmailComposer.isAvailable().then(function () {
                // is available
                console.log("Is available");
                this.$cordovaEmailComposer.open({
                    to: 'hi@startapplabs.com',
                    subject: 'Nice Theme!',
                    body: 'How are you? Nice greetings from Social App'
                }).then(null, function () {
                    // user cancelled email
                });
            }, function () {
                // not available
                console.log("Not available");
            });
        });
    };
    ;
    return EmailComposerCtrl;
}());
var SettingsCtrl = (function () {
    function SettingsCtrl($scope, $ionicModal) {
        this.$scope = $scope;
        this.$inject = ['$scope', '$ionicModal'];
        $ionicModal.fromTemplateUrl('views/app/legal/terms-of-service.html', {
            scope: $scope,
            animation: 'slide-in-up'
        }).then(function (modal) {
            $scope.terms_of_service_modal = modal;
        });
        $ionicModal.fromTemplateUrl('views/app/legal/privacy-policy.html', {
            scope: $scope,
            animation: 'slide-in-up'
        }).then(function (modal) {
            $scope.privacy_policy_modal = modal;
        });
        $scope.vm = this;
    }
    SettingsCtrl.prototype.showTerms = function () {
        this.$scope.terms_of_service_modal.show();
    };
    ;
    SettingsCtrl.prototype.showPrivacyPolicy = function () {
        this.$scope.privacy_policy_modal.show();
    };
    ;
    return SettingsCtrl;
}());
var AppRateCtrl = (function () {
    function AppRateCtrl($scope) {
        $scope.vm = this;
    }
    AppRateCtrl.prototype.appRate = function () {
        if (ionic.Platform.isIOS()) {
        }
        else if (ionic.Platform.isAndroid()) {
        }
    };
    ;
    return AppRateCtrl;
}());
var PostDetailCtrl = (function () {
    function PostDetailCtrl($scope, post, FeedService, $ionicPopup) {
        this.$inject = ['$scope'];
        $scope.post = post;
    }
    return PostDetailCtrl;
}());
var ActionCtrl = (function () {
    function ActionCtrl($scope, categories, $ionicTabsDelegate, $timeout, $cordovaCameraPreview, $window, $ionicHistory, LocationService, MapService) {
        var _this = this;
        this.$ionicTabsDelegate = $ionicTabsDelegate;
        this.$cordovaCameraPreview = $cordovaCameraPreview;
        this.$window = $window;
        this.$ionicHistory = $ionicHistory;
        this.LocationService = LocationService;
        this.MapService = MapService;
        this.$inject = [
            '$scope',
            '$ionicTabsDelegate',
            '$timeout',
            '$cordovaCameraPreview',
            '$window',
            '$state',
            'LocationService',
            'MapService'
        ];
        $scope.vm = this;
        this.categories = categories;
        this.showCategories = false;
        this.showTakePicture = true;
        $timeout(100).then(function () {
            $ionicTabsDelegate.select(0);
            var tapEnabled = false; //enable tap take picture
            var dragEnabled = false; //enable preview box drag across the screen
            var toBack = false; //send preview box to the back of the webview
            var rect = { x: 0, y: 40, width: $window.screen.width, height: $window.screen.width };
            // $cordovaCameraPreview.startCamera(rect, "back", tapEnabled, dragEnabled, toBack);
            //$cordovaCameraPreview.show();
            $timeout(100).then(function () {
                _this.$window.cordova.plugins.camerapreview.setOnPictureTakenHandler(function (result) {
                    document.getElementById('originalPicture').src = result[0]; //originalPicturePath;
                    document.getElementById('previewPicture').src = result[1]; //previewPicturePath;
                    console.log(result);
                });
            });
        });
    }
    ActionCtrl.prototype.stopCamera = function () {
    };
    ActionCtrl.prototype.startCamera = function () {
    };
    ActionCtrl.prototype.takePhoto = function () {
        console.log(this.$cordovaCameraPreview);
        /** this.$cordovaCameraPreview.setOnPictureTakenHandler((result) => {
          console.log(result);
          (document as any).getElementById('originalPicture').src = result[0];//originalPicturePath;
          (document as any).getElementById('previewPicture').src = result[1];//previewPicturePath;
        });*/
        this.$cordovaCameraPreview.takePicture({ maxWidth: 1080, maxHeight: 1080 });
        this.$cordovaCameraPreview.hide();
        this.showCategories = true;
        this.showTakePicture = false;
    };
    ActionCtrl.prototype.skipPhoto = function () {
    };
    ActionCtrl.prototype.goBack = function () {
        this.$cordovaCameraPreview.stop();
        this.$ionicHistory.goBack();
    };
    ActionCtrl.prototype.selectTrack = function () {
        this.$cordovaCameraPreview.stop();
        this.$ionicTabsDelegate.select(0);
    };
    ActionCtrl.prototype.selectTrackModal = function () {
        this.$cordovaCameraPreview.stop();
        this.$cordovaCameraPreview.hide();
    };
    return ActionCtrl;
}());
var Direction = (function () {
    function Direction() {
        this.movingOptions = [
            { id: 1, name: "Öffi", icon: 'ion-android-bus', color: 'energized', travelMode: google.maps.TravelMode.TRANSIT },
            { id: 2, name: "Fahrrad", icon: 'ion-android-bicycle', color: 'balanced', travelMode: google.maps.TravelMode.BICYCLING },
            { id: 3, name: "Auto", icon: 'ion-android-car', color: 'assertive', travelMode: google.maps.TravelMode.DRIVING },
        ];
        this.moving = this.movingOptions[1];
    }
    return Direction;
}());
var TrackingActionCtrl = (function () {
    function TrackingActionCtrl($window, $scope, LocationService, MapService, $q, $state, $ionicPopup) {
        var _this = this;
        this.$window = $window;
        this.LocationService = LocationService;
        this.MapService = MapService;
        this.$q = $q;
        this.$state = $state;
        this.$ionicPopup = $ionicPopup;
        this.$inject = [
            '$window',
            '$scope',
            '$q',
            '$state',
            'LocationService',
            'MapService',
            '$ionicPopup'
        ];
        this.direction = new Direction();
        this.LocationService.getPosition().then(function (position) {
            var dfd = _this.$q.defer();
            var geocoder = new google.maps.Geocoder();
            var latlng = new google.maps.LatLng(position.coords.lat, position.coords.lng);
            geocoder.geocode({ location: latlng }, function (result, status) {
                if (status === google.maps.GeocoderStatus.OK) {
                    dfd.resolve(result[0]);
                }
                else {
                    dfd.reject('fehler');
                }
            });
            return dfd.promise;
        }).then(function (result) {
            //google.maps.Auto
            _this.direction.start = result;
        });
        $scope.vm = this;
    }
    TrackingActionCtrl.prototype.searchDirection = function () {
        if (!this.direction.goal || !this.direction.start) {
            var options = {
                title: "Angaben vervollständigen",
                subTitle: "Bitte alle Angaben vervollständigen"
            };
            return this.$ionicPopup.alert(options);
        }
        return this.$state.go('show-tracking-route', { 'direction': this.direction });
    };
    return TrackingActionCtrl;
}());
var ShowTrackingRouteCtrl = (function () {
    function ShowTrackingRouteCtrl($stateParams, $state, MapService, LocationService, $scope, $window) {
        var _this = this;
        this.$stateParams = $stateParams;
        this.$state = $state;
        this.MapService = MapService;
        this.LocationService = LocationService;
        this.$scope = $scope;
        this.$window = $window;
        this.$inject = ['$stateParams', '$state', 'MapService', 'LocationService', '$scope', '$window'];
        this.direction = $stateParams.direction;
        console.log(this.direction);
        if (this.direction === null) {
            return $state.go('create-action');
        }
        this.height = $window.screen.height - 450;
        LocationService.getDirection(this.direction).then(function (result) {
            _this.map = MapService.createMap('tracking-map', _this.direction.start.geometry.location);
            var directionsDisplay = new google.maps.DirectionsRenderer();
            directionsDisplay.setMap(_this.map);
            directionsDisplay.setDirections(result);
            _this.direction.legs = result.routes[0].legs;
        });
        $scope.vm = this;
    }
    ShowTrackingRouteCtrl.prototype.pressActionButton = function (action) {
        if (action === 'start') {
        }
        else if (action === 'pause') {
        }
        else if (action === 'stop') {
        }
        else if (action === 'reset') {
        }
    };
    return ShowTrackingRouteCtrl;
}());
angular.module('greencity.app.controllers', [])
    .controller('ProfileCtrl', ProfileCtrl)
    .controller('ProfileConnectionsCtrl', ProfileConnectionsCtrl)
    .controller('CommentsCtrl', CommentsCtrl)
    .controller('NewPostCtrl', NewPostCtrl)
    .controller('CategoryFeedCtrl', CategoryFeedCtrl)
    .controller('TrendFeedCtrl', TrendFeedCtrl)
    .controller('FeedCtrl', FeedCtrl)
    .controller('PeopleCtrl', PeopleCtrl)
    .controller('BrowseCtrl', BrowseCtrl)
    .controller('AppCtrl', AppCtrl)
    .controller('EmailComposerCtrl', EmailComposerCtrl)
    .controller('SettingsCtrl', SettingsCtrl)
    .controller('AppRateCtrl', AppRateCtrl)
    .controller('PostDetailsCtrl', PostDetailCtrl)
    .controller('ActionCtrl', ActionCtrl)
    .controller('TrackingActionCtrl', TrackingActionCtrl)
    .controller('ShowTrackingRouteCtrl', ShowTrackingRouteCtrl);
