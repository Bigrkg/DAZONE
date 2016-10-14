	    var scotchApp = angular.module('scotchApp', ['ngRoute']);
        
       
		// configure our routes
		
		/**
               we should pass $routeProvider into function if we have to compress the file
		**/
		scotchApp.config(function($routeProvider,$locationProvider) {
			$routeProvider

				// route for the home page
				.when('/', {	
					templateUrl : 'pages/home.html',
					controller  : 'mainController'
				})

				// route for the about page
				.when('/about', {
					templateUrl : 'pages/about.html'
				});
				//check browser support
		        if(window.history && window.history.pushState){
		            //$locationProvider.html5Mode(true); will cause an error $location in HTML5 mode requires a  tag to be present! Unless you set baseUrl tag after head tag like so: <head> <base href="/">

		         // to know more about setting base URL visit: https://docs.angularjs.org/error/$location/nobase

		         // if you don't wish to set base URL then use this
		         $locationProvider.html5Mode({
		                 enabled: false,
		                 requireBase: false
		          });
		        }
		});
		// create the controller and inject Angular's $scope
		scotchApp.controller('mainController', function($scope) {
			// create a message to display in our view
			$scope.message = 'Everyone come and see how good I look!';
              
		});
        
		