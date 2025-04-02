import * as mongoose from 'mongoose';

const usersSchema = new mongoose.Schema({
  avatar: String,
  pseudo: String,
  capoeiraGroup: String, 
  token: String,
  email: String,
  password: String,
  resetPasswordToken: String,
  resetPasswordExpires: Date,
  submits: [{ type: mongoose.Schema.Types.ObjectId, ref: 'submits' }]

});

const User = mongoose.model('users', usersSchema);


export default User;