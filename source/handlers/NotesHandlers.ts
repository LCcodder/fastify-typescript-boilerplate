import { FastifyInstance, FastifyReply, FastifyRequest, HookHandlerDoneFunction } from "fastify";
import { INotesService } from "../services/notes/INotesService";
import { Note, NoteWithoutMetadata } from "../actors/Note";
import { NOTE_EXCEPTIONS } from "../services/notes/NoteExceptions";
import { extractJwtPayload } from "../auth/jwt/PayloadExtractor";
import { extractToken } from "../utils/TokenExtractor";
import { CreateNoteSchema } from "./validation/NoteSchemas";

export const handleNoteRoutes = (
    server: FastifyInstance,
    notesService: INotesService, 
    authentificate: (
        request: FastifyRequest, 
        reply: FastifyReply, 
        done: HookHandlerDoneFunction
    ) => void
) => {
    server.post<{
        Body: Omit<NoteWithoutMetadata, "author">,
        Reply: {
            201: Note,
            503: typeof NOTE_EXCEPTIONS.ServiceUnavailable   
        }
    }>("/notes/create", {
        schema: CreateNoteSchema,
        preHandler: authentificate
    }, async (request, reply) => {
        try {
            const payload = extractJwtPayload(
                extractToken(request)
            )
            
            const insertData = {
                ...request.body,
                author: payload.login
            }

            const createdNote = await notesService.createNote(insertData) as Note
            reply.code(201).send(createdNote)
        } catch (exception: any) {
            reply.code(
                exception.statusCode
            ).send(exception)
        }
    })
}