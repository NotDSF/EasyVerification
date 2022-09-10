import { CommandInteraction } from "discord.js";

interface DatabaseType {
    AddServerInfo: (ServerID: string, VerifiedRole: string) => any,
    GetServer: (ServerID: string) => any
}

interface Command {
    name: string,
    execute: (interaction: CommandInteraction, users: any, Database: DatabaseType) => void
}

export { Command, CommandInteraction, DatabaseType }