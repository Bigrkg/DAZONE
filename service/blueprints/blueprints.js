'use strict';
var blueprints = {

  blueprintValidation  : function (req,workflow) {
      if(req.query) {

        if (!/^(true|false)$/.test(req.query.isPublished) && req.query.isPublished!= undefined) {
          workflow.outcome.errfor.isPublished = 'publish format is wrong--only accept true and false';
        }

        if (req.query.attrs && !req.app.utils.isArray(req.query.attrs)) {
           workflow.outcome.errfor.attributes = 'attributes filter format is wrong';        
        }

        /*
           add new filters if needed into canFiltersKeys array
        */

        var  canFilterKeys = ['limit','page','sort','exclude','populate','include','isPublished','description','uniqueIdentifier','coverPhoto','_id','name','categories','actualCategories','attrs','created_at','pageViews','shortListCount','noOfDownloads'];

        for(var key in req.query) {
          if(canFilterKeys.indexOf(key) == -1)  workflow.outcome.errors = 'wrong filter attributes - pass acceptable filters'; 
        }

        if (req.query.sort && req.query.sort!= undefined &&  !/^(asc|desc)$/.test(req.query.sort.split('|')[1]) ) {
            workflow.outcome.errfor.sort = 'sort filter is wrong';
        }


      }
      else
        workflow.errors  = "payload not correct"
        return workflow ;
  },
  find: function(req, res, next) {
    
    var workflow = req.app.utility.workflow(req, res);

    workflow.on('validate', function validateUpdate() {

      var validationWorkflow = blueprints.blueprintValidation(req,workflow);
        
        if (validationWorkflow.hasErrors()) {
          res.status('400');
          return workflow.emit('response');
        }

        workflow.emit('findBlueprints'); 
    });

    workflow.on('findBlueprints', function findBlueprints() {

      req.query.name = req.query.name ? req.query.name : '';
      /*
         only pull live blueprints;
       */
      //req.query.isPublished =  req.query.isPublished ? req.query.isPublished : true;
      req.query.limit = req.query.limit ? parseInt(req.query.limit, null) : 20;
      req.query.page = req.query.page ? parseInt(req.query.page, null) : 1;
      req.query.sort = req.query.sort ? req.query.sort : '_id|desc';
      req.query.exclude = req.app.utility.slugify.getExcludeKeys(req.query.exclude);
      req.query.populate = req.query.populate ? req.query.populate : '';
      req.query.include = req.app.utility.slugify.getIncludeKeys(req.query.include);

      var keysObj= req.app.utility.slugify.getExtendKeys(req.query.exclude,req.query.include),
          filters = {},
          canFindFilterKeys = ['isPublished','description','uniqueIdentifier','coverPhoto','_id','name','categories','actualCategories','attrs'];

          for(var key in req.query) {

            if(canFindFilterKeys.indexOf(key) != -1 && key == 'name' ) {
               filters[key] = new RegExp('^.*?'+ req.query[key] +'.*$', 'i');
            }
            else if(canFindFilterKeys.indexOf(key) != -1 && key == 'attrs') {
              // console.log(req.query);
              // console.log(req.query.attrs);   
            }
            else if( canFindFilterKeys.indexOf(key) != -1 ) {
              filters[key] = req.query[key]
            }
          }

      var _parseObj = req.app.utility.slugify.deleteRemainingKeys(keysObj,1,0);
      
      req.app.db.models.Blueprint.pagedFind({
        filters: filters,
        attrFilters : req.query.attrs ,
        limit: req.query.limit,
        page: req.query.page,
        sort: req.query.sort,
        keys : _parseObj,
        utils : req.app.utils,
        populate : req.query.populate
      }, function(err, results) {
        if (err) {
          return next(err);
        }

        // results.filters = req.query;
        res.status(200).json(results);
      });
    });
    workflow.emit('validate'); 
  },
  read: function(req, res, next){
    
    var workflow = req.app.utility.workflow(req, res);

    workflow.on('validate', function() {
       
    req.query.include = req.query.include ? req.app.utility.slugify.getIncludeKeys(req.query.include) : '';
  
      if(req.query.dPop == 1 ) {
         req.app.db.models.Blueprint.findById(req.params.id,req.query.include).deepPopulate('attributes.attributeInfo categories.attributesSet.attributes').exec(function (err, post) {

          // if (post == null) {
          //   workflow.outcome.blueprint = null;  
          // }
          // else
          //   workflow.outcome.blueprint = post;

          res.status(200).json(post);


          // workflow.emit('response');

         });
      }
      else {

        req.app.db.models.Blueprint.findById(req.params.id,req.query.include).populate('photoGallery','-__v -search -type -destination -mimeType -encoding -uploadedlDate').exec(function(err, status) {
          if (err) {
            return next(err);
          }
          
          // if (status == null) {
          //   workflow.outcome.blueprint = null;  
          // }
          // else
          //   workflow.outcome.blueprint = status;

          res.status(200).json(status);


          // workflow.emit('response');  
        });
      }

    });
    
    workflow.emit('validate');
  },
  shortList : function(req , res , next) {

    var workflow = req.app.utility.workflow(req, res);

    workflow.on('validate', function() {

      if(!req.params.id || req.params.id == null || req.params.id == undefined) {
         
         workflow.outcome.errfor.id = 'required'; 
      }

      if(!req.params.type) {
         workflow.outcome.errfor.type = 'required - add or remove';
      }
      else if (!/^(a|r)$/.test(req.params.type)) {
          workflow.outcome.errfor.type = 'pass required values - ask team';
      }

      if (workflow.hasErrors()) {
          return workflow.emit('response');
      }
      
      workflow.emit('patchBlueprint');

    });
   

    workflow.on('patchBlueprint', function() {

        req.app.db.models.Blueprint.findById(req.params.id).exec(function (err, blueprint) {

        if (blueprint == null) {
          workflow.outcome.errors.push('blueprint id is invalid');  
        }
        else
          workflow.emit('patchUser',req.params.id,blueprint.name);
          

        if (workflow.hasErrors()) {
          return workflow.emit('response');
        } 

      });
    });


    workflow.on('patchUser',function(blueprint_id,blueprint_name) {

      console.log(req.user.customerAccount._id);

      var makeObj = {
        name : blueprint_name ,
        dataId : blueprint_id
      };
      
      if(req.params.type == 'a') {

        req.app.db.models.CustomerAccount.find({
          "_id" : req.user.customerAccount._id,
          "shortListedData.blueprints": {
              $elemMatch: {
                  "dataId": blueprint_id
              }
          }
        }, {
            "shortListedData.blueprints.dataId": 1
        }).exec(function(err,data) {
          if(err)
                return next(err);
            
            /*
              check if same bluprint already shortlisted
              
            */

            if(data.length == 0) {
                
                req.app.db.models.CustomerAccount.findByIdAndUpdate(
                  req.user.customerAccount._id,
                  {$push: {"shortListedData.blueprints": makeObj}},
                  /*
                    new - set to true to return the modified document rather than the original
                    upsert - create the document if it does not match
                    select - specify the fields to return
                    
                  */
                  {safe: true, new : true},
                  function(err, model) {
                    if(err)
                      return next(err);

                      /*
                          increment count by one -- necessary for home page Apis--sort by popularity                       
                        */
                        req.app.db.models.Blueprint.findByIdAndUpdate(blueprint_id, { $inc: { shortListCount: 1 }}, function(err, data){
                            if(err)
                              return next(err);
                            workflow.emit('response');
                        });

                    // workflow.emit('response');
                }); 

            } else {

                workflow.outcome.errors.push('blueprint already shortlisted');
                return workflow.emit('response');
            }

        });

      } else {
        req.app.db.models.CustomerAccount.findByIdAndUpdate(
        req.user.customerAccount._id, 
        { $pull: { "shortListedData.blueprints" : { dataId: blueprint_id  } } },
        {safe: true, new : true},
        function(err, model) {
          if(err)
              return next(err);

          console.log(model);

          workflow.emit('response');
        });  
      }
    });
    workflow.emit('validate');
  }
};
module.exports = blueprints;
