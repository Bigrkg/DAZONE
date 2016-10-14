'use strict';
var getCallbackUrl = function(hostname, provider){
  return 'http://' + hostname + '/account/settings/' + provider + '/callback';
};

var sendVerificationEmail = function(req, res, options) {
  req.app.utility.sendmail(req, res, {
    from: req.app.config.smtp.from.name +' <'+ req.app.config.smtp.from.address +'>',
    to: options.email,
    subject: 'Verify Your '+ req.app.config.projectName +' Account',
    textPath: 'account/verification/email-text',
    htmlPath: 'account/verification/email-html',
    locals: {
      verifyURL: req.protocol +'://'+ req.headers.host +'/account/verification/' + options.verificationToken,
      projectName: req.app.config.projectName
    },
    success: function() {
      console.log('mail send succ');
      options.onSuccess();
    },
    error: function(err) {
      options.onError(err);
      console.log('mail send err');
    }
  });
};

var disconnectSocial = function(provider, req, res, next){
  provider = provider.toLowerCase();
  var outcome = {};
  var fieldsToSet = {};
  fieldsToSet[provider] = { id: undefined };
  req.app.db.models.User.findByIdAndUpdate(req.user.id, fieldsToSet, function (err, user) {
    if (err) {
      outcome.errors = ['error disconnecting user from their '+ provider + ' account'];
      outcome.success = false;
      return res.status(200).json(outcome);
    }
    outcome.success = true;
    return res.status(200).json(outcome);
  });
};

var connectSocial = function(provider, req, res, next){
  provider = provider.toLowerCase();
  var workflow = req.app.utility.workflow(req, res);
  workflow.on('loginSocial', function(){
    req._passport.instance.authenticate(provider, { callbackURL: getCallbackUrl(req.app.config.hostname, provider) }, function(err, user, info) {
      if(err){
        return workflow.emit('exception', err);
      }
      if (!info || !info.profile) {
        workflow.outcome.errors.push(provider + '  user not found');
        return workflow.emit('response');
      }

      workflow.profile = info.profile;
      return workflow.emit('findUser');
    })(req, res, next);
  });

  workflow.on('findUser', function(){
    var option = { _id: { $ne: req.user.id } };
    option[provider +'.id'] = workflow.profile.id;
    req.app.db.models.User.findOne(option, function(err, user) {
      if (err) {
        return workflow.emit('exception', err);
      }

      if (user) {
        //found another existing user already connects to provider
        workflow.outcome.errors.push('Another user has already connected with that '+ provider +' account.');
        return workflow.emit('response');
      }
      else {
        return workflow.emit('linkUser');
      }
    });
  });

  workflow.on('linkUser', function(){
    var fieldsToSet = {};
    fieldsToSet[provider] = {
      id: workflow.profile.id,
      profile: workflow.profile
    };

    req.app.db.models.User.findByIdAndUpdate(req.user.id, fieldsToSet, function(err, user) {
      if (err) {
        return workflow.emit('exception', err);
      }
      return workflow.emit('response');
    });
  });

  workflow.emit('loginSocial');
};

// public api
var account = {
   dateFilter : function(date) {
  
      var dateformat = /^(0?[1-9]|[12][0-9]|3[01])[\/\-](0?[1-9]|1[012] )[\/\-]\d{4}$/;
      // Match the date format through regular expression
      if(dateformat.exec(date))
      {
        var pdate = date.split('-');
        var mm  = parseInt(pdate[1]);
        var dd = parseInt(pdate[0]);
        var yy = parseInt(pdate[2]);
      // Create list of days of a month [assume there is no leap year by default]
        var ListofDays = [31,28,31,30,31,30,31,31,30,31,30,31];
        if (mm==1 || mm>2) {
          if (dd>ListofDays[mm-1]) {
             return false;
          }
          return true;
        }
        if (mm==2) {
          var lyear = false;
          if ( (!(yy % 4) && yy % 100) || !(yy % 400)) {
            console.log('29');
            lyear = true;
          }
          if ((lyear==false) && (dd>=29)) {
            return false;
          }
          if ((lyear==true) && (dd>29)) {
            return false;
          }

          return true;
        }
      }
      else {
        return false;
      }
  },
  getAccountDetails: function(req, res, next){
    var outcome = {};

    var getAccountData = function(callback) {
      req.app.db.models.CustomerAccount.findById(req.user.customerAccount.id, 'name about.about about.gender about.dateOfBirth contact.city contact.locality contact.phone contact.state contact.address contact.email shortListedData').exec(function(err, account) {
        if (err) {
          return callback(err, null);
        }

        outcome.account = account;
        callback(null, 'done');
      });
    };

    var getUserData = function(callback) {
      req.app.db.models.Customer.findById(req.user.id, 'username email twitter.id facebook.id google.id').exec(function(err, user) {
        if (err) {
          callback(err, null);
        }

        outcome.user = user;
        return callback(null, 'done');
      });
    };

    var asyncFinally = function(err, results) {
      if (err) {
        return next(err);
      }
      res.status(200).json(outcome);
    };

    require('async').parallel([getAccountData, getUserData], asyncFinally);
  },
  basic: function(req, res, next) {
    var workflow = req.app.utility.workflow(req, res);

    workflow.on('validate', function() {
      
      if(req.body.about && !/^[a-zA-Z0-9\-\_\ ]+$/.test(req.body.about)) {
          workflow.outcome.errfor.about = 'only use letters, numbers, \'-\', \'_\'';
      }

      if (!req.body.customername) {
        workflow.outcome.errfor.customername = 'required';
      }
      else if (!/^[a-zA-Z0-9\-\_\ ]+$/.test(req.body.customername)) {
        workflow.outcome.errfor.customername = 'only use letters, numbers, \'-\', \'_\'';
      }


      if (req.body.first && !/^[a-zA-Z0-9\-\_\ ]+$/.test(req.body.first)) {
        workflow.outcome.errfor.first = 'only use letters, numbers, \'-\', \'_\'';
      }

      if (req.body.last && !/^[a-zA-Z0-9\-\_\ ]+$/.test(req.body.first)) {
        workflow.outcome.errfor.first = 'only use letters, numbers, \'-\', \'_\'';
      } 

      if (req.body.last && req.body.last && req.body.last == req.body.first) {
        workflow.outcome.errfor.first = 'first name and last name can\'t be same';
      }

      if (!req.body.dateOfBirth) {
        workflow.outcome.errfor.dateOfBirth = 'please select date of birthday';
      }
      else if(!account.dateFilter(req.body.dateOfBirth)) {
          workflow.outcome.errfor.dateOfBirth = 'date format is wrong - pass as Date-Month-Year(DD-MM-YYYY)';
      }

      if (!req.body.gender) {
        workflow.outcome.errfor.gender = 'please select gender';
      }
      else if(!/^(male|female)$/.test(req.body.gender)) {
        workflow.outcome.errfor.gender = 'please select gender male or female only';
      } 


      
      if (workflow.hasErrors()) {
        return workflow.emit('response');
      }

      workflow.emit('patchAccount');
    });

    workflow.on('patchAccount', function() {

      console.log(req.body.dateOfBirth);
      var fieldsToSet = {
        name: {
          first: req.body.first,
          middle: req.body.middle,
          last: req.body.last,
          full: req.body.first +' '+ req.body.last,
          display : req.body.customername
        },
        'about.about' : req.body.about,
        'about.gender' : req.body.gender,
        'about.dateOfBirth' : new Date(req.body.dateOfBirth).toISOString(),
        search: [
          req.body.first,
          req.body.middle,
          req.body.last
        ]
      };
        var options = { select: 'name about' , new: true };
      // var options = {  };

      req.app.db.models.CustomerAccount.findByIdAndUpdate(req.user.customerAccount.id, fieldsToSet, options, function(err, account) {
        if (err) {
          return workflow.emit('exception', err);
        }

        workflow.outcome.account = account;

        workflow.emit('patchUser');

        //return workflow.emit('response');
      });
    });

    workflow.on('patchUser', function() {
      var fieldsToSet = {
          customername : req.body.customername
      };

      var options = { select: 'customername' };

      req.app.db.models.Customer.findByIdAndUpdate(req.user.id, fieldsToSet, options, function(err, account) {
        if (err) {
          return workflow.emit('exception', err);
        }
        return workflow.emit('response');
      });
      
    });

    workflow.emit('validate');
  },
  contact: function(req, res, next) {
    var workflow = req.app.utility.workflow(req, res);

    workflow.on('validate', function() {
      if (req.body.email && !/^[a-zA-Z0-9\-\_\.\+]+@[a-zA-Z0-9\-\_\.]+\.[a-zA-Z0-9\-\_]+$/.test(req.body.email)) {
        workflow.outcome.errfor.email = 'invalid email format';
      }

      if(req.body.phone && !/^\(?([0-9]{3})\)?[-. ]?([0-9]{3})[-. ]?([0-9]{4})$/.test(req.body.phone)){
        workflow.outcome.errfor.phone = 'invalid phone format' ;
      }

      if (req.body.address && !/^[a-zA-Z0-9\-_!@#$%\^&*)(+=.:;?\s]+$/.test(req.body.address)) {
        workflow.outcome.errfor.address = 'only use letters, numbers, \'-\', \'_\'';
      }

      if(req.body.city && !/^(delhi|banglore|gurgaon|noida)$/.test(req.body.city)) {
        workflow.outcome.errfor.city = 'please select city from provided data';
      }

      if(req.body.locality && !/^(sector 14|cp|hauz khas|delhi|noida|gurgaon|banglore)$/.test(req.body.locality)) {
        workflow.outcome.errfor.locality = 'please select locality from provided city data';
      }

      if (workflow.hasErrors()) {
        return workflow.emit('response');
      }

      workflow.emit('populateLoginedUser');
    });

    workflow.on('populateLoginedUser', function() {
      req.app.db.models.Customer.findById(req.user.id).populate('customerAccount','customer').exec(function(err, loginedUser) {
        if (err) {
          return workflow.emit('exception', err);
        }
        console.log('user'+loginedUser);

        workflow.emit('duplicateEmailCheck',loginedUser);
      });
    });

    workflow.on('duplicateEmailCheck', function(loginedUser) {
      req.app.db.models.Customer.findOne({ email: req.body.email && req.body.email != undefined ? req.body.email.toLowerCase() : '', _id: { $ne: req.user.id } }, function(err, user) {
        if (err) {
          return workflow.emit('exception', err);
        }

        if (user) {
          workflow.outcome.errfor.email = 'email already taken';
          return workflow.emit('response');
        }
        console.log('user2'+loginedUser);
        // workflow.emit('patchUser');
        workflow.emit('patchAccount', loginedUser);
      });
    });

    // workflow.on('patchUser', function() {
    //   var fieldsToSet = {
    //     // username: req.body.username,
    //     email: req.body.email.toLowerCase(),
    //     search: [
    //       req.body.username,
    //       req.body.email
    //     ]
    //   };
    //   var options = { select: 'username email twitter.id github.id facebook.id google.id' };

    //   req.app.db.models.User.findByIdAndUpdate(req.user.id, fieldsToSet, options, function(err, user) {
    //     if (err) {
    //       return workflow.emit('exception', err);
    //     }

    //     workflow.emit('patchAccount', user);
    //   });
    // });
    // 
    
   /*
     later - any account having same contact email ????????

    */
    workflow.on('patchAccount', function(customer) {
      console.log(customer);
      if (customer.customerAccount) {
        var fieldsToSet = {
          contact : {
            address : req.body.address && req.body.address != undefined ? req.body.address : '',
            city : req.body.city && req.body.city != undefined ? req.body.city : '',
            locality : req.body.locality && req.body.locality != undefined ? req.body.locality : '',
            phone : req.body.phone && req.body.phone != undefined ? req.body.phone : '',
            email : req.body.email && req.body.email != undefined ? req.body.email : '',
          }
        };
        req.app.db.models.CustomerAccount.findByIdAndUpdate(customer.customerAccount.id, fieldsToSet, function(err, account) {
          if (err) {
            return workflow.emit('exception', err);
          }

          workflow.emit('populateUser', customer);
        });
      }
      else {
        workflow.emit('populateUser', customer);
      }
    });
   
    workflow.on('populateUser', function(user) {
      user.populate('customerAccount', 'contact', function(err, populatedUser) {
        if (err) {
          return workflow.emit('exception', err);
        }

        workflow.outcome.contact = populatedUser;
        workflow.emit('response');
      });
    });

    workflow.emit('validate');
  },
  login: function(req, res, next){
    var workflow = req.app.utility.workflow(req, res);

    workflow.on('validate', function() {
      if (!req.body.password) {
        workflow.outcome.errfor.password = 'required';
      }
      else if (!/^[a-zA-Z0-9\-_!@#$%\^&*)(+=.:;?\s]+$/.test(req.body.password)) {
        workflow.outcome.errfor.password = 'only use letters, numbers and special characters';
      }

      if (!req.body.confirm) {
        workflow.outcome.errfor.confirm = 'required';
      }

      if (req.body.password !== req.body.confirm) {
        workflow.outcome.errors.push('Passwords do not match.');
      }

      if (workflow.hasErrors()) {
        return workflow.emit('response');
      }

      workflow.emit('patchUser');
    });

    workflow.on('patchUser', function() {
      req.app.db.models.Customer.encryptData(req.body.password, function(err, hash) {
        if (err) {
          return workflow.emit('exception', err);
        }

        var fieldsToSet = { password: hash };
        req.app.db.models.Customer.findByIdAndUpdate(req.user.id, fieldsToSet, function(err, user) {
          if (err) {
            return workflow.emit('exception', err);
          }

          user.populate('customerAccount', 'name', function(err, user) {
            if (err) {
              return workflow.emit('exception', err);
            }

            workflow.outcome.password = '';
            workflow.outcome.confirm = '';
            workflow.emit('response');
          });
        });
      });
    });

    workflow.emit('validate');
  },
  upsertVerification: function(req, res, next){
    var workflow = req.app.utility.workflow(req, res);

    workflow.on('generateTokenOrSkip', function() {
      if (req.user.customerAccount.about.isVerified === true) {
        workflow.outcome.errors.push('account already verified');
        return workflow.emit('response');
      }
      if (req.user.customerAccount.tokens.verificationToken !== '') {
        //token generated already
        return workflow.emit('response');
      }

      workflow.emit('generateToken');
    });

    workflow.on('generateToken', function() {
      var crypto = require('crypto');
      crypto.randomBytes(21, function(err, buf) {
        if (err) {
          return next(err);
        }

        var token = buf.toString('hex');
        req.app.db.models.Customer.encryptData(token, function(err, hash) {
          if (err) {
            return next(err);
          }

          workflow.emit('patchAccount', token, hash);
        });
      });
    });

    workflow.on('patchAccount', function(token, hash) {
      var fieldsToSet = { 'tokens.verificationToken': hash };
      req.app.db.models.CustomerAccount.findByIdAndUpdate(req.user.customerAccount.id, fieldsToSet, function(err, account) {
        if (err) {
          return workflow.emit('exception', err);
        }

        sendVerificationEmail(req, res, {
          email: req.user.email,
          verificationToken: token,
          onSuccess: function() {
            return workflow.emit('response');
          },
          onError: function(err) {
            return next(err);
          }
        });
      });
    });

    workflow.emit('generateTokenOrSkip');
  },
  resendVerification: function(req, res, next){
    var workflow = req.app.utility.workflow(req, res);

    if (req.user.customerAccount.about.isVerified === true) {
      workflow.outcome.errors.push('account already verified');
      return workflow.emit('response');
    }

    workflow.on('validate', function() {
      if (!req.body.email) {
        workflow.outcome.errfor.email = 'required';
      }
      else if (!/^[a-zA-Z0-9\-\_\.\+]+@[a-zA-Z0-9\-\_\.]+\.[a-zA-Z0-9\-\_]+$/.test(req.body.email)) {
        workflow.outcome.errfor.email = 'invalid email format';
      }

      if (workflow.hasErrors()) {
        return workflow.emit('response');
      }

      workflow.emit('duplicateEmailCheck');
    });

    workflow.on('duplicateEmailCheck', function() {
      req.app.db.models.Customer.findOne({ email: req.body.email.toLowerCase(), _id: { $ne: req.user.id } }, function(err, user) {
        if (err) {
          return workflow.emit('exception', err);
        }

        if (user) {
          workflow.outcome.errfor.email = 'email already taken';
          return workflow.emit('response');
        }

        workflow.emit('patchUser');
      });
    });

    workflow.on('patchUser', function() {
      var fieldsToSet = { email: req.body.email.toLowerCase() };
      var options = { new: true };
      req.app.db.models.Customer.findByIdAndUpdate(req.user.id, fieldsToSet, options, function(err, customer) {
        if (err) {
          return workflow.emit('exception', err);
        }

        workflow.customer = customer;
        workflow.emit('generateToken');
      });
    });

    workflow.on('generateToken', function() {
      var crypto = require('crypto');
      crypto.randomBytes(21, function(err, buf) {
        if (err) {
          return next(err);
        }

        var token = buf.toString('hex');
        req.app.db.models.Customer.encryptData(token, function(err, hash) {
          if (err) {
            return next(err);
          }

          workflow.emit('patchAccount', token, hash);
        });
      });
    });

    workflow.on('patchAccount', function(token, hash) {
      var fieldsToSet = { 'tokens.verificationToken': hash };
      req.app.db.models.CustomerAccount.findByIdAndUpdate(req.user.customerAccount.id, fieldsToSet, function(err, account) {
        if (err) {
          return workflow.emit('exception', err);
        }

        sendVerificationEmail(req, res, {
          email: workflow.customer.email,
          verificationToken: token,
          onSuccess: function() {
            workflow.emit('response');
          },
          onError: function(err) {
            workflow.outcome.errors.push('Error Sending: '+ err);
            workflow.emit('response');
          }
        });
      });
    });

    workflow.emit('validate');
  },
  verify: function(req, res, next){
    var outcome = {};
    req.app.db.models.Customer.validateData(req.params.token, req.user.customerAccount.tokens.verificationToken, function(err, isValid) {
      if (!isValid) {
        outcome.errors = ['invalid verification token'];
        outcome.success = false;
        return res.status(200).json(outcome);
      }

      var fieldsToSet = { 'about.isVerified': true, 'tokens.verificationToken': '' };
      req.app.db.models.CustomerAccount.findByIdAndUpdate(req.user.customerAccount._id, fieldsToSet, function(err, account) {
        if (err) {
          return next(err);
        }
        outcome.success = true;
        outcome.user = {
          id: req.user._id,
          email: req.user.email,
          isVerified: true
        };
        return res.status(200).json(outcome);
      });
    });
  },

  disconnectGoogle: function (req, res, next) {
    return disconnectSocial('google', req, res, next);
  },

  disconnectFacebook: function(req, res, next){
    return disconnectSocial('facebook', req, res, next);
  },

  connectGoogle: function(req, res, next){
    return connectSocial('google', req, res, next);
  },

  connectFacebook: function(req, res, next){
    return connectSocial('facebook', req, res, next);
  }
};
module.exports = account;