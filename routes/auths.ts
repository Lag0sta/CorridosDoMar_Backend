import express from 'express';
import { Request, Response, NextFunction } from 'express';
import User from '../models/users';
import Submit from '../models/submits';

const router = express.Router();

const nodemailer = require('nodemailer');

const bcrypt = require("bcryptjs");
const crypto = require('crypto');
const uid2 = require('uid2');


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

    // Hashage du mot de passe
    const hash = bcrypt.hashSync(req.body.password, 10);

    // Création d'un nouvel utilisateur
    const newUser = new User({
      avatar: req.body.avatar,
      pseudo: req.body.pseudo,
      capoeiraGroup: req.body.capoeiraGroup,
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
      accessToken: newUser.accessToken,
    });
  } catch (error) {
    console.error(error);
    res.json({ result: false, error: 'error saving user' });
  }
});

//route pour la connection de l'utilisateur
router.post('/signin', async (req: Request, res: Response) => {
  try {
    // Vérification des champs vides
    if (!req.body.email || !req.body.password) {
      res.json({ result: false, error: 'fill the fields' });
      return;
    }

    // Recherche de l'utilisateur par email
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

    // Mettre à jour l'utilisateur avec le nouvel accessToken
    const newToken = uid2(32);
    const updatedUser = await User.findByIdAndUpdate(
      userData.id,
      { accessToken: newToken },
      { new: true }
    );

    if(!updatedUser) {
      res.json({ result: false, error: "user not found" });
      return;
    }
    // Ensuite, envoie la réponse avec les données de l'utilisateur
    res.json({
      result: true,
      avatar: updatedUser.avatar,
      pseudo: updatedUser.pseudo,
      capoeiraGroup: updatedUser.capoeiraGroup,
      email: updatedUser.email,
      accessToken: updatedUser.accessToken,
    });
  } catch (error) {
    console.error(error);
    res.json({ result: false, error: 'error signing in' });
  }
});


router.post('/forgotPassword', async (req, res): Promise<void> => {
  const { email } = req.body

  if (!req.body.email) {
    res.json({ result: false, error: 'fill the fields' });
    return;
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

    const transporter = nodemailer.createTransport({
      service: service,
      auth: {
        user: `${mail}`,
        pass: `${mailMdp}`,
      },
    });

    const resetUrl = `http://localhost:3001/resetPassword/${resetToken}`;

    const mailOptions = {
      from: `${mail}`,
      to: `${email}`,
      subject: 'Réinitialisation de votre mot de passe',
      html: `<p>Vous avez demandé une réinitialisation de mot de passe.</p>
             <p>Cliquez sur ce lien pour le réinitialiser : <a href="${resetUrl}">Réinitialiser le mot de passe</a></p>`,
    };

    await transporter.sendMail(mailOptions);

    res.json({ result: true, message: 'Email de réinitialisation envoyé.' });
  } catch (error) {
    console.error(error);
    res.json({ result: false, message: 'Erreur du serveur.' });
  }
})

router.post('/passwordCheck', async (req, res): Promise<void> => {
  try {

    if (!req.body.password) {
      res.json({ result: false, error: 'fill the fields' });
      return;
    }

    const userData = await User.findOneAndUpdate({ token: req.body.token })

    if (!userData) {
      res.json({ result: false, message: "User not found" });
      return;
    }
    const isValidPassword = await bcrypt.compare(req.body.password, userData.password);

    if (isValidPassword) {
      res.json({ result: true, message: "Access granted" });
      return;
    } else {
      res.json({ result: false, message: "Wrong password" });
      return;
    }
  } catch (error) {
    res.status(500).json({ result: false, message: 'Server error' });
  }
})

//route pour confirmer le user _id pour modifier les submits
router.post('/editSubmit', async (req, res): Promise<void> => {
  try {
    const userData = await User.findOne({ accessToken: req.body.accessToken })  
    console.log(userData)
    
    if(!userData){
      res.json({ result: false, message: "User not found" });
      return;
    }

    if(userData._id.toString() === req.body._id){
      res.json({ result: true, message: "Access granted" });
      return;
    }
  }catch (error) {
    res.status(500).json({ result: false, message: 'Server error' });
  }
})

export default router;