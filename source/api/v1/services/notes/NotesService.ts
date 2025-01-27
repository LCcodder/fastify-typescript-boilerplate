import {
    NoteWithoutMetadata,
    Note,
    NotePreview,
    NoteUpdate,
    NoteCollaborators
} from "../../shared/dto/NoteDto";
import {User as UserEntity} from "../../database/entities/User";
import {Note as NoteEntity} from "../../database/entities/Note";
import {IUsersService} from "../users/UsersServiceInterface";
import {INotesService, NotesSearchOptions} from "./NotesServiceInterface";
import {Repository} from "typeorm";
import {transformNoteCollaborators} from "../../shared/utils/common/TransformNoteCollaborators";
import {excludeProperties} from "typing-assets";
import {withExceptionCatch} from "../../shared/decorators/WithExceptionCatch";
import {isException} from "../../shared/utils/guards/ExceptionGuard";
import {
    NOTE_ACCESS_RESTRICTED,
    COLLABORATOR_ALREADY_IN_NOTE,
    COLLABORATOR_NOT_FOUND,
    NOTE_NOT_FOUND
} from "../../shared/exceptions/NoteExceptions";
import {SERVICE_UNAVAILABLE} from "../../shared/exceptions/CommonException";
import {User} from "../../shared/dto/UserDto";

export class NotesService implements INotesService {
    private static generateNoteId(): string {
        const symbolsHEX = "0123456789abcdef";
        let id = "";
        for (let i: number = 0; i < 16; i++) {
            id += symbolsHEX.charAt(Math.floor(Math.random() * 16));
        }
        return id;
    }

    private static isInCollaborators(login: string, note: NoteEntity): boolean {
        return Boolean(note.collaborators.find((c) => c.login === login));
    }

    private static isNoteAuthor(login: string, note: NoteEntity): boolean {
        return login === note.author;
    }

    private static canAccessNote(login: string, note: NoteEntity): boolean {
        return (
            NotesService.isNoteAuthor(login, note) ||
            NotesService.isInCollaborators(login, note)
        );
    }

    constructor(
        private noteRepository: Repository<NoteEntity>,
        private usersService: IUsersService
    ) {}

    @withExceptionCatch
    private async createCollaboratorsRelationArray(
        collaboratorsLogins: string[]
    ): Promise<
        | UserEntity[]
        | typeof COLLABORATOR_NOT_FOUND
        | typeof SERVICE_UNAVAILABLE
    > {
        const collaboratorsRelationArray = [];

        for (const login of collaboratorsLogins) {
            // checking collaborator existance and his collaboration ability
            const collaborator = await this.usersService.getUser(
                "login",
                login
            );
            if (isException(collaborator)) {
                if (collaborator.statusCode === 404) {
                    return COLLABORATOR_NOT_FOUND;
                }
                return collaborator;
            }
            if (!collaborator.isCollaborating) {
                return COLLABORATOR_NOT_FOUND;
            }

            collaboratorsRelationArray.push(collaborator as User);
        }

        return collaboratorsRelationArray;
    }

    @withExceptionCatch
    public async createNote(note: NoteWithoutMetadata) {
        const collaboratorsRelationArray =
            await this.createCollaboratorsRelationArray(note.collaborators);
        if (isException(collaboratorsRelationArray)) {
            return collaboratorsRelationArray;
        }

        const id = NotesService.generateNoteId();
        const createdNote = await this.noteRepository.save({
            ...note,
            id,
            collaborators: collaboratorsRelationArray
        });

        return transformNoteCollaborators(createdNote);
    }

    @withExceptionCatch
    public async getNote(id: string, login: string) {
        const foundNote = await this.noteRepository.findOne({
            where: {
                id
            },
            relations: {
                collaborators: true
            }
        });

        if (!foundNote || !NotesService.canAccessNote(login, foundNote)) {
            return NOTE_NOT_FOUND;
        }

        return transformNoteCollaborators(foundNote) as unknown as Note;
    }

    @withExceptionCatch
    public async deleteNote(id: string, login: string) {
        const foundNote = await this.noteRepository.findOne({
            where: {id},
            relations: {collaborators: true}
        });
        if (!foundNote) {
            return NOTE_NOT_FOUND;
        }

        if (NotesService.isNoteAuthor(login, foundNote)) {
            await this.noteRepository.delete({author: login, id});
            return {success: true as true};
        }

        // remove login from collaborators
        foundNote.collaborators = foundNote.collaborators.filter(
            (c) => c.login !== login
        );
        await this.noteRepository.save(foundNote);

        return {success: true as true};
    }

    @withExceptionCatch
    public async updateNote(id: string, login: string, updateData: NoteUpdate) {
        let foundNote = await this.noteRepository.findOne({
            where: {
                id
            },
            relations: {
                collaborators: true
            }
        });

        if (!foundNote || !NotesService.canAccessNote(login, foundNote)) {
            return NOTE_NOT_FOUND;
        }

        foundNote = Object.assign(foundNote, updateData);
        let updatedNote = await this.noteRepository.save(foundNote);

        return transformNoteCollaborators(updatedNote) as unknown as Note;
    }

    @withExceptionCatch
    public async getMyNotes(authorLogin: string, options: NotesSearchOptions) {
        const query = this.noteRepository
            .createQueryBuilder("note")
            .select([
                "note.id",
                "note.author",
                "note.title",
                "note.tags",
                "note.updatedAt"
            ])
            .where("note.author = :login", {login: authorLogin})
            .limit(options?.limit)
            .skip(options?.skip)
            .orderBy("note.updatedAt", options?.sort);

        const tags = options?.tags;
        if (tags && tags.length) {
            query.where("note.tags && :tags", {tags});
        }

        const foundNotes = await query.getMany();
        return foundNotes as unknown as NotePreview[];
    }

    @withExceptionCatch
    public async getCollaboratedNotes(
        login: string,
        options: NotesSearchOptions
    ) {
        const query = this.noteRepository
            .createQueryBuilder("note")
            .innerJoinAndSelect(
                "note.collaborators",
                "user",
                '"userLogin" = :login',
                {login}
            )
            .select([
                "note.id",
                "note.author",
                "note.title",
                "note.tags",
                "note.updatedAt"
            ])
            .limit(options?.limit)
            .skip(options?.skip)
            .orderBy("note.updatedAt", options?.sort);

        const tags = options?.tags;
        if (tags && tags.length) {
            query.where("note.tags && :tags", {tags});
        }

        const foundNotes = await query.getMany();
        return foundNotes as unknown as NotePreview[];
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
        });

        if (!foundNote || !NotesService.canAccessNote(login, foundNote)) {
            return NOTE_NOT_FOUND;
        }

        const collaborators = foundNote.collaborators.map((c) =>
            excludeProperties(c, "password")
        ) as NoteCollaborators
        
        return collaborators;
    }

    @withExceptionCatch
    public async addCollaborator(
        id: string,
        authorLogin: string,
        collaboratorLogin: string
    ) {
        const foundNote = await this.noteRepository.findOne({
            where: {id},
            relations: {collaborators: true}
        });

        if (!foundNote) {
            return NOTE_NOT_FOUND;
        }
        if (!NotesService.isNoteAuthor(authorLogin, foundNote)) {
            return NOTE_ACCESS_RESTRICTED;
        }

        // obviously, author can't add himself to note
        if (authorLogin === collaboratorLogin) {
            return COLLABORATOR_NOT_FOUND;
        }

        const foundCollaborator = await this.usersService.getUser(
            "login",
            collaboratorLogin
        );
        if (isException(foundCollaborator)) {
            if (foundCollaborator.statusCode === 404) {
                return COLLABORATOR_NOT_FOUND;
            }
            return SERVICE_UNAVAILABLE;
        }

        if (!foundCollaborator.isCollaborating) {
            return COLLABORATOR_NOT_FOUND;
        }

        if (NotesService.isInCollaborators(collaboratorLogin, foundNote)) {
            return COLLABORATOR_ALREADY_IN_NOTE;
        }

        foundNote.collaborators.push(foundCollaborator);
        await this.noteRepository.save(foundNote);

        return {success: true as true};
    }

    @withExceptionCatch
    public async removeCollaborator(
        id: string,
        authorLogin: string,
        collaboratorLogin: string
    ) {
        const foundNote = await this.noteRepository.findOne({
            where: {id},
            relations: {collaborators: true}
        });

        if (!foundNote) {
            return NOTE_NOT_FOUND;
        }
        if (!NotesService.isNoteAuthor(authorLogin, foundNote)) {
            return NOTE_ACCESS_RESTRICTED;
        }

        // again, author can't remove himself from note
        if (authorLogin === collaboratorLogin) {
            return COLLABORATOR_NOT_FOUND;
        }

        if (!NotesService.isInCollaborators(collaboratorLogin, foundNote)) {
            return COLLABORATOR_NOT_FOUND;
        }

        // excluding collaborator from note
        foundNote.collaborators = foundNote.collaborators.filter(
            (c) => c.login !== collaboratorLogin
        );
        await this.noteRepository.save(foundNote);

        return {success: true as true};
    }
}
