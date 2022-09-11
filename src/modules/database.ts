import { PrismaClient } from "@prisma/client";

export class database {
    prisma;
    constructor(prisma: PrismaClient) {
        this.prisma = prisma;
    }

    async AddServerInfo(ServerID: string, VerifiedRole: string, ServerName: string) {
        return new Promise(async (resolve) => {
            if (await this.GetServer(ServerID)) {
                return resolve(await this.prisma.servers.update({
                    where: {
                        ServerID: ServerID
                    },
                    data: {
                        VerifiedRole: VerifiedRole
                    }
                }))
            }
            
            const Server = await this.prisma.servers.create({
                data: {
                    ServerID: ServerID,
                    VerifiedRole: VerifiedRole,
                    ServerName: ServerName
                }
            });
            resolve(Server);
        });
    }

    async AddCaptchaLogs(ServerID: string, CaptchaLogs: string) {
        return new Promise(async (resolve) => {
            const Server = await this.prisma.servers.update({
                where: {
                    ServerID: ServerID
                },
                data: {
                    CaptchaLogs: CaptchaLogs
                }
            });
            resolve(Server);
        });
    }

    async DeleteServer(ServerID: string) {
        return new Promise(async (resolve) => {
            await this.prisma.servers.delete({
                where: {
                    ServerID: ServerID
                }
            });
            resolve(1);
        });
    }

    async GetServer(ServerID: string) {
        return new Promise(async (resolve) => {
            const Server = await this.prisma.servers.findFirst({
                where: {
                    ServerID: ServerID
                }
            })
            resolve(Server);
        });
    }
}