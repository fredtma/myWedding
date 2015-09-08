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
    serveGroup.get($stateParams.Id).then(function(response){
        $scope.model = response;
    });
    $scope.module.getUpload = function(){};
}

groupsCtrl.$inject=['$scope', 'serveGroup', 'fireDB'];
function groupsCtrl($scope, serveGroup, fireDB) {
    //$scope.$on('$ionicView.enter', function(e) {});
    serveGroup.all.then(function(response){
        $scope.models = response;
    });
    $scope.remove = function(id) {serveGroup.remove(id);}
}

usersCtrl.$inject=['$scope'];
function usersCtrl($scope) {
    $scope.settings = {enableFriends: true};
}