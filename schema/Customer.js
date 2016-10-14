'use strict';

exports = module.exports = function(app, mongoose) {
  
  /*
  ////////////// builtin validator \\\\\\\\\\\\\\\\\\ 
  */   
  
  /*
  ////////////// builtin validator ends \\\\\\\\\\\\\\\\\\ 
  */
 
  /*
  ////////////// custom validator \\\\\\\\\\\\\\\\\\ 
  */   
   var strengthNameValidator =  [
    function(val) {
      return /^(weak|good|strong|' ')$/.test(val);
    },
    // custom error text
    'value must be weak or good or strong']; 
  
  /*
  ////////////// custom validator ends \\\\\\\\\\\\\\\\\\ 
  */


  var customerSchema = new mongoose.Schema({
    customername: { type: String, unique: true },
    email: { type: String, unique: true },
    password: String, 
    passwordStrength : { 
      strengthName : { type: String,default : 'weak' },
      strengthScore :{ type : Number , default : 30 }  
    },
    termsOfUse : { type : Boolean , default : false },
    customerAccount: { type: mongoose.Schema.Types.ObjectId, ref: 'CustomerAccount' },
    /*
      new Date('Dec 26,2013')
    */
    social : {
      twitter: {},
      github: {},
      facebook: {},
      google: {},
      tumblr: {}
    },
    search: [String]
  });
  customerSchema.methods.isVerified = function(done){
    this.populate('customerAccount', function(err, customer){
      if(err){
        return done(err);
      }
      var flag = customer.customerAccount && customer.customerAccount.about.isVerified === true;
      return done(null, flag);
    });
  };
  
  customerSchema.methods.defaultReturnUrl = function() {
    var returnUrl = '/#/home';
    return returnUrl;
  };

  customerSchema.methods.canPlayRoleOf = function(role) {
    
    if (role === "account" && this.customerAccount) {
      return true;
    }

    return false;
  };

  customerSchema.statics.encryptData = function(password, done) {
    var bcrypt = require('bcryptjs');
    bcrypt.genSalt(10, function(err, salt) {
      if (err) {
        return done(err);
      }

      bcrypt.hash(password, salt, function(err, hash) {
        done(err, hash);
      });
    });
  };
  customerSchema.statics.validateData = function(password, hash, done) {
    var bcrypt = require('bcryptjs');
    bcrypt.compare(password, hash, function(err, res) {
      done(err, res);
    });
  };
  customerSchema.plugin(require('./plugins/pagedFind'));
  customerSchema.index({ username: 1 });
  customerSchema.index({ email: 1 });
  customerSchema.index({ 'twitter.id': 1 });
  customerSchema.index({ 'github.id': 1 });
  customerSchema.index({ 'facebook.id': 1 });
  customerSchema.index({ 'google.id': 1 });
  customerSchema.index({ search: 1 });
  customerSchema.set('autoIndex', (app.get('env') === 'development'));
  app.db.model('Customer', customerSchema);
};
