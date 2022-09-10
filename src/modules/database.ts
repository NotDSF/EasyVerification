import { PrismaClient } from "@prisma/client";

export class database {
    prisma;
    constructor(prisma: PrismaClient) {
        this.prisma = prisma;
    }

    async AddServerInfo(ServerID: string, VerifiedRole: string) {
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
                    VerifiedRole: VerifiedRole
                }
            });
            resolve(Server);
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