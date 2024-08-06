import { NoteWithoutMetadata, Note, NotePreview, NoteUpdate, NoteEntity, NoteCollaborators } from "../../database/entities/Note";
import { User, UserWithoutSensetives } from "../../database/entities/User";
import { IUsersService } from "../users/UsersServiceInterface";
import { INotesService } from "./NotesServiceInterface";
import { NOTE_EXCEPTIONS } from "../../exceptions/NoteExceptions";
import { ArrayContains, Repository, SelectQueryBuilder } from "typeorm";
import { Exception } from "../../utils/Exception";
import { transformNoteCollaborators } from "../../utils/TransformNoteCollaborators";
import { excludeProperties } from "typing-assets"
import { withExceptionCatch } from "../../decorators/WithExceptionCatch";
import { isException } from "../../utils/guards/ExceptionGuard";
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

    @withExceptionCatch
    public async createNote(note: NoteWithoutMetadata) {
        
                const collaboratorsRelationArray = []
                // checking collaborators existance
                for (const collaborator of note.collaborators) {

                    const foundCollaborator = await this.usersService.getUser("login", collaborator)
                    if (isException(foundCollaborator)) {
                        if (foundCollaborator.statusCode === 404) {
                            return NOTE_EXCEPTIONS.CollaboratorNotFound
                        }
                        return foundCollaborator
                    }
                    if (!foundCollaborator.isCollaborating) {
                        return NOTE_EXCEPTIONS.CollaboratorNotFound
                    }
                    collaboratorsRelationArray.push(foundCollaborator as User)
                }

                const id = NotesService.generateNoteId()
                const createdNote = await this.noteRepository.save({
                    ...note,
                    id,
                    collaborators: collaboratorsRelationArray
                })

                return transformNoteCollaborators(createdNote)
                
          
    }

    @withExceptionCatch
    public async getNote(id: string, login: string) {
        
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
                    return transformNoteCollaborators(foundNote) as unknown as Note
                    
                }
                
                
                return NOTE_EXCEPTIONS.NoteNotFound
          
    }

    @withExceptionCatch
    public async deleteNote(id: string, login: string) {
        
                const foundNote = await this.noteRepository.findOne({ where: { id }, relations: {collaborators: true}})
                
                if (!foundNote) {
                    return NOTE_EXCEPTIONS.NoteNotFound
                }

                if (foundNote.author !== login) {
                    foundNote.collaborators = foundNote.collaborators.filter(c => c.login !== login)
                    await this.noteRepository.save(foundNote)

                    return { success: true as true }
                }

                await this.noteRepository.delete({ author: login, id })
                
                return { success: true as true}
          
    }

    @withExceptionCatch
    public async updateNote(
        id: string, 
        login: string, 
        updateData: NoteUpdate
    ) {
        
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

                    return transformNoteCollaborators(updatedNote) as unknown as Note
                    
                }
                
                return NOTE_EXCEPTIONS.NoteNotFound
        
    }

    @withExceptionCatch
    public async getMyNotes(authorLogin: string, tags: string[], limit: number, skip: number, sort: "ASC" | "DESC") {
        

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
                return foundNotes as unknown as NotePreview[]
            
    }

    @withExceptionCatch
    public async getCollaboratedNotes(login: string, tags: string[], limit: number, skip: number, sort: "ASC" | "DESC") {
        

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
                return foundNotes as unknown as NotePreview[]
          
    }
    
    @withExceptionCatch
    public async getCollaborators(id: string, login: string) {
        
                const foundNote = await this.noteRepository.findOne({
                    where: {
                        id
                    },
                    relations: {
                        collaborators: true
                    }
                })
                
                if (foundNote?.author === login || foundNote?.collaborators.find(c => c.login === login)) {
                    const collaborators = foundNote.collaborators.map(c => excludeProperties(c, "password"))

                    return collaborators
                    
                }

                return NOTE_EXCEPTIONS.NoteNotFound
          
    }

    @withExceptionCatch
    public async addCollaborator(id: string, authorLogin: string, collaboratorLogin: string) {
        
                const foundNote = await this.noteRepository.findOne({ where: { id }, relations: {collaborators: true}})
                
                if (!foundNote) {
                    return NOTE_EXCEPTIONS.NoteNotFound
                }
                if (foundNote.author !== authorLogin) {
                    
                    return NOTE_EXCEPTIONS.AcessRestricted
                    
                }
                if (authorLogin === collaboratorLogin) {
                    
                    return NOTE_EXCEPTIONS.CollaboratorNotFound
                    
                }
                
                
                const foundCollaborator = await this.usersService.getUser("login", collaboratorLogin)
                if (isException(foundCollaborator)) {
                    if (foundCollaborator.statusCode === 404) {
                        return NOTE_EXCEPTIONS.CollaboratorNotFound
                    }
                    return NOTE_EXCEPTIONS.ServiceUnavailable
                }

                if (!foundCollaborator.isCollaborating) {
                    return NOTE_EXCEPTIONS.CollaboratorNotFound
                }

                if (foundNote.collaborators.find(c => c.login === collaboratorLogin)) {
                    return NOTE_EXCEPTIONS.CollaboratorAlreadyInNote
                }

                foundNote.collaborators.push(foundCollaborator)
                await this.noteRepository.save(foundNote)

                return { success: true as true }
          
    }

    @withExceptionCatch
    public async removeCollaborator(id: string, authorLogin: string, collaboratorLogin: string) {
        
                const foundNote = await this.noteRepository.findOne({ where: { id }, relations: {collaborators: true}})
                
                if (!foundNote) {
                    return NOTE_EXCEPTIONS.NoteNotFound
                }
                if (foundNote.author !== authorLogin) {
                    return NOTE_EXCEPTIONS.AcessRestricted
                    
                }

                if (authorLogin === collaboratorLogin) {
                    return NOTE_EXCEPTIONS.CollaboratorNotFound
                    
                }

                const foundCollaborator = foundNote.collaborators.find(c => c.login === collaboratorLogin)
                if (!foundCollaborator) {
                    return NOTE_EXCEPTIONS.CollaboratorNotFound
                }

                foundNote.collaborators = foundNote.collaborators.filter(c => c.login !== collaboratorLogin)
                await this.noteRepository.save(foundNote)

                return { success: true as true }
            
    }

    

}