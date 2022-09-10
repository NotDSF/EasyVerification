import { SlashCommandBuilder } from "@discordjs/builders";
import { CommandInteraction, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } from "discord.js";
import { createHmac } from "crypto";
import { DatabaseType } from "../modules/types";

module.exports = {
    execute: async (interaction: CommandInteraction, Users: any, Database: DatabaseType) => {
        const Guild = interaction.guild;
        if (!Guild) return;

        const ServerInfo = await Database.GetServer(Guild.id);
        if (!ServerInfo) {
            const Embed = new EmbedBuilder()
                .setTitle("Oops.. We ran into an issue")
                .setColor("#e75757")
                .setDescription("This server has not configured the verification bot, they can by running the `/setverifiedrole` command.");

            return interaction.reply({ embeds: [Embed] });
        }

        if (!Guild.roles.cache.get(ServerInfo.VerifiedRole)) {
            const Embed = new EmbedBuilder()
                .setTitle("Oops.. We ran into an issue")
                .setColor("#e75757")
                .setDescription("This server's verified role no longer exists, contact an administrator.");

            return interaction.reply({ embeds: [Embed] });
        }

        // @ts-ignore
        if (interaction.member?.roles.cache.get(ServerInfo.VerifiedRole)) {
            return await interaction.reply({ ephemeral: true, content: "You're already verified" });
        }
        
        const Hashed = createHmac("sha1", process.env.SALT as string).update(interaction.user.id).digest("hex");
        if (Users.get(Hashed)) {
            return await interaction.reply({ ephemeral: true, content: "You already have a pending verification, complete that first" });
        }

        Users.set(Hashed, {
            Timestamp: Date.now(),
            ID: interaction.user.id,
            GID: Guild.id,
            Role: ServerInfo.VerifiedRole
        });

        const Row = new ActionRowBuilder()
            .addComponents(
                new ButtonBuilder()
                    .setStyle(ButtonStyle.Link)
                    .setURL(`https://easyverify.tech/v/${Hashed}`)
                    .setLabel("Verify Here")
            );
        
        const Embed = new EmbedBuilder()
            .setTitle("Verify your identity")
            .setColor("#579de7")
            .setDescription("To gain access to this server you need to verify your identity");


        try {
            // @ts-ignore
            await interaction.user.send({ ephemeral: true, embeds: [Embed], components: [Row] });
            await interaction.reply({ ephemeral: true, content: "Sent the verification link to your DM's" });
        } catch (er) {
            const Embed = new EmbedBuilder()
                .setTitle("Verification Error")
                .setColor("#e75757")
                .setDescription("Please turn your direct messages on, then run `/verify`.")
                .setImage("https://i.imgur.com/O8eDg8K.png")

            return interaction.reply({ embeds: [Embed] });
        }
        
    },
    Data: new SlashCommandBuilder()
        .setName("verify")
        .setDescription("Verify your identity.")
}