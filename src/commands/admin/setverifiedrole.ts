import { SlashCommandBuilder } from "@discordjs/builders";
import { CommandInteraction, EmbedBuilder } from "discord.js";
import { DatabaseType } from "../../modules/types";

module.exports = {
    execute: async (interaction: CommandInteraction, Users: any, Database: DatabaseType) => {
        const Role = interaction.options.get("role", true);
        const Result = await Database.AddServerInfo(interaction.guild?.id as string, Role.role?.id as string, interaction.guild?.name as string);
        if (!Result) {
            const Embed = new EmbedBuilder()
            .setTitle("There was an error with configuring")
            .setColor("#e75757")
            .setDescription("We couldn't set the verified role, try again later?");

            return interaction.reply({ embeds: [Embed], ephemeral: true });
        }

        const Embed = new EmbedBuilder()
            .setTitle("Successfully Configured")
            .setColor("#579de7")
            .setDescription("This server's verified role has been successfully configured");

        interaction.reply({ ephemeral: true, embeds: [Embed] });
    },
    AdminRequired: true,
    Data: new SlashCommandBuilder()
        .setName("setverifiedrole")
        .setDescription("Set the role that users will recieve once verified.")
        .addRoleOption(option => option.setName("role").setRequired(true).setDescription("The role users will recieve once verified"))
}