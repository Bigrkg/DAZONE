'use strict';

exports = module.exports = function(app, mongoose) {
  




  var generalAttributesSchema = new mongoose.Schema({
    mrp : {amount : {type : Number} , currency : {type :  String , default : 'INR'}},
    effectivePrice : {amount : {type : Number} , currency : {type :  String , default : 'INR'}},
    inStock : {type: Boolean , default : true},
    // availability means product exist on site
    availability : {type : Boolean , default :true},
    codAvailable: {type : Boolean ,default : false},
    emiAvailable: {type : Boolean ,default : false},
    offers: {type : String,default : ''},
    discount: {type: Number,default : ''},
    cashBack:  {type: Number , default : ''},
    size: {type: Number , default : ''},
    color: {type : String , default : true},
    sizeUnit: {type: Number ,default : ''},
    wheelsIncluded : {type : Boolean ,default : false},
    sizeVariants: {type : String ,default : ''},
    colorVariants: {type : String , default : ''},
    styleCode: {type : String , default : ''},
    upholsteryIncluded : {type : Boolean ,default : false},
    upholsteryType : {type : String,default : ''},
    suitableFor : {type : String , default : ''},
    bushIncluded : {type : Boolean ,default : false},
    finishType : {type : String ,default : ''},
    careInstructions :{type : String , default : ''},
    partner : {type : String ,default : ''}
  });

  var attributesSchema = new mongoose.Schema({
    general : generalAttributesSchema,
    dimensions : {
      maximumLoadCapacity : {type: Number ,default : ''}, 
      weight :  {type: Number , default : ''},
      height :  {type : Number , default : ''},
      width :   {type : Number , default : ''},
      depth :   {type : Number , default : ''}
    },
    materialnColor: {
      primaryMaterial : {type : String ,default : ''},
      primaryColor : {type : String , default : ''},
      secondaryMaterial: {type : String , default : ''},
      finishColor : {type : String ,default : ''},
      primaryMaterialSubtype:{type : String , default : ''},
    }
  });


  var cronSchema = new mongoose.Schema({
    productId: {type: String, default: ''},
    title : {type: String , default: ''},
    description : {type : String , default : ''},
    photoGallery: {
      'default' : {type : String,default : ''},
      '200x200' : {type : String, default : ''},
      '400x400' : {type : String, default : ''},
      '800x800' : {type : String, default : ''}
    },
    productUrl: {type: String, default: ''},
    categories : {type : String},
    categoryName : {type : String},
    subCategoryName : {type : String},
    attributes : attributesSchema,
    productBrand: {type : String}
  });

  var productSchema = new mongoose.Schema({
    cronData : cronSchema,
    title: { type: String, default: ''},
    description: { type : String,default :'' },
    // pageViews : { type : Number , default : 0 },
    shortListCount : {type : Number , default : 0},
    coverPhoto : {type : String , default : ''},
    uniqueIdentifier : {type :  String , default : ''},
    photoGallery : [{ type: mongoose.Schema.Types.ObjectId, ref: 'PhotoGallery' }],
    productUrl : {type : String ,default : ''},
    categories : [{ type: mongoose.Schema.Types.ObjectId, ref: 'Category' }],
    actualCategories : [{ type: mongoose.Schema.Types.ObjectId, ref: 'Category' }],
    isParentCategoriesApplied : {type :  Boolean , default : false},
    attributes : [{
             attributeInfo :{ type: mongoose.Schema.Types.ObjectId, ref: 'Attribute' } ,
             attributeValue : [{type :  String}],
             attributeValueM : [{type :  String}] 
    }],
    productBrand : {type :  String},
    //source is flipkart /snapdeal etc
    source : {type: String, default: ''},
    createdDate : {type: Date,default : Date.now},
    crawlDate : {type : Date , default : Date.now},
    // date of publish of product from our end
    publishedDate : {type : Date},
    pageViews : {type :  Number , default : 0},
    seoNTags : {type : String , default : ''},
    // if product is live on our site 
    isPublished : {type : Boolean , default : false},
    // time of last product editing
    updatedDate : {type : Date},
    // test for link
    lastTestedDate : {type : Date },
    // set true if link expired or not found
    isExpired :  {type : Boolean,default : false},
     // if link expired from source site
    expiryDate : {type : Date},
    stausCode : {type : Number , default : 200},
    // final link is mended link
    finalLink : {type : String,default : ''},
    crawlTime : {type :  String},
    search: [String]
    },
    {
      timestamps: { createdAt: 'created_at' , updatedAt : 'updated_at'}
    });
  productSchema.plugin(require('./plugins/pagedFind'));
  var deepPopulate = require('mongoose-deep-populate')(mongoose);
  // productSchema.plugin(deepPopulate,{
  //   whitelist: ['categories.attributesSet.attributes']
  // });
  productSchema.plugin(deepPopulate,{
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
      }
    }
  });
  
  productSchema.pre('save', function(next) {
    console.log('first condition');
    if(typeof this.shortListCount === 'number') { 
       console.log('updated');      
       next();
    }
  });

  productSchema.index({ name: 1 });
  productSchema.index({ 'cronData.productUrl': 1 });
  productSchema.index({ 'cronData.title': 1 });
  productSchema.index({ source: 1 });
  productSchema.index({ description: 1 });
  productSchema.index({ link: 1 });
  productSchema.index({ pageViews : 1 });
  productSchema.index({ categories : 1},{ sparse: true });
  productSchema.index({ attributes : 1 });
  productSchema.index({ 'attributes.attributeInfo' : 1 });
  // productSchema.index({ categories : 1 , attributes : 1 });
  productSchema.index({ 'attributes.attributeValue' : 1 });
  productSchema.index({ 'attributes.attributeValueM' : 1 });
  productSchema.index({ actualCategories : 1 },{ sparse: true });
  productSchema.index({ 'actualCategories.name' : 1 });
  productSchema.index({ 'categories.name' : 1 });
  productSchema.index({ 'categories.name' : 1 }, { 'categories.level' : 1 } ,{ 'categories.parentName' : 1 });
  productSchema.index({ 'attributes.attributeValueM' : 1 });
  productSchema.index({ search: 1 });
  productSchema.set('autoIndex', (app.get('env') === 'development'));
  app.db.model('Product', productSchema);
};
