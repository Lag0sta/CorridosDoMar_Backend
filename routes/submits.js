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
const submits_1 = __importDefault(require("../models/submits"));
const users_1 = __importDefault(require("../models/users"));
const router = express_1.default.Router();
//route GET All submits listing. 
router.get('/', (req, res) => {
    submits_1.default.find().then((data) => {
        res.json(data);
    });
});
//route POST new submits 
router.post('/', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        if (!req.body.title || !req.body.mainText) {
            res.json({ result: false, error: 'fill the fields' });
            return;
        }
        let secondaryTitle = req.body.secondaryTitle;
        if (!secondaryTitle) {
            secondaryTitle = "unknown";
        }
        const submitData = yield submits_1.default.findOne({ type: req.body.type, title: req.body.title });
        console.log("submitData", submitData);
        if (submitData) {
            res.json({ result: false, error: "title already used" });
            return;
        }
        else {
            const newSubmit = new submits_1.default({
                type: req.body.type,
                title: req.body.title,
                secondaryTitle: secondaryTitle || "unknown",
                secondaryType: req.body.secondaryType,
                mainText: req.body.mainText,
                reasearchText: req.body.reasearchText,
                links: req.body.links,
                createdBy: req.body.createdBy,
                creationDate: Date.now(),
                latestUpdate: Date.now(),
                authorised: null
            });
            const data = yield newSubmit.save();
            res.json({
                result: true,
                type: data.type,
                title: data.title,
                secondaryTitle: data.secondaryTitle,
                secondaryType: data.secondaryType,
                mainText: data.mainText,
                links: data.links,
                createdBy: data.createdBy,
                creationDate: data.creationDate,
                latestUpdate: data.latestUpdate,
                authorised: data.authorised
            });
        }
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ result: false, error: error.message || 'error submitting' });
    }
}));
router.post('/search', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        if (!req.body.title) {
            res.json({ result: false, error: "fill the fields" });
        }
        if (req.body.title) {
            const searchData = yield submits_1.default.findOne({ title: req.body.title });
            if (!searchData) {
                res.json({ result: false, error: "title not found" });
            }
            else {
                res.json(searchData);
            }
        }
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ result: false, error: "Erreur interne" });
    }
}));
router.post('/mySubmits', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { accessToken } = req.body;
        if (!accessToken) {
            res.json({ result: false, error: "not authorised" });
            return;
        }
        const userData = yield users_1.default.findOne({ accessToken: accessToken });
        if (!userData) {
            res.json({ result: false, error: "user not found" });
            return;
        }
        const userID = userData._id;
        const userSubmits = yield submits_1.default.find({ createdBy: userID });
        if (!userSubmits) {
            res.json({ result: false, error: "no submits found" });
            return;
        }
        res.json({ result: true, userSubmits });
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ result: false, error: "Erreur interne" });
    }
}));
router.put('/update', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    if (!req.body.accessToken) {
        res.json({ result: false, error: "not authorised" });
        return;
    }
    if (!req.body.title || !req.body.mainText) {
        res.json({ result: false, error: "fill the fields" });
        return;
    }
    try {
        const editSubmit = yield submits_1.default.findOneAndUpdate({ _id: req.body.id }, {
            $set: {
                title: req.body.title,
                secondaryTitle: req.body.secondaryTitle,
                secondaryType: req.body.secondaryType,
                mainText: req.body.mainText,
                links: req.body.links,
                latestUpdate: Date.now()
            }
        }, { new: true });
        if (!editSubmit) {
            res.json({ result: false, error: "document not found" });
            return;
        }
        res.json({ result: true, data: editSubmit });
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ result: false, error: "Erreur interne" });
    }
}));
exports.default = router;
