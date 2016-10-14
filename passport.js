'use strict';

exports = module.exports = function(app, passport) {
  var LocalStrategy = require('passport-local').Strategy,
      FacebookStrategy = require('passport-facebook').Strategy,
      GoogleStrategy = require('passport-google-oauth').OAuth2Strategy;

      // TwitterStrategy = require('passport-twitter').Strategy,
      // GitHubStrategy = require('passport-github').Strategy,
      // TumblrStrategy = require('passport-tumblr').Strategy;

  passport.use(
      'local', new LocalStrategy({
        // by default, local strategy uses username and password, we will override with email
        usernameField : 'email',
        passwordField : 'password',
        passReqToCallback : true // allows us to pass back the entire request to the callback
    },
    function(req,email, password, done) {
      var workflow = new (require('events').EventEmitter)();

      workflow.on('findCustomer', function(){
        var conditions = {};
            conditions.email = email;
            
        app.db.models.Customer.findOne(conditions, function (err, customer) {
          if(err){
            return workflow.emit('exception', err);
          }
          if(!customer){
            return workflow.emit('exception', 'Unknown customer');
          }
          workflow.emit('validateData', customer)
        });
      });

      workflow.on('validateData', function(customer){
        app.db.models.Customer.validateData(password, customer.password, function(err, isValid) {
          if (err) {
            return workflow.emit('exception', err);
          }

          if (!isValid) {
            return workflow.emit('exception', 'Invalid password');
          }

          workflow.emit('populateCustomer', customer);
        });
      });

      workflow.on('populateCustomer', function(customer){
        customer.populate('customerAccount', function(err, customer){
          if(err){
            return workflow.emit('exception', err);
          }
          else {
            return workflow.emit('result', customer);
          }
        });
      });

      workflow.on('result', function(customer){
        return done(null, customer);
      });

      workflow.on('exception', function(x){
        if(typeof x === 'string'){
          return done(null, false, {message: x});
        }else{
          return done(null, false, x);
        }
      });

      workflow.emit('findCustomer');
    }
  ));

  // if (app.config.oauth.twitter.key) {
  //   passport.use(new TwitterStrategy({
  //       consumerKey: app.config.oauth.twitter.key,
  //       consumerSecret: app.config.oauth.twitter.secret
  //     },
  //     function(token, tokenSecret, profile, done) {
  //       done(null, false, {
  //         token: token,
  //         tokenSecret: tokenSecret,
  //         profile: profile
  //       });
  //     }
  //   ));
  // }

  // if (app.config.oauth.github.key) {
  //   passport.use(new GitHubStrategy({
  //       clientID: app.config.oauth.github.key,
  //       clientSecret: app.config.oauth.github.secret,
  //       customHeaders: { "customer-Agent": app.config.projectName }
  //     },
  //     function(accessToken, refreshToken, profile, done) {
  //       done(null, false, {
  //         accessToken: accessToken,
  //         refreshToken: refreshToken,
  //         profile: profile
  //       });
  //     }
  //   ));
  // }

  if (app.config.oauth.facebook.key) {
    passport.use(new FacebookStrategy({
        clientID: app.config.oauth.facebook.key,
        clientSecret: app.config.oauth.facebook.secret
      },
      function(accessToken, refreshToken, profile, done) {
        done(null, false, {
          accessToken: accessToken,
          refreshToken: refreshToken,
          profile: profile
        });
      }
    ));
  }

  if (app.config.oauth.google.key) {
    passport.use(new GoogleStrategy({
        clientID: app.config.oauth.google.key,
        clientSecret: app.config.oauth.google.secret
      },
      function(accessToken, refreshToken, profile, done) {
        done(null, false, {
          accessToken: accessToken,
          refreshToken: refreshToken,
          profile: profile
        });
      }
    ));
  }

  // if (app.config.oauth.tumblr.key) {
  //   passport.use(new TumblrStrategy({
  //       consumerKey: app.config.oauth.tumblr.key,
  //       consumerSecret: app.config.oauth.tumblr.secret
  //     },
  //     function(token, tokenSecret, profile, done) {
  //       done(null, false, {
  //         token: token,
  //         tokenSecret: tokenSecret,
  //         profile: profile
  //       });
  //     }
  //   ));
  // }

  passport.serializeUser(function(customer, done) {
    done(null, customer._id);
  });

  passport.deserializeUser(function(id, done) {
    app.db.models.Customer.findOne({ _id: id }).populate('customerAccount').exec(function(err, customer) {
        done(err, customer);
    });
  });
};
