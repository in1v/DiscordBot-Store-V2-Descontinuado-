    const Discord = require("discord.js");
    const client = new Discord.Client({ intents: 32767 });
    const config = require("./config.json");
    const mercadopago = require("mercadopago")
    const db = require("quick.db")
    const axios = require("axios")
    const { joinVoiceChannel } = require('@discordjs/voice');

    const {
        JsonDatabase,
    } = require("wio.db");

    const db2 = new JsonDatabase({
    databasePath:"./databases/myJsonDatabase.json"
    });
    const moment = require("moment")


    moment.locale("pt-br");
    client.login(config.TOKEN);

    client.once('ready', async () => {

        console.log("✅ - Estou online!")

    })


    //Boas vindas do servidor e cargo automático

    
    client.on("guildMemberAdd", async (member) => {

        let guild = client.guilds.cache.get(""); //ID do server
        let channel = client.channels.cache.get(""); //ID do canal onde as mensagem de boas vindas vai aparcer
        const cargo = member.guild.roles.cache.get("") //ID do cargo que vai ser atribuido assim que o membro entrar no servidor. 

        //Caso queira deixar somente a opção de cargo automatico remova o ID da ""let channel"
    
        if (guild != member.guild) {
    
        return console.log ("Um membro entrou em outro servidor");
    
        } else {
    
        member.roles.add(cargo)
        
        let entrada = new Discord.MessageEmbed()
        .setTitle (`Bem vindo(a) a Lojas com pagamentos automaticos`)
        .setDescription(`**Olá ${member.user.tag}, atualmente estamos com ${guild.memberCount} usuários.**`)
        .setColor("RANDOM")
        .setThumbnail(member.user.displayAvatarURL ({dynamic: true, format: "png", size: 1024}))
        .setFooter({ text: 'ID do usúario:' + member.user.id})
        .setTimestamp();
    
        await channel.send({ embeds: [entrada] })
        }
    
    });



    //ATIVIDADES DO BOT. CASO QUEIRA DEIXAR MENOS ATIVIDADES É SÓ REMOVER AS LETRAS. PRA ALTERAR É SÓ RENOMEÁ-LAS
    client.on("ready", () => {
        let activities = [
            `a`, 
            `b`,
            `c`,
            `d`
        ],
        i = 0;
        setInterval(() => client.user.setActivity(`${activities[i++ % activities.length]}`, {
           type: "WATCHING"  //PLAYING, STREAMING, LISTENING, WATCHING
        }), 5000);

    });

  


    process.on('multipleResolves', (type, reason, promise) => {
        console.log(`Erro encontrado:\n\n` + type, promise, reason)
    });
    process.on('unhandRejection', (reason, promise) => {
        console.log(`Erro encontrado:\n\n` + reason, promise)
    });
    process.on('uncaughtException', (error, origin) => {
        console.log(`Erro encontrado:\n\n` + error, origin)
    });
    process.on('uncaughtExceptionMonitor', (error, origin) => {
        console.log(`Erro encontrado:\n\n` + error, origin)
    });
    



    client.on('messageCreate', message => {
        if (message.author.bot) return;
        if (message.channel.type == 'dm') return;
        if (!message.content.toLowerCase().startsWith(config.prefix.toLowerCase())) return;
        if (message.content.startsWith(`<@!${client.user.id}>`) || message.content.startsWith(`<@${client.user.id}>`)) return;

        const args = message.content
            .trim().slice(config.prefix.length)
            .split(/ +/g);
        const command = args.shift().toLowerCase();

        try {
            const commandFile = require(`./commands/${command}.js`)
            commandFile.run(client, message, args);
        } catch (err) {
            console.log(err);
        }
    });


    client.on("interactionCreate", (interaction) => {
        if (interaction.isButton()) {

            const eprod = db.get(interaction.customId);
            if (!eprod) return;
            const severi = interaction.customId;
            if (eprod) {
                const quantidade = db.get(`${severi}.conta`).length;



                const row = new Discord.MessageActionRow()
                    .addComponents(
                        new Discord.MessageButton()
                            .setCustomId(interaction.customId)
                            .setLabel('Comprar')
                            .setEmoji("🛒")
                            .setStyle(config.botao),
                    );
                const embed = new Discord.MessageEmbed() 
                    .setTitle(`${config.nomebot} | Produto`)
                    .setDescription(`\`\`\`${db.get(`${interaction.customId}.desc`)}\`\`\`\n📦 | **Produto:** **__${db.get(`${interaction.customId}.nome`)}__**\n💰 | **Preço:** **__R$${db.get(`${interaction.customId}.preco`)}__**\n🗃️ | **Estoque:** **__${db.get(`${interaction.customId}.conta`).length}__**`)
                    .setColor(config.cor)
                    .setFooter({ text: 'Para comprar clique no botão abaixo.'})
                    .setImage(config.fotoembed)
                interaction.message.edit({ embeds: [embed], components: [row] })


                const embedsemstock = new Discord.MessageEmbed()
                    .setTitle(`${config.nomebot} | Sistema de vendas`)
                    .setDescription(`Este produto está sem estoque no momento, aguarde um reabastecimento!`)
                    .setColor(config.cor)
                    .setImage(config.fotoembed)
                if (quantidade < 1) return interaction.reply({
                    embeds: [embedsemstock],
                    ephemeral: true
                });

                interaction.guild.channels.create(`carrinho-${interaction.user.username}`, {
                    type: "GUILD_TEXT",
                    parent: config.catecarrinho,
                    permissionOverwrites: [
                        {
                            id: interaction.guild.id,
                            deny: ["VIEW_CHANNEL", "SEND_MESSAGES", "ADD_REACTIONS"]
                        },
                        {
                            id: interaction.user.id,
                            allow: ["VIEW_CHANNEL"],
                            deny: ["SEND_MESSAGES"]
                        }
                    ]
                }).then(c => {
                    interaction.reply({embeds: [], ephemeral: true})
                    const timer1 = setTimeout(function () {
                        
                        c.delete()
                    }, 300000)
                    c.setTopic(interaction.user.id)
                    const emessage = c.send({ content: `<@${interaction.user.id}>` }).then(msg => {
                        setTimeout(() => msg.delete(), 1000)
                    })

                    const row2 = new Discord.MessageActionRow()
                    .addComponents(
                        new Discord.MessageButton()
                            .setCustomId('pix')
                            .setEmoji("986039367183261737")
                            .setStyle(config.botao),
                    )
                    .addComponents(
                        new Discord.MessageButton()
                            .setCustomId('cancelar')
                            .setEmoji("❌")
                            .setStyle(config.botao),
                    );
                    const embed2 = new Discord.MessageEmbed()
                    .setTitle(`${config.nomebot} | Pagamentos`)
                    .setDescription(`Selecione se deseja usar pix para efetuar o pagamento ou cancelar o pedido. \n\n 💸 **- PIX**\n ❌** - Cancelar**`)
                    .setColor(config.cor)
                c.send({ embeds: [embed2], components: [row2] }).then(msg => {
                    const filter = i => i.user.id === interaction.user.id;
                    const collector = msg.channel.createMessageComponentCollector({ filter });
                    collector.on("collect", interaction2 => {
                    
                    
                            if (interaction2.customId == 'pix') {
                                clearInterval(timer1)
                                const timer2 = setTimeout(function () {
                        
                                    c.delete()
                                }, 300000)
                                msg.delete()
                                let quantidade1 = 1;
                                let precoalt = eprod.preco;
                                const row = new Discord.MessageActionRow()
                                    .addComponents(
                                        new Discord.MessageButton()
                                            .setCustomId('addboton')
                                            .setEmoji("986039362204602368")
                                            .setStyle(config.botao),
                                    )
                                    .addComponents(
                                        new Discord.MessageButton()
                                            .setCustomId('removeboton')
                                            .setEmoji("➖")
                                            .setStyle(config.botao),
                                    )
                                    .addComponents(
                                        new Discord.MessageButton()
                                            .setCustomId('comprarboton')
                                            .setEmoji("✅")
                                            .setStyle(config.botao),
                                    );
                                const embedss = new Discord.MessageEmbed()
                                    .setTitle(`Sistema de Compras`)
                                    .setDescription(`📦 | **Produto: **\`${eprod.nome}\`\n🗃️ | **Quantidade: **\`${quantidade1}\`\n💰 | **Preço: **\`R$${precoalt}\``)
                                    .setColor(config.cor)
                                interaction2.channel.send({ embeds: [embedss], components: [row], fetchReply: true }).then(msg => {
                                    const filter = i => i.user.id === interaction2.user.id;
                                    const collector = msg.createMessageComponentCollector({ filter });
                                    collector.on("collect", intera => {
                                        intera.deferUpdate()
                                        if (intera.customId === "addboton") {

                                            const embedadici = new Discord.MessageEmbed()
                                                .setDescription(`Você não pode adicionar um valor maior do que tem no estoque.`)
                                                .setColor(config.cor)
                                            if (quantidade1++ >= quantidade) {
                                                quantidade1--;

                                                intera.channel.send({ embeds: [embedadici] })
                                                const embedss2 = new Discord.MessageEmbed()
                                                    .setTitle(`Sistema de Compras`)
                                                    .setDescription(`📦 | **Produto: **\`${eprod.nome}\`\n🗃️ | **Quantidade: **\`${quantidade1}\`\n💰 | **Preço: **\`R$${precoalt}\``)
                                                    .setColor(config.cor)
                                                msg.edit({ embeds: [embedss2] })
                                            } else {
                                                precoalt = Number(precoalt) + Number(eprod.preco);
                                                const embedss = new Discord.MessageEmbed()
                                                    .setTitle(`Sistema de Compras`)
                                                    .setDescription(`📦 | **Produto: **\`${eprod.nome}\`\n🗃️ | **Quantidade: **\`${quantidade1}\`\n💰 | **Preço: **\`R$${precoalt}\``)
                                                    .setColor(config.cor)
                                                msg.edit({ embeds: [embedss] })
                                            }
                                        }
                                        if (intera.customId === "removeboton") {
                                            if (quantidade1 <= 1) {
                                                const embedadici = new Discord.MessageEmbed()
                                                    .setDescription(`Você não pode remover mais produtos`)
                                                    .setColor(config.cor)

                                                intera.channel.send({ embeds: [embedadici] })

                                            } else {
                                                precoalt = precoalt - eprod.preco;
                                                quantidade1--;
                                                const embedss = new Discord.MessageEmbed()
                                                    .setTitle(`Sistema de Compras`)
                                                    .setDescription(`📦 **Produto: **\`${eprod.nome}\`\n🗃️ **Quantidade: **\`${quantidade1}\`\n💰 **Preço: **\`R$${precoalt}\``)
                                                    .setColor(config.cor)
                                                msg.edit({ embeds: [embedss] })
                                            }
                                        }
        

                                        if (intera.customId === "comprarboton") {
                                            clearInterval(timer2)
                                            msg.channel.bulkDelete(50);
                                            mercadopago.configurations.setAccessToken(config.access_token);
                                            var payment_data = {
                                                transaction_amount: Number(precoalt),
                                                description: `Pagamento - ${interaction2.user.username}`,
                                                payment_method_id: 'pix',
                                                payer: {
                                                    email: 'paulaguimaraes2906@gmail.com',
                                                    first_name: 'Paula',
                                                    last_name: 'Guimaraes',
                                                    identification: {
                                                        type: 'CPF',
                                                        number: '07944777984'
                                                    },
                                                    address: {
                                                        zip_code: '06233200',
                                                        street_name: 'Av. das Nações Unidas',
                                                        street_number: '3003',
                                                        neighborhood: 'Bonfim',
                                                        city: 'Osasco',
                                                        federal_unit: 'SP'
                                                    }
                                                }
                                            };

                                            mercadopago.payment.create(payment_data).then(function (data) {
                                                const buffer = Buffer.from(data.body.point_of_interaction.transaction_data.qr_code_base64, "base64");
                                                const attachment = new Discord.MessageAttachment(buffer, "payment.png");
                                                const row = new Discord.MessageActionRow()
                                                    .addComponents(
                                                        new Discord.MessageButton()
                                                            .setCustomId('codigo')
                                                            .setEmoji("📄")
                                                            .setStyle(config.botao),
                                                    )
                                                    .addComponents(
                                                        new Discord.MessageButton()
                                                            .setCustomId('cancelarpix')
                                                            .setEmoji("986039358354251887")
                                                            .setStyle(config.botao),
                                                    );
                                                const embed = new Discord.MessageEmbed()
                                                    .setTitle(`${config.nomebot} | Sistema de pagamento`)
                                                    .setDescription(`💸 - Efetue o pagamento de \`${eprod.nome}\` escaneando o QR Code abaixo.\n\n> Caso prefira pagar usando o copia e cola, clique no botão “📄”, o bot irá enviar nesse chat o código do seu pagamento.`)
                                                    .setImage("attachment://payment.png")
                                                    .setColor(config.cor)
                                                    .setFooter({ text: 'Após efetuar o pagamento, o tempo de entrega é de no maximo 1 minuto!'})
                                                msg.channel.send({ embeds: [embed], files: [attachment], components: [row] }).then(msg => {

                                                    const collector = msg.channel.createMessageComponentCollector();
                                                    const lopp = setInterval(function () {
                                                        const time2 = setTimeout(function () {
                                                            clearInterval(lopp);
                                                            msg.channel.delete()
                                                        }, 300000)
                                                        axios.get(`https://api.mercadolibre.com/collections/notifications/${data.body.id}`, {
                                                            headers: {
                                                                'Authorization': `Bearer ${config.access_token}`
                                                            }
                                                        }).then(async (doc) => {

                                                            if (doc.data.collection.status === "approved") {
                                                                clearTimeout(time2)
                                                                clearInterval(lopp);
                                                                msg.channel.bulkDelete(50);
                                                                const a = db.get(`${severi}.conta`);
                                                                const embederror = new Discord.MessageEmbed()
                                                                    .setTitle(`${config.nomebot} ✅ | Compra aprovada`)
                                                                    .setDescription(`\`\`\` 😢 | Alguém acabou comprando o produto antes de você, mande mensagem uns dos staffs e apresente o código do pedido: [${data.body.id}]\`\`\``)
                                                                    .setColor(config.cor)

                                                                    db2.add("pedidostotal", 1)
                                                                    db2.add("gastostotal", Number(precoalt))
                                                                    
                                                                    db2.add(`${moment().format('L')}.pedidos`, 1)
                                                                    db2.add(`${moment().format('L')}.recebimentos`, Number(precoalt))
                                                                    
                                                                    db2.add(`${interaction.user.id}.gastosaprovados`, Number(precoalt))
                                                                    db2.add(`${interaction.user.id}.pedidosaprovados`, 1)

                                                                if (a < quantidade1) {
                                                                    interaction2.channel.send({ embeds: [embederror] })
                                                                    client.channels.cache.get(config.canallogs).send(`❌ | Ocorreu um erro na compra do: <@${interaction.user.id}>, Valor da compra: ${precoalt}`)
                                                                } else {
                                                                const removed = a.splice(0, Number(quantidade1));
                                                                db.set(`${severi}.conta`, a);
                                                                const embedentrega = new Discord.MessageEmbed()
                                                                    .setTitle(`${config.nomebot} ✅ | Compra aprovada`)
                                                                    .setDescription(`**\`\`\`${removed.join("\n")}\`\`\`\n__- ⚠️ | Lembre-se de **salvar o seu produto**, este canal sera apagado apos 10 minutos__**`)
                                                                    .setColor(config.cor)
                                                                    .setImage(config.fotoembed)
                                                                msg.channel.send({ embeds: [embedentrega] })
                                                                const membro = interaction.guild.members.cache.get(interaction.user.id)
                                                                const role = interaction.guild.roles.cache.find(role => role.id === config.cargovip)
                                                                membro.roles.add(role)
                                                                setTimeout(() => interaction2.channel.delete(), 600000)
                                                                const embedcompraaprovada = new Discord.MessageEmbed()
                                                                    .setTitle(`${config.nomebot} ✅ | Compra aprovada`)
                                                                    .addField(`ID do Pedido:`, `${data.body.id}`)
                                                                    .addField(`Comprador:`, `<@${interaction.user.id}>`, true)
                                                                    .addField(`ID do comprador:`, `\`${interaction.user.id}\``, true)
                                                                    .addField(`Data:`, `\`${moment().format('LLLL')}\``)
                                                                    .addField(`Produto ID:`, `\`${severi}\``, true)
                                                                    .addField(`Nome do Produto:`, `\`${eprod.nome}\``, true)
                                                                    .addField(`Valor pago:`, `\`R$${precoalt}\``, true)
                                                                    .addField(`Quantidade comprada:`, `\`${quantidade1}\``)
                                                                    .addField(`Produto entregue: `, `\`\`\`${removed.join(" \n")}\`\`\``)
                                                                    .setColor(config.cor)

                                                                client.channels.cache.get(config.canallogs).send({ embeds: [embedcompraaprovada] })

                                                                const embedaprovadolog = new Discord.MessageEmbed()
                                                                .setDescription(`**Comprador:** ${interaction.user}\n**Produto Comprado:** \`${eprod.nome}\`\nQuantidade: \`${quantidade1}\`\nValor Pago: \`${precoalt}\``)
                                                                .setColor(config.cor)
                                                                .setImage(config.fotoembed)
                                                                client.channels.cache.get(config.logpublica).send({embeds: [embedaprovadolog]})

                                                                const row2 = new Discord.MessageActionRow()
                                                                    .addComponents(
                                                                        new Discord.MessageButton()
                                                                            .setCustomId(interaction.customId)
                                                                            .setLabel('Comprar')
                                                                            .setEmoji("🛒")
                                                                            .setStyle(config.botao),
                                                                    );
                                                                const embed2 = new Discord.MessageEmbed()
                                                                    .setTitle(`${config.nomebot} | Produto`)
                                                                    .setDescription(`\`\`\`${db.get(`${interaction.customId}.desc`)}\`\`\`\n📦 - **Produto:** **__${db.get(`${interaction.customId}.nome`)}__**\n💰 - **Preço:** **__R$${db.get(`${interaction.customId}.preco`)}__**\n🗃️ - **Estoque:** **__${db.get(`${interaction.customId}.conta`).length}__**`)
                                                                    .setColor(config.cor)
                                                                    .setFooter({ text: 'Para comprar clique no botão abaixo.'})
                                                                    .setImage(config.fotoembed)
                                                                interaction.message.edit({ embeds: [embed2], components: [row2] })
                                                            }}
                                                        })
                                                    }, 10000)
                                                    collector.on("collect", interaction => {
                                                        if (interaction.customId === 'codigo') {
                                                            interaction.deferUpdate();
                                                            const row = new Discord.MessageActionRow()
                                                        
                                                            .addComponents(
                                                                new Discord.MessageButton()
                                                                    .setCustomId('cancelarpix')
                                                                    .setEmoji("986039358354251887")
                                                                    .setStyle(config.botao),
                                                            );
                                                            const embed = new Discord.MessageEmbed()
                                                                .setTitle(`${config.nomebot} | Sistema de pagamento`)
                                                                .setDescription(`<:seta:986039225344487425> - Efetue o pagamento de \`${eprod.nome}\` escaneando o QR Code abaixo.`)
                                                                .setImage("attachment://payment.png")
                                                                .setColor(config.cor)
                                                                .setFooter({ text: 'Após efetuar o pagamento, o tempo de entrega é de no maximo 1 minuto!'})
                                                            msg.edit({ embeds: [embed], files: [attachment], components: [row] })
                                                            interaction.channel.send(data.body.point_of_interaction.transaction_data.qr_code)
                                                        }
                                                        if (interaction.customId === 'cancelarpix') {
                                                            clearInterval(lopp);
                                                            interaction.channel.delete()
                                                        }
                                                    })
                                                })
                                            }).catch(function (error) {
                                                console.log(error)
                                            });





                                        }
                                    })
                                })
                            }
                            if (interaction2.customId == 'cancelar') {
                                clearInterval(timer1);
                                interaction2.channel.delete();
                            }
                        })
                    })
                })
            }



        }
    })




    client.on('interactionCreate', async interaction => {
        
        if (!interaction.isSelectMenu()) return;

        if (interaction.customId === 'gerenciar') {
            interaction.deferUpdate();
            const adb = interaction.values[0];
            const row = new Discord.MessageActionRow()
                .addComponents(
                    new Discord.MessageButton()
                        .setCustomId('precogerenciar')
                        .setLabel('Preço')
                        .setStyle('SUCCESS'),
                )
                .addComponents(
                    new Discord.MessageButton()
                        .setCustomId('nomegerenciar')
                        .setLabel('Nome')
                        .setStyle('PRIMARY'),
                )
                .addComponents(
                    new Discord.MessageButton()
                        .setCustomId('estoquegerenciar')
                        .setLabel('Estoque')
                        .setStyle('SECONDARY'),
                )
                .addComponents(
                    new Discord.MessageButton()
                        .setCustomId('descgerenciar')
                        .setLabel('Descrição')
                        .setStyle('SECONDARY'),
                ).addComponents(
                    new Discord.MessageButton()
                        .setCustomId('deletegerenciar')
                        .setLabel('Deletar')
                        .setStyle('DANGER'),
                );
            const embed = new Discord.MessageEmbed()
                .setTitle(`${config.nomebot} | Gerenciamento de produtos`)
                .setDescription(`📦 | Produto sendo gerenciado: **${adb}**`)
                .setColor(config.cor)
                .setFooter({ text: `${config.nomebot}` })
            interaction.message.edit({ embeds: [embed], components: [row] }).then(msg => {
                const filter = i => i.user.id === interaction.user.id;
                const collector = msg.createMessageComponentCollector({ filter });
                collector.on("collect", interaction => {
                    if (interaction.customId === "deletegerenciar") {
                        msg.delete()
                        db.delete(adb)
                        const row = new Discord.MessageActionRow()
                            .addComponents(
                                new Discord.MessageSelectMenu()
                                    .setCustomId('gerenciar')
                                    .setPlaceholder('Selecione uma opção')
                                    .addOptions(db.all().map(item => ({ label: `ID: ${item.ID} - Preço: R$${item.data.preco}`, description: `Nome: ${item.data.nome || "Sem nome"}`, value: item.ID }))),
                            );
                        const embed = new Discord.MessageEmbed()
                            .setDescription(`Para gerenciar novamente selecione o menu\n abaixo e clique no produto que deseja.`)
                            .setColor(config.cor)
                        msg.edit({ embeds: [embed], components: [row] })
                    }
                    if (interaction.customId === "precogerenciar") {
                        msg.delete()
                        const embedpreco = new Discord.MessageEmbed()
                            .setTitle(`${config.nomebot} | Gerenciando produto`)
                            .setDescription(`Envie o **novo preço** abaixo | ⬇️`)
                            .setColor(config.cor)
                        interaction.channel.send({ embeds: [embedpreco] }).then(msg => {
                            const filter = m => m.author.id === interaction.user.id;
                            const collector = msg.channel.createMessageCollector({ filter, max: 1 });
                            collector.on("collect", message => {
                                message.delete()
                                db.set(`${adb}.preco`, [`${message.content}`])

                                const row = new Discord.MessageActionRow()
                                    .addComponents(
                                        new Discord.MessageSelectMenu()
                                            .setCustomId('gerenciar')
                                            .setPlaceholder('Selecione uma opção')
                                            .addOptions(db.all().map(item => ({ label: `ID: ${item.ID} - Preço R$${item.data.preco}`, description: `Nome: ${item.data.nome || "Sem nome"}`, value: item.ID }))),
                                    );
                                const embed = new Discord.MessageEmbed()
                                    .setDescription(`Para gerenciar novamente selecione o menu\n abaixo e clique no produto que deseja.)`)
                                    .setColor(config.cor)
                                msg.edit({ embeds: [embed], components: [row] })
                            })
                        })
                    }
                    if (interaction.customId === "nomegerenciar") {
                        msg.delete()
                        const embednome = new Discord.MessageEmbed()
                            .setTitle(`${config.nomebot} | Gerenciando produto`)
                            .setDescription(`Envie o **novo nome** abaixo | ⬇️`)
                            .setColor(config.cor)
                        interaction.channel.send({ embeds: [embednome] }).then(msg => {
                            const filter = m => m.author.id === interaction.user.id;
                            const collector = msg.channel.createMessageCollector({ filter, max: 1 });
                            collector.on("collect", message => {
                                db.set(`${adb}.nome`, [`${message.content}`])
                                const row = new Discord.MessageActionRow()
                                    .addComponents(
                                        new Discord.MessageSelectMenu()
                                            .setCustomId('gerenciar')
                                            .setPlaceholder('Selecione uma opção')
                                            .addOptions(db.all().map(item => ({ label: `ID: ${item.ID} - Preço: R$${item.data.preco}`, description: `Nome: ${item.data.nome || "Sem nome"}`, value: item.ID }))),
                                    );
                                const embed = new Discord.MessageEmbed()
                                    .setDescription(`Para gerenciar novamente selecione o menu\n abaixo e clique no produto que deseja.`)
                                    .setColor(config.cor)
                                msg.edit({ embeds: [embed], components: [row] })
                            })
                        })
                    }
                    if (interaction.customId === "estoquegerenciar") {
                        msg.delete()
                        const itens = db.get(`${adb}.conta`);
                        const row2 = new Discord.MessageActionRow()
                            .addComponents(
                                new Discord.MessageButton()
                                    .setCustomId('adicionarest')
                                    .setLabel('Adicionar')
                                    .setStyle('SUCCESS'),
                            )
                            .addComponents(
                                new Discord.MessageButton()
                                    .setCustomId('removerest')
                                    .setLabel('Remover')
                                    .setStyle('DANGER'),
                            );
                        const embedest = new Discord.MessageEmbed()
                            .setTitle(`${config.nomebot} | Gerenciando produto`)
                            .setDescription(`Seu estoque atual: \`\`\`${itens.join(" \n") || "Você está sem estoque desse produto, adicione para gerenciar."}\`\`\``)
                            .setColor(config.cor)
                        interaction.channel.send({ embeds: [embedest], components: [row2] }).then(msg => {
                            const filter = i => i.user.id === interaction.user.id;
                            const collector = msg.createMessageComponentCollector({ filter });
                            collector.on("collect", interaction => {
                                if (interaction.customId === "adicionarest") {
                                    const embede = new Discord.MessageEmbed().setDescription(`Envie os produtos de um em um, quando finalizar o envio de todos digite: **"finalizar"**`).setColor(config.cor);
                                    msg.edit({ embeds: [embede], components: [] }).then(msg => {
                                        const filter = m => m.author.id === interaction.user.id;
                                        const collector = msg.channel.createMessageCollector({ filter })
                                        collector.on("collect", message => {

                                            if (message.content === "finalizar") {
                                                collector.stop();
                                                const itens = db.get(`${adb}.conta`);
                                                const embedfinalizar = new Discord.MessageEmbed()
                                                    .setTitle(`Novo estoque adicionado com sucesso.`)
                                                    .setDescription(`Seu novo **estoque** agora é: \n\`\`\`${itens.join(" \n")}\`\`\``)
                                                    .setColor(config.cor)
                                                interaction.channel.send({ embeds: [embedfinalizar] })
                                                const row = new Discord.MessageActionRow()
                                                    .addComponents(
                                                        new Discord.MessageSelectMenu()
                                                            .setCustomId('gerenciar')
                                                            .setPlaceholder('Selecione uma opção')
                                                            .addOptions(db.all().map(item => ({ label: `ID: ${item.ID} - Preço: R$${item.data.preco}`, description: `Nome: ${item.data.nome || "Sem nome"}`, value: item.ID }))),
                                                    );
                                                const embed = new Discord.MessageEmbed()
                                                    .setDescription(`Para gerenciar novamente selecione o menu\n abaixo e clique no produto que deseja.`)
                                                    .setColor(config.cor)
                                                msg.channel.send({ embeds: [embed], components: [row] })
                                            } else {

                                                message.delete()

                                                db.push(`${adb}.conta`, [`${message.content}`])
                                            }
                                        })
                                    })
                                }
                                if (interaction.customId === "removerest") {
                                    const embedest = new Discord.MessageEmbed()
                                        .setTitle(`${config.nomebot} | Gerenciando produto`)
                                        .setDescription(`Este é seu estoque: \`\`\`${itens.join(" \n") || "Sem estoque"}\`\`\`\n**Para remover um item você irá enviar a linha do produto!**`)
                                        .setColor(config.cor)
                                    msg.edit({ embeds: [embedest], components: [] }).then(msg => {
                                        const filter = m => m.author.id === interaction.user.id;
                                        const collector = msg.channel.createMessageCollector({ filter, max: 1 })
                                        collector.on("collect", message1 => {
                                            const a = db.get(`${adb}.conta`);
                                            a.splice(message1.content, 1)
                                            db.set(`${adb}.conta`, a);
                                            const itens2 = db.get(`${adb}.conta`);
                                            const embedest2 = new Discord.MessageEmbed()
                                                .setTitle(`${config.nomebot} | Gerenciar Produto`)
                                                .setDescription(`Este é seu novo estoque: \`\`\`${itens2.join(" \n") || "Sem estoque"}\`\`\``)
                                                .setColor(config.cor)
                                            msg.channel.send({ embeds: [embedest2] })
                                            const row = new Discord.MessageActionRow()
                                                .addComponents(
                                                    new Discord.MessageSelectMenu()
                                                        .setCustomId('gerenciar')
                                                        .setPlaceholder('Selecione uma opção')
                                                        .addOptions(db.all().map(item => ({ label: `ID: ${item.ID} - Preço: R$${item.data.preco}`, description: `Nome: ${item.data.nome || "Sem nome"}`, value: item.ID }))),
                                                );
                                            const embed = new Discord.MessageEmbed()
                                                .setDescription(`Para gerenciar novamente selecione o menu\n abaixo e clique no produto que deseja.`)
                                                .setColor(config.cor)
                                            msg.channel.send({ embeds: [embed], components: [row] })
                                        })
                                    })
                                }
                            })
                        })
                    }
                    if (interaction.customId === "descgerenciar") {
                        msg.delete()
                        const embeddesc = new Discord.MessageEmbed()
                            .setTitle(`${config.nomebot} | Gerenciando produto`)
                            .setDescription(`Envie a **nova descrição** abaixo | ⬇️`)
                            .setColor(config.cor)
                        interaction.channel.send({ embeds: [embeddesc] }).then(msg => {
                            const filter = m => m.author.id === interaction.user.id;
                            const collector = msg.channel.createMessageCollector({ filter, max: 1 });
                            collector.on("collect", message => {
                                message.delete()
                                db.set(`${adb}.desc`, [`${message.content}`])
                                const row = new Discord.MessageActionRow()
                                    .addComponents(
                                        new Discord.MessageSelectMenu()
                                            .setCustomId('gerenciar')
                                            .setPlaceholder('Selecione uma opção')
                                            .addOptions(db.all().map(item => ({ label: `ID: ${item.ID} - Preço: R$${item.data.preco}`, description: `Nome: ${item.data.nome || "Sem nome"}`, value: item.ID }))),
                                    );
                                const embed = new Discord.MessageEmbed()
                                    .setDescription(`Para gerenciar novamente selecione o menu\n abaixo e clique no produto que deseja.`)
                                    .setColor(config.cor)
                                msg.edit({ embeds: [embed], components: [row] })
                            })
                        })
                    }
                })
            })
        }
    });