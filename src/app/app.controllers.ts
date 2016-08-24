/// <reference path="../../typings/tsd.d.ts" />
/// <reference path="./app.services.ts" />

class ProfileCtrl {

  $inject = ['$scope', '$ionicHistory', '$state', '$ionicScrollDelegate'];

  myProfile: boolean;
  user: any;


  constructor(public $scope, public $ionicHistory, public $state, public $ionicScrollDelegate, loggedUser, user, followers, following, posts, pictures) {
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

  getUserPics() {
    //we need to do this in order to prevent the back to change
    this.$ionicHistory.currentView(this.$ionicHistory.backView());
    this.$ionicHistory.nextViewOptions({ disableAnimate: true });
    this.$state.go('app.profile.pics', { userId: this.user.id });
  };

  getUserPosts() {
    //we need to do this in order to prevent the back to change
    this.$ionicHistory.currentView(this.$ionicHistory.backView());
    this.$ionicHistory.nextViewOptions({ disableAnimate: true });
    this.$state.go('app.profile.posts', { userId: this.user.id });
  };

}

class ProfileConnectionsCtrl {

  $inject = ['$scope']

  constructor(public $scope) {

  }
}

class CommentsCtrl {

  commentsPopup: any;

  constructor(public $scope, public $state, public $ionicPopup, public FeedService) {
    var commentsPopup = {};

    $scope.vm = this;
  }

  showComments(post) {
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
  }

  //CLICK IN USER NAME
  navigateToUserProfile(user) {
    this.commentsPopup.close();
    this.$state.go('app.profile.posts', { userId: user.id });
  };

}

class NewPostCtrl {



  constructor(public $scope, public $ionicModal, public $ionicLoading, public $timeout, public $cordovaImagePicker, public $ionicPlatform, public GooglePlacesService) {
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
    }

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
      } else {
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
}

class CategoryFeedCtrl {

  $inject = ['FeedService', '$scope'];

  categoryId: number;
  loggedUser: any;
  cards: any[];
  current_category: any;
  page: number;
  totalPages: number;
  is_category_feed: boolean;


  constructor(protected $scope, _, protected FeedService, $stateParams, loggedUser, feed, category) {
    this.loggedUser = loggedUser;
    this.cards = feed.posts;
    this.current_category = category;

    this.page = 1;// Default page is 1
    this.totalPages = feed.totalPages;

    // Check if we are loading posts from one category or trend
    this.categoryId = $stateParams.categoryId;

    this.is_category_feed = true;


    $scope.vm = this;
  }
  getNewData() {
    // Do something to load your new data here
    this.$scope.$broadcast('scroll.refreshComplete');
  };

  loadMoreData() {
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

  moreDataCanBeLoaded() {
    return this.totalPages > this.page;
  };
}

class TrendFeedCtrl {

  $inject = ['$scope', 'FeedService'];
  trendId: number;
  loggedUser: any;
  cards: any[];
  current_trend: any;
  page: number;
  totalPages: number;
  is_trend_feed: boolean;

  constructor(public $scope, _, public FeedService, $stateParams, loggedUser, feed, trend) {
    this.loggedUser = loggedUser;
    this.cards = feed.posts;
    this.current_trend = trend;

    this.page = 1;// Default page is 1
    this.totalPages = feed.totalPages;

    // Check if we are loading posts from one category or trend
    this.trendId = $stateParams.trendId;

    this.is_trend_feed = true;

    $scope.vm = this;
  }
  getNewData() {
    // Do something to load your new data here
    this.$scope.$broadcast('scroll.refreshComplete');
  };

  loadMoreData() {
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

  moreDataCanBeLoaded() {
    return this.$scope.totalPages > this.$scope.page;
  };
}

class FeedCtrl {

  $inject = ['$scope', '_', 'FeedService', '$stateParams'];

  loggedUser: any;
  cards: any;
  page: number;
  totalPages: number;

  is_category_feed: boolean;
  is_trend_feed: boolean;


  constructor(public $scope, _, public FeedService, $stateParams, loggedUser, feed) {
    this.loggedUser = loggedUser;
    this.cards = feed.posts;
    this.page = 1;// Default page is 1
    this.totalPages = feed.totalPages;

    this.is_category_feed = false;
    this.is_trend_feed = false;
    $scope.vm = this;
  }
  getNewData() {
    // Do something to load your new data here
    this.$scope.$broadcast('scroll.refreshComplete');
  };

  loadMoreData() {
    this.page += 1;

    // get generic feed
    this.FeedService.getFeed(this.page)
      .then((data) => {
        //We will update this value in every request because new posts can be created
        this.totalPages = data.totalPages;
        this.cards = this.cards.concat(data.posts);

        this.$scope.$broadcast('scroll.infiniteScrollComplete');
      });
  };

  moreDataCanBeLoaded() {
    return this.totalPages > this.page;
  };
}

class PeopleCtrl {

  $inject = ['$scope'];

  people_suggestions: any[];
  people_you_may_know: any[];


  constructor($scope, people_suggestions, people_you_may_know) {
    this.people_suggestions = people_suggestions;
    this.people_you_may_know = people_you_may_know;

    $scope.vm = this;
  }
}

class BrowseCtrl {

  $inject = ['$scope'];
  trends: any[];
  categories: any[];

  constructor(public $scope, trends, categories) {
    this.trends = trends;
    this.categories = categories;

    $scope.vm = this;
  }
}

class AppCtrl {

  $inject = ['$scope', '$ionicModal', '$timeout', 'AuthService'];
  loginData: any;
  modal: ionic.modal.IonicModalController;


  constructor(public $scope, $ionicModal: ionic.modal.IonicModalService, public $timeout, AuthService) {
    // Form data for the login modal
    $scope.vm = this;

    // Create the login modal that we will use later
    $ionicModal.fromTemplateUrl('views/login.html', {
      scope: $scope
    }).then((modal) => {
      this.modal = modal;
    });




  }


  // Close the login modal
  closeLogin() {
    this.modal.hide();
  };

  // Open the login modal
  login() {
    this.modal.show();
  };

  // Perform the login action when the user submits the login form
  doLogin() {
    console.log('Doing login', this.loginData);

    // Simulate a login delay. Remove this and replace with your login
    // code if using a login system
    this.$timeout(() => {
      this.closeLogin();
    }, 1000);
  };
}

class EmailComposerCtrl {


  constructor(public $scope, public $cordovaEmailComposer, public $ionicPlatform) {
    //we use email composer cordova plugin, see the documentation for mor options: http://ngcordova.com/docs/plugins/emailComposer/
    $scope.vm = this;
  }


  sendMail() {
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
}

class SettingsCtrl {

  $inject = ['$scope', '$ionicModal']

  constructor(public $scope, $ionicModal) {
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

  showTerms() {
    this.$scope.terms_of_service_modal.show();
  };

  showPrivacyPolicy() {
    this.$scope.privacy_policy_modal.show();
  };
}

class AppRateCtrl {
  constructor($scope) {
    $scope.vm = this;
  }

  appRate() {
    if (ionic.Platform.isIOS()) {
      //you need to set your own ios app id 
      //AppRate.preferences.storeAppURL.ios = '1234555553>';
      //AppRate.promptForRating(true);
    } else if (ionic.Platform.isAndroid()) {
      //you need to set your own android app id
      //AppRate.preferences.storeAppURL.android = 'market://details?id=ionTheme3';
      //AppRate.promptForRating(true);
    }
  };
}

class PostDetailCtrl {

  $inject = ['$scope'];

  constructor($scope, post, FeedService, $ionicPopup) {
    $scope.post = post;

  }
}

class ActionCtrl {

  $inject = [
    '$scope',
    '$ionicTabsDelegate',
    '$timeout',
    '$cordovaCameraPreview',
    '$window',
    '$state',
    'LocationService',
    'MapService'

  ]

  categories: any[];
  showCategories: boolean;
  showTakePicture: boolean;


  constructor(
    $scope,
    categories: any[],
    protected $ionicTabsDelegate,
    $timeout: ng.ITimeoutService,
    protected $cordovaCameraPreview: any,
    protected $window,
    protected $ionicHistory: any,
    protected LocationService: LocationService,
    protected MapService: MapService
  ) {
    $scope.vm = this;

    this.categories = categories;
    this.showCategories = false;
    this.showTakePicture = true;



    $timeout(100).then(() => {
      $ionicTabsDelegate.select(0);

      var tapEnabled = false; //enable tap take picture
      var dragEnabled = false; //enable preview box drag across the screen
      var toBack = false; //send preview box to the back of the webview

      var rect = { x: 0, y: 40, width: $window.screen.width, height: $window.screen.width };
      // $cordovaCameraPreview.startCamera(rect, "back", tapEnabled, dragEnabled, toBack);
      //$cordovaCameraPreview.show();
      $timeout(100).then(() => {
        this.$window.cordova.plugins.camerapreview.setOnPictureTakenHandler((result) => {
          (document as any).getElementById('originalPicture').src = result[0];//originalPicturePath;
          (document as any).getElementById('previewPicture').src = result[1];//previewPicturePath;
          console.log(result);
        });
      })




    });
  }

  stopCamera() {

  }

  startCamera() {

  }

  takePhoto() {
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

  }

  skipPhoto() {

  }

  goBack() {
    this.$cordovaCameraPreview.stop();
    this.$ionicHistory.goBack();
  }

  selectTrack() {
    this.$cordovaCameraPreview.stop();
    this.$ionicTabsDelegate.select(0);
  }

  selectTrackModal() {
    this.$cordovaCameraPreview.stop();
    this.$cordovaCameraPreview.hide();

  }



}


class Direction {

  start: google.maps.GeocoderResult;
  goal: google.maps.GeocoderResult;
  movingOptions: any[] = [
    { id: 1, name: "Öffi", icon: 'ion-android-bus', color: 'energized', travelMode: google.maps.TravelMode.TRANSIT },
    { id: 2, name: "Fahrrad", icon: 'ion-android-bicycle', color: 'balanced', travelMode: google.maps.TravelMode.BICYCLING },
    { id: 3, name: "Auto", icon: 'ion-android-car', color: 'assertive', travelMode: google.maps.TravelMode.DRIVING },
  ];
  legs: google.maps.DirectionsLeg[];
  moving: any;

  constructor() {

    this.moving = this.movingOptions[1];
  }
}

class TrackingActionCtrl {

  $inject = [
    '$window',
    '$scope',
    '$q',
    '$state',
    'LocationService',
    'MapService',
    '$ionicPopup'
  ];


  screenHeight: number;
  mapHeight: number;
  showActionButton: boolean;
  step: number;
  map: google.maps.Map;
  startMarker: google.maps.Marker;
  goalPosition: google.maps.LatLng;
  direction: Direction;
  showKeyboard: boolean;
  movingOptions: any[];
  selectedMovingOption: any;

  constructor(
    protected $window: ng.IWindowService,
    $scope: any,
    protected LocationService: LocationService,
    protected MapService: MapService,
    protected $q: ng.IQService,
    protected $state: any,
    protected $ionicPopup: ionic.popup.IonicPopupService

  ) {
    this.direction = new Direction();


    this.LocationService.getPosition().then((position: any) => {

      var dfd = this.$q.defer();

      let geocoder = new google.maps.Geocoder();
      let latlng = new google.maps.LatLng(position.coords.lat, position.coords.lng)
      geocoder.geocode({ location: latlng }, (result, status) => {

        if (status === google.maps.GeocoderStatus.OK) {
          dfd.resolve(result[0]);
        } else {
          dfd.reject('fehler');
        }

      })

      return dfd.promise;
    }).then((result: google.maps.GeocoderResult) => {
      //google.maps.Auto
      this.direction.start = result;
    });


    $scope.vm = this;

  }

  searchDirection() {

    if (!this.direction.goal || !this.direction.start) {
      var options: ionic.popup.IonicPopupAlertOptions = {
        title: "Angaben vervollständigen",
        subTitle: "Bitte alle Angaben vervollständigen"
      };
      return this.$ionicPopup.alert(options)
    }

    return this.$state.go('show-tracking-route', { 'direction': this.direction })
  }


}

class ShowTrackingRouteCtrl {

  $inject = ['$stateParams', '$state', 'MapService', 'LocationService', '$scope', '$window'];
  direction: Direction;
  map: google.maps.Map;
  height: number;
  actionButton: any;
  


  constructor(
    protected $stateParams: any,
    protected $state,
    protected MapService: MapService,
    protected LocationService: LocationService,
    protected $scope: any,
    protected $window: ng.IWindowService
  ) {

    this.direction = $stateParams.direction;
    console.log(this.direction);
    if (this.direction === null) {
      return $state.go('create-action');
    }

    this.height = $window.screen.height - 450;

    LocationService.getDirection(this.direction).then((result: google.maps.DirectionsResult) => {
      this.map = MapService.createMap('tracking-map', this.direction.start.geometry.location)
      var directionsDisplay = new google.maps.DirectionsRenderer()
      directionsDisplay.setMap(this.map);
      directionsDisplay.setDirections(result);
      this.direction.legs = result.routes[0].legs;
    })

    $scope.vm = this;

  }

  pressActionButton(action:string) {
      if(action === 'start') {

      } else if(action === 'pause') {

      } else if(action === 'stop') {

      } else if(action === 'reset') {

      }
  }

}

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
  .controller('ShowTrackingRouteCtrl', ShowTrackingRouteCtrl)

  ; 
