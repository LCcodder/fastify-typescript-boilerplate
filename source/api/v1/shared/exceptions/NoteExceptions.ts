import { Exception } from "../utils/typing/Exception";


const NOTE_NOT_FOUND: Exception = {
    statusCode: 404,
    message: "Requesting note not found"
}

const COLLABORATOR_ALREADY_IN_NOTE: Exception = {
    statusCode: 400,
    message: "Collaborator is already in note"
}

const COLLABORATOR_NOT_FOUND: Exception = {
    statusCode: 404,
    message: "Collaborator can not be found"
}

const NOTE_ACCESS_RESTRICTED: Exception = {
    statusCode: 403,
    message: "Access to note restricted"
}

export {
    NOTE_NOT_FOUND,
    COLLABORATOR_ALREADY_IN_NOTE,
    COLLABORATOR_NOT_FOUND,
    NOTE_ACCESS_RESTRICTED
}