 

          scotchApp.config(function($routeProvider,$locationProvider) {
    			$routeProvider
    				// route for the home page
    				.when('/', {	 
    					templateUrl : 'pages/home.html',
              controller :  'userCtrl'
    				})
            .when('/booking', {   
              templateUrl : 'templates/booking.html'
            })
            .when('/afterSignUpMessage', {   
              templateUrl : 'templates/afterSignUpMessage.html'
            })
            .when('/my_profile_edit', {   
              templateUrl : 'pages/my_profile_edit.html',
              controller : 'my_profile_edit_ctrl'
            })
            .when('/afterResetPassword', {   
              templateUrl : 'templates/afterResetPassword.html'
            })
            .when('/loginPage', {   
              templateUrl : 'templates/loginPage.html',
              controller : 'loginCtrl'
            })
            .when('/login/:email/:token', {   
              templateUrl : 'templates/emailVerify.html',
              controller : 'verifyEmailController'
            })
    				.when('/aboutUs', {
    					templateUrl : 'templates/aboutUs.html'
    				})
            .when('/login', { 
    					templateUrl : 'pages/login.html',
    					controller : 'loginController'
    				})
            .when('/loggedUser',{
              templateUrl : 'pages/loggedUser.html'
              // controller : 'loggedUserController'
            })
    	      .when('/contactUs', {
    					templateUrl : 'templates/contactUs.html'
    				})
    				.when('/trailMap',{
              templateUrl : 'pages/trailMap.html'
            })
            .when('/activities',{
              templateUrl : 'pages/activities.html'
    				})
    				.when('/resetPassword/:email/:token',{
    					templateUrl : 'pages/resetPassword.html',
    					controller : 'resetPasswordController'
    				})
           .when("/professionals",{
            templateUrl:"templates/professionals.html"
            })
           .when("/shopListing",{
            templateUrl:"templates/shopListing.html",
            controller: 'shopListingCtrl'
            })
           .when("/storiesListing",{
            templateUrl:"templates/storiesListing.html"
            })
           .when("/storiesDetail",{
            templateUrl:"templates/storiesDetail.html"
            })
           .when("/blueprintsDetail/:id",{
            templateUrl:"templates/blueprintsDetail.html",
            controller : 'blueprintsDetailCtrl'
            })
           .when("/blueprintsListing",{
            templateUrl:"templates/blueprintsListing.html",
            controller: 'blueprintsListingCtrl'
            })
            .when("/catalog/category",{
             templateUrl:"templates/catalog.html",
             controller : "catalogCtrl"
            })
           .when("/looksDetail",{
            templateUrl:"templates/looksDetail.html"
            })
            .when("/catalogEditPage/:id/:id2",{
             templateUrl:"templates/catalogEditPage.html"
            })
            .when("/styleListing",{
             templateUrl:"templates/styleListing.html"
            })
            .when("/proListing",{
              templateUrl : "templates/proListing.html"
            })
            .when("/productsHome",{
              templateUrl : "templates/productsHome.html"
            })
            .when("/proDetails",{
              templateUrl : "templates/proDetails.html",
              controller: 'proDetailsCtrl'
            })
            .when("/looksListing",{
              templateUrl : "templates/looksListing.html"
            })
            .when("/myProfileEdit",{
              templateUrl : "templates/myProfileEdit.html"
            })
            .when("/myIdeaBook",{
              templateUrl : "templates/myIdeaBook.html"
            })
            .when("/myIdeaBookSingle",{
              templateUrl : "templates/myIdeaBookSingle.html"
            })
            .when("/proPortfolioNew",{
              templateUrl : "templates/proPortfolioNew.html"
            })
            .when("/proPortfolioSingleUpload",{
              templateUrl : "templates/proPortfolioSingleUpload.html"
            })
            .when("/test",{
              templateUrl : "templates/test.html"
            })
            .when("/shopDetails/:productId",{
              templateUrl : "templates/shopDetails.html",
              controller: 'shopDetailCtrl'
            })
            .when("/forgotYourPassword",{
              templateUrl : "pages/forgotYourPassword.html"
            })
            .when("/resetPassword",{
              templateUrl : "pages/resetPassword.html"
            })
            .when("/proSettings",{
              templateUrl : "templates/proSettings.html"
            })
            .when("/proQuestions",{
              templateUrl : "templates/proQuestions.html"
            })
            .when("/proSettingsEdit",{
              templateUrl : "templates/proSettingsEdit.html"
            })
            .when("/myPortfolio",{
              templateUrl : "templates/myPortfolio.html"
            })
            .when("/myWishlist",{
              templateUrl : "templates/myWishlist.html",
              controller : 'myWishlistCtrl'
            })
            
		        });