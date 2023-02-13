const Discord = require("discord.js")
const db = require("quick.db")
const config = require("../config.json")
module.exports = {
    
    name: "limpar",
    run: async(client, message, args) => {
        const embederro = new Discord.MessageEmbed()
        .setDescription(`Você não tem permissão para executar esse comando.`)
        .setColor(config.cor)
        .setFooter(`${config.nomebot}`)
                if (!message.member.permissions.has("ADMINISTRATOR")) return message.channel.send({ embeds: [embederro] }).then(msg => {
                    setTimeout(() => msg.delete(), 5000)
                })
 message.channel.bulkDelete(99)

    }
}