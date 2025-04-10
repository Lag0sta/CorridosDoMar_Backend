// src/middleware/authMiddleware.ts

import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import User from '../models/users';

export interface AuthRequest extends Request {
  user?: any;
}

export const authenticateToken = async (req: AuthRequest, res: Response, next: NextFunction) => {
  const authHeader = req.headers.authorization;
  const token = authHeader?.split(" ")[1]; // Extraire le token

  if (!token) {
    return res.status(401).json({ result: false, error: "Token manquant" });
  }

  try {
    // Vérification du JWT
    const decoded = jwt.verify(token, process.env.SECRETTOKEN_KEY!) as any;
    req.user = decoded; // Ajouter les informations décodées dans la requête

    // Recherche de l'utilisateur dans la base de données
    const userData = await User.findById(decoded.userId);

    if (!userData) {
      return res.status(404).json({ result: false, error: "Utilisateur non trouvé" });
    }

    // L'utilisateur est trouvé, passe au middleware suivant
    next();
  } catch (err) {
    return res.status(403).json({ result: false, error: "Token invalide ou expiré" });
  }
};
