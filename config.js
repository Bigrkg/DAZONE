

'use strict';
exports.hostname = process.env.hostname || 'localhost';
exports.port = process.env.PORT || 8080;
exports.mongodb = {
  uri: process.env.MONGOLAB_URI || process.env.MONGOHQ_URL || 'mongodb://preetam_yadav:mo0501Til$123@ds019668.mlab.com:19668/groupbyn'
};

//mongodb://preetam_yadav:mo0501Til$123@ds019668.mlab.com:19668/groupbyn
exports.companyName = 'purpleloft';
exports.projectName = 'purpleloft';
exports.systemEmail = 'raopreetam007@outlook.com';
exports.cryptoKey = 'k3yb0ardc4t';
exports.loginAttempts = {
  forIp: 500,
  forIpAndCustomer: 700,
  logExpiration: '20m'
};
exports.requireAccountVerification = true;
exports.smtp = {
  from: {
    // name: process.env.SMTP_FROM_NAME || exports.projectName +' Website',
    name : 'raopreetam007@outlook.com',
    address: process.env.SMTP_FROM_ADDRESS || 'teamgroupbyn@gmail.com'
  },
  credentials: {
    user: process.env.SMTP_USERNAME || 'raopreetam007@outlook.com',
    password: process.env.SMTP_PASSWORD || 'myway$1A',
    host: process.env.SMTP_HOST || 'smtp.gmail.com ',
    tls: true,
    port : 465,

  }
};

//  exports.getReturnUrl = function(req) {
 
//  console.log(req.user);

//   var returnUrl = (req.user && req.user.defaultReturnUrl()) ? req.user.defaultReturnUrl() : '/login/';
//   if (req.session.returnUrl) {
//     returnUrl = req.session.returnUrl;
//     delete req.session.returnUrl;
//   }
//   return returnUrl;
// };

exports.oauth = {
  twitter: {
    key: process.env.TWITTER_OAUTH_KEY || '',
    secret: process.env.TWITTER_OAUTH_SECRET || ''
  },
  facebook: {
    key: process.env.FACEBOOK_OAUTH_KEY || '451416668385369',
    secret: process.env.FACEBOOK_OAUTH_SECRET || '38540a4355a8c4929e56817f4fabbca9',
    callbackURL : 'http://localhost:8080/login/facebook/callback'
  },
  github: {
    key: process.env.GITHUB_OAUTH_KEY || '',
    secret: process.env.GITHUB_OAUTH_SECRET || ''
  },
  google: {
    key: process.env.GOOGLE_OAUTH_KEY || '822462892662-hoit9msom2rp78sfjgmpcooh3fl5hhm5.apps.googleusercontent.com',
    secret: process.env.GOOGLE_OAUTH_SECRET || 'lbkX1beUcVnfiZERUNMtL1rT',
    callbackURL : 'http://localhost:8080/auth/google/callback'
  },
  tumblr: {
    key: process.env.TUMBLR_OAUTH_KEY || '',
    secret: process.env.TUMBLR_OAUTH_SECRET || ''
  }
};













// 'use strict';

// exports.hostname = process.env.hostname || 'localhost';
// exports.port = process.env.PORT || 3000;
// exports.mongodb = {
//   uri: process.env.MONGOLAB_URI || process.env.MONGOHQ_URL || '{{MONGO_URI}}'
// };
// exports.companyName = 'Arthur Kao';
// exports.projectName = 'Angular Drywall';
// exports.systemEmail = '{{ADMIN_EMAIL}}';
// exports.cryptoKey = 'k3yb0ardc4t';
// exports.loginAttempts = {
//   forIp: 50,
//   forIpAndUser: 7,
//   logExpiration: '20m'
// };
// exports.requireAccountVerification = false;
// exports.smtp = {
//   from: {
//     name: process.env.SMTP_FROM_NAME || exports.projectName +' Website',
//     address: process.env.SMTP_FROM_ADDRESS || '{{ADMIN_EMAIL}}'
//   },
//   credentials: {
//     user: process.env.SMTP_USERNAME || '{{SMTP_EMAIL}}',
//     password: process.env.SMTP_PASSWORD || '{{SMTP_PASSWORD}}',
//     host: process.env.SMTP_HOST || '{{SMTP_HOST}}',
//     ssl: true
//   }
// };
// exports.oauth = {
//   twitter: {
//     // Not yet implemented
//     key: process.env.TWITTER_OAUTH_KEY || '',
//     secret: process.env.TWITTER_OAUTH_SECRET || ''
//   },
//   facebook: {
//     key: process.env.FACEBOOK_OAUTH_KEY || '',
//     secret: process.env.FACEBOOK_OAUTH_SECRET || ''
//   },
//   github: {
//     // Not yet implemented
//     key: process.env.GITHUB_OAUTH_KEY || '',
//     secret: process.env.GITHUB_OAUTH_SECRET || ''
//   },
//   google: {
//     key: process.env.GOOGLE_OAUTH_KEY || '',
//     secret: process.env.GOOGLE_OAUTH_SECRET || ''
//   },
//   tumblr: {
//     // Not yet implemented
//     key: process.env.TUMBLR_OAUTH_KEY || '',
//     secret: process.env.TUMBLR_OAUTH_SECRET || ''
//   }
// };
