
import express from 'express';
import { Event } from '../models/events.js';

const router = express.Router();

router.put('/events/:eventId', async (req, res) => {
    try {
      const { eventId } = req.params;
      const { time } = req.body; 
      const {channel} = req.body// Suppose que vous envoyez la nouvelle heure dans le corps de la requête
      console.log('Nouvelle heure :', time); // Ajout du console.log
      console.log('id eventId :', eventId); // Ajout du console.log
      console.log('id eventId :', channel);
      // Mettre à jour l'événement dans la base de données
      await Event.updateOne({ _id: eventId }, { $set: { time: time, channel: channel } });
      
      res.json({ message: 'Événement mis à jour avec succès.' });
    } catch (error) {
      console.error("Erreur lors de la mise à jour de l'événement :", error.message);
      res.status(500).json({ error: 'Une erreur s\'est produite lors de la mise à jour de l\'événement.' });
    }
  });

  export default router;
