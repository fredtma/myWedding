'use strict'
angular.module('userManager.controllers', [])
    .controller('dashCtrl', dashCtrl)
    .controller('groupCtrl', groupCtrl)
    .controller('groupsCtrl', groupsCtrl)
    .controller('usersCtrl', usersCtrl);

dashCtrl.$inject=['$scope','serveGroup'];
function dashCtrl($scope, serveGroup) {
    $scope.settings = {offline:true,gps:true,filesystem:false,notification:false};
    $scope.model    = {groups:serveGroup.all()};
}

groupCtrl.$inject=['$scope','$stateParams', 'serveGroup'];
function groupCtrl($scope, $stateParams, serveGroup) {
    $scope.module= {};
    $scope.model = serveGroup.get($stateParams.Id);
    $scope.module.getUpload = function(){};
}

groupsCtrl.$inject=['$scope','serveGroup'];
function groupsCtrl($scope, serveGroup) {
    //$scope.$on('$ionicView.enter', function(e) {});
    $scope.models = serveGroup.all();
    $scope.remove = function(id) {serveGroup.remove(id);}
}

usersCtrl.$inject=['$scope'];
function usersCtrl($scope) {
    $scope.settings = {enableFriends: true};
}