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
                submits: user.submits
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
    const hash = bcrypt.hashSync(req.body.password, 10);
    try {
        const userData = yield users_1.default.findOneAndUpdate({ token: req.body.token }, {
            $set: {
                pseudo: req.body.pseudo,
                group: req.body.group,
                email: req.body.email,
                password: hash
            }
        }, { new: true });
        if (userData) {
            res.json({ result: true, user: userData });
        }
        else {
            res.json({ result: false, message: "User not found" });
        }
    }
    catch (error) {
        res.status(500).json({ result: false, message: 'Server error' });
    }
}));
exports.default = router;
