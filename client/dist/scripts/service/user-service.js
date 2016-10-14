scotchApp.factory('user',['$http',function($http){

	var user = {};

	user.getData = function(user){

		$http({
			 
			method: 'POST',
			url: '',
			data: user			
		})

	};

	return user;


}]);