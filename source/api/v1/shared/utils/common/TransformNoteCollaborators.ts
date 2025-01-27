import { Note as NoteEntity } from "../../../database/entities/Note";
import { Note } from "../../dto/NoteDto";

export const transformNoteCollaborators = (note: NoteEntity): Note => {
    return {
        ...note,
        collaborators: note.collaborators.map(c => c.login)
    }
}