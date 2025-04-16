const Discord = require("discord.js");
const db = require('quick.db');
const database = require("easy-json-database");
const fumer = new Database("../databases/fumer.json"); // fichier où les données seront stockées
const cl = new db.table("Color");
const config = require("../config");
const footer = config.bot.footer;

module.exports = {
    name: 'fumer',
    usage: 'fumer',
    description: `Permet aux professeurs de fumer au sein de l'établissement.`,
    execute(client, message) {
        let color = cl.fetch(`color_${message.guild.id}`) || config.bot.couleur;
        try {
            const embed = new Discord.MessageEmbed()
                .setDescription(`<@${message.author.id}> fume`)
                .setColor(color)
                .setFooter(footer);

            message.channel.send({ embeds: [embed] });
        } catch (error) {
            message.channel.send("Erreur : " + error.message);
        }
        const fumernb = fumer.get(message.author.id) || 0;
        fumer.set(message.author.id, fumernb + 1);
    }
};
