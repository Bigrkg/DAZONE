'use strict';

var security = {
  filterCustomer : function (customer) {
    console.log(customer);
    if (customer) {
      return {
        id: customer._id,
        email: customer.email,
        name: customer.customername,
        //lastName: customer.lastName,
        isVerified: !!(customer.customerAccount.about.isVerified === true)
        //isVerified: !!(customer.roles && customer.roles.account && customer.roles.account.isVerified && customer.roles.account.isVerified === 'yes')
      };
    }
    return null;
  },
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
  passwordStrength :  function(pass) {
    var score = 0;
    if (!pass)
        return score;

    // award every unique letter until 5 repetitions
    var letters = new Object();
    for (var i=0; i<pass.length; i++) {
        letters[pass[i]] = (letters[pass[i]] || 0) + 1;
        score += 5.0 / letters[pass[i]];
    }

    // bonus points for mixing it up
    var variations = {
        digits: /\d/.test(pass),
        lower: /[a-z]/.test(pass),
        upper: /[A-Z]/.test(pass),
        nonWords: /\W/.test(pass),
    };
    var variationCount = 0;
    for (var check in variations) {
        variationCount += (variations[check] == true) ? 1 : 0;
    }
    score += (variationCount - 1) * 10;

    return parseInt(score);

  },
  sendCurrentCustomer: function (req, res, next) {
    res.status(200).json({customer: security.filterCustomer(req.user)});
  },
  contact: function(req, res){
    var workflow = req.app.utility.workflow(req, res);
    
    workflow.on('validate', function() {
      if (!req.body.customername) {
        workflow.outcome.errfor.customername = 'required';
      }
      else if (!/^[a-zA-Z0-9\-\_\ ]+$/.test(req.body.customername)) {
        workflow.outcome.errfor.customername = 'only use letters, numbers, \'-\', \'_\'';
      }

      if (!req.body.email) {
        workflow.outcome.errfor.email = 'required';
      }
      else if (!/^[a-zA-Z0-9\-\_\.\+]+@[a-zA-Z0-9\-\_\.]+\.[a-zA-Z0-9\-\_]+$/.test(req.body.email.toLowerCase())) {
        workflow.outcome.errfor.email = 'invalid email format';
      }

      if (!req.body.password) {
        workflow.outcome.errfor.password = 'required';
      }
      else if (!/^[a-zA-Z0-9\-_!@#$%\^&*)(+=.:;?\s]+$/.test(req.body.password)) {
        workflow.outcome.errfor.password = 'only use letters, numbers, \'-\', \'_\'';
      }

      if (!req.body.confirmPassword) {
        workflow.outcome.errfor.confirmPassword = 'required';
      }

      if (req.body.confirmPassword != req.body.confirmPassword) {
        workflow.outcome.errfor.confirmPassword = 'confirm password should match actual password';
      }

      if (!req.body.dateOfBirth) {
        workflow.outcome.errfor.dateOfBirth = 'please select date of birthday';
      }
      else if(!security.dateFilter(req.body.dateOfBirth)) {
          workflow.outcome.errfor.dateOfBirth = 'date format is wrong - pass as Date-Month-Year(DD-MM-YYYY)';
      }

      if (!req.body.gender) {
        workflow.outcome.errfor.gender = 'please select gender';
      }
      else if(!/^(male|female)$/.test(req.body.gender.toLowerCase())) {
        workflow.outcome.errfor.gender = 'please select gender male or female only';
      }

      if (!req.body.city) {
        workflow.outcome.errfor.city = 'please select  a city';
      }
      else if(!/^(delhi|banglore|gurgaon)$/.test(req.body.city.toLowerCase())) {
        workflow.outcome.errfor.city = 'please select city from provided data';
      }

      if (!req.body.termsOfUse) {
        workflow.outcome.errfor.termsOfUse = 'please select terms of use';
      }
      else if(!/^(true|false)$/.test(req.body.termsOfUse)) {
        workflow.outcome.errfor.termsOfUse = 'please select only desired values';
      }
    

      if (workflow.hasErrors()) {
        return workflow.emit('response');
      }

      workflow.emit('duplicateCustomerNameCheck');
    });

    workflow.on('customerFeedback', function(){

    });

    workflow.on('duplicateCustomerNameCheck', function() {
      req.app.db.models.Customer.findOne({ customername: req.body.customername}, function(err, customer) {
        if (err) {
          return workflow.emit('exception', err);
        }

        if (customer) {
          workflow.outcome.errfor.customername = 'customername already taken';
          return workflow.emit('response');
        }

        workflow.emit('duplicateEmailCheck');
      });
    });

    workflow.on('duplicateEmailCheck', function() {
      req.app.db.models.Customer.findOne({ email: req.body.email.toLowerCase() }, function(err, customer) {
        if (err) {
          return workflow.emit('exception', err);
        }

        if (customer) {
          workflow.outcome.errfor.email = 'email already registered';
          return workflow.emit('response');
        }

        workflow.emit('generateToken');
      });
    });

    workflow.on('generateToken', function() {
      var crypto = require('crypto');
      crypto.randomBytes(21, function(err, buf) {
        if (err) {
          return next(err);
        }

        var tokenMail = buf.toString('hex');
          req.app.db.models.Customer.encryptData(tokenMail, function(err, hash) {
            if (err) {
              return next(err);
            }

            workflow.emit('createCustomer', tokenMail, hash);
          });


      });
    });

    workflow.on('createCustomer', function(tokenMail,hashMail) {
      req.app.db.models.Customer.encryptData(req.body.password, function(err, hash) {
        if (err) {
          return workflow.emit('exception', err);
        }
        
        var score =  security.passwordStrength(req.body.password),
            strengthName = "" ;

          if (score > 80)
              strengthName = "strong";
          if (score > 60)
              strengthName =  "good";
          if (score >= 30)
              strengthName = "weak";

    
        var fieldsToSet = {
          customername: req.body.customername,
          email: req.body.email.toLowerCase(),
          password: hash,
          passwordStrength : {
             strengthName : strengthName,
             strengthScore : score
          },
          termsOfUse : req.body.termsOfUse
        };

        req.app.db.models.Customer.create(fieldsToSet, function(err, customer) {
          if (err) {
            return workflow.emit('exception', err);
          }

          workflow.Customer = customer;
          workflow.emit('createAccount',tokenMail,hashMail);
        });
      });
    });

    workflow.on('createAccount', function(tokenMail,hashMail) {
      var fieldsToSet = {
        'name.full': workflow.Customer.customername,
        customer: {
          id: workflow.Customer._id,
          name: workflow.Customer.customername
        },
        'about.isVerified': req.app.config.requireAccountVerification ? false : true,
        'about.dateOfBirth' : new Date(req.body.dateOfBirth).toISOString(),
        'about.gender' : req.body.gender,
        'contact.city' : req.body.city,
        'contact.email' : req.body.email,
        'tokens.verificationEmailToken' : hashMail,
        'tokens.verificationEmailTokenExpires' : Date.now() + 10000000,
        search: [
          workflow.Customer.customername
        ]
      };
      
      process.nextTick(function() {

          req.app.db.models.CustomerAccount.create(fieldsToSet, function(err, account) {

            if (err) {
              return workflow.emit('exception', err);
            }

            //update customer with account
            workflow.Customer.customerAccount = account._id;
            workflow.Customer.save(function(err, customer) {
              if (err) {
                return workflow.emit('exception', err);
              }
               // workflow.emit('createAdmin',tokenMail);
               workflow.emit('sendWelcomeEmail',tokenMail);
            });
          });
      });  
    });
    
    //  workflow.on('createAdmin', function(tokenMail) {
    //   var fieldsToSet = {
    //     'name.full': workflow.Customer.customername,
    //     customer: {
    //       id: workflow.Customer._id,
    //       name: workflow.Customer.customername
    //     },
    //      permissions: [
    //         {
    //           name: 'edit',
    //           permit: true
    //         },
    //         {
    //           name : 'read',
    //           permit : true
    //         },
    //         {
    //            name : 'publish',
    //            permit : true
    //         }
    //     ],
    //     search: [
    //       workflow.Customer.customername
    //     ]
    //   };
      
    //   process.nextTick(function() {

    //       req.app.db.models.Admin.create(fieldsToSet, function(err, admin) {
    //         if (err) {
    //           return workflow.emit('exception', err);
    //         }

    //         //update customer with account
    //         workflow.Customer.roles.admin = admin._id;
    //         workflow.Customer.save(function(err, customer) {
    //           if (err) {
    //             return workflow.emit('exception', err);
    //           }

    //           workflow.emit('sendWelcomeEmail',tokenMail);
    //         });
    //       });
    //   });  
    // });



    // workflow.on('sendWelcomeEmail', function(tokenMail) {
    //   req.app.utility.sendmail(req, res, {
    //     from: req.app.config.smtp.from.name +' <'+ req.app.config.smtp.from.address +'>',
    //     to: req.body.email,
    //     subject: 'Your '+ req.app.config.projectName +' Account',
    //     textPath: 'signup/email-text',
    //     htmlPath: 'signup/email-html',
    //     locals: {
    //       customername: req.body.customername,
    //       email: req.body.email,
    //       loginURL: req.protocol +'://'+ req.headers.host +'/login/',
    //       projectName: req.app.config.projectName
    //     },
    //     success: function(message) {
    //       workflow.emit('logcustomerIn');
    //     },
    //     error: function(err) {
    //       console.log('Error Sending Welcome Email: '+ err);
    //       workflow.emit('logcustomerIn');
    //     }
    //   });
    // });
     
    workflow.on('sendWelcomeEmail', function(tokenMail) {
    req.app.utility.sendmail(req, res, {
      // +' <'+ req.app.config.smtp.from.address +'>'
      from: req.app.config.smtp.from.name,
      to: req.body.email,
      subject: 'Your '+ req.app.config.projectName +' Account',
      textPath: './../views/signup/email-text',
      htmlPath: './../views/signup/email-html',
      locals: {
        customername: req.body.customername,
        email: req.body.email,
        loginURL: req.protocol +'://'+ req.headers.host +'/login/',
        verifyLink : req.protocol +'://'+ req.headers.host +'/#/login/' + req.body.email + '/' + tokenMail ,
        projectName: req.app.config.projectName
      },
      success: function(message) {
        // workflow.emit('logcustomerIn');
        
        workflow.emit('response');
      },
      error: function(err) {
        console.log('Error Sending Welcome Email: '+ err);
        // workflow.emit('logcustomerIn');
        
        workflow.emit('response');

      }
    });
  }); 

    // workflow.on('logcustomerIn', function() {
    //   req._passport.instance.authenticate('local', function(err, customer, info) {
    //     if (err) {
    //       return workflow.emit('exception', err);
    //     }

    //     if (!customer) {
    //       workflow.outcome.errors.push('Login failed. That is strange.');
    //       return workflow.emit('response');
    //     }
    //     else {
    //       req.login(customer, function(err) {
    //         if (err) {
    //           return workflow.emit('exception', err);
    //         }

    //         workflow.outcome.defaultReturnUrl = customer.defaultReturnUrl();
    //         workflow.emit('response');
    //       });
    //     }
    //   })(req, res);
    // });

    workflow.emit('validate');
  },
  login: function(req, res){
    var workflow = req.app.utility.workflow(req, res);

    workflow.on('validate', function() {
      if (!req.body.email) {
        workflow.outcome.errfor.email = 'required';
      }
      else if (!/^[a-zA-Z0-9\-\_\.\+]+@[a-zA-Z0-9\-\_\.]+\.[a-zA-Z0-9\-\_]+$/.test(req.body.email)) {
        workflow.outcome.errfor.email = 'invalid email format';
      }

      if (!req.body.password) {
        workflow.outcome.errfor.password = 'required';
      }

      if (workflow.hasErrors()) {
        return workflow.emit('response');
      }

      workflow.emit('abuseFilter');
    });

    workflow.on('abuseFilter', function() {
      var getIpCount = function(done) {
        var conditions = { ip: req.ip };
        req.app.db.models.LoginAttempt.count(conditions, function(err, count) {
          if (err) {
            return done(err);
          }

          done(null, count);
        });
      };

      var getIpcustomerCount = function(done) {
        var conditions = { ip: req.ip, customer: req.body.customername };
        req.app.db.models.LoginAttempt.count(conditions, function(err, count) {
          if (err) {
            return done(err);
          }

          done(null, count);
        });
      };

      var asyncFinally = function(err, results) {
        if (err) {
          return workflow.emit('exception', err);
        }

        if (results.ip >= req.app.config.loginAttempts.forIp || results.ipCustomer >= req.app.config.loginAttempts.forIpAndCustomer) {
          workflow.outcome.errors.push('You\'ve reached the maximum number of login attempts. Please try again later.');
          return workflow.emit('response');
        }
        else {
          workflow.emit('attemptLogin');
        }
      };

      require('async').parallel({ ip: getIpCount, ipcustomer: getIpcustomerCount }, asyncFinally);
    });

    workflow.on('attemptLogin', function() {
      req._passport.instance.authenticate('local', function(err, customer, info) {
        if (err) {
          return workflow.emit('exception', err);
        }

        //console.log(customer);
        
        if (!customer) {
          var fieldsToSet = { ip: req.ip, customer: req.body.email };
          req.app.db.models.LoginAttempt.create(fieldsToSet, function(err, doc) {
            if (err) {
              return workflow.emit('exception', err);
            }

            workflow.outcome.errors.push('customername and password combination not found or wrong');
            return workflow.emit('response');
          });
        }
        else if (customer.customerAccount.about.isVerified === false) {
          var fieldsToSet = { ip: req.ip, customer: req.body.email };
          req.app.db.models.LoginAttempt.create(fieldsToSet, function(err, doc) {
            if (err) {
              return workflow.emit('exception', err);
            }

            workflow.outcome.errors.push('please verify your account - an email has been already sent');
            return workflow.emit('response');
          });
        }
        else {
          req.login(customer, function(err) {
            if (err) {
              // console.log(err);
              return workflow.emit('exception', err);
            }

            /*
               If the user was passed, the middleware will call req.login (a passport function 
               attached to the request).
               This will call our passport.serializeUser method we've defined earlier. This method 
               can access the user object we passed back to the middleware. It's its job to determine 
               what data from the user object should be stored in the session. The result of the
                serializeUser method is attached to the session as req.session.passport.user = 
                { // our serialised user object // }.
             
            */

            workflow.outcome.customer = security.filterCustomer(req.user);
            workflow.outcome.defaultReturnUrl = customer.defaultReturnUrl();
            workflow.emit('response');
          });
        }
      })(req, res);
    });

    workflow.emit('validate');
  },
  verify : function(req,res) {
       
    var workflow = req.app.utility.workflow(req, res);

      workflow.on('validate', function() {

        if (!/^[a-zA-Z0-9\-\_\.\+]+@[a-zA-Z0-9\-\_\.]+\.[a-zA-Z0-9\-\_]+$/.test(req.params.email)) {
          // workflow.outcome.errfor.email = 'invalid email format';
          workflow.outcome.errors.push('invalid email format');
        }

        if (workflow.hasErrors()) {
          return workflow.emit('response');
        }

         workflow.emit('findcustomer');
      });
      //res.send({'ok':'okk'});  
      
      workflow.on('findcustomer', function() {
          var conditions = {
            'email': req.params.email 
          };

          req.app.db.models.Customer.findOne(conditions).populate('customerAccount','_id about.isVerified tokens.verificationEmailToken').lean().exec(function(err, customer) {
            if (err) {
              return workflow.emit('exception', err);
            }
            
           
            if (!customer) {
              workflow.outcome.errors.push('there is no account related to this email id - please check your mail again');
              return workflow.emit('response');
            }
            
            if(customer.customerAccount.about.isVerified == true)
            {
               workflow.outcome.errors.push('your email has been already verified - please login to continue');
               return workflow.emit('response');
            } 

            req.app.db.models.Customer.validateData(req.params.token, customer.customerAccount.tokens.verificationEmailToken, function(err, isValid) {
              if (err) {
                return workflow.emit('exception', err);
              }

              if (!isValid) {
                workflow.outcome.errors.push('Invalid request');
                return workflow.emit('response');
              }
              
                 // workflow.emit('response');
                workflow.emit('patchcustomer', customer,customer.customerAccount._id);
            });
          });
        });

        workflow.on('patchcustomer', function(customer,account_id) {
          
            var fieldsToSet = { 'about.isVerified': true, 'tokens.verificationEmailToken': '' };
            req.app.db.models.CustomerAccount.findByIdAndUpdate(account_id, fieldsToSet, function(err, customer) {
              if (err) {
                return workflow.emit('exception', err);
              }

              workflow.emit('response');
            });
        });
    workflow.emit('validate');
  },
  logout: function(req, res){
    req.logout();
    res.send({success: true});
  },
  // loginGoogle: function(req, res, next){
  //   return socialLogin('google', req, res, next);
  // },
  // loginFacebook: function(req, res, next){
  //   return socialLogin('facebook', req, res, next);
  // },
  forgotPassword: function(req, res, next) {
    var workflow = req.app.utility.workflow(req, res);

    workflow.on('validate', function() {
      if (!req.body.email) {
        workflow.outcome.errfor.email = 'required';
        return workflow.emit('response');
      }
      workflow.emit('validatecustomer');
    });

    workflow.on('validatecustomer',function() {
        var conditions = {};
            conditions.email = req.body.email;
         
        req.app.db.models.Customer.findOne(conditions).populate('customerAccount','_id').lean().exec(function (err, customer) {
          if(err){
            return workflow.emit('exception', err);
          }
          if(!customer){
            return workflow.emit('exception', 'currently there is no account related to that email -please register to continue');
          }
          
          workflow.emit('generateToken',customer.customerAccount._id,customer);
        });
    });

    workflow.on('generateToken', function(account_id,customer) {
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

          workflow.emit('patchcustomer',token,hash,account_id,customer);
        });
      });
    });

    workflow.on('patchcustomer', function(token, hash,account_id,customer) {
      var conditions = { _id: account_id },
          fieldsToSet = {
            'tokens.resetPasswordToken': hash,
            'tokens.resetPasswordTokenExpires': Date.now() + 10000000
          };
      req.app.db.models.CustomerAccount.findOneAndUpdate(conditions, fieldsToSet, function(err, account) {
        if (err) {
          return workflow.emit('exception', err);
        }

        if (!account) {
          return workflow.emit('response');
        }

        workflow.emit('sendEmail', token, customer);
      });
    });

    workflow.on('sendEmail', function(token, customer) {
        req.app.utility.sendmail(req, res, {
        // +' <'+ req.app.config.smtp.from.address +'>'
        from: req.app.config.smtp.from.name,
        to: customer.email,
        subject: 'Your '+ req.app.config.projectName +' Account',
        textPath: './../views/login/forgot/email-text',
        htmlPath: './../views/login/forgot/email-html',
        locals: {
          customername: customer.customername,
          resetLink : req.protocol +'://'+ req.headers.host +'/#/login/reset/' + customer.email + '/' + token ,
          projectName: req.app.config.projectName
        },
        success: function(message) {
          workflow.emit('response');
        },
        error: function(err) {
          workflow.outcome.errors.push('Error Sending: '+ err);
          workflow.emit('response');
        }
      });
    });

    workflow.emit('validate');
  },
  resetPassword: function(req, res){
    var workflow = req.app.utility.workflow(req, res);

    workflow.on('validate', function() {
      if (!req.body.password) {
        workflow.outcome.errfor.password = 'required';
      }
      else if (!/^[a-zA-Z0-9\-_!@#$%\^&*)(+=.:;?\s]+$/.test(req.body.password)) {
        workflow.outcome.errfor.password = 'only use letters, numbers, \'-\', \'_\'';
      }

      if (!req.body.confirm) {
        workflow.outcome.errfor.confirm = 'required';
      }
      else if (!/^[a-zA-Z0-9\-_!@#$%\^&*)(+=.:;?\s]+$/.test(req.body.password)) {
        workflow.outcome.errfor.confirm = 'only use letters, numbers, \'-\', \'_\'';
      }

      if (req.body.password !== req.body.confirm) {
        workflow.outcome.errors.push('Passwords do not match.');
      }

      if (workflow.hasErrors()) {
        return workflow.emit('response');
      }

      workflow.emit('findcustomer');
    });

    workflow.on('findcustomer', function() {
      var conditions = {
        email: req.params.email
        // resetPasswordExpires: { $gt: Date.now() }
      };
      req.app.db.models.Customer.findOne(conditions).populate('customerAccount','tokens.resetPasswordTokenExpires tokens.resetPasswordToken').exec(function(err, customer) {
        if (err) {
          return workflow.emit('exception', err);
        }

        if (!customer) {
          workflow.outcome.errors.push('NO such email id exist');
          return workflow.emit('response');
        }

        if (customer.customerAccount.tokens.resetPasswordTokenExpires < Date.now()) {
          workflow.outcome.errors.push('reset password token expired');
          return workflow.emit('response');
        }

        req.app.db.models.Customer.validateData(req.params.token, customer.customerAccount.tokens.resetPasswordToken, function(err, isValid) {
          if (err) {
            return workflow.emit('exception', err);
          }

          if (!isValid) {
            workflow.outcome.errors.push('Invalid request.');
            return workflow.emit('response');
          }

          workflow.emit('patchcustomer', customer , customer.customerAccount._id);
        });
      });
    });

    workflow.on('patchcustomer', function(customer, account_id) {
      req.app.db.models.Customer.encryptData(req.body.password, function(err, hash) {
        if (err) {
          return workflow.emit('exception', err);
        }

        var fieldsToSet = { password: hash};
        req.app.db.models.Customer.findByIdAndUpdate(customer._id, fieldsToSet, function(err, customer) {
          if (err) {
            return workflow.emit('exception', err);
          }
          
          workflow.emit('patchAccount', account_id);
        });
      });
    });

    workflow.on('patchAccount' , function(account_id) {
      var fieldsToSet = { 'tokens.resetPasswordToken' : ''};
        req.app.db.models.CustomerAccount.findByIdAndUpdate(account_id, fieldsToSet, function(err, customer) {
          if (err) {
            return workflow.emit('exception', err);
          }
          
          workflow.emit('response');
        });
    });


    workflow.emit('validate');
  }
};

module.exports = security;
