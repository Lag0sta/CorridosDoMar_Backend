const mongoose = require('mongoose');

const usersSchema = mongoose.Schema({
  pseudo: String,
  capoeiraGroup: String,
  token: String,
  email: String,
  password: String,
});

const User = mongoose.model('users', usersSchema);


module.exports = User ;
