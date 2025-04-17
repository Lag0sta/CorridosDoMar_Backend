import express from 'express';
import { Request, Response, NextFunction } from 'express';
import User from '../models/users';


const router = express.Router();

const bcrypt = require("bcryptjs");


/* GET users listing. */
router.get('/', (req: Request, res: Response) => {
  User.find().then((data) => {
    res.json(data)

  })
})

//GET useProfilInfo
router.post('/userProfil', async (req: Request, res: Response) => {
  try {
    const user = await User.findOne(req.body.token);
    if (user) {

      res.json(
        {
          avatar: user.avatar,
          pseudo: user.pseudo,
          group: user.capoeiraGroup,
          email: user.email,
          submits: user.submits
        });
    } else {
      res.status(404).json({ message: 'Utilisateur non trouvé' });
    }
  } catch (error) {
    res.status(500).json({ message: 'Erreur serveur' });
  }
})

router.post('/submit', async (req: Request, res: Response): Promise<void> => {

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

//route pour modifier les infos de l'utilisateur
router.put('/update', async (req: Request, res: Response) => {
  if (!req.body.accessToken) {
    res.status(400).json({ message: 'Token manquant' });
    return;
  }
  
  try {

    if (!req.body.password) {
      const userData = await User.findOneAndUpdate(
        { accessToken: req.body.accessToken },
        {
          $set: {
            pseudo: req.body.pseudo,
            group: req.body.group,
            email: req.body.email,
          }
        },
        { new: true });

      if (userData) {
        res.json({ result: true, message: "User updated", user: userData });
      } else {
        res.json({ result: false, message: "User not found" });
      }
    } else {
      const hash = bcrypt.hashSync(req.body.password, 10);
      const userData = await User.findOneAndUpdate(
        { accessToken: req.body.accessToken },
        {
          $set: {
            pseudo: req.body.pseudo,
            group: req.body.group,
            email: req.body.email,
            password: hash
          }
        },
        { new: true });

      if (userData) {
        res.json({ result: true, message: "User updated", user: userData });
      } else {
        res.json({ result: false, message: "User not found" });
      }
    }

  } catch (error) {
    res.status(500).json({ result: false, message: 'Server error' });
  }
})

export default router;