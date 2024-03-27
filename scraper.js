import axios from 'axios';
import cheerio from 'cheerio';
import mongoose from 'mongoose';
import { Event } from './models/events.js';
import 'dotenv/config'



// Connexion à la base de données MongoDB
mongoose.connect(process.env.MONGODB_URI, { useNewUrlParser: true, useUnifiedTopology: true });
const db = mongoose.connection;


export async function scrapeAndSave() {
  try {
    // Supprimer la base de données existante
    await db.dropDatabase();
    console.log("Base de données existante supprimée avec succès.");

    // ... Votre code de scraping et d'ajout à la base de données ici ...

  } catch (error) {
    console.error("Erreur lors de la suppression de la base de données existante :", error.message);
  }
  try {
    // Faire une requête GET pour obtenir le contenu HTML de la page
    console.log("Envoi de la requête pour obtenir la page des événements...");
    const response = await axios.get('https://www.sherdog.com/events');
    const html = response.data;

    // Charger le contenu HTML dans Cheerio
    console.log("Chargement du contenu HTML...");
    const $ = cheerio.load(html);

    // Sélectionner les 10 premiers événements
    console.log("Sélection des 10 premiers événements...");
    const events = $('tr[itemtype="http://schema.org/Event"]').slice(0, 150);

    // Parcourir chaque événement
   for (let i = 0; i < events.length; i++) {
  const element = events[i];

  // Récupérer la valeur de l'attribut onclick
  const onclickValue = $(element).attr('onclick');
  console.log("onclickValue", onclickValue);

  // Extraire l'URL de l'attribut onclick
  const match = /'\/events\/([^']+)'/i.exec(onclickValue);
  if (match && match[1]) {
    const eventUrl = 'https://www.sherdog.com/events/' + match[1];
    console.log("URL de l'événement:", eventUrl);

    try {
      // Effectuer une requête HTTP pour obtenir les détails de l'événement
      console.log("Envoi de la requête pour obtenir les détails de l'événement...");
      const eventResponse = await axios.get(eventUrl);
      const eventHtml = eventResponse.data;

      // Charger le contenu HTML de l'événement dans Cheerio
      console.log("Chargement du contenu HTML de l'événement...");
      const $event = cheerio.load(eventHtml);

      // Extraire les détails de l'événement
      console.log("Extraction des détails de l'événement...");
      const title = $event('h1').text();
      console.log("Titre de l'événement:", title);
      const date = $event('meta[itemprop="startDate"]').attr('content');
      const mainEvents = $event('div.fight_card h3 span').map((index, element) => $(element).text()).get();
      

console.log("les dates:", date);
const fights = $event('tr[itemprop="subEvent"]');

const eventRecord = {
  title: title,
  time: "",
  date : date,
  channel : "",
  fights: []
};


// Ajouter les main events à la liste des combats

  eventRecord.fights.push({
    fighterLeft: { name: mainEvents[0], record:""},
    fighterRight: { name: mainEvents[1], record: "" },
    weightClass: "undefined"
  });



fights.each((index, element) => {
  const fightersLeft = $(element).find('.fighter_list.left span[itemprop="name"]').text().split(' ');
  const fightersRight = $(element).find('.fighter_list.right span[itemprop="name"]').text().split(' ');
  const weightClass = $(element).find('.weight_class').text();
  const recordLeft = $(element).find('.fighter_list.left .record em').text();
  const recordRight = $(element).find('.fighter_list.right .record em').text();

  eventRecord.fights.push({
    fighterLeft: { name: fightersLeft[0], record: recordLeft },
    fighterRight: { name: fightersRight[0], record: recordRight },
    weightClass: weightClass
  });
});

// Vérifier si le titre de l'événement contient 'ufc' ou 'hexagone'
console.log("Vérification du titre de l'événement..."); //One Championship00% FIGHT 
if (title.toLowerCase().includes('ufc') || title.toLowerCase().includes('hexagone') || title.toLowerCase().includes('one championship') || title.toLowerCase().includes('100% fight ') || title.toLowerCase().includes('ksw') || title.toLowerCase().includes('pfl') || title.toLowerCase().includes('bellator') || title.toLowerCase().includes('ares')|| title.toLowerCase().includes('oktagon') ) {
  console.log('Détails des combats:', eventRecord.fights);
  console.log('---');

  // Enregistrement des détails de l'événement dans la base de données
  const organisationName = 'Nom de votre organisation'; // Remplacez par le nom de votre organisation
  
  await Event.insertMany([eventRecord]);
  console.log('Détails de l\'événement enregistrés dans la base de données.');
}

        } catch (error) {
          console.error("Erreur lors du traitement de l'événement :", error.message);
        }
      } else {
        console.log('Impossible de trouver l\'URL de l\'événement');
      }
    }

    console.log("Scrapping terminé !");
  } catch (error) {
    console.error("Erreur lors du scraping :", error.message);
  }
}

scrapeAndSave();
