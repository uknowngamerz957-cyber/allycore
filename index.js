const { Client, GatewayIntentBits, EmbedBuilder } = require('discord.js');
const fs = require('fs');

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent,
        GatewayIntentBits.GuildMembers
    ]
});

// Configuration IDs
const RESTOCK_LOG_CHANNEL_ID = "...803"; 
const GEN_CHANNEL_ID = "1553387544148705322"; 
const STATUS_CHANNEL_ID = "1553388761897893888"; 
const VOUCH_CHANNEL_ID = "...076";
const VOUCH_CHECK_CHANNEL_ID = "...834";
const ROLE_TO_ASSIGN_ID = "...3836";

client.once('ready', () => {
    console.log(`Bot is online: ${client.user.tag}`);
    client.user.setActivity('AllyCloud #MCFA', { type: 0 });
});

client.on('messageCreate', async (message) => {
    if (message.author.bot) return;

    const prefix = '$';
    if (!message.content.startsWith(prefix)) return;

    const args = message.content.slice(prefix.length).trim().split(/ +/);
    const command = args.shift().toLowerCase();

    // 1. $helpgen command
    if (command === 'helpgen') {
        const helpEmbed = new EmbedBuilder()
            .setColor(0x00FFFF)
            .setTitle("🌟 AllyCloud Bot Help Menu")
            .setDescription("Here is the list of all available commands:")
            .addFields(
                { name: "`$gen mcfa`", value: "Generate a Minecraft Full Access account (Works only in <#1553387544148705322>).", inline: false },
                { name: "`$restock [text]`", value: "Add stock to the file and restart the bot (Admin only).", inline: false },
                { name: "`$stock`", value: "Check available stock count.", inline: false },
                { name: "`$cstatus`", value: "Check bot status (Works only in <#1553388761897893888>).", inline: false }
            )
            .setFooter({ text: "AllyCloud • Sakura Dark & Neon Theme" });

        return message.reply({ embeds: [helpEmbed] }).catch(() => {});
    }

    // 2. $stock command
    if (command === 'stock') {
        try {
            if (!fs.existsSync('mcfa.txt')) {
                return message.reply({ content: `❌ Stock file not found!`, ephemeral: true }).catch(() => {});
            }
            const fileContent = fs.readFileSync('mcfa.txt', 'utf-8');
            const lines = fileContent.split(/\r?\n/).filter(line => line.trim() !== '');
            
            const stockEmbed = new EmbedBuilder()
                .setColor(0x57F287)
                .setTitle("📦 AllyCloud Stock Status")
                .setDescription(`Total available accounts in stock: **${lines.length}**`);

            return message.reply({ embeds: [stockEmbed] }).catch(() => {});
        } catch (err) {
            console.error(err);
            return message.reply({ content: `❌ An error occurred while checking stock!`, ephemeral: true }).catch(() => {});
        }
    }

    // 3. $restock command (With Auto-Restart)
    if (command === 'restock') {
        if (!message.member.permissions.has('Administrator')) {
            return message.reply({ content: `❌ You do not have permission to use this command!`, ephemeral: true }).catch(() => {});
        }

        const stockData = args.join(' ');
        if (!stockData) {
            return message.reply({ content: `❌ Please provide text! Usage: \`$restock email:password\``, ephemeral: true }).catch(() => {});
        }

        fs.appendFileSync('mcfa.txt', stockData + '\n', 'utf-8');

        const fileContent = fs.readFileSync('mcfa.txt', 'utf-8');
        const lines = fileContent.split(/\r?\n/).filter(line => line.trim() !== '');
        const totalStock = lines.length;

        const restockEmbed = new EmbedBuilder()
            .setColor(0x57F287)
            .setTitle("✅ Stock Added & Restarting")
            .setDescription(`Stock successfully added!\nTotal stock available: **${totalStock}**\n🔄 Bot is restarting...`);

        await message.reply({ embeds: [restockEmbed] }).catch(() => {});

        const logChannel = message.guild.channels.cache.get(RESTOCK_LOG_CHANNEL_ID);
        if (logChannel) {
            const logEmbed = new EmbedBuilder()
                .setColor(0x5865F2)
                .setTitle("📥 New Stock Added (Restocked)")
                .addFields(
                    { name: "Added By", value: `<@${message.author.id}>`, inline: true },
                    { name: "Total Available Stock", value: `**${totalStock}** accounts`, inline: true },
                    { name: "Added Content", value: `\`\`\`${stockData}\`\`\`` }
                )
                .setTimestamp();

            await logChannel.send({ embeds: [logEmbed] }).catch(() => {});
        }

        setTimeout(() => {
            process.exit(0);
        }, 1000);
    }

    // 4. $cstatus command (Restricted to STATUS_CHANNEL_ID)
    if (command === 'cstatus') {
        if (message.channel.id !== STATUS_CHANNEL_ID) {
            return message.reply({ content: `❌ You cannot use this command here! Please use <#${STATUS_CHANNEL_ID}>.`, ephemeral: true }).catch(() => {});
        }

        const statusEmbed = new EmbedBuilder()
            .setColor(0x00FF00)
            .setTitle("🟢 AllyCloud Status")
            .setDescription("Bot is fully online and running smoothly!");
        return message.reply({ embeds: [statusEmbed] }).catch(() => {});
    }

    // 5. $gen mcfa command (Restricted to GEN_CHANNEL_ID)
    if (command === 'gen') {
        const sub = args[0] ? args[0].toLowerCase() : '';
        if (sub !== 'mcfa') {
            return message.reply({ content: `❌ Invalid usage! Use \`$gen mcfa\``, ephemeral: true }).catch(() => {});
        }

        if (message.channel.id !== GEN_CHANNEL_ID) {
            return message.reply({ content: `❌ You cannot generate here! Please use <#${GEN_CHANNEL_ID}>.`, ephemeral: true }).catch(() => {});
        }

        try {
            if (!fs.existsSync('mcfa.txt')) {
                return message.reply({ content: `❌ Stock file not found!`, ephemeral: true }).catch(() => {});
            }

            const fileContent = fs.readFileSync('mcfa.txt', 'utf-8');
            let lines = fileContent.split(/\r?\n/).filter(line => line.trim() !== '');

            if (lines.length === 0) {
                return message.reply({ content: `❌ Stock is currently empty!`, ephemeral: true }).catch(() => {});
            }

            const account = lines.shift();
            fs.writeFileSync('mcfa.txt', lines.join('\n') + (lines.length > 0 ? '\n' : ''), 'utf-8');

            const dmEmbed = new EmbedBuilder()
                .setColor(0x00FFFF)
                .setTitle("🎮 Minecraft Full Access Account")
                .setDescription(`Here are your account details:\n\`\`\`${account}\`\`\``)
                .setFooter({ text: "Enjoy your account on AllyCloud!" });

            try {
                await message.author.send({ embeds: [dmEmbed] });
                message.reply({ content: `✅ Account successfully sent to your DMs! Check your messages.`, ephemeral: true }).catch(() => {});
            } catch (dmErr) {
                return message.reply({ content: `❌ Your DMs are closed! Please open your DMs and try again.`, ephemeral: true }).catch(() => {});
            }

        } catch (err) {
            console.error(err);
            return message.reply({ content: `❌ An error occurred while generating the account!`, ephemeral: true }).catch(() => {});
        }
    }
});

// Error handlers
process.on('unhandledRejection', error => {
    console.error('Unhandled promise rejection:', error);
});

process.on('uncaughtException', error => {
    console.error('Uncaught exception:', error);
});

// Bot Login with new token
client.login('MTU1MzQyODg2MDE2NTQyMzEwNA.GlDqOW.W5Wcor73O6Ejrck0VyBafwp1ZbJsxTB2EqMaOU');