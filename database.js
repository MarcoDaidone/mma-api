import mongoose from 'mongoose';
import 'dotenv/config'

mongoose.connect(process.env.MONGODB_URI, { useNewUrlParser: true, useUnifiedTopology: true });
// Fonction pour établir la connexion à la base de données MongoDB
export async function connectToDatabase() {
  try {
    await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });
    console.log("Connexion à la base de données MongoDB réussie");
  } catch (error) {
    console.error("Erreur de connexion à la base de données MongoDB:", error);
  }
}
export const db = mongoose.connection;