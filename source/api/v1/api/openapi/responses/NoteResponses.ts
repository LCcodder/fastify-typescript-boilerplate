import { excludeProperties } from "typing-assets";

import { BaseNoteSchema } from "../../validation/schemas/base/Note";
import { BaseUserSchema } from "../../validation/schemas/base/User";
import { NOTE_ACCESS_RESTRICTED, COLLABORATOR_ALREADY_IN_NOTE, COLLABORATOR_NOT_FOUND, NOTE_NOT_FOUND } from "../../../shared/exceptions/NoteExceptions";
import { SERVICE_UNAVAILABLE } from "../../../shared/exceptions/CommonException";
import { USER_NOT_AUTHORIZED } from "../../../shared/exceptions/UserExceptions";

export const NOTE_RESPONSES = {
    CreateNote: {
        201: BaseNoteSchema,
        404: {
            type: 'object',
            properties: {
                statusCode: { enum: [404] },
                message: { enum: [COLLABORATOR_NOT_FOUND.message] }
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
                message: { enum: [SERVICE_UNAVAILABLE.message] }
            }
        },
        401: {
            type: 'object',
            properties: {
                statusCode: { enum: [401] },
                message: { enum: [USER_NOT_AUTHORIZED.message] }
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
                message: { enum: [SERVICE_UNAVAILABLE.message] }
            }
        },
        401: {
            type: 'object',
            properties: {
                statusCode: { enum: [401] },
                message: { enum: [USER_NOT_AUTHORIZED.message] }
            }
        }
    },
    GetNote: {
        200: BaseNoteSchema,
        404: {
            type: 'object',
            properties: {
                statusCode: { enum: [404] },
                message: { enum: [NOTE_NOT_FOUND.message] }
            }
        },
        503: {
            type: 'object',
            properties: {
                statusCode: { enum: [503] },
                message: { enum: [SERVICE_UNAVAILABLE.message] }
            }
        },
        401: {
            type: 'object',
            properties: {
                statusCode: { enum: [401] },
                message: { enum: [USER_NOT_AUTHORIZED.message] }
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
                message: { enum: [NOTE_NOT_FOUND.message] }
            }
        },
        503: {
            type: 'object',
            properties: {
                statusCode: { enum: [503] },
                message: { enum: [SERVICE_UNAVAILABLE.message] }
            }
        },
        401: {
            type: 'object',
            properties: {
                statusCode: { enum: [401] },
                message: { enum: [USER_NOT_AUTHORIZED.message] }
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
                message: { enum: [NOTE_NOT_FOUND.message] }
            }
        },
        503: {
            type: 'object',
            properties: {
                statusCode: { enum: [503] },
                message: { enum: [SERVICE_UNAVAILABLE.message] }
            }
        },
        401: {
            type: 'object',
            properties: {
                statusCode: { enum: [401] },
                message: { enum: [USER_NOT_AUTHORIZED.message] }
            }
        } 
    },
    UpdateNote: {
        200: BaseNoteSchema,
        404: {
            type: 'object',
            properties: {
                statusCode: { enum: [404] },
                message: { enum: [COLLABORATOR_NOT_FOUND.message] }
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
                message: { enum: [SERVICE_UNAVAILABLE.message] }
            }
        },
        401: {
            type: 'object',
            properties: {
                statusCode: { enum: [401] },
                message: { enum: [USER_NOT_AUTHORIZED.message] }
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
                message: { enum: [COLLABORATOR_ALREADY_IN_NOTE.message] }
            }
        },
        403: {
            type: 'object',
            properties: {
                statusCode: { enum: [403] },
                message: { enum: [NOTE_ACCESS_RESTRICTED.message] }
            }
        },
        404: {
            type: 'object',
            properties: {
                statusCode: { enum: [404] },
                message: { enum: [COLLABORATOR_NOT_FOUND.message, NOTE_NOT_FOUND.message] }
            }
        },
        503: {
            type: 'object',
            properties: {
                statusCode: { enum: [503] },
                message: { enum: [SERVICE_UNAVAILABLE.message] }
            }
        },
        401: {
            type: 'object',
            properties: {
                statusCode: { enum: [401] },
                message: { enum: [USER_NOT_AUTHORIZED.message] }
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
                message: { enum: [NOTE_ACCESS_RESTRICTED.message] }
            }
        },
        
        404: {
            type: 'object',
            properties: {
                statusCode: { enum: [404] },
                message: { enum: [COLLABORATOR_NOT_FOUND.message, NOTE_NOT_FOUND.message] }
            }
        },
        503: {
            type: 'object',
            properties: {
                statusCode: { enum: [503] },
                message: { enum: [SERVICE_UNAVAILABLE.message] }
            }
        },
        401: {
            type: 'object',
            properties: {
                statusCode: { enum: [401] },
                message: { enum: [USER_NOT_AUTHORIZED.message] }
            }
        }
    }
} as const