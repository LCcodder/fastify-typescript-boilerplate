import { Note, NoteWithoutMetadata } from "../../actors/Note";
import { NOTE_EXCEPTIONS } from "./NoteExceptions";

export interface INotesService {
    createNote(
        note: NoteWithoutMetadata
    ): Promise<
        | Note
        | typeof NOTE_EXCEPTIONS.ServiceUnavailable
    >

    getNote(
        id: string,
        login: string
    ): Promise<
        | Note
        | typeof NOTE_EXCEPTIONS.NoteNotFound
        | typeof NOTE_EXCEPTIONS.ServiceUnavailable
    >

    deleteNote(
        id: string,
        authorLogin: string 
    ): Promise<
        | {success: true}
        | typeof NOTE_EXCEPTIONS.NoteNotFound
        | typeof NOTE_EXCEPTIONS.ServiceUnavailable
    >

    updateNote(
        id: string,
        login: string,
        updateData: any
    ): Promise<
        | Note
        | typeof NOTE_EXCEPTIONS.NoteNotFound
        | typeof NOTE_EXCEPTIONS.ServiceUnavailable
    >

    getMyNotes(authorLogin: string): Promise<
        Note[]
        | typeof NOTE_EXCEPTIONS.ServiceUnavailable
    >

    getCollaboratedNotes(login: string): Promise<
        Note[]
        | typeof NOTE_EXCEPTIONS.ServiceUnavailable
    >

    addCollaborator(
        id: string,
        authorLogin: string,
        collaboratorLogin: string
    ): Promise<
        | { success: true }
        | typeof NOTE_EXCEPTIONS.CollaboratorAlreadyInNote
        | typeof NOTE_EXCEPTIONS.CollaboratorNotFound
        | typeof NOTE_EXCEPTIONS.NoteNotFound
        | typeof NOTE_EXCEPTIONS.ServiceUnavailable
    >

    removeCollaborator(
        id: string,
        authorLogin: string,
        collaboratorLogin: string
    ): Promise<
        | { success: true }
        | typeof NOTE_EXCEPTIONS.CollaboratorNotFound
        | typeof NOTE_EXCEPTIONS.NoteNotFound
        | typeof NOTE_EXCEPTIONS.ServiceUnavailable
    >

    leaveFromCollaboration(
        id: string,
        collaboratorLogin: string
    ): Promise<
        | { success: true }
        | typeof NOTE_EXCEPTIONS.CollaboratorNotFound
        | typeof NOTE_EXCEPTIONS.NoteNotFound
        | typeof NOTE_EXCEPTIONS.ServiceUnavailable
    >
}