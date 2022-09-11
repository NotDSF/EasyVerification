import { SlashCommandBuilder } from "@discordjs/builders";
import { CommandInteraction } from "discord.js";
import { DatabaseType } from "../../modules/types";

module.exports = {
    execute: async (interaction: CommandInteraction, Users: any, Database: DatabaseType) => {
        if (!await Database.GetServer(interaction.guild?.id as string)) {
            return await interaction.reply({ ephemeral: true, content: "You haven't configured your server" });
        }

        await Database.DeleteServer(interaction.guild?.id as string);
        await interaction.reply({ ephemeral: true, content: "Deleted server config." });
    },
    AdminRequired: true,
    Data: new SlashCommandBuilder()
        .setName("deleteconfig")
        .setDescription("Delete your server verification config.")
}