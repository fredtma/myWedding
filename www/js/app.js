'use strict'
angular.module('userManager', ['ionic', 'userManager.controllers', 'userManager.services', 'ionic.service.core'])
.run(runFunction)
.config(configFunction);

runFunction.$inject = ['$ionicPlatform'];
function runFunction($ionicPlatform) {
  $ionicPlatform.ready(function() {
    if (window.cordova && window.cordova.plugins && window.cordova.plugins.Keyboard) {
      cordova.plugins.Keyboard.hideKeyboardAccessoryBar(true);
    }
    if (window.StatusBar) {
      StatusBar.styleLightContent();
    }
  });
}

configFunction.$inject = ['$stateProvider','$urlRouterProvider','$ionicAppProvider', '$ionicConfigProvider', '$compileProvider'];
function configFunction($stateProvider, $urlRouterProvider, $ionicAppProvider, $ionicConfigProvider, $compileProvider) {
    $ionicConfigProvider.templates.maxPrefetch(15);
    $ionicConfigProvider.views.maxCache(10);
    $compileProvider.imgSrcSanitizationWhitelist(/^\s*(https?|ftp|file|blob|content):|data:image\//);

    $ionicAppProvider.identify({
        app_id: '3b9e7946',
        api_key: '1d534a2b358b4d007e60b4c31d9731adc899caf5dd1142af'
        // gcm_id: 'The GCM project ID (project number) from your Google Developer Console (un-comment if used)'
    });

    $stateProvider
          .state('tab', {
            url: "/tab",
            abstract: true,
            templateUrl: "pages/tabs.html"
          })
          .state('tab.dash', {url: '/dash',views: {'tab-dash': {templateUrl: 'pages/tab-dash.html',controller: 'dashCtrl'}}})
          .state('tab.groups', {url: '/groups',views: {'tab-groups': {templateUrl: 'pages/groups/groups.html',controller: 'groupsCtrl'}}})
          .state('tab.group', {url: '/group/:Id',views: {'tab-groups': {templateUrl: 'pages/groups/group.html',controller: 'groupCtrl'},cache:false}})
          .state('tab.users', {url: '/users',views: {'tab-users': {templateUrl: 'pages/tab-account.html',controller: 'usersCtrl'}}});
    $urlRouterProvider.otherwise('/tab/dash');

}