import { FastifyInstance } from "fastify";
import Healthcheck, { SystemReport } from "../shared/utils/common/Healthcheck";
import { Handler } from "./Handler";
import { isException } from "../shared/utils/guards/ExceptionGuard";

export class CommonHandler extends Handler<Healthcheck> {
    constructor(server: FastifyInstance, healthcheck: Healthcheck) {
        super(server, undefined, healthcheck)
    }

    public override handleRoutes(): void {

        this.server.get("/ping", async (_, reply) => {
            reply.code(200).send("pong")
        })

        this.server.head("/", async (_, reply) => {
            reply.code(200).send()
        })

        this.server.get<{
            Reply: {
                200: SystemReport
            }
        }>("/healthcheck", async (_, reply) => {

            const result = await this.service.getFullSystemReport()
            if (isException(result)) {
                // @ts-ignore
                reply.code(result.statusCode).send(result)
                return
            }
    
            reply.code(200).send(result)
        })
    }
}