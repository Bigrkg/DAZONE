'use strict';

var attributeFunctions = {};

attributeFunctions.attributeValidation = function (req,workflow) {
    if(req.body) {

      if (!req.body.name) {
        workflow.outcome.errfor.name = 'required in desired format';
      }
      else if (!/^[a-zA-Z0-9\ \-\_]+$/.test(req.body.name) || !req.app.utils.isString(req.body.name)) {
        workflow.outcome.errfor.name = 'only use letters, numbers, \'-\', \'_\'';
      }

      if (!req.body.attrType) {
        workflow.outcome.errfor.attrType = 'required';
      }
      else if (!/^(numeric|alphaNumeric)$/.test(req.body.attrType)) {
        workflow.outcome.errfor.attrType = 'invalid attribute type format --only accept numeric or alpaNumeric';
      }

      // if (!req.body.parseUnit) {
      //   workflow.outcome.errfor.parseUnit = 'required';
      // }

      if (!/^(true|false)$/.test(req.body.useFilter)) {
        workflow.outcome.errfor.useFilter = 'filter format is wrong--only accept true and false';
      }
      else
        req.body.useFilter == 1 ? workflow.fieldsToSet.useFilter= true : workflow.fieldsToSet.useFilter= false 
      
      
      if (!/^(true|false)$/.test(req.body.useCompare)) {
        workflow.outcome.errfor.useCompare = 'compare format is wrong--only accept true and false';
      }
      else
        req.body.useCompare == 1 ? workflow.fieldsToSet.useCompare= true : workflow.fieldsToSet.useCompare= false 
      

      if (req.body.rangeSet && req.app.utils.isArray(req.body.rangeSet)) {
            if (typeof req.body.rangeSet[0] != "undefined" && req.body.rangeSet[0] != null && req.body.rangeSet[0].constructor !== Array ){
                   
                  if(!(typeof req.body.rangeSet[0] == 'object' && req.body.rangeSet[0].hasOwnProperty("minimum") && req.body.rangeSet[0].minimum!= undefined)){
                    workflow.outcome.errfor.rangeSet= 'pass range set value in array of objects [{"minimum": "" ,maximum":""}]- check minimum object';
                  }

                  if (!(req.app.utils.isObject(req.body.rangeSet[0]) && req.body.rangeSet[0].hasOwnProperty("maximum") && req.body.rangeSet[0].maximum!= undefined)){
                      workflow.outcome.errfor.rangeSet = 'pass range set value in array of objects [{"minimum":"","maximum":""}] - check maximimum object';
                  }
            }
            else
                workflow.outcome.errfor.rangeSet= 'pass range set values in array of objects [{"minimum":""},{"maximum":""}]';
      
          }
      // else
      //     workflow.outcome.errfor.rangeSet= 'pass range set value in array of objects [{"minimum":"","maximum":""}]';
      
      if(!req.body.description) {
           workflow.outcome.errfor.description = 'description reuired';
      }
      else if (req.body.description && !req.app.utils.isArray(req.body.description)) {
           workflow.outcome.errfor.description = 'set attribute values ** required in array format';
      }
          

      if (!/^(true|false)$/.test(req.body.isPublished) && req.body.isPublished!= undefined) {
        workflow.outcome.errfor.isPublished = 'publish format is wrong--only accept zero and one';
      }
      else
        req.body.isPublished == 1 ? workflow.fieldsToSet.isPublished= true : workflow.fieldsToSet.isPublished= false 
    }
    else
      workflow.errors  = "payload not correct"
    
      return workflow ;
};
attributeFunctions.hasPermissionToAction = function(req,permission) {
    for (var i = 0 ; i < req.user.roles.admin.permissions.length ; i++) {
      if (req.user.roles.admin.permissions[i].name === permission) {
        return true;
      }
    }
    return false;
    };


var attributes = {
  create: function(req, res){
    var workflow = req.app.utility.workflow(req, res);
    
    workflow.on('validate', function validateCreate() {
      workflow.fieldsToSet =  req.body;
      var validationWorkflow = attributeFunctions.attributeValidation(req,workflow);
      if (validationWorkflow.hasErrors()) {
        return workflow.emit('response');
      }
      workflow.emit('createAttribute');
    });
    
    // workflow.on('duplicateAttributeCheck', function duplicateAttributeCheck() {
    //   req.app.db.models.Attribute.findOne({ name: req.body.name.toLowerCase() }, function(err, attribute) {
    //     if (err) {
    //       return workflow.emit('exception', err);
    //     }

    //     if (attribute) {
    //       workflow.outcome.errfor.name = 'attribute already there';
    //       return workflow.emit('response');
    //     }

    //     workflow.emit('createAttribute');
    //   });
    // });

    workflow.on('createAttribute', function createAttribute() {
        workflow.fieldsToSet.search = new Array(req.body.name);
        workflow.fieldsToSet.createdBy = req.user.email;
         
        if (typeof req.body.setId != undefined && req.body.setId != null) {
            workflow.fieldsToSet._creator = req.body.setId ;
        }  

        req.app.db.models.Attribute.create(workflow.fieldsToSet, function(err, attribute) {
          if (err) {
            return workflow.emit('exception', err);
          }
          workflow.outcome.attributes =  attribute; 
          if (typeof req.body.setId != undefined && req.body.setId != null) {
              workflow.emit('updateAttributeSetAttributes',req.body.setId,attribute._id);
          }
          else {

              workflow.emit('response');
          } 
        });
    });
    
    workflow.on('updateAttributeSetAttributes',function(setId,attribute_id) {

      var conditions = { _id:setId};
      workflow.fieldsToSet.attributes =  attribute_id ;
  
      req.app.db.models.AttributeSet.findByIdAndUpdate(
        setId,
        {$push: {"attributes": attribute_id}},
        {safe: true, upsert: true, new : true},
        function(err, model) {
            if (err) {
          return workflow.emit('exception', err);
          }
        });

        workflow.emit('response');
      });

    workflow.emit('validate');
  },
  update :  function(req,res){
    var workflow = req.app.utility.workflow(req, res);
    workflow.on('validate', function validateUpdate() {
      workflow.fieldsToSet =  req.body;
      var validationWorkflow = attributeFunctions.attributeValidation(req,workflow);
      if (validationWorkflow.hasErrors()) {
        return workflow.emit('response');
      }
      workflow.emit('duplicateAttributeCheck');
    });
    
     workflow.on('duplicateAttributeCheck', function duplicateAttributeCheck() {
      req.app.db.models.Attribute.findOne({ name: req.body.name.toLowerCase() }, function(err, attribute) {
        if (err) {
          return workflow.emit('exception', err);
        }

        if (attribute) {
          workflow.outcome.errfor.name = 'attribute already there';
          return workflow.emit('response');
        }

        workflow.emit('updateAttributeFields');
      });
    });

    workflow.on('updateAttributeFields',function updateAttributeFields(argument) {
       var conditions = { _id: req.params.id};
       workflow.fieldsToSet.updatedBy =  req.user.email;
       workflow.fieldsToSet.updatedDate = Date();
      req.app.db.models.Attribute.findOneAndUpdate(conditions, workflow.fieldsToSet, function(err, attribute) {
        if (err) {
          return workflow.emit('exception', err);
        }

        if (!attribute) {
          return workflow.emit('response');
        }
        workflow.emit('response');
      });
    });

    workflow.emit('validate');
  },
  find: function(req, res, next){
    req.query.name = req.query.name ? req.query.name : '';
    req.query.limit = req.query.limit ? parseInt(req.query.limit, null) : 20;
    req.query.page = req.query.page ? parseInt(req.query.page, null) : 1;
    req.query.sort = req.query.sort ? req.query.sort : '_id';
    req.query.exclude = req.app.utility.slugify.getExcludeKeys(req.query.exclude);
    req.query.populate = req.query.populate ? req.query.populate : '';
    req.query.include = req.app.utility.slugify.getIncludeKeys(req.query.include);
    
    var keysObj= req.app.utility.slugify.getExtendKeys(req.query.exclude,req.query.include),
        filters = {},
        canKeys = ['isPublished','description','uniqueIdentifier','_id','name'];

        for(var key in req.query) {
          canKeys.indexOf(key) != -1 && key == 'name' ? filters[key] = new RegExp('^.*?'+ req.query[key] +'.*$', 'i') : (canKeys.indexOf(key) != -1  ? filters[key] = req.query[key]:'');
        }
        
    var _parseObj = req.app.utility.slugify.deleteRemainingKeys(keysObj,1,0);

    req.app.db.models.Attribute.pagedFind({
      filters: filters,
      limit: req.query.limit,
      page: req.query.page,
      sort: req.query.sort,
      keys : _parseObj,
      populate : req.query.populate
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
    req.query.include = req.query.include ? req.app.utility.slugify.getIncludeKeys(req.query.include) : '';
    
    workflow.on('validate', function() {
      req.app.db.models.Attribute.findById(req.params.id,req.query.include).exec(function(err, status) {
        if (err) {
          return next(err);
        }
        
        if (status == null) {
          workflow.outcome.attribute = null;  
        }
        else
          workflow.outcome.attribute = status;

        workflow.emit('response');  

        // res.status(200).json(status==null ? {"status": "no such attribute id exists"} : status);
      });
    });
    
    workflow.emit('validate');
  },
  delete : function(req,res,next) {
    var workflow = req.app.utility.workflow(req, res);

    workflow.on('validate', function() {

      if (!attributeFunctions.hasPermissionToAction(req,'delete')) {
        workflow.outcome.errors.push('You may not have delete attribute permissions -please contact admin team.');
        return workflow.emit('response');
      }

      workflow.emit('deleteStatus');
    });

    workflow.on('deleteStatus', function(err) {
      req.app.db.models.Attribute.findByIdAndRemove(req.params.id, function(err, status) {
        if (err) {
          return workflow.emit('exception', err);
        }
        
        if (status == null) {
          workflow.outcome.errors.push('attribute already deleted or attribute id does not exists');
          return workflow.emit('response');
        } 

        workflow.emit('deleteLog');
      });
    });

    workflow.on('deleteLog', function(err) {
      
        var fieldsToSet = {
          email: req.user.email.toLowerCase(),
          attributeId: req.params.id
        };
        req.app.db.models.AttributeLogs.create(fieldsToSet, function(err, attribute) {
          if (err) {
            return workflow.emit('exception', err);
          }

          workflow.emit('response'); 
        });
    });

    workflow.emit('validate');
  }
};

module.exports = attributes;
