import { Note, NoteWithoutMetadata } from "../../actors/Note";
import { NoteExceptions } from "./NoteExceptions";

export interface INotesService {
    createNote(
        note: NoteWithoutMetadata
    ): Promise<
        | Note
        | typeof NoteExceptions.ServiceUnavailable
    >

    getNote(
        id: string,
        login: string
    ): Promise<
        | Note
        | typeof NoteExceptions.NoteNotFound
        | typeof NoteExceptions.ServiceUnavailable
    >

    deleteNote(
        id: string,
        authorLogin: string 
    ): Promise<
        | {success: true}
        | typeof NoteExceptions.NoteNotFound
        | typeof NoteExceptions.ServiceUnavailable
    >

    updateNote(
        id: string,
        login: string,
        updateData: any
    ): Promise<
        | Note
        | typeof NoteExceptions.NoteNotFound
        | typeof NoteExceptions.ServiceUnavailable
    >

    getMyNotes(authorLogin: string): Promise<
        Note[]
        | typeof NoteExceptions.ServiceUnavailable
    >

    getCollaboratedNotes(login: string): Promise<
        Note[]
        | typeof NoteExceptions.ServiceUnavailable
    >

    addCollaborator(
        id: string,
        authorLogin: string,
        collaboratorLogin: string
    ): Promise<
        | { success: true }
        | typeof NoteExceptions.CollaboratorAlreadyInNote
        | typeof NoteExceptions.CollaboratorNotFound
        | typeof NoteExceptions.NoteNotFound
        | typeof NoteExceptions.ServiceUnavailable
    >

    removeCollaborator(
        id: string,
        authorLogin: string,
        collaboratorLogin: string
    ): Promise<
        | { success: true }
        | typeof NoteExceptions.CollaboratorNotFound
        | typeof NoteExceptions.NoteNotFound
        | typeof NoteExceptions.ServiceUnavailable
    >

    leaveFromCollaboration(
        id: string,
        collaboratorLogin: string
    ): Promise<
        | { success: true }
        | typeof NoteExceptions.CollaboratorNotFound
        | typeof NoteExceptions.NoteNotFound
        | typeof NoteExceptions.ServiceUnavailable
    >
}