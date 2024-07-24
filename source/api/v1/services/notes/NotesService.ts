import { NoteWithoutMetadata, Note, NotePreview, NoteUpdate, NoteEntity, NoteCollaborators } from "../../database/entities/Note";
import { User, UserWithoutSensetives } from "../../database/entities/User";
import { IUsersService } from "../users/UsersServiceInterface";
import { INotesService } from "./NotesServiceInterface";
import { NOTE_EXCEPTIONS } from "../../exceptions/NoteExceptions";
import { ArrayContains, Repository, SelectQueryBuilder } from "typeorm";
import { Exception } from "../../utils/Exception";
import { transformNoteCollaborators } from "../../utils/TransformNoteCollaborators";
import { excludeProperties } from "typing-assets"
export class NotesService implements INotesService {
    private static generateNoteId(): string {
        const symbolsHEX = "0123456789abcdef"
        let id = ""
        for (let i: number = 0; i < 16; i++) {
            id += symbolsHEX.charAt(Math.floor(Math.random() * 16))
        }
        return id
    }

    constructor(
        private noteRepository: Repository<NoteEntity.Note>, 
        private usersService: IUsersService
    ) {}

    public createNote(note: NoteWithoutMetadata) {
        return new Promise(async(
            resolve: (state: Note) => void,
            reject: (exception: 
                | typeof NOTE_EXCEPTIONS.ServiceUnavailable
                | typeof NOTE_EXCEPTIONS.CollaboratorNotFound
            ) => void
        ) => {
            try {
                const collaboratorsRelationArray = []
                // checking collaborators existance
                for (const collaborator of note.collaborators) {
                    const foundCollaborator = await this.usersService.getUser("login", collaborator).catch()
                    if ((foundCollaborator as unknown as Exception).statusCode === 404) {
                        return reject(NOTE_EXCEPTIONS.CollaboratorNotFound)
                    }
                    collaboratorsRelationArray.push(foundCollaborator as User)
                }

                const id = NotesService.generateNoteId()
                const createdNote = await this.noteRepository.save({
                    ...note,
                    id,
                    collaborators: collaboratorsRelationArray
                })

                resolve(
                    transformNoteCollaborators(createdNote) as unknown as Note
                )
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
                const foundNote = await this.noteRepository.findOne(
                    {
                        where: {
                            id
                        },
                        relations: {
                            collaborators: true
                        }
                    }
                )

                if (foundNote?.author === login || foundNote?.collaborators.find(c => c.login === login)) {
                    return resolve(
                        transformNoteCollaborators(foundNote) as unknown as Note
                    )
                }
                
                
                return reject(NOTE_EXCEPTIONS.NoteNotFound)
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
                const foundNote = await this.noteRepository.findOne({ where: { id }, relations: {collaborators: true}})
                
                if (!foundNote) {
                    return reject(NOTE_EXCEPTIONS.NoteNotFound)
                }

                if (foundNote.author !== login) {
                    foundNote.collaborators = foundNote.collaborators.filter(c => c.login !== login)
                    await this.noteRepository.save(foundNote)

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
                let foundNote = await this.noteRepository.findOne(
                    {
                        where: {
                            id
                        },
                        relations: {
                            collaborators: true
                        }
                    }
                )

                if (foundNote?.author === login || foundNote?.collaborators.find(c => c.login === login)) {
                    foundNote = Object.assign(foundNote, updateData)
                    const updatedNote = await this.noteRepository.save(foundNote)

                    return resolve(
                        transformNoteCollaborators(updatedNote) as unknown as Note
                    )
                }
                
                return reject(NOTE_EXCEPTIONS.NoteNotFound)
            } catch (error) {
                console.log(error)
                return reject(NOTE_EXCEPTIONS.ServiceUnavailable)
            }
        })
    }
    public getMyNotes(authorLogin: string, tags: string[], limit: number, skip: number, sort: "ASC" | "DESC") {
        return new Promise(async (
            resolve: (state: NotePreview[]) => void,
            reject: (exception: typeof NOTE_EXCEPTIONS.ServiceUnavailable) => void
        ) => {
            try {

                const query = this.noteRepository
                    .createQueryBuilder("note")
                    .select(["note.id", "note.author", "note.title", "note.tags", 'note.updatedAt'])
                    .where("note.author = :login", {login: authorLogin})
                    .limit(limit)
                    .skip(skip)
                    .orderBy('note.updatedAt', sort)

                if (tags && tags.length) {
                    query.where("note.tags && :tags", { tags })    
                }
                
                const foundNotes = await query.getMany()
                return resolve(foundNotes as unknown as NotePreview[])
            } catch (error) {
                console.log(error)
                return reject(NOTE_EXCEPTIONS.ServiceUnavailable)
            }
        })
    }


    public getCollaboratedNotes(login: string, tags: string[], limit: number, skip: number, sort: "ASC" | "DESC") {
        return new Promise(async (
            resolve: (state: NotePreview[]) => void,
            reject: (exception: typeof NOTE_EXCEPTIONS.ServiceUnavailable) => void
        ) => {
            try {
                

                const query = this.noteRepository
                    .createQueryBuilder("note")
                    .innerJoinAndSelect("note.collaborators", "user", '"userLogin" = :login', {login})
                    .select(["note.id", "note.author", "note.title", "note.tags", 'note.updatedAt'])
                    .limit(limit)
                    .skip(skip)
                    .orderBy('note.updatedAt', sort)
                    
                if (tags && tags.length) {
                    query.where("note.tags && :tags", { tags })    
                }
                    
                const foundNotes = await query.getMany()
                return resolve(foundNotes as unknown as NotePreview[])
            } catch (error) {
                console.log(error)
                return reject(NOTE_EXCEPTIONS.ServiceUnavailable)
            }
        })
    }
    
    public getCollaborators(id: string, login: string) {
        return new Promise(async (
            resolve: (collaborators: NoteCollaborators) => void,
            reject: (exception: 
                | typeof NOTE_EXCEPTIONS.NoteNotFound
                | typeof NOTE_EXCEPTIONS.ServiceUnavailable
            ) => void
        ) => {
            try {
                const foundNote = await this.noteRepository.findOne({
                    where: {
                        id
                    },
                    relations: {
                        collaborators: true
                    }
                })
                
                if (foundNote.author === login || foundNote.collaborators.find(c => c.login === login)) {
                    const collaborators = foundNote.collaborators.map(c => excludeProperties(c, "password", "validToken"))

                    return resolve(
                        collaborators
                    )
                }

                return reject(NOTE_EXCEPTIONS.NoteNotFound)
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
                
                const foundNote = await this.noteRepository.findOne({ where: { id }, relations: {collaborators: true}})
                
                if (!foundNote) {
                    return reject(NOTE_EXCEPTIONS.NoteNotFound)
                }
                if (foundNote.author !== authorLogin) {
                    return reject(
                        NOTE_EXCEPTIONS.AcessRestricted
                    )
                }
                if (authorLogin === collaboratorLogin) {
                    return reject(
                        NOTE_EXCEPTIONS.CollaboratorNotFound
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

                if (foundNote.collaborators.find(c => c.login === collaboratorLogin)) {
                    return reject(NOTE_EXCEPTIONS.CollaboratorAlreadyInNote)
                }

                foundNote.collaborators.push(foundCollaborator)
                await this.noteRepository.save(foundNote)

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
                
                const foundNote = await this.noteRepository.findOne({ where: { id }, relations: {collaborators: true}})
                
                if (!foundNote) {
                    return reject(NOTE_EXCEPTIONS.NoteNotFound)
                }
                if (foundNote.author !== authorLogin) {
                    return reject(
                        NOTE_EXCEPTIONS.AcessRestricted
                    )
                }

                const foundCollaborator = foundNote.collaborators.find(c => c.login === collaboratorLogin)
                if (!foundCollaborator) {
                    return reject(NOTE_EXCEPTIONS.CollaboratorNotFound)
                }

                foundNote.collaborators = foundNote.collaborators.filter(c => c.login !== collaboratorLogin)
                await this.noteRepository.save(foundNote)

                return resolve({ success: true })
            } catch (error) {
                console.log(error)
                return reject(NOTE_EXCEPTIONS.ServiceUnavailable)    
            }
        })
    }

    

}