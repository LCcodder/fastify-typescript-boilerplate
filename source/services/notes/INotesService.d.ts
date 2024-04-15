import { Note, NoteWithoutMetadata } from "../../actors/Note";
import { NoteExceptions } from "./NoteExceptions";

export interface INotesService {
    createNote(note: NoteWithoutMetadata): Promise<
        | Note
        | typeof NoteExceptions.AlreadyExists
        | typeof NoteExceptions.ServiceUnavailable
    >

    getNote(login: string, title: string): Promise<
        | Note
        | typeof NoteExceptions.NotFound
        | typeof NoteExceptions.ServiceUnavailable
    >

    deleteNote(authorLogin: string, title: string): Promise<
        | { success: true }
        | typeof NoteExceptions.NotFound
        | typeof NoteExceptions.ServiceUnavailable
    >

    updateNote(authorLogin: string, title: string, updateData: any): Promise<
        | Note
        | typeof NoteExceptions.NotFound
        | typeof NoteExceptions.ServiceUnavailable
    >

    getMyNotes(authorLogin: string): void
    getCollaboratedNotes(login: string): void

    addCollaborator(authorLogin: string, collaboratorLogin: string): void
    removeCollaborator(authorLogin: string, collaboratorLogin: string): void
}