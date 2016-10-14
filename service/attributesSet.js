'use strict';

var attributeSetFunctions = Object.create(Object.prototype);

attributeSetFunctions.attributeSetValidation = function (req,workflow) {

     if (!req.body.name) {
        workflow.outcome.errfor.name = 'required in desired format';
      }
      else if (!/^[a-zA-Z0-9\ \-\_]+$/.test(req.body.name) || !req.app.utils.isString(req.body.name)) {
        workflow.outcome.errfor.name = 'only use letters, numbers, \'-\', \'_\'';
      }

      if (!req.body.attributeType) {
        workflow.outcome.errfor.attributeType = 'required';
      }
      else if (!/^(product|professional|looks)$/.test(req.body.attributeType)) {
        workflow.outcome.errfor.attributeType = 'invalid attribute type format';
      }

      if (!/^[a-zA-Z0-9\-\_]+$/.test(req.body.uniqueIdentifier)) {
        workflow.outcome.errfor.uniqueIdentifier = 'only use letters, numbers, \'-\', \'_\'';
      }

      return workflow ;
};
attributeSetFunctions.hasPermissionToAction = function(req,permission) {
    for (var i = 0 ; i < req.user.roles.admin.permissions.length ; i++) {
      if (req.user.roles.admin.permissions[i].name === permission) {
        return true;
      }
    }
    return false;
};


var attributesSet = {
  create: function(req, res){
    var workflow = req.app.utility.workflow(req, res);
    
    workflow.on('validate', function validateCreate() {
      workflow.fieldsToSet =  req.body;
      var validationWorkflow = attributeSetFunctions.attributeSetValidation(req,workflow);
      if (validationWorkflow.hasErrors()) {
        return workflow.emit('response');
      }
      workflow.emit('duplicateAttributeSetCheck');
    });
    
    workflow.on('duplicateAttributeSetCheck', function duplicateAttributeCheck() {
      req.app.db.models.AttributeSet.findOne({ name: req.body.name}, function(err, attributesSet) {
        if (err) {
          return workflow.emit('exception', err);
        }

        if (attributesSet) {
          workflow.outcome.errfor.name = 'attribute set already there';
          return workflow.emit('response');
        }

        workflow.emit('createAttributeSet');
      });
    });

    workflow.on('createAttributeSet', function createAttributeSet() {
        workflow.fieldsToSet.search = new Array(req.body.name);
        workflow.fieldsToSet.createdBy = req.user.email;
        req.app.db.models.AttributeSet.create(workflow.fieldsToSet, function(err, attribute) {
          if (err) {
            return workflow.emit('exception', err);
          }
                    
          workflow.outcome.attributeSet = attribute;
          //workflow.emit('response');

          workflow.emit('response');
        });
    });
    workflow.emit('validate');
  },
  update :  function(req,res){
    var workflow = req.app.utility.workflow(req, res);
    workflow.on('validate', function validateUpdate() {
      workflow.fieldsToSet =  req.body;
      var validationWorkflow = attributeSetFunctions.attributeSetValidation(req,workflow);
      if (validationWorkflow.hasErrors()) {
        return workflow.emit('response');
      }
      workflow.emit('duplicateAttributeSetCheck');
    });
    

     workflow.on('duplicateAttributeSetCheck', function duplicateAttributeCheck() {
      req.app.db.models.AttributeSet.findOne({ name: req.body.name.toLowerCase() }, function(err, attributesSet) {
        if (err) {
          return workflow.emit('exception', err);
        }

        if (attributesSet) {
          workflow.outcome.errfor.name = 'attribute set already there';
          return workflow.emit('response');
        }

        workflow.emit('updateAttributeSetFields');
      });
    });

    workflow.on('updateAttributeSetFields',function updateAttributeSetFields(argument) {
       var conditions = { _id: req.params.id};
       workflow.fieldsToSet.updatedBy =  req.user.email;
       workflow.fieldsToSet.updatedDate = Date();
      req.app.db.models.AttributeSet.findOneAndUpdate(conditions, workflow.fieldsToSet, function(err, attributesSet) {
        if (err) {
          return workflow.emit('exception', err);
        }

        if (!attributesSet) {
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

    req.app.db.models.AttributeSet.pagedFind({
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
      req.app.db.models.AttributeSet.findById(req.params.id,req.query.include).populate('attributes','-__v -createdBy -search -publishedDate').exec(function(err, status) {
        if (err) {
          return next(err);
        }
        
        if (status == null) {
          workflow.outcome.attributesSet = null;  
        }
        else
          workflow.outcome.AttributeSet = status;

        workflow.emit('response');  

        // res.status(200).json(status==null ? {"status": "no such attribute id exists"} : status);
      });
      
    });
    
    workflow.emit('validate');
  },
  delete : function(req,res,next) {
    var workflow = req.app.utility.workflow(req, res);

    workflow.on('validate', function() {

      if (!attributeSetFunctions.hasPermissionToAction(req,'delete')) {
        workflow.outcome.errors.push('You may not have delete attribute set permissions -please contact admin team.');
        return workflow.emit('response');
      }

      workflow.emit('deleteStatus');
    });

    workflow.on('deleteStatus', function(err) {
      req.app.db.models.AttributeSet.findByIdAndRemove(req.params.id, function(err, status) {

        if (err) {
          return workflow.emit('exception', err);
        }

        if (status == null) {
          workflow.outcome.errors.push('AttributeSet already deleted or attributesSet id does not exist');
          return workflow.emit('response');
        }
        
        workflow.emit('deleteLog');
      });
    });

    workflow.on('deleteLog', function(err) {
      
        var fieldsToSet = {
          email: req.user.email.toLowerCase(),
          attributeSetId: req.params.id
        };
        req.app.db.models.AttributeSetLogs.create(fieldsToSet, function(err, attribute) {
          if (err) {
            return workflow.emit('exception', err);
          }

          workflow.emit('response'); 
        });
    });

    workflow.emit('validate');
  }
};

module.exports = attributesSet;
