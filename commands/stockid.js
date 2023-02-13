const Discord = require("discord.js")
const db = require("quick.db")
const config = require("../config.json")
module.exports = {
    name: "stockid",
    run: async(client, message, args) => {
        message.delete()
        const embederro = new Discord.MessageEmbed()
        .setDescription(`Você não tem permissão para isto!`)
        .setColor(config.cor)
        .setFooter(`${config.nomebot}`)
                if (!message.member.permissions.has("ADMINISTRATOR")) return message.channel.send({ embeds: [embederro] })
        if(!args[0]) return message.channel.send("Insira o ID do produto ao lado.")
                if(!db.get(args[0])) return message.channel.send("❌ | Produto inexistente / não encontrado")

const itens = db.get(`${args[0]}.conta`);
const embed = new Discord.MessageEmbed()
.setTitle(`Mostrando o stoque de: ${args[0]}`)
.setDescription(`\`\`\`${itens.join(" \n") || "Sem estoque"}\`\`\``)
.setColor(config.cor)
.setFooter(`${config.nomebot} - Sistema de estoque`)
message.channel.send({embeds: [embed]})
    }
}