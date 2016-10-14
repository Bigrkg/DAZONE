'use strict';

exports = module.exports = function(app, mongoose) {
  var statusLogSchema = new mongoose.Schema({
    id: { type: String, ref: 'Status' },
    name: { type: String, default: '' },
    userCreated: {
      id: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
      name: { type: String, default: '' },
      time: { type: Date, default: Date.now }
    },
    mailStatus : {
       signupMail : { type : Boolean , default : false },
       resetPasswordMail : { type : Boolean , default : false }
    }
  });
  app.db.model('StatusLog', statusLogSchema);
};
