"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateJWT = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
// Définir la clé secrète à partir de la variable d'environnement
const secretKey = process.env.SECRET_KEY || 'fallback-secret';
const generateJWT = (userId, email) => {
    // Génération du token JWT avec la librairie jsonwebtoken
    const token = jsonwebtoken_1.default.sign({ userId, email }, secretKey, { expiresIn: '1h' }); // Signature avec la clé secrète
    return token;
};
exports.generateJWT = generateJWT;
