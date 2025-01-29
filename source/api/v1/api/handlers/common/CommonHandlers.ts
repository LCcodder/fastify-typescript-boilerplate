import { FastifyInstance } from "fastify";
import Healthcheck, { SystemReport } from "../../../shared/utils/common/Healthcheck";
import { IHandlers } from "../Handler";
import { isException } from "../../../shared/utils/guards/ExceptionGuard";

export class CommonHandlers implements IHandlers {
    constructor(
        private server: FastifyInstance, 
        private healthcheck: Healthcheck
    ) {}

    public handleRoutes(): void {

        this.server.get("/ping", async (_, reply) => {
            reply.code(200).send("pong")
        })

        this.server.head("/", async (_, reply) => {
            reply.code(200).send()
        })

        this.server.get("/healthcheck", async (_, reply) => {

            const result = await this.healthcheck.getFullSystemReport()
            if (isException(result)) {
                reply.code(result.statusCode).send(result)
                return
            }
    
            reply.code(200).send(result)
        })
    }
}