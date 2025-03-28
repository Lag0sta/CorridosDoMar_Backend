const mongoose = require('mongoose');

const linkSchema= mongoose.Schema({
  link: String,
  type: String,
})

const mainTextSchema= mongoose.Schema({
  text: [String],
  type: String,
})

const submitsSchema = mongoose.Schema({
  type: String,
  title: String,
  secondaryTitle: String,
  secondaryType: String,
  mainText: [mainTextSchema],
  links: [linkSchema],
  createdBy: {type: mongoose.Schema.Types.ObjectId, ref: 'users'},
  creationDate: Date,
  latestUpdate: Date,
  authorised: Boolean,
});

const Submit = mongoose.model('submits', submitsSchema);


module.exports = Submit ;
