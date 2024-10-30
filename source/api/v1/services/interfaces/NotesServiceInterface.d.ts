import { Note, NoteCollaborators, NotePreview, NoteUpdate, NoteWithoutMetadata } from "../../database/entities/Note";
import { NOTE_EXCEPTIONS } from "../../exceptions/NoteExceptions";
import { USER_EXCEPTIONS } from "../../exceptions/UserExceptions";

export interface INotesService {
    createNote(
        note: NoteWithoutMetadata
    ): Promise<
        | Note
        | typeof NOTE_EXCEPTIONS.ServiceUnavailable
        | typeof NOTE_EXCEPTIONS.CollaboratorNotFound
        | typeof USER_EXCEPTIONS.ServiceUnavailable
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
        login: string 
    ): Promise<
        | {success: true}
        | typeof NOTE_EXCEPTIONS.NoteNotFound
        | typeof NOTE_EXCEPTIONS.ServiceUnavailable
    >

    updateNote(
        id: string,
        login: string,
        updateData: NoteUpdate
    ): Promise<
        | Note
        | typeof NOTE_EXCEPTIONS.NoteNotFound
        | typeof NOTE_EXCEPTIONS.ServiceUnavailable
    >

    getMyNotes(authorLogin: string, filters: string[], limit: number, skip: number, sort: "ASC" | "DESC"): Promise<
        NotePreview[]
        | typeof NOTE_EXCEPTIONS.ServiceUnavailable
    >

    getCollaboratedNotes(login: string, filters: string[], limit: number, skip: number, sort: "ASC" | "DESC"): Promise<
        NotePreview[]
        | typeof NOTE_EXCEPTIONS.ServiceUnavailable
    >

    getCollaborators(id: string, login: string): Promise<
        NoteCollaborators
        | typeof NOTE_EXCEPTIONS.NoteNotFound
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
        | typeof NOTE_EXCEPTIONS.AcessRestricted
    >
}