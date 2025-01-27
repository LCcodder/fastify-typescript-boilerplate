import { FastifyInstance, FastifyReply, FastifyRequest, HookHandlerDoneFunction } from "fastify";
import { AuthorizationPreHandler } from "../prehandlers/AuthPreHandler";

export abstract class Handler<TService> {
    constructor(
        protected server: FastifyInstance,
        protected authentificationPreHandler: AuthorizationPreHandler,
        protected service: TService
    ) {}

    public abstract handleRoutes(): void
}