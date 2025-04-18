const { MessageEmbed } = require("discord.js");
const DB = require('easy-json-db'); // Importation de EasyJSONDB
const db = new DB("./data.json");  // Chemin vers le fichier JSON où les données sont stockées
const config = require('../config');
const cl = require('quick.db').table("Color");
const footer = config.bot.footer;

module.exports = {
  name: 'fumer',
  usage: 'fumer [list]',
  description: `Permet aux professeurs de fumer ou de voir le classement des fumeurs.`,

  async execute(client, message, args) {
    let color = cl.fetch(`color_${message.guild.id}`) || config.bot.couleur;

    // Si l'argument est "list", on affiche le classement
    if (args[0] === "list") {
      try {
        const fumeurs = db.get("fumeurs") || [];  // Récupérer les fumeurs depuis la base de données JSON

        if (fumeurs.length === 0) {
          return message.channel.send("Aucun fumeur enregistré pour le moment.");
        }

        // Trier les fumeurs par "count"
        const classement = fumeurs
          .sort((a, b) => b.count - a.count)
          .slice(0, 10) // Limiter à 10 premiers
          .map((f, index) => {
            const user = message.guild.members.cache.get(f.userId);
            const tag = user ? user.user.tag : `Utilisateur inconnu (${f.userId})`;
            return `**#${index + 1}** - ${tag} : ${f.count} 🚬`;
          }).join("\n");

        const embedList = new MessageEmbed()
          .setTitle("🏆 Classement des fumeurs")
          .setDescription(classement)
          .setColor(color)
          .setFooter(footer);

        return message.channel.send({ embeds: [embedList] });
      } catch (error) {
        console.error(error);
        message.channel.send("Erreur : " + error.message);
      }
    }

    // Sinon, on exécute le comportement normal : +fumer
    try {
      const embedFume = new MessageEmbed()
        .setDescription(`<@${message.author.id}> fume`)
        .setColor(color)
        .setFooter(footer);

      message.channel.send({ embeds: [embedFume] });

      // Récupération de l'utilisateur dans la base de données
      let userData = db.get(`fumeurs.${message.guild.id}.${message.author.id}`);

      if (!userData) {
        // Si l'utilisateur n'existe pas, on le crée
        userData = {
          userId: message.author.id,
          guildId: message.guild.id,
          count: 1,
        };
        db.push(`fumeurs.${message.guild.id}`, userData);  // Ajouter l'utilisateur à la liste des fumeurs
      } else {
        // Sinon, on incrémente le compteur
        userData.count += 1;
        db.set(`fumeurs.${message.guild.id}.${message.author.id}`, userData);  // Sauvegarder les données mises à jour
      }
    } catch (error) {
      console.error(error);
      message.channel.send("Erreur : " + error.message);
    }
  }
};