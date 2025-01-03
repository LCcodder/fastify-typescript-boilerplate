import { FastifySchema as OGFastifySchema} from "fastify";

export type FastifySchema = {
    description?: string
    tags?: string[]
    security?: any[]
} & OGFastifySchema