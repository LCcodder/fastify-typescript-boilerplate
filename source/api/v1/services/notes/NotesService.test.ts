import {describe, expect, test} from "@jest/globals";
import {NotesService} from "./NotesService";
import {NoteWithoutMetadata} from "../../database/entities/Note";
import { deepStrictEqual } from "assert";

const mockGetUser = jest.fn();
const mockFindOneBy = jest.fn();
const mockFindOne = jest.fn();
const mockSave = jest.fn();
const mockUpdate = jest.fn();
const mockDelete = jest.fn()

const noteRepository = {
    findOneBy: mockFindOneBy,
    findOne: mockFindOne,
    save: mockSave,
    update: mockUpdate,
    delete: mockDelete
};

const usersService = {
    getUser: mockGetUser
};

// @ts-ignore
const notesService = new NotesService(noteRepository, usersService);

describe("Notes service tests", () => {
    
    describe("Create note tests", () => {
        const note = {
            id: "12312312",
            collaborators: [{login: "login1", password: "123123123"}],
            // @ts-ignore
            tags: [],
            content: "",
            title: "",
            author: "login",
            createdAt: new Date(),
            updatedAt: new Date(),
        }
        const noteToCreate: NoteWithoutMetadata = {
            collaborators: ["login1"],
            tags: [],
            content: "",
            title: "",
            author: "login"
        };

        test("Should return 'collaborator not found' error (wrong login)", async () => {
            usersService.getUser.mockResolvedValueOnce({
                message: "",
                statusCode: 404
            });

            const result = (await notesService.createNote(noteToCreate)) as any;

            expect(result).toBeDefined();
            expect(result.message).toBeDefined();
            expect(result.statusCode).toEqual(404);
        });

        test("Should return 'collaborator not found' error (user is not collaborating)", async () => {
            usersService.getUser.mockResolvedValueOnce({
                login: "login",
                password: "12345678",
                email: "email@email.com",
                username: "username",
                personalColor: "#ffffff",
                isCollaborating: false
            });

            const result = (await notesService.createNote(noteToCreate)) as any;

            expect(result).toBeDefined();
            expect(result.message).toBeDefined();
            expect(result.statusCode).toEqual(404);
        });

        test("Should return note data", async () => {
            noteRepository.save.mockResolvedValueOnce(note)
            usersService.getUser.mockResolvedValueOnce({
                login: "login1",
                password: "12345678",
                email: "email@email.com",
                username: "username",
                personalColor: "#ffffff",
                isCollaborating: true
            });

            const result = (await notesService.createNote(noteToCreate)) as any;

            expect(result).toBeDefined();
            expect(result.id).toBeDefined();
            expect(result.collaborators[0]).toEqual("login1")
        })
    });

    describe("Get note tests", () => {
        const note = {
            id: "12312312",
            collaborators: [{login: "login1", password: "123123123"}],
            // @ts-ignore
            tags: [],
            content: "",
            title: "",
            author: "login",
            createdAt: new Date(),
            updatedAt: new Date(),
        }
        test("Should return 'note not found' error (wrong id)", async () => {
            noteRepository.findOne.mockResolvedValueOnce(null);
            const result = (await notesService.getNote("", "")) as any;

            expect(result).toBeDefined();
            expect(result.message).toBeDefined();
            expect(result.statusCode).toEqual(404);
        });

        test("Should return 'note not found' error (access denied)", async () => {
            noteRepository.findOne.mockResolvedValueOnce(note);

            const result = (await notesService.getNote("", "login3")) as any;

            expect(result).toBeDefined();
            expect(result.message).toBeDefined();
            expect(result.statusCode).toEqual(404);
        });

        test("Should return note data (login is in collaborators)", async () => {
            noteRepository.findOne.mockResolvedValueOnce(note);

            const result = (await notesService.getNote("", "login1")) as any;

            expect(result).toBeDefined();
            expect(result.id).toBeDefined();
        });

        test("Should return note data (login is author login)", async () => {
            noteRepository.findOne.mockResolvedValueOnce(note);

            const result = (await notesService.getNote("", "login")) as any;

            expect(result).toBeDefined();
            expect(result.id).toBeDefined();
        });
    });

    describe("Delete note tests", () => {
        const note = {
            id: "12312312",
            collaborators: [{login: "login1", password: "123123123"}],
            // @ts-ignore
            tags: [],
            content: "",
            title: "",
            author: "login",
            createdAt: new Date(),
            updatedAt: new Date(),
        }
        test("Should return 'note not found' error (wrong id)", async () => {
            noteRepository.findOne.mockResolvedValue(null)
            
            const result = await notesService.deleteNote("", "") as any

            expect(result).toBeDefined();
            expect(result.message).toBeDefined();
            expect(result.statusCode).toEqual(404);
        })

        test("Should return success and call 'delete' (delete as note author)", async () => {
            noteRepository.findOne.mockResolvedValue(note)

            const result = await notesService.deleteNote("", "login") as any
            
            expect(
                result.success
            ).toEqual(true)
            expect(
                noteRepository.delete
            ).toBeCalled()
        })

        test("Should return success and call 'save' (leave from note as collaborator)", async () => {
            noteRepository.findOne.mockResolvedValue(note)

            const result = await notesService.deleteNote("", "login1") as any
            
            expect(
                result.success
            ).toEqual(true)
            expect(
                noteRepository.save
            ).toBeCalled()
        })
    })

    describe("Update note tests", () => {
        const note = {
            id: "12312312",
            collaborators: [{login: "login1", password: "123123123"}],
            // @ts-ignore
            tags: [],
            content: "",
            title: "",
            author: "login",
            createdAt: new Date(),
            updatedAt: new Date(),
        }
        test("Should return 'note not found error' (note not found)", async () => {
            noteRepository.findOne.mockResolvedValueOnce(null)

            const result = await notesService.updateNote("", "", {}) as any

            expect(result).toBeDefined();
            expect(result.message).toBeDefined();
            expect(result.statusCode).toEqual(404);
        })

        test("Should return 'note not found error' (not in collaborators or author)", async () => {
            noteRepository.findOne.mockResolvedValueOnce(note)

            const result = await notesService.updateNote("", "login3", {}) as any

            expect(result).toBeDefined();
            expect(result.message).toBeDefined();
            expect(result.statusCode).toEqual(404);
        })

        test("Should call 'save' (update as author)", async () => {
            noteRepository.findOne.mockResolvedValueOnce(note)

            const _ = await notesService.updateNote("", "login", {}) as any

            expect(noteRepository.save).toBeCalled()
        })

        test("Should call 'save' (update as collaborator)", async () => {
            noteRepository.findOne.mockResolvedValueOnce(note)

            const _ = await notesService.updateNote("", "login1", {}) as any

            expect(noteRepository.save).toBeCalled()
        })
    })

    describe("Get collaborators tests", () => {
        const note = {
            id: "12312312",
            collaborators: [{login: "login1", password: "123123123"}],
            // @ts-ignore
            tags: [],
            content: "",
            title: "",
            author: "login",
            createdAt: new Date(),
            updatedAt: new Date(),
        }
        test("Should return 'note not found error' (note not found)", async () => {
            noteRepository.findOne.mockResolvedValueOnce(null)

            const result = await notesService.getCollaborators("", "") as any

            expect(result).toBeDefined();
            expect(result.message).toBeDefined();
            expect(result.statusCode).toEqual(404);
        })

        test("Should return 'note not found error' (not in collaborators or author)", async () => {
            noteRepository.findOne.mockResolvedValueOnce(note)

            const result = await notesService.getCollaborators("", "login3") as any

            expect(result).toBeDefined();
            expect(result.message).toBeDefined();
            expect(result.statusCode).toEqual(404);
        })

        test("Should return valid note collaborators (get as author)", async () => {
            noteRepository.findOne.mockResolvedValueOnce(note)

            const result = await notesService.getCollaborators("", "login") as any

            console.log(result)
            expect(result).toBeDefined()
            expect(result[0].login).toBeDefined()
            expect(result[0].password).toBeUndefined()
        })

        test("Should return valid note collaborators (get as collaborator)", async () => {
            noteRepository.findOne.mockResolvedValueOnce(note)
            console.log(note)
            const result = await notesService.getCollaborators("", "login1") as any

            console.log(result)
            expect(result).toBeDefined()
            expect(result[0].login).toBeDefined()
            expect(result[0].password).toBeUndefined()
        })
    })
});
