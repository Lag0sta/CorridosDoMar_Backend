import express from 'express';
import { Request, Response, NextFunction } from 'express';
import User from '../models/users';
import crypto from 'crypto';
import * as jwt from 'jsonwebtoken';
import { SignJWT } from 'jose';  // Importation de SignJWT de la bibliothèque jose
import { generateJWT } from '../utils/JWT';

const router = express.Router();

const nodemailer = require('nodemailer');

const uid2 = require("uid2");
const bcrypt = require("bcryptjs");


/* GET users listing. */
router.get('/', (req:Request, res:Response) => {
  User.find().then((data) => {
    res.json(data)

  })
})


router.post('/submit', async (req: Request, res: Response) : Promise<void> => {

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