// Charger les variables d'environnement à partir du fichier .env
require('dotenv').config();

// Importer les modules nécessaires
import express from 'express';
const path = require('path');
const cookieParser = require('cookie-parser');
const logger = require('morgan');
import { connectToDatabase } from './models/connection';

// Se connecter à la base de données
connectToDatabase()


// Importer les routeurs
const indexRouter = require('./routes/index').default;
const usersRouter = require('./routes/users').default;
const submitsRouter = require('./routes/submits').default;

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
app.use('/submits',submitsRouter);


module.exports = app;
