'use strict';

exports = module.exports = function(app, mongoose) {
  var setSchema = new mongoose.Schema({
    name : {type : String ,required : true},
    uniqueIdentifier : {type : String ,default : ''},
    attributeType : {type :  String , required : true},
    appliedCategories : [{ type: mongoose.Schema.Types.ObjectId, ref: 'Category' }],
    attributes :[{ type: mongoose.Schema.Types.ObjectId, ref: 'Attribute' }],
    isPublished : {type : Boolean , default : false},
    publishedDate: { type: Date},
    createdDate : {type: Date,default : Date.now},
    updatedDate : {type : Date},
    updatedBy : {type : String},
    createdBy : {type: String},
    search: [String]
  });
  setSchema.plugin(require('./plugins/pagedFind'));
  setSchema.index({ name: 1 });
  setSchema.index({ isPublished: 1 });
  setSchema.index({ search: 1 });
  setSchema.set('autoIndex', (app.get('env') === 'development'));
  app.db.model('AttributeSet', setSchema);
};

