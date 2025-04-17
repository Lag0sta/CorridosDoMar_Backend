// Charger les variables d'environnement à partir du fichier .env
import * as dotenv from 'dotenv';
dotenv.config();
// Importer les modules nécessaires
import express from 'express';
import { connectToDatabase } from './models/connection.js';
import path from 'path';
import cookieParser from 'cookie-parser';
import logger from 'morgan';

// Se connecter à la base de données
connectToDatabase()


// Importer les routeurs
import indexRouter from './routes/index.js';
import authsRouter from './routes/auths.js';
import usersRouter from './routes/users.js';
import submitsRouter from './routes/submits.js';

// Créer l'application Express
const app = express();

// Activer CORS
const cors = require('cors');
const { cp } = require('fs');

app.use(cors());

// Définir les middlewares
app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

// Définir les routes
app.use('/', indexRouter);
app.use('/users', usersRouter);
app.use('/auths',authsRouter);
app.use('/submits',submitsRouter);


module.exports = app;
