import * as Discord from "discord.js";
import * as dotenv from "dotenv";
import compression from "compression";
import express from "express";
import { readdirSync, lstatSync } from "fs";
import { REST } from "@discordjs/rest";
import { Routes } from "discord-api-types/v9";
import { PrismaClient } from "@prisma/client"
import { join } from "path";
import { database } from "./modules/database"
import { Command, DatabaseType } from "./modules/types";

const client = new Discord.Client({ 
    intents: [Discord.GatewayIntentBits.Guilds] 
});

let Commands = new Map();
let SlashCommands: any = [];
let Users = new Map();
let Database: DatabaseType;

function ReadDirectory(name: string) {
    readdirSync(join(__dirname, name)).forEach(async file => {
        const stat = lstatSync(join(__dirname, `${name}/${file}`));
        if (stat.isDirectory()) {
            return ReadDirectory(`${name}/${file}`);
        }

        if (file.split(".").pop() === "js") {
            const command = require(join(__dirname, `${name}/${file}`));
            Commands.set(command.Data.name, command);
            SlashCommands.push(command.Data.toJSON());
        }
    });
}

ReadDirectory("commands");

if (process.platform === "win32" && process.env.TESTING_TOKEN && process.env.TESTING_APPLICATION_ID) {
    process.env.TOKEN = process.env.TESTING_TOKEN;
    process.env.APPLICATION_ID = process.env.TESTING_APPLICATION_ID;
    console.log("You are currently running in development mode!");
}

const rest = new REST({ version: "9" }).setToken(process.env.TOKEN as string);
const app = express();
app.use(compression());

app.get("/v/:id", async (req, res) => {
    const Info = Users.get(req.params.id);
    Users.delete(req.params.id);

    if (!Info) return res.send("Invalid ID, try running /verify again?");
    if ((Date.now() - Info.Timestamp) / 1000 > 60) return res.send("You took too long to verify, try again?");

    const Guild = client.guilds.cache.get(Info.GID);
    if (!Guild) return res.send("The guild associated with this verification link no longer exists.");

    const User = Guild.members.cache.get(Info.ID);
    const Role = Guild.roles.cache.get(Info.Role);

    if (!Role || !Role?.editable) {
        return res.send("The role given to verified people in this server is setup incorrectly or missing, contact a staff member.");
    }

    User?.roles.add(Info.Role);

    const Row = new Discord.ActionRowBuilder<Discord.ButtonBuilder>()
        .addComponents(
            new Discord.ButtonBuilder()
                .setStyle(Discord.ButtonStyle.Link)
                .setURL(`https://easyverify.tech/invite`)
                .setLabel("Protect your server")
        );

    try {
        await User?.send({ content: `You have successfully verified into **${Guild.name}**`, components: [Row] });
    } catch (er) {}
    
    res.send(`You have successfully verified into ${Guild.name}`);

    if (Info.LogChannel) {
        const Channel = Guild.channels.cache.get(Info.LogChannel);
        if (!Channel) return;

        const Embed = new Discord.EmbedBuilder()
            .setTitle("Verification Completed")
            .setColor("#579de7")
            .setFields({ name: "User", value: `<@${User?.id}>` })
            .setTimestamp();

        // @ts-ignore
        Channel.send({ embeds: [Embed] });
    }
});

app.get("/invite", (req, res) => res.redirect("https://discord.com/api/oauth2/authorize?client_id=1017530373959323719&permissions=8&scope=bot%20applications.commands"));

client.on("ready", async () => {
    const prisma = new PrismaClient();
    await prisma.$connect();
    Database = new database(prisma);
    console.log("Connected to database");
    
    client.user?.setActivity(`Protecting ${client.guilds.cache.size} guilds`);
    console.log("Application ready!");

    try {
        await rest.put(Routes.applicationCommands(process.env.APPLICATION_ID as string), { body: SlashCommands });
        console.log("Loaded slash commands");
    } catch (er: any) {
        console.error(er.toString());
    }

    app.listen(80, () => console.log("Web application ready!"));
});

client.on("interactionCreate", async (interaction) => {
    if (!interaction.isCommand() || !interaction.inGuild()) return;

    let CommandData: Command = Commands.get(interaction.commandName);
    if (!CommandData) return;

    if (interaction.guild && !interaction.guild.members.me?.permissions.has("Administrator")) {
        await interaction.reply("The bot needs the `ADMINISTRATOR` permission to run this command.");
        return;
    }

    if (CommandData.AdminRequired && !(interaction.member as Discord.GuildMember).permissions.has("Administrator")) {
        await interaction.reply({ ephemeral: true, content: "You need the `ADMINISTRATOR` permission to run this command." });
        return;
    }

    try {
        CommandData.execute(interaction, Users, Database);
    } catch (er: any) {
        console.error(er.toString());   
    }
});

client.on("guildCreate", () => {
    client.user?.setActivity(`Protecting ${client.guilds.cache.size} guilds`)
});

client.on("guildDelete", async (guild) => {
    client.user?.setActivity(`Protecting ${client.guilds.cache.size} guilds`);

    const Server = await Database.GetServer(guild.id);
    if (Server) {
        await Database.DeleteServer(guild.id);
    }
});

client.login(process.env.TOKEN);