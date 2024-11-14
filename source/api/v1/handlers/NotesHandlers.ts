import { FastifyInstance } from "fastify";
import { INotesService } from "../services/interfaces/NotesServiceInterface";
import { Note, NoteCollaborators, NotePreview, NoteUpdate, NoteWithoutMetadata } from "../database/entities/Note";
import { NOTE_EXCEPTIONS } from "../shared/exceptions/NoteExceptions";
import { extractJwtPayload } from "../auth/jwt/PayloadExtractor";
import { extractToken } from "../shared/utils/common/TokenExtractor";
import { AddCollaboratorSchema, CreateNoteSchema, DeleteNoteSchema, GetNoteCollaboratorsSchema, GetNoteSchema, GetNotesSchema, RemoveCollaboratorSchema, UpdateNoteSchema } from "../validation/schemas/NoteSchemas";
import { isException } from "../shared/utils/guards/ExceptionGuard";
import { USER_EXCEPTIONS } from "../shared/exceptions/UserExceptions";
import { Handler } from "./Handler";
import { AuthentificationPreHandler } from "../auth/AuthPreHandler";

export class NotesHandler extends Handler<INotesService> {
    constructor(
        server: FastifyInstance, 
        authentificationPreHandler: AuthentificationPreHandler,
        notesService: INotesService
    ) {
        super(server, authentificationPreHandler, notesService)
    }

    public override handleRoutes(): void {
        this.server.post<{
            Body: Omit<NoteWithoutMetadata, "author">,
            Reply: {
                201: Note,
                503: typeof NOTE_EXCEPTIONS.ServiceUnavailable | typeof USER_EXCEPTIONS.ServiceUnavailable
                404: typeof NOTE_EXCEPTIONS.CollaboratorNotFound
            }
        }>("/notes", {
            schema: CreateNoteSchema,
            preHandler: this.authentificationPreHandler
        }, async (request, reply) => {
            const { login } = extractJwtPayload(
                extractToken(request)
            )
            
            const insertData = {
                ...request.body,
                author: login
            }
            const createdNote = await this.service.createNote(insertData)
            if (isException(createdNote)) {
                reply.code(createdNote.statusCode).send(createdNote)
                return
            }
    
            reply.code(201).send(createdNote)
            
        })
    
        this.server.get<{
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
                preHandler: this.authentificationPreHandler
            }, 
        async (request, reply) => {
            const { login } = extractJwtPayload(
                extractToken(request)
            )
    
            const limit = request.query.limit
            const skip = request.query.offset
            const sort = request.query.sort
            const tags = request.query.tags
    
            const notes = await this.service.getMyNotes(login, {tags, limit, skip, sort})
            if (isException(notes)) {
                reply.code(notes.statusCode).send(notes)
                return
            }
    
            reply.code(200).send(notes)
            
        })
    
        this.server.get<{
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
            preHandler: this.authentificationPreHandler
        }, async (request, reply) => {
            const { login } = extractJwtPayload(
                extractToken(request)
            )
    
            const limit = request.query.limit
            const skip = request.query.offset
            const sort = request.query.sort
            const tags = request.query.tags
    
            const notes = await this.service.getCollaboratedNotes(login, {tags, limit, skip, sort}) 
            if (isException(notes)) {
                reply.code(notes.statusCode).send(notes)
                return
            }            
            reply.code(200).send(notes)
        })
    
        this.server.get<{
            Params: { id: string },
            Reply: {
                200: Note,
                404: typeof NOTE_EXCEPTIONS.NoteNotFound,
                503: typeof NOTE_EXCEPTIONS.ServiceUnavailable
            }
        }>("/notes/:id", 
            {
                schema: GetNoteSchema,
                preHandler: this.authentificationPreHandler 
            },
        async (request, reply) => {
            const { login } = extractJwtPayload(
                extractToken(request)
            )
    
            const id = request.params.id
    
            const foundNote = await this.service.getNote(id, login)
            if (isException(foundNote)) {
                reply.code(foundNote.statusCode).send(foundNote)
                return
            }
            reply.code(200).send(foundNote)
            
        })
    
        this.server.delete<{
            Params: { id: string },
            Reply: {
                200: { success: true },
                404: typeof NOTE_EXCEPTIONS.NoteNotFound,
                503: typeof NOTE_EXCEPTIONS.ServiceUnavailable
            }
        }>("/notes/:id", 
            {
                schema: DeleteNoteSchema,
                preHandler: this.authentificationPreHandler
            },
        async (request, reply) => {
            const { login } = extractJwtPayload(
                extractToken(request)
            )
    
            const id = request.params.id
    
            const state = await this.service.deleteNote(id, login)
            if (isException(state)) {
                reply.code(state.statusCode).send(state)
                return
            }
            reply.code(200).send(state)
            
        })
    
        this.server.patch<{
            Params: { id: string },
            Reply: {
                200: Note,
                404: typeof NOTE_EXCEPTIONS.NoteNotFound,
                503: typeof NOTE_EXCEPTIONS.ServiceUnavailable
            },
            Body: NoteUpdate
        }>("/notes/:id", {
            schema: UpdateNoteSchema,
            preHandler: this.authentificationPreHandler
        }, async (request, reply) => {
            const { login } = extractJwtPayload(
                extractToken(request)
            )
    
            const id = request.params.id
            const updateData = request.body
    
            const updatedNote = await this.service.updateNote(id, login, updateData)
            if (isException(updatedNote)) {
                reply.code(updatedNote.statusCode).send(updatedNote)
                return
            }
    
            reply.code(200).send(updatedNote)
            
        })
    
        this.server.get<{
            Params: { id: string },
            Reply: {
                200: NoteCollaborators
                404: typeof NOTE_EXCEPTIONS.NoteNotFound
                503: typeof NOTE_EXCEPTIONS.ServiceUnavailable
            }
        }>("/notes/:id/collaborators", {
            schema: GetNoteCollaboratorsSchema,
            preHandler: this.authentificationPreHandler
        }, async (request, reply) => {
            const { login } = extractJwtPayload(
                extractToken(request)
            )
    
            const id = request.params.id
    
            const collaborators = await this.service.getCollaborators(id, login)
            if (isException(collaborators)) {
                reply.code(collaborators.statusCode).send(collaborators)
                return
            }            
            reply.code(200).send(collaborators)
            
        })
    
        this.server.put<{
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
            preHandler: this.authentificationPreHandler
        }, async (request, reply) => {
            const { login } = extractJwtPayload(
                extractToken(request)
            )
    
            const id = request.params.id
            const collaboratorLogin = request.body.collaboratorLogin
    
            const state = await this.service.addCollaborator(
                id,
                login,
                collaboratorLogin
            )
            if (isException(state)) {
                reply.code(state.statusCode).send(state)
                return
            }
    
            reply.code(201).send(state)
        })
    
        this.server.delete<{
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
            preHandler: this.authentificationPreHandler
        }, async (request, reply) => {
            const { login } = extractJwtPayload(
                extractToken(request)
            )
    
            const id = request.params.id
            const collaboratorLogin = request.body.collaboratorLogin
    
            const state = await this.service.removeCollaborator(
                id,
                login,
                collaboratorLogin
            )
            if (isException(state)) {
                reply.code(state.statusCode).send(state)
                return
            }
    
            reply.code(200).send(state)
            
        })
    }
}
