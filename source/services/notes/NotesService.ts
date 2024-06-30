import { NoteWithoutMetadata, Note, NotePreview, NoteUpdate } from "../../database/entities/_Note";
import { User } from "../../database/entities/_User";
import { IUsersService } from "../users/UsersServiceInterface";
import { INotesService } from "./NotesServiceInterface";
import { NOTE_EXCEPTIONS } from "../../exceptions/NoteExceptions";
import { ArrayContains, Repository } from "typeorm";
import { Exception } from "../../utils/Exception";

export class NotesService implements INotesService {
    private static generateNoteId(): string {
        const symbolsHEX = "0123456789abcdef"
        let id = ""
        for (let i: number = 0; i < 16; i++) {
            id += symbolsHEX.charAt(Math.floor(Math.random() * 16));
        }
        return id
    }

    constructor(
        private noteRepository: Repository<Note>, 
        private usersService: IUsersService
    ) {}

    // TODO: Add checking collaborators existance
    public createNote(note: NoteWithoutMetadata) {
        return new Promise(async(
            resolve: (state: Note) => void,
            reject: (exception: 
                | typeof NOTE_EXCEPTIONS.ServiceUnavailable
                | typeof NOTE_EXCEPTIONS.CollaboratorNotFound
            ) => void
        ) => {
            try {
                // checking collaborators existance
                for (const collaboratorLogin of note.collaborators) {
                    const foundCollaborator = await this.usersService.getUser("login", collaboratorLogin).catch()
                    if ((foundCollaborator as unknown as Exception).statusCode === 404) {
                        return reject(NOTE_EXCEPTIONS.CollaboratorNotFound)
                    }
                }

                const id = NotesService.generateNoteId()
                const createdNote = await this.noteRepository.save({
                    ...note,
                    id
                })
                resolve(createdNote as unknown as Note)
            } catch (error) {
                console.log(error)
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
                const foundNote = await this.noteRepository.findOne({where: [
                    { author: login, id },
                    { collaborators: login, id }
                ]})
                
                if (!foundNote) {
                    return reject(NOTE_EXCEPTIONS.NoteNotFound)
                }
                
                return resolve(foundNote as unknown as Note)
            } catch (error) {
                console.log(error)
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
                const foundNote = await this.noteRepository.findOneBy({ id })
                if (!foundNote) {
                    return reject(NOTE_EXCEPTIONS.NoteNotFound)
                }

                if (foundNote.author !== login) {
                    
                    await this.noteRepository.update({
                        id,
                        collaborators: ArrayContains([login])
                    }, {
                        collaborators: foundNote.collaborators.splice(foundNote.collaborators.indexOf(login), 1)
                        
                    })

                    return resolve({ success: true })
                }

                await this.noteRepository.delete({ author: login, id })
                
                return resolve({ success: true })
            } catch (error) {
                console.log(error)
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
                let foundNote = await this.noteRepository.findOne({
                    where: [
                        {
                            id,
                            author: ArrayContains([login])
                        },
                        {
                            id,
                            collaborators: ArrayContains([login])
                        }
                    ]
                })
                
                if (!foundNote) {
                    return reject(NOTE_EXCEPTIONS.NoteNotFound)
                }

                foundNote = Object.assign(foundNote, updateData)
                const updatedNote = await this.noteRepository.save(foundNote)
                return resolve(updatedNote as unknown as Note)
            } catch (error) {
                console.log(error)
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
                const foundNotes = await this.noteRepository.find({
                    where: {
                        author: authorLogin
                    },
                    skip,
                    take: limit
                })
                return resolve(foundNotes as unknown as NotePreview[])
            } catch (error) {
                console.log(error)
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
                const foundNotes = await this.noteRepository.find({
                    where: {
                        collaborators: ArrayContains([login])
                    },
                    skip,
                    take: limit
                })
                return resolve(foundNotes as unknown as Note[])
            } catch (error) {
                console.log(error)
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
                
                const foundNote = await this.noteRepository.findOneBy({ id })
                if (!foundNote) {
                    return reject(NOTE_EXCEPTIONS.NoteNotFound)
                }
                if (foundNote.author !== authorLogin) {
                    return reject(
                        NOTE_EXCEPTIONS.AcessRestricted
                    )
                }
                
                const foundCollaborator = await this.usersService.getUser(
                    "login",
                    collaboratorLogin
                ).catch() as unknown as User
                
                if ((foundCollaborator as unknown as Exception).statusCode === 503) {
                    return reject(NOTE_EXCEPTIONS.ServiceUnavailable)
                }

                if ((foundCollaborator as unknown as Exception).statusCode === 404 || !foundCollaborator.isCollaborating) {
                    return reject(NOTE_EXCEPTIONS.CollaboratorNotFound)
                }

                if (foundNote.collaborators.includes(foundCollaborator.login)) {
                    return reject(NOTE_EXCEPTIONS.CollaboratorAlreadyInNote)
                }

                await this.noteRepository.update({
                    id,
                    author: authorLogin
                }, {
                    collaborators: [...foundNote.collaborators, foundCollaborator.login]
                })

                return resolve({ success: true })
            } catch (error) {
                console.log(error)
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
                
                let foundNote = await this.noteRepository.findOneBy({ id })
                if (!foundNote) {
                    return reject(NOTE_EXCEPTIONS.NoteNotFound)
                }
                if (foundNote.author !== authorLogin) {
                    return reject(
                        NOTE_EXCEPTIONS.AcessRestricted
                    )
                }

                if (foundNote.collaborators.indexOf(collaboratorLogin) === -1) {
                    return reject(NOTE_EXCEPTIONS.CollaboratorNotFound)
                }

                foundNote.collaborators.splice(
                    foundNote.collaborators.indexOf(collaboratorLogin),
                    1
                )

                return resolve({ success: true })
            } catch (error) {
                console.log(error)
                return reject(NOTE_EXCEPTIONS.ServiceUnavailable)    
            }
        })
    }

    

}