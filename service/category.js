'use strict';
var category = {
  find: function(req, res, next){


    var keysTransform = {
        l : 'level',
        ip : 'isParent'
    };

    // req.query.name = req.query.name ? req.query.name : '';
    req.query.limit = req.query.limit ? parseInt(req.query.limit, null) : 20;
    req.query.page = req.query.page ? parseInt(req.query.page, null) : 1;
    req.query.sort = req.query.sort ? req.query.sort : '_id';
    req.query.ex = req.app.utility.slugify.getExcludeKeys(req.query.ex);
    req.query.populate = req.query.populate ? req.query.populate : '';
    req.query.in = req.app.utility.slugify.getIncludeKeys(req.query.in);
    
    if(req.query.level != undefined) parseInt(req.query.level, null);
        
    var keysObj= req.app.utility.slugify.getExtendKeys(req.query.ex,req.query.in),
        filters = {},
        canKeys = ['isPublished','description','isParent','parentName','uniqueIdentifier','level','_id','name','ancestor'];

        for(var key in req.query) {
          if (canKeys.indexOf(key) != -1 && key == 'name') {
             filters[key] = new RegExp('^.*?'+ req.query[key] +'.*$', 'i')
          }
          else if (canKeys.indexOf(key) !=-1 && key == 'ancestor') {
            // && req.app.utils.isNumber(req.query.level)  - 
            /*
            
             ----------------- to do ------------------
              implement later

             */
              filters['nav.sec'+(req.query.level-1)] = req.query[key] ;
          }
          else if (canKeys.indexOf(key) != -1) {
              filters[key] = req.query[key];
          }
        }

    var _parseObj = req.app.utility.slugify.deleteRemainingKeys(keysObj,1,0);
    
    console.log(filters);


    req.app.db.models.Category.pagedFind({
      filters: filters,
      limit: req.query.limit,
      page: req.query.page,
      sort: req.query.sort,
      keys : _parseObj,
      populate : req.query.populate,
      req : req
    }, function(err, results) {
      if (err) {
        return next(err);
      }
      results.filters = req.query;
      res.status(200).json(results);
    });
  },
  read: function(req, res, next){

    var workflow = req.app.utility.workflow(req, res);
        req.query.in = req.query.in ? req.app.utility.slugify.getIncludeKeys(req.query.in) : '';
    
    workflow.on('validate', function() {
      
      if(req.params.dPop == 1) {
         req.app.db.models.Category.findById(req.params.id,req.query.in).deepPopulate('attributesSet.attributes').exec(function (err, post) {
            if (err) {
              return next(err);
            }
            if (post == null) {
               workflow.outcome.category = null;  
            }
            else
               //workflow.outcome.Category = post;

               //workflow.emit('response'); 

            res.status(200).json(post);
         });
      } 
      else {
          req.app.db.models.Category.findById(req.params.id,req.query.include).populate('attributesSet','-__v -createdBy -search -publishedDate -attributes').exec(function(err, status) {
          if (err) {
            return next(err);
          }
        
          if (status == null) {
            workflow.outcome.category = null;  
          }
          else
            workflow.outcome.Category = status;

          workflow.emit('response'); 
        
          // res.status(200).json(status==null ? {"status": "no such category id exists"} : status);
        });
      }
    });
    
    workflow.emit('validate');
  }
};

module.exports = category;
