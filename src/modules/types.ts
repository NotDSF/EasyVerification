import { CommandInteraction } from "discord.js";

interface DatabaseType {
    AddServerInfo: (ServerID: string, VerifiedRole: string, ServerName: string) => any,
    GetServer: (ServerID: string) => any,
    AddCaptchaLogs: (ServerID: string, CaptchaLogsID: string) => any,
    DeleteServer: (ServerID: string) => any
}

interface Command {
    name: string,
    AdminRequired?: boolean,
    execute: (interaction: CommandInteraction, users: Map<any, any>, Database: DatabaseType) => void
}

export { Command, CommandInteraction, DatabaseType }