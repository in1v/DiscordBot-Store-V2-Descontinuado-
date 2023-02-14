    const Discord = require("discord.js")
    const db = require("quick.db")
    const config = require("../config.json")
    module.exports = {
        name: "add",
        run: async(client, message, args) => {
            const embederro = new Discord.MessageEmbed()
            .setDescription(`Você não tem permissão para executar esse comando.`)
            .setColor(config.cor)
            .setFooter({ text: `${config.nomebot} `});
                    if (!message.member.permissions.has("ADMINISTRATOR")) return message.channel.send({ embeds: [embederro] })
            message.delete()
            const idn = new Discord.MessageEmbed()
            .setTitle(`${config.nomebot} | Sistema de criação de produtos`)
            .setDescription(`Envie o \`ID\` do produto`)
            .setFooter({ text: 'Você tem 30 segundos para enviar o ID do produto.' })
            .setColor(config.cor)
            const nomen = new Discord.MessageEmbed()
            .setTitle(`${config.nomebot} | Sistema de criação de produtos`)
            .setDescription(`Envie o \`NOME\` do produto`)
            .setFooter({ text: 'Você tem 30 segundos para adicionar um nome ao produto.' })
            .setColor(config.cor)
            const precon = new Discord.MessageEmbed()
            .setTitle(`${config.nomebot} | Sistema de criação de produtos`)
            .setDescription(`Envie o \`PREÇO\` do produto`)
            .setFooter({ text: 'Você tem 30 segundos para declarar o valor do produto.' })
            .setColor(config.cor)
            const descn = new Discord.MessageEmbed()
            .setTitle(`${config.nomebot} | Sistema de criação de produtos`)
            .setDescription(`Envie a \`DESCRIÇÃO\` do produto`)
            .setFooter({ text: 'Você tem 30 segundos para adicionar uma descrição ao produto.' })
            .setColor(config.cor)
            const prodn = new Discord.MessageEmbed()
            .setTitle(`${config.nomebot} | Sistema de criação de produtos`)
            .setDescription(`Envie o \`PRODUTO\` para entrega`)
            .setFooter({ text: 'Você tem 30 segundos para enviar o produto.'})
            .setColor(config.cor)
            const adici = new Discord.MessageEmbed()
            .setTitle(`${config.nomebot} | Sistema de criação de produtos`)
            .setDescription(`Produto criado com sucesso!`)
            .setColor(config.cor)
    message.channel.send({embeds: [idn]}).then(msg => {
        const filter = m => m.author.id === message.author.id;
    const collector = msg.channel.createMessageCollector({ filter, max: 1 });
    collector.on("collect", idproduto => {
        idproduto.delete();
        msg.delete();
    msg.channel.send({embeds: [nomen]}).then(msg => {
        const filter = m => m.author.id === message.author.id;
        const collector = msg.channel.createMessageCollector({ filter, max: 1 });
        collector.on("collect", nomeproduto => {
            nomeproduto.delete();
            msg.delete();
            db.push(`${idproduto}.nome`, `${nomeproduto}`)
            msg.channel.send({embeds: [precon]}).then(msg => {
                const filter = m => m.author.id === message.author.id;
                const collector = msg.channel.createMessageCollector({ filter, max: 1 });
                collector.on("collect", precoproduto => {
                    precoproduto.delete();
                    msg.delete();
                    db.push(`${idproduto}.preco`, `${precoproduto}`)
                    msg.channel.send({embeds: [descn]}).then(msg => {
                        const filter = m => m.author.id === message.author.id;
                        const collector = msg.channel.createMessageCollector({ filter, max: 1 });
                        collector.on("collect", descproduto => {
                            descproduto.delete();
                            msg.delete();
                            db.push(`${idproduto}.desc`, `${descproduto}`)
                            
                                msg.channel.send({embeds: [adici]})
                                db.push(`${idproduto}.conta`, [`${idproduto}`])
                                const a = db.get(`${idproduto}.conta`);
                                const removed = a.splice(0, 1);
                                db.set(`${idproduto}.conta`, a);
                            
                        })
                    })
                })
            })
        })
    })
    })
    })
        }
    }