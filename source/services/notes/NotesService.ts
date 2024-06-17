import mongoose from "mongoose";
import { NoteWithoutMetadata, Note, NotePreview, NoteUpdate } from "../../actors/Note";
import { User } from "../../actors/User";
import { NoteModel } from "../../database/ModelsFactory";
import { IUsersService } from "../users/IUsersService";
import { INotesService } from "./INotesService";
import { NOTE_EXCEPTIONS } from "./NoteExceptions";


export class NotesService implements INotesService {
    private static fromStringToObjectId(id: string): mongoose.Types.ObjectId | null {
        try {
            return new mongoose.Types.ObjectId(id)
        } catch (_error) {
            return null
        }
    }

    constructor(
        private Note: NoteModel, 
        private usersService: IUsersService
    ) {}

    // TODO: Add checking collaborators existance
    public createNote(note: NoteWithoutMetadata) {
        return new Promise(async(
            resolve: (state: Note) => void,
            reject: (exception: 
                | typeof NOTE_EXCEPTIONS.ServiceUnavailable
            ) => void
        ) => {
            try {
                console.log(":(")
                const createdNote = await this.Note.create(note)
                resolve(createdNote as unknown as Note)
            } catch (_error) {
                console.log(_error)
                return reject(NOTE_EXCEPTIONS.ServiceUnavailable)
            }
        })
    }

    public getNote(id: string, login: string) {
        return new Promise(async(
            resolve: (state: Note) => void,
            reject: (exception: 
                | typeof NOTE_EXCEPTIONS.NoteNotFound
                | typeof NOTE_EXCEPTIONS.ServiceUnavailable
            ) => void
        ) => {
            try {
                const _id = NotesService.fromStringToObjectId(id)

                const foundNote = await this.Note.findOne({$or: [
                    { author: login, _id },
                    { collaborators: login, _id }
                ]})
                
                if (!foundNote) {
                    return reject(NOTE_EXCEPTIONS.NoteNotFound)
                }
                
                return resolve(foundNote as unknown as Note)
            } catch (_error) {
                return reject(NOTE_EXCEPTIONS.ServiceUnavailable)
            }

        })
    }

    public deleteNote(id: string, login: string) {
        return new Promise(async(
            resolve: (state: { success: true }) => void,
            reject: (exception: 
                | typeof NOTE_EXCEPTIONS.NoteNotFound
                | typeof NOTE_EXCEPTIONS.ServiceUnavailable
            ) => void
        ) => {
            try {
                const _id = NotesService.fromStringToObjectId(id)

                const foundNote = await this.Note.findOne({ _id })
                if (!foundNote) {
                    return reject(NOTE_EXCEPTIONS.NoteNotFound)
                }

                if (foundNote.author !== login) {
                    await this.Note.updateOne({
                        _id,
                        collaborators: login
                    }, {
                        $pull: {
                            collaborators: login
                        }
                    })
                    return resolve({ success: true })
                }

                await foundNote.deleteOne({ author: login, _id })
                
                return resolve({ success: true })
            } catch (_error) {
                return reject(NOTE_EXCEPTIONS.ServiceUnavailable)
            }
        })
    }

    public updateNote(
        id: string, 
        login: string, 
        updateData: NoteUpdate
    ) {
        return new Promise(async (
            resolve: (state: Note) => void,
            reject: (exception:
                | typeof NOTE_EXCEPTIONS.NoteNotFound
                | typeof NOTE_EXCEPTIONS.ServiceUnavailable
            ) => void
        ) => {
            try {
                const _id = NotesService.fromStringToObjectId(id)

                const state = await this.Note.updateOne({
                    $or: [
                        {
                            _id,
                            author: login
                        },
                        {
                            _id,
                            collaborators: login
                        }
                    ]
                }, updateData)
                
                if (!state.matchedCount) {
                    return reject(NOTE_EXCEPTIONS.NoteNotFound)
                }

                const updatedNote = await this.Note.findOne({ _id })
                return resolve(updatedNote as unknown as Note)
            } catch (_error) {
                return reject(NOTE_EXCEPTIONS.ServiceUnavailable)
            }
        })
    }

    public getMyNotes(authorLogin: string, limit: number, skip: number) {
        return new Promise(async (
            resolve: (state: NotePreview[]) => void,
            reject: (exception: typeof NOTE_EXCEPTIONS.ServiceUnavailable) => void
        ) => {
            try {
                const foundNotes = await this.Note.find({
                    author: authorLogin
                }, {
                    createdAt: 0,
                    content: 0
                }).skip(skip).limit(limit)
                return resolve(foundNotes as unknown as NotePreview[])
            } catch (_error) {
                console.log(_error)
                return reject(NOTE_EXCEPTIONS.ServiceUnavailable)
            }
        })
    }

    public getCollaboratedNotes(login: string, limit: number, skip: number) {
        return new Promise(async (
            resolve: (state: Note[]) => void,
            reject: (exception: typeof NOTE_EXCEPTIONS.ServiceUnavailable) => void
        ) => {
            try {
                const foundNotes = await this.Note.find({
                    collaborators: login
                }).skip(skip).limit(limit)
                return resolve(foundNotes as unknown as Note[])
            } catch (_error) {
                return reject(NOTE_EXCEPTIONS.ServiceUnavailable)
            }
        })
    }
    
    public addCollaborator(id: string, authorLogin: string, collaboratorLogin: string) {
        return new Promise(async (
            resolve: (state: { success: true }) => void,
            reject: (exception: 
                | typeof NOTE_EXCEPTIONS.CollaboratorAlreadyInNote
                | typeof NOTE_EXCEPTIONS.CollaboratorNotFound
                | typeof NOTE_EXCEPTIONS.NoteNotFound
                | typeof NOTE_EXCEPTIONS.ServiceUnavailable
                | typeof NOTE_EXCEPTIONS.AcessRestricted
            ) => void
        ) => {
            try {
                const _id = NotesService.fromStringToObjectId(id)
                
                const foundNote = await this.Note.findById(_id)
                if (foundNote.author !== authorLogin) {
                    return reject(
                        NOTE_EXCEPTIONS.AcessRestricted
                    )
                }

                const foundCollaborator = await this.usersService.getUser(
                    "login",
                    collaboratorLogin
                ) as unknown as User
                
                if (!foundCollaborator || !foundCollaborator.isCollaborating) {
                    return reject(NOTE_EXCEPTIONS.CollaboratorNotFound)
                }

                const state = await this.Note.updateOne({
                    _id,
                    author: authorLogin
                }, {
                    $addToSet: {collaborators: collaboratorLogin}
                })

                if (!state.matchedCount) {
                    return reject(NOTE_EXCEPTIONS.NoteNotFound)
                }

                if (!state.modifiedCount) {
                    return reject(NOTE_EXCEPTIONS.CollaboratorAlreadyInNote)
                }

                return resolve({ success: true })
            } catch (_error) {
                return reject(NOTE_EXCEPTIONS.ServiceUnavailable)
            }
        })
    }

    public removeCollaborator(id: string, authorLogin: string, collaboratorLogin: string) {
        return new Promise(async (
            resolve: (state: { success: true }) => void,
            reject: (exception: 
                | typeof NOTE_EXCEPTIONS.CollaboratorNotFound
                | typeof NOTE_EXCEPTIONS.NoteNotFound
                | typeof NOTE_EXCEPTIONS.ServiceUnavailable
                | typeof NOTE_EXCEPTIONS.AcessRestricted
            ) => void
        ) => {
            try {
                const _id = NotesService.fromStringToObjectId(id)
                
                const foundNote = await this.Note.findById(_id)
                if (foundNote.author !== authorLogin) {
                    return reject(
                        NOTE_EXCEPTIONS.AcessRestricted
                    )
                }

                const state = await this.Note.updateOne({
                    _id,
                    author: authorLogin
                }, {
                    $pull: {
                        collaborators: collaboratorLogin
                    }
                })

                if (!state.matchedCount) {
                    return reject(NOTE_EXCEPTIONS.NoteNotFound)
                }

                if (!state.modifiedCount) {
                    return reject(NOTE_EXCEPTIONS.CollaboratorNotFound)
                }

                return resolve({ success: true })
            } catch (_error) {
                return reject(NOTE_EXCEPTIONS.ServiceUnavailable)    
            }
        })
    }

    

}