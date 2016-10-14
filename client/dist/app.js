

var scotchApp = angular.module('scotchApp', ['ngRoute','ngResource','scotchAppServices']);


scotchApp.controller('headerCtrl',['$scope', '$window','$http','$location','search', function($scope, $window, $http, $location, search) {
        
    $scope.myFunction = function() {
        var x = document.getElementById("demo");
        if (x.className.indexOf("w3-show") == -1) {
            x.className += " w3-show";
            }
        else {
            x.className = x.className.replace(" w3-show", "");
        }
    }              
}]);


				 
      scotchApp.controller('myWishlistCtrl', ['$scope', '$http', function($scope, $http){

             getMyWishlistData = function(){
             $http.get('/api/account/settings')
             .success(function(response){
              console.log(response);
              $scope.name = response.account.shortListedData.products.name;
              console.log(response.account.shortListedData.products.name);
              $scope.wishlistData = response.account.shortListedData.products;
             })
             .error(function(response){
              console.log(response);
             })
             };

           $scope.getRowClass = function(index){
           if((index+1)%3 ==0){return "row";} 
          };

          $scope.$on('$viewContentLoaded', getMyWishlistData());
      }]);





        scotchApp.controller('bluePrintListingCtrl', ['$scope', '$http', function($scope, $http){
              $('#divlist h5').click(function() {
              $(this).find("i.glyphicon").toggleClass("glyphicon-minus-sign glyphicon-plus-sign");
                });
          }]);



         scotchApp.factory('search', function(){
          var searchL = '';
          return{
            getSearchString: function(){
              return searchL;
            },
            setSearchString: function(val){
              search = val;
            }
          };
         });
          
          

      scotchApp.controller('shopListingCtrl', ['$scope', '$http', 'search', function($scope, $http, search){

       // vipin
 
       function calc_total(){
       var sum = 0;
       $('.input-amount').each(function(){
        sum += parseFloat($(this).text());
      });
      $(".preview-total").text(sum);    
      }
      $(document).on('click', '.input-remove-row', function(){ 
      var tr = $(this).closest('tr');
      tr.fadeOut(200, function(){
      tr.remove();
      calc_total()
      });
       });

      $(function(){
      $('.preview-add-button').click(function(){
        var form_data = {};
        form_data["concept"] = $('.payment-form input[name="concept"]').val();
        form_data["description"] = $('.payment-form input[name="description"]').val();
        form_data["amount"] = parseFloat($('.payment-form input[name="amount"]').val()).toFixed(2);
        form_data["status"] = $('.payment-form #status option:selected').text();
        form_data["date"] = $('.payment-form input[name="date"]').val();
        form_data["remove-row"] = '<span class="glyphicon glyphicon-remove"></span>';
        var row = $('<tr></tr>');
        $.each(form_data, function( type, value ) {
            $('<td class="input-'+type+'"></td>').html(value).appendTo(row);
        });
        $('.preview-table > tbody:last').append(row); 
        calc_total();
      });  
      });
       // end vipin


        $scope.toggleWait = function(wait){
          $scope[wait] = !($scope[wait]);
        }
        $scope.productLoadWait = false;
        $scope.productPageLoadWait = false;
        $scope.currentPage = 1;
        $scope.totalPages = null;
        $scope.productLimit = 15;
        $scope.viewMoreStatus = false;
          $scope.productData = [];
          $scope.query = search.getSearchString();
          // console.log($scope.query);
          
          $scope.loadData = function(productLimit,currentPage,query){
            // console.log(currentPage);
            $http({
            method: 'GET',
            url: '/api/products',
            cache: true,
            params: {
              spin: $scope.toggleWait('productLoadWait'),
              limit: productLimit,
              page: currentPage,
              name: query
            }
          }).then(function(resp){
            $scope.toggleWait('productLoadWait');
            // console.log(resp,'rajiv');
            $scope.productData = $scope.productData.concat(resp.data.data);
            console.log($scope.productData);
             // console.log($scope.productData.price, 'vipinnnnnnnnnn');
            $scope.totalPages = resp.data.pages.total;
            if($scope.currentPage<$scope.totalPages){
              $scope.currentPage = $scope.currentPage +1;
            }
            else{
              $scope.viewMoreStatus = true;
            }
          }, function(err){
            console.log(err);
          });
          }
          //for applying row class //bootstrap
          $scope.getRowClass = function(index){
           if((index+1)%3 ==0){return "row";} 
          };

          // $scope.addToIdeaBook = function(id){
          //   console.log($scope.loggedIn);
          //   $http({
          //     method: 'PUT',
          //     url: '/api/products/a/shortlist/' +id +'/a'
          //   }).then( function(resp){
          //     console.log(resp);
          //   }, function(err){});
          // }
       
        
        $scope.$on('$viewContentLoaded', $scope.loadData($scope.productLimit,$scope.currentPage,$scope.query));
      }]); //shop Listing Control Ends..

      scotchApp.directive('productListView', function(){
        // Runs during compile
        return {
          restrict: 'E',
          scope: {
            product: '='
          },
          controller: function($scope,$http,$window) { 

            $scope.addToIdeaBook = function(id){
              console.log($window.localStorage.isLoggedIn);
              if($window.localStorage.isLoggedIn == 'true'){
                alert("sdf");
                $http({
                method: 'PUT',
                url: '/api/products/a/shortlist/' +id +'/a'
                })
                .then( function(resp){
                console.log(resp);
                if(resp.data.success){
                shortListed = true;                
               }
              }, function(err){});
          }
           if($window.localStorage.isLoggedIn === 'false'){
               alert('hgfgidsfgi');
               $(function(){

               $( "#code" ).on('show', function(){
               alert("Show!");
               });
               $( "#code" ).on('shown', function(){
               alert("Shown!");
               });

               });
           }
        }
        


           $scope.delClass = function(){
            // console.log($scope.product);
            if($scope.product.cronData.attributes.general.effectivePrice.amount){
              return "del";
            }
           }
         
          var effectivePrice = $scope.product.cronData.attributes.general.effectivePrice.amount;
          if(effectivePrice){
            $scope.ePrice = effectivePrice;
          };

          var discount = $scope.product.cronData.attributes.general.discount;
            if(discount){
              $scope.disc = discount;
            };

            var shortListed = false;
            $scope.isShortListed = function(){
              if(shortListed){
                return "glyphicon glyphicon-heart"
              }
              else{
                return "glyphicon glyphicon-heart-empty"
              }
            }

          },
          templateUrl: '/templates/product-list-view.tmpl.html'
          // name: '',
          // priority: 1,
          // terminal: true,
          // scope: {}, // {} = isolate, true = child, false/undefined = no change
          // controller: function($scope, $element, $attrs, $transclude) {},
          // require: 'ngModel', // Array = multiple requires, ? = optional, ^ = check parent elements
          // restrict: 'A', // E = Element, A = Attribute, C = Class, M = Comment
          // template: '',
          // templateUrl: '',
          // replace: true,
          // transclude: true,
          // compile: function(tElement, tAttrs, function transclude(function(scope, cloneLinkingFn){ return function linking(scope, elm, attrs){}})),
          // link: function($scope, iElm, iAttrs, controller) {
            
          // };
        };
      });



      scotchApp.controller('blueprintsListingCtrl', ['$scope', '$http', 'search','$window', function($scope, $http, search,$window){

        console.log($window.localStorage.isLoggedIn);
          
          $scope.toggleWait = function(wait){
          $scope[wait] = !($scope[wait]);
          }
          $scope.blueprintLoadWait = false;
          $scope.blueprintPageLoadWait = false;
          $scope.currentPage = 1;
          $scope.totalPages = null;
          $scope.blueprintLimit = 15;
          $scope.viewMoreStatus = false;
          $scope.blueprintData = [];
          $scope.query = search.getSearchString();

          $scope.loadData = function(blueprintLimit,currentPage,query){
            $http({
            method: 'GET',
            url: '/api/blueprints?populate[0][path]=photoGallery&populate[0][select]=fileUrl',
            cache: true,
            params: {
              spin: $scope.toggleWait('blueprintLoadWait'),
              limit: blueprintLimit,
              page: currentPage,
              name: query
            }
          }).then(function(resp){
            console.log(resp,'vipinnnn');
            $scope.toggleWait('blueprintLoadWait');
            $scope.blueprintData = $scope.blueprintData.concat(resp.data.data);
            console.log($scope.blueprintData,'rajiv+vipin');
            // console.log(blueprintData.name);
            $scope.totalPages = resp.data.pages.total;
            if($scope.currentPage<$scope.totalPages){
              $scope.currentPage = $scope.currentPage +1;
            }
            else{
              $scope.viewMoreStatus = true;
            }
          }, function(err){
            console.log(err);
          });
          }
          //for applying row class //bootstrap
          $scope.getRowClass = function(index){
           if((index+1)%3 ==0){return "row";} 
          };

          // $scope.addToIdeaBook = function(id){
          //   $http({
          //     method: 'PUT',
          //     url: '/api/blueprints/a/shortlist/' +id +'/a'
          //   }).then( function(resp){
          //     console.log(resp);
          //   }, function(err){});
          // }
        $scope.$on('$viewContentLoaded', $scope.loadData($scope.blueprintLimit,$scope.currentPage,$scope.query));
      }]); //shop Listing Control Ends..

      scotchApp.directive('blueprintListView', function(){
        // Runs during compile
        return {
          restrict: 'E',
          scope: {
            blueprint: '='
          },
          controller: function($scope,$http,$window) {

            $scope.addToIdeaBook = function(id){
            //   if($window.localStorage.isLoggedIn == 'true'){
            //   alert('true');
            $http({
              method: 'PUT',
              url: '/api/blueprints/a/shortlist/' +id +'/a'
            }).then( function(resp){
              console.log(resp);
              if(resp.data.success){
              shortListed = true;                
              }
            }, function(err){});
          // };
        };
    //     if($window.localStorage.isLoggedIn == 'false'){
    //      alert('dfhgjhgjg');  
    // }

          //  $scope.delClass = function(){
          //   if($scope.product.cronData.attributes.general.effectivePrice.amount){
          //     return "del";
          //   }
          //  }
         
          // var effectivePrice = $scope.product.cronData.attributes.general.effectivePrice.amount;
          // if(effectivePrice){
          //   $scope.ePrice = effectivePrice;
          // };

          // var discount = $scope.product.cronData.attributes.general.discount;
          //   if(discount){
          //     $scope.disc = discount;
          //   };

            var shortListed = false;
            $scope.isShortListed = function(){
              if(shortListed){
                return "glyphicon glyphicon-heart"
              }
              else{
                return "glyphicon glyphicon-heart-empty"
              }
            }

          },
          templateUrl: '/templates/blueprint-list-view.tmpl.html'
        };
      });
     

     




      scotchApp.controller('shopDetailCtrl', ['$scope', '$http', '$routeParams', function($scope, $http, $routeParams){
        $scope.productId = $routeParams.productId;
        $scope.categoryId = $routeParams.categoryId;

        $scope.loadProductData = function(productId){
          $http({
            method: 'GET',
            url: '/api/products/' + productId,
            params: {}
          }).then(function(resp){
            console.log(resp);
            $scope.price = resp.data.price;
            $scope.productDetailData=resp.data;
            
            $scope.productTitle = function(){
          if($scope.productDetailData.title){
            return $scope.productDetailData.title;
          }
          else{
            return $scope.productDetailData.cronData.title;
          }
        };

        $scope.productCategory = function(){
          if($scope.productDetailData.categoryLevel[0]){
            return $scope.productDetailData.categoryLevel[$scope.productDetailData.categoryLevel.length-1];
          }
          else{
            return $scope.productDetailData.cronData.subCategoryName;
          }
        };

        $scope.productDescription = function(){
          if($scope.productDetailData.description){
            return $scope.productDetailData.description;
          }

          else{
            return $scope.productDetailData.cronData.description;
          }
        };

        $scope.attributeValues = function(arr){
          return arr.toString();
        };

          }//success function ends
          , function(err){
            console.log(err);
          });
        }

         $scope.$on('$viewContentLoaded', $scope.loadProductData($scope.productId));
        }]);




        scotchApp.controller('blueprintsDetailCtrl', ['$scope', '$http', '$routeParams', function($scope, $http, $routeParams){

        // default init
//$(function () {
//  $('[data-toggle="popover"]').popover()
//})

$("#btn-share").popover({
       html : true, 
       container : '#btn-share',
       content: function() {
       return $('#popoverExampleHiddenContent').html();
       },
       template: '<div class="popover" role="tooltip"><div class="popover-content"></div></div>'
       });
       $(document).click(function (event) {
       // hide share button popover
       if (!$(event.target).closest('#btn-share').length) {
            $('#btn-share').popover('hide')
        }
       });

// $("a.twitter").attr("href", "https://twitter.com/home?status=" + window.location.href);
// $("a.facebook").attr("href", "https://www.facebook.com/sharer/sharer.php?u=" + window.location.href);
// $("a.google-plus").attr("href", "https://plus.google.com/share?url=" + window.location.href);
 
        $scope.blueprintId = $routeParams.id;
        $scope.loadBlueprintData = function(blueprintId){
          $http({
            method: 'GET',
            url: '/api/blueprints/' + blueprintId,
            params: {}
          }).then(function(response){
                console.log(response);
                var photoUrl = response.data.photoGallery[0].fileUrl;
                $scope.blueprint = response.data;
                var ShareUrl = response.data.photoGallery[0].fileUrl;
                var ShareTitle = response.data.name;

                      $("a").click(function() {
                      alert(this.id);
                     

                        var index = $(this).index();
                        // var index = ($(this).attr('class').split(' ')[0]).split('_')[1];
                        
                        

                        switch(index){
                         case 'fb':
                         fbshare(ShareUrl,ShareTitle);
                         break;
                        
                         case 'twt':
                         twtshare(ShareUrl,ShareTitle);
                         break;
                         
                         case 'gplus':
                         gpshare(ShareUrl);
                         break;
                         
                         case 'reddit':
                            reddit(ShareUrl,ShareTitle);
                         break;
                        };

                         });

                        function twtshare(u,t) {
                        t = t;
                        window.open('https://twitter.com/intent/tweet?url=' + ShareUrl+ '&text=' + ShareTitle + '&via=bi_india', 'sharer', 'toolbar=0,status=0,width=626,height=436,scrollbars=1');
                        return false;
                        }

        /**
         * gPlus Share
         */
                        function gpshare(u) {
                        window.open('https://plus.google.com/share?url=' + ShareUrl + 'sharer', 'toolbar=0,status=0,width=626,height=436,scrollbars=1');
                        return false;
                        }

        /**
         * linkedin Share
         */
                        function linkedinshare(u) {
                        window.open('http://www.linkedin.com/cws/share?url=' + ShareUrl + 'sharer', 'toolbar=0,status=0,width=626,height=436,scrollbars=1');

                        return false;
                        }

        /**
         * fb Share
         */
                        function fbshare(u,t) {
                        window.open('https://www.facebook.com/sharer.php?u=' + ShareUrl + '&t=' + ShareTitle, 'sharer', 'toolbar=0,status=0,width=626,height=436,scrollbars=1');
                        return false;
                        }
          },function(error){
                console.log(error);
          })
          };
         $scope.$on('$viewContentLoaded', $scope.loadBlueprintData($scope.blueprintId));

        }]);



        scotchApp.controller('verifyEmailController',['$scope', '$http', '$location', '$window', '$routeParams', function($scope, $http, $location, $window, $routeParams){
          $http({
            method: 'PUT',
            url: "/api/signup/verify/" + $routeParams.email + "/" + $routeParams.token
          }).success(function(response){
            console.log(response);
          })
        }]);



            scotchApp.controller('myShortListCtrl',['$scope','$http', '$location', '$window', '$routeParams', function($scope, $http, $location, $window, $routeParams){
              $scope.template2 =  "templates/myShortList_All.html";
               $scope.settemplate = function(val){
                if(val == 'myShortList_All'){
                  $scope.template2 = 'templates/myShortList_All.html';
                }
                if(val == 'myShortList_Products'){
                  $scope.template2 = 'templates/myShortList_Products.html';
                }
                if(val == 'myShortList_Blueprints'){
                  $scope.template2 = 'templates/myShortList_Blueprints.html';
                }
               };
                }]);



            scotchApp.controller('myProfileCtrl',['$scope','$http', '$location', '$window', '$routeParams', function($scope, $http, $location, $window, $routeParams){
              $scope.template1 =  "templates/myProfileEdit.html";
               $scope.settemplate = function(val){
                if(val == 'myProfileEdit'){
                  $scope.template1 = 'templates/myProfileEdit.html';
                }
                if(val == 'myProfileEdit_login'){
                  $scope.template1 = 'templates/myProfileEdit_login.html';
                }
                if(val == 'myProfileEdit_contact'){
                  $scope.template1 = 'templates/myProfileEdit_contact.html';
                }
               };
              //  $scope.settemplate('myProfileEdit_login');
              //  $scope.settemplate = function(val){
              //   $scope.data = {};
              //   $http.get('/api/account/settings')
              //   .success(function(response){
              //     // $scope.data = response.about;
              //     console.log(response);
              //   })
              //   .error(function(response){
              //     console.log(response);
              //   })
              // };
             }]);



            scotchApp.controller('profileEditLoginCtrl',['$scope','$http', '$location', '$window', '$routeParams', function($scope, $http, $location, $window, $routeParams){
              $scope.myProfileEdit_login = {};
              $scope.onSubmit = function(){
                var password = document.getElementById("newPassword").value;
                var confirmPassword = document.getElementById("confirmNewPassword").value;
                 if (password != confirmPassword) {
                  $scope.invalidpass = "Passwords do not Match. ";
                 return false;
               };
                $http.put('/api/account/settings/login',$scope.myProfileEdit_login)
                .success(function(data, status, headers){
                  console.log(data);
                  if(data.success){
                    $scope.successMessage = "Successfully Saved !!!"
                  }
                })
                .error(function(data, status, headers){
                  console.log(data);
                });
              };


              var getLoginData = function(){
                $http({
                  method: 'GET',
                  url: '/api/account/settings'
                }).then(function(response){
                  console.log(response);
                  $scope.loginData = response.data;
                }, function(){})
              }
              $scope.$on('$viewContentLoaded', getLoginData());
              //   var password = document.getElementById("txtPassword").value;
              //   var confirmPassword = document.getElementById("txtConfirmPassword").value;
              //   if (password != confirmPassword) {
                // alert("Passwords do not match.");
              //   return false;
              //   $scope.invalidpass = "Passwords do not Match. ";
              //   return false;
              //     if(data.success){
              //       $scope.message = "Password Successfully Changed !!! "
              //     }
              //   })
              
              }]);


             scotchApp.controller('myProfileEdit_contactCtrl',['$scope','$http', '$location', '$window', '$routeParams', function($scope, $http, $location, $window, $routeParams){
                $scope.contactData = {};
                
                $scope.onSubmit = function(){
                  $http.put('/api/account/settings/contact',$scope.contactData)
                  .success(function(data, status, headers){
                    
                    console.log(data);
                    if(data.success){
                    $scope.successMessage = "Successfully Saved!!!"
                  }
                  })
                  .error(function(data, status, headers){
                    console.log(data);
                  });
                };
                var getContactData = function(){
                $http({
                  method: 'GET',
                  url: '/api/account/settings'
                }).then(function(response){
                  console.log(response);
                  $scope.contactData = response.data.account.contact;
                }, function(){})
              }
              $scope.$on('$viewContentLoaded', getContactData());
                }]);



            scotchApp.controller('myProfileEditCtrl',['$scope','$http','$location','$rootScope', '$window', function($scope, $http, $location, $rootScope, $window){
                
                  $scope.day = '';
                  $scope.month = '';
                  $scope.year = '';
                  $scope.date = '';
                  
                 $scope.myProfileEdit = {};
                 
                 $scope.onSubmit = function(){
                  $scope.myProfileEdit.dateOfBirth = String($scope.day+ "-"+ $scope.month+ "-"+ $scope.year);
                   $http.put('/api/account/settings/basic',$scope.myProfileEdit)
                   .success(function(data, status, headers){
                    console.log(data);
                   })
                   .error(function(data, status, headers){
                    console.log(data);
                   });
                 };    
            }]);



             scotchApp.controller('profileEditcontactCtrl',['$scope','$http', '$location', '$window', '$routeParams', function($scope, $http, $location, $window, $routeParams){
                $scope.cityOptions = ['gurgaon','delhi','banglore'];
                $scope.city = 'noida';

                $scope.localityOptions = ['delhi','noida','gurgaon'];
                $scope.locality = 'delhi';

                $scope.putContactProfile = function(){
                  var data = {
                              "phone" : $scope.phone,
                              "city" : $scope.city,
                              "locality" : $scope.locality,
                              "address" : $scope.password,
                              "email" : $scope.email
                  };
                  $http.put('/api/account/settings/contact',data)
                  .success(function(data, status, headers){
                    $scope.message = "Contact Updated Successfully !!!"
                    console.log(data);
                  })
                  .error(function(data, status, headers){
                    console.log(data)
                  })
                };
                }]);





              scotchApp.controller('basicProfileCtrl',['$scope','$http', '$location', '$window', '$routeParams', function($scope, $http, $location, $window, $routeParams){
                
                    $scope.dayOptions = ["01","02","03","04","05","06","07","08","09","10","11","12","13","14","15","16","17","18","19","20","21","22","23","24","25","26","27","28","29","30","31"];
                    $scope.day = "01";

                    $scope.month = "1980";

                    $scope.yearOptions = ["1980","1981","1982","1983","1984","1985","1986","1987","1989","1999","2000","2001","2002","2003","2004","2005","2006","2007","2008","2009","2010","2011","2012","2013","2014","2015","2016"];
                    $scope.year = "1980";

                    var e = document.getElementById("month");
                    var myMonth = e.options[e.selectedIndex].value;
                    var dob = $scope.day + '-' + myMonth + '-' + $scope.year;

                    $scope.genderOptions = ["male","female"];
                    $scope.gender = "male";

                $scope.putBasicProfile = function () {
                var data = {
                            "about": $scope.about,
                            "dateOfBirth": dob,
                            "gender": $scope.gender,
                            "customername": $scope.displayName,
                            "first": $scope.firstName,
                            "last": $scope.lastName
                           };
                $http.put('/api/account/settings/basic', data)
                .success(function(data, status, headers){
                  console.log(data);
                  if(data.success){
                    $scope.message = "Successfully Saved!!!"
                  }
                  })
                .error(function(data, status, headers){
                  console.log(data);
                })        
              };
             }]);





             scotchApp.controller('my_profile_edit_ctrl',['$scope','$http', '$location', '$window', '$routeParams', function($scope, $http, $location, $window, $routeParams){
              $scope.template =  "templates/myProfileEdit_myProfile.html";
            $scope.settemplate = function(val){
              if(val =='myProfileEdit_myProfile'){
              $scope.template = "templates/myProfileEdit_myProfile.html";
             }
              if(val=='myShortList') {
              $scope.template = "templates/myShortList.html";
             }
              if(val == 'myProfileEdit') {
              $scope.template = "templates/myProfileEdit.html";
              }
             // if(val == 'blueprints') {
             //  $scope.template = "templates/blueprints.html";
             // }
             // if(val == 'cron') {
             //  $scope.template = "templates/cron.html";
             // }
           };
              }]);   
           






            scotchApp.controller('loginCtrl',['$scope','$http','$location','$rootScope', '$window', function($scope, $http, $location, $rootScope, $window){
               $scope.loggedIn= false;
                $window.localStorage.isLoggedIn = false;
                $scope.timeout = 3000;
                $scope.closeAlert = function(){
                  $scope.emailRequired =false;
                  $scope.passwordRequired =false;
                }
                $scope.type = 'danger';
                $scope.postData = function() {

                var data = {
                  email: $scope.email,
                  password: $scope.password 
                };

                
        
                $http.post('/api/login', data)
                .success(function (data, status, headers){
                  console.log(data);
                  
                  $scope.loginError = data.errors[0];
                  $scope.emailRequired = data.errfor.email;
                  $scope.passwordRequired = data.errfor.password;
                  $scope.loggedIn = data.success;
                  console.log($scope.loggedIn);
                  if($scope.loggedIn){
                    $scope.loggedIn = true;
                     $window.localStorage.isLoggedIn = $scope.loggedIn;
                     $location.path('/');
                  };
                })
                .error(function(data, status, header) {
                  console.log(data);
                });
               };
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
 
(function() {
  'use strict';

  angular.module('MyApp',['ngMaterial', 'ngMessages', 'material.svgAssetsCache'])
    .controller('DemoCtrl', function() {
      this.topDirections = ['left', 'up'];
      this.bottomDirections = ['down', 'right'];

      this.isOpen = false;

      this.availableModes = ['md-fling', 'md-scale'];
      this.selectedMode = 'md-fling';

      this.availableDirections = ['up', 'down', 'left', 'right'];
      this.selectedDirection = 'up';
    });
})();


/**
Copyright 2016 Google Inc. All Rights Reserved. 
Use of this source code is governed by an MIT-style license that can be in foundin the LICENSE file at http://material.angularjs.org/license.
**/