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

//route pour l'inscription de l'utilisateur
router.post('/signup', (req, res) => {
  //vérification champs vide
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
        avatar: req.body.avatar,
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

//route pour la connection de l'utilisateur
router.post('/signin', (req, res) => {
  const password = req.body.password
    //vérification champs vide
    if(!req.body.email || !req.body.password){
      res.json({result:false, error:'fill the fields'})
      return
    }

    User.findOne({email: req.body.email}).then((userData) => {
      //maj du token
      if (userData && bcrypt.compareSync(password, userData.password)) {
        const token = uid2(32);
        userData.token = token;
        userData
          .save()
          .then(() => {
            res.json({
              result: true,
              token: userData.token,
              pseudo: userData.pseudo,
            });
          })
      } else {
        res.json({ result: false, error: "wrong email or password" });
      }
    })
})

//route pour Récupérer les informations de l'utilisateur
router.get('/signin', (req, res) => {
  User.findOne({token: token}).then((userData) => {
    res.json({result: true, 
              avatar: userData.avatar,
              pseudo: userData.pseudo,
    })
  })
})

module.exports = router;
