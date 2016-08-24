/// <reference path="../../typings/tsd.d.ts" />

class WelcomeCtrl {

  bgs: string[];
  privacy_policy_modal: ionic.modal.IonicModalController;
  terms_of_service_modal: ionic.modal.IonicModalController;

  constructor(protected $scope, protected $state, protected $ionicModal: ionic.modal.IonicModalService) {
    this.bgs = ["img/welcome-bg.jpg"];
    $scope.vm = this;

    $ionicModal.fromTemplateUrl('views/app/legal/privacy-policy.html', {
      scope: $scope,
      animation: 'slide-in-up'
    }).then((modal) => {
      this.privacy_policy_modal = modal;
    });

    $ionicModal.fromTemplateUrl('views/app/legal/terms-of-service.html', {
      scope: $scope,
      animation: 'slide-in-up'
    }).then((modal) => {
      this.terms_of_service_modal = modal;
    });

  }

  facebookSignIn() {
    console.log("doing facebook sign in");
    this.$state.go('app.feed');
  };

  showPrivacyPolicy() {
    this.privacy_policy_modal.show();
  };

  showTerms() {
    this.terms_of_service_modal.show();
  };
}

class CreateAccountCtrl {

  $inject = ['$scope', '$state']



  constructor(protected $scope, protected $state) {
    $scope.vm = this;
  }

  doSignUp(user) {
    console.log("doing sign up");
    console.log(user);
    this.$state.go('app.feed');
  };
}

class WelcomeBackCtrl {

  $inject = ['$scope', '$state', '$ionicModal'];
  forgot_password_modal: ionic.modal.IonicModalController;

  constructor($scope, protected $state, $ionicModal) {


    $ionicModal.fromTemplateUrl('views/auth/forgot-password.html', {
      scope: $scope,
      animation: 'slide-in-up'
    }).then((modal) => {
      this.forgot_password_modal = modal;
    });

    $scope.vm = this;



    // //Cleanup the modal when we're done with it!
    // $scope.$on('$destroy', function() {
    //   $scope.modal.remove();
    // });
    // // Execute action on hide modal
    // $scope.$on('modal.hidden', function() {
    //   // Execute action
    // });
    // // Execute action on remove modal
    // $scope.$on('modal.removed', function() {
    //   // Execute action
    // });
  }

  doLogIn(user) {
    console.log("doing log in");
    console.log(user);
    this.$state.go('app.feed');
  };

  showForgotPassword() {
    this.forgot_password_modal.show();
  };

  requestNewPassword() {
    console.log("requesting new password");
  };
}

class ForgotPasswordCtrl {

  $inject = ['$scope'];

  constructor($scope) {

  }
}

angular.module('greencity.auth.controllers', [])


  .controller('WelcomeCtrl', WelcomeCtrl)

  .controller('CreateAccountCtrl', CreateAccountCtrl)

  .controller('WelcomeBackCtrl', WelcomeBackCtrl)

  .controller('ForgotPasswordCtrl', ForgotPasswordCtrl)

  ;
