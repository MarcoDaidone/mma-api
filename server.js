import express from 'express';
import mongoose from 'mongoose';
import { Event } from './models/events.js';
import cors from 'cors';
import events from './routes/events.js';
import updateTime from './routes/updateTime.js';
import { connectToDatabase } from './database.js';

const app = express();
const PORT = process.env.PORT || 3000;
// Connexion à la base de données MongoDB
connectToDatabase();
// Middleware
app.use(cors());
app.use(express.json());
app.use(events);
app.use(updateTime);

// Démarrer le serveur
app.listen(PORT, () => {
  console.log(`Serveur en écoute sur le port ${PORT}`);
});
