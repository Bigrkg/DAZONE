'use strict';

exports = module.exports = function(app, mongoose) {
  //embeddable docs first
  require('./schema/Status')(app, mongoose);
  require('./schema/StatusLog')(app, mongoose);
  
  //then regular docs
  require('./schema/Customer')(app, mongoose);
  require('./schema/CustomerAccount')(app, mongoose);
  require('./schema/LoginAttempt')(app, mongoose);
  require('./schema/Attribute')(app, mongoose);
  require('./schema/AttributeSet')(app, mongoose);
  require('./schema/Category')(app, mongoose);
  require('./schema/Product')(app, mongoose);
  require('./schema/Blueprint')(app, mongoose);
  require('./schema/PhotoGallery')(app, mongoose);
};
