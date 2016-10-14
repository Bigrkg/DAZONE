scotchApp.controller('userCtrl',['$scope', '$window','$location','user', function($scope, $window,$location,user) {
        
    $scope.submit = function() {

    	console.log($scope.user);
    	//user.getData($scope.user);
    }              
}]);