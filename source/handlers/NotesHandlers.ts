import { FastifyInstance, FastifyReply, FastifyRequest, HookHandlerDoneFunction } from "fastify";
import { INotesService } from "../services/notes/NotesServiceInterface";
import { Note, NotePreview, NoteUpdate, NoteWithoutMetadata } from "../actors/Note";
import { NOTE_EXCEPTIONS } from "../exceptions/NoteExceptions";
import { extractJwtPayload } from "../auth/jwt/PayloadExtractor";
import { extractToken } from "../utils/TokenExtractor";
import { AddOrRemoveCollaboratorSchema, CreateNoteSchema, GetNotesSchema, OperateNoteSchema, UpdateNoteSchema } from "../validation/NoteSchemas";


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
    }>("/notes", {
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
            console.log("123")
            const createdNote = await notesService.createNote(insertData) as Note
            reply.code(201).send(createdNote)
        } catch (exception: any) {
            reply.code(
                exception.statusCode
            ).send(exception)
        }
    })

    server.get<{
        Querystring: {
            limit: number,
            offset: number
        },
        Reply: {
            200: NotePreview[],
            503: typeof NOTE_EXCEPTIONS.ServiceUnavailable   
        }
    }>("/notes/my", 
        {
            schema: GetNotesSchema, 
            preHandler: authentificate
        }, 
    async (request, reply) => {
        try {
            const payload = extractJwtPayload(
                extractToken(request)
            )

            const limit = request.query.limit
            const skip = request.query.offset

            const notes = await notesService.getMyNotes(payload.login, limit, skip) as NotePreview[]
            reply.code(200).send(notes)
        } catch (exception: any) {
            reply.code(
                exception.statusCode
            ).send(exception)
        }
    })

    server.get<{
        Querystring: {
            limit: number,
            offset: number
        },
        Reply: {
            200: NotePreview[],
            503: typeof NOTE_EXCEPTIONS.ServiceUnavailable   
        }
    }>("/notes/collaborated", {
        schema: GetNotesSchema,
        preHandler: authentificate
    }, async (request, reply) => {
        try {
            const payload = extractJwtPayload(
                extractToken(request)
            )

            const limit = request.query.limit
            const skip = request.query.offset

            const notes = await notesService.getCollaboratedNotes(payload.login, limit, skip) as NotePreview[]
            reply.code(200).send(notes)
        } catch (exception: any) {
            reply.code(
                exception.statusCode
            ).send(exception)
        }
    })

    server.get<{
        Params: { id: string },
        Reply: {
            200: Note,
            404: typeof NOTE_EXCEPTIONS.NoteNotFound,
            503: typeof NOTE_EXCEPTIONS.ServiceUnavailable
        }
    }>("/notes/:id", 
        {
            schema: OperateNoteSchema,
            preHandler: authentificate 
        },
    async (request, reply) => {
        try {
            const payload = extractJwtPayload(
                extractToken(request)
            )

            const id = request.params.id

            const foundNote = await notesService.getNote(id, payload.login) as Note
            reply.code(200).send(foundNote)
        } catch (exception: any) {
            reply.code(
                exception.statusCode
            ).send(exception)
        }
    })

    server.delete<{
        Params: { id: string },
        Reply: {
            200: { success: true },
            404: typeof NOTE_EXCEPTIONS.NoteNotFound,
            503: typeof NOTE_EXCEPTIONS.ServiceUnavailable
        }
    }>("/notes/:id", 
        {
            schema: OperateNoteSchema,
            preHandler: authentificate
        },
    async (request, reply) => {
        try {
            const payload = extractJwtPayload(
                extractToken(request)
            )

            const id = request.params.id

            const state = await notesService.deleteNote(id, payload.login) as {success: true}
            reply.code(200).send(state)
        } catch (exception: any) {
            reply.code(
                exception.statusCode
            ).send(exception)
        }
    })

    server.patch<{
        Params: { id: string },
        Reply: {
            200: Note,
            404: typeof NOTE_EXCEPTIONS.NoteNotFound,
            503: typeof NOTE_EXCEPTIONS.ServiceUnavailable
        },
        Body: NoteUpdate
    }>("/notes/:id", {
        schema: UpdateNoteSchema,
        preHandler: authentificate
    }, async (request, reply) => {
        try {
            const payload = extractJwtPayload(
                extractToken(request)
            )

            const id = request.params.id
            const updateData = request.body

            const updatedNote = await notesService.updateNote(id, payload.login, updateData) as Note
            reply.code(200).send(updatedNote)
        } catch (exception: any) {
            reply.code(
                exception.statusCode
            ).send(exception)
        }
    })

    server.post<{
        Params: { id: string },
        Body: {
            collaboratorLogin: string
        }
    }>("/notes/:id/collaborators", {
        schema: AddOrRemoveCollaboratorSchema,
        preHandler: authentificate
    }, async (request, reply) => {
        try {
            const payload = extractJwtPayload(
                extractToken(request)
            )

            const id = request.params.id
            const collaboratorLogin = request.body.collaboratorLogin

            const state = await notesService.addCollaborator(
                id,
                payload.login,
                collaboratorLogin
            ) as { success: true }

            reply.code(200).send(state)
        } catch (exception: any) {
            reply.code(
                exception.statusCode
            ).send(exception)           
        }
    })

    server.delete<{
        Params: { id: string },
        Body: {
            collaboratorLogin: string
        }
    }>("/notes/:id/collaborators", {
        schema: AddOrRemoveCollaboratorSchema,
        preHandler: authentificate
    }, async (request, reply) => {
        try {
            const payload = extractJwtPayload(
                extractToken(request)
            )

            const id = request.params.id
            const collaboratorLogin = request.body.collaboratorLogin

            const state = await notesService.removeCollaborator(
                id,
                payload.login,
                collaboratorLogin
            ) as { success: true }

            reply.code(200).send(state)
        } catch (exception: any) {
            reply.code(
                exception.statusCode
            ).send(exception)           
        }
    })
}