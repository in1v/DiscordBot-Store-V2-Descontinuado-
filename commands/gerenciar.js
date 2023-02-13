    const Discord = require("discord.js")
    const cor = require("../config.json").cor;
    const config = require("../config.json")
    const db = require("quick.db")
    module.exports = {
        
        run: async(client, message, args) => {
            
            const embederro = new Discord.MessageEmbed()
            .setDescription(`Você não tem permissão para executar esse comando.`)
            .setColor(config.cor)
            .setFooter(`${config.nomebot}`)
                    if (!message.member.permissions.has("ADMINISTRATOR")) return message.channel.send({ embeds: [embederro] })
                    const embednprod = new Discord.MessageEmbed()
                    .setTitle("Sistema de gerenciamento de produtos")
                    .setDescription("Você não tem nenhum produto criado, utilize \`[.add]\` para criar um produto!")
                    .setColor(config.cor)

                
                    
                    if(db.all().length == 0) return message.channel.send({embeds: [embednprod]}).then(msg => {
                        message.delete()
                        setTimeout(() => msg.delete(), 10000)
                    })
                    message.delete()
            const row = new Discord.MessageActionRow()
    .addComponents(
        new Discord.MessageSelectMenu()
            .setCustomId('gerenciar')
            .setPlaceholder('Selecione uma opção')
            .addOptions(db.all().map(item => ({ label: `ID: ${item.ID}`, description: `NOME: ${item.data.nome || "Sem nome"} - PREÇO: R$${item.data.preco},00`, value: item.ID }))),
    );
    const embed = new Discord.MessageEmbed()
    .setTitle(`${config.nomebot} | Sistema de gerenciamento de produtos`)
    .setDescription(`Menu de gerenciamento de produtos`)
    .setColor(config.cor)
    .setFooter("Selecione o menu abaixo e clique no produto que você deseja gerenciar.")
    .setImage(config.fotoembed)
    message.channel.send({embeds: [embed], components: [row]})
        }
    }