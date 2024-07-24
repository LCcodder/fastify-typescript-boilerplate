import { FastifySchema } from "fastify"
import { NOTE_EXCEPTIONS } from "../../exceptions/NoteExceptions"
import { CreateUserSchema } from "./UserSchemas"
import { excludeProperties, pickProperties } from "typing-assets"
import { USER_EXCEPTIONS } from "../../exceptions/UserExceptions"
import { BasicNoteSchema } from "./basic/User"
import { NOTE_RESPONSES } from "../swagger/responses/NoteResponses"

export const CreateNoteSchema: FastifySchema = {
    body: {
        type: 'object',
        properties: excludeProperties(
            {...BasicNoteSchema.properties},
            "author",
            "createdAt",
            "updatedAt",
            "id"
        ),
        required: ['collaborators', 'title', 'content', 'tags']
    },
    // response prop is for swagger API spec generating
    response: NOTE_RESPONSES.CreateNote
}

export const GetNotesSchema: FastifySchema = {
    querystring: {
        type: 'object',
        properties: {
            limit: { type: 'integer', minimum: 0 },
            offset: { type: 'integer', minimum: 0 },
            sort: { type: "string", enum: ["ASC", "DESC"] },
            tags: { type: 'array', items: { type: 'string' }, maxItems: 20 }
        }   
    },
    response: NOTE_RESPONSES.GetNotes
}

export const OperateNoteSchema: FastifySchema = {
    params: {
        type: 'object',
        properties: {
            id: { type: 'string' }
        },
        required: ['id']
    }
}
export const GetNoteSchema: FastifySchema = {
    ...OperateNoteSchema,
    response: NOTE_RESPONSES.GetNote
}

export const DeleteNoteSchema: FastifySchema = {
    ...OperateNoteSchema,
    response: NOTE_RESPONSES.DeleteNote
}

export const GetNoteCollaboratorsSchema: FastifySchema = {

}

export const UpdateNoteSchema: FastifySchema = {
    ...OperateNoteSchema,
    body: {
        type: 'object',
        properties: pickProperties({...BasicNoteSchema.properties}, "title", "tags", "content"),
        required: []
    },
    response: NOTE_RESPONSES.UpdateNote
}

export const AddCollaboratorSchema: FastifySchema = {
    ...OperateNoteSchema,
    body: {
        type: 'object',
        properties: {
            collaboratorLogin: { 
                type: 'string',
                minLength: 4,
                maxLength: 16
            }
        },
        required: ['collaboratorLogin']
    },
    response: NOTE_RESPONSES.AddCollaborator
}

export const RemoveCollaboratorSchema: FastifySchema = {
    ...OperateNoteSchema,
    body: {
        type: 'object',
        properties: {
            collaboratorLogin: { 
                type: 'string',
                minLength: 4,
                maxLength: 16
            }
        },
        required: ['collaboratorLogin']
    },
    response: NOTE_RESPONSES.RemoveCollaborator
}