'use strict';

exports = module.exports = function(app, mongoose) {

  /*
  ////////////// custom validator \\\\\\\\\\\\\\\\\\ 
  */  
  
  var genderValidator =  [
    function(val) {
      return /^(male|female)$/.test(val);
    },
    // custom error text
    'value must be male or female'];

  var phoneValidator =  [
    function(val) {
      return /^\(?([0-9]{3})\)?[-. ]?([0-9]{3})[-. ]?([0-9]{4})$/.test(val);
    },
    // custom error text
    'not a valid phone number'];


  /*
  ////////////// custom validator ends \\\\\\\\\\\\\\\\\\ 
  */
  

  var nameSchema = new mongoose.Schema({
    first: { type: String, default: '' },
    middle: { type: String, default: '' },
    last: { type: String, default: '' },
    full: { type: String, default: '' },
    display : {type : String , default : ''}
  });

  var contactSchema = new mongoose.Schema({
    address : { type : String , default : '' },
    state : {type : String , default : '' },
    city : { type : String , default : '' },
    locality : { type : String , default : ''},
    phone : { type : Number  },
    zip : { type : String },
    company : { type : String },
    email : { type : String },
  });

  var aboutSchema = new mongoose.Schema({
    about : { type : String , default : ''},
    dateOfBirth : { type : Date },
    gender : { type : String, default : 'male', validate : genderValidator },
    isVerified: { type: Boolean, default: false },
    isActive: {type : Boolean , default : false},
  });

  var tokensSchema = new mongoose.Schema({
    verificationToken: { type: String, default: '' },
    verificationEmailToken  : { type: String, default: '' },
    verificationEmailTokenExpires : {type : Date},
    resetPasswordToken: { type: String, default: '' },
    resetPasswordTokenExpires: {type : Date},
  });
  



  var accountSchema = new mongoose.Schema({
    customer: {
      id: { type: mongoose.Schema.Types.ObjectId, ref: 'Customer' },
      name: { type: String, default: '' }
    },
    name: nameSchema,
    contact : contactSchema,
    about : aboutSchema,
    tokens : tokensSchema,
    shortListedData : 
    {
      blueprints : [{
          name : { type : String , default : ''},
          dataId : { type: mongoose.Schema.Types.ObjectId, ref: 'Blueprint' }
      }],
      products : [{
          name : { type : String , default : ''},
          dataId : { type: mongoose.Schema.Types.ObjectId, ref: 'Product' }
      }]   
    },
    status: {
      id: { type: String, ref: 'Status' },
      name: { type: String, default: '' },
      customerCreated: {
        id: { type: mongoose.Schema.Types.ObjectId, ref: 'Customer' },
        name: { type: String, default: '' },
        time: { type: Date, default: Date.now }
      }
    },
    statusLog: [mongoose.modelSchemas.StatusLog],
    customerCreated: {
      id: { type: mongoose.Schema.Types.ObjectId, ref: 'Customer' },
      name: { type: String, default: '' },
      time: { type: Date, default: Date.now }
    },
    search: [String]
  });
  accountSchema.plugin(require('./plugins/pagedFind'));
  accountSchema.index({ customer: 1 });
  accountSchema.index({ contact: 1 });
  accountSchema.index({ 'tokens.verificationEmailToken' : 1});
  accountSchema.index({ 'status.id': 1 });
  accountSchema.index({ 'shortListedData' : 1 });
  accountSchema.index({ 'shortListedData.blueprints' : 1 });
  accountSchema.index({ 'shortListedData.products' : 1 });
  accountSchema.index({ search: 1 });
  accountSchema.set('autoIndex', (app.get('env') === 'development'));
  app.db.model('CustomerAccount', accountSchema);
};
