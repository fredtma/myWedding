'use strict'
angular.module('userManager.services', [])
    .service('helper', helper)
    .factory('serveGroup', serveGroup)
    .factory('fireDB', fireDB);

fireDB.$inject = ['$firebaseArray'];

function fireDB($firebaseArray) {

    var users = new Firebase("https://myweddinglist.firebaseio.com/users");
    var groups = new Firebase("https://myweddinglist.firebaseio.com/groups");
    return {
        users: $firebaseArray(users),
        groups: $firebaseArray(groups)
    }
}

function helper() {
    var that = this;

    this.getPicture = getPicture;

    /**
     * support to take a picture from a browser or native device
     * @param {type} <var>e</var> the event variable, if browser will contain the field type
     * @param {type} <var>field</var> the field that will be part of the main data fields (father)
     * @param {type} <var>filename</var> the name of the file that will appear on the
     * @returns {Boolean}
     */
    function getPicture(e, field, filename) {
        //native browser
        if (typeof navigator.camera === "undefined") {
            var file, reader;

            if (!e || (e.target.type !== 'file')) {
                iyona.msg("Camera option not available.", false, true);
                return false;
            }
            iyona.info("Loading browsing image...", 'blue');

            file = e.target.files[0]; //{name,size,type} take the first file
            if (!isset(file)) {
                iyona.msg("Camera option not available.", false, true);
                return false;
            } else if (file.type !== 'image/jpeg') {
                iyona.msg("Only Jpeg images are allowed");
                return false;
            } else if (file.size > 1000000) {
                iyona.msg("The selected file is larger than 1MB.");
                return false;
            }
            reader = new FileReader();
            //         reader.readAsBinaryString(file);//for binary
            reader.readAsDataURL(file);
            reader.onload = function (evt) {
                _$(".captureImg")[0].src = evt.target.result;

                $scope.$apply(function () {
                    $scope.father[field] = {
                        "alpha": evt.target.result,
                        "icon": filename || file.name,
                        "type": file.type
                    };
                });
                iyona.on('event', evt, $scope.father[field], '---', file);
            }
            $scope.formScope.dataForm.$dirty = true;
            return false;
        }
        var option = {
            "quality": 90,
            "destinationType": Camera.DestinationType.DATA_URL,
            "correctOrientation": true,
            "mediaType": Camera.MediaType.PICTURE,
            "sourceType": Camera.PictureSourceType.CAMERA,
            "cameraDirection": Camera.Direction.FRONT,
            "encodingType": Camera.EncodingType.JPEG
        };
        //mobile camera available
        navigator.camera.getPicture(successImg, failImg, option);

        function successImg(img) {
            iyona.on("Capturing image", 'purple', e);
            img = "data:image/jpeg;base64," + img;
            if (typeof e.target.src !== "undefined") e.target.src = img;
            else {
                _$(".captureImg")[0].src = img;
            }
            if (img > 1200000) {
                iyona.msg("The selected file is larger than 1MB.");
                return false;
            }
            $scope.father[field] = {
                "alpha": img,
                "icon": filename || "image.jpg",
                "type": "image/jpeg"
            };
            $scope.formScope.dataForm.$dirty = true;
        }

        function failImg(err) {
            $ionicPopup.alert({
                "title": "Image Capture",
                "template": "Could not capture the image::" + err
            }).then(function () {
                iyona.info("The image was not captured::" + err);
            });
        }
    }

}

serveGroup.$nject = ['fireDB', '$q'];

function serveGroup(fireDB, $q) {
    var serveGroup;

    return {
        all: fireDB.groups.$loaded(),
        remove: function (chat) {
            serveGroup.splice(serveGroup.indexOf(chat), 1);
        },
        get: function (Id) {
            var deferred = $q.defer(), promise=deferred.promise;
            fireDB.groups.$loaded().then(function (response) {                
                deferred.resolve(response.$getRecord(Id));
            }).catch(function(){ deferred.reject(false);});
            return promise;
        }
    };
}
