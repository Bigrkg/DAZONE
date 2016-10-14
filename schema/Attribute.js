'use strict';

exports = module.exports = function(app, mongoose) {
  var attributeSchema = new mongoose.Schema({
     _creator : { type: mongoose.Schema.Types.ObjectId, ref: 'AttributeSet' },
    name : {type : String,unique: false,default : ''},
    // attrType means numeric ya alpaNumeric
    attrType : {type : String ,default : 'alpaNumeric'},
    parseUnit : {type :  String ,default : ''},
    isPublished : {type : Boolean , default : false},
    useFilter : {type : Boolean,default:false},
    useCompare : {type : Boolean,default : false},
    rangeSet : [
                 {
                    minimum : {type : Number,default :''},
                    maximum : {type : Number , default : ''}
                 }
    ],
    specificValue : {
                  value : {type : String , default : ''},
                  extraData : {type  : String , default :''}
    },
    // description means attribute values like in color -white ,red ,black etc
    description : [{type :  String,default : ''}],
    createdDate : {type: Date,default : Date.now},
    publishedDate: { type: Date },
    updatedDate : {type : Date},
    createdBy : {type:String},
    updatedBy : {type:String},
    search: [String]
  });
  attributeSchema.plugin(require('./plugins/pagedFind'));
  attributeSchema.index({ 'name': 1 });
  attributeSchema.index({ 'attrType': 1 });
  attributeSchema.index({ 'parseUnit': 1 });
  attributeSchema.index({ 'useFilter': 1 });
  attributeSchema.index({ 'useCompare': 1 });
  attributeSchema.index({'rangeSet[0].minimum' : 1});
  attributeSchema.index({ 'rangeSet[0].maximum': 1 });
  attributeSchema.index({ 'specificValue': 1 });
  attributeSchema.index({ 'isPublished': 1 });
  attributeSchema.index({ search: 1 });
  attributeSchema.set('autoIndex', (app.get('env') === 'development'));
  app.db.model('Attribute', attributeSchema);
};

