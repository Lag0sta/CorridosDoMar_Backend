import express from 'express';
import { Request, Response, NextFunction } from 'express';
import User from '../models/users';
import * as jwt from 'jsonwebtoken';
import { generateJWT } from '../utils/JWT';

const router = express.Router();

const nodemailer = require('nodemailer');

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

    // Hashage du mot de passe
    const hash = bcrypt.hashSync(req.body.password, 10);

    // Création d'un nouvel utilisateur
    const newUser = new User({
      avatar: req.body.avatar,
      pseudo: req.body.pseudo,
      capoeiraGroup: req.body.capoeiraGroup,
      email: req.body.email,
      password: hash,
      refreshToken: "",
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
    // Génération du token JWT avec generateJWT
    const accessToken = generateJWT(userData.id, userData.email!);

    // Génération du refreshToken
    const refreshToken = jwt.sign(
      { userId: userData.id },
      process.env.REFRESHSECRETTOKEN_KEY!,
      { expiresIn: '7d' } // Durée de vie plus longue (7 jours)
    );

     // Mettre à jour l'utilisateur avec le nouvel accessToken
     await User.findByIdAndUpdate(userData.id, {
      accessToken: accessToken,
    });

    // Envoi du refreshToken dans un cookie httpOnly
    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production', // seulement en prod (HTTPS)
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 jours
    });

    // Ensuite, envoie la réponse avec les données de l'utilisateur
    res.header('Access-Control-Allow-Origin', 'http://localhost:3001');  // Frontend
    res.header('Access-Control-Allow-Credentials', 'true');  // Autorise les cookies
    res.json({
      result: true,
      avatar: userData.avatar,
      pseudo: userData.pseudo,
      capoeiraGroup: userData.capoeiraGroup,
      email: userData.email,
      submits: userData.submits,
      accessToken,
    });
  } catch (error) {
    console.error(error);
    res.json({ result: false, error: 'error signing in' });
  }
});

router.post('/refresh-token', async (req: Request, res: Response) => {
  const refreshToken = req.cookies.refreshToken; // Lire le refresh token du cookie
  console.log('Refresh token reçu:', refreshToken);

  if (!refreshToken) {
    return void
      res.status(401).json({ result: false, error: 'Refresh token manquant' });
  }

  try {
    // Vérifier le refresh token
    const decoded = jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET!) as any;
    const userData = await User.findById(decoded.userId);

    if (!userData) {
      return void
        res.status(404).json({ result: false, error: 'Utilisateur non trouvé' });
    }

    // Créer un nouveau accessToken
    const accessToken = generateJWT(userData.id, userData.email!);

    // Répondre avec le nouveau accessToken
    res.header('Access-Control-Allow-Origin', 'http://localhost:3001');  // Frontend
    res.header('Access-Control-Allow-Credentials', 'true');  // Autorise les cookies
    res.json({ accessToken });
  } catch (err) {
    return void
      res.status(403).json({ result: false, error: 'Refresh token invalide ou expiré' });
  }
});

router.post('/forgotPassword', async (req, res): Promise<void> => {
  console.log("Demande de réinitialisation reçue pour:", req.body.email);  // Log l'email reçu

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

    const token = jwt.sign({ userId: user._id }, process.env.SECRET_KEY!, {
      expiresIn: '1h'
    });

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

    const resetUrl = `http://localhost:3001/resetPassword/${token}`;

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

router.put('/resetPassword/:resetPasswordToken', async (req, res): Promise<void> => {
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

router.post('/passwordCheck', async (req, res): Promise<void> => {
  try {

    if (!req.body.password) {
      res.json({ result: false, error: 'fill the fields' });
      return;
    }

    const userData = await User.findOneAndUpdate({token: req.body.token})

    if(!userData){
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

export default router;