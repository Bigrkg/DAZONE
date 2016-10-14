'use strict';

module.exports = exports = function pagedFindPlugin (schema) {
  schema.statics.pagedFind = function(options, cb) {
    var thisSchema = this;

    if (!options.filters) {
      options.filters = {};
    }
    
    if (!options.keys) {
      options.keys = '';
    }

    if(!options.attrFilters) {
      options.attrFilters = new Array();
    }

    if (!options.populate) {
      options.populate = '';
    }

    if (!options.limit) {
      options.limit = 20;
    }

    if (!options.page) {
      options.page = 1;
    }

    if (!options.sort) {
      options.sort = {};
    }
 
    var output = {
      data: null,
      pages: {
        current: options.page,
        prev: 0,
        hasPrev: false,
        next: 0,
        hasNext: false,
        total: 0
      },
      items: {
        begin: ((options.page * options.limit) - options.limit) + 1,
        end: options.page * options.limit,
        total: 0
      }
    };


    var getAndQuery = function() {
         
        console.log(options.attrFilters);
         
        var _d =  options.attrFilters.reduce(function(a, obj, i) {
         
          for(var attrKey in obj) {
            if(options.utils.isArray(obj[attrKey]) ) {
               
                var orObj ={},
                    filterArray = [] ;
                
                for (var i = 0, len = obj[attrKey].length; i < len; i++) {

                  var attributes = {};
                      attributes['attributes.attributeValueM'] = (obj[attrKey])[i]+'|'+attrKey ;
                      filterArray.push(attributes);

                }
                
                orObj['$or'] = filterArray ;
                
                a.push(orObj);
            }
            else {

                var filterArray = [],
                    attributes = {},
                    orObj ={};
                
                attributes['attributes.attributeValueM'] = obj[attrKey]+'|'+attrKey ;

                filterArray.push(attributes);
                orObj['$or'] = filterArray ;
                
                a.push(orObj);
            }
          }

          return a;
        }, []);
        
        /*
           final and query       
        */
       
        console.log(_d);

        var andArray = [];
            andArray.push(options.filters); 

        for (var i = 0, len = _d.length; i < len; i++) {
          andArray.push(_d[i]);
        }

        return andArray ;
     };

    var countResults = function(callback) {
      
      var query = '';

      if(options.attrFilters.length > 0) {
        query = thisSchema.count({$and: getAndQuery()});
      }
      else {
        query = thisSchema.count(options.filters);
      }

      query.exec(function(err, count) {
          output.items.total = count;
          callback(null, 'done counting');
      });

    };
    

    var getResults = function(callback) {
      var query = '';
       
      if(options.attrFilters.length > 0) {
     
        query = thisSchema.find({$and: getAndQuery()},options.keys).populate(options.populate);    
      }
      else
        query = thisSchema.find(options.filters, options.keys).populate(options.populate);

        query.skip((options.page - 1) * options.limit);
        query.limit(options.limit);
        /*
          to do sorting logic for main site
        */
        var sortFilter = options.sort;
        var sortkey = sortFilter.split('|')[0];
        var sortOrder = sortFilter.split('|')[1];
        // options.sort.split(|)

        var sortObj = {};
            sortObj[sortkey] = sortOrder;


        console.log(sortObj);


        query.sort(sortObj);

        /*
            .find({}).sort('-date').exec(function(err, docs) { ... });
            .find({}).sort({date: -1}).exec(function(err, docs) { ... });
            .find({}).sort({date: 'desc'}).exec(function(err, docs) { ... });
            .find({}).sort({date: 'descending'}).exec(function(err, docs) { ... });
            .find({}).sort([['date', -1]]).exec(function(err, docs) { ... });
            .find({}, null, {sort: '-date'}, function(err, docs) { ... });
            .find({}, null, {sort: {date: -1}}, function(err, docs) { ... });
        
        /*
         In MongoDB, sort operations can obtain the sort order by retrieving documents based on the 
         ordering in an index. If the query planner cannot obtain the sort order from an index, 
         it will sort the results in memory
         */
        query.lean();
        query.exec(function(err, results) {
          output.data = results;
          callback(null, 'done getting records');
        });
    };

    require('async').parallel([
      countResults,getResults
    ],
    function(err, results){
      if (err) {
        cb(err, null);
      }

      //final paging math
      output.pages.total = Math.ceil(output.items.total / options.limit);
      output.pages.next = ((output.pages.current + 1) > output.pages.total ? 0 : output.pages.current + 1);
      output.pages.hasNext = (output.pages.next !== 0);
      output.pages.prev = output.pages.current - 1;
      output.pages.hasPrev = (output.pages.prev !== 0);
      if (output.items.end > output.items.total) {
        output.items.end = output.items.total;
      }

      cb(null, output);
    });
  };
};
