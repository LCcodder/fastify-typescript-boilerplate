import { excludeProperties, pickProperties } from "typing-assets"
import { BaseNoteSchema, OperateNoteSchema } from "./base/Note"
import { NOTE_RESPONSES } from "../../../openapi/responses/NoteResponses"
import { FastifySchema } from "../../../shared/utils/typing/FastifySchemaOverride"

export const CreateNoteSchema: FastifySchema = {
    body: {
        type: 'object',
        properties: excludeProperties(
            {...BaseNoteSchema.properties},
            "author",
            "createdAt",
            "updatedAt",
            "id"
        ),
        required: ['collaborators', 'title', 'content', 'tags']
    },

    // openapi snippets
    description: "Creates and returns created note (also adds provided collaborators to the note)",
    tags: ["notes"],
    response: NOTE_RESPONSES.CreateNote,
    security: [{
        bearerAuth: []
    }]
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

    // openapi snippets
    description: "Returns notes array by provided params",
    tags: ["notes"],
    response: NOTE_RESPONSES.GetNotes,
    security: [{
        bearerAuth: []
    }]
}



export const GetNoteSchema: FastifySchema = {
    
    ...OperateNoteSchema,

    // openapi snippets
    description: "Returns note by id",
    tags: ["notes"],
    response: NOTE_RESPONSES.GetNote,
    security: [{
        bearerAuth: []
    }]
}

export const DeleteNoteSchema: FastifySchema = {
   
    ...OperateNoteSchema,

    // openapi snippets
    description: "Deletes note by id",
    tags: ["notes"],
    response: NOTE_RESPONSES.DeleteNote,
    security: [{
        bearerAuth: []
    }]
}

export const GetNoteCollaboratorsSchema: FastifySchema = {
    
    ...OperateNoteSchema,

    // openapi snippets
    description: "Returns note collaborators array",
    tags: ["notes"],
    response: NOTE_RESPONSES.GetCollaborators,
    security: [{
        bearerAuth: []
    }]
}

export const UpdateNoteSchema: FastifySchema = {
    
    ...OperateNoteSchema,
    body: {
        type: 'object',
        properties: pickProperties({...BaseNoteSchema.properties}, "title", "tags", "content"),
        required: []
    },

    // openapi snippets
    description: "Updates note and returns updated value (can also be updated by collaborator)",
    tags: ["notes"],
    response: NOTE_RESPONSES.UpdateNote,
    security: [{
        bearerAuth: []
    }]
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

    // openapi snippets
    description: "Adds collaborator to the note",
    tags: ["notes"],
    response: NOTE_RESPONSES.AddCollaborator,
    security: [{
        bearerAuth: []
    }]
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

    // openapi snippets
    description: "Removes collaborator from note",
    tags: ["notes"],
    response: NOTE_RESPONSES.RemoveCollaborator,
    security: [{
        bearerAuth: []
    }]
}