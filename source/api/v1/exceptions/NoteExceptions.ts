import {Exception} from "../utils/Exception";

export const NOTE_EXCEPTIONS = {
    NoteNotFound: {
        statusCode: 404,
        message: "Requesting note not found"
    },
    CollaboratorAlreadyInNote: {
        statusCode: 400,
        message: "Collaborator is already in note"
    },
    CollaboratorNotFound: {
        statusCode: 404,
        message: "Collaborator can not be found"
    },
    ServiceUnavailable: {
        statusCode: 503,
        message: "Notes service is unavailable"
    },
    AcessRestricted: {
        statusCode: 403,
        message: "Only creator can delete notes"
    }
} as const satisfies Record<string, Exception>
