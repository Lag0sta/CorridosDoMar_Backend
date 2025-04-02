import express from 'express';
import { Request, Response } from 'express';
import User from '../models/users';
import crypto from 'crypto';

const router = express.Router();

const nodemailer = require('nodemailer');

const uid2 = require("uid2");
const bcrypt = require("bcryptjs");


/* GET users listing. */
router.get('/', (req, res) => {
  User.find().then((data) => {
    res.json(data)

  })
})

//route pour l'inscription de l'utilisateur
router.post('/signup', async (req, res) => {
  try {
    // Vérification des champs vides
    if (!req.body.pseudo || !req.body.email || !req.body.password) {
      res.json({ result: false, error: 'fill the fields' });
      return;
    }

    // Vérification si le compte existe déjà
    const userData = await User.findOne({
      $or: [{ pseudo: req.body.pseudo }, { email: req.body.email }],
    });
    if (userData) {
      res.json({ result: false, error: "username or @mail already used" });
      return;
    }

    // Vérification de l'adresse email
    const emailRegex = /^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/gi;
    if (!emailRegex.test(req.body.email)) {
      res.json({ result: false, error: "invalid @mail adress" });
      return;
    }

    // Création d'un nouveau token
    const token = uid2(32);

    // Hashage du mot de passe
    const hash = bcrypt.hashSync(req.body.password, 10);

    // Création d'un nouvel utilisateur
    const newUser = new User({
      avatar: req.body.avatar,
      pseudo: req.body.pseudo,
      capoeiraGroup: req.body.capoeiraGroup,
      token: token,
      email: req.body.email,
      password: hash,
      resetPasswordToken: "",
      resetPasswordExpires: "",
    });

    // Sauvegarde de l'utilisateur
    await newUser.save();
    res.json({
      result: true,
      pseudo: newUser.pseudo,
      capoeiraGroup: newUser.capoeiraGroup,
      token: newUser.token,
    });
  } catch (error) {
    console.error(error);
    res.json({ result: false, error: 'error saving user' });
  }
});

//route pour la connection de l'utilisateur
router.post('/signin', async (req, res) => {
  try {
    // Vérification des champs vides
    if (!req.body.email || !req.body.password) {
      res.json({ result: false, error: 'fill the fields' });
      return;
    }

    // Recherche de l'utilisateur
    const userData = await User.findOne({ email: req.body.email });
    if (!userData) {
      res.json({ result: false, error: "wrong email or password" });
      return;
    }

    // Vérification du mot de passe
    const password = req.body.password;
    if (!bcrypt.compareSync(password, userData.password)) {
      res.json({ result: false, error: "wrong email or password" });
      return;
    }

    // Mise à jour du token
    const token = uid2(32);
    userData.token = token;
    await userData.save();

    // Envoi de la réponse
    res.json({
      result: true,
      avatar: userData.avatar,
      pseudo: userData.pseudo,
      capoeiraGroup: userData.capoeiraGroup,
      token: userData.token,
      email: userData.email,
      submits: userData.submits
    });
  } catch (error) {
    console.error(error);
    res.json({ result: false, error: 'error signing in' });
  }
});

//route pour Récupérer les informations de l'utilisateur
router.get('/signin', async (req, res) => {
  try {
    const token = req.headers.token;
    if (!token) {
      res.json({ result: false, error: 'token missing' });
      return;
    }

    const userData = await User.findOne({ token });
    if (!userData) {
      res.json({ result: false, error: 'user not found' });
      return;
    }

    res.json({
      result: true,
      avatar: userData.avatar,
      pseudo: userData.pseudo,
    });
  } catch (error) {
    console.error(error);
    res.json({ result: false, error: 'error retrieving user data' });
  }
});

router.post('/forgotPassword', async (req, res): Promise<void> => {
  const { email } = req.body

  if (!req.body.email) {
    res.json({ result: false, error: 'fill the fields' })
  }

  try {
    const user = await User.findOne({ email })

    if (!user) {
      res.json({ result: false, error: 'User not found.' });
      return;
    }

    const resetToken = crypto.randomBytes(32).toString('hex');
    user.resetPasswordToken = resetToken;
    user.resetPasswordExpires = new Date(Date.now() + 3600000);

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

router.put('/resetPassword/:resetPasswordToken', async (req, res) : Promise<void> => {
  const { newPassword, confirmPassword } = req.body;
  const token = req.params.resetPasswordToken;
  if (!token) {
    res.json({ result: false, error: 'Token requis' });
  }

  if (!newPassword || !confirmPassword) {
    res.json({ result: false, error: 'Veuillez remplir tous les champs.' });
  }

  if (newPassword !== confirmPassword) {
    res.json({ result: false, error: 'Les mots de passe ne correspondent pas.' });
  }

  try {
    const user = await User.findOne({
      resetPasswordToken: token,
      resetPasswordExpires: { $gt: Date.now() },
    });

    if (!user) {
      res.json({ result: false, error: "Token invalide ou expiré." });
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

router.post('/submit', async (req, res) : Promise<void> => {

  try {
    const user = await User.findOne({ token: req.body.token });

    if (!user) {
      res.json({ result: false, error: "Token invalide ou expiré." });
    } else {
      res.json({ userId: user.id })
    }
  } catch (error) {
    res.status(500).json({ message: 'Erreur serveur' });
  }

})


export default router;