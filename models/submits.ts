import * as mongoose from 'mongoose';

const linkSchema = new mongoose.Schema({
  link: String,
  type: String,
})

const mainTextSchema = new mongoose.Schema({
  text: [String],
  type: String,
})

const submitsSchema = new mongoose.Schema({
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


export default Submit;
