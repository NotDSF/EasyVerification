import { SlashCommandBuilder } from "@discordjs/builders";
import { CommandInteraction, PermissionsBitField, EmbedBuilder } from "discord.js";
import { DatabaseType } from "../modules/types";

module.exports = {
    execute: async (interaction: CommandInteraction, Users: any, Database: DatabaseType) => {
        // @ts-ignore
        if (!interaction.member?.permissions.has(PermissionsBitField.Flags.Administrator)) return interaction.reply("You don't have access to this command");
        const Role = interaction.options.get("role", true);

        // @ts-ignore
        const Result = await Database.AddServerInfo(interaction.guild?.id, Role.role?.id);
        if (!Result) {
            const Embed = new EmbedBuilder()
            .setTitle("Oops.. We ran into an issue")
            .setColor("#e75757")
            .setDescription("We couldn't set the verified role, try again later?");

            return interaction.reply({ embeds: [Embed], ephemeral: true });
        }

        const Embed = new EmbedBuilder()
            .setTitle("Server Configured")
            .setColor("#579de7")
            .setDescription("This server has been successfully configured");

        interaction.reply({ ephemeral: true, embeds: [Embed] });
    },
    Data: new SlashCommandBuilder()
        .setName("setverifiedrole")
        .setDescription("Set the role that users will recieve once verified.")
        .addRoleOption(option => option.setName("role").setRequired(true).setDescription("The role users will recieve once verified"))
}