import mongoose from "mongoose";
import { NoteWithoutMetadata, Note } from "../../actors/Note";
import { User } from "../../actors/User";
import { NoteModel } from "../../database/ModelsFactory";
import { Exception } from "../../utils/Exception";
import { IUsersService } from "../users/IUsersService";
import { INotesService } from "./INotesService";
import { NoteExceptions } from "./NoteExceptions";

export class NotesService implements INotesService {
    constructor(
        private Note: NoteModel, 
        private usersService: IUsersService
    ) {}

    public createNote(note: NoteWithoutMetadata) {
        return new Promise(async(
            resolve: (state: Note) => void,
            reject: (exception: 
                | typeof NoteExceptions.ServiceUnavailable
            ) => void
        ) => {
            try {
                const createdNote = await this.Note.create(note)
                resolve(createdNote as unknown as Note)
            } catch (_error) {
                return reject(NoteExceptions.ServiceUnavailable)
            }
        })
    }

    public getNote(id: string, login: string) {
        return new Promise(async(
            resolve: (state: Note) => void,
            reject: (exception: 
                | typeof NoteExceptions.NoteNotFound
                | typeof NoteExceptions.ServiceUnavailable
            ) => void
        ) => {
            try {
                const _id = new mongoose.Types.ObjectId(id)

                const foundNote = await this.Note.findOne({$or: [
                    { author: login, _id },
                    { collaborators: login, _id }
                ]})
                if (!foundNote) {
                    return reject(NoteExceptions.NoteNotFound)
                }
                

                return resolve(foundNote as unknown as Note)
            } catch (_error) {
                return reject(NoteExceptions.ServiceUnavailable)
            }

        })
    }

    public deleteNote(id: string, authorLogin: string) {
        return new Promise(async(
            resolve: (state: { success: true }) => void,
            reject: (exception: 
                | typeof NoteExceptions.NoteNotFound
                | typeof NoteExceptions.ServiceUnavailable
            ) => void
        ) => {
            try {
                const _id = new mongoose.Types.ObjectId(id)

                const foundNote = await this.Note.findOne({ _id })
                if (!foundNote) {
                    return reject(NoteExceptions.NoteNotFound)
                }
                if (foundNote.author !== authorLogin) {
                    return reject(NoteExceptions.AcessRestricted)
                }
                await foundNote.deleteOne({ author: authorLogin, _id })
                
                return resolve({ success: true })
            } catch (_error) {
                return reject(NoteExceptions.ServiceUnavailable)
            }
        })
    }

    public updateNote(
        id: string, 
        login: string, 
        updateData: any
    ) {
        return new Promise(async (
            resolve: (state: Note) => void,
            reject: (exception:
                | typeof NoteExceptions.NoteNotFound
                | typeof NoteExceptions.ServiceUnavailable
            ) => void
        ) => {
            try {
                const _id = new mongoose.Types.ObjectId(id)

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
                    return reject(NoteExceptions.NoteNotFound)
                }

                const updatedNote = await this.Note.findOne({ _id })
                return resolve(updatedNote as unknown as Note)
            } catch (_error) {
                return reject(NoteExceptions.ServiceUnavailable)
            }
        })
    }

    public getMyNotes(authorLogin: string) {
        return new Promise(async (
            resolve: (state: Note[]) => void,
            reject: (exception: typeof NoteExceptions.ServiceUnavailable) => void
        ) => {
            try {
                const foundNotes = await this.Note.find({
                    author: authorLogin
                })
                return resolve(foundNotes as unknown as Note[])
            } catch (_error) {
                return reject(NoteExceptions.ServiceUnavailable)
            }
        })
    }

    public getCollaboratedNotes(login: string) {
        return new Promise(async (
            resolve: (state: Note[]) => void,
            reject: (exception: typeof NoteExceptions.ServiceUnavailable) => void
        ) => {
            try {
                const foundNotes = await this.Note.find({
                    collaborators: login
                })
                return resolve(foundNotes as unknown as Note[])
            } catch (_error) {
                return reject(NoteExceptions.ServiceUnavailable)
            }
        })
    }
    
    public addCollaborator(id: string, authorLogin: string, collaboratorLogin: string) {
        return new Promise(async (
            resolve: (state: { success: true }) => void,
            reject: (exception: 
                | typeof NoteExceptions.CollaboratorAlreadyInNote
                | typeof NoteExceptions.CollaboratorNotFound
                | typeof NoteExceptions.NoteNotFound
                | typeof NoteExceptions.ServiceUnavailable
            ) => void
        ) => {
            try {
                const _id = new mongoose.Types.ObjectId(id)

                const foundCollaborator = await this.usersService.getUser(
                    "login",
                    collaboratorLogin
                ) as unknown as User
                
                if (!foundCollaborator || !foundCollaborator.isCollaborating) {
                    return reject(NoteExceptions.CollaboratorNotFound)
                }

                const state = await this.Note.updateOne({
                    _id,
                    author: authorLogin
                }, {
                    $addToSet: {collaborators: collaboratorLogin}
                })

                if (!state.matchedCount) {
                    return reject(NoteExceptions.NoteNotFound)
                }

                if (!state.modifiedCount) {
                    return reject(NoteExceptions.CollaboratorAlreadyInNote)
                }

                return resolve({ success: true })
            } catch (_error) {
                return reject(NoteExceptions.ServiceUnavailable)
            }
        })
    }

    public removeCollaborator(id: string, authorLogin: string, collaboratorLogin: string) {
        return new Promise(async (
            resolve: (state: { success: true }) => void,
            reject: (exception: 
                | typeof NoteExceptions.CollaboratorNotFound
                | typeof NoteExceptions.NoteNotFound
                | typeof NoteExceptions.ServiceUnavailable
            ) => void
        ) => {
            try {
                const _id = new mongoose.Types.ObjectId(id)

                const state = await this.Note.updateOne({
                    _id,
                    author: authorLogin
                }, {
                    $pull: {
                        collaborators: collaboratorLogin
                    }
                })

                if (!state.matchedCount) {
                    return reject(NoteExceptions.NoteNotFound)
                }

                if (!state.modifiedCount) {
                    return reject(NoteExceptions.CollaboratorNotFound)
                }

                return resolve({ success: true })
            } catch (_error) {
                return reject(NoteExceptions.ServiceUnavailable)    
            }
        })
    }

    public leaveFromCollaboration(title: string, collaboratorLogin: string) {
        return new Promise(async (
            resolve: (state: { success: true }) => void,
            reject: (exception:
                | typeof NoteExceptions.NoteNotFound
                | typeof NoteExceptions.CollaboratorNotFound
                | typeof NoteExceptions.ServiceUnavailable
            ) => void
        ) => {
            try {
                const d = await this.Note.findByIdAndDelete()

                const state = await this.Note.updateOne({

                }, {

                })
            } catch (_error) {
                return reject(NoteExceptions.ServiceUnavailable)    
            }
        })
    }

}