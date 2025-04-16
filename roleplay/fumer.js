const Discord = require("discord.js");
const Fumer = require("./mongoose.js");
const config = require("./config.js");
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
      const fumeurs = await Fumer.find({ guildId: message.guild.id }).sort({ count: -1 }).limit(10);

      if (fumeurs.length === 0) {
        return message.channel.send("Aucun fumeur enregistré pour le moment.");
      }

      const classement = fumeurs.map((f, index) => {
        const user = message.guild.members.cache.get(f.userId);
        const tag = user ? user.user.tag : `Utilisateur inconnu (${f.userId})`;
        return `**#${index + 1}** - ${tag} : ${f.count} 🚬`;
      }).join("\n");

      const embedList = new Discord.MessageEmbed()
        .setTitle("🏆 Classement des fumeurs")
        .setDescription(classement)
        .setColor(color)
        .setFooter(footer);

      return message.channel.send({ embeds: [embedList] });
    }

    // Sinon, on exécute le comportement normal : +fumer
    try {
      const embedFume = new Discord.MessageEmbed()
        .setDescription(`<@${message.author.id}> fume`)
        .setColor(color)
        .setFooter(footer);

      message.channel.send({ embeds: [embedFume] });

      let userData = await Fumer.findOne({ userId: message.author.id, guildId: message.guild.id });

      if (!userData) {
        userData = await Fumer.create({
          userId: message.author.id,
          guildId: message.guild.id,
          count: 1,
        });
      } else {
        userData.count += 1;
        await userData.save();
      }

    } catch (error) {
      console.error(error);
      message.channel.send("Erreur : " + error.message);
    }
  }
};
