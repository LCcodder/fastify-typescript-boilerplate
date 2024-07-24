import { excludeProperties } from "typing-assets";
import { NOTE_EXCEPTIONS } from "../../../exceptions/NoteExceptions";
import { USER_EXCEPTIONS } from "../../../exceptions/UserExceptions";
import { BaseNoteSchema } from "../../schemas/base/Note";
import { BaseUserSchema } from "../../schemas/base/User";

export const NOTE_RESPONSES = {
    CreateNote: {
        201: BaseNoteSchema,
        404: {
            type: 'object',
            properties: {
                statusCode: { enum: [404] },
                message: { enum: [NOTE_EXCEPTIONS.CollaboratorNotFound.message] }
            }
        },
        400: {
            type: 'object',
            properties: {
                statusCode: {enum: [400]},
                code: {enum: ["FST_ERR_VALIDATION"]},
                error: {enum: ["Bad Request"]},
                message: {enum: ["body must have required property 'PROPERTY NAME'"]}
            }
        },
        503: {
            type: 'object',
            properties: {
                statusCode: { enum: [503] },
                message: { enum: [NOTE_EXCEPTIONS.ServiceUnavailable.message] }
            }
        },
        401: {
            type: 'object',
            properties: {
                statusCode: { enum: [401] },
                message: { enum: [USER_EXCEPTIONS.NotAuthorized.message] }
            }
        }
    },
    GetNotes: {
        200: {
            type: 'array',
            items: {
                type: 'object',
                properties: excludeProperties({...BaseNoteSchema.properties}, "createdAt", "content", "collaborators")
            } 
        },
        503: {
            type: 'object',
            properties: {
                statusCode: { enum: [503] },
                message: { enum: [NOTE_EXCEPTIONS.ServiceUnavailable.message] }
            }
        },
        401: {
            type: 'object',
            properties: {
                statusCode: { enum: [401] },
                message: { enum: [USER_EXCEPTIONS.NotAuthorized.message] }
            }
        }
    },
    GetNote: {
        200: BaseNoteSchema,
        404: {
            type: 'object',
            properties: {
                statusCode: { enum: [404] },
                message: { enum: [NOTE_EXCEPTIONS.NoteNotFound.message] }
            }
        },
        503: {
            type: 'object',
            properties: {
                statusCode: { enum: [503] },
                message: { enum: [NOTE_EXCEPTIONS.ServiceUnavailable.message] }
            }
        },
        401: {
            type: 'object',
            properties: {
                statusCode: { enum: [401] },
                message: { enum: [USER_EXCEPTIONS.NotAuthorized.message] }
            }
        } 
    },
    DeleteNote: {
        200: {
            type: 'object',
            properties: {
                success: {enum: [true]} 
            }
        },
        404: {
            type: 'object',
            properties: {
                statusCode: { enum: [404] },
                message: { enum: [NOTE_EXCEPTIONS.NoteNotFound.message] }
            }
        },
        503: {
            type: 'object',
            properties: {
                statusCode: { enum: [503] },
                message: { enum: [NOTE_EXCEPTIONS.ServiceUnavailable.message] }
            }
        },
        401: {
            type: 'object',
            properties: {
                statusCode: { enum: [401] },
                message: { enum: [USER_EXCEPTIONS.NotAuthorized.message] }
            }
        } 
    },
    GetCollaborators: {
        200: {
            type: 'array',
            items: {
                type: 'object',
                properties: excludeProperties(
                    {...BaseUserSchema.properties},
                    "password",
                )
            }
        },
        404: {
            type: 'object',
            properties: {
                statusCode: { enum: [404] },
                message: { enum: [NOTE_EXCEPTIONS.NoteNotFound.message] }
            }
        },
        503: {
            type: 'object',
            properties: {
                statusCode: { enum: [503] },
                message: { enum: [NOTE_EXCEPTIONS.ServiceUnavailable.message] }
            }
        },
        401: {
            type: 'object',
            properties: {
                statusCode: { enum: [401] },
                message: { enum: [USER_EXCEPTIONS.NotAuthorized.message] }
            }
        } 
    },
    UpdateNote: {
        200: BaseNoteSchema,
        404: {
            type: 'object',
            properties: {
                statusCode: { enum: [404] },
                message: { enum: [NOTE_EXCEPTIONS.CollaboratorNotFound.message] }
            }
        },
        400: {
            type: 'object',
            properties: {
                statusCode: {enum: [400]},
                code: {enum: ["FST_ERR_VALIDATION"]},
                error: {enum: ["Bad Request"]},
                message: {enum: ["body must have required property 'PROPERTY NAME'"]}
            }
        },
        503: {
            type: 'object',
            properties: {
                statusCode: { enum: [503] },
                message: { enum: [NOTE_EXCEPTIONS.ServiceUnavailable.message] }
            }
        },
        401: {
            type: 'object',
            properties: {
                statusCode: { enum: [401] },
                message: { enum: [USER_EXCEPTIONS.NotAuthorized.message] }
            }
        }  
    },
    AddCollaborator: {
        201: {
            type: 'object',
            properties: {
                success: {enum: [true]} 
            }
        },
        400: {
            type: 'object',
            properties: {
                statusCode: { enum: [400] },
                message: { enum: [NOTE_EXCEPTIONS.CollaboratorAlreadyInNote.message] }
            }
        },
        403: {
            type: 'object',
            properties: {
                statusCode: { enum: [403] },
                message: { enum: [NOTE_EXCEPTIONS.AcessRestricted.message] }
            }
        },
        404: {
            type: 'object',
            properties: {
                statusCode: { enum: [404] },
                message: { enum: [NOTE_EXCEPTIONS.CollaboratorNotFound.message, NOTE_EXCEPTIONS.NoteNotFound.message] }
            }
        },
        503: {
            type: 'object',
            properties: {
                statusCode: { enum: [503] },
                message: { enum: [NOTE_EXCEPTIONS.ServiceUnavailable.message] }
            }
        },
        401: {
            type: 'object',
            properties: {
                statusCode: { enum: [401] },
                message: { enum: [USER_EXCEPTIONS.NotAuthorized.message] }
            }
        }
    },
    RemoveCollaborator: {
        200: {
            type: 'object',
            properties: {
                success: {enum: [true]} 
            }
        },
        403: {
            type: 'object',
            properties: {
                statusCode: { enum: [403] },
                message: { enum: [NOTE_EXCEPTIONS.AcessRestricted.message] }
            }
        },
        
        404: {
            type: 'object',
            properties: {
                statusCode: { enum: [404] },
                message: { enum: [NOTE_EXCEPTIONS.CollaboratorNotFound.message, NOTE_EXCEPTIONS.NoteNotFound.message] }
            }
        },
        503: {
            type: 'object',
            properties: {
                statusCode: { enum: [503] },
                message: { enum: [NOTE_EXCEPTIONS.ServiceUnavailable.message] }
            }
        },
        401: {
            type: 'object',
            properties: {
                statusCode: { enum: [401] },
                message: { enum: [USER_EXCEPTIONS.NotAuthorized.message] }
            }
        }
    }
} as const