import {describe, expect, test} from "@jest/globals";
import { transformNoteCollaborators } from "./TransformNoteCollaborators";
import { NoteEntity } from "../../../database/entities/Note";

describe("Note collaborators transformer tests", () => {
    test("Collaborators field transforms", () => {
        let note = {
            id: "1234",
            collaborators: [
                {
                    login: "login1"
                },
                {
                    login: "login2"
                }
            ]
        } as any

        note = transformNoteCollaborators(note as NoteEntity.Note)

        expect(
            note.collaborators[0]
        ).toEqual("login1")

        expect(
            note.collaborators[1]
        ).toEqual("login2")
    })    
});
