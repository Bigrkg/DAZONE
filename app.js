'use strict';
//dependencies
var config = require('./config'),
    express = require('express'),

    cookieParser = require('cookie-parser'),
    bodyParser = require('body-parser'),
    session = require('express-session'),
    mongoStore = require('connect-mongo')(session),
    http = require('http'),
    path = require('path'),
    passport = require('passport'),
    mongoose = require('mongoose'),
    helmet = require('helmet'),
    csrf = require('csurf'),
    cors = require("cors");
//create express app
var app = express();
   
    //keep reference to config
    app.config = config;

    //setup the web server
    app.server = http.createServer(app);

    //setup mongoose
    app.db = mongoose.createConnection(config.mongodb.uri);
    app.db.on('error', console.error.bind(console, 'mongoose connection error: '));
    app.db.once('open', function () {
      //and... we have a data store
    });

    //config data models
    require('./models')(app, mongoose);
    //settings
    app.disable('x-powered-by');
    app.set('port', config.port);
    app.set('views', path.join(__dirname, 'views'));
    app.set('view cache', true)
    app.set('view engine', 'jade');

   //middleware

    app.use(require('morgan')('dev'));
    app.use(require('compression')());
    app.use(require('serve-static')(path.join(__dirname, 'client/dist')));
    app.use(require('serve-static')(path.join(__dirname, 'public')));
    app.use(require('method-override')());
    app.use(bodyParser.json());
    app.use(bodyParser.urlencoded({ extended: true }));
    app.use(cookieParser(config.cryptoKey));
    app.use(cors({
        origin: ["http://localhost:3000"],
        methods: ["GET", "POST","PUT","DELETE"],
        allowedHeaders: ["Content-Type", "Authorization","Origin","X-Requested-With","Accept"]
    }));
    
    // app.use(function(req, res, next) {
    //     res.header("Access-Control-Allow-Origin", "http://localhost:3000");
    //     res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    //     next();
    // });
    app.use(session({
      resave: true,
      saveUninitialized: true,
      secret: config.cryptoKey,
      store: new mongoStore({ url: config.mongodb.uri })
    }));
    app.use(passport.initialize());
    app.use(passport.session());
    //app.use(csrf({ cookie: { signed: true } }));
    /*
      The passport.session middleware calls passport.deserializeUser 
      we've setup. Attaching the loaded user object to the request as req.user.
    */
    helmet(app);

    //response locals
    app.use(function(req, res, next) {
      //res.cookie('_csrfToken', req.csrfToken());
      res.locals.user = {};
      res.locals.user.defaultReturnUrl = req.user && req.user.defaultReturnUrl();
      res.locals.user.username = req.user && req.user.username;
      next();
    });

    //global locals
    app.locals.projectName = app.config.projectName;
    app.locals.copyrightYear = new Date().getFullYear();
    app.locals.copyrightName = app.config.companyName;
    app.locals.cacheBreaker = 'br34k-01';

    //setup passport
    require('./passport')(app, passport);
    //setup routes
    require('./routes')(app, passport);

    //custom (friendly) error handler
    app.use(require('./service/http').http500);

    //setup utilities
    app.utility = {};
    app.utility.sendmail = require('./helpers/sendmail');
    app.utility.slugify = require('./helpers/slugify/commonfunctions');
    app.utility.workflow = require('./helpers/workflow');
    app.utils = require('util');

    //listen up
    app.server.listen(app.config.port, function(){
      //and... we're live
       //and... we're live
          console.log('Server is running on port ' + config.port);
    });

    // module.exports = app ;
