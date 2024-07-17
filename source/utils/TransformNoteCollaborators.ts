import { NoteEntity, Note } from "../database/entities/_Note";

export const transformNoteCollaborators = (note: NoteEntity.Note): Note => {
    return {
        ...note,
        collaborators: note.collaborators.map(c => c.login)
    }
}