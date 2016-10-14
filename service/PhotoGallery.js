'use strict';

exports = module.exports = function(app, mongoose) {
  var photoGallery = new mongoose.Schema({
      // type product and blueprint
      type : {type:  String , default : 'product'},
      isPublished: {type: Boolean,default : true},
      fileUrl :{type: String, default: ''},
      coverPhoto:{type: Boolean,default : false},
      uploadedlDate : {type : Date , default : Date.now},
      originalName : {type: String, default: ''},
      encoding : {type: String, default: ''},
      mimeType : {type: String, default: ''},
      destination : {type : String , default : ''},
      fileName : {type: String, default: ''},
      fileSize : {type : Number},
      search: [String]
  });
  photoGallery.plugin(require('./plugins/pagedFind'));
  photoGallery.index({ search: 1 });
  photoGallery.index({ coverPhoto: 1 });
  photoGallery.index({ imgUrl: 1 });
  photoGallery.set('autoIndex', (app.get('env') === 'development'));
  app.db.model('PhotoGallery', photoGallery);
};

