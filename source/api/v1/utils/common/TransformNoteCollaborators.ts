import { NoteEntity, Note } from "../../database/entities/Note";

export const transformNoteCollaborators = (note: NoteEntity.Note): Note => {
    return {
        ...note,
        collaborators: note.collaborators.map(c => c.login)
    }
}