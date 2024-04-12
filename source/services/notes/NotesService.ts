import { NoteWithoutMetadata, Note } from "../../actors/Note";
import { NoteModel } from "../../database/ModelsFactory";
import { Exception } from "../../utils/Exception";
import { INotesService } from "./INotesService";
import { NoteExceptions } from "./NoteExceptions";

export class NotesService implements INotesService {
    constructor(private Note: NoteModel) {}

    public createNote(note: NoteWithoutMetadata) {
        return new Promise(async(
            resolve: (state: Note) => void,
            reject: (exception: 
                | typeof NoteExceptions.AlreadyExists
                | typeof NoteExceptions.ServiceUnavailable
            ) => void
        ) => {
            try {
                const foundNoteWithSameName = await this.Note.findOne({
                    title: note.title
                })
                if (foundNoteWithSameName) {
                    return reject(NoteExceptions.AlreadyExists)
                }

                const createdNote = await this.Note.create(note)

                resolve(createdNote as unknown as Note)
            } catch (_error) {
                return reject(NoteExceptions.ServiceUnavailable)
            }
        })
    }

    public getNote(login: string, title: string) {
        return new Promise(async(
            resolve: (state: Note) => void,
            reject: (exception: 
                | typeof NoteExceptions.NotFound
                | typeof NoteExceptions.ServiceUnavailable
            ) => void
        ) => {
            try {
                
                const foundNotes = await this.Note.find({$or: [
                    { author: login, title },
                    { collaborators: login, title }
                ]})
                if (!foundNotes.length) {
                    return reject(NoteExceptions.NotFound)
                }
                const foundNote = foundNotes[0]

                return resolve(foundNote as unknown as Note)

            } catch (_error) {
                return reject(NoteExceptions.ServiceUnavailable)
            }

        })
    }

    public deleteNote(authorLogin: string, title: string) {
        return new Promise(async(
            resolve: (state: { foundAndDeleted: boolean }) => void,
            reject: (exception: 
                | typeof NoteExceptions.AcessRestricted
                | typeof NoteExceptions.ServiceUnavailable
            ) => void
        ) => {
            try {
                const foundNote = await this.Note.findOne({ title })
                if (!foundNote) {
                    return resolve({foundAndDeleted: false})
                }
                if (foundNote.author !== authorLogin) {
                    return reject(NoteExceptions.AcessRestricted)
                }
                await foundNote.deleteOne({ author: authorLogin, title })

                return resolve({foundAndDeleted: true})
            } catch (_error) {
                return reject(NoteExceptions.ServiceUnavailable)
            }
        })
    }

    public updateNote(login: string, title: string, updateData: any) {
        return new Promise(async (
            resolve: (state: Note) => void,
            reject: (exception:
                | typeof NoteExceptions.NotFound
                | typeof NoteExceptions.AcessRestricted
                | typeof NoteExceptions.ServiceUnavailable
            ) => void
        ) => {
            try {
                
                const state = await this.Note.updateOne()
                
            } catch (_error) {
                return reject(NoteExceptions.ServiceUnavailable)
            }
        })
    }
    

}