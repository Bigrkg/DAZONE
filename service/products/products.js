'use strict';

var request = require('request');
var cheerio = require('cheerio');
var fs = require('fs');

var products = {
    productValidation  : function (req,workflow) {
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

        var  canFilterKeys = ['source','limit','page','sort','exclude','populate','include','isPublished','description','uniqueIdentifier','coverPhoto','_id','name','categories','actualCategories','attrs','created_at','pageViews','updated_at','createdDate','shortListCount'];

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
    find: function(req, res, next){
    	console.log('coming');
	    var workflow = req.app.utility.workflow(req, res);

	    workflow.on('validate', function validateUpdate() {

	      var validationWorkflow = products.productValidation(req,workflow);
	        
	        if (validationWorkflow.hasErrors()) {
	          res.status('400');
	          return workflow.emit('response');
	        }

	        workflow.emit('findProducts'); 
	    });

	    workflow.on('findProducts', function findProducts() {

	      // req.query.title = req.query.title ? req.query.title : '';
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
	          canFindFilterKeys = ['source','isPublished','description','uniqueIdentifier','coverPhoto','_id','title','categories','actualCategories','attrs'];

	          for(var key in req.query) {

	            if(canFindFilterKeys.indexOf(key) != -1 && key == 'title' ) {
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

	      console.log(filters);
	      
	      req.app.db.models.Product.pagedFind({
	        filters: filters,
	        attrFilters : req.query.attrs,
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
	    
	       //console.log(req.query.include);
	      if(req.query.dPop == 1 ) {
	            req.app.db.models.Product.findById(req.params.id,req.query.include).deepPopulate('attributes.attributeInfo categories.attributesSet.attributes').exec(function (err, post) {

	            res.status(200).json(post);
	         //    if (post == null) {
	         //       workflow.outcome.product = null;  
		        // }		
		        // else
		        //     workflow.outcome.product = post;

		         //workflow.emit('response');
	         });
	      }
	      else {

	        req.app.db.models.Product.findById(req.params.id,req.query.include).exec(function(err, status) {
	          if (err) {
	            return next(err);
	          }
	          
	          // if (status == null) {
	          //   workflow.outcome.product = null;  
	          // }
	          // else
	          //   workflow.outcome.product = status;
	          
	          res.status(200).json(status);


	          //workflow.emit('response');  
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
	      	  res.status('400');
	          return workflow.emit('response');
	      }
	      
	      workflow.emit('patchProduct');
	    });
	    workflow.on('patchProduct', function() {

	        req.app.db.models.Product.findById(req.params.id).exec(function (err, product) {
            

            // if(err)
            // 	  return next(err);

		        if (product == null) {
              res.status(404);
		          workflow.outcome.errors.push('product id is invalid');  
		        }
		        else
		          workflow.emit('patchUser',req.params.id,product.title != '' && product.title != null ? product.title : (product.cronData != undefined && product.cronData.title != null ? product.cronData.title : ''));
		          

		        if (workflow.hasErrors()) {
		          return workflow.emit('response');
		        } 
	        });
	    });

	    workflow.on('patchUser',function(product_id,product_name) {

	      var makeObj = {
	        name : product_name ,
	        dataId : product_id
	      };
	      
	      if(req.params.type == 'a') {

	        req.app.db.models.CustomerAccount.find({
	          "_id" : req.user.customerAccount._id,
	          "shortListedData.products": {
	              $elemMatch: {
	                  "dataId": product_id
	              }
	          }
	        }, {
	            "shortListedData.products.dataId": 1
	        }).exec(function(err,data) {
	           if(err)
            	  return next(err);

	            /*
	              check if same bluprint already shortlisted
	              
	            */

	            if(data.length == 0) {
	                
	                req.app.db.models.CustomerAccount.findByIdAndUpdate(
	                  req.user.customerAccount._id,
	                  {$push: {"shortListedData.products": makeObj}},
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
                        req.app.db.models.Product.findByIdAndUpdate(product_id, { $inc: { shortListCount: 1 }}, function(err, data){
											      if(err)
            	                return next(err);
            	              console.log('incremented');
            	              workflow.emit('response');
											  });
	                }); 

	            } else {

	              workflow.outcome.errors.push('product already shortlisted');
	               return workflow.emit('response');
	            }

	        });

	      } else {
	        req.app.db.models.CustomerAccount.findByIdAndUpdate(
	        req.user.customerAccount._id, 
	        { $pull: { "shortListedData.products" : { dataId: product_id  } } },
	        {safe: true, new : true},
	        function(err, model) {
	          if(err)
            	  return next(err);

	          workflow.emit('response');
	        });  
	      }
	    });

	    workflow.emit('validate');
  }
};
module.exports = products;
