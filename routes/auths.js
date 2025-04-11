"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const users_1 = __importDefault(require("../models/users"));
const jwt = __importStar(require("jsonwebtoken"));
const JWT_1 = require("../utils/JWT");
const router = express_1.default.Router();
const nodemailer = require('nodemailer');
const bcrypt = require("bcryptjs");
/* GET users listing. */
router.get('/', (req, res) => {
    users_1.default.find().then((data) => {
        res.json(data);
    });
});
//route pour l'inscription de l'utilisateur
router.post('/signup', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        // Vérification des champs vides
        if (!req.body.pseudo || !req.body.email || !req.body.password) {
            res.json({ result: false, error: 'fill the fields' });
            return;
        }
        // Vérification si le compte existe déjà
        const userData = yield users_1.default.findOne({
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
        const newUser = new users_1.default({
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
        yield newUser.save();
        res.json({
            result: true,
            pseudo: newUser.pseudo,
            capoeiraGroup: newUser.capoeiraGroup,
            accessToken: newUser.accessToken,
        });
    }
    catch (error) {
        console.error(error);
        res.json({ result: false, error: 'error saving user' });
    }
}));
//route pour la connection de l'utilisateur
router.post('/signin', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        // Vérification des champs vides
        if (!req.body.email || !req.body.password) {
            res.json({ result: false, error: 'fill the fields' });
            return;
        }
        // Recherche de l'utilisateur par email
        const userData = yield users_1.default.findOne({ email: req.body.email });
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
        const accessToken = (0, JWT_1.generateJWT)(userData.id, userData.email);
        // Génération du refreshToken
        const refreshToken = jwt.sign({ userId: userData.id }, process.env.REFRESHSECRETTOKEN_KEY, { expiresIn: '7d' } // Durée de vie plus longue (7 jours)
        );
        // Mettre à jour l'utilisateur avec le nouvel accessToken
        yield users_1.default.findByIdAndUpdate(userData.id, {
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
        res.header('Access-Control-Allow-Origin', 'http://localhost:3001'); // Frontend
        res.header('Access-Control-Allow-Credentials', 'true'); // Autorise les cookies
        res.json({
            result: true,
            avatar: userData.avatar,
            pseudo: userData.pseudo,
            capoeiraGroup: userData.capoeiraGroup,
            email: userData.email,
            submits: userData.submits,
            accessToken,
        });
    }
    catch (error) {
        console.error(error);
        res.json({ result: false, error: 'error signing in' });
    }
}));
router.post('/refresh-token', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const refreshToken = req.cookies.refreshToken; // Lire le refresh token du cookie
    if (!refreshToken) {
        return void res.status(401).json({ result: false, error: 'Refresh token manquant' });
    }
    try {
        // Vérifier le refresh token
        const decoded = jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET);
        const userData = yield users_1.default.findById(decoded.userId);
        if (!userData) {
            return void res.status(404).json({ result: false, error: 'Utilisateur non trouvé' });
        }
        // Créer un nouveau accessToken
        const accessToken = (0, JWT_1.generateJWT)(userData.id, userData.email);
        // Répondre avec le nouveau accessToken
        res.header('Access-Control-Allow-Origin', 'http://localhost:3001'); // Frontend
        res.header('Access-Control-Allow-Credentials', 'true'); // Autorise les cookies
        res.json({ accessToken });
    }
    catch (err) {
        return void res.status(403).json({ result: false, error: 'Refresh token invalide ou expiré' });
    }
}));
router.post('/forgotPassword', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { email } = req.body;
    if (!req.body.email) {
        res.json({ result: false, error: 'fill the fields' });
    }
    try {
        const user = yield users_1.default.findOne({ email });
        if (!user) {
            res.json({ result: false, error: 'User not found.' });
            return;
        }
        const token = jwt.sign({ userId: user._id }, process.env.SECRET_KEY, {
            expiresIn: '1h'
        });
        const mailMdp = process.env.MDP_MAIL;
        const mail = process.env.MAIL;
        const service = process.env.SERVICE;
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
        yield transporter.sendMail(mailOptions);
        res.json({ result: true, succes: 'Email de réinitialisation envoyé.' });
    }
    catch (error) {
        console.error(error);
        res.json({ result: false, error: 'Erreur du serveur.' });
    }
}));
router.put('/resetPassword/:resetPasswordToken', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
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
        const user = yield users_1.default.findOne({
            resetPasswordToken: token,
            resetPasswordExpires: { $gt: Date.now() },
        });
        if (!user) {
            res.json({ result: false, error: "Token invalide ou expiré." });
        }
        // Hash du nouveau mot de passe  
        const hashedPassword = yield bcrypt.hash(newPassword, 10);
        yield users_1.default.updateOne({ resetPasswordToken: token }, {
            $set: { password: hashedPassword, resetPasswordToken: "", resetPasswordExpires: null },
        });
        console.log('Mot de passe mis à jour avec succès.');
        res.json({ result: true, succes: 'Mot de passe mis à jour avec succès.' });
    }
    catch (error) {
        console.error(error);
        res.json({ result: false, error: 'Erreur lors de la mise à jour du mot de passe.' });
    }
}));
router.post('/passwordCheck', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const userData = yield users_1.default.findOneAndUpdate({ token: req.body.token });
        if (!userData) {
            res.json({ result: false, message: "User not found" });
            return;
        }
        const isValidPassword = yield bcrypt.compare(req.body.password, userData.password);
        if (isValidPassword) {
            res.json({ result: true, message: "Access granted" });
            return;
        }
        else {
            res.json({ result: false, message: "Wrong password" });
            return;
        }
    }
    catch (error) {
        res.status(500).json({ result: false, message: 'Server error' });
    }
}));
exports.default = router;
