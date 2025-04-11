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
  const hash = bcrypt.hashSync(req.body.password, 10);
  try {
    const userData = await User.findOneAndUpdate(
      { token: req.body.token },
    {
      $set: {
        pseudo: req.body.pseudo,
        group: req.body.group,
        email: req.body.email,
        password: hash
      }
    },
    {new: true});

    if (userData) {
      res.json({ result: true, user: userData });
    } else {
      res.json({ result: false, message: "User not found" });
    } 
  } catch (error) {
    res.status(500).json({ result: false, message: 'Server error' });
  }
})

export default router;