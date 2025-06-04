import { access } from 'fs';
import * as mongoose from 'mongoose';

const usersSchema = new mongoose.Schema({
  avatar: String,
  pseudo: String,
  capoeiraGroup: String, 
  email: String,
  password: String,
  accessToken: String,
  resetPasswordToken: String,
  resetPasswordExpires: Date,

});

const User = mongoose.model('users', usersSchema);


export default User;