/// <reference path="../../typings/tsd.d.ts" />

class ApiService {
  protected $q;
  protected $http;

  constructor($http: ng.IHttpService, $q: ng.IQService) {
    this.$q = $q;
    this.$http = $http;
  }
}

class AuthService extends ApiService {


  constructor($http: ng.IHttpService, $q: ng.IQService) {
    super($http, $q);
  }


  //Just for example purposes user with id=0 will represent our logged user
  getLoggedUser() {
    var dfd = this.$q.defer();

    this.$http.get('database.json').success(database => {
      var user = _.find(database.users, (user: any) => {
        return user.id == 0
      });

      dfd.resolve(user);
    });

    return dfd.promise;
  };

}

class ProfileService extends ApiService {


  constructor($http: ng.IHttpService, $q: ng.IQService) {
    super($http, $q);
  }

  getUserData(userId: number) {
    var dfd = this.$q.defer();

    this.$http.get('database.json').success((database: any) => {
      var user = _.find(database.users, (user: any) => { return user.id == userId });
      dfd.resolve(user);
    });
    return dfd.promise;
  };

  getUserFollowers(userId: number) {
    var dfd = this.$q.defer();

    this.$http.get('database.json').success((database: any) => {
      var followers_data = _.filter(database.following, (follow: any) => { return follow.followsId == userId });

      //remove possible duplicates
      var followers_userId = _.uniq(_.pluck(followers_data, 'userId'));

      var followers = _.map(followers_userId, (followerId) => {
        return {
          userId: followerId,
          userData: _.find(database.users, (user: any) => { return user.id == followerId }),
          follow_back: !_.isUndefined(_.find(database.following, (user: any) => { return (user.userId === userId && user.followsId === followerId) }))
        }
      });

      dfd.resolve(followers);
    });
    return dfd.promise;
  };

  getUserFollowing(userId: number) {
    var dfd = this.$q.defer();

    this.$http.get('database.json').success((database: any) => {
      var following_data = _.filter(database.following, (follow: any) => { return follow.userId == userId });
      //remove possible duplicates
      var following_userId = _.uniq(_.pluck(following_data, 'followsId'));

      var following = _.map(following_userId, (followingId) => {
        return {
          userId: followingId,
          userData: _.find(database.users, (user: any) => { return user.id == followingId })
        }
      });
      dfd.resolve(following);
    });

    return dfd.promise;
  };

  getUserPictures(userId: number) {
    var dfd = this.$q.defer();

    this.$http.get('database.json').success((database: any) => {
      //get user related pictures
      var user_pictures = _.filter(database.users_pictures, (picture: any) => {
        return picture.userId == userId;
      });

      dfd.resolve(user_pictures);
    });

    return dfd.promise;
  };

  getUserPosts(userId: number) {
    var dfd = this.$q.defer();

    this.$http.get('database.json').success((database: any) => {
      //get user related pictures
      var user_post = _.filter(database.posts, (post: any) => {
        return post.userId == userId;
      });

      dfd.resolve(user_post);
    });

    return dfd.promise;
  };

}

class FeedService extends ApiService {
  constructor($http: ng.IHttpService, $q: ng.IQService) {
    super($http, $q);
  }

  getFeed(page: number) {

    var pageSize = 5, // set your page size, which is number of records per page
      skip = pageSize * (page - 1),
      totalPosts = 1,
      totalPages = 1,
      dfd = this.$q.defer();

    this.$http.get('database.json').success((database) => {

      totalPosts = database.posts.length;
      totalPages = totalPosts / pageSize;

      var sortedPosts = _.sortBy(database.posts, (post: any) => { return new Date(post.date); });

      var postsToShow = sortedPosts.slice(skip, skip + pageSize);

      //add user data to posts
      var posts = _.each(postsToShow.reverse(), (post: any) => {
        post.user = _.find(database.users, (user: any) => { return user.id == post.userId; });
        return post;
      });

      dfd.resolve({
        posts: posts,
        totalPages: totalPages
      });
    });

    return dfd.promise;
  };

  getFeedByCategory(page: number, categoryId: number) {

    var pageSize = 5, // set your page size, which is number of records per page
      skip = pageSize * (page - 1),
      totalPosts = 1,
      totalPages = 1,
      dfd = this.$q.defer();

    this.$http.get('database.json').success((database) => {

      totalPosts = database.posts.length;
      totalPages = totalPosts / pageSize;

      var sortedPosts = _.sortBy(database.posts, (post: any) => {
        return new Date(post.date);
      });

      if (categoryId) {
        sortedPosts = _.filter(sortedPosts, (post: any) => {
          return post.category.id == categoryId;
        });
      }

      var postsToShow = sortedPosts.slice(skip, skip + pageSize);

      //add user data to posts
      var posts = _.each(postsToShow.reverse(), (post: any) => {
        post.user = _.find(database.users, (user: any) => { return user.id == post.userId; });
        return post;
      });

      dfd.resolve({
        posts: posts,
        totalPages: totalPages
      });
    });

    return dfd.promise;
  };

  getFeedByTrend(page: number, trendId: number) {

    var pageSize = 5, // set your page size, which is number of records per page
      skip = pageSize * (page - 1),
      totalPosts = 1,
      totalPages = 1,
      dfd = this.$q.defer();

    this.$http.get('database.json').success((database) => {

      totalPosts = database.posts.length;
      totalPages = totalPosts / pageSize;

      var sortedPosts = _.sortBy(database.posts, (post: any) => { return new Date(post.date); });

      if (trendId) {
        sortedPosts = _.filter(sortedPosts, (post: any) => { return post.trend.id == trendId; });
      }

      var postsToShow = sortedPosts.slice(skip, skip + pageSize);

      //add user data to posts
      var posts = _.each(postsToShow.reverse(), (post: any) => {
        post.user = _.find(database.users, (user: any) => { return user.id == post.userId; });
        return post;
      });

      dfd.resolve({
        posts: posts,
        totalPages: totalPages
      });
    });

    return dfd.promise;
  };

  getPostComments(post: any) {
    var dfd = this.$q.defer();

    this.$http.get('database.json').success(function (database) {
      var comments_users = database.users;
      // Randomize comments users array
      comments_users = (window as any).knuthShuffle(comments_users.slice(0, post.comments));

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

  getPost(postId: number) {
    var dfd = this.$q.defer();

    this.$http.get('database.json').success((database: any) => {
      var post = _.find(database.posts, (post: any) => {
        return post.id == postId;
      });

      post.user = _.find(database.users, (user: any) => { return user.id == post.userId; });

      dfd.resolve(post);
    });

    return dfd.promise;
  };

}

class PeopleService extends ApiService {
  constructor($http: ng.IHttpService, $q: ng.IQService) {
    super($http, $q);
  }

  getPeopleSuggestions() {

    var dfd = this.$q.defer();

    this.$http.get('database.json').success((database) => {

      var people_suggestions = _.each(database.people_suggestions, (suggestion: any) => {
        suggestion.user = _.find(database.users, (user: any) => { return user.id == suggestion.userId; });

        //get user related pictures
        var user_pictures = _.filter(database.users_pictures, (picture: any) => {
          return picture.userId == suggestion.userId;
        });

        suggestion.user.pictures = _.last(user_pictures, 3);

        return suggestion;
      });

      dfd.resolve(people_suggestions);
    });

    return dfd.promise;
  };

  getPeopleYouMayKnow() {

    var dfd = this.$q.defer();

    this.$http.get('database.json').success((database) => {

      var people_you_may_know = _.each(database.people_you_may_know, (person: any) => {
        person.user = _.find(database.users, (user: any) => { return user.id == person.userId; });
        return person;
      });

      dfd.resolve(people_you_may_know);
    });

    return dfd.promise;
  };
}

class TrendsService extends ApiService {
  constructor($http: ng.IHttpService, $q: ng.IQService) {
    super($http, $q);
  }

  getTrends() {
    var dfd = this.$q.defer();

    this.$http.get('database.json').success((database: any) => {
      dfd.resolve(database.trends);
    });

    return dfd.promise;
  };

  getTrend(trendId) {
    var dfd = this.$q.defer();

    this.$http.get('database.json').success((database: any) => {
      var trend = _.find(database.trends, (trend: any) => { return trend.id == trendId; });
      dfd.resolve(trend);
    });

    return dfd.promise;
  };
}

class CategoryService extends ApiService {
  constructor($http: ng.IHttpService, $q: ng.IQService) {
    super($http, $q);
  }
  getCategories() {
    var dfd = this.$q.defer();

    this.$http.get('database.json').success((database: any) => {
      dfd.resolve(database.categories);
    });

    return dfd.promise;
  };

  getCategory(categoryId) {
    var dfd = this.$q.defer();

    this.$http.get('database.json').success((database: any) => {
      var category = _.find(database.categories, (category: any) => { return category.id == categoryId; });
      dfd.resolve(category);
    });

    return dfd.promise;
  };
}

class GooglePlacesService {

  protected $q: ng.IQService;

  constructor($q: ng.IQService) {
    this.$q = $q;
  }


  getPlacePredictions(query: string) {
    var dfd = this.$q.defer();
    var service = new google.maps.places.AutocompleteService();

    service.getPlacePredictions({ input: query },
      function (predictions, status) {
        if (status != google.maps.places.PlacesServiceStatus.OK) {
          dfd.resolve([]);
        }
        else {
          dfd.resolve(predictions);
        }
      });
    return dfd.promise;
  }
}

class MapService {

  mapOptions = {
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

  constructor() {

  }

  createMap(div: string, center: google.maps.LatLng, options?: any) {
    if (!options) {
      options = this.mapOptions;
    }

    options.center = center;

    return new google.maps.Map(document.getElementById(div), options);
  }

  createMarker(position: google.maps.LatLng, map: google.maps.Map, title?: string, draggable?: boolean, icon?:any) {
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
    })
  }

  createLatLng(lat: number, lng: number) {
    return new google.maps.LatLng(lat, lng);
  }

}



class LocationService {

  static $inject = ['$q'];
  directionService:google.maps.DirectionsService

  constructor(public $q: ng.IQService) {
    this.directionService = new google.maps.DirectionsService();
  }

  getPosition() {
    var dfd = this.$q.defer();
    navigator.geolocation.getCurrentPosition((position) => {
      dfd.resolve(position)
    }), ((error) => {
      dfd.reject(error);
    }, { timeout: 10000, enableHighAccuracy: true });

    return dfd.promise;
  }

  getDirection(direction:Direction) {

    var dfd = this.$q.defer();

    let dsRequest: google.maps.DirectionsRequest = {
      destination: direction.goal.geometry.location,
      origin: direction.start.geometry.location,
      travelMode: direction.moving.travelMode
    };

    this.directionService.route(dsRequest, (result, status) => {
      if (status !== google.maps.DirectionsStatus.OK) {
        dfd.reject("Es konnte keine Route gefunden werden");
      }

      dfd.resolve(result);

    
    })

    return dfd.promise;
    
    

  }


}




angular.module('greencity.app.services', [])

  .service('AuthService', AuthService)
  .service('ProfileService', ProfileService)
  .service('FeedService', FeedService)
  .service('PeopleService', PeopleService)
  .service('TrendsService', TrendsService)
  .service('CategoryService', CategoryService)
  .service('GooglePlacesService', GooglePlacesService)
  .service('MapService', MapService)
  .service('LocationService', LocationService)


  ;
