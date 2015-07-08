function imgTool(path){
    var deferred = $q.defer(), promise = deferred.promise;
    var img =  objSetValue($scope, path);

    var modalInstance = $modal.open({
        animation: true,
        templateUrl: 'auth/common/templates/modelImageLoad.html',
        controller: ['$scope', '$modalInstance', 'resolve', modalInstanceCtrl],
        size: 'lg',
        backdrop: 'static',
        resolve: {resolve: function(){ return {"img":img,"path":path}; }}
    });

    modalInstance.result.then(function (item) {
        $scope = $setScope;//scope was changed when changing img, now return the original scope
        objSetValue($scope, path, item.img);
        deferred.resolve(item.img);

    }, function () {
        console.info('Modal dismissed at: ' + new Date());
        deferred.reject(false);
    });
    //@fix: set the image width here, it's a fix for the model view changes the dimensions
    modalInstance.opened.then(function(opened){});

    modalInstance.rendered.then(function(opened){});

    function modalInstanceCtrl(scope, $modalInstance, resolve){

        scope.upload   = localUpload;
        scope.serve    = {"img":resolve.img, imgCropped:null};

        scope.ok = function () {
            objSetValue($scope,resolve.path, scope.serve.img);
            $modalInstance.close({img:scope.serve.img, file:scope.serve.file});
        };

        scope.cancel = function () {
            $modalInstance.dismiss('cancel');
        };

        scope.loadDone = function(){}

        function localUpload(file) {console.dir(file);
            uploads(file, 'serve.img', scope, {"accept": "images","regex":"image/(jpg|jpeg|png|gif)"});
            scope.serve.file = file;
        }
    }

    return promise;
}
