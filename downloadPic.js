import axios from 'axios';
import cheerio from 'cheerio';
import fs from 'fs';
import path from 'path';
import url from 'url';

async function scrapeAndSaveImage() {
    try {
        // Obtenir le chemin du répertoire actuel
        const currentDir = path.dirname(new URL(import.meta.url).pathname);

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
        // Créer un dossier pour stocker les images
        const imageDir = path.join(currentDir, 'images');
        if (!fs.existsSync(imageDir)) {
            fs.mkdirSync(imageDir);
        }
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
                    const title = $event('h1').text();
                    const mainEvents = $event('div.fight_card img').map((index, element) => {
                        const src = $(element).attr('src');
                        return url.resolve('https://www.sherdog.com', src);
                    }).get();
                    let mainEventsName = $event('div.fight_card h3 span').map((index, element) => $(element).text()).get();
                    const fights = $event('tr[itemprop="subEvent"]');
                    const eventRecord = { fights: [] };
                    // Ajouter les main events image à la liste des combats
                    eventRecord.fights.push({
                        fighterLeftImage: { src: mainEvents[0], fightersLeft: mainEventsName[0]},
                        fighterRightImage: { src: mainEvents[2], fightersRight: mainEventsName[1]},
                    });
                              
                    fights.each(async(index, element) => { // Utilisation de async pour utiliser await à l'intérieur de la boucle
                        
                        const fightersLeftImage = ('https://www.sherdog.com' + $(element).find('.fighter_list.left img').attr('src'));
                        const fightersRightImage = ('https://www.sherdog.com' + $(element).find('.fighter_list.right img').attr('src'));
                        const fightersLeft = $(element).find('.fighter_list.left .fighter_result_data span[itemprop="name"]').html().replace(/<br>/g, '');
                        const fightersRight = $(element).find('.fighter_list.right .fighter_result_data span[itemprop="name"]').html().replace(/<br>/g, '');
                        eventRecord.fights.push({
                            fighterLeftImage: { src: fightersLeftImage, fightersLeft: fightersLeft },
                            fighterRightImage: { src: fightersRightImage, fightersRight: fightersRight},
                        });
                    });
                    for (let index = 0; index < eventRecord.fights.length; index++) {
                        const fight = eventRecord.fights[index];
                        if (title.toLowerCase().includes('ufc') || title.toLowerCase().includes('hexagone') || title.toLowerCase().includes('one championship') || title.toLowerCase().includes('100% fight ') || title.toLowerCase().includes('ksw') || title.toLowerCase().includes('pfl') || title.toLowerCase().includes('bellator') || title.toLowerCase().includes('ares')|| title.toLowerCase().includes('oktagon') ) { 
                            try {
                                console.log("icii fight", fight);
                                console.log("l'image ici'", fight.fighterLeftImage.src);
                                console.log("le nom'", fight.fighterLeftImage.fightersLeft);
                                if (fight.fighterLeftImage.src && fight.fighterLeftImage.fightersLeft) {
                                    const imageUrl = fight.fighterLeftImage.src;
                                    console.log("ici image url", imageUrl);
                                    // Générer un nom d'image unique ou statique
                                    const imageName = `${fight.fighterLeftImage.fightersLeft.replace(/\s+/g, '')}.jpg`;
                                    const imagePath = path.join(imageDir, imageName);
                                    const imageResponse = await axios.get(imageUrl, { responseType: 'arraybuffer' });
                                    if (imageResponse && imageResponse.data) {
                                        fs.writeFileSync(imagePath, imageResponse.data);
                                        console.log(`Image téléchargée et enregistrée : ${imagePath}`);
                                    } else {
                                        console.error(`Aucune donnée reçue pour l'image : ${imageUrl}`);
                                    }
                                }
                    
                                if (fight.fighterRightImage.src && fight.fighterRightImage.fightersRight) {
                                    const imageUrl = fight.fighterRightImage.src;
                                    console.log("ici image url", imageUrl);
                                    // Générer un nom d'image unique ou statique
                                    const imageName = `${fight.fighterRightImage.fightersRight.replace(/\s+/g, '')}.jpg`;
                                    console.log("ici nom", fight.fighterRightImage.name);
                                    const imagePath = path.join(imageDir, imageName);
                                    const imageResponse = await axios.get(imageUrl, { responseType: 'arraybuffer' });
                                    if (imageResponse && imageResponse.data) {
                                        fs.writeFileSync(imagePath, imageResponse.data);
                                        console.log(`Image téléchargée et enregistrée : ${imagePath}`);
                                    } else {
                                        console.error(`Aucune donnée reçue pour l'image : ${imageUrl}`);
                                    }
                                }
                            } catch (error) {
                                console.error(`Erreur lors du téléchargement de l'image : ${error.message}`);
                            }
                        } 
                    };
                    
                    
                    
                     // Télécharger et enregistrer les images
                    

                    console.log("Record de l'événement:", eventRecord);

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

scrapeAndSaveImage();
