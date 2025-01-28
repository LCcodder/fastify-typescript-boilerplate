import { FastifyInstance } from "fastify";
import { INotesService, NotesSearchOptions } from "../../../services/notes/NotesServiceInterface";
import { NoteUpdate, NoteWithoutMetadata } from "../../../shared/dto/NoteDto";
import { extractJwtPayload } from "../../../shared/utils/jwt/PayloadExtractor";
import { extractToken } from "../../../shared/utils/common/TokenExtractor";
import { AddCollaboratorSchema, CreateNoteSchema, DeleteNoteSchema, GetNoteCollaboratorsSchema, GetNoteSchema, GetNotesSchema, RemoveCollaboratorSchema, UpdateNoteSchema } from "../../validation/schemas/NoteSchemas";
import { isException } from "../../../shared/utils/guards/ExceptionGuard";
import { Handler } from "../Handler";
import { AuthorizationPreHandler } from "../../prehandlers/AuthPreHandler";

export class NotesHandler implements Handler {
    constructor(
        private server: FastifyInstance, 
        private authorizationPreHandler: AuthorizationPreHandler,
        private notesService: INotesService
    ) {}

    public handleRoutes(): void {
        this.server.post<{
            Body: Omit<NoteWithoutMetadata, "author">,
        }>("/notes", {
            schema: CreateNoteSchema,
            preHandler: this.authorizationPreHandler
        }, async (request, reply) => {
            const { login } = extractJwtPayload(
                extractToken(request)
            )
            
            const insertData = {
                ...request.body,
                author: login
            }
            const createdNote = await this.notesService.createNote(insertData)
            if (isException(createdNote)) {
                reply.code(createdNote.statusCode).send(createdNote)
                return
            }
    
            reply.code(201).send(createdNote)
            
        })
    
        this.server.get<{
            Querystring: NotesSearchOptions,
        }>("/notes/my", 
            {
                schema: GetNotesSchema, 
                preHandler: this.authorizationPreHandler
            }, 
        async (request, reply) => {
            const { login } = extractJwtPayload(
                extractToken(request)
            )
    
            const {limit, offset, date_sort, tags} = request.query
    
            const notes = await this.notesService.getMyNotes(login, {tags, limit, offset, date_sort})
            if (isException(notes)) {
                reply.code(notes.statusCode).send(notes)
                return
            }
    
            reply.code(200).send(notes)
            
        })
    
        this.server.get<{
            Querystring: NotesSearchOptions,
        }>("/notes/collaborated", {
            schema: GetNotesSchema,
            preHandler: this.authorizationPreHandler
        }, async (request, reply) => {
            const { login } = extractJwtPayload(
                extractToken(request)
            )
    
            const {limit, offset, date_sort, tags} = request.query
    
            const notes = await this.notesService.getCollaboratedNotes(login, {tags, limit, offset, date_sort}) 
            if (isException(notes)) {
                reply.code(notes.statusCode).send(notes)
                return
            }            
            reply.code(200).send(notes)
        })
    
        this.server.get<{
            Params: { id: string },
        }>("/notes/:id", 
            {
                schema: GetNoteSchema,
                preHandler: this.authorizationPreHandler 
            },
        async (request, reply) => {
            const { login } = extractJwtPayload(
                extractToken(request)
            )
    
            const id = request.params.id
    
            const foundNote = await this.notesService.getNote(id, login)
            if (isException(foundNote)) {
                reply.code(foundNote.statusCode).send(foundNote)
                return
            }
            reply.code(200).send(foundNote)
            
        })
    
        this.server.delete<{
            Params: { id: string },
        }>("/notes/:id", 
            {
                schema: DeleteNoteSchema,
                preHandler: this.authorizationPreHandler
            },
        async (request, reply) => {
            const { login } = extractJwtPayload(
                extractToken(request)
            )
    
            const id = request.params.id
    
            const state = await this.notesService.deleteNote(id, login)
            if (isException(state)) {
                reply.code(state.statusCode).send(state)
                return
            }
            reply.code(200).send(state)
            
        })
    
        this.server.patch<{
            Params: { id: string },
            Body: NoteUpdate
        }>("/notes/:id", {
            schema: UpdateNoteSchema,
            preHandler: this.authorizationPreHandler
        }, async (request, reply) => {
            const { login } = extractJwtPayload(
                extractToken(request)
            )
    
            const id = request.params.id
            const updateData = request.body
    
            const updatedNote = await this.notesService.updateNote(id, login, updateData)
            if (isException(updatedNote)) {
                reply.code(updatedNote.statusCode).send(updatedNote)
                return
            }
    
            reply.code(200).send(updatedNote)
            
        })
    
        this.server.get<{
            Params: { id: string },
        }>("/notes/:id/collaborators", {
            schema: GetNoteCollaboratorsSchema,
            preHandler: this.authorizationPreHandler
        }, async (request, reply) => {
            const { login } = extractJwtPayload(
                extractToken(request)
            )
    
            const id = request.params.id
    
            const collaborators = await this.notesService.getCollaborators(id, login)
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
        }>("/notes/:id/collaborators", {
            schema: AddCollaboratorSchema,
            preHandler: this.authorizationPreHandler
        }, async (request, reply) => {
            const { login } = extractJwtPayload(
                extractToken(request)
            )
    
            const id = request.params.id
            const collaboratorLogin = request.body.collaboratorLogin
    
            const state = await this.notesService.addCollaborator(
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
        }>("/notes/:id/collaborators", {
            schema: RemoveCollaboratorSchema,
            preHandler: this.authorizationPreHandler
        }, async (request, reply) => {
            const { login } = extractJwtPayload(
                extractToken(request)
            )
    
            const id = request.params.id
            const collaboratorLogin = request.body.collaboratorLogin
    
            const state = await this.notesService.removeCollaborator(
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
