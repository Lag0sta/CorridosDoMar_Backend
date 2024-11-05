var express = require('express');
var router = express.Router();

const User = require('../models/users')

const uid2 = require("uid2");
const bcrypt = require("bcrypt");

/* GET users listing. */
router.get('/', (req,res) => {
  User.find().then((data)=>{
      res.json(data)

  })
} )

//vérification champs vide
router.post('/signup', (req, res) => {
  if(!req.body.pseudo || !req.body.email || !req.body.password){
    res.json({result:false, error:'fill the fields'})
    return
  }

  User.findOne({
    $or: [{pseudo: req.body.pseudo}, {email: req.body.email}],
  }).then((usersData) => {

     //verification si le compte existe déja
     if (usersData) {
      res.json({ result: false, error: "username or @mail already used" });
      return;
    }
    console.log(req.body.capoeiraGroup)


    const token = uid2(32);
    const hash = bcrypt.hashSync(req.body.password, 10);
    const email = req.body.email;
    const emailRegex = /^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/gi; //regEx pour adresse @mail valable

     //verification @mail valide
     if (!emailRegex.test(email)) {
      res.json({ result: false, error: "invalid @mail adress" });
      return;
    }
   

     //creation nouvel utilisateur dans la BDD
      const newUser = new User({
        pseudo: req.body.pseudo,
        capoeiraGroup: req.body.capoeiraGroup,
        email: email,
        password: hash,
        token: token,
      });
      newUser.save().then((data) => {
        res.json({
          result: true,
          pseudo: data.pseudo,
          capoeiraGroup: data.capoeiraGroup,
          token: data.token,
        });
      }).catch((error) => {
        console.error(error);
        res.json({ result: false, error: 'error saving user' });
      });
    
  })
})

module.exports = router;
