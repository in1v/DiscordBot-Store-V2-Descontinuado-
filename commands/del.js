const Discord = require("discord.js")
const db = require("quick.db")
const config = require("../config.json")
const moment = require("moment")
moment.locale("pt-br");

module.exports = {
    name: "del", 
    run: async (client, message, args) => {
        const embederro = new Discord.MessageEmbed()
            .setDescription(`Você não tem permissão para executar esse comando.`)
            .setColor(config.cor)
        if (!message.member.permissions.has("ADMINISTRATOR")) return message.channel.send({ embeds: [embederro] })
    if(!args[0]) return message.channel.send("❌ | Coloque o ID do produto que deseja **deletar.**")
    db.delete(`${args.join(" ")}`)
    message.channel.send("✅ | Produto deletado com **sucesso**.")
    }
}