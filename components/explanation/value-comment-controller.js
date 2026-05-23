/* Controllers */

var ndpFramework = angular.module('ndpFramework');

/* global ndpFramework */
ndpFramework.controller('ValueCommentController',
    function($scope,
             $modalInstance,
             $window,
             DHIS2URL,
             item,
             DocumentService) {

        $scope.item = item || {};
        $scope.comment = null;
        $scope.documents = {};
        $scope.loading = true;

        function loadAttachments(comment) {
            if (!comment || !comment.attachment || !comment.attachment.length) {
                return;
            }

            DocumentService.getMultiple(comment.attachment).then(function (docs) {
                $scope.documents = docs || {};
            });
        }

        $scope.comment = $scope.item.comment || null;
        loadAttachments($scope.comment);
        $scope.loading = false;

        $scope.downloadFile = function(path, e){
            if (path) {
                $window.open(DHIS2URL + path, '_blank', '');
            }
            if (e) {
                e.stopPropagation();
                e.preventDefault();
            }
        };

        $scope.close = function () {
            $modalInstance.close();
        };
    });
