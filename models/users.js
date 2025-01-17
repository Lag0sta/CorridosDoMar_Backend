const mongoose = require('mongoose');

const usersSchema = mongoose.Schema({
  avatar: String,
  pseudo: String,
  capoeiraGroup: String,
  token: String,
  email: String,
  password: String,
  resetPasswordToken: String,
  resetPasswordExpires: Date,

});

const User = mongoose.model('users', usersSchema);


module.exports = User ;
