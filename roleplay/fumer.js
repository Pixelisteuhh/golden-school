const config = require('../config');
const db = require('quick.db');
const cl = new db.table("Color");
const footer = config.bot.footer;
const Discord = require('discord.js');
const EasyJsonDB = require("easy-json-database");
const fumerDB = new EasyJsonDB("./database/fumer.json");

module.exports = {
  name: 'fumer',
  usage: 'fumer [list]',
  description: `Permet aux professeurs de fumer ou de voir le classement des fumeurs.`,

  async execute(client, message, args) {
    let color = cl.fetch(`color_${message.guild.id}`) || config.bot.couleur;

    // Si l'argument est "list", on affiche le classement
    if (args[0] === "list") {
      console.log('Affichage du classement des fumeurs...');
      try {
        const all = fumerDB.all();
        console.log('Données récupérées :', all);

        // Filtrage des fumeurs pour la guildId de message.guild.id
        const fumeurs = all.filter(entry => {
          // Vérifie si la guildId dans la clé correspond à celle du serveur
          const [guildId] = entry.key.split('_'); // Découpe la clé pour obtenir guildId
          console.log(`Filtrage: ${guildId} == ${message.guild.id}`);
          return guildId === message.guild.id;
        }).sort((a, b) => b.data.count - a.data.count)
          .slice(0, 10);

        if (fumeurs.length === 0) {
          return message.channel.send("Aucun fumeur enregistré pour le moment.");
        }

        const classement = fumeurs.map(([id, data], index) => {
          const user = message.guild.members.cache.get(data.userId);
          const tag = user ? user.user.tag : `Utilisateur inconnu (${data.userId})`;
          return `**#${index + 1}** - ${tag} : ${data.count} 🚬`;
        }).join("\n");

        const embedList = new Discord.MessageEmbed()
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
    console.log('Exécution de la commande fumer...');
    try {
      const embedFume = new Discord.MessageEmbed()
        .setDescription(`<@${message.author.id}> fume`)
        .setColor(color)
        .setFooter(footer);

      message.channel.send({ embeds: [embedFume] });

      const key = `${message.guild.id}_${message.author.id}`;
      let userData = fumerDB.get(key);

      if (!userData) {
        userData = {
          userId: message.author.id,
          guildId: message.guild.id,
          count: 1
        };
      } else {
        userData.count += 1;
      }

      // Log pour vérifier les données avant de les sauvegarder
      console.log('Données à sauvegarder:', userData);

      fumerDB.set(key, userData);
      console.log(`Données sauvegardées : ${JSON.stringify(userData)}`);
    } catch (error) {
      console.error(error);
      message.channel.send("Erreur : " + error.message);
    }
  }
};
