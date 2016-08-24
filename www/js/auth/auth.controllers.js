/// <reference path="../../typings/tsd.d.ts" />
var WelcomeCtrl = (function () {
    function WelcomeCtrl($scope, $state, $ionicModal) {
        var _this = this;
        this.$scope = $scope;
        this.$state = $state;
        this.$ionicModal = $ionicModal;
        this.bgs = ["img/welcome-bg.jpg"];
        $scope.vm = this;
        $ionicModal.fromTemplateUrl('views/app/legal/privacy-policy.html', {
            scope: $scope,
            animation: 'slide-in-up'
        }).then(function (modal) {
            _this.privacy_policy_modal = modal;
        });
        $ionicModal.fromTemplateUrl('views/app/legal/terms-of-service.html', {
            scope: $scope,
            animation: 'slide-in-up'
        }).then(function (modal) {
            _this.terms_of_service_modal = modal;
        });
    }
    WelcomeCtrl.prototype.facebookSignIn = function () {
        console.log("doing facebook sign in");
        this.$state.go('app.feed');
    };
    ;
    WelcomeCtrl.prototype.showPrivacyPolicy = function () {
        this.privacy_policy_modal.show();
    };
    ;
    WelcomeCtrl.prototype.showTerms = function () {
        this.terms_of_service_modal.show();
    };
    ;
    return WelcomeCtrl;
}());
var CreateAccountCtrl = (function () {
    function CreateAccountCtrl($scope, $state) {
        this.$scope = $scope;
        this.$state = $state;
        this.$inject = ['$scope', '$state'];
        $scope.vm = this;
    }
    CreateAccountCtrl.prototype.doSignUp = function (user) {
        console.log("doing sign up");
        console.log(user);
        this.$state.go('app.feed');
    };
    ;
    return CreateAccountCtrl;
}());
var WelcomeBackCtrl = (function () {
    function WelcomeBackCtrl($scope, $state, $ionicModal) {
        var _this = this;
        this.$state = $state;
        this.$inject = ['$scope', '$state', '$ionicModal'];
        $ionicModal.fromTemplateUrl('views/auth/forgot-password.html', {
            scope: $scope,
            animation: 'slide-in-up'
        }).then(function (modal) {
            _this.forgot_password_modal = modal;
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
    WelcomeBackCtrl.prototype.doLogIn = function (user) {
        console.log("doing log in");
        console.log(user);
        this.$state.go('app.feed');
    };
    ;
    WelcomeBackCtrl.prototype.showForgotPassword = function () {
        this.forgot_password_modal.show();
    };
    ;
    WelcomeBackCtrl.prototype.requestNewPassword = function () {
        console.log("requesting new password");
    };
    ;
    return WelcomeBackCtrl;
}());
var ForgotPasswordCtrl = (function () {
    function ForgotPasswordCtrl($scope) {
        this.$inject = ['$scope'];
    }
    return ForgotPasswordCtrl;
}());
angular.module('greencity.auth.controllers', [])
    .controller('WelcomeCtrl', WelcomeCtrl)
    .controller('CreateAccountCtrl', CreateAccountCtrl)
    .controller('WelcomeBackCtrl', WelcomeBackCtrl)
    .controller('ForgotPasswordCtrl', ForgotPasswordCtrl);
