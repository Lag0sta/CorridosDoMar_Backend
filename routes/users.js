"use strict";
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
const router = express_1.default.Router();
const bcrypt = require("bcryptjs");
/* GET users listing. */
router.get('/', (req, res) => {
    users_1.default.find().then((data) => {
        res.json(data);
    });
});
//GET useProfilInfo
router.post('/userProfil', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const user = yield users_1.default.findOne(req.body.token);
        if (user) {
            res.json({
                avatar: user.avatar,
                pseudo: user.pseudo,
                group: user.capoeiraGroup,
                email: user.email,
            });
        }
        else {
            res.status(404).json({ message: 'Utilisateur non trouvé' });
        }
    }
    catch (error) {
        res.status(500).json({ message: 'Erreur serveur' });
    }
}));
router.post('/submit', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const user = yield users_1.default.findOne({ token: req.body.token });
        if (!user) {
            res.json({ result: false, error: "Token invalide ou expiré." });
        }
        else {
            res.json({ userId: user.id });
        }
    }
    catch (error) {
        res.status(500).json({ message: 'Erreur serveur' });
    }
}));
//route pour modifier les infos de l'utilisateur
router.put('/update', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    if (!req.body.accessToken) {
        res.status(400).json({ message: 'Token manquant' });
        return;
    }
    try {
        if (!req.body.password) {
            const userData = yield users_1.default.findOneAndUpdate({ accessToken: req.body.accessToken }, {
                $set: {
                    pseudo: req.body.pseudo,
                    group: req.body.group,
                    email: req.body.email,
                }
            }, { new: true });
            if (userData) {
                res.json({ result: true, message: "User updated", user: userData });
            }
            else {
                res.json({ result: false, message: "User not found" });
            }
        }
        else {
            const hash = bcrypt.hashSync(req.body.password, 10);
            const userData = yield users_1.default.findOneAndUpdate({ accessToken: req.body.accessToken }, {
                $set: {
                    pseudo: req.body.pseudo,
                    group: req.body.group,
                    email: req.body.email,
                    password: hash
                }
            }, { new: true });
            if (userData) {
                res.json({ result: true, message: "User updated", user: userData });
            }
            else {
                res.json({ result: false, message: "User not found" });
            }
        }
    }
    catch (error) {
        res.status(500).json({ result: false, message: 'Server error' });
    }
}));
//route pour modifier le mot de passe
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
exports.default = router;
