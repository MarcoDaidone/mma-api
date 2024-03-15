import express from 'express';
import {Event} from '../models/events.js';

const router = express.Router();
router.get('/events', async (req, res) => {
    try {
      const events = await Event.find();
      res.json(events);
    } catch (error) {
      console.error("Erreur lors de la récupération des événements:", error.message);
      res.status(500).json({ error: 'Une erreur s\'est produite lors de la récupération des événements.' });
    }
  });

  export default router;
