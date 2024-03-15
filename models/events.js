import mongoose from 'mongoose';
// Définition du schéma pour les événements
const eventSchema = new mongoose.Schema({
    title: String,
    time : String,
    date: String,
    channel: String,
    fights: [{
      fighterLeft: {
        name: String,
        record: String
      },
      fighterRight: {
        name: String,
        record: String
      },
      weightClass: String
    }]
  });
  const Event = mongoose.model('Event', eventSchema);
  // Exporter le modèle Event
  export { Event };