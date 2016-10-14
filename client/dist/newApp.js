	    var scotchApp = angular.module('scotchApp', ['ngRoute','ngResource','scotchAppServices']);
		

    		  scotchApp.config(function($routeProvider,$locationProvider) {
    			$routeProvider
    				// route for the home page
    				.when('/', {	 
    					templateUrl : 'pages/home.html'
    				})
            .when('/afterSignUpMessage', {   
              templateUrl : 'templates/afterSignUpMessage.html'
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
    				.when('/about', {
    					templateUrl : 'pages/about.html'
    				})
            .when('/login', { 
    					templateUrl : 'pages/login.html',
    					controller : 'loginController'
    				})
            .when('/loggedUser',{
              templateUrl : 'pages/loggedUser.html'
              // controller : 'loggedUserController'
            })
    	      .when('/contact', {
    					templateUrl : 'pages/contact.html'
    				})
    				.when('/signup',{
              templateUrl : 'pages/signup.html',
              controller : 'signUpController'
            })
            .when('/forgotPassword',{
              templateUrl : 'pages/forgotPassword.html',
              controller : "forgotPasswordController"
    				})
    				.when('/resetPassword/:email/:token',{
    					templateUrl : 'pages/resetPassword.html',
    					controller : 'resetPasswordController'
    				})
           .when("/professionals",{
            templateUrl:"templates/professionals.html"
            })
           .when("/shopListing",{
            templateUrl:"templates/shopListing.html"
            })
           .when("/storiesListing",{
            templateUrl:"templates/storiesListing.html"
            })
           .when("/storiesDetail",{
            templateUrl:"templates/storiesDetail.html"
            })
           .when("/blueprintsDetail",{
            templateUrl:"templates/blueprintsDetail.html"
            })
           .when("/blueprintsListing",{
            templateUrl:"templates/blueprintsListing.html"
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
            .when("/shopDetails",{
              templateUrl : "templates/shopDetails.html"
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
            
		        });



            scotchApp.controller('verifyEmailController',['$scope', '$http', '$location', '$window', '$routeParams', function($scope, $http, $location, $window, $routeParams){
              $http({
                method: 'PUT',
                url: "/api/signup/verify/" + $routeParams.email + "/" + $routeParams.token
              }).success(function(response){
                console.log(response);
              })
            }]);


            scotchApp.controller('headerCtrl',['$scope', '$window','$http','$location', function($scope, $window, $http, $location) {
              
              $window.localStorage.isLoggedIn = false;
              $scope.loggedIn;
              $scope.logOut = function(){
                 $http ({
                        method : "POST",
                        url : '/api/logout'
                       })
                      .then(function(response){
                        console.log(response);
                        if(response.data.success){
                          $window.localStorage.isLoggedIn = false;
                          $location.path('/');

                        }
                        else
                        {
                          $window.localStorage.isLoggedIn = true;
                        }
                      });

                      $scope.$watch('$window.localStorage.isLoggedIn', function(){
                        $scope.loggedIn = $window.localStorage.isLoggedIn;
                      });
                        
                        
                      // refresh();
              };
            }]);



       //    $scope.loggedIn = $window.localStorage.isLoggedIn;
       //    $scope.logOut = function (){
       //      $http({
       //      method: "POST",
       //      url: '/api/logout'
       //    }).then(function (response){
       //      console.log(response);
       //      if(response.data.success){
       //        //if success redirect to homepage
       //        $window.localStorage.isLoggedIn = false;
       //        $scope.loggedIn=false;
       //        $location.path('/');
                
       //      }
       //    });
       // };


            scotchApp.controller('loginCtrl',['$scope','$http','$location','$rootScope', '$window', function($scope, $http, $location, $rootScope, $window){
               
                $window.localStorage.isLoggedIn;
                $scope.timeout = 3000;
                $scope.closeAlert = function(){
                  $scope.emailRequired =false;
                  $scope.passwordRequired =false;
                }
                $scope.type = 'danger';
                $scope.data = {
                  email: $scope.email,
                  password: $scope.password 
                }
                $scope.postData = function(){
                  $http.post('/api/login', $scope.data)
                .success(function (data, status, headers){
                  console.log(data);
                  
                  $scope.loginError = data.errors[0];
                  $scope.emailRequired = data.errfor.email;
                  $scope.passwordRequired = data.errfor.password;
                  console.log(data.success);
                  if(data.success){
                     $window.localStorage.isLoggedIn = true;
                     $location.path('/');
                  };
                })
                .error(function(data, status, header) {
                  console.log(data);
                });
                }
                
                
               }]);


	                

                  scotchApp.controller('forgotPasswordCtrl',['$scope','$http','$location','$rootScope', '$window', function($scope, $http, $location, $rootScope, $window){
            		        $scope.btnText = "Reset Password";
                    $scope.postForgotPwdData = function (){
                      $scope.btnText = "Loading...";
                    $http({
                      method: "POST",
                      url: "/api/login/forgot",
                      data: {"email": $scope.email}
                    }).then(function (response){
                      console.log(response);
                      if(response.data.success){
                        $scope.btnText = "Please check your email.."
                      };
                      console.log(response.data.errfor.email);
                      $scope.forgot = response.data.errfor.email;
                      $scope.connectionErr = response.data.errors[0];  
                    }, 
                    function(response){
                      console.log(data);
                    })
                   }}]);


                     

                     scotchApp.controller('resetPwdCtrl',['$scope','$http','$location','$rootScope', '$window', '$routeParams',function($scope, $http, $location, $rootScope, $window,$routeParams){
                      var urlh = this;
                    var email = $routeParams.email;
                    var token = $routeParams.token;
                    $scope.ResetPwdStatus = "Reset";
                    urlh.url =  "/api/login/reset/"+email+"/"+token;
                    $scope.postResetFormData = function () {
                      $http({
                        method: "put",
                        url: urlh.url,
                        data: {"password":$scope.password,
                              "confirm": $scope.confirmPassword,
                              }
                      }).then(function (response){
                        console.log(response);
                        if(response.data.success){
                          //if success redirect to login page
                          $scope.ResetPwdStatus = response.data.success;
                          $location.path('/afterResetPassword');
                            
                        }
                        
                      }, function (response){
                        console.log(response);
                      })
                    };
                  }]);




		          scotchApp.controller('signUpController',['$scope','$http','signUp', '$rootScope', '$location', function($scope, $http,signUp, $rootScope, $location){
               
                
//wait icon
               $scope.mainWait = false;
               $scope.toggleWait = function(wait){
               $scope.mainWait = !($scope[wait]);
               console.log($scope[wait]);
               };
       //wait icon ends

                $scope.dayOptions = ["01","02","03","04","05","06","07","08","09","10","11","12","13","14","15","16","17","18","19","20","21","22","23","24","25","26","27","28","29","30","31"];
                $scope.day = "01";

                $scope.yearOptions = ["1980","1981","1982","1983","1984","1985","1986","1987","1989","1999","2000","2001","2002","2003","2004","2005","2006","2007","2008","2009","2010","2011","2012","2013","2014","2015","2016"];
                $scope.year = "1980";

                var e = document.getElementById("month");
                var myMonth = e.options[e.selectedIndex].value;
                // console.log(e.options[2].value);

                var dob = $scope.day + '-' + myMonth + '-' + $scope.year;
                // console.log(dob);
                

                // $scope.signUpData = {};
                // $scope.display = function(){
                //   console.log($scope.signUpData);
                // };

                $scope.genderOptions = ["male","female"];
                $scope.gender = "male";

                // $scope.location = {
                // locationSelect:null,
                // locationOption1:'noida'
                // };    

                $scope.checkbox = {
                value:false
                }; 

                $scope.locationOptions = ["delhi","noida"];
                $scope.location = "delhi";

            
                //  var d = $scope.date.dateSelect;
                
                // var dob = d + '-' + $scope.data.repeatSelect + '-' + $scope.year.yearSelect;
                // console.log(dob);          

              $("#pass").keyup(function(){
                var pass = $("#pass").val();                
                checkPassword(pass);
              });

              // strength

              $("#pass").change(function(){
                checkPassword(pass);
              });

              //Every distinct letter one point.
              function checkPassword(pass) {
                var score = 0;
                var count = 0;
                for(var i=0;i<pass.length;i++){
                  count = 0;
                  for(var j=0;j<pass.length;j++){
                    if(i==j){
                      continue;
                    }

                    if(pass[i] == pass[j]){
                      count = 1;
                    }                    
                  }

                  if(count == 0){
                    score++;
                  }
                }
                $("#strength").text(pass + " " +score);
                if(score >= 7 && score <=10){
                  $("#strength").text("Strenth : Medium");
                }
                else if(score<7){
                 $("#strength").text("Strenth : Low"); 
                }
                else{
                  $("#strength").text("Strenth : Excellent");
                }
              }

              $scope.postSignUpData = function () {
              var data = {
              "customername": $scope.displayName,
              "email": $scope.email,
              "password": $scope.password,
              "confirmPassword":$scope.signup.confirmPassword,
              "gender":$scope.gender,
              "city":$scope.location,
              "termsOfUse": $scope.checkbox.value,
              "dateOfBirth":dob
              };
              signUp.save({spin: $scope.toggleWait("mainWait")}, data).$promise.then(function(response){
                console.log(response);
                $scope.toggleWait("mainWait");
                 // console.log(response);
                 if(response.success){
                   $location.path('afterSignUpMessage');
                   $scope.signUpDataError = data.errors[0];
                   $scope.nameRequired = data.errfor.username;
                   $scope.emailRequired = data.errfor.email;
                   $scope.passwordRequired = data.errfor.password;
                 }
              }, function(err){
                console.log(err);
              });
              // $http.post('/api/signup', data)
              // .success(function (data, status, headers){
              //   console.log(data);
              //   $scope.signUpDataError = data.errors[0];
              //   $scope.nameRequired = data.errfor.username;
              //   $scope.emailRequired = data.errfor.email;
              //   $scope.passwordRequired = data.errfor.password;
              //   if(data.success){
              //     $location.path('/');
              //   }
              // })
              // .error(function (data, status, header){
              //   console.log(data);
              // });
              };
            }]);




            scotchApp.controller('proDetailsCtrl',['$scope', function($scope){
              $scope.show=false;
              $scope.setTab= function(){
                 $scope.show = !$scope.show;
              }

            }]);



        		scotchApp.controller("loginController",['$scope','$location','$http','$rootScope',function($scope,$location,$http,$rootScope){
			      $scope.loginButton = function(){
				    console.log($scope.login);
				    $http.post('/api/login',$scope.login)
				    .success(function(response){
            console.log(response);
            if(response.success == false){
            if(response.errfor.email == 'required' && response.errfor.password == 'required'){
             console.log(response.errfor.email);
             console.log(response.errors);
              $scope.warningEmail = "Email Required";
            $scope.warningPassword = "Password required"; 
            }
            if(response.errors[0] == "Username and password combination not found or your account is inactive."){
              $scope.error = "Invalid Email/Password"
            }
            }});
          // for not send user in the loggedPage by hitting the url /loggedUser
    //      if(response.success == true){
    //       $rootScope.loggedIn = true;
    //       $location.path('/login');
    //      } 
				// }).error(function(response){
    //                 console.log("loginButtonError");
    //                   $scope.loginError = response;
				// })
			
              $http.get('/api/current-user',$scope.login)
              .success(function(response){
                 console.log(response);
                 console.log(" get current user request");
                 
                 if(response.user == 'null' ){
                  $location.path('/loggedUser')
                 }
              })
              .error(function(reponse){
                console.log(response);
              });
            }}]);
            
        
            scotchApp.controller("forgotPasswordController",['$scope','$http',function($scope,$http){
            $scope.forgotLoginButton = function(){
        		console.log($scope.forgot);
        		$http.post("/api/login/forgot",$scope.forgot)
        		.success(function(response){
        			console.log(response);
        		}).error(function(response){
        			console.log("forgotPasswordError");
        		})
          	}
            }]);



            scotchApp.controller("resetPasswordController",['$scope','$http','$routeParams',function($scope,$http,$routeParams){
      	    $scope.resetButton = function(){
        		console.log($scope.reset);
        		console.log($routeParams.email);
        		console.log($routeParams.token);
        		$http.put("/api/login/reset/:email/:token",$scope.reset)
        		 .success(function(response){
        		 	console.log(response);
        		 })
             .error(function(response){
        		 	console.log("resetPasswordError");
        		 })
            }}]);
		


            // scotchApp.controller('attributeController',function($scope, $route, $routeParams) {
            // $scope.edit = function(SNo){
            // console.log(SNo);
            // }
            // });


            
            // scotchApp.controller('abc',function($scope,$route,$routeParams){
            // console.log($routeParams.id);
            // $scope.message = $routeParams.id;
            // $scope.message2 = $routeParams.id2;
            // });


            
            



            



            scotchApp.controller('catalogCtrl',function($scope){
            $scope.template =  "templates/category.html";
            $scope.settemplate = function(val){
              if(val =='cat'){
              $scope.template = "templates/category.html";
             }
              if(val=='atr') {
              $scope.template = "templates/attributeSets.html";
             }
             if(val == 'products') {
              $scope.template = "templates/productsHome.html";
             }
             if(val == 'blueprints') {
              $scope.template = "templates/blueprints.html";
             }
             if(val == 'cron') {
              $scope.template = "templates/cron.html";
             }
        }
        
        });

          
            
            
            /*$scope.attributeSets = function(){
              $scope.template = function(val){
              return "templates/attributeSets.html";
              
            }*/
            

            // scotchApp.controller('attributeSetsCtrl',function($scope){
            // $scope.template = function(){
            // return "templates/attributeSets.html";
            // }
            // });
 