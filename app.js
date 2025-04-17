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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
// Charger les variables d'environnement à partir du fichier .env
const dotenv = __importStar(require("dotenv"));
dotenv.config();
// Importer les modules nécessaires
const express_1 = __importDefault(require("express"));
const connection_js_1 = require("./models/connection.js");
const path_1 = __importDefault(require("path"));
const cookie_parser_1 = __importDefault(require("cookie-parser"));
const morgan_1 = __importDefault(require("morgan"));
// Se connecter à la base de données
(0, connection_js_1.connectToDatabase)();
// Importer les routeurs
const index_js_1 = __importDefault(require("./routes/index.js"));
const auths_js_1 = __importDefault(require("./routes/auths.js"));
const users_js_1 = __importDefault(require("./routes/users.js"));
const submits_js_1 = __importDefault(require("./routes/submits.js"));
// Créer l'application Express
const app = (0, express_1.default)();
// Activer CORS
const cors = require('cors');
const { cp } = require('fs');
app.use(cors());
// Définir les middlewares
app.use((0, morgan_1.default)('dev'));
app.use(express_1.default.json());
app.use(express_1.default.urlencoded({ extended: false }));
app.use((0, cookie_parser_1.default)());
app.use(express_1.default.static(path_1.default.join(__dirname, 'public')));
// Définir les routes
app.use('/', index_js_1.default);
app.use('/users', users_js_1.default);
app.use('/auths', auths_js_1.default);
app.use('/submits', submits_js_1.default);
module.exports = app;
