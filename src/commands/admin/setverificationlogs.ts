import { SlashCommandBuilder } from "@discordjs/builders";
import { CommandInteraction, EmbedBuilder } from "discord.js";
import { DatabaseType } from "../../modules/types";

module.exports = {
    execute: async (interaction: CommandInteraction, Users: any, Database: DatabaseType) => {
        const Channel = interaction.options.get("channel", true).channel;

        const Server = await Database.GetServer(interaction.guild?.id as string);
        if (!Server) {
            const Embed = new EmbedBuilder()
                .setTitle("There was an error with configuring")
                .setColor("#e75757")
                .setDescription("You need to set the verified role before the verification logs.");

            return interaction.reply({ embeds: [Embed], ephemeral: true });
        }

        const Result = await Database.AddCaptchaLogs(interaction.guild?.id as string, Channel?.id as string);
        if (!Result) {
            const Embed = new EmbedBuilder()
                .setTitle("There was an error with configuring")
                .setColor("#e75757")
                .setDescription("We couldn't configure the verification log channel, try again later?");

            return interaction.reply({ embeds: [Embed], ephemeral: true });
        }

        const Embed = new EmbedBuilder()
            .setTitle("Successfully Configured")
            .setColor("#579de7")
            .setDescription("This server's verification log channel has successfully been configured");

        interaction.reply({ ephemeral: true, embeds: [Embed] });
    },
    AdminRequired: true,
    Data: new SlashCommandBuilder()
        .setName("setverificationlogs")
        .setDescription("Set the channel where verification logs will be sent to.")
        .addChannelOption(option => option.setName("channel").setRequired(true).setDescription("The channel where verification logs will be sent to."))
}