import { Note, Note as NoteEntity } from "../../../database/entities/Note";

export const transformNoteCollaborators = (note: NoteEntity): Note => {
    return {
        ...note,
        collaborators: note.collaborators.map(c => c.login)
    }
}