var preAuth = require('./service/pre-auth'),
    security = require('./service/security'),
    account = require('./service/account'),
    attributes = require('./service/attributes'),
    attributesSet = require('./service/attributesSet'),
    category = require('./service/category'),
    products = require('./service/products/products'),
    uploads =  require('./service/uploads'),
    blueprints = require('./service/blueprints/blueprints'),
    multer   = require('multer'),
    fs = require('fs'),
    mkdirp = require('mkdirp'),
    path = require('path');

var storage = multer.diskStorage({ 
    destination: function (req, file, cb) {
        
        function ensureExists(path,mask,cb) {
            if (typeof mask == 'function') { // allow the `mask` parameter to be optional
                cb = mask;
                mask = 0777;
            }
            mkdirp(path,mask,function(err) {
                if (err) {
                  console.log(err);
                    if (err.code == 'EEXIST') cb(null); // ignore the error if the folder already exists
                    else cb(err); // something else went wrong
                } else cb(null); // successfully created folder
            });
        }

        ensureExists('public/uploads/products',0777,function(err) {
            if (err) {
                req.fileValidationError = 'goes wrong on the file upload directory';
                return cb(null, false, new Error('goes wrong on the file upload directory'));
            }
            // handle folder creation error
            else cb(null, 'public/uploads/products')// we're all good
        });
    },
    filename: function (req, file, cb) {
        var datetimestamp = Date.now();
        cb(null, 'product' +'-' + datetimestamp + '.' + file.originalname.split('.')[file.originalname.split('.').length -1])
    }
});

var cpUpload = multer({ //multer settings
    storage: storage,
    fileFilter: function (req, file, cb) {
     if (file.mimetype !== 'image/vnd.dwg' && file.mimetype !== 'application/pdf' && file.mimetype !== 'image/png' && file.mimetype !== 'image/svg' && file.mimetype !== 'image/svg+xml'   && file.mimetype !== 'image/jpeg' && file.mimetype !== 'image/jpe' && file.mimetype !== 'image/jpg') {
       req.fileValidationError = 'goes wrong on the mimetype';
       return cb(null, false, new Error('goes wrong on the mimetype'));
     }
      cb(null, true);
    }
}).any();

function useAngular(req, res, next){
    res.sendFile(require('path').join(__dirname, './client/dist/index.html'));
}


function apiEnsureAuthenticated(req, res, next){
  if(req.isAuthenticated()){
    return next();
  }
  res.set('X-Auth-Required', 'true');
  //no need to store the originalUrl in session: caller knows the return url
  //req.session.returnUrl = req.originalUrl;
  res.status(401).send({errors: ['authentication required']});
}

function apiEnsureAccount(req, res, next){
  if(req.user.canPlayRoleOf('account')){
    return next();
  }
  res.status(401).send({errors: ['authorizations required']});
}

function apiEnsureVerifiedAccount(req, res, next){
  if(!req.app.config.requireAccountVerification){
    return next();
  }
  req.user.isVerified(function(err, flag){
    if(err){
      return next(err);
    }
    if(flag){
      return next();
    }else{
      return res.status(401).send({errors: ['verification required']});
    }
  });
}

function apiEnsureAdmin(req, res, next){
  if(req.user.canPlayRoleOf('admin')){
    return next();
  }
  res.status(401).send({errors: ['authorization required']});
}

exports = module.exports = function(app, passport) {
  'use strict';
  //******** NEW JSON API ********
  
  
  app.get('/api/current-user', security.sendCurrentCustomer);
  // app.post('/api/sendMessage', preAuth.sendMessage);
  app.post('/api/contactUs', security.contact);
  app.put('/api/signup/verify/:email/:token', security.verify);
  app.post('/api/login', security.login);
  app.post('/api/login/forgot', security.forgotPassword);
  app.put('/api/login/reset/:email/:token', security.resetPassword);
  // app.get('/api/login/facebook/callback', security.loginFacebook);
  // app.get('/api/login/google/callback', security.loginGoogle);
  app.post('/api/logout', security.logout);

  //-----authentication required api-----
  // app.all('/api/account*', apiEnsureAuthenticated);
  // app.all('/api/account*', apiEnsureAccount);

  app.get('/api/account/verification', account.upsertVerification);
  app.post('/api/account/verification', account.resendVerification);
  app.put('/api/account/verification/:token/', account.verify);
  
  app.all('/api/account/settings*', apiEnsureAuthenticated);
  app.all('/api/account/settings*', apiEnsureAccount);
  app.all('/api/account/settings*', apiEnsureVerifiedAccount);

  app.get('/api/account/settings', account.getAccountDetails);
  app.put('/api/account/settings/basic', account.basic);
  app.put('/api/account/settings/contact', account.contact);
  app.put('/api/account/settings/login', account.login);
  app.get('/api/account/settings/google/callback', account.connectGoogle);
  app.get('/api/account/settings/google/disconnect', account.disconnectGoogle);
  app.get('/api/account/settings/facebook/callback', account.connectFacebook);
  app.get('/api/account/settings/facebook/disconnect', account.disconnectFacebook);


  
 //catalog > Categories
  // app.all('/api/categories*', apiEnsureAuthenticated);
  // app.all('/api/categories*', apiEnsureAccount);
  
  app.get('/api/categories', category.find);
  app.get('/api/categories/:id/:dPop', category.read); 
 
  
  //catalog > attributeSet
  // app.all('/api/attribute*', apiEnsureAuthenticated);
  // app.all('/api/attribute*', apiEnsureAccount);
  
  app.get('/api/attribute/set/:id', attributesSet.read); 
  app.route('/api/attribute/set').get(attributesSet.find).post(attributesSet.create);
  app.put('/api/attribute/set/:id', attributesSet.update);


  //catalog > attribute
  app.get('/api/attribute', attributes.find);
  app.get('/api/attribute/:id', attributes.read); 
  app.post('/api/attribute', attributes.create); 
  app.put('/api/attribute/:id', attributes.update);
 
  //catalog > products
  app.all('/api/products/a*', apiEnsureAuthenticated);
  app.all('/api/products/a*', apiEnsureAccount);
  
  app.get('/api/products', products.find);
  app.get('/api/products/:id', products.read); 
  app.put('/api/products/a/shortlist/:id/:type',products.shortList);

  //catalog > blueprints
  app.all('/api/blueprints/a*', apiEnsureAuthenticated);
  app.all('/api/blueprints/a*', apiEnsureAccount);
  
  
  app.get('/api/blueprints', blueprints.find);
  app.get('/api/blueprints/:id', blueprints.read);
  app.put('/api/blueprints/a/shortlist/:id/:type', blueprints.shortList);
  
  
  //******** END OF NEW JSON API ********
   
  //******** Static routes handled by Angular ********
  //public
  app.get('/', useAngular);
  app.get('/about', useAngular);
  app.get('/contact', useAngular);

  //sign up
  app.get('/signup', useAngular);
  app.get('/signup/verify/:email/:token',useAngular);
  //login/out
  app.get('/login', useAngular);
  app.get('/login/reset/:email/:token', useAngular);
  app.get('/login/forgot', useAngular);
  app.get('/login/reset', useAngular);
  
  app.get('/forgot', useAngular);
  app.get('/reset', useAngular);
 

  //social login
  app.get('/login/facebook', passport.authenticate('facebook', { callbackURL: app.config.oauth.facebook.callbackURL, scope: ['email'] }));
  app.get('/login/facebook/callback', useAngular);
  // app.get('/login/google', passport.authenticate('google', { callbackURL: 'http://' + app.config.hostname + '/login/google/callback', scope: ['profile email'] }));
  // app.get('/login/google/callback', useAngular);

  //account
  app.get('/account', useAngular);

  //account > verification
  app.get('/account/verification', useAngular);
  app.get('/account/verification/:token', useAngular);

  //account > settings
  app.get('/account/settings', useAngular);

  //account > settings > social
  // app.get('/account/settings/facebook/', passport.authenticate('facebook', { callbackURL: 'http://' + app.config.hostname + '/account/settings/facebook/callback', scope: [ 'email' ]}));
  // app.get('/account/settings/facebook/callback', useAngular);
  // app.get('/account/settings/google/', passport.authenticate('google', { callbackURL: 'http://' + app.config.hostname + '/account/settings/google/callback', scope: ['profile email'] }));
  // app.get('/account/settings/google/callback', useAngular);

  
  app.all('/api/*', function(req,res) {
    res.status(404).json({'error' : 'no such api exists'});
  });
 
  //other routes not found nor begin with /api is handled by Angular
  app.all(/^(?!\/agendash|api).*$/, useAngular);
  
  //******** End OF static routes ********
};
