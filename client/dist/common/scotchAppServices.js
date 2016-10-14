"use strict";
var scotchAppServices = angular.module('scotchAppServices', ['ngResource']);

scotchAppServices.config(['$resourceProvider', function($resourceProvider) {
 // Don't strip trailing slashes from calculated URLs
 $resourceProvider.defaults.stripTrailingSlashes = false;
}]);

scotchAppServices.factory('signUp', ['$resource', function($resource){
    return $resource('/api/signup', {/*paramDefaultts*/}, {/*actions*/
        query: { method: 'GET', isArray: false }
    } /*,options*/);
}]);

scotchAppServices.factory('login', ['$resource', function($resource){
    return $resource('/api/login/', {/*paramDefaultts*/}, {/*actions*/
        query: { method: 'GET', params: {setId: ''}, isArray: false }
    } /*,options*/);
}]);

scotchAppServices.factory('currentUser', ['$resource', function($resource){
    return $resource('/api/current-user/', {/*paramDefaultts*/}, {/*actions*/
        query: { method: 'GET', params: {setId: ''}, isArray: false }
    } /*,options*/);
}]);

scotchAppServices.factory('forgotPassword', ['$resource', function($resource){
    return $resource('/api/login/forgot/', {/*paramDefaultts*/}, {/*actions*/
        query: { method: 'GET', params: {setId: ''}, isArray: false }
    } /*,options*/);
}]);

scotchAppServices.factory('resetPassword', ['$resource', function($resource){
    return $resource('/api/login/reset/:email/:token', {/*paramDefaultts*/}, {/*actions*/
        query: { method: 'GET', params: {setId: ''}, isArray: false }
    } /*,options*/);
}]);

scotchAppServices.factory('logOut', ['$resource', function($resource){
    return $resource('/api/logout/', {/*paramDefaultts*/}, {/*actions*/
        query: { method: 'GET', params: {setId: ''}, isArray: false }
    } /*,options*/);
}]);