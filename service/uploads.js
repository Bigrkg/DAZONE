'use strict';
var multer = require('multer');

var uploads = {
  products: function(req, res,next){

    var workflow = req.app.utility.workflow(req, res);
    
    workflow.on('uploadImage', function uploadImage() {
      var storage = multer.diskStorage({ 
        destination: function (req, file, cb) {
            cb(null, 'public/uploads/products')
        },
        filename: function (req, file, cb) {
            var datetimestamp = Date.now();
            cb(null, 'product' +'-'+ req.query.productId +'-' + datetimestamp + '.' + file.originalname.split('.')[file.originalname.split('.').length -1])
        }
    });

    var upload = multer({ //multer settings
        storage: storage,
        fileFilter: function (req, file, cb) {
         if (file.mimetype !== 'application/pdf' && file.mimetype !== 'image/png' && file.mimetype !== 'image/svg' && file.mimetype !== 'image/svg+xml'   && file.mimetype !== 'image/jpeg' && file.mimetype !== 'image/jpe' && file.mimetype !== 'image/jpg') {
          req.fileValidationError = 'goes wrong on the mimetype';
          return cb(null, false, new Error('goes wrong on the mimetype'));
         }
         if (req.query.productId == undefined) {
            req.productIdRequired = 'product id required to upload images'

         }

         cb(null, true);
        }
    }).any();

        upload(req,res,function(err){
          console.log(req.body);
          console.log(req.files);
            if (err) {
                 console.log(err);
                 res.json({error_code:1,err_desc:err});
                 return;
            }

            if(req.fileValidationError) {
                  return res.end(req.fileValidationError);
            }

            if(req.productIdRequired) {
                  return res.end(req.productIdRequired);
            }
            // res.json({error_code:0,err_desc:null});
             workflow.emit('entryMongo',req.query.productId,req.files[0].filename);
        });

      
    });
    
    workflow.on('entryMongo', function entryMongo(productId,imgUrl) {
      
      var imgPath = {imgUrl : '/uploads/products'+imgUrl };

      req.app.db.models.Product.findByIdAndUpdate(
        productId,
        {$push: {"imagesPath": imgPath }},
        {safe: true, upsert: true, new : true},
        function(err, model) {
          //console.log(model);
            if (err) {
              //console.log(err);
          return workflow.emit('exception', err);
          }
           res.json({error_code:0,err_desc:null});
        });
    });

    workflow.emit('uploadImage');
  },
  test1 : function(req,res,next) {
    // console.log(req);
    console.log(req.files);
    console.log(req.body);
    console.log(req.productIdRequired);
    
    if(req.fileValidationError) {
            return res.end(req.fileValidationError);
    }

    if(req.productIdRequired) {
            return res.end(req.productIdRequired);
    }

  }
};

module.exports = uploads;
