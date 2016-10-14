'use strict';

exports = module.exports = function(app, mongoose) {
  
 /*
  pre define sub documents 
 */
  var uploadedFileSchema = new mongoose.Schema({
    type : {type:  String , default : 'product'},
    isPublished: {type: Boolean,default : true},
    fileUrl :{type: String, default: ''},
    uploadedlDate : {type : Date , default : Date.now},
    originalName : {type: String, default: ''},
    encoding : {type: String, default: ''},
    mimeType : {type: String, default: ''},
    destination : {type : String , default : ''},
    fileName : {type: String, default: ''},
    fileSize : {type : Number}
  });
  
  /*
   define main document schema
  */
  
  var blueprintSchema = new mongoose.Schema({
    name: { type: String, default: ''},
    noOfDownloads : {type : Number , default :0},
    shortListCount : {type : Number , default : 0},
    pageViews : {type :  Number , default : 0},
    seoNTags : {type : String , default : ''},
    uniqueIdentifier : {type :  String , default : ''},
    coverPhoto : {type : String , default : ''},
    photoGallery : [{ type: mongoose.Schema.Types.ObjectId, ref: 'PhotoGallery' }],
    uploadedFile : [uploadedFileSchema],
    editableFile : [uploadedFileSchema],              
    categories : [{ type: mongoose.Schema.Types.ObjectId, ref: 'Category' }],
    actualCategories : [{type : mongoose.Schema.Types.ObjectId , ref : 'Category'}],
    isParentCategoriesApplied : {type :  Boolean , default : false},
    /*
      to do - make attributeInfo single object not array
     */
    attributes : [{attributeInfo :{ type: mongoose.Schema.Types.ObjectId, ref: 'Attribute' } ,attributeValue :[{type: String}],attributeValueM :[{type: String}] }],
    // date of publish of product from our end
    publishedDate : {type : Date},
    createdBy : {type: String , default : ''},
    createdDate : {type: Date,default : Date.now},
    // if product is live on our site
    isPublished : {type : Boolean , default : false},
    // time of last product editing
    updatedDate : {type : Date},
    search: [String]
    },
    {
      timestamps: { createdAt: 'created_at' , updatedAt : 'updated_at'}
    }
  );
  blueprintSchema.plugin(require('./plugins/pagedFind'));
  var deepPopulate = require('mongoose-deep-populate')(mongoose);
  blueprintSchema.plugin(deepPopulate,{
    populate: {
      'attributes.attributeInfo' : {
         select : 'name description',
      },
      'categories': {
        select: 'name attributesSet categoryLevel level'
      },
      'categories.attributesSet': {
        select: 'name attributes'
      },
      'categories.attributesSet.attributes': {
        select: 'name description'
      },
      'actualCategories': {
        select: 'name attributesSet categoryLevel level'
      },
      'actualCategories.attributesSet': {
        select: 'name attributes'
      },
      'actualCategories.attributesSet.attributes': {
        select: 'name description'
      }
    }
  });

  blueprintSchema.index({ name: 1 });
  blueprintSchema.index({ isPublished : 1 });
  blueprintSchema.index({ noOfDownloads : 1 });
  blueprintSchema.index({ categories : 1},{ sparse: true });
  blueprintSchema.index({ attributes : 1 });
  blueprintSchema.index({ 'attributes.attributeInfo' : 1 });
  // blueprintSchema.index({ categories : 1 , attributes : 1 });
  blueprintSchema.index({ categories : 1 ,'attributes.attributeValueM' : 1 },{ sparse: true });
  blueprintSchema.index({ actualCategories : 1 },{ sparse: true });
  blueprintSchema.index({ 'actualCategories.name' : 1 });
  blueprintSchema.index({ 'categories.name' : 1 });
  blueprintSchema.index({ 'categories.name' : 1 }, { 'categories.level' : 1 } ,{ 'categories.parentName' : 1 });
  // blueprintSchema.index({ actualCategories : 1 });
  blueprintSchema.index({ 'attributes.attributeValueM' : 1 });
  blueprintSchema.index({ search: 1 });
  blueprintSchema.set('autoIndex', (app.get('env') === 'development'));
  app.db.model('Blueprint', blueprintSchema);
};
