import { FastifyInstance, FastifyReply, FastifyRequest, HookHandlerDoneFunction } from "fastify";
import { INotesService } from "../services/notes/NotesServiceInterface";
import { Note, NoteCollaborators, NotePreview, NoteUpdate, NoteWithoutMetadata } from "../database/entities/Note";
import { NOTE_EXCEPTIONS } from "../exceptions/NoteExceptions";
import { extractJwtPayload } from "../auth/jwt/PayloadExtractor";
import { extractToken } from "../utils/TokenExtractor";
import {AddCollaboratorSchema, CreateNoteSchema, DeleteNoteSchema, GetNoteCollaboratorsSchema, GetNoteSchema, GetNotesSchema, RemoveCollaboratorSchema, UpdateNoteSchema } from "../validation/schemas/NoteSchemas";
import { isException } from "../utils/guards/ExceptionGuard";
import { USER_EXCEPTIONS } from "../exceptions/UserExceptions";


export const handleNoteRoutes = (
    server: FastifyInstance,
    notesService: INotesService, 
    authenticate: (
        request: FastifyRequest, 
        reply: FastifyReply, 
        done: HookHandlerDoneFunction
    ) => void
) => {
    server.post<{
        Body: Omit<NoteWithoutMetadata, "author">,
        Reply: {
            201: Note,
            503: typeof NOTE_EXCEPTIONS.ServiceUnavailable | typeof USER_EXCEPTIONS.ServiceUnavailable
            404: typeof NOTE_EXCEPTIONS.CollaboratorNotFound
        }
    }>("/notes", {
        schema: CreateNoteSchema,
        preHandler: authenticate
    }, async (request, reply) => {
            const payload = extractJwtPayload(
                extractToken(request)
            )
            
            const insertData = {
                ...request.body,
                author: payload.login
            }
            const createdNote = await notesService.createNote(insertData)
            if (isException(createdNote)) {
                reply.code(createdNote.statusCode).send(createdNote)
                return
            }

            reply.code(201).send(createdNote)
        
    })

    server.get<{
        Querystring: {
            limit: number,
            offset: number,
            sort: "ASC" | "DESC",
            tags: string[]
        },
        Reply: {
            200: NotePreview[],
            503: typeof NOTE_EXCEPTIONS.ServiceUnavailable  
        }
    }>("/notes/my", 
        {
            schema: GetNotesSchema, 
            preHandler: authenticate
        }, 
    async (request, reply) => {
            const payload = extractJwtPayload(
                extractToken(request)
            )

            const limit = request.query.limit
            const skip = request.query.offset
            const sort = request.query.sort
            const tags = request.query.tags

            const notes = await notesService.getMyNotes(payload.login, tags, limit, skip, sort)
            if (isException(notes)) {
                reply.code(notes.statusCode).send(notes)
                return
            }

            reply.code(200).send(notes)
        
    })

    server.get<{
        Querystring: {
            limit: number,
            offset: number,
            sort: "ASC" | "DESC",
            tags: string[]
        },
        Reply: {
            200: NotePreview[],
            503: typeof NOTE_EXCEPTIONS.ServiceUnavailable   
        }
    }>("/notes/collaborated", {
        schema: GetNotesSchema,
        preHandler: authenticate
    }, async (request, reply) => {
            const payload = extractJwtPayload(
                extractToken(request)
            )

            const limit = request.query.limit
            const skip = request.query.offset
            const sort = request.query.sort
            const tags = request.query.tags

            const notes = await notesService.getCollaboratedNotes(payload.login, tags, limit, skip, sort) 
            if (isException(notes)) {
                reply.code(notes.statusCode).send(notes)
                return
            }            
            reply.code(200).send(notes)
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
            schema: GetNoteSchema,
            preHandler: authenticate 
        },
    async (request, reply) => {
            const payload = extractJwtPayload(
                extractToken(request)
            )

            const id = request.params.id

            const foundNote = await notesService.getNote(id, payload.login)
            if (isException(foundNote)) {
                reply.code(foundNote.statusCode).send(foundNote)
                return
            }
            reply.code(200).send(foundNote)
        
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
            schema: DeleteNoteSchema,
            preHandler: authenticate
        },
    async (request, reply) => {
            const payload = extractJwtPayload(
                extractToken(request)
            )

            const id = request.params.id

            const state = await notesService.deleteNote(id, payload.login)
            if (isException(state)) {
                reply.code(state.statusCode).send(state)
                return
            }
            reply.code(200).send(state)
        
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
        preHandler: authenticate
    }, async (request, reply) => {
            const payload = extractJwtPayload(
                extractToken(request)
            )

            const id = request.params.id
            const updateData = request.body

            const updatedNote = await notesService.updateNote(id, payload.login, updateData)
            if (isException(updatedNote)) {
                reply.code(updatedNote.statusCode).send(updatedNote)
                return
            }

            reply.code(200).send(updatedNote)
        
    })

    server.get<{
        Params: { id: string },
        Reply: {
            200: NoteCollaborators
            404: typeof NOTE_EXCEPTIONS.NoteNotFound
            503: typeof NOTE_EXCEPTIONS.ServiceUnavailable
        }
    }>("/notes/:id/collaborators", {
        schema: GetNoteCollaboratorsSchema,
        preHandler: authenticate
    }, async (request, reply) => {
            const payload = extractJwtPayload(
                extractToken(request)
            )
            const id = request.params.id
            const collaborators = await notesService.getCollaborators(id, payload.login)
            if (isException(collaborators)) {
                reply.code(collaborators.statusCode).send(collaborators)
                return
            }            
            reply.code(200).send(collaborators)
        
    })

    server.put<{
        Params: { id: string },
        Body: {
            collaboratorLogin: string
        },
        Reply: {
            201: {success: true}
            503: typeof NOTE_EXCEPTIONS.ServiceUnavailable,
            404: typeof NOTE_EXCEPTIONS.CollaboratorNotFound | typeof NOTE_EXCEPTIONS.NoteNotFound
            400: typeof NOTE_EXCEPTIONS.CollaboratorAlreadyInNote
            403: typeof NOTE_EXCEPTIONS.AcessRestricted
        }
    }>("/notes/:id/collaborators", {
        schema: AddCollaboratorSchema,
        preHandler: authenticate
    }, async (request, reply) => {
            const payload = extractJwtPayload(
                extractToken(request)
            )

            const id = request.params.id
            const collaboratorLogin = request.body.collaboratorLogin

            const state = await notesService.addCollaborator(
                id,
                payload.login,
                collaboratorLogin
            )
            if (isException(state)) {
                reply.code(state.statusCode).send(state)
                return
            }

            reply.code(201).send(state)
    })

    server.delete<{
        Params: { id: string },
        Body: {
            collaboratorLogin: string
        },
        Reply: {
            200: {success: true}
            503: typeof NOTE_EXCEPTIONS.ServiceUnavailable
            404: typeof NOTE_EXCEPTIONS.CollaboratorNotFound | typeof NOTE_EXCEPTIONS.NoteNotFound
            403: typeof NOTE_EXCEPTIONS.AcessRestricted
        }
    }>("/notes/:id/collaborators", {
        schema: RemoveCollaboratorSchema,
        preHandler: authenticate
    }, async (request, reply) => {
            const payload = extractJwtPayload(
                extractToken(request)
            )

            const id = request.params.id
            const collaboratorLogin = request.body.collaboratorLogin

            const state = await notesService.removeCollaborator(
                id,
                payload.login,
                collaboratorLogin
            )
            if (isException(state)) {
                reply.code(state.statusCode).send(state)
                return
            }

            reply.code(200).send(state)
        
    })
}