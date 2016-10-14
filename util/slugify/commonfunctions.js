'use strict';

var commonfunctions = {
  arrayToObject : function arrayToObject(arr,keyInit,index) {
    return arr.reduce(function(o, v, i) {
      var arrIndex = '';
          index == true && index != undefined ? arrIndex = i+1 : arrIndex ;
          o[keyInit+arrIndex] = v;
      return o;
    }, {});
  },
  arrayOfObjectsToArray : function arrayToObject(arr) {
    return arr.reduce(function(a, o, i) {
                a.push(o._id);
                 return a;
          }, []);
  },
  getExcludeKeys : function getExcludeKeys(query) {
    if (typeof query == undefined || query == undefined ) {
          var o = {};
          o.__v = 0;
          o.search = 0;
          o.createdBy = 0;
          o.isParentCategoriesApplied = 0;
          o.updatedDate = 0;
          //console.log('obj'+o);
          return o;
    }
    else {
         return query.reduce(function(o, v, i) {
            o[v] = 0;
            o.__v = 0;
            o.search = 0;
            o.createdBy = 0;
            o.isParentCategoriesApplied = 0;
            o.updatedDate = 0;
             //console.log('objk'+o);
            return o;
      }, {});
    } 
  },
  getIncludeKeys : function getIncludeKeys(query) {
    if (typeof query == undefined || query == undefined ) {
          return '' ;
    }
    else {
         return query.reduce(function(o, v, i) {
            o[v] = 1;
            return o;
      }, {});
    }
  },
  getExtendKeys : function extend(obj, src) {
    if(obj == undefined || obj == '')
      obj = {};

      Object.keys(src).forEach(function(key) { obj[key] = src[key]; });
    return obj;
  },
  // compareArrays : function compareArrays(obj,src)
  // {
  //   // pass arrays after sorting
  //   return !obj.some(function (e, i) {
  //       return e != src[i];
  //   });
  // },
  compareArrays : function(a1,a2) {
    return a1.length==a2.length && a1.every(function(v,i) { return v === a2[i]});
  },
  deleteRemainingKeys : function deleteRemainingKeys(obj,notDelete,toDelete) {
    for(var prop in obj) {
      if(obj.hasOwnProperty(prop)) {
          if(obj[prop] === notDelete) {
              for(var _cc in obj) {
                  if(obj.hasOwnProperty(_cc)) {
                      if(obj[_cc] === toDelete) {
                          delete obj[_cc];
                      }
                  }
              }
          }
      }
    }
    return obj;
  }
}

module.exports = commonfunctions;


/*
  functional programming

  //our data using filter
  var cars = [{
  make: 'Nissan',
  model: 'leaf'
  }, {
  make: 'Chevrolet',
  model: 'bolt '
  }, {
  make: 'BMW',
  model: 'i8'
  }, {
  make: 'Tesla',
  model: ‘model X '}
  ];

  //Pure:
  function isI8(car) {
  return car.model === ‘i8’;
  }

  var i8s = cars.filter(isI8)

 
  //our array of data map
var cars = [{
make: 'Nissan',
model: 'leaf'
}, {
make: 'Chevrolet',
model: 'bolt'
}, {
make: 'BMW',
model: 'i8'
}, {
make: 'Tesla',
model: 'model X'
}];

//our pure function:
function getCarModel(car) {
return car.model;
}

var models = cars.map(getCarModel);


 */
