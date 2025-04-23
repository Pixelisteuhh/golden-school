const config = require('../config');
const db = require('quick.db');
const cl = new db.table("Color");
const footer = config.bot.footer;
const Discord = require('discord.js');
const { Database } = require("easy-json-database");
const fumerDB = new Database("./data/fumer.json");

module.exports = {
  name: 'fumer',
  usage: 'fumer [list]',
  description: `Permet aux professeurs de fumer ou de voir le classement des fumeurs.`,

  async execute(client, message, args) {
    let color = cl.fetch(`color_${message.guild.id}`) || config.bot.couleur;

    // Si l'argument est "list", on affiche le classement
    if (args[0] === "list") {
      try {
        const all = fumerDB.all();
        const fumeurs = Object.entries(all)
          .filter(([_, val]) => val.guildId === message.guild.id)
          .sort((a, b) => b[1].count - a[1].count)
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

      fumerDB.set(key, userData);
    } catch (error) {
      console.error(error);
      message.channel.send("Erreur : " + error.message);
    }
  }
};
