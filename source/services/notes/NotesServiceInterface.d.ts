import { Note, NotePreview, NoteWithoutMetadata } from "../../actors/Note";
import { NOTE_EXCEPTIONS } from "../../exceptions/NoteExceptions";

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

    getMyNotes(authorLogin: string, limit: number, skip: number): Promise<
        NotePreview[]
        | typeof NOTE_EXCEPTIONS.ServiceUnavailable
    >

    getCollaboratedNotes(login: string, limit: number, skip: number): Promise<
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
        | typeof NOTE_EXCEPTIONS.AcessRestricted
        | typeof NOTE_EXCEPTIONS.AcessRestricted
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
}