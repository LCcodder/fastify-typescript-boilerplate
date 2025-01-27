import { DeepOptional } from "typing-assets";
import { Note, NoteCollaborators, NotePreview, NoteUpdate, NoteWithoutMetadata } from "../../shared/dto/NoteDto";
import { SERVICE_UNAVAILABLE } from "../../shared/exceptions/CommonException";
import { NOTE_ACCESS_RESTRICTED, COLLABORATOR_ALREADY_IN_NOTE, COLLABORATOR_NOT_FOUND, NOTE_NOT_FOUND } from "../../shared/exceptions/NoteExceptions";

export type NotesSearchOptions = DeepOptional<{
    tags: string[]
    limit: number
    skip: number
    sort: "ASC" | "DESC"
}>

export interface INotesService {
    createNote(
        note: NoteWithoutMetadata
    ): Promise<
        | Note
        | typeof SERVICE_UNAVAILABLE
        | typeof COLLABORATOR_NOT_FOUND
    >

    getNote(
        id: string,
        login: string
    ): Promise<
        | Note
        | typeof NOTE_NOT_FOUND
        | typeof SERVICE_UNAVAILABLE
    >

    deleteNote(
        id: string,
        login: string 
    ): Promise<
        | {success: true}
        | typeof NOTE_NOT_FOUND
        | typeof SERVICE_UNAVAILABLE
    >

    updateNote(
        id: string,
        login: string,
        updateData: NoteUpdate
    ): Promise<
        | Note
        | typeof NOTE_NOT_FOUND
        | typeof SERVICE_UNAVAILABLE
    >

    getMyNotes(authorLogin: string, options: NotesSearchOptions): Promise<
        NotePreview[]
        | typeof SERVICE_UNAVAILABLE
    >

    getCollaboratedNotes(login: string, options: NotesSearchOptions): Promise<
        NotePreview[]
        | typeof SERVICE_UNAVAILABLE
    >

    getCollaborators(id: string, login: string): Promise<
        NoteCollaborators
        | typeof NOTE_NOT_FOUND
        | typeof SERVICE_UNAVAILABLE
    >

    addCollaborator(
        id: string,
        authorLogin: string,
        collaboratorLogin: string
    ): Promise<
        | { success: true }
        | typeof COLLABORATOR_ALREADY_IN_NOTE
        | typeof COLLABORATOR_NOT_FOUND
        | typeof NOTE_NOT_FOUND
        | typeof SERVICE_UNAVAILABLE
        | typeof NOTE_ACCESS_RESTRICTED
    >

    removeCollaborator(
        id: string,
        authorLogin: string,
        collaboratorLogin: string
    ): Promise<
        | { success: true }
        | typeof COLLABORATOR_NOT_FOUND
        | typeof NOTE_NOT_FOUND
        | typeof SERVICE_UNAVAILABLE
        | typeof NOTE_ACCESS_RESTRICTED
    >
}