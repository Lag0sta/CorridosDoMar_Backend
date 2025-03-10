const mongoose = require('mongoose');

const submitsSchema = mongoose.Schema({
  type: String,
  title: String,
  secondaryTitle: String,
  mainText: [String],
  reasearchText: [String],
  link: [{link:String}],
  createdBy: {type: mongoose.Schema.Types.ObjectId, ref: 'users'},
  creationDate: Date,
  latestUpdate: Date,
  authorised: Boolean,
});

const Submit = mongoose.model('submits', submitsSchema);


module.exports = Submit ;
