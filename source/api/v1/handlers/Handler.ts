import { FastifyInstance, FastifyReply, FastifyRequest, HookHandlerDoneFunction } from "fastify";
import { AuthentificationPreHandler } from "../auth/AuthPreHandler";

export abstract class Handler<TService> {
    constructor(
        protected server: FastifyInstance,
        protected authentificationPreHandler: AuthentificationPreHandler,
        protected service: TService
    ) {}

    public abstract handleRoutes(): void
}