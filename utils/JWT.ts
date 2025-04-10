import jwt from 'jsonwebtoken';


// Définir la clé secrète à partir de la variable d'environnement
const secretKey: string = process.env.SECRET_KEY as string || 'fallback-secret';

export const generateJWT = (userId: string, email: string): string => {
  // Génération du token JWT avec la librairie jsonwebtoken
  const token = jwt.sign({ userId, email }, secretKey, { expiresIn: '1h' }); // Signature avec la clé secrète
  return token;
};