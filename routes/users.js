var express = require('express');
var router = express.Router();

const crypto = require('crypto');
const nodemailer = require('nodemailer');
const User = require('../models/users')

const uid2 = require("uid2");
const bcrypt = require("bcryptjs");

const getEmailService = require('../utils/getEmailService');


/* GET users listing. */
router.get('/', (req, res) => {
  User.find().then((data) => {
    res.json(data)

  })
})

//route pour l'inscription de l'utilisateur
router.post('/signup', (req, res) => {
  //vérification champs vide
  if (!req.body.pseudo || !req.body.email || !req.body.password) {
    res.json({ result: false, error: 'fill the fields' })
    return
  }

  User.findOne({
    $or: [{ pseudo: req.body.pseudo }, { email: req.body.email }],
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
      token: token,
      email: email,
      password: hash,
      resetPasswordToken: "",
      resetPasswordExpires: "",
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
  if (!req.body.email || !req.body.password) {
    res.json({ result: false, error: 'fill the fields' })
    return
  }

  User.findOne({ email: req.body.email }).then((userData) => {
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
            avatar: userData.avatar,
          });
        })
    } else {
      res.json({ result: false, error: "wrong email or password" });
    }
  })
})

//route pour Récupérer les informations de l'utilisateur
router.get('/signin', (req, res) => {
  User.findOne({ token: token }).then((userData) => {
    res.json({
      result: true,
      avatar: userData.avatar,
      pseudo: userData.pseudo,
    })
  })
})


router.post('/forgotPassword', async (req, res) => {
  const { email } = req.body

  if (!req.body.email) {
    return res.json({ result: false, error: 'fill the fields' })
  }

  try {
    const user = await User.findOne({ email })

    if (!user) {
      return res.json({ result: false, error: 'User not found.' });
    }

    const resetToken = crypto.randomBytes(32).toString('hex');
    user.resetPasswordToken = resetToken;
    user.resetPasswordExpires = Date.now() + 3600000; // 1 heure
    await user.save();


    const mailMdp = process.env.MDP_MAIL
    const mail = process.env.MAIL
    const service = process.env.SERVICE

    //envoie de mail partie émeteur
    const transporter = nodemailer.createTransport({
      service: service,
      auth: {
        user: `${mail}`,
        pass: `${mailMdp}`,
      },
    });

    const resetUrl = `http://localhost:3001/resetPassword/${resetToken}`;

    //envoie de mail partie destinataire
    const mailOptions = {
      from: `${mail}`,
      to: `${email}`,
      subject: 'Réinitialisation de votre mot de passe',
      html: `<p>Vous avez demandé une réinitialisation de mot de passe.</p>
             <p>Cliquez sur ce lien pour le réinitialiser : <a href="${resetUrl}">Réinitialiser le mot de passe</a></p>`,
    };

    await transporter.sendMail(mailOptions);

    res.json({ result: true, succes: 'Email de réinitialisation envoyé.' });
  } catch (error) {
    console.error(error);
    res.json({ result: false, error: 'Erreur du serveur.' });
  }

})

router.put('/resetPassword/:resetPasswordToken', async (req, res) => {
  const { newPassword, confirmPassword } = req.body;
  const token = req.params.resetPasswordToken;
  if (!token) {
    return res.json({ result: false, error: 'Token requis' });
  }

  if (!newPassword || !confirmPassword) {
    return res.json({ result: false, error: 'Veuillez remplir tous les champs.' });
  }

  if (newPassword !== confirmPassword) {
    return res.json({ result: false, error: 'Les mots de passe ne correspondent pas.' });
  }

  try {
    const user = await User.findOne({
      resetPasswordToken: token,
      resetPasswordExpires: { $gt: Date.now() },
    });

    if (!user) {
      return res.json({ result: false, error: "Token invalide ou expiré." });
    }
    // Hash du nouveau mot de passe  
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    await User.updateOne(
      { resetPasswordToken: token },
      {
        $set: { password: hashedPassword, resetPasswordToken: "", resetPasswordExpires: null },
      }
    );
    console.log('Mot de passe mis à jour avec succès.')

    res.json({ result: true, succes: 'Mot de passe mis à jour avec succès.' });
  } catch (error) {
    console.error(error);
    res.json({ result: false, error: 'Erreur lors de la mise à jour du mot de passe.' });
  }
})

router.post('/submit', async (req, res) => {

  try {
    const user = await User.findOne({ token: req.body.token });

    if (!user) {
      return res.json({ result: false, error: "Token invalide ou expiré." });
    } else {
      res.json({ userId: user.id })
    }
  } catch (error) {
    res.status(500).json({ message: 'Erreur serveur' });
  }

})

module.exports = router;
